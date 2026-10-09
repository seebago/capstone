"""Bounded synthetic document ingestion, without extraction or clinical interpretation."""
from io import BytesIO
from pathlib import Path
from urllib.parse import unquote
import warnings
from PIL import Image
from pypdf import PdfReader

MAX_FILE_BYTES = 4 * 1024 * 1024
TYPES = {'.pdf': 'application/pdf', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg'}


def validate_document(name, content_type, data):
    name = unquote(name or '')
    if not name or len(name) > 120 or any(ord(c) < 32 for c in name) or '/' in name or '\\' in name:
        raise ValueError('INVALID_FILE_NAME')
    extension = Path(name).suffix.lower()
    if extension not in TYPES or content_type != TYPES[extension]:
        raise ValueError('UNSUPPORTED_FILE_TYPE')
    if not data:
        raise ValueError('EMPTY_FILE')
    try:
        if extension == '.pdf':
            if not data.startswith(b'%PDF-'):
                raise ValueError()
            pdf = PdfReader(BytesIO(data), strict=True)
            if pdf.is_encrypted or not 1 <= len(pdf.pages) <= 100:
                raise ValueError()
        else:
            with warnings.catch_warnings():
                warnings.simplefilter('error', Image.DecompressionBombWarning)
                with Image.open(BytesIO(data)) as image:
                    if image.format != ('PNG' if extension == '.png' else 'JPEG'):
                        raise ValueError()
                    if image.width * image.height > 25_000_000:
                        raise ValueError()
                    image.verify()
    except Exception as error:
        raise ValueError('INVALID_DOCUMENT') from error
    return name, TYPES[extension]
