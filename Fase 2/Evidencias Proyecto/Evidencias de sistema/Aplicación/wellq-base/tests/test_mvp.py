"""Integration tests against a REAL local MongoDB, never production databases."""
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta, timezone
import os
from uuid import uuid4
import jwt
import pytest
from fastapi.testclient import TestClient
from pymongo import MongoClient
from mvp.app import create_app
from mvp.settings import Settings
from mvp.security import ISSUER, AUDIENCE


@pytest.fixture(scope='module')
def setup():
    uri = os.getenv('WELLQ_TEST_MONGO_URI', 'mongodb://127.0.0.1:27018')
    name = 'wellq_test_' + uuid4().hex
    config = Settings(uri, name, 'test-secret-only-' + uuid4().hex, 'OnlySyntheticTesting!42', structured_demo_enabled=True)
    mongo = MongoClient(uri, serverSelectionTimeoutMS=3000)
    mongo.admin.command('ping')  # No mock fallback: unavailable MongoDB fails explicitly.
    app = create_app(config)
    with TestClient(app) as client:
        headers = {}
        for role in ['patient.alpha', 'clinician.alpha', 'patient.beta', 'clinician.beta', 'patient.alpha_unlinked']:
            response = client.post('/api/session', json={'email': role+'@wellq.test', 'password': config.demo_password})
            assert response.status_code == 200, response.text
            headers[role] = {'Authorization': 'Bearer '+response.json()['access_token']}
        yield client, mongo[name], headers, config
    assert name.startswith('wellq_test_')
    mongo.drop_database(name)  # Only the uniquely named synthetic fixture created above.
    mongo.close()


def payload(**changes):
    return {'patient_id': 'patient_alpha', 'case_id': 'case_alpha', 'title': 'Synthetic exam',
            'markers': [{'marker_code': 'demo_marker_a', 'value_canonical': 5.0,
                         'reference_low': 1.0, 'reference_high': 10.0, 'confidence': 0.99}], **changes}


def create(setup, body=None, key=None, role='patient.alpha'):
    client, _, headers, _ = setup
    return client.post('/api/v1/demo/clinical-tests', json=body or payload(),
                       headers={**headers[role], 'Idempotency-Key': key or uuid4().hex})


def action(setup, exam, name='confirm', key=None, role='patient.alpha', **kwargs):
    client, _, headers, _ = setup
    return client.patch('/api/v1/clinical-tests/'+exam['clinical_test_id']+'/extraction',
        json={'action': name, 'extraction_id': exam['extraction_id'], 'expected_revision': exam['revision'], **kwargs},
        headers={**headers[role], 'Idempotency-Key': key or uuid4().hex})


def test_health_and_ui(setup):
    client, *_ = setup
    assert client.get('/api/health').json()['database'] == 'MongoDB'
    page = client.get('/')
    assert page.status_code == 200 and 'enter-patient' in page.text and 'enter-clinician' in page.text
    assert 'type="password"' not in page.text and 'id="email"' not in page.text
    assert client.get('/static/app.js').status_code == 200


def test_auth_required_and_forged_tenant_input(setup):
    client, *_ = setup
    assert client.get('/api/v1/clinical-tests').status_code == 401
    assert create(setup, payload(client_id='demo_beta')).status_code == 422
    assert create(setup, payload(patient_id='patient_beta', case_id='case_beta')).status_code == 404


def test_contract_types_and_case_relationship(setup):
    assert create(setup, payload(case_id='case_beta')).status_code == 404
    body = payload(); body['markers'][0]['value_canonical'] = True
    assert create(setup, body).status_code == 422
    body = payload(); body['markers'] *= 2
    assert create(setup, body).status_code == 422


def test_create_idempotency(setup):
    key = uuid4().hex
    a, b = create(setup, key=key), create(setup, key=key)
    assert a.status_code == b.status_code == 201
    assert a.json()['clinical_test_id'] == b.json()['clinical_test_id']
    assert create(setup, payload(title='Changed payload'), key).status_code == 409


def test_clinician_cannot_create_and_pending_hidden(setup):
    client, _, headers, _ = setup
    assert create(setup, role='clinician.alpha').status_code == 403
    ex = create(setup).json()
    url = '/api/v1/clinical-tests/'+ex['clinical_test_id']+'/extraction'
    assert client.get(url, headers=headers['clinician.alpha']).status_code == 404


