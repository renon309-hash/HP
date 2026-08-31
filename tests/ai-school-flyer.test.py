"""A4 PDF, content, safe margins, embedded logo/fonts and direct QR regression checks.

Requires pypdf, pdfplumber, pypdfium2, Pillow, zxing-cpp.
Optional: --qr-deps PATH to a local zxing-cpp installation.
"""
from pathlib import Path
import argparse
import re
import sys
import xml.etree.ElementTree as ET
from datetime import date
from pypdf import PdfReader
import pdfplumber
import pypdfium2 as pdfium
from PIL import Image, ImageDraw, ImageChops

parser = argparse.ArgumentParser()
parser.add_argument('--qr-deps')
args = parser.parse_args()
if args.qr_deps:
    sys.path.insert(0, args.qr_deps)
import zxingcpp

ROOT = Path(__file__).resolve().parents[1]
FLYER = ROOT/'ai-school/flyer'
URL = 'https://office-kit.jp/ai-school/'
pdf_path = FLYER/'officekit-ai-school-20261003.pdf'
reader = PdfReader(pdf_path)
assert len(reader.pages) == 1, 'Must be exactly one page'
page = reader.pages[0]
assert abs(float(page.mediabox.width)*25.4/72 - 210) < 0.1
assert abs(float(page.mediabox.height)*25.4/72 - 297) < 0.1
assert date(2026, 10, 3).weekday() == 5
assert pdf_path.read_bytes() == (ROOT/'output/pdf'/pdf_path.name).read_bytes()

html = (FLYER/'index.html').read_text(encoding='utf-8')
css = (FLYER/'flyer.css').read_text(encoding='utf-8')
def normalize(value):
    return re.sub(r'\s+', '', value)

pdf_text = normalize(page.extract_text())
html_text = normalize(re.sub(r'<[^>]+>', '', html))
for required in ['初心者向け', 'ChatGPT仕事活用講座',
                 'ChatGPTを「知っている」から「仕事で使える」へ。',
                 '2026年10月3日（土）', '10:00〜12:00', '受付開始9:45',
                 'ルーク会議室', '東京都台東区柳橋2-1-11',
                 '浅草橋駅徒歩4分', '蔵前駅徒歩7分', '定員8名',
                 'ノートパソコン・充電器', 'ChatGPTの有料契約は不要です。',
                 '通常価格4,980円（税込）', '初回開催限定モニター価格',
                 '2,980円（税込）', 'アンケートにご協力ください。',
                 '詳しくはこちら・参加申込', 'OfficeKit', URL]:
    assert normalize(required) in pdf_text, f'PDF missing: {required}'
    assert normalize(required) in html_text, f'HTML missing: {required}'
assert 'window.print()' in html
assert '../../officekit_soft_box_horizontal.png' in html
assert '@page { size: A4 portrait; margin: 12mm; }' in css
assert '@media print' in css and '@media screen and (max-width: 793px)' in css
assert '<script src=' not in html and 'googleapis' not in html

# All text stays safely inside the 12mm printable area (0.5mm tolerance).
with pdfplumber.open(pdf_path) as document:
    p = document.pages[0]
    for char in p.chars:
        if char['text'].strip():
            assert char['x0'] >= 11.5*72/25.4, char
            assert char['x1'] <= p.width - 11.5*72/25.4, char
            assert char['top'] >= 11.5*72/25.4, char
            assert char['bottom'] <= p.height - 11.5*72/25.4, char
assert any(font.get_object().get('/FontDescriptor', {}).get('/FontFile2')
           for font in page['/Resources']['/Font'].values()), 'Japanese fonts must be embedded'
logo = Image.open(ROOT/'officekit_soft_box_horizontal.png').convert('RGB')
assert any(image.image.size == logo.size and
           ImageChops.difference(image.image.convert('RGB'), logo).getbbox() is None
           for image in page.images), 'The original OfficeKit logo must be used'
assert any(a.get_object().get('/A', {}).get('/URI') == URL for a in page['/Annots'])

# Decode the actual rendered PDF in color and grayscale at print-like resolutions.
rendered = pdfium.PdfDocument(str(pdf_path))
qa = ROOT/'tmp/pdfs'
qa.mkdir(parents=True, exist_ok=True)
for dpi in (150, 300):
    im = rendered[0].render(scale=dpi/72).to_pil().convert('RGB')
    for mode in ('RGB', 'L'):
        variant = im.convert(mode)
        decoded = zxingcpp.read_barcodes(variant)
        assert [r.text for r in decoded] == [URL], f'QR decode failed: {dpi} dpi {mode}'
    if dpi == 150:
        im.save(qa/'flyer-color.png')
        im.convert('L').save(qa/'flyer-grayscale.png')

# Independently decode the HTML's SVG, including the four-module quiet zone.
svg = ET.parse(FLYER/'qr.svg').getroot()
side = int(svg.attrib['viewBox'].split()[-1])
im = Image.new('RGB', (side*10, side*10), 'white')
draw = ImageDraw.Draw(im)
for rect in svg.findall('.//{http://www.w3.org/2000/svg}g/{http://www.w3.org/2000/svg}rect'):
    x, y = int(rect.attrib['x']), int(rect.attrib['y'])
    assert 4 <= x < side-4 and 4 <= y < side-4
    draw.rectangle((x*10, y*10, (x+1)*10-1, (y+1)*10-1), fill='black')
assert [r.text for r in zxingcpp.read_barcodes(im)] == [URL]
print('AI school flyer tests passed: A4 x 1, content, margins, logo, embedded fonts, PDF/SVG QR (color/grayscale).')
