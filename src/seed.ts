import type { Payload } from 'payload'
import type sharp from 'sharp'
import { getPayload } from 'payload'
import config from '@payload-config'

// Lexical rich text minimal structure -- single paragraph
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

// Lexical rich text -- multiple paragraphs
const makeMultiParagraphRichText = (paragraphs: string[]) => ({
  root: {
    type: 'root',
    children: paragraphs.map((text) => ({
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
    })),
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    version: 1,
  },
})

/**
 * Download an image from Unsplash and create a Payload media item.
 * Uses find-or-create by alt text for idempotency.
 * Falls back to a sharp-generated placeholder if the download fails.
 */
async function downloadUnsplashImage(
  payload: Payload,
  sharpFn: typeof sharp,
  url: string,
  filename: string,
  alt: string,
  ctx: { context: { disableRevalidate: boolean } },
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

  let imageBuffer: Buffer
  let mimetype = 'image/jpeg'

  try {
    console.log('Downloading image from Unsplash:', filename)
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Unsplash fetch failed: ${response.status} ${response.statusText}`)
    }
    const arrayBuffer = await response.arrayBuffer()
    imageBuffer = Buffer.from(arrayBuffer)
  } catch (error) {
    console.warn(`Unsplash download failed for ${filename}, using sharp fallback:`, error)
    // Generate a simple colored placeholder as fallback
    imageBuffer = await sharpFn({
      create: { width: 1200, height: 630, channels: 3, background: { r: 100, g: 100, b: 100 } },
    })
      .jpeg({ quality: 85 })
      .toBuffer()
  }

  const media = await payload.create({
    collection: 'media',
    data: { alt },
    file: {
      data: imageBuffer,
      name: `${filename}.jpg`,
      mimetype,
      size: imageBuffer.length,
    },
    overrideAccess: true,
    ...ctx,
  })
  console.log('Created media:', alt)
  return media
}

async function seed() {
  const payload = await getPayload({ config })
  const { default: sharpFn } = await import('sharp')

  // Disable revalidatePath in afterChange hooks -- not available outside Next.js server
  const ctx = { context: { disableRevalidate: true } }

  console.log('Seeding database...')

  // --------------------------------------------------
  // 1. User -- find-or-create, then set displayName
  // --------------------------------------------------
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
      ...ctx,
    })
    console.log('Created user:', user.email)
  }

  // Update displayName for the seed user
  await payload.update({
    collection: 'users',
    id: user.id,
    data: { displayName: 'BIBB United Staff' } as Record<string, unknown>,
    overrideAccess: true,
    ...ctx,
  })
  console.log('Set user displayName to BIBB United Staff')

  // --------------------------------------------------
  // 2. Unsplash images for news articles
  // --------------------------------------------------
  const unsplashImages = [
    {
      url: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1200&h=630&fit=crop',
      filename: 'seed-school-hallway',
      alt: 'Empty elementary school hallway',
    },
    {
      url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&h=630&fit=crop',
      filename: 'seed-budget-docs',
      alt: 'Calculator and budget documents on desk',
    },
    {
      url: 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=1200&h=630&fit=crop',
      filename: 'seed-voting-booth',
      alt: 'Voting booth with American flag',
    },
    {
      url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200&h=630&fit=crop',
      filename: 'seed-student-backpack',
      alt: 'Student with backpack walking toward school',
    },
    {
      url: 'https://images.unsplash.com/photo-1562774053-701939374585?w=1200&h=630&fit=crop',
      filename: 'seed-school-building',
      alt: 'School building exterior',
    },
  ] as const

  const mediaItems: Record<string, Awaited<ReturnType<typeof downloadUnsplashImage>>> = {}
  for (const img of unsplashImages) {
    mediaItems[img.filename] = await downloadUnsplashImage(
      payload,
      sharpFn,
      img.url,
      img.filename,
      img.alt,
      ctx,
    )
  }

  // --------------------------------------------------
  // 2b. OG Default Image -- branded 1200x630 PNG (generated with sharp, not Unsplash)
  // --------------------------------------------------
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
      ...ctx,
    })
    console.log('Created OG default image')
  }

  // --------------------------------------------------
  // 3. Pages -- About, Get Involved, Resources
  // --------------------------------------------------
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
        ...ctx,
      })
      pageRefs[pageData.title] = { id: created.id as number, slug: created.slug || '' }
      console.log('Created page:', created.slug)
    } else {
      const doc = existing.docs[0]
      pageRefs[pageData.title] = { id: doc.id as number, slug: doc.slug || '' }
      console.log('Page already exists:', doc.slug)
    }
  }

  // --------------------------------------------------
  // 4. News Posts -- 5 real articles matching production content
  // --------------------------------------------------
  const newsPostsData = [
    {
      title:
        "Nine Bibb County Elementary Schools Are Losing State Funding -- Here's What That Means for Your Child",
      publishDate: new Date('2026-03-26').toISOString(),
      excerpt:
        "Nearly half of Bibb County's elementary schools fall below the state enrollment threshold, putting librarians and art teachers at risk.",
      body: makeMultiParagraphRichText([
        'Nine elementary schools in Bibb County have fallen below the state enrollment threshold of 450 students, triggering automatic reductions in state funding. The affected schools will lose dedicated positions for librarians, art teachers, and other specialists that the state funds based on enrollment numbers.',
        'The schools impacted include some of the district\'s most historically significant campuses. As enrollment continues to decline across the county -- driven by population loss, the Georgia Promise Scholarship voucher program, and families choosing alternatives -- the per-school funding formula punishes smaller campuses disproportionately.',
        'Parents at affected schools should attend upcoming board meetings to advocate for local funding to backfill lost state positions. The Board of Education has the authority to reallocate district funds, but only if community members make their voices heard before the FY2027 budget is finalized.',
      ]),
      featuredImage: 'seed-school-hallway',
    },
    {
      title:
        "From $5.5 Million Error to $307 Million Question: Inside Bibb Schools' Budget Reckoning",
      publishDate: new Date('2026-03-26').toISOString(),
      excerpt:
        'A $5.5M budget error exposed a deeper crisis as the district faces a $307M FY2027 budget with rising costs and shrinking enrollment.',
      body: makeMultiParagraphRichText([
        'A $5.5 million accounting error discovered in the current fiscal year has cast a long shadow over the Bibb County School District\'s financial planning. The error, which resulted from a misclassification of recurring expenses as one-time costs, means the district has been spending beyond its sustainable budget baseline for at least two years.',
        'Now the district faces a $307 million FY2027 budget that must absorb rising personnel costs, deferred maintenance on aging facilities, and the revenue impact of losing over 500 students to the Georgia Promise Scholarship program. Chief Financial Officer reports indicate that without significant adjustments, the district could face a structural deficit within three years.',
        'Community members can review the full budget documents on the district website and attend the upcoming budget work sessions. Understanding where the money goes is the first step toward ensuring it goes where our students need it most.',
      ]),
      featuredImage: 'seed-budget-docs',
    },
    {
      title:
        'First Contested School Board Race in 12 Years: What You Need to Know About Post 7',
      publishDate: new Date('2026-03-25').toISOString(),
      excerpt:
        'Two candidates vie for the first competitive Post 7 school board seat since 2014 as the district faces generational challenges.',
      body: makeMultiParagraphRichText([
        'For the first time since 2014, voters in the Post 7 district will have a genuine choice in their school board representative. The contested race comes at a pivotal moment for Bibb County schools, as the district grapples with declining enrollment, budget shortfalls, and questions about school consolidation.',
        'Both candidates bring different visions for the district\'s future. The race has drawn attention from education advocacy groups across the state, who see Bibb County as a bellwether for how Georgia communities respond to the intertwined challenges of voucher programs, population decline, and aging infrastructure.',
        'Voters in the Post 7 district should research both candidates\' positions on school closures, budget priorities, and community engagement. Early voting begins in May, and every vote in a local school board race has an outsized impact on the quality of education in our community.',
      ]),
      featuredImage: 'seed-voting-booth',
    },
    {
      title:
        '582 Students, $3 Million Gone: How the Georgia Promise Scholarship Is Reshaping Bibb Schools',
      publishDate: new Date('2026-03-25').toISOString(),
      excerpt:
        'Bibb County had the third-highest voucher count in Georgia. The $2.4-$3M revenue loss compounds an already dire enrollment crisis.',
      body: makeMultiParagraphRichText([
        'Bibb County recorded 582 students using Georgia Promise Scholarship vouchers in the program\'s first year, making it the third-highest participating county in the state. At an estimated $4,000-$5,200 per voucher, the district faces a revenue loss between $2.4 million and $3 million -- money that follows students out of the public school system.',
        'The voucher exodus compounds an enrollment decline that was already underway. Over the past decade, Bibb County Schools has lost thousands of students to charter schools, homeschooling, and families relocating out of the county. Each departing student takes their per-pupil state funding with them, creating a downward spiral for the schools that remain.',
        'The district is exploring strategies to retain families, including expanding magnet programs and improving facilities at under-enrolled schools. But the fundamental challenge remains: how does a district maintain quality education across 38 campuses when the student population can no longer support that many schools?',
      ]),
      featuredImage: 'seed-student-backpack',
    },
    {
      title:
        "The Juice Isn't Worth the Squeeze: Why Consultants Say Bibb County Must Revisit School Closures",
      publishDate: new Date('2026-03-25').toISOString(),
      excerpt:
        "The district hired consultants to find alternatives to closures. Their answer: rezoning won't work. Consolidation may be inevitable.",
      body: makeMultiParagraphRichText([
        'An independent consulting firm hired by the Bibb County School District to explore alternatives to school closures has delivered a blunt assessment: rezoning alone cannot solve the district\'s capacity imbalance. With many elementary schools operating at less than 50% capacity, the consultants concluded that consolidation -- closing some campuses and combining student populations -- is the most viable path to fiscal sustainability.',
        'The consultants\' report examined multiple scenarios, including magnet program expansion, grade reconfiguration, and attendance zone adjustments. While each approach offers marginal improvements, none addresses the core problem: Bibb County has too many school buildings for its current and projected student population. Maintaining underutilized buildings drains resources from instruction and drives up per-pupil facility costs.',
        'The report will be presented at the next Board Retreat. Community members are encouraged to attend and provide input on which scenarios they prefer. The board has committed to a transparent process, but the window for public input is narrow -- decisions on the FY2027 facility plan are expected by early summer.',
      ]),
      featuredImage: 'seed-school-building',
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
    const imageId = mediaItems[postData.featuredImage].id as number
    if (existing.docs.length === 0) {
      const created = await payload.create({
        collection: 'news-posts',
        data: {
          title: postData.title,
          publishDate: postData.publishDate,
          excerpt: postData.excerpt,
          body: postData.body,
          featuredImage: imageId,
          author: user.id,
          _status: 'published',
        },
        overrideAccess: true,
        ...ctx,
      })
      newsPostDocs.push({ id: created.id as number, slug: created.slug || '' })
      console.log('Created news post:', created.slug)
    } else {
      const doc = existing.docs[0]
      // Update fields if content changed
      await payload.update({
        collection: 'news-posts',
        id: doc.id,
        data: {
          excerpt: postData.excerpt,
          body: postData.body,
          featuredImage: imageId,
          author: user.id,
        },
        overrideAccess: true,
        ...ctx,
      })
      console.log('Updated news post:', doc.slug)
      newsPostDocs.push({ id: doc.id as number, slug: doc.slug || '' })
    }
  }

  // --------------------------------------------------
  // 5. Officials -- 9 real Board of Education members
  // --------------------------------------------------
  const officialsData = [
    {
      name: 'Mr. Daryl J. Morton',
      role: 'President',
      body: 'board-of-education' as const,
      email: 'daryl.morton@bcsdk12.net',
      sortOrder: 1,
    },
    {
      name: 'Dr. Sundra M. Woodford',
      role: 'Vice President',
      body: 'board-of-education' as const,
      email: 'sundra.woodford@bcsdk12.net',
      sortOrder: 2,
    },
    {
      name: 'Mrs. Kristin C. Hanlon',
      role: 'Treasurer',
      body: 'board-of-education' as const,
      email: 'kristin.hanlon@bcsdk12.net',
      sortOrder: 3,
    },
    {
      name: 'Ms. Myrtice C. Johnson',
      role: 'Board Member, District 1',
      body: 'board-of-education' as const,
      email: 'myrtice.johnson@bcsdk12.net',
      sortOrder: 4,
    },
    {
      name: 'Dr. Henry C. Ficklin',
      role: 'Board Member, District 2',
      body: 'board-of-education' as const,
      email: 'henry.ficklin@bcsdk12.net',
      sortOrder: 5,
    },
    {
      name: 'Mr. Barney T. Hester',
      role: 'Board Member, District 4',
      body: 'board-of-education' as const,
      email: 'barney.hester@bcsdk12.net',
      sortOrder: 6,
    },
    {
      name: 'Mr. James M. Freeman',
      role: 'Board Member, District 6',
      body: 'board-of-education' as const,
      email: 'james.freeman@bcsdk12.net',
      sortOrder: 7,
    },
    {
      name: 'Dr. Lisa W. Garrett-Boyd',
      role: 'Board Member, At-Large Post 8',
      body: 'board-of-education' as const,
      email: 'lisa.garrettboyd@bcsdk12.net',
      sortOrder: 8,
    },
    {
      name: 'Dr. Dan A. Sims',
      role: 'Superintendent',
      body: 'board-of-education' as const,
      email: 'dan.sims@bcsdk12.net',
      sortOrder: 9,
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
        ...ctx,
      })
      console.log('Created official:', officialData.name)
    } else {
      console.log('Official already exists:', officialData.name)
    }
  }

  // --------------------------------------------------
  // 6. Meetings -- 3 real meetings with fixed dates and agenda links
  // --------------------------------------------------
  const meetingsData = [
    {
      title: 'Board Retreat',
      date: new Date('2026-03-27').toISOString(),
      time: '8:30 AM',
      location: 'Bibb County Board of Education, 484 Mulberry St, Macon, GA',
      agendaLink:
        'https://simbli.eboardsolutions.com/SB_Meetings/ViewMeeting.aspx?S=4013&MID=133998',
      notes: '',
    },
    {
      title: 'School Council Meeting',
      date: new Date('2026-04-15').toISOString(),
      time: '10:30 AM',
      location: 'Northwoods Academy',
      agendaLink:
        'https://simbli.eboardsolutions.com/SB_Meetings/ViewMeeting.aspx?S=4013&MID=129170',
      notes: '',
    },
    {
      title: 'School Council Meeting',
      date: new Date('2026-05-07').toISOString(),
      time: '5:00 PM',
      location: 'Elam Alexander',
      agendaLink:
        'https://simbli.eboardsolutions.com/SB_Meetings/ViewMeeting.aspx?S=4013&MID=128022',
      notes: '',
    },
  ]

  for (const meetingData of meetingsData) {
    // Use both title AND date for uniqueness (two meetings share the same title)
    const existing = await payload.find({
      collection: 'meetings',
      where: {
        and: [
          { title: { equals: meetingData.title } },
          { date: { equals: meetingData.date } },
        ],
      },
      limit: 1,
      overrideAccess: true,
    })
    if (existing.docs.length === 0) {
      await payload.create({
        collection: 'meetings',
        data: meetingData,
        overrideAccess: true,
        ...ctx,
      })
      console.log('Created meeting:', meetingData.title, meetingData.date)
    } else {
      console.log('Meeting already exists:', meetingData.title, meetingData.date)
    }
  }

  // --------------------------------------------------
  // 7. Navigation global -- flat menu matching production
  // --------------------------------------------------
  const aboutPage = pageRefs['About']

  await payload.updateGlobal({
    slug: 'navigation',
    data: {
      items: [
        { label: 'Meetings', type: 'external', url: '/meetings' },
        { label: 'News', type: 'external', url: '/news' },
        { label: 'About', type: 'internal', page: { relationTo: 'pages', value: aboutPage.id } },
        { label: 'Contact Officials', type: 'external', url: '/contact-officials' },
      ],
    },
    overrideAccess: true,
    ...ctx,
  })
  console.log('Updated navigation global')

  // --------------------------------------------------
  // 8. Homepage global -- hero spotlight references articles 5, 4, 3
  // --------------------------------------------------
  const getInvolvedPage = pageRefs['Get Involved']
  const resourcesPage = pageRefs['Resources']

  // Articles 5 (school closures, index 4), 4 (voucher, index 3), 3 (post-7 race, index 2)
  await payload.updateGlobal({
    slug: 'homepage',
    data: {
      heroSpotlight: [
        { story: newsPostDocs[4].id },
        { story: newsPostDocs[3].id },
        { story: newsPostDocs[2].id },
      ],
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
    ...ctx,
  })
  console.log('Updated homepage global')

  // --------------------------------------------------
  // 9. Urgent Banner global
  // --------------------------------------------------
  await payload.updateGlobal({
    slug: 'urgent-banner',
    data: {
      active: true,
      message: 'Site Under Development - Test data - Text is AI generated as placeholder for testing',
    },
    overrideAccess: true,
    ...ctx,
  })
  console.log('Updated urgent banner global')

  console.log('Seeding complete!')
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed error:', err)
  process.exit(1)
})
