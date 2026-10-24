"""Regression for T-02/T-03 against the running synthetic MVP."""
import os, json, sys, uuid
from pathlib import Path
from urllib.parse import urlsplit
from playwright.sync_api import sync_playwright, expect
APP=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(APP))
from mvp.range_review import synthetic_pdf
out=APP/'.runtime/dashboard-evidence';out.mkdir(exist_ok=True)
base=os.getenv('WELLQ_QA_URL','http://127.0.0.1:8765/')
requests=[];errors=[];snapshots=[]
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True)
    page=browser.new_page(viewport={'width':1365,'height':1000})
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.on('request',lambda r:requests.append(urlsplit(r.url).path))
    def received(response):
        if urlsplit(response.url).path=='/api/v1/exam-documents' and response.request.method=='GET' and response.status==200:
            snapshots.append(response.json())
    page.on('response',received)
    page.goto(base)
    def enter(role):
        page.locator('#enter-'+role).click()
        expect(page.locator('#workspace')).to_be_visible()
        expect(page.locator('#login-panel')).to_be_hidden()
    def switch():
        page.locator('#logout').click()
        expect(page.locator('#workspace')).to_be_hidden()
        expect(page.locator('#login-panel')).to_be_visible()
    for _ in range(3):
        enter('patient');switch();enter('clinician');switch()
    enter('patient')
    filename='dashboard-FICTICIO-'+uuid.uuid4().hex[:8]+'.pdf'
    page.locator('#exam-file').set_input_files({'name':filename,'mimeType':'application/pdf','buffer':synthetic_pdf()})
    page.locator('#upload-form button').click()
    expect(page.locator('#notice')).to_contain_text('guardado')
    switch();enter('clinician')
    def counters():
        docs=snapshots[-1]
        expect(page.locator('#count-all')).to_have_text(str(len(docs)))
        for selector,state in [('awaiting','received'),('confirmed','confirmed'),('validated','validated')]:
            expect(page.locator('#count-'+selector)).to_have_text(str(sum(d['status']==state for d in docs)))
        assert page.locator('.exam-item').count()==len(docs)
    counters()
    row=page.locator('.document-item').filter(has=page.get_by_text(filename,exact=True))
    row.get_by_role('button',name='Confirmar recepción',exact=True).click()
    expect(row.locator('.document-status')).to_contain_text('Recepción confirmada')
    counters()
    row.get_by_role('button',name='Validar examen',exact=True).click()
    expect(row.locator('.document-status')).to_contain_text('Validado')
    counters()
    page.locator('.exam-item').filter(has=page.get_by_text(filename,exact=True)).click()
    expect(page.locator('#detail')).to_contain_text(filename)
    page.locator('#detail summary').click()
    expect(page.locator('#detail .timeline')).to_contain_text('Documento validado')
    page.locator('[data-filter="validated"]').click()
    assert page.locator('.exam-item').count()==sum(d['status']=='validated' for d in snapshots[-1])
    page.locator('[data-filter="all"]').click()
    page.locator('#exam-search').fill(filename)
    expect(page.locator('.exam-item')).to_have_count(1)
    page.locator('#language').select_option('en')
    expect(page.locator('.exam-item')).to_contain_text('Clinician validated')
    page.locator('#language').select_option('es')
    page.screenshot(path=str(out/'professional-dashboard.png'),full_page=True)
    page.set_viewport_size({'width':390,'height':844})
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
    switch();enter('patient')
    expect(page.locator('#upload-form')).to_be_visible()
    expect(page.locator('#login-panel')).to_be_hidden()
    assert '/api/v1/clinical-tests' not in requests
    assert not errors,errors
    (out/'browser.json').write_text(json.dumps({'passed':True,'url':base,'errors':errors,'checks':['repeated patient-professional switching; exclusive visible screen','summary matches uploaded document statuses','confirm-validate counters update','document history','filter and filename search','Spanish-English','390px no overflow','no legacy clinical-tests request']},indent=2))
    browser.close()
print('Document dashboard regression passed')