def test_cross_tenant_and_unlinked_patient_denied(setup):
    client, _, headers, _ = setup
    ex = create(setup).json()
    for role in ['patient.beta', 'clinician.beta', 'patient.alpha_unlinked']:
        url = '/api/v1/clinical-tests/'+ex['clinical_test_id']+'/extraction'
        assert client.get(url, headers=headers[role]).status_code == 404
    other = create(setup, payload(patient_id='patient_alpha_unlinked', case_id='case_alpha_unlinked'), role='patient.alpha_unlinked').json()
    assert action(setup, other, 'validate', role='clinician.alpha').status_code == 404


def test_human_review_corrections_and_atomic_audit(setup):
    client, db, headers, _ = setup
    body = payload(identity_match='mismatch'); body['markers'][0]['confidence'] = 0.5
    ex = create(setup, body).json()
    assert action(setup, ex).status_code == 422
    result = action(setup, ex, identity_confirmed=True, resolved_markers=['demo_marker_a'],
                    review_reason='Checked synthetic source', corrections=[{'marker_code': 'demo_marker_a', 'value_canonical': 7.0, 'reason': 'Synthetic transcription fix'}])
    assert result.status_code == 200, result.text
    saved = db.clinical_tests.find_one({'clinical_test_id': ex['clinical_test_id']})
    assert saved['proposal'][0]['value_canonical'] == 5
    assert saved['confirmed'][0]['value_canonical'] == 7
    assert saved['revision'] == 2 and len(saved['audit']) == 2 and len(saved['receipts']) == 1
    assert saved['audit'][-1]['identity_override'] is True
    assert saved['audit'][-1]['resolved_markers'] == ['demo_marker_a']
    assert saved['audit'][-1]['review_policy'] == 'demo-review-v1'
    assert saved['edits'][0]['original_value'] == 5
    assert saved['reviews'][0]['reason'] == 'Checked synthetic source'
    assert 'value_canonical' not in str(saved['audit'])


def test_repeat_confirmation_exactly_once_and_conflict(setup):
    _, db, _, _ = setup
    ex, key = create(setup).json(), uuid4().hex
    assert action(setup, ex, key=key).status_code == 200
    replay = action(setup, ex, key=key)
    assert replay.json()['replayed'] is True
    assert action(setup, ex, 'discard', key=key).status_code == 409
    saved = db.clinical_tests.find_one({'clinical_test_id': ex['clinical_test_id']})
    assert saved['revision'] == 2 and len(saved['audit']) == 2


def test_concurrent_confirms_have_single_winner(setup):
    ex = create(setup).json()
    with ThreadPoolExecutor(max_workers=2) as pool:
        codes = list(pool.map(lambda _: action(setup, ex).status_code, range(2)))
    assert sorted(codes) == [200, 409]


def test_clinical_review_preserves_confirmation_and_rejection_excludes(setup):
    client, _, headers, _ = setup
    ex = create(setup).json(); assert action(setup, ex).status_code == 200
    url = '/api/v1/clinical-tests/'+ex['clinical_test_id']
    confirmed = client.get(url+'/extraction', headers=headers['clinician.alpha']).json()
    assert confirmed['confirmed_by'] == 'user_patient_alpha'
    assert client.get(url+'/eligibility', headers=headers['clinician.alpha']).json()['score'] is None
    assert client.get(url+'/eligibility', headers=headers['patient.alpha']).status_code == 403
    assert action(setup, confirmed, 'reject', role='clinician.alpha').status_code == 200
    assert client.get(url+'/eligibility', headers=headers['clinician.alpha']).status_code == 409
    saved = client.get(url+'/extraction', headers=headers['patient.alpha']).json()
    assert saved['confirmed_by'] == 'user_patient_alpha' and saved['score_status'] == 'excluded'


def test_feature_gate_and_live_user_revocation(setup):
    client, db, headers, _ = setup
    db.tenants.update_one({'_id':'demo_beta'}, {'$set':{'features':[]}})
    try:
        assert client.get('/api/v1/clinical-tests', headers=headers['patient.beta']).status_code == 403
    finally:
        db.tenants.update_one({'_id':'demo_beta'}, {'$set':{'features':['clinical_tests','lab_scoring']}})
    db.users.update_one({'_id':'user_patient_beta'}, {'$set':{'state':'inactive'}})
    try:
        assert client.get('/api/me', headers=headers['patient.beta']).status_code == 401
    finally:
        db.users.update_one({'_id':'user_patient_beta'}, {'$set':{'state':'active'}})


