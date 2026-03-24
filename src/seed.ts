import { getPayload } from 'payload'
import config from '@payload-config'

async function seed() {
  const payload = await getPayload({ config })

  console.log('Seeding database...')

  // 1. Create or find a user (required as author for news posts)
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

  // 2. Create a placeholder media item using sharp to generate a test image
  const { default: sharp } = await import('sharp')
  const imageBuffer = await sharp({
    create: {
      width: 1200,
      height: 630,
      channels: 3,
      background: { r: 30, g: 41, b: 59 },
    },
  })
    .jpeg()
    .toBuffer()

  const media = await payload.create({
    collection: 'media',
    data: {
      alt: 'BIBB United test image for seed data',
    },
    file: {
      data: imageBuffer,
      name: 'seed-test-image.jpg',
      mimetype: 'image/jpeg',
      size: imageBuffer.length,
    },
    overrideAccess: true,
  })
  console.log('Created media:', media.id)

  // 3. Create Pages (including 'about' which cms-page.spec.ts navigates to)
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

  const pages = [
    {
      title: 'About BIBB United',
      slug: 'about',
      content: makeRichText(
        'BIBB United is a civic advocacy organization dedicated to transparency and accountability in the BIBB County School District. We believe every community member deserves clear, accessible information about how their schools are governed.',
      ),
    },
    {
      title: 'Get Involved',
      slug: 'get-involved',
      content: makeRichText(
        'Your voice matters in shaping the future of BIBB County schools. Attend board meetings, contact officials, and stay informed about the decisions that affect our children.',
      ),
    },
    {
      title: 'Resources',
      slug: 'resources',
      content: makeRichText(
        'Find links to official board documents, budget reports, and meeting minutes. Stay informed with primary sources.',
      ),
    },
  ]

  for (const pageData of pages) {
    const existing = await payload.find({
      collection: 'pages',
      where: { slug: { equals: pageData.slug } },
      limit: 1,
      overrideAccess: true,
    })
    if (existing.docs.length === 0) {
      await payload.create({
        collection: 'pages',
        data: {
          ...pageData,
          _status: 'published',
        },
        overrideAccess: true,
      })
      console.log('Created page:', pageData.slug)
    } else {
      console.log('Page already exists:', pageData.slug)
    }
  }

  // 4. Create NewsPosts (with author, featuredImage, published status)
  const newsPosts = [
    {
      title: 'School Board Approves 2026-2027 Budget',
      slug: 'school-board-approves-2026-2027-budget',
      publishDate: new Date('2026-03-15').toISOString(),
      body: makeRichText(
        'The BIBB County Board of Education voted 5-2 to approve the $180 million operating budget for the 2026-2027 school year. Key allocations include increased funding for teacher retention bonuses and facility maintenance.',
      ),
    },
    {
      title: 'Community Forum on School Safety Draws Record Attendance',
      slug: 'community-forum-school-safety-record-attendance',
      publishDate: new Date('2026-03-10').toISOString(),
      body: makeRichText(
        'Over 300 community members packed the Central High School auditorium for a forum on school safety improvements. Parents, teachers, and students shared perspectives on proposed security upgrades and mental health resources.',
      ),
    },
    {
      title: 'New Superintendent Search Committee Formed',
      slug: 'new-superintendent-search-committee-formed',
      publishDate: new Date('2026-03-01').toISOString(),
      body: makeRichText(
        'The Board of Education has appointed a seven-member search committee to find the next superintendent of BIBB County Schools. The committee includes two parents, two teachers, one principal, and two community members.',
      ),
    },
  ]

  for (const postData of newsPosts) {
    const existing = await payload.find({
      collection: 'news-posts',
      where: { slug: { equals: postData.slug } },
      limit: 1,
      overrideAccess: true,
    })
    if (existing.docs.length === 0) {
      await payload.create({
        collection: 'news-posts',
        data: {
          ...postData,
          author: user.id,
          featuredImage: media.id,
          _status: 'published',
        },
        overrideAccess: true,
      })
      console.log('Created news post:', postData.slug)
    } else {
      console.log('News post already exists:', postData.slug)
    }
  }

  console.log('Seeding complete!')
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed error:', err)
  process.exit(1)
})
