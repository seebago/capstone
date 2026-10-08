import os
import re
from dataclasses import dataclass


@dataclass(frozen=True)
class Settings:
    mongo_uri: str
    database: str
    jwt_secret: str
    demo_password: str
    structured_demo_enabled: bool = False
    allowed_hosts: tuple[str, ...] = ("127.0.0.1", "localhost", "testserver")

    def __post_init__(self):
        if not self.allowed_hosts or any(not re.fullmatch(r"[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?", h) or ".." in h for h in self.allowed_hosts):
            raise RuntimeError("Set exact lowercase hostnames without schemes, ports or wildcards")
        if not self.database.startswith(('wellq_demo', 'wellq_test')):
            raise RuntimeError('This MVP only permits wellq_demo* or wellq_test* databases')
        if len(self.jwt_secret) < 32 or len(self.demo_password) < 12:
            raise RuntimeError('Set a 32+ character JWT secret and 12+ character demo password')

    @classmethod
    def load(cls):
        return cls(os.getenv('WELLQ_MONGO_URI', 'mongodb://127.0.0.1:27018'),
                     os.getenv('WELLQ_DATABASE', 'wellq_demo'),
                     os.getenv('WELLQ_JWT_SECRET', ''), os.getenv('WELLQ_DEMO_PASSWORD', ''),
                     allowed_hosts=tuple(h.strip().lower() for h in os.getenv('WELLQ_ALLOWED_HOSTS', '127.0.0.1,localhost,testserver').split(',')),
                     structured_demo_enabled=os.getenv('WELLQ_STRUCTURED_DEMO', 'false').lower() == 'true')
