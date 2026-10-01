import hashlib
import hmac
import secrets
from datetime import datetime, timedelta, timezone
import jwt

ISSUER = 'wellq-local-mvp'
AUDIENCE = 'wellq-demo-api'
PERMISSIONS = {
    'patient': frozenset({'exam:read', 'exam:create', 'exam:confirm'}),
    'clinician': frozenset({'exam:read', 'exam:validate', 'score:read'}),
}


def hash_password(password):
    salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 310000).hex()
    return f'{salt}:{key}'


def check_password(password, stored):
    salt, expected = stored.split(':', 1)
    actual = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 310000).hex()
    return hmac.compare_digest(expected, actual)


def token_for(user, secret):
    now = datetime.now(timezone.utc)
    return jwt.encode({'sub': user['_id'], 'iss': ISSUER, 'aud': AUDIENCE,
                       'iat': now, 'exp': now + timedelta(minutes=45),
                       'jti': secrets.token_hex(16)}, secret, algorithm='HS256')


def subject_from_token(token, secret):
    return jwt.decode(token, secret, algorithms=['HS256'], audience=AUDIENCE,
                      issuer=ISSUER, options={'require': ['sub', 'exp', 'iat', 'iss', 'aud', 'jti']})['sub']
