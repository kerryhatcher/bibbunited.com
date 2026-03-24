import configPromise from '@payload-config'
import { getPayload } from 'payload'

export async function getNavigation() {
  const payload = await getPayload({ config: configPromise })
  return payload.findGlobal({ slug: 'navigation', depth: 1 })
}
