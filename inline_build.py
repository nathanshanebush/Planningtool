import os, re

dist = '/home/user/Planningtool/dist'

# Read the dist index.html
with open(os.path.join(dist, 'index.html')) as f:
    html = f.read()

# Find and inline CSS
for m in re.finditer(r'<link[^>]+href="(/assets/[^"]+\.css)"[^>]*>', html):
    path = os.path.join(dist, m.group(1).lstrip('/'))
    with open(path) as f:
        css = f.read()
    html = html.replace(m.group(0), f'<style>{css}</style>')

# Find and inline JS
for m in re.finditer(r'<script[^>]+src="(/assets/[^"]+\.js)"[^>]*></script>', html):
    path = os.path.join(dist, m.group(1).lstrip('/'))
    with open(path) as f:
        js = f.read()
    html = html.replace(m.group(0), f'<script type="module">{js}</script>')

out = '/home/user/Planningtool/snapscale-campaign-board.html'
with open(out, 'w') as f:
    f.write(html)

size = os.path.getsize(out)
print(f"Written {out} ({size/1024:.1f} KB)")
