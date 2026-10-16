import re, glob, os

s = open('src/lib/blog-p2.ts', encoding='utf-8').read()
slugs = re.findall(r"slug: '([^']+)'", s)
print('slugs:', len(slugs))
for sl in slugs:
    print(' -', sl)
print('sources blocks:', len(re.findall(r'sources: \[', s)))
print('covers:', len(re.findall(r'/blog/\w+\.png', s)))
pngs = sorted(glob.glob('public/blog/*.png'))
print('png files:', len(pngs))
b = open('src/lib/blog.ts', encoding='utf-8').read()
print('P2 refs in blog.ts:', b.count('BLOG_POSTS_P2'))
print('sources field in interface:', 'sources?:' in b)
