import { MetadataRoute } from 'next'
import { getAppUrl } from '@/lib/url'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getAppUrl();

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/applicant/', '/officer/', '/police/', '/admin/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