def test_expired_and_tampered_tokens(setup):
    client, _, headers, config = setup
    claims = {'sub':'user_patient_alpha','iss':ISSUER,'aud':AUDIENCE,'iat':datetime.now(timezone.utc)-timedelta(hours=2),
              'exp':datetime.now(timezone.utc)-timedelta(hours=1),'jti':'test'}
    for token in [jwt.encode(claims,config.jwt_secret,algorithm='HS256'), 'tampered.token.signature']:
        assert client.get('/api/me',headers={'Authorization':'Bearer '+token}).status_code == 401


def test_persists_across_app_restart(setup):
    client, db, headers, config = setup
    ex = create(setup).json(); assert action(setup, ex).status_code == 200
    with TestClient(create_app(config)) as restarted:
        response = restarted.get('/api/v1/clinical-tests/'+ex['clinical_test_id']+'/extraction',headers=headers['patient.alpha'])
        assert response.status_code == 200
        assert response.json()['status'] == 'confirmed'
        assert response.json()['revision'] == 2


def test_database_requires_tenant_field(setup):
    from pymongo.errors import WriteError
    with pytest.raises(WriteError):
        setup[1].clinical_tests.insert_one({'clinical_test_id':'no-tenant'})


def test_demo_configuration_and_host_guard(setup):
    with pytest.raises(RuntimeError):
        Settings('mongodb://127.0.0.1:27018', 'production', 'x' * 32, 'x' * 12)
    with pytest.raises(RuntimeError):
        Settings('mongodb://127.0.0.1:27018', 'wellq_demo', 'short', 'x' * 12)
    response = setup[0].get('/api/health', headers={'Host': 'untrusted.example'})
    assert response.status_code == 403
    assert response.json()['detail'] == 'LOCAL_DEMO_ONLY'


def test_explicit_evaluation_host_preserves_access_guards(setup):
    from dataclasses import replace
    config = replace(setup[3], allowed_hosts=('evaluation.example',))
    with TestClient(create_app(config), base_url='https://evaluation.example') as hosted:
        assert hosted.get('/api/health').status_code == 200
        assert hosted.get('/api/me').status_code == 401
        assert hosted.get('/api/me', headers=setup[2]['patient.alpha']).json()['client_id'] == 'demo_alpha'
        assert hosted.get('/api/health', headers={'Host': 'other.example'}).status_code == 403
        assert hosted.get('/api/health', headers={'Host': 'evaluation.example.attacker.test'}).status_code == 403
    for hosts in [('*',), ('https://evaluation.example',), ('evaluation.example:443',), ()]:
        with pytest.raises(RuntimeError):
            replace(setup[3], allowed_hosts=hosts)


def pdf_file(title='Synthetic exam'):
    from io import BytesIO
    from pypdf import PdfWriter
    output = BytesIO(); writer = PdfWriter()
    writer.add_blank_page(width=300, height=200)
    writer.add_metadata({'/Title': title}); writer.write(output)
    return output.getvalue()


def upload(setup, role='patient.alpha', data=None, filename='synthetic.pdf', media='application/pdf', key=None, query=''):
    client, _, headers, _ = setup
    return client.post('/api/v1/exam-documents'+query, content=pdf_file() if data is None else data,
        headers={**headers[role], 'Content-Type': media, 'X-File-Name': filename,
                 'Idempotency-Key': key or uuid4().hex})


