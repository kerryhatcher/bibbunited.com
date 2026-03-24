import { postgresAdapter } from '@payloadcms/db-postgres'
import { seoPlugin } from '@payloadcms/plugin-seo'
import type { GenerateDescription, GenerateTitle, GenerateURL } from '@payloadcms/plugin-seo/types'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Pages } from './collections/Pages'
import { NewsPosts } from './collections/NewsPosts'
import { Media } from './collections/Media'
import { Users } from './collections/Users'
import { Officials } from './collections/Officials'
import { Meetings } from './collections/Meetings'
import { UrgentBanner } from './globals/UrgentBanner'
import { SiteTheme } from './globals/SiteTheme'
import { Navigation } from './globals/Navigation'
import { Homepage } from './globals/Homepage'

import type { Page, NewsPost } from './payload-types'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const generateTitle: GenerateTitle<Page | NewsPost> = ({ doc }) =>
  doc?.title ? `${doc.title} | BIBB United` : 'BIBB United'

const generateDescription: GenerateDescription<Page | NewsPost> = ({ doc }) =>
  doc?.title ? `${doc.title} - BIBB United civic advocacy` : ''

const generateURL: GenerateURL<Page | NewsPost> = ({ doc, collectionSlug }) => {
  const slug = (doc as any)?.slug || ''
  if (collectionSlug === 'news-posts') return `https://www.bibbunited.com/news/${slug}`
  return `https://www.bibbunited.com/${slug}`
}

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Pages, NewsPosts, Media, Users, Officials, Meetings],
  globals: [UrgentBanner, SiteTheme, Navigation, Homepage],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
  }),
  sharp,
  plugins: [
    seoPlugin({
      collections: ['pages', 'news-posts'],
      uploadsCollection: 'media',
      generateTitle,
      generateDescription,
      generateURL,
      tabbedUI: true,
    }),
  ],
})
