import type { MetadataRoute } from 'next'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
 
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.invocly.com'

  const routes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: '2026-07-02',
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date().toISOString().split('T')[0],
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: '2026-07-27',
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: '2026-08-03',
      changeFrequency: 'yearly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: '2026-07-27',
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/refund-pricing-policy`,
      lastModified: '2026-07-27',
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms-of-service`,
      lastModified: '2026-07-27',
      changeFrequency: 'yearly',
      priority: 0.5,
    },
  ]

  const postsDirectory = path.join(process.cwd(), 'app', 'blog', '_posts')
  if (fs.existsSync(postsDirectory)) {
    const filenames = fs.readdirSync(postsDirectory)
    filenames
      .filter((filename) => filename.endsWith('.mdx'))
      .forEach((filename) => {
        const filePath = path.join(postsDirectory, filename)
        const fileContent = fs.readFileSync(filePath, 'utf8')
        const { data } = matter(fileContent)
        const slug = filename.replace('.mdx', '')

        routes.push({
          url: `${baseUrl}/blog/${slug}`,
          lastModified: data.date || new Date().toISOString().split('T')[0],
          changeFrequency: 'weekly',
          priority: 0.6,
        })
      })
  }

  return routes
}