def test_document_routes_to_database_link_and_persists(setup):
    client, db, headers, config = setup
    data = pdf_file(); response = upload(setup, data=data)
    assert response.status_code == 201
    doc = response.json()
    assert 'content' not in doc and 'clinician_ids' not in doc
    stored = db.exam_documents.find_one({'document_id': doc['document_id']})
    assert stored['patient_id'] == 'patient_alpha' and stored['client_id'] == 'demo_alpha'
    assert stored['clinician_ids'] == ['clinician_alpha'] and stored['content'] == data
    assert all(k in stored['audit'][0] for k in ('actor_id', 'action', 'occurred_at', 'origin', 'result'))
    route = '/api/v1/exam-documents/'+doc['document_id']+'/file'
    assert client.get(route, headers=headers['clinician.alpha']).content == data
    assert client.get(route).status_code == 401
    for role in ('patient.beta', 'clinician.beta', 'patient.alpha_unlinked'):
        assert client.get(route, headers=headers[role]).status_code == 404
        assert doc['document_id'] not in [d['document_id'] for d in client.get('/api/v1/exam-documents', headers=headers[role]).json()]
    with TestClient(create_app(config)) as restarted:
        assert restarted.get(route, headers=headers['patient.alpha']).content == data
    db.care_team_links.update_one({'_id': 'link_alpha'}, {'$set': {'state': 'inactive'}})
    try:
        assert client.get(route, headers=headers['clinician.alpha']).status_code == 404
        assert upload(setup).json()['detail'] == 'NO_TREATING_CLINICIAN'
    finally:
        db.care_team_links.update_one({'_id': 'link_alpha'}, {'$set': {'state': 'active'}})


def test_document_destination_cannot_be_chosen_and_roles_enforced(setup):
    assert upload(setup, role='clinician.alpha').status_code == 403
    assert upload(setup, role='patient.alpha_unlinked').json()['detail'] == 'NO_TREATING_CLINICIAN'
    assert upload(setup, query='?clinician_id=clinician_beta').status_code == 422
    client, db, headers, _ = setup
    db.tenants.update_one({'_id':'demo_beta'}, {'$set': {'features': []}})
    try:
        assert upload(setup, role='patient.beta').status_code == 403
        assert client.get('/api/v1/exam-documents', headers=headers['patient.beta']).status_code == 403
    finally:
        db.tenants.update_one({'_id':'demo_beta'}, {'$set': {'features': ['clinical_tests','lab_scoring']}})


def test_document_idempotency_and_conflict(setup):
    key = uuid4().hex; one = upload(setup, key=key)
    assert one.status_code == 201
    assert upload(setup, key=key).json()['document_id'] == one.json()['document_id']
    assert upload(setup, key=key, data=pdf_file('Different synthetic exam')).status_code == 409


@pytest.mark.parametrize('name,media,data,code', [
    ('empty.pdf','application/pdf',b'', 'EMPTY_FILE'),
    ('bad.pdf','application/pdf',b'%PDF-invalid', 'INVALID_DOCUMENT'),
    ('bad.pdf','application/pdf',b'<script>bad</script>', 'INVALID_DOCUMENT'),
    ('bad.html','text/html',b'<html></html>', 'UNSUPPORTED_FILE_TYPE'),
    ('bad.png','image/png',b'not an image', 'INVALID_DOCUMENT'),
    ('../fake.pdf','application/pdf',b'bad', 'INVALID_FILE_NAME'),
])
def test_invalid_document_not_saved(setup,name,media,data,code):
    before = setup[1].exam_documents.count_documents({})
    result = upload(setup, data=data, filename=name, media=media)
    assert result.status_code == 422 and result.json()['detail'] == code
    assert setup[1].exam_documents.count_documents({}) == before


def test_document_size_limit_and_image_formats(setup):
    from io import BytesIO
    from PIL import Image
    from mvp.documents import MAX_FILE_BYTES
    assert upload(setup, data=b'x'*(MAX_FILE_BYTES+1)).status_code == 413
    for fmt, name, media in [('PNG','synthetic.png','image/png'),('JPEG','synthetic.jpg','image/jpeg')]:
        data = BytesIO(); Image.new('RGB',(10,10),'white').save(data,format=fmt)
        assert upload(setup,data=data.getvalue(),filename=name,media=media).status_code == 201


def test_evaluation_patient_cannot_enter_or_confirm_values(setup):
    from dataclasses import replace
    _, _, headers, config = setup; ex = create(setup).json()
    with TestClient(create_app(replace(config, structured_demo_enabled=False))) as evaluation:
        assert evaluation.post('/api/v1/demo/clinical-tests',json=payload(),headers={**headers['patient.alpha'],'Idempotency-Key':uuid4().hex}).status_code == 403
        assert evaluation.patch('/api/v1/clinical-tests/'+ex['clinical_test_id']+'/extraction',json={'action':'confirm','extraction_id':ex['extraction_id'],'expected_revision':ex['revision']},headers={**headers['patient.alpha'],'Idempotency-Key':uuid4().hex}).status_code == 403


