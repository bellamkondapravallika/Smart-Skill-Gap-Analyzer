import io
from pypdf import PdfReader

def extract_text_from_pdf_bytes(pdf_bytes: bytes) -> str:
    """
    Extract readable text from PDF bytes using pypdf.
    Handles multi-page documents, spacing, and clean UTF-8 text formatting.
    """
    try:
        reader = PdfReader(io.BytesIO(pdf_bytes))
        pages_text = []
        for index, page in enumerate(reader.pages):
            text = page.extract_text()
            if text:
                pages_text.append(text.strip())
        
        full_text = "\n\n".join(pages_text).strip()
        if not full_text:
            raise ValueError("The uploaded PDF has no extractable text layer (it may be a scanned image).")
        return full_text
    except Exception as e:
        raise ValueError(f"Could not extract text from PDF: {str(e)}")
