from datetime import datetime, timezone
from pymongo import MongoClient, ASCENDING
from .security import hash_password


def now_string():
    return datetime.now(timezone.utc).isoformat()


def connect(settings):
    client = MongoClient(settings.mongo_uri, serverSelectionTimeoutMS=3000, tz_aware=True)
    client.admin.command('ping')
    return client


def initialize(db, password):
    """Only seeds synthetic demo DBs; never imports the supplied document's data."""
    collections = ('tenants', 'patients', 'clinics', 'clinicians', 'cases', 'users',
                   'care_team_links', 'clinical_tests', 'security_events')
    for name in collections:
        if name not in db.list_collection_names():
            db.create_collection(name, validator={'$jsonSchema': {
                'bsonType': 'object', 'required': ['client_id'],
                'properties': {'client_id': {'bsonType': 'string', 'minLength': 1}}
            }})
        db[name].create_index([('client_id', ASCENDING)])
    for collection, field in [('patients', 'patient_id'), ('clinics', 'clinic_id'),
                               ('clinicians', 'clinician_id'), ('cases', 'case_id'),
                               ('users', 'email_norm'), ('clinical_tests', 'clinical_test_id')]:
        db[collection].create_index([('client_id', 1), (field, 1)], unique=True)
    db.users.create_index('email_norm', unique=True)
    db.clinical_tests.create_index([('client_id', 1), ('patient_id', 1), ('created_at', -1)])
    db.clinical_tests.create_index([('client_id', 1), ('created_by', 1), ('creation_key', 1)], unique=True)
    db.care_team_links.create_index([('client_id', 1), ('clinician_id', 1), ('patient_id', 1)], unique=True)
    now = now_string()
    def insert(collection, identifier, **fields):
        db[collection].update_one({'_id': identifier}, {'$setOnInsert': {'_id': identifier,
                                 'created_at': now, 'updated_at': now, **fields}}, upsert=True)
    for tenant in ['alpha', 'beta']:
        client_id = f'demo_{tenant}'
        clinic_id = f'clinic_{tenant}'
        clinician_id = f'clinician_{tenant}'
        insert('tenants', client_id, client_id=client_id, name=f'Demo {tenant.title()}',
               features=['clinical_tests', 'lab_scoring'])
        insert('clinics', clinic_id, client_id=client_id, clinic_id=clinic_id,
               name=f'WellQ Demo {tenant.title()}', address='Synthetic location', state='active', metadata={'synthetic': True})
        insert('clinicians', clinician_id, client_id=client_id, clinician_id=clinician_id,
               first_name='Demo', last_name=f'Clinician {tenant.title()}', clinic_id=clinic_id,
               clinic_ids=[clinic_id], contact={'email': f'clinician.{tenant}@wellq.test'},
               specialties=[], state='active', validated=True)
        # Second alpha patient is deliberately unlinked to test within-tenant access.
        for suffix in (['', '_unlinked'] if tenant == 'alpha' else ['']):
            patient_id = f'patient_{tenant}{suffix}'
            insert('patients', patient_id, client_id=client_id, patient_id=patient_id,
                   first_name='Demo', last_name=f'Patient {tenant.title()}{suffix}',
                   contact={'email': f'patient.{tenant}{suffix}@wellq.test', 'phone': ''},
                   ids={}, metadata={'source': 'capstone_synthetic'}, state='active', status='active')
            insert('cases', f'case_{tenant}{suffix}', client_id=client_id, case_id=f'case_{tenant}{suffix}',
                   patient_id=patient_id, title='Synthetic examination follow-up', status='active',
                   start_date='2026-09-30', diagnosis_codes=[], treatment_goals=[])
            insert('users', f'user_patient_{tenant}{suffix}', client_id=client_id,
                   email=f'patient.{tenant}{suffix}@wellq.test', email_norm=f'patient.{tenant}{suffix}@wellq.test',
                   password_hash=hash_password(password), roles=['patient'], state='active',
                   first_name='Demo', last_name='Patient', subject={'kind': 'patient', 'id': patient_id})
        insert('care_team_links', f'link_{tenant}', client_id=client_id,
               clinic_id=clinic_id, clinician_id=clinician_id, patient_id=f'patient_{tenant}', state='active')
        insert('users', f'user_clinician_{tenant}', client_id=client_id,
               email=f'clinician.{tenant}@wellq.test', email_norm=f'clinician.{tenant}@wellq.test',
               password_hash=hash_password(password), roles=['clinician'], state='active',
               first_name='Demo', last_name='Clinician', subject={'kind': 'clinician', 'id': clinician_id})
