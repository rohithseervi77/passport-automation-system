import { MetadataRoute } from 'next'
import { getAppUrl } from '@/lib/url'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getAppUrl();

  return [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/track`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/news`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/fee-calculator`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/locate-centre`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/document-advisor`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.75,
    },
    {
      url: `${baseUrl}/help`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.75,
    },
    {
      url: `${baseUrl}/grievance`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/thank-you`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
  ]
}
