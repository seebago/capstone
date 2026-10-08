"""Current patient upload -> automatically linked clinician flow. Synthetic files only."""
import json
import os
from io import BytesIO
from pathlib import Path
from datetime import datetime
from pypdf import PdfWriter
from playwright.sync_api import sync_playwright, expect

APP = Path(__file__).resolve().parents[1]
BASE_URL = os.getenv('WELLQ_BROWSER_URL', 'http://127.0.0.1:8765').rstrip('/')
OUT = APP / '.runtime/browser-upload-evidence'
OUT.mkdir(exist_ok=True)
password = json.loads((APP / '.runtime/config.json').read_text())['demo_password']
filename = 'examen-ficticio-' + datetime.now().strftime('%H%M%S') + '.pdf'
writer = PdfWriter(); writer.add_blank_page(width=300, height=200)
writer.add_metadata({'/Title': 'SYNTHETIC TEST ONLY'})
buffer = BytesIO(); writer.write(buffer); content = buffer.getvalue()
errors, checks = [], []

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, downloads_path=str(OUT/'downloads'))
    context = browser.new_context(viewport={'width': 1365, 'height': 1000})
    page = context.new_page()
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.on('console', lambda msg: errors.append(msg.text) if msg.type == 'error' else None)
    page.goto(BASE_URL, wait_until='networkidle')
    if page.get_by_role('button', name='Visit Site', exact=True).is_visible():
        page.get_by_role('button', name='Visit Site', exact=True).click()
    expect(page.locator('#login-panel')).to_be_visible()
    page.screenshot(path=str(OUT/'login-desktop.png'), full_page=True)

    def login(profile):
        page.locator('#email').select_option(profile+'@wellq.test')
        page.locator('#password').fill(password)
        page.locator('#login-form button[type=submit]').click()
        expect(page.locator('#workspace')).to_be_visible()
        expect(page.locator('#health')).to_have_text('Base conectada')

    login('patient.alpha')
    expect(page.locator('#upload-form')).to_be_visible()
    expect(page.locator('#structured-workspace')).to_be_hidden()
    assert page.locator('#create-dialog, #patient, #case, #new-exam').count() == 0
    page.locator('#exam-file').set_input_files({'name':filename,'mimeType':'application/pdf','buffer':content})
    page.locator('#upload-form button').click()
    expect(page.locator('#document-list')).to_contain_text(filename)
    expect(page.locator('#notice')).to_contain_text('disponible para tu médico')
    page.screenshot(path=str(OUT/'patient-upload-desktop.png'),full_page=True)
    checks.append('Paciente: solo archivo, sin destinatario ni edición de valores')
    page.locator('#logout').click()
    login('clinician.alpha')
    expect(page.locator('#upload-form')).to_be_hidden()
    row = page.locator('.document-item').filter(has_text=filename)
    expect(row).to_have_count(1)
    with page.expect_download() as saved:
        row.get_by_role('button',name='Descargar archivo',exact=True).click()
    downloaded = saved.value
    destination = OUT / 'downloaded-synthetic.pdf'
    downloaded.save_as(destination)
    assert destination.read_bytes() == content
    checks.append('Médico vinculado: recepción automática y descarga idéntica al original')
    page.screenshot(path=str(OUT/'clinician-documents-desktop.png'),full_page=True)
    page.locator('#language').select_option('en')
    expect(page.locator('#delivery-hint')).to_contain_text('linked patients')
    page.locator('#theme').click()
    expect(page.locator('body')).not_to_have_class('dark')
    page.screenshot(path=str(OUT/'clinician-light-english.png'),full_page=True)
    page.locator('#theme').click(); page.locator('#language').select_option('es')
    checks.append('Español/inglés y temas claro/oscuro')
    for width in [428,390]:
        page.set_viewport_size({'width':width,'height':926})
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
    page.screenshot(path=str(OUT/'clinician-mobile.png'),full_page=True)
    page.locator('#logout').click(); login('clinician.beta')
    expect(page.locator('#document-list')).not_to_contain_text(filename)
    page.locator('#logout').click(); login('patient.beta')
    expect(page.locator('#document-list')).not_to_contain_text(filename)
    page.screenshot(path=str(OUT/'patient-mobile.png'),full_page=True)
    checks.append('Aislamiento Alpha/Beta y vistas 390/428 px sin desborde')
    page.locator('#logout').click(); page.reload(wait_until='networkidle')
    expect(page.locator('#login-panel')).to_be_visible()
    checks.append('Cierre de sesión y recarga sin credenciales persistidas')
    browser.close()
report={'base_url':BASE_URL,'checks':checks,'console_errors':errors,'filename':filename,'passed':not errors}
(OUT/'browser-results.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(report,ensure_ascii=False))
assert not errors, errors
