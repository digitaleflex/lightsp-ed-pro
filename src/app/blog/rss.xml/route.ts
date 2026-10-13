import { BLOG_POSTS } from '@/lib/blog'
import { canonical } from '@/lib/site'

export const dynamic = 'force-static'

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/** Flux RSS 2.0 du blog : /blog/rss.xml */
export async function GET() {
  const items = BLOG_POSTS.map((p) => {
    const url = canonical(`/blog/${p.slug}`)
    return `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapeXml(p.excerpt)}</description>
      <pubDate>${new Date(p.date + 'T00:00:00').toUTCString()}</pubDate>
      <category>${escapeXml(p.category)}</category>
      ${p.metric ? `<category>${escapeXml(p.metric)}</category>` : ''}
      <enclosure url="${canonical(p.cover)}" type="image/png" />
    </item>`
  }).join('\n')

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Blog Vélocita — Core Web Vitals</title>
    <link>${canonical('/blog')}</link>
    <description>Les métriques de performance expliquées simplement, avec leurs seuils de référence Google.</description>
    <language>fr-FR</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${canonical('/blog/rss.xml')}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': `public, max-age=3600, s-maxage=3600`,
    },
  })
}
