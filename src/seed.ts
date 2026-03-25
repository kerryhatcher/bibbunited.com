import type { Payload } from 'payload'
import type sharp from 'sharp'
import { getPayload } from 'payload'
import config from '@payload-config'

// Lexical rich text minimal structure
const makeRichText = (text: string) => ({
  root: {
    type: 'root',
    children: [
      {
        type: 'paragraph',
        children: [
          {
            type: 'text',
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text,
            version: 1,
          },
        ],
        direction: 'ltr' as const,
        format: '' as const,
        indent: 0,
        textFormat: 0,
        version: 1,
      },
    ],
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    version: 1,
  },
})

/**
 * Create a colorful labeled seed image using sharp.
 * Uses find-or-create by alt text for idempotency.
 */
async function createSeedImage(
  payload: Payload,
  sharpFn: typeof sharp,
  name: string,
  label: string,
  bg: { r: number; g: number; b: number },
  alt: string,
) {
  const existing = await payload.find({
    collection: 'media',
    where: { alt: { equals: alt } },
    limit: 1,
    overrideAccess: true,
  })
  if (existing.docs.length > 0) {
    console.log('Using existing media:', alt)
    return existing.docs[0]
  }

  const svgOverlay = Buffer.from(
    `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
    <text x="50%" y="50%" font-family="Arial, Helvetica, sans-serif" font-size="72" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="central">${label}</text>
  </svg>`,
  )

  const imageBuffer = await sharpFn({
    create: { width: 1200, height: 630, channels: 3, background: bg },
  })
    .composite([{ input: svgOverlay, top: 0, left: 0 }])
    .jpeg({ quality: 85 })
    .toBuffer()

  const media = await payload.create({
    collection: 'media',
    data: { alt },
    file: {
      data: imageBuffer,
      name: `${name}.jpg`,
      mimetype: 'image/jpeg',
      size: imageBuffer.length,
    },
    overrideAccess: true,
  })
  console.log('Created media:', alt)
  return media
}

