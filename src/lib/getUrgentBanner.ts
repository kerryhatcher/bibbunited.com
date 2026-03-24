import configPromise from '@payload-config'
import { getPayload } from 'payload'

export async function getUrgentBanner() {
  const payload = await getPayload({ config: configPromise })
  return payload.findGlobal({ slug: 'urgent-banner' })
}
