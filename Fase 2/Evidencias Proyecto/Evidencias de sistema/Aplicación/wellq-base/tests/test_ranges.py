from io import BytesIO
from pypdf import PdfWriter
from mvp.range_review import read_ranges, synthetic_pdf


def test_source_ranges_and_missing_reference():
    result = read_ranges(synthetic_pdf(), 'application/pdf')
    assert result['outcome'] == 'read' and result['diagnosis'] is None
    assert [m['comparison'] for m in result['measurements']] == ['within', 'below', 'above', 'no_reference']
    assert all(m['page'] == 1 and m['source'] for m in result['measurements'])


def test_decimal_negative_boundary_and_units():
    lines = ['A | -1,5 u | Referencia: -1,5-2,0 u', 'B | 2.0 u | Reference: 1.0-2.0 u',
             'C | 3 cm | Referencia: 1-5 mm', 'D | 3 u | Referencia: 5-1 u']
    result = read_ranges(synthetic_pdf(lines), 'application/pdf')
    assert [m['comparison'] for m in result['measurements']] == ['within','within','unit_mismatch','invalid_reference']


def test_no_invented_values_and_unsupported_inputs():
    assert read_ranges(synthetic_pdf(['No measurements here']), 'application/pdf')['outcome'] == 'no_measurements'
    assert read_ranges(b'bad', 'application/pdf')['outcome'] == 'unreadable'
    assert read_ranges(b'image', 'image/png')['outcome'] == 'unsupported'
    writer=PdfWriter(); writer.add_blank_page(width=200,height=200); out=BytesIO();writer.write(out)
    assert read_ranges(out.getvalue(), 'application/pdf')['outcome'] == 'no_text'
    for _ in range(20):writer.add_blank_page(width=200,height=200)
    out=BytesIO();writer.write(out)
    assert read_ranges(out.getvalue(), 'application/pdf')['outcome'] == 'limit'