async function seed() {
  const payload = await getPayload({ config })
  const { default: sharpFn } = await import('sharp')

  console.log('Seeding database...')

  // ──────────────────────────────────────────────
  // 1. User -- find-or-create, then set displayName (D-13)
  // ──────────────────────────────────────────────
  let user
  const existingUsers = await payload.find({
    collection: 'users',
    limit: 1,
    overrideAccess: true,
  })
  if (existingUsers.docs.length > 0) {
    user = existingUsers.docs[0]
    console.log('Using existing user:', user.email)
  } else {
    user = await payload.create({
      collection: 'users',
      data: {
        email: 'editor@bibbunited.com',
        password: 'seed-password-change-me',
      },
      overrideAccess: true,
    })
    console.log('Created user:', user.email)
  }

  // Update displayName for the seed user
  // Note: displayName field exists on Users collection (added in 09-01) but
  // payload-types may not be regenerated yet, so we cast data to bypass type check
  await payload.update({
    collection: 'users',
    id: user.id,
    data: { displayName: 'BIBB United Staff' } as Record<string, unknown>,
    overrideAccess: true,
  })
  console.log('Set user displayName to BIBB United Staff')

  // ──────────────────────────────────────────────
  // 2. Media items -- 6 colorful labeled topic images (D-01, D-04, D-05)
  // ──────────────────────────────────────────────
  const seedImages = [
    {
      name: 'seed-budget',
      label: 'Budget',
      bg: { r: 220, g: 50, b: 50 },
      alt: 'School district budget overview with financial charts',
    },
    {
      name: 'seed-safety',
      label: 'Safety',
      bg: { r: 50, g: 130, b: 200 },
      alt: 'School safety measures and campus security initiatives',
    },
    {
      name: 'seed-schools',
      label: 'Schools',
      bg: { r: 34, g: 139, b: 34 },
      alt: 'BIBB County school buildings and educational facilities',
    },
    {
      name: 'seed-community',
      label: 'Community',
      bg: { r: 200, g: 160, b: 30 },
      alt: 'BIBB community members at a civic engagement event',
    },
    {
      name: 'seed-board',
      label: 'Board Meeting',
      bg: { r: 150, g: 50, b: 180 },
      alt: 'BIBB County Board of Education meeting in session',
    },
    {
      name: 'seed-spotlight',
      label: 'Spotlight',
      bg: { r: 220, g: 120, b: 30 },
      alt: 'Featured news spotlight highlighting local school issues',
    },
  ] as const

  const mediaItems: Record<string, Awaited<ReturnType<typeof createSeedImage>>> = {}
  for (const img of seedImages) {
    mediaItems[img.name] = await createSeedImage(
      payload,
      sharpFn,
      img.name,
      img.label,
      img.bg,
      img.alt,
    )
  }

  // ──────────────────────────────────────────────
  // 2b. OG Default Image -- branded 1200x630 PNG (D-07, D-08, SEO-09)
  // ──────────────────────────────────────────────
  const ogAlt = 'BIBB United default Open Graph sharing image'
  const existingOg = await payload.find({
    collection: 'media',
    where: { alt: { equals: ogAlt } },
    limit: 1,
    overrideAccess: true,
  })

  if (existingOg.docs.length > 0) {
    console.log('Using existing OG default image')
  } else {
    const ogSvg = Buffer.from(
      `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="622" width="1200" height="8" fill="#D4A843"/>
    <text x="50%" y="40%" font-family="Arial, Helvetica, sans-serif" font-size="64" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="central">BIBB UNITED</text>
    <text x="50%" y="58%" font-family="Arial, Helvetica, sans-serif" font-size="28" fill="#CCCCCC" text-anchor="middle" dominant-baseline="central">Civic Advocacy for BIBB County</text>
  </svg>`,
    )

    const ogBuffer = await sharpFn({
      create: { width: 1200, height: 630, channels: 3, background: { r: 27, g: 42, b: 74 } },
    })
      .composite([{ input: ogSvg, top: 0, left: 0 }])
      .png()
      .toBuffer()

    await payload.create({
      collection: 'media',
      data: { alt: ogAlt },
      file: {
        data: ogBuffer,
        name: 'og-default.png',
        mimetype: 'image/png',
        size: ogBuffer.length,
      },
      overrideAccess: true,
    })
    console.log('Created OG default image')
  }

  // ──────────────────────────────────────────────
  // 3. Pages -- About, Get Involved, Resources
  // ──────────────────────────────────────────────
  const pagesData = [
    {
      title: 'About',
      content: makeRichText(
        'BIBB United is a civic advocacy organization dedicated to transparency and accountability in the BIBB County School District. We believe every community member deserves clear, accessible information about how their schools are governed.',
      ),
    },
    {
      title: 'Get Involved',
      content: makeRichText(
        'Your voice matters in shaping the future of BIBB County schools. Attend board meetings, contact officials, and stay informed about the decisions that affect our children.',
      ),
    },
    {
      title: 'Resources',
      content: makeRichText(
        'Find links to official board documents, budget reports, and meeting minutes. Stay informed with primary sources.',
      ),
    },
  ]

  const pageRefs: Record<string, { id: number; slug: string }> = {}
  for (const pageData of pagesData) {
    const existing = await payload.find({
      collection: 'pages',
      where: { title: { equals: pageData.title } },
      limit: 1,
      overrideAccess: true,
    })
    if (existing.docs.length === 0) {
      const created = await payload.create({
        collection: 'pages',
        data: { ...pageData, _status: 'published' },
        overrideAccess: true,
      })
      pageRefs[pageData.title] = { id: created.id as number, slug: created.slug || '' }
      console.log('Created page:', created.slug)
    } else {
      const doc = existing.docs[0]
      pageRefs[pageData.title] = { id: doc.id as number, slug: doc.slug || '' }
      console.log('Page already exists:', doc.slug)
    }
  }

  // ──────────────────────────────────────────────
  // 4. News Posts -- 3 posts with different featured images (D-01)
  // ──────────────────────────────────────────────
  const newsPostsData = [
    {
      title: 'School Board Approves 2026-2027 Budget',
      publishDate: new Date('2026-03-15').toISOString(),
      body: makeRichText(
        'The BIBB County Board of Education voted 5-2 to approve the $180 million operating budget for the 2026-2027 school year. Key allocations include increased funding for teacher retention bonuses and facility maintenance.',
      ),
      featuredImage: mediaItems['seed-budget'].id as number,
    },
    {
      title: 'Community Forum on School Safety Draws Record Attendance',
      publishDate: new Date('2026-03-10').toISOString(),
      body: makeRichText(
        'Over 300 community members packed the Central High School auditorium for a forum on school safety improvements. Parents, teachers, and students shared perspectives on proposed security upgrades and mental health resources.',
      ),
      featuredImage: mediaItems['seed-safety'].id as number,
    },
    {
      title: 'New Superintendent Search Committee Formed',
      publishDate: new Date('2026-03-01').toISOString(),
      body: makeRichText(
        'The Board of Education has appointed a seven-member search committee to find the next superintendent of BIBB County Schools. The committee includes two parents, two teachers, one principal, and two community members.',
      ),
      featuredImage: mediaItems['seed-community'].id as number,
    },
  ]

  const newsPostDocs: { id: number; slug: string }[] = []
  for (const postData of newsPostsData) {
    const existing = await payload.find({
      collection: 'news-posts',
      where: { title: { equals: postData.title } },
      limit: 1,
      overrideAccess: true,
    })
    if (existing.docs.length === 0) {
      const created = await payload.create({
        collection: 'news-posts',
        data: {
          ...postData,
          author: user.id,
          _status: 'published',
        },
        overrideAccess: true,
      })
      newsPostDocs.push({ id: created.id as number, slug: created.slug || '' })
      console.log('Created news post:', created.slug)
    } else {
      const doc = existing.docs[0]
      // Update featuredImage if it changed (e.g. new colorful seed images)
      if (doc.featuredImage !== postData.featuredImage) {
        await payload.update({
          collection: 'news-posts',
          id: doc.id,
          data: { featuredImage: postData.featuredImage, author: user.id },
          overrideAccess: true,
        })
        console.log('Updated news post featured image:', doc.slug)
      } else {
        console.log('News post already exists:', doc.slug)
      }
      newsPostDocs.push({ id: doc.id as number, slug: doc.slug || '' })
    }
  }

  // ──────────────────────────────────────────────
  // 5. Officials (D-04)
  // ──────────────────────────────────────────────
  const officialsData = [
    {
      name: 'Dr. Sarah Mitchell',
      role: 'Board Chair',
      body: 'board-of-education' as const,
      email: 's.mitchell@bibbschools.gov',
      phone: '(478) 555-0101',
      sortOrder: 1,
    },
    {
      name: 'James Thompson',
      role: 'Vice Chair',
      body: 'board-of-education' as const,
      email: 'j.thompson@bibbschools.gov',
      phone: '(478) 555-0102',
      sortOrder: 2,
    },
    {
      name: 'Maria Rodriguez',
      role: 'Board Member',
      body: 'board-of-education' as const,
      email: 'm.rodriguez@bibbschools.gov',
      phone: '(478) 555-0103',
      sortOrder: 3,
    },
    {
      name: 'Robert Chen',
      role: 'District 2 Representative',
      body: 'county-commission' as const,
      email: 'r.chen@bibbcounty.gov',
      phone: '(478) 555-0201',
      sortOrder: 1,
    },
  ]

  for (const officialData of officialsData) {
    const existing = await payload.find({
      collection: 'officials',
      where: { name: { equals: officialData.name } },
      limit: 1,
      overrideAccess: true,
    })
    if (existing.docs.length === 0) {
      await payload.create({
        collection: 'officials',
        data: officialData,
        overrideAccess: true,
      })
      console.log('Created official:', officialData.name)
    } else {
      console.log('Official already exists:', officialData.name)
    }
  }

  // ──────────────────────────────────────────────
  // 6. Meetings (D-04) -- dates relative to now for always-upcoming
  // ──────────────────────────────────────────────
  const now = new Date()
  const meetingsData = [
    {
      title: 'Regular Board Meeting',
      date: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      time: '6:00 PM',
      location: 'BIBB County Board of Education, 484 Mulberry St',
      notes: 'Public comment period at 6:30 PM',
    },
    {
      title: 'Budget Work Session',
      date: new Date(now.getTime() + 28 * 24 * 60 * 60 * 1000).toISOString(),
      time: '5:30 PM',
      location: 'Central High School Auditorium, 2155 Napier Ave',
      notes: 'Special session to review FY2027 budget proposals',
    },
    {
      title: 'Curriculum Committee Meeting',
      date: new Date(now.getTime() + 42 * 24 * 60 * 60 * 1000).toISOString(),
      time: '4:00 PM',
      location: 'BIBB County Board of Education, 484 Mulberry St',
      notes: '',
    },
  ]

  for (const meetingData of meetingsData) {
    const existing = await payload.find({
      collection: 'meetings',
      where: { title: { equals: meetingData.title } },
      limit: 1,
      overrideAccess: true,
    })
    if (existing.docs.length === 0) {
      await payload.create({
        collection: 'meetings',
        data: meetingData,
        overrideAccess: true,
      })
      console.log('Created meeting:', meetingData.title)
    } else {
      console.log('Meeting already exists:', meetingData.title)
    }
  }

  // ──────────────────────────────────────────────
  // 7. Navigation global (D-02) -- populate with pages and routes
  // ──────────────────────────────────────────────
  const aboutPage = pageRefs['About']
  const getInvolvedPage = pageRefs['Get Involved']
  const resourcesPage = pageRefs['Resources']

  await payload.updateGlobal({
    slug: 'navigation',
    data: {
      items: [
        { label: 'News', type: 'external', url: '/news' },
        { label: 'About', type: 'internal', page: { relationTo: 'pages', value: aboutPage.id } },
        {
          label: 'Take Action',
          type: 'external',
          url: '#',
          children: [
            {
              label: 'Get Involved',
              type: 'internal',
              page: { relationTo: 'pages', value: getInvolvedPage.id },
            },
            { label: 'Contact Officials', type: 'external', url: '/contact-officials' },
            { label: 'Meetings', type: 'external', url: '/meetings' },
          ],
        },
        {
          label: 'Resources',
          type: 'internal',
          page: { relationTo: 'pages', value: resourcesPage.id },
        },
      ],
    },
    overrideAccess: true,
  })
  console.log('Updated navigation global')

  // ──────────────────────────────────────────────
  // 8. Homepage global (D-03, D-06) -- hero spotlight + topic callouts
  // ──────────────────────────────────────────────
  await payload.updateGlobal({
    slug: 'homepage',
    data: {
      heroSpotlight: newsPostDocs.map((post) => ({ story: post.id })),
      topicCallouts: [
        {
          title: 'School Budget',
          blurb: 'Track how $180M is allocated across BIBB County schools',
          icon: 'dollar-sign',
          link: aboutPage.id,
        },
        {
          title: 'Get Involved',
          blurb: 'Attend meetings, contact officials, and make your voice heard',
          icon: 'megaphone',
          link: getInvolvedPage.id,
        },
        {
          title: 'Board Meetings',
          blurb: 'Know when decisions are made and show up to have your say',
          icon: 'calendar',
          link: resourcesPage.id,
        },
      ],
    },
    overrideAccess: true,
  })
  console.log('Updated homepage global')

  console.log('Seeding complete!')
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed error:', err)
  process.exit(1)
})
