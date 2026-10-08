"""Start the localhost demonstration after MongoDB is running."""
import json
import os
from pathlib import Path
import secrets

root = Path(__file__).resolve().parent
runtime = root / '.runtime'
runtime.mkdir(exist_ok=True)
config_file = runtime / 'config.json'
if not config_file.exists():
    config_file.write_text(json.dumps({'jwt_secret': secrets.token_urlsafe(48),
                                      'demo_password': secrets.token_urlsafe(18)}), encoding='utf-8')
config = json.loads(config_file.read_text(encoding='utf-8'))
os.environ.setdefault('WELLQ_JWT_SECRET', config['jwt_secret'])
os.environ.setdefault('WELLQ_DEMO_PASSWORD', config['demo_password'])
os.environ.setdefault('WELLQ_DEMO_ROLE_ACCESS', 'true')
(runtime / 'access.txt').write_text('WellQ SYNTHETIC DEMO\nhttp://127.0.0.1:8765\n\n'
    'Enter using the Patient or Clinician buttons. No evaluation password is required.\n', encoding='utf-8')


if __name__ == '__main__':
    import uvicorn
    from mvp.app import create_app
    print('Open http://127.0.0.1:8765 - choose Patient or Clinician; no password required')
    uvicorn.run(create_app(), host='127.0.0.1', port=8765, access_log=False)
