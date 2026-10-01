import os
from dataclasses import dataclass


@dataclass(frozen=True)
class Settings:
    mongo_uri: str
    database: str
    jwt_secret: str
    demo_password: str

    def __post_init__(self):
        if not self.database.startswith(('wellq_demo', 'wellq_test')):
            raise RuntimeError('This MVP only permits wellq_demo* or wellq_test* databases')
        if len(self.jwt_secret) < 32 or len(self.demo_password) < 12:
            raise RuntimeError('Set a 32+ character JWT secret and 12+ character demo password')

    @classmethod
    def load(cls):
        return cls(os.getenv('WELLQ_MONGO_URI', 'mongodb://127.0.0.1:27018'),
                     os.getenv('WELLQ_DATABASE', 'wellq_demo'),
                     os.getenv('WELLQ_JWT_SECRET', ''), os.getenv('WELLQ_DEMO_PASSWORD', ''))
