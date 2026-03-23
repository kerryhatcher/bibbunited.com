# Feature Landscape

**Domain:** Civic advocacy website (local school system transparency and engagement)
**Researched:** 2026-03-23
**Confidence:** MEDIUM (based on domain expertise; web search tools unavailable for live verification)

## Table Stakes

Features users expect. Missing = product feels incomplete or loses credibility.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Clear, scannable homepage | First impression determines trust; visitors must immediately understand what the site is about and see the latest activity | Medium | Hero section + latest news feed + key topic callouts. Must convey urgency and purpose within 3 seconds |
| News/updates feed | Timely content is the entire value proposition; stale sites signal abandoned causes | Low | Reverse-chronological posts with publish dates. Payload CMS news collection handles this. Must show dates prominently -- civic trust depends on recency |
| Deep-dive explainer pages | The "inform" half of the mission; residents need accessible breakdowns of budgets, policies, and decisions | Medium | Long-form rich text with headings, pull quotes, embedded data/tables. Payload pages collection. These are the evergreen content that search engines index |
| Contact your officials section | Without a clear "now what?" the site informs but fails to activate. Visitors need names, roles, emails, phone numbers, and meeting schedules | Low | Static or CMS-managed page with official contact info. This is the bridge between knowing and doing |
| Meeting calendar or schedule | School board meetings are the primary civic action point; if people don't know when to show up, the advocacy fails | Low | Can be as simple as a CMS-managed page with upcoming dates. Does NOT need a full calendar widget in v1 |
| Mobile-responsive design | 60-70% of local news/civic content is consumed on phones. Non-responsive = invisible to the majority | Medium | Tailwind + mobile-first approach covers this. Test on real devices, not just browser dev tools |
| Fast page loads | Civic sites compete with social media for attention. Slow loads = bounced visitors who never come back | Low | Next.js SSG/SSR handles this well. Keep images optimized. Target sub-2-second loads |
| Social sharing metadata | Content spreads primarily through Facebook groups, Nextdoor, and text messages in local communities. If shared links look broken or have no preview, engagement drops dramatically | Low | OpenGraph and Twitter Card meta tags on all pages and posts. Payload can store og:image per post |
| About / Mission page | Visitors need to know who is behind the site and why. Credibility in civic advocacy requires transparency about the advocates themselves | Low | Simple CMS page. Include team names/bios, mission statement, and any organizational affiliations |
| Accessible design (WCAG 2.1 AA) | Government and civic sites have both legal and ethical obligations for accessibility. Excludes elderly and disabled community members if skipped | Medium | Color contrast, keyboard navigation, semantic HTML, alt text on images. Tailwind + Next.js make this achievable but it requires deliberate effort |
| CMS admin for non-technical editors | The 2-3 person editorial team cannot depend on a developer to publish content. If publishing is hard, content stops flowing and the site dies | Medium | Payload CMS provides this out of the box. Key: configure the admin UI with clear field labels, helpful descriptions, and logical collection organization |
| Navigation with dropdown menus | Users must be able to find content by topic. A flat navigation breaks down as content grows beyond 5-6 items | Low | CMS-managed nav with one level of dropdowns, per PROJECT.md requirements. Keep it simple -- two levels max ever |

## Differentiators

