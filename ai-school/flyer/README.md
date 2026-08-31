# OfficeKit AI仕事活用講座 チラシ

- 公開HTML: https://office-kit.jp/ai-school/flyer/
- 印刷PDF: officekit-ai-school-20261003.pdf
- QR遷移先: https://office-kit.jp/ai-school/ （直接エンコード・追跡なし）
- A4縦・片面。印刷用PDFを倍率100%で印刷する方法を推奨。
- HTML印刷はA4縦、倍率100%、ヘッダーとフッターをオフ。余白はCSS指定12mm。
- HTMLはスマートフォンでは縦並び表示、印刷時は2列のA4レイアウト。
- 既存ロゴとブランドカラーを再利用。既存のLP・フォーム・決済には変更なし。

## 再生成と検証

`scripts/build-ai-school-flyer.py` はReportLabで日本語フォントを埋め込んだPDFとQR SVGを生成します。
既定フォントはWindowsのMeiryo。別環境では `--font` と `--bold-font` で互換日本語TTFを指定してください。
PDFは `output/pdf/` に生成後、このディレクトリへ公開用コピーを配置します。
HTML/CSSとPDF生成スクリプトは同じ内容を持つ別レイアウトなので、修正時は両方を更新し、テストと目視確認を行ってください。

```text
python scripts/build-ai-school-flyer.py
python tests/ai-school-flyer.test.py
node tests/ai-school.test.mjs
node tests/ai-school-receipt.test.mjs
```

PDFテストの依存: pypdf, pdfplumber, pypdfium2, Pillow, zxing-cpp。
QRライブラリを別フォルダーへ入れた場合は `--qr-deps PATH` を付けます。
テストはPDF1ページ、A4寸法、必要情報、余白、ロゴ一致、日本語フォント埋込、
カラー・白黒のPDF画像およびSVGのQR読み取りを検証します。
紙への印刷・スマートフォン実機による読み取りは配布前に別途確認してください。
