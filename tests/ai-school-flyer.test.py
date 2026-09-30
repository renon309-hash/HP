"""The retired event flyer must not remain publicly available as current recruitment."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FLYER = ROOT / 'ai-school' / 'flyer'
html = (FLYER / 'index.html').read_text(encoding='utf-8')

assert '次回開催を準備しています' in html
assert '<meta name="robots" content="noindex, nofollow">' in html
assert '<meta http-equiv="refresh" content="0; url=../">' in html
assert '<link rel="canonical" href="https://office-kit.jp/ai-school/">' in html
assert 'href="../"' in html

for retired_term in (
    '2026年10月3日', '2026-10-03', '10/3', '10:00', '9:45',
    'ルーク会議室', '2,980円', '2980', '4,980円', '4980'
):
    assert retired_term not in html, retired_term

assert not (FLYER / 'officekit-ai-school-20261003.pdf').exists()

print('AI school retired-flyer checks passed.')