Features that set the product apart from generic civic sites. Not expected, but create meaningful value.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Bold, activist visual design | Most civic/municipal sites are bland, bureaucratic, and forgettable. An urgent, attention-grabbing design communicates that this content matters NOW and breaks through apathy | High | This is the single biggest differentiator in PROJECT.md. Strong typography, high-contrast colors, large headlines, strategic use of color blocks and whitespace. Think protest poster meets news site, not government portal |
| Action-oriented CTAs on every page | Generic civic sites inform but don't activate. Persistent, contextual calls-to-action ("Attend the next meeting", "Email the superintendent", "Read the full budget") turn passive readers into active citizens | Low | Each page/post should have a configurable CTA block. Payload custom field for CTA text + link on pages and posts. Place above the fold and at article end |
| "What's happening right now" urgency indicators | Communicate temporal urgency -- upcoming vote dates, meeting countdowns, public comment deadlines. Creates FOMO that drives action | Medium | Could be a CMS-managed "urgent banner" component at the top of the site. Payload global config for site-wide alerts. Simple to build, powerful for engagement |
| Issue-focused content organization | Instead of just chronological news, organize content by civic topic (budget, personnel, facilities, policy). Lets residents go deep on what they care about | Medium | Payload taxonomy/tags on posts and pages. Topic landing pages that aggregate related content. This is what separates a serious watchdog site from a blog |
| Curated external resource links | Official documents, public records requests, state education department data, media coverage from other outlets. Becoming the "hub" for all information on the topic, not just original content | Low | CMS-managed links collection or a resources page with categorized external links. Low effort, high value -- saves residents hours of searching |
| Embedded document viewers | Budget PDFs, policy documents, meeting minutes displayed inline rather than forcing downloads. Reduces friction to actually reading primary sources | Medium | PDF.js or similar embedded viewer. Could defer to v2 if scope is tight. Alternative: link to documents with clear labels |
| Print-friendly article layouts | Community members print articles to share at meetings, churches, and community gatherings. Physical distribution still matters in local civic engagement | Low | CSS print stylesheet. Simple to add, often overlooked. Strip nav/footer, optimize typography for print |
| SEO-optimized content structure | When residents Google "[town name] school budget" or "[town name] school board," this site should rank. Becoming the go-to information source requires search visibility | Medium | Structured data (JSON-LD), proper heading hierarchy, meta descriptions, sitemap.xml. Next.js metadata API makes this manageable |
| Content freshness signals | "Last updated" timestamps, "X days until next meeting" counters, recent activity indicators. Signals that the site is alive and maintained | Low | Display updated_at from Payload. Add a "last published" indicator on the homepage. Simple but builds trust |

## Anti-Features

Features to explicitly NOT build in v1. These are deliberate exclusions, not oversights.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| User accounts / visitor login | This is a broadcast site, not a community platform. Accounts add complexity (security, GDPR/privacy, password resets, abuse moderation) with no clear value for a small local advocacy site | Keep it public and anonymous. The site informs; action happens in person and on existing social channels |
| Comments or discussion forums | Comment sections on civic sites attract trolls, require moderation (which the 2-3 person team cannot sustain), and create legal liability. They rarely produce constructive civic discourse | Direct engagement to existing channels: Facebook groups, Nextdoor, town hall meetings. Link to these from the site |
| Donation / payment processing | Adds PCI compliance concerns, payment processor integration, financial reporting requirements. Not needed for a v1 advocacy site that is informing, not fundraising | If donations become needed later, use a hosted solution (GoFundMe, ActBlue, or similar) and link out to it |
| Email newsletter / mailing list | Valuable but adds significant complexity: email service provider integration, subscription management, CAN-SPAM compliance, template design, send scheduling. Defer to v2 | For v1, encourage visitors to follow on social media. Add a "coming soon" newsletter signup that collects emails for later |
| Full-text search | The site will be small enough (likely under 50 pages) to navigate via menu and topic pages. Search adds complexity and a search UX that works well is harder than it looks | Well-organized navigation and topic pages serve the same purpose for a small site. Add search when content exceeds what navigation can handle |
| Event RSVP / ticketing | Over-engineering the meeting attendance use case. People don't RSVP for public school board meetings | Post meeting dates, times, and locations clearly. Link to official agendas. That's sufficient |
| Multi-language support (i18n) | Significant complexity for content translation and maintenance. Unless the community has a large non-English-speaking population that has been identified, this is premature | If needed, add in a later phase after validating demand. Payload CMS does support localization, so the architecture won't prevent it |
| Real-time notifications / push | Over-engineering for a small editorial site. Push notifications require service worker setup, notification permission UX, and ongoing maintenance | Social media serves the real-time notification function. The site is the source of truth, not the alert system |
| Admin analytics dashboard | The editorial team does not need in-app analytics. This is build complexity for a "nice to have" | Use a lightweight external analytics tool (Plausible, Umami, or even basic server logs) rather than building analytics into the CMS |
| AI-generated content summaries | Trendy but unnecessary and potentially harmful for a civic trust site. Residents need to trust that content is human-authored and fact-checked | Human-written summaries. The editorial team IS the value proposition. AI summaries undermine credibility for civic content |

