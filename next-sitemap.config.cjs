/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://www.bibbunited.com',
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: '/admin/',
      },
    ],
  },
  // Exclude admin and API routes from sitemap
  exclude: ['/admin/*', '/api/*'],
  // Default change frequency and priority
  changefreq: 'weekly',
  priority: 0.7,
}
