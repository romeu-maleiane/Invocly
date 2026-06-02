import type { MetadataRoute } from 'next'
 
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://www.invocly.com/',
      lastModified: '2026-06-02',
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: 'https://www.invocly.com/privacy-policy',
      lastModified: '2026-06-02',
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: 'https://www.invocly.com/refund-pricing-policy',
      lastModified: '2026-06-02',
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: 'https://www.invocly.com/terms-of-service',
      lastModified: '2026-06-02',
      changeFrequency: 'yearly',
      priority: 0.5,
    },
  ]
}