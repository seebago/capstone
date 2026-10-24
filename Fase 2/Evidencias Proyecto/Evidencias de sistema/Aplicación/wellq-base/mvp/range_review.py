"""Local document arithmetic only. No clinical catalogue, diagnosis or external AI."""
from decimal import Decimal
from io import BytesIO
import re
from pypdf import PdfReader, PdfWriter
from pypdf.generic import DictionaryObject, NameObject, DecodedStreamObject

VERSION = 'document-ranges-v1'
NUMBER = r'-?\d+(?:[.,]\d+)?'
VALUE = re.compile(rf'({NUMBER})\s+([^|]+)')
REFERENCE = re.compile(rf'(?:Referencia|Reference):\s*({NUMBER})\s*(?:–|−|-|a|to)\s*({NUMBER})\s+([^|]+)', re.I)


def read_ranges(data, media_type):
    result = {'version': VERSION, 'outcome': 'unsupported', 'measurements': [], 'pages_read': 0,
              'diagnosis': None, 'requires_professional_review': True}
    if media_type != 'application/pdf':
        return result
    try:
        pdf = PdfReader(BytesIO(data), strict=True)
        if pdf.is_encrypted or len(pdf.pages) > 20:
            result['outcome'] = 'limit'
            return result
        texts = []
        total = 0
        for page in pdf.pages:
            # Bound decompressed content before text extraction.
            stream = page.get_contents()
            if stream and len(stream.get_data()) > 1_000_000:
                result['outcome'] = 'limit'
                return result
            text = page.extract_text() or ''
            total += len(text)
            if total > 100_000:
                result['outcome'] = 'limit'
                return result
            texts.append(text)
        result['pages_read'] = len(texts)
        for page_number, text in enumerate(texts, 1):
            for line in text.splitlines():
                parts = [s.strip() for s in line.split('|')]
                if len(parts) not in (2, 3) or not 1 <= len(parts[0]) <= 100:
                    continue
                value = VALUE.fullmatch(parts[1])
                if not value:
                    continue
                number, unit = value.groups()
                if len(unit) > 30:
                    continue
                item = {'name': parts[0], 'value': number, 'unit': unit.strip(), 'page': page_number,
                        'source': line[:300], 'comparison': 'no_reference', 'reference': None}
                if len(parts) == 3:
                    ref = REFERENCE.fullmatch(parts[2])
                    if ref:
                        low, high, ref_unit = ref.groups()
                        lo, hi, val = [Decimal(s.replace(',', '.')) for s in (low, high, number)]
                        item['reference'] = parts[2]
                        if unit.strip() != ref_unit.strip():
                            item['comparison'] = 'unit_mismatch'
                        elif lo > hi:
                            item['comparison'] = 'invalid_reference'
                        else:
                            item['comparison'] = 'below' if val < lo else 'above' if val > hi else 'within'
                result['measurements'].append(item)
                if len(result['measurements']) >= 100:
                    result['outcome'] = 'limit'
                    return result
        result['outcome'] = 'read' if result['measurements'] else 'no_measurements' if any(t.strip() for t in texts) else 'no_text'
        return result
    except Exception:
        result['outcome'] = 'unreadable'
        return result


def synthetic_pdf(lines=None):
    # Deliberately fictional ranges for software QA, never clinical references.
    lines = lines or ['WELLQ - EVALUACION KINESIOLOGICA FICTICIA',
        'SOLO PRUEBAS: referencias inventadas; sin uso clinico.',
        'Movilidad de prueba A | 110 grados | Referencia: 100-150 grados',
        'Fuerza de prueba B | 8 unidad_demo | Referencia: 10-20 unidad_demo',
        'Medicion de prueba C | 25 unidad_demo | Referencia: 10-20 unidad_demo',
        'Dolor informado de prueba | 3 puntos']
    writer = PdfWriter()
    page = writer.add_blank_page(width=595, height=842)
    font = DictionaryObject({NameObject('/Type'): NameObject('/Font'), NameObject('/Subtype'): NameObject('/Type1'), NameObject('/BaseFont'): NameObject('/Helvetica')})
    page[NameObject('/Resources')] = DictionaryObject({NameObject('/Font'): DictionaryObject({NameObject('/F1'): writer._add_object(font)})})
    escaped = [s.replace('\\', '\\\\').replace('(', r'\(').replace(')', r'\)') for s in lines]
    stream = DecodedStreamObject()
    stream.set_data(('BT /F1 10 Tf 40 780 Td 20 TL '+ ' T* '.join('('+s+') Tj' for s in escaped)+' ET').encode('latin-1'))
    page[NameObject('/Contents')] = writer._add_object(stream)
    output = BytesIO(); writer.write(output)
    return output.getvalue()
