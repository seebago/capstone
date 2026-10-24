import json
import os
from pathlib import Path
from datetime import datetime
from playwright.sync_api import sync_playwright, expect

APP = Path(__file__).resolve().parents[1]
OUT = APP / '.runtime/browser-evidence'
OUT.mkdir(exist_ok=True)
password = json.loads((APP / '.runtime/config.json').read_text())['demo_password']
title = 'Demo de revisión ' + datetime.now().strftime('%H:%M:%S')
errors, checks = [], []

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(viewport={'width': 1365, 'height': 1000}, device_scale_factor=1)
    page = context.new_page()
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.on('console', lambda msg: errors.append(msg.text) if msg.type == 'error' else None)
    page.goto('http://127.0.0.1:8765', wait_until='networkidle')
    expect(page.locator('body')).to_have_class('dark')
    page.screenshot(path=str(OUT/'login-desktop.png'), full_page=True)

    def login(profile):
        page.locator('#email').select_option(profile+'@wellq.test')
        page.locator('#password').fill(password)
        page.locator('#login-form button[type=submit]').click()
        expect(page.locator('#workspace')).to_be_visible()
        expect(page.locator('#health')).to_have_text('Base conectada')

    login('patient.alpha')
    page.locator('#new-exam').click()
    page.locator('#exam-title').fill(title)
    page.locator('#confidence').select_option('0.5')
    page.locator('#identity').select_option('unknown')
    page.locator('#create-form button[type=submit]').click()
    expect(page.locator('#detail h2')).to_have_text(title)
    expect(page.locator('#identity-check')).to_be_visible()
    page.locator('#edit-demo_marker_a').fill('7')
    page.locator('#identity-check').check()
    page.locator('#confidence-check').check()
    page.locator('#review-reason').fill('Cotejo del examen ficticio durante la prueba de navegador.')
    page.screenshot(path=str(OUT/'patient-review-desktop.png'),full_page=True)
    page.get_by_role('button',name='Confirmar valores',exact=True).click()
    expect(page.locator('#detail .badge')).to_have_text('Confirmado por paciente')
    expect(page.locator('#detail tbody tr td').nth(1)).to_have_text('5')
    expect(page.locator('#detail tbody tr td').nth(2)).to_have_text('7')
    checks.append('Paciente: creación, cotejo, corrección y confirmación persistida')
    page.locator('#logout').click()
    login('clinician.alpha')
    page.get_by_role('button').filter(has=page.get_by_text(title,exact=True)).click()
    page.get_by_role('button',name='Validar examen',exact=True).click()
    expect(page.locator('#detail .badge')).to_have_text('Validado por profesional')
    page.get_by_role('button',name='Comprobar elegibilidad',exact=True).click()
    expect(page.locator('#notice')).to_contain_text('Marcador A')
    checks.append('Profesional: validación y elegibilidad sin puntaje inventado')
    page.locator('[data-filter="clinically_validated"]').click()
    expect(page.locator('[data-filter="clinically_validated"]')).to_have_attribute('aria-pressed','true')
    page.get_by_role('button').filter(has=page.get_by_text(title,exact=True)).click()
    page.screenshot(path=str(OUT/'clinician-desktop.png'),full_page=True)
    page.locator('#language').select_option('en')
    expect(page.locator('#health')).to_have_text('Database connected')
    expect(page.locator('#theme')).to_have_text('Light mode')
    page.locator('#theme').click()
    expect(page.locator('body')).not_to_have_class('dark')
    page.screenshot(path=str(OUT/'clinician-light-english.png'),full_page=True)
    page.locator('#theme').click()
    page.locator('#language').select_option('es')
    checks.append('Filtros, idioma inglés/español y temas claro/oscuro')
    page.set_viewport_size({'width':428,'height':926})
    page.evaluate('window.scrollTo(0,0)')
    page.screenshot(path=str(OUT/'clinician-mobile.png'),full_page=True)
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
    page.locator('#detail').screenshot(path=str(OUT/'detail-mobile.png'))
    page.set_viewport_size({'width':390,'height':844})
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
    page.locator('#logout').click()
    login('patient.beta')
    expect(page.locator('#exam-list')).not_to_contain_text(title)
    checks.append('Vista móvil 428/390 px y aislamiento Alpha/Beta')
    page.locator('#logout').click()
    page.screenshot(path=str(OUT/'login-mobile.png'),full_page=True)
    page.reload(wait_until='networkidle')
    expect(page.locator('#login-panel')).to_be_visible()
    checks.append('Cierre de sesión y recarga sin conservar credenciales en navegador')
    browser.close()

report={'checks':checks,'console_errors':errors,'exam_title':title,'passed':not errors}
(OUT/'browser-results.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(report,ensure_ascii=False))
assert not errors, errors
