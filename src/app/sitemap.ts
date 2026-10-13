import { SECTIONS } from '@/lib/sections'
import { BLOG_POSTS } from '@/lib/blog'
import { SITE_URL } from '@/lib/site'
import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/status`, lastModified: now, changeFrequency: 'hourly', priority: 0.4 },
  ]
  const sectionRoutes: MetadataRoute.Sitemap = SECTIONS.map((s) => ({
    url: `${SITE_URL}/${s.slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: s.group === 'Produit' ? 0.9 : 0.7,
  }))
  const blogRoutes: MetadataRoute.Sitemap = BLOG_POSTS.map((p) => ({
    url: `${SITE_URL}/blog/${p.slug}`,
    lastModified: new Date(p.updated),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))
  return [...staticRoutes, ...sectionRoutes, ...blogRoutes]
}