def test_encrypted_pdf_and_forged_identity_headers_denied(setup):
    from io import BytesIO
    from pypdf import PdfWriter
    writer=PdfWriter(); writer.add_blank_page(width=100,height=100); writer.encrypt('synthetic-test-password')
    data=BytesIO();writer.write(data)
    assert upload(setup,data=data.getvalue()).json()['detail'] == 'INVALID_DOCUMENT'
    client, _, headers, _ = setup
    for header in ('X-Client-Id','X-Patient-Id','X-Clinician-Id'):
        assert client.post('/api/v1/exam-documents',content=pdf_file(),headers={**headers['patient.alpha'],'Content-Type':'application/pdf','X-File-Name':'synthetic.pdf','Idempotency-Key':uuid4().hex,header:'forged'}).status_code == 422


def test_demo_buttons_fixed_profiles_keep_backend_roles(setup):
    from dataclasses import replace
    _, db, _, config = setup
    with TestClient(create_app(replace(config, demo_role_access=True))) as client:
        for role in ('patient','clinician'):
            session=client.post('/api/demo/session',json={'role':role})
            assert session.status_code == 200 and session.json()['synthetic_only']
            headers={'Authorization':'Bearer '+session.json()['access_token']}
            user=client.get('/api/me',headers=headers).json()
            assert user['role']==role and user['client_id']=='demo_alpha'
            assert all(d['patient_id']=='patient_alpha' for d in client.get('/api/v1/exam-documents',headers=headers).json())
            if role=='clinician':
                assert client.post('/api/v1/exam-documents',content=pdf_file(),headers={**headers,'Content-Type':'application/pdf','X-File-Name':'demo.pdf','Idempotency-Key':uuid4().hex}).status_code==403
        assert client.post('/api/demo/session',json={'role':'admin'}).status_code==422
        assert client.post('/api/demo/session',json={'role':'patient','client_id':'demo_beta'}).status_code==422
        assert client.get('/api/v1/exam-documents').status_code==401
    assert db.security_events.count_documents({'action':'select_demo_profile','client_id':'demo_alpha'})>=2


def test_demo_direct_access_disabled_and_revoked_persona(setup):
    from dataclasses import replace
    client, db, _, config=setup
    assert client.post('/api/demo/session',json={'role':'patient'}).status_code==404
    db.users.update_one({'_id':'user_patient_alpha'},{'$set':{'state':'inactive'}})
    try:
        with TestClient(create_app(replace(config,demo_role_access=True))) as demo:
            assert demo.post('/api/demo/session',json={'role':'patient'}).status_code==403
    finally:
        db.users.update_one({'_id':'user_patient_alpha'},{'$set':{'state':'active'}})


def review_file(setup, doc, action, role='clinician.alpha', key=None, revision=None, reason=''):
    client, _, headers, _ = setup
    return client.patch('/api/v1/exam-documents/'+doc['document_id']+'/review',
        json={'action':action,'expected_revision':doc['revision'] if revision is None else revision,'reason':reason},
        headers={**headers[role],'Idempotency-Key':key or uuid4().hex})


def test_document_review_flow_and_patient_sees_saved_status(setup):
    client, db, headers, config = setup
    doc=upload(setup).json(); original=db.exam_documents.find_one({'document_id':doc['document_id']})['content']
    assert review_file(setup,doc,'validate').json()['detail']=='INVALID_TRANSITION'
    one=review_file(setup,doc,'confirm');assert one.status_code==200
    assert one.json()['status']=='confirmed'
    two=review_file(setup,one.json(),'validate');assert two.status_code==200
    assert two.json()['status']=='validated'
    stored=db.exam_documents.find_one({'document_id':doc['document_id']})
    assert stored['content']==original and stored['revision']==3
    assert [e['action'] for e in stored['audit']]==['upload_document','document_confirm','document_validate']
    with TestClient(create_app(config)) as restarted:
        shown=next(d for d in restarted.get('/api/v1/exam-documents',headers=headers['patient.alpha']).json() if d['document_id']==doc['document_id'])
        assert shown['status']=='validated' and shown['revision']==3
    assert review_file(setup,two.json(),'error',reason='Synthetic mistake').status_code==409


