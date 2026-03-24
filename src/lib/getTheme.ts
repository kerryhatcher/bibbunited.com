import configPromise from '@payload-config'
import { getPayload } from 'payload'

export async function getThemeMode(): Promise<'community' | 'urgent'> {
  const payload = await getPayload({ config: configPromise })
  const siteTheme = await payload.findGlobal({ slug: 'site-theme' })
  return (siteTheme?.mode as 'community' | 'urgent') || 'community'
}
