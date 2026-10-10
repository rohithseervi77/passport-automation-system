import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://passport-automation-system.vercel.app';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/applicant/', '/officer/', '/police/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