def test_document_error_requires_reason_and_keeps_original(setup):
    doc=upload(setup).json()
    assert review_file(setup,doc,'error').status_code==422
    result=review_file(setup,doc,'error',reason='Synthetic scan is unreadable')
    assert result.status_code==200 and result.json()['status']=='error'
    stored=setup[1].exam_documents.find_one({'document_id':doc['document_id']})
    assert stored['review_reason']=='Synthetic scan is unreadable' and stored['content']==pdf_file()
    assert review_file(setup,result.json(),'confirm').status_code==409


def test_document_review_scope_permissions_and_features(setup):
    doc=upload(setup).json()
    assert review_file(setup,doc,'confirm',role='patient.alpha').status_code==403
    assert review_file(setup,doc,'confirm',role='clinician.beta').status_code==404
    db=setup[1];db.care_team_links.update_one({'_id':'link_alpha'},{'$set':{'state':'inactive'}})
    try:
        assert review_file(setup,doc,'confirm').status_code==404
    finally:
        db.care_team_links.update_one({'_id':'link_alpha'},{'$set':{'state':'active'}})
    db.tenants.update_one({'_id':'demo_alpha'},{'$set':{'features':[]}})
    try:
        assert review_file(setup,doc,'confirm').status_code==403
    finally:
        db.tenants.update_one({'_id':'demo_alpha'},{'$set':{'features':['clinical_tests','lab_scoring']}})


def test_document_review_idempotence_concurrency_and_stale_revision(setup):
    doc=upload(setup).json();key=uuid4().hex
    first=review_file(setup,doc,'confirm',key=key)
    assert first.status_code==200 and review_file(setup,doc,'confirm',key=key).json()==first.json()
    assert review_file(setup,doc,'error',key=key,reason='Synthetic error').status_code==409
    assert review_file(setup,doc,'error',reason='Synthetic error').json()['detail']=='REVISION_CONFLICT'
    current=first.json()
    with ThreadPoolExecutor(max_workers=2) as pool:
        results=list(pool.map(lambda action:review_file(setup,current,action,reason='Synthetic review').status_code,['validate','error']))
    assert sorted(results)==[200,409]
    saved=setup[1].exam_documents.find_one({'document_id':doc['document_id']})
    assert saved['revision']==3 and len(saved['audit'])==3


def test_existing_document_without_revision_can_be_reviewed(setup):
    doc=upload(setup).json();db=setup[1]
    db.exam_documents.update_one({'document_id':doc['document_id']},{'$unset':{'revision':''}})
    assert review_file(setup,doc,'confirm').status_code==200
    assert db.exam_documents.find_one({'document_id':doc['document_id']})['revision']==2


def test_document_range_reading_security_and_audit(setup):
    from mvp.range_review import synthetic_pdf
    client, db, headers, _ = setup
    data=synthetic_pdf();doc=upload(setup,data=data).json()
    url='/api/v1/exam-documents/'+doc['document_id']+'/range-review'
    assert client.post(url).status_code==401
    assert client.post(url,headers=headers['patient.alpha']).status_code==403
    assert client.post(url,headers=headers['clinician.beta']).status_code==404
    response=client.post(url,headers=headers['clinician.alpha'])
    assert response.status_code==200 and response.json()['measurements'][0]['comparison']=='within'
    stored=db.exam_documents.find_one({'document_id':doc['document_id']})
    assert stored['content']==data and stored['status']=='received' and stored['revision']==1
    assert stored['range_review']==response.json()
    event=stored['audit'][-1]
    assert event['action']=='document_range_review' and all(k in event for k in ['actor_id','occurred_at','origin','result'])
    assert client.post(url+'?client_id=demo_beta',headers=headers['clinician.alpha']).status_code==422
    db.care_team_links.update_one({'_id':'link_alpha'},{'$set':{'state':'inactive'}})
    try: assert client.post(url,headers=headers['clinician.alpha']).status_code==404
    finally: db.care_team_links.update_one({'_id':'link_alpha'},{'$set':{'state':'active'}})
    db.tenants.update_one({'_id':'demo_alpha'},{'$set':{'features':[]}})
    try: assert client.post(url,headers=headers['clinician.alpha']).status_code==403
    finally: db.tenants.update_one({'_id':'demo_alpha'},{'$set':{'features':['clinical_tests','lab_scoring']}})
    assert client.get('/api/v1/demo/range-example',headers=headers['patient.alpha']).content==data
