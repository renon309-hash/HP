"""Build the print PDF and direct-URL SVG QR; no remote services are used.

Requires reportlab and the local Meiryo fonts (override via --font/--bold-font).
Run from any directory; output is relative to this repository.
"""
from pathlib import Path
import argparse
import shutil
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor, black, white
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.graphics.barcode.qr import QrCodeWidget

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / 'ai-school/flyer'
URL = 'https://office-kit.jp/ai-school/'
PDF_NAME = 'officekit-ai-school-20261003.pdf'
parser = argparse.ArgumentParser()
parser.add_argument('--font', default='C:/Windows/Fonts/meiryo.ttc')
parser.add_argument('--bold-font', default='C:/Windows/Fonts/meiryob.ttc')
args = parser.parse_args()
pdfmetrics.registerFont(TTFont('JP', args.font))
pdfmetrics.registerFont(TTFont('JP-Bold', args.bold_font))

DEST.mkdir(parents=True, exist_ok=True)
output = ROOT / 'output/pdf'
output.mkdir(parents=True, exist_ok=True)
pdf = output / PDF_NAME
c = canvas.Canvas(str(pdf), pagesize=A4, pageCompression=1)
c.setTitle('OfficeKit｜2026年10月3日 初心者向け ChatGPT仕事活用講座')
c.setAuthor('OfficeKit')
c.setSubject('A4片面・印刷配布用チラシ')
BLUE, ORANGE, INK, LINE = map(HexColor, ['#1c5c9e', '#ff8c00', '#334155', '#e2e8f0'])
H = A4[1]

def text(x, y, value, size=10, bold=False, color=INK):
    """Coordinates in mm from top-left; y is the text baseline."""
    c.setFillColor(color)
    c.setFont('JP-Bold' if bold else 'JP', size)
    c.drawString(x * mm, H - y * mm, value)

def line(x1, y1, x2, y2, color=LINE, width=0.6):
    c.setStrokeColor(color)
    c.setLineWidth(width)
    c.line(x1*mm, H-y1*mm, x2*mm, H-y2*mm)

def lines(x, y, items, size=10, leading=5.8, **kwargs):
    for index, value in enumerate(items):
        text(x, y + index*leading, value, size, **kwargs)

# Brand and main proposition.
c.drawImage(str(ROOT/'officekit_soft_box_horizontal.png'), 12*mm, H-23.85*mm,
            width=38*mm, height=11.85*mm, mask='auto')
text(145, 20, '浅草・蔵前 AI仕事活用教室', 10, color=BLUE)
line(12, 27, 198, 27)
text(12, 36, '初心者向け', 12, True, BLUE)
text(12, 49, 'ChatGPT仕事活用講座', 27, True, BLUE)
lines(12, 61, ['ChatGPTを「知っている」から', '「仕事で使える」へ。'], 20, 10, bold=True)
lines(12, 81, ['個人事業主・中小企業経営者・事務担当者向け。',
                '仕事ですぐ使えるChatGPT活用方法を、',
                '実際にパソコンを操作しながら学ぶ2時間の初心者講座です。'], 10.5, 5.9)

# Two compact, readable lists.
text(12, 105, 'こんな方におすすめ', 12, True)
text(112, 105, '当日学ぶ内容', 12, True)
line(12, 108, 99, 108, BLUE, 1.5)
line(112, 108, 198, 108, BLUE, 1.5)
line(105, 100, 105, 160)
lines(12, 115, ['・ChatGPTを仕事で使ってみたい',
                '・メールや文章作成に時間がかかる',
                '・ExcelについてAIに相談してみたい',
                '・資料や長い文章を効率よく整理したい',
                '・自分の仕事で何をAI化できるか知りたい',
                '・AIに興味はあるが何から始めれば',
                '  いいか分からない'], 10, 5.8)
text(12, 160, 'パソコンやAIに詳しくない方でも大丈夫です。', 9.5, True)
lines(112, 115, ['・ChatGPTの基本', '・メール・文章作成', '・情報の整理・要約',
                 '・ExcelについてAIに相談する方法', '・PDF・資料の活用',
                 '・自分の仕事でAIを使える場面を考える'], 10, 5.8)
