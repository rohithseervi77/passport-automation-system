"""
inspect_pdf_pages.py
Inspects every page of PAS_Noun_Phrase_CRC.pdf for text content, character counts, and layout health.
"""

import os
from pypdf import PdfReader

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PDF_PATH = os.path.join(BASE_DIR, "docs", "noun-phrase-crc", "PAS_Noun_Phrase_CRC.pdf")

reader = PdfReader(PDF_PATH)
total_pages = len(reader.pages)

print(f"Total Pages in PAS_Noun_Phrase_CRC.pdf: {total_pages}")
print("-" * 60)

for idx, page in enumerate(reader.pages):
    text = page.extract_text() or ""
    lines = [l.strip() for l in text.splitlines() if l.strip()]
    first_few = lines[:3] if lines else ["<EMPTY PAGE>"]
    print(f"Page {idx+1}/{total_pages}: {len(text)} chars, {len(lines)} lines | Starts with: {' / '.join(first_few)}")

print("-" * 60)