## Feature Dependencies

```
Navigation menu --> Homepage (homepage needs nav to be useful)
News posts --> Homepage news feed (homepage displays latest posts)
Pages --> Navigation menu (pages need to be linked from nav)
Bold visual design --> All user-facing features (design system must exist before building pages)
Social sharing metadata --> News posts, Pages (metadata lives on content)
Action CTAs --> Pages, News posts (CTAs are embedded in content)
Topic taxonomy --> News posts, Pages (tags/categories on content)
Topic landing pages --> Topic taxonomy (landing pages aggregate by topic)
Urgent banner --> Homepage (banner appears site-wide, homepage is primary)
Contact officials page --> Navigation menu (must be discoverable)
Meeting schedule --> Contact officials page OR standalone (related civic action content)
```

## MVP Recommendation

**Prioritize (v1 launch):**

1. **Bold visual design system** -- This is the identity and the primary differentiator. Build the design tokens, component library, and page layouts first. Everything else is built on top of this.
2. **CMS-managed news posts with homepage feed** -- The site lives or dies on fresh content. Get the publishing pipeline working early so the editorial team can start creating content during development.
3. **CMS-managed explainer/resource pages** -- The evergreen content that gives the site depth and search engine value. Budget breakdowns, policy explainers, contact information.
4. **Navigation with dropdowns** -- Content is only useful if people can find it. CMS-managed so editors can reorganize as content grows.
5. **Contact your officials page** -- The single most important action page. Names, roles, contact info, meeting schedule.
6. **Social sharing metadata** -- Zero-friction way to make shared links look professional in Facebook groups and text messages. Small effort, outsized impact on reach.
7. **Site-wide urgent banner** -- Simple CMS global that lets editors highlight time-sensitive information ("Board vote Tuesday at 7pm"). Creates urgency without requiring a full notification system.
8. **About/mission page** -- Establishes credibility. Who runs this, why, and what's the mission.

**Defer to v2:**

- **Email newsletter signup** -- Valuable but adds integration complexity. Collect interest (email capture form) in v1, implement delivery in v2.
- **Full-text search** -- Not needed until content volume exceeds 50+ pages.
- **Topic taxonomy and landing pages** -- Useful for content organization but not critical until there are enough posts (20+) to warrant browsing by topic. Can organize by nav menu initially.
- **Embedded document viewers** -- Link to PDFs for now; embed them later.
- **Print stylesheets** -- Quick win that can be added anytime without architectural changes.

**Defer to v3+:**

- **Donation integration** (link out to hosted solution if needed sooner)
- **Multi-language support** (validate demand first)
- **Analytics dashboard** (use external tool)

## Complexity Budget

For a 2-3 person editorial team with a solo developer building the site, the total v1 scope should be achievable in approximately 4-6 weeks of focused development. The bold visual design is the highest-risk item because it requires creative iteration and is subjective. Everything else is well-understood CMS patterns.

| Category | Count | Avg Complexity | Risk |
|----------|-------|----------------|------|
| Table stakes (v1) | 12 | Low-Medium | Low -- these are standard CMS patterns |
| Differentiators (v1) | 4-5 | Low-Medium | Medium -- design system is the wild card |
| Deferred features | 5-6 | Medium | Low -- architecture should not block these |

## Sources

- Domain knowledge from civic advocacy, nonprofit, and community journalism website patterns (MEDIUM confidence -- well-established domain with stable feature expectations, but not verified against live sites due to tool restrictions)
- PROJECT.md requirements and constraints (HIGH confidence -- direct project context)
- Patterns observed across civic watchdog sites: Strong Towns, Common Cause, local Patch/news sites, school board advocacy groups (MEDIUM confidence -- from training data, not live verification)
