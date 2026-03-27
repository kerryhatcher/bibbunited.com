export interface CTALink {
  href: string
  label: string
  variant: 'primary' | 'secondary'
}

export const CTA_LINKS: CTALink[] = [
  { href: '/contact-officials', label: 'Contact Officials', variant: 'primary' },
  { href: '/meetings', label: 'Upcoming Meetings', variant: 'secondary' },
]
