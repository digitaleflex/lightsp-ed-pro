covers = {
    'loaf-long-animation-frames': ('/blog/loaf.png', 'Illustration LoAF — barres de frames longues à attribuer'),
    'inp-attribution-debug': ('/blog/inp-debug.png', 'Illustration debug INP — loupe sur interaction et phases'),
    'fid-vers-inp-migration': ('/blog/fid.png', 'Illustration migration FID vers INP — nouveaux seuils'),
    'speed-index-tti-utiles': ('/blog/speedindex.png', 'Illustration Speed Index et TTI — jauge de progression labo'),
    'fetchpriority-preload-preconnect': ('/blog/fetchpriority.png', 'Illustration priorités de chargement — hero prioritaire'),
    'bfcache-cache-arriere': ('/blog/bfcache.png', 'Illustration bfcache — retour arrière instantané'),
    'polices-web-performances': ('/blog/polices.png', 'Illustration polices web — WOFF2 stables sans décalage'),
}

p = 'src/lib/blog-p3.ts'
s = open(p, encoding='utf-8').read()
for slug, (url, alt) in covers.items():
    idx = s.find("slug: '%s'" % slug)
    assert idx != -1, slug
    cat = s.find('    category:', idx)
    assert cat != -1, slug
    insert = "    cover: '%s',\n    coverAlt: \"%s\",\n" % (url, alt)
    s = s[:cat] + insert + s[cat:]
open(p, 'w', encoding='utf-8').write(s)
print('covers added:', len(covers))
