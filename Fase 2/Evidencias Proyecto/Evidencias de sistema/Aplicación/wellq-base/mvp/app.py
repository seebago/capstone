from contextlib import asynccontextmanager
from dataclasses import asdict, replace
from datetime import datetime, timezone
from hashlib import sha256
from pathlib import Path
from threading import Lock
from time import monotonic
from uuid import uuid4
import json
import jwt
from fastapi import FastAPI, Depends, Header, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import FileResponse, JSONResponse, Response
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from pymongo import ReturnDocument
from pymongo.errors import DuplicateKeyError, PyMongoError
from prototype.domain import Context, Extraction, Marker, RuleError, transition, score_eligibility
from .database import connect, initialize, now_string
from .models import ActionInput, CreateExam, Login
from .security import PERMISSIONS, check_password, subject_from_token, token_for
from .settings import Settings
from .documents import MAX_FILE_BYTES, validate_document
from urllib.parse import quote

POLICY = {'version': 'demo-review-v1', 'confidence_threshold': 0.9}
UNITS = {'demo_marker_a': 'demo_unit', 'demo_marker_b': 'demo_unit'}
bearer = HTTPBearer(auto_error=False)


def fail(code, status=400):
    raise HTTPException(status_code=status, detail=code)


def fingerprint(value):
    return sha256(json.dumps(value, sort_keys=True, separators=(',', ':')).encode()).hexdigest()


def require_key(key):
    if not key or not 8 <= len(key) <= 100 or not key.isascii():
        fail('IDEMPOTENCY_KEY_REQUIRED', 422)
    return key


def to_domain(ex, proposal=None):
    return Extraction(ex['client_id'], ex['patient_id'], ex['clinical_test_id'], ex['extraction_id'],
        tuple(Marker(**m) for m in ex['proposal']) if proposal is None else proposal,
        status=ex['status'], revision=ex['revision'], confirmed=tuple(Marker(**m) for m in ex['confirmed']),
        identity_match=ex['identity_match'], confirmed_by=ex['confirmed_by'], confirmed_at=ex['confirmed_at'],
        validated_by=ex['validated_by'], validated_at=ex['validated_at'])


