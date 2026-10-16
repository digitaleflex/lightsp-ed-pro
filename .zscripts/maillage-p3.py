adds = {
    'guide-complet-core-web-vitals-2026': ['loaf-long-animation-frames'],
    'inp-interaction-to-next-paint-reactivite': ['inp-attribution-debug', 'fid-vers-inp-migration'],
    'lcp-largest-contentful-paint-optimisation': ['fetchpriority-preload-preconnect'],
    'fcp-first-contentful-paint-rapidite': ['fetchpriority-preload-preconnect', 'polices-web-performances'],
    'cls-cumulative-layout-shift-zero': ['polices-web-performances'],
    'tbt-total-blocking-time-javascript': ['loaf-long-animation-frames'],
    'field-data-vs-lab-data-crux-lighthouse': ['bfcache-cache-arriere'],
    'core-web-vitals-seo-conversions-optimisation': ['speed-index-tti-utiles'],
}

p = 'src/lib/blog.ts'
s = open(p, encoding='utf-8').read()
for slug, new_slugs in adds.items():
    idx = s.find("slug: '%s'" % slug)
    assert idx != -1, slug
    rel = s.find('related: [', idx)
    close = s.find(']', rel)
    block = s[rel:close]
    for ns in new_slugs:
        if ns not in block:
            block += "\n      '%s'," % ns
    s = s[:rel] + block + s[close:]
open(p, 'w', encoding='utf-8').write(s)
print('maillage P3 OK')
