from pathlib import Path
import sys,json
APP = Path(__file__).resolve().parents[1]
sys.path.insert(0,str(APP))
from mvp.range_review import synthetic_pdf
from io import BytesIO
from pypdf import PdfWriter
writer=PdfWriter();writer.append(BytesIO(synthetic_pdf()));writer.append(BytesIO(synthetic_pdf(['SEGUNDA PAGINA FICTICIA'])));buffer=BytesIO();writer.write(buffer);content=buffer.getvalue()
from playwright.sync_api import sync_playwright,expect
out=APP/'.runtime/ranges-evidence';out.mkdir(exist_ok=True)
(out/'evaluacion-kinesiologica-FICTICIA.pdf').write_bytes(synthetic_pdf())
errors=[]
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True)
 page=browser.new_page(viewport={'width':1365,'height':1000})
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto('http://127.0.0.1:8765/')
 page.locator('#enter-patient').click();expect(page.locator('#workspace')).to_be_visible()
 expect(page.get_by_role('button',name='Descargar examen ficticio para probar')).to_be_visible()
 page.locator('#exam-file').set_input_files({'name':'evaluacion-rangos-FICTICIA.pdf','mimeType':'application/pdf','buffer':content})
 page.locator('#upload-form button').click();expect(page.locator('#notice')).to_contain_text('guardado')
 assert page.locator('[data-range-review]').count()==0
 page.locator('#logout').click();page.locator('#enter-clinician').click();expect(page.locator('#workspace')).to_be_visible()
 row=page.locator('.document-item').filter(has=page.get_by_text('evaluacion-rangos-FICTICIA.pdf',exact=True)).first
 row.get_by_role('button',name='Revisar examen',exact=True).click()
 expect(page.locator('#range-dialog')).to_be_visible()
 for text in ['Dentro del rango indicado','Por debajo del rango indicado','Por encima del rango indicado','Sin referencia disponible']:
  expect(page.locator('#range-dialog')).to_contain_text(text)
 expect(page.locator('.pdf-controls')).to_contain_text('Página 1 / 2')
 expect(page.locator('.pdf-viewer canvas')).to_be_visible()
 page.locator('.pdf-controls').get_by_role('button',name='Siguiente').click();expect(page.locator('.pdf-controls')).to_contain_text('Página 2 / 2')
 page.locator('.pdf-controls').get_by_role('button',name='Anterior').click();expect(page.locator('.pdf-controls')).to_contain_text('Página 1 / 2')
 assert page.locator('.pdf-viewer canvas').evaluate('(c)=>c.width>0 && c.getContext("2d").getImageData(0,0,c.width,c.height).data.some((v,i)=>i%4!==3 && v<200)')
 left=page.locator('.review-reading').bounding_box();right=page.locator('.review-original').bounding_box();assert left['x']+left['width']<=right['x']
 page.locator('#range-dialog').screenshot(path=str(out/'range-review-desktop.png'))
 page.get_by_role('button',name='Cerrar',exact=True).click()
 page.locator('#language').select_option('en');row.get_by_role('button',name='Review exam',exact=True).click()
 expect(page.locator('#range-dialog')).to_contain_text('Within the stated range')
 page.get_by_role('button',name='Close',exact=True).click()
 page.locator('#language').select_option('es');page.locator('#theme').click()
 page.set_viewport_size({'width':390,'height':844})
 row.get_by_role('button',name='Revisar examen',exact=True).click()
 expect(page.locator('#range-dialog')).to_be_visible()
 assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
 expect(page.locator('.pdf-controls')).to_contain_text('Página 1 / 2')
 left=page.locator('.review-reading').bounding_box();right=page.locator('.review-original').bounding_box();assert left['y']+left['height']<=right['y']
 page.locator('#range-dialog').screenshot(path=str(out/'range-review-mobile.png'))
 assert not errors,errors
 (out/'browser.json').write_text(json.dumps({'passed':True,'errors':errors,'checks':['upload to linked clinician','4 result types','patient has no reading button','Spanish and English','dark and light','390px no page overflow']},indent=2),encoding='utf-8')
 browser.close()
print('Browser range review passed')
