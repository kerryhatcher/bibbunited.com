import configPromise from '@payload-config'
import { getPayload } from 'payload'

export async function getHomepage() {
  const payload = await getPayload({ config: configPromise })
  return payload.findGlobal({ slug: 'homepage', depth: 2 })
}
