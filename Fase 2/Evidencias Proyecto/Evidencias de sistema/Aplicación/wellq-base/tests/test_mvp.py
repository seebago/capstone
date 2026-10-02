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
    config = Settings(uri, name, 'test-secret-only-' + uuid4().hex, 'OnlySyntheticTesting!42')
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
    assert page.status_code == 200 and 'login-form' in page.text
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
