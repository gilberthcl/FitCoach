import io, sys
d = io.open('index.html', encoding='utf-8').read()
o = '<div class="weight-mo<div class="weight-modal" id="resume-modal">'
n = '<div class="weight-modal" id="resume-modal">'
if o not in d: sys.exit('ABORT: malformed-div anchor missing (already fixed or not v7)')
d = d.replace(o, n, 1)
if "var APP_VERSION = 'v7';" not in d: sys.exit('ABORT: version anchor missing')
d = d.replace("var APP_VERSION = 'v7';", "var APP_VERSION = 'v8';", 1)
io.open('index.html','w',encoding='utf-8').write(d)
sw = io.open('sw.js',encoding='utf-8').read().replace("const CACHE = 'fitcoach-v7';","const CACHE = 'fitcoach-v8';",1)
io.open('sw.js','w',encoding='utf-8').write(sw)
print('OK: v8 applied')