def create_app(settings=None):
    settings = settings or Settings.load()
    @asynccontextmanager
    async def lifespan(app):
        app.state.mongo = connect(settings)
        app.state.db = app.state.mongo[settings.database]
        initialize(app.state.db, settings.demo_password)
        yield
        app.state.mongo.close()

    app = FastAPI(title='WellQ Synthetic MVP', version='0.2.0', lifespan=lifespan, docs_url=None, redoc_url=None)
    attempts, attempt_lock = {}, Lock()

    @app.middleware('http')
    async def headers(request, call_next):
        if request.headers.get('host', '').split(':')[0].lower() not in settings.allowed_hosts:
            return JSONResponse({'detail': 'LOCAL_DEMO_ONLY'}, status_code=403)
        response = await call_next(request)
        response.headers['Cache-Control'] = 'no-store'
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['Content-Security-Policy'] = "default-src 'self'; style-src 'self'; script-src 'self'; img-src 'self'; frame-ancestors 'none'; base-uri 'none'"
        return response

    @app.exception_handler(RequestValidationError)
    async def invalid_input(request, error):
        return JSONResponse({'detail': 'INVALID_INPUT'}, status_code=422)

    @app.exception_handler(PyMongoError)
    async def db_error(request, error):
        return JSONResponse({'detail': 'DATABASE_UNAVAILABLE'}, status_code=503)

    def current_user(request: Request, credentials: HTTPAuthorizationCredentials | None = Depends(bearer)):
        if not credentials:
            fail('LOGIN_REQUIRED', 401)
        try:
            subject = subject_from_token(credentials.credentials, settings.jwt_secret)
        except jwt.InvalidTokenError:
            fail('INVALID_SESSION', 401)
        user = request.app.state.db.users.find_one({'_id': subject, 'state': 'active'})
        if not user or len(user.get('roles', [])) != 1 or user['roles'][0] not in PERMISSIONS:
            fail('INVALID_SESSION', 401)
        return user

    def context_for(db, user, request):
        tenant = db.tenants.find_one({'_id': user['client_id'], 'client_id': user['client_id']})
        if not tenant:
            fail('PERMISSION_DENIED', 403)
        role = user['roles'][0]
        if user['subject']['kind'] != role:
            fail('PERMISSION_DENIED', 403)
        ids = {user['subject']['id']} if role == 'patient' else {r['patient_id'] for r in db.care_team_links.find({
            'client_id': user['client_id'], 'clinician_id': user['subject']['id'], 'state': 'active'})}
        return Context(user['_id'], user['client_id'], role, frozenset(ids),
                       PERMISSIONS[role], frozenset(tenant['features']), request.client.host)

    def access(request, user, permission, feature='clinical_tests'):
        ctx = context_for(request.app.state.db, user, request)
        if permission not in ctx.permissions:
            fail('PERMISSION_DENIED', 403)
        if feature not in ctx.features:
            fail('FEATURE_NOT_INCLUDED', 403)
        return ctx

    def scoped_exam(db, ctx, identifier):
        ex = db.clinical_tests.find_one({'client_id': ctx.client_id, 'clinical_test_id': identifier,
                                       'patient_id': {'$in': list(ctx.patient_ids)}})
        if not ex:
            fail('NOT_FOUND', 404)
        return ex

    def public(ex):
        return {k: v for k, v in ex.items() if k not in {'_id', 'receipts', 'creation_key', 'creation_hash'}}

    @app.get('/api/health')
    def health(request: Request):
        request.app.state.mongo.admin.command('ping')
        return {'status': 'ok', 'database': 'MongoDB', 'synthetic_only': True, 'version': '0.2.0'}

    @app.post('/api/session')
    def login(body: Login, request: Request):
        ip = request.client.host
        with attempt_lock:
            window = [t for t in attempts.get(ip, []) if monotonic() - t < 60]
            if len(window) >= 15:
                fail('TOO_MANY_ATTEMPTS', 429)
            attempts[ip] = window + [monotonic()]
        user = request.app.state.db.users.find_one({'email_norm': body.email.casefold(), 'state': 'active'})
        if not user or not check_password(body.password, user['password_hash']):
            fail('INVALID_CREDENTIALS', 401)
        return {'access_token': token_for(user, settings.jwt_secret), 'token_type': 'bearer'}

    @app.get('/api/me')
    def me(request: Request, user=Depends(current_user)):
        ctx = context_for(request.app.state.db, user, request)
        return {'email': user['email'], 'role': ctx.role, 'client_id': ctx.client_id,
                'features': sorted(ctx.features), 'review_policy': POLICY, 'synthetic_only': True}

    @app.get('/api/patients')
    def patients(request: Request, user=Depends(current_user)):
        ctx = access(request, user, 'exam:read')
        db = request.app.state.db
        return [{'patient_id': p['patient_id'], 'first_name': p['first_name'], 'last_name': p['last_name'],
                 'cases': list(db.cases.find({'client_id': ctx.client_id, 'patient_id': p['patient_id']}, {'_id': 0}))}
                for p in db.patients.find({'client_id': ctx.client_id, 'patient_id': {'$in': list(ctx.patient_ids)}})]

    def public_document(doc):
        return {k: doc[k] for k in ('document_id', 'patient_id', 'filename', 'content_type',
                'size_bytes', 'status', 'created_at', 'audit')}

    def document_scope(ctx, user):
        scope = {'client_id': ctx.client_id, 'patient_id': {'$in': list(ctx.patient_ids)}}
        if ctx.role == 'clinician':
            scope['clinician_ids'] = user['subject']['id']
        return scope

    @app.post('/api/v1/exam-documents', status_code=201)
    async def upload_document(request: Request, user=Depends(current_user),
                              idempotency_key: str | None = Header(default=None),
                              x_file_name: str | None = Header(default=None)):
        # Raw binary body: no patient, tenant, clinician or destination fields are accepted.
        ctx = access(request, user, 'exam:create')
        key, db = require_key(idempotency_key), request.app.state.db
        if request.query_params or any(h in request.headers for h in ('x-client-id', 'x-patient-id', 'x-clinician-id')):
            fail('INVALID_INPUT', 422)
        patient_id = user['subject']['id']
        links = list(db.care_team_links.find({'client_id': ctx.client_id,
                     'patient_id': patient_id, 'state': 'active'}))
        clinicians = {link['clinician_id'] for link in links if db.clinicians.find_one({
            'client_id': ctx.client_id, 'clinician_id': link['clinician_id'], 'state': 'active'})}
        if not clinicians:
            fail('NO_TREATING_CLINICIAN', 409)
        data = bytearray()
        async for chunk in request.stream():
            if len(data) + len(chunk) > MAX_FILE_BYTES:
                fail('FILE_TOO_LARGE', 413)
            data.extend(chunk)
        content = bytes(data)
        try:
            filename, media_type = validate_document(x_file_name, request.headers.get('content-type', ''), content)
        except ValueError as error:
            fail(str(error), 422)
        digest = fingerprint({'filename': filename, 'sha256': sha256(content).hexdigest()})
        lookup = {'client_id': ctx.client_id, 'created_by': ctx.actor_id, 'creation_key': key}
        def replay(existing):
            if existing['creation_hash'] != digest:
                fail('IDEMPOTENCY_CONFLICT', 409)
            return public_document(existing)
        existing = db.exam_documents.find_one(lookup)
        if existing:
            return replay(existing)
        identifier, timestamp = uuid4().hex, now_string()
        event = {'actor_id': ctx.actor_id, 'action': 'upload_document', 'occurred_at': timestamp,
                 'origin': ctx.origin, 'result': 'success', 'target_id': identifier}
        document = {'_id': identifier, 'document_id': identifier, 'client_id': ctx.client_id,
                    'patient_id': patient_id, 'clinician_ids': sorted(clinicians), 'filename': filename,
                    'content_type': media_type, 'size_bytes': len(content), 'content': content,
                    'status': 'received', 'created_at': timestamp, 'created_by': ctx.actor_id,
                    'creation_key': key, 'creation_hash': digest, 'audit': [event]}
        try:
            db.exam_documents.insert_one(document)
        except DuplicateKeyError:
            return replay(db.exam_documents.find_one(lookup))
        return public_document(document)

    @app.get('/api/v1/exam-documents')
    def documents(request: Request, user=Depends(current_user)):
        ctx = access(request, user, 'exam:read')
        return [public_document(doc) for doc in request.app.state.db.exam_documents.find(
            document_scope(ctx, user), {'content': 0}).sort('created_at', -1)]

    @app.get('/api/v1/exam-documents/{identifier}/file')
    def document_file(identifier: str, request: Request, user=Depends(current_user)):
        ctx = access(request, user, 'exam:read')
        doc = request.app.state.db.exam_documents.find_one({**document_scope(ctx, user), 'document_id': identifier})
        if not doc:
            fail('NOT_FOUND', 404)
        return Response(doc['content'], media_type=doc['content_type'], headers={
            'Content-Disposition': "attachment; filename*=UTF-8''" + quote(doc['filename'], safe=''),
            'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff'})

    @app.post('/api/v1/demo/clinical-tests', status_code=201)
    def create(body: CreateExam, request: Request, user=Depends(current_user), idempotency_key: str | None = Header(default=None)):
        """Legacy structured synthetic fixture; disabled in the evaluation app."""
        if not settings.structured_demo_enabled:
            fail("STRUCTURED_DEMO_DISABLED", 403)
        ctx = access(request, user, 'exam:create')
        key, db = require_key(idempotency_key), request.app.state.db
        if body.patient_id not in ctx.patient_ids or not db.cases.find_one({
            'client_id': ctx.client_id, 'case_id': body.case_id, 'patient_id': body.patient_id}):
            fail('NOT_FOUND', 404)
        digest = fingerprint(body.model_dump())
        lookup = {'client_id': ctx.client_id, 'created_by': ctx.actor_id, 'creation_key': key}
        def replay(existing):
            if not existing or existing['creation_hash'] != digest:
                fail('IDEMPOTENCY_CONFLICT', 409)
            return public(existing)
        existing = db.clinical_tests.find_one(lookup)
        if existing:
            return replay(existing)
        now, identifier = now_string(), 'ct_' + uuid4().hex
        ex = {**lookup, 'clinical_test_id': identifier, 'extraction_id': 'cte_' + uuid4().hex,
              'patient_id': body.patient_id, 'case_id': body.case_id, 'title': body.title,
              'document_type': body.document_type, 'schema_version': 'demo-0.2', 'synthetic_only': True,
              'identity_match': body.identity_match, 'proposal': [asdict(Marker(**m.model_dump())) for m in body.markers],
              'confirmed': [], 'status': 'awaiting_confirmation', 'revision': 1, 'confirmed_by': None,
              'confirmed_at': None, 'validated_by': None, 'validated_at': None, 'reviews': [],
              'created_at': now, 'updated_at': now, 'creation_hash': digest,
              'receipts': [], 'edits': [], 'review_policy': POLICY, 'score_status': 'not_confirmed',
              'audit': [{'actor_id': ctx.actor_id, 'client_id': ctx.client_id, 'action': 'create_synthetic',
                         'occurred_at': now, 'origin': ctx.origin, 'result': 'success', 'revision': 1}]}
        try:
            db.clinical_tests.insert_one(ex)
        except DuplicateKeyError:
            return replay(db.clinical_tests.find_one(lookup))
        return public(ex)

    @app.get('/api/v1/clinical-tests')
    def exams(request: Request, user=Depends(current_user)):
        ctx = access(request, user, 'exam:read')
        query = {'client_id': ctx.client_id, 'patient_id': {'$in': list(ctx.patient_ids)}}
        if ctx.role == 'clinician':
            query['status'] = {'$in': ['confirmed', 'clinically_validated', 'rejected']}
        return [public(ex) for ex in request.app.state.db.clinical_tests.find(query).sort('created_at', -1).limit(100)]

    @app.get('/api/v1/clinical-tests/{identifier}/extraction')
    def detail(identifier: str, request: Request, user=Depends(current_user)):
        ctx = access(request, user, 'exam:read')
        ex = scoped_exam(request.app.state.db, ctx, identifier)
        if ctx.role == 'clinician' and ex['status'] in {'awaiting_confirmation', 'discarded'}:
            fail('NOT_FOUND', 404)
        return public(ex)

    @app.patch('/api/v1/clinical-tests/{identifier}/extraction')
    def action(identifier: str, body: ActionInput, request: Request, user=Depends(current_user), idempotency_key: str | None = Header(default=None)):
        if user['roles'][0] == 'patient' and not settings.structured_demo_enabled:
            fail('STRUCTURED_DEMO_DISABLED', 403)
        ctx = access(request, user, 'exam:confirm' if body.action in {'confirm', 'discard'} else 'exam:validate')
        key, db = require_key(idempotency_key), request.app.state.db
        ex = scoped_exam(db, ctx, identifier)
        digest, receipt_key = fingerprint(body.model_dump()), f'{ctx.actor_id}:{key}'
        def replay(document):
            for receipt in document['receipts']:
                if receipt['key'] == receipt_key:
                    if receipt['hash'] != digest:
                        fail('IDEMPOTENCY_CONFLICT', 409)
                    return {**receipt['result'], 'replayed': True}
        previous = replay(ex)
        if previous:
            return previous
        if len(ex['receipts']) >= 30:
            fail('DEMO_OPERATION_LIMIT', 409)
        markers, edits = tuple(Marker(**m) for m in ex['proposal']), []
        for correction in body.corrections:
            if correction.marker_code not in {m.marker_code for m in markers}:
                fail('UNKNOWN_MARKER', 422)
            original = next(m.value_canonical for m in markers if m.marker_code == correction.marker_code)
            markers = tuple(replace(m, value_canonical=correction.value_canonical) if m.marker_code == correction.marker_code else m for m in markers)
            edits.append({**correction.model_dump(), 'original_value': original, 'actor_id': ctx.actor_id, 'at': now_string()})
        override = body.identity_confirmed and ex['identity_match'] != 'match'
        if (body.resolved_markers or override) and len(body.review_reason.strip()) < 3:
            fail('REVIEW_REASON_REQUIRED', 422)
        try:
            outcome = transition(to_domain(ex, markers), ctx, body.action, body.extraction_id, body.expected_revision,
                                 datetime.now(timezone.utc), resolved_markers=frozenset(body.resolved_markers),
                                 identity_confirmed=body.identity_confirmed, confidence_threshold=POLICY['confidence_threshold'])
        except RuleError as error:
            code = str(error)
            db.security_events.insert_one({'client_id': ctx.client_id, 'actor_id': ctx.actor_id, 'action': body.action,
                'occurred_at': now_string(), 'origin': ctx.origin, 'result': 'denied', 'code': code, 'clinical_test_id': identifier})
            fail(code, 409 if code in {'REVISION_CONFLICT', 'EXTRACTION_SUPERSEDED', 'INVALID_TRANSITION'} else 422)
        updated = outcome.extraction
        result = {'clinical_test_id': identifier, 'status': updated.status, 'revision': updated.revision}
        event = {**asdict(outcome.event), 'review_policy': POLICY['version'], 'identity_override': override,
                 'resolved_markers': sorted(body.resolved_markers), 'corrected_markers': [c.marker_code for c in body.corrections]}
        review = {'actor_id': ctx.actor_id, 'at': event['occurred_at'], 'reason': body.review_reason,
                  'identity_override': override, 'resolved_markers': sorted(body.resolved_markers)}
        update = {'status': updated.status, 'revision': updated.revision,
                  'confirmed': [asdict(m) for m in updated.confirmed], 'confirmed_by': updated.confirmed_by,
                  'confirmed_at': updated.confirmed_at, 'validated_by': updated.validated_by,
                  'validated_at': updated.validated_at, 'updated_at': now_string(),
                  'score_status': 'catalog_pending' if updated.status in {'confirmed', 'clinically_validated'} else 'excluded'}
        changed = db.clinical_tests.find_one_and_update(
            {'_id': ex['_id'], 'client_id': ctx.client_id, 'revision': body.expected_revision, 'extraction_id': body.extraction_id},
            {'$set': update, '$push': {'audit': event, 'edits': {'$each': edits}, 'reviews': review,
                                      'receipts': {'key': receipt_key, 'hash': digest, 'result': result}}},
            return_document=ReturnDocument.AFTER)
        if not changed:
            previous = replay(scoped_exam(db, ctx, identifier))
            if previous:
                return previous
            fail('REVISION_CONFLICT', 409)
        return result

    @app.get('/api/v1/clinical-tests/{identifier}/eligibility')
    def eligibility(identifier: str, request: Request, user=Depends(current_user)):
        ctx = access(request, user, 'score:read', 'lab_scoring')
        ex = scoped_exam(request.app.state.db, ctx, identifier)
        try:
            result = score_eligibility(to_domain(ex), ctx, canonical_units=UNITS,
                                       scoring_version='not-implemented', catalog_version='synthetic-v1')
        except RuleError as error:
            fail(str(error), 409)
        return {**asdict(result), 'score': None, 'reason': 'CLINICAL_CATALOG_PENDING'}

    static = Path(__file__).parent / 'static'
    app.mount('/static', StaticFiles(directory=static), name='static')
    @app.get('/', include_in_schema=False)
    def index():
        return FileResponse(static / 'index.html')
    return app