lines(112, 156, ['専門的なプログラミングやAI開発を', '学ぶ講座ではありません。'], 9, 5)

# Event and price. No colored fills: clear in monochrome, low ink usage.
c.setStrokeColor(BLUE)
c.setLineWidth(1.2)
c.rect(12*mm, H-233*mm, 186*mm, 66*mm, fill=0, stroke=1)
text(16, 178, '2026年10月3日（土）', 19, True, BLUE)
text(148, 178, '10:00〜12:00', 18, True, BLUE)
text(172, 185, '受付開始 9:45', 9)
line(12, 188, 198, 188)
text(16, 197, 'ルーク会議室', 13, True)
text(16, 204, '東京都台東区柳橋2-1-11', 10)
text(16, 211, '浅草橋駅 徒歩4分 ／ 蔵前駅 徒歩7分', 9.5, True)
text(16, 218, '定員 8名', 10, True)
text(16, 224, '持ち物：ノートパソコン・充電器', 10)
text(16, 230, 'ChatGPTの有料契約は不要です。', 9)
line(110, 192, 110, 230)
text(115, 196, '通常価格 4,980円（税込）', 9)
line(115 + pdfmetrics.stringWidth('通常価格 ', 'JP', 9)/mm, 194.8,
     115 + pdfmetrics.stringWidth('通常価格 4,980円（税込）', 'JP', 9)/mm, 194.8, INK, 0.6)
text(115, 203, '初回開催限定 モニター価格', 11, True)
line(115, 205, 181, 205, ORANGE, 1.5)
text(115, 220, '2,980', 43, True, BLUE)
text(171, 220, '円（税込）', 10, True, BLUE)
lines(115, 226, ['初回モニター開催のため、講座終了後の',
                 '簡単なアンケートにご協力ください。'], 9, 4.8)

# Direct QR, 4-module quiet zone, vector black modules.
q = QrCodeWidget(URL, barLevel='M')
q.qr.make()
count = q.qr.moduleCount
matrix = q.qr.modules
total = count + 8
rects = ''.join(f'<rect x="{col+4}" y="{row+4}" width="1" height="1"/>'
                for row in range(count) for col in range(count) if matrix[row][col])
(DEST/'qr.svg').write_text(
    f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {total} {total}" '
    f'role="img" aria-label="{URL}" shape-rendering="crispEdges">'
    f'<rect width="{total}" height="{total}" fill="white"/>'
    f'<g fill="black">{rects}</g></svg>\n', encoding='utf-8')
qr_x, qr_y, qr_size = 148, 243, 35
module = qr_size / total
c.setFillColor(white)
c.rect(qr_x*mm, H-(qr_y+qr_size)*mm, qr_size*mm, qr_size*mm, fill=1, stroke=0)
c.setFillColor(black)
for row in range(count):
    for col in range(count):
        if matrix[row][col]:
            c.rect((qr_x+(col+4)*module)*mm, H-(qr_y+(row+5)*module)*mm,
                   module*mm, module*mm, fill=1, stroke=0)
text(140, 241, '詳しくはこちら・参加申込', 11, True, BLUE)
text(140, 282, URL, 8.5)
c.linkURL(URL, (qr_x*mm, H-(qr_y+qr_size)*mm, (qr_x+qr_size)*mm, H-qr_y*mm), relative=0)
text(12, 250, 'OfficeKit', 13, True, BLUE)
lines(12, 259, ['中小企業・個人事業主向けに、',
                'AI・ITを活用した業務効率化を支援しています。'], 9.5, 5.7)
lines(12, 273, ['「難しいIT」ではなく、日々の仕事を少し楽にするための',
                'IT活用を重視しています。'], 9.5, 5.7)
c.showPage()
c.save()
shutil.copyfile(pdf, DEST/PDF_NAME)
print(f'Built {pdf} and flyer/qr.svg; QR target: {URL}')
