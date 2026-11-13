"""Kurgu Kütüphanesi: kurgu.html is the page (published as a claude.ai Artifact, which adds the
document skeleton); index.html wraps it for opening from the vault in a browser.
Run: python3 -I build.py"""
import pathlib

R = pathlib.Path(__file__).resolve().parent
page = (R / "kurgu.html").read_text(encoding="utf-8")
(R / "index.html").write_text(
    '<!doctype html>\n<html lang="tr">\n<head>\n<meta charset="utf-8">\n'
    '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
    "</head>\n<body>\n" + page + "\n</body>\n</html>\n", encoding="utf-8")
print("index.html", len(page), "bytes of page")
