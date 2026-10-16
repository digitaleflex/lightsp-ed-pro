import re

p = 'src/lib/blog-p2.ts'
s = open(p, encoding='utf-8').read()
covers = {
    'wordpress-core-web-vitals-sans-tout-casser': ('/blog/wordpress.png', 'Illustration WordPress au vert — fenêtre de site et plan en 5 étapes'),
    'nextjs-core-web-vitals-app-router': ('/blog/nextjs.png', 'Illustration Next.js App Router — triangle et optimisation au vert'),
    'speculation-rules-navigation-instantanee': ('/blog/speculation.png', 'Illustration Speculation Rules — pages pré-rendues et navigation instantanée'),
    'images-avif-srcset-lazy-loading': ('/blog/images.png', 'Illustration images web — compression AVIF et poids divisé'),
    'rum-web-vitals-20-minutes': ('/blog/rum.png', 'Illustration RUM — signal de mesures terrain en direct'),
    'etude-cas-lcp-fiche-produit': ('/blog/cas.png', 'Illustration étude de cas — LCP de 4,1 s à 1,9 s et conversion en hausse'),
}
for slug, (url, alt) in covers.items():
    idx = s.find("slug: '%s'" % slug)
    assert idx != -1, slug
    cat = s.find('    category:', idx)
    assert cat != -1, slug
    insert = "    cover: '%s',\n    coverAlt: \"%s\",\n" % (url, alt)
    s = s[:cat] + insert + s[cat:]
open(p, 'w', encoding='utf-8').write(s)
print('covers added:', len(covers))
