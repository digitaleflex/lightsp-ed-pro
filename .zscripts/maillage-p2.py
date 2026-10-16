import re

p = 'src/lib/blog.ts'
s = open(p, encoding='utf-8').read()

# slug du post -> nouveau slug à ajouter dans son `related: [...]`
adds = {
    'guide-complet-core-web-vitals-2026': ['wordpress-core-web-vitals-sans-tout-casser'],
    'lcp-largest-contentful-paint-optimisation': ['images-avif-srcset-lazy-loading', 'wordpress-core-web-vitals-sans-tout-casser'],
    'cls-cumulative-layout-shift-zero': ['images-avif-srcset-lazy-loading'],
    'inp-interaction-to-next-paint-reactivite': ['rum-web-vitals-20-minutes'],
    'fcp-first-contentful-paint-rapidite': ['speculation-rules-navigation-instantanee'],
    'core-web-vitals-seo-conversions-optimisation': ['etude-cas-lcp-fiche-produit', 'wordpress-core-web-vitals-sans-tout-casser'],
    'field-data-vs-lab-data-crux-lighthouse': ['rum-web-vitals-20-minutes'],
    'tbt-total-blocking-time-javascript': ['nextjs-core-web-vitals-app-router'],
}

for slug, new_slugs in adds.items():
    idx = s.find("slug: '%s'" % slug)
    assert idx != -1, slug
    rel = s.find('related: [', idx)
    assert rel != -1, slug
    close = s.find(']', rel)
    block = s[rel:close]
    for ns in new_slugs:
        if ns not in block:
            block += "\n      '%s'," % ns
    s = s[:rel] + block + s[close:]

open(p, 'w', encoding='utf-8').write(s)
print('maillage OK')
