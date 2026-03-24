import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Section } from '@/components/ui/Section'
import { Logo } from '@/components/ui/Logo'

export default async function DesignSystemShowcase() {
  return (
    <main>
      {/* ===== Hero Section (Dark) ===== */}
      <Section variant="dark" className="py-16 sm:py-24">
        <div className="flex flex-col items-center text-center gap-6">
          <Logo size="large" />
          <h1 className="text-3xl sm:text-5xl font-heading font-bold uppercase tracking-tight">
            Demand Better for Bibb County
          </h1>
          <p className="text-lg max-w-2xl text-text-on-dark/80">
            Your schools. Your tax dollars. Your voice. Get the facts on budgets,
            policies, and board decisions — then take action.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button variant="primary">Take Action</Button>
            <Button variant="secondary">Learn More</Button>
          </div>
        </div>
      </Section>

      {/* ===== Typography Section ===== */}
      <Section>
        <h2 className="text-2xl sm:text-3xl font-heading font-bold uppercase mb-8">
          Typography Scale
        </h2>

        <div className="space-y-6">
          <div>
            <span className="text-xs text-text-secondary uppercase tracking-widest">
              H1 - Barlow Condensed 700, uppercase
            </span>
            <h1 className="text-2xl sm:text-3xl">Hold the Board Accountable</h1>
          </div>

          <div>
            <span className="text-xs text-text-secondary uppercase tracking-widest">
              H2 - Barlow Condensed 700, uppercase
            </span>
            <h2 className="text-2xl sm:text-3xl">Where Your Tax Dollars Go</h2>
          </div>

          <div>
            <span className="text-xs text-text-secondary uppercase tracking-widest">
              H3 - Barlow Condensed 700, mixed case
            </span>
            <h3 className="text-xl">Board Meeting Recap: March 2026</h3>
          </div>

          <div>
            <span className="text-xs text-text-secondary uppercase tracking-widest">
              H4 - Barlow Condensed 700, mixed case
            </span>
            <h4 className="text-xl">Key Budget Line Items</h4>
          </div>

          <div>
            <span className="text-xs text-text-secondary uppercase tracking-widest">
              Body - Inter 400, 16px, line-height 1.5
            </span>
            <p className="text-base leading-relaxed max-w-prose">
              The Bibb County Board of Education approved a $280 million budget for the
              2026-2027 school year. Here is what changed, what it means for your
              schools, and what you can do about it.
            </p>
          </div>

          <div>
            <span className="text-xs text-text-secondary uppercase tracking-widest">
              Secondary text
            </span>
            <p className="text-text-secondary">
              Published March 15, 2026 by BIBB United Editorial Team
            </p>
          </div>
        </div>
      </Section>

      {/* ===== Cards Section ===== */}
      <Section variant="dark">
        <h2 className="text-2xl sm:text-3xl font-heading font-bold uppercase mb-8">
          Card Components
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card
            href="#"
            imageSrc=""
          >
            <div className="w-full aspect-video bg-accent/20 -mt-6 -mx-6 mb-4" style={{ width: 'calc(100% + 3rem)' }} />
            <h3 className="text-xl mb-2">Budget Breakdown 2026-2027</h3>
            <p className="text-text-secondary text-sm">
              Where $280 million of your tax dollars are going this year.
            </p>
          </Card>

          <Card>
            <div className="w-full aspect-video bg-navy/30 -mt-6 -mx-6 mb-4" style={{ width: 'calc(100% + 3rem)' }} />
            <h3 className="text-xl mb-2">Board Meeting Schedule</h3>
            <p className="text-text-secondary text-sm">
              Upcoming meetings, agendas, and how to make your voice heard.
            </p>
          </Card>

          <Card>
            <div className="w-full aspect-video bg-crimson/20 -mt-6 -mx-6 mb-4" style={{ width: 'calc(100% + 3rem)' }} />
            <h3 className="text-xl mb-2">Contact Your Representatives</h3>
            <p className="text-text-secondary text-sm">
              Direct contact info for every board member and district official.
            </p>
          </Card>
        </div>
      </Section>

      {/* ===== Prose Section ===== */}
      <Section>
        <h2 className="text-2xl sm:text-3xl font-heading font-bold uppercase mb-8">
          Prose / Rich Text
        </h2>
        <div className="prose">
          <h2>Why This Matters</h2>
          <p>
            Every decision the Board of Education makes affects <strong>over 22,000
            students</strong> in Bibb County. From teacher salaries to facility
            maintenance, from curriculum changes to transportation routes — these
            decisions shape the future of our community.
          </p>
          <blockquote>
            &ldquo;An informed community is an empowered community. When residents show
            up with facts, the board listens.&rdquo;
          </blockquote>
          <p>
            BIBB United exists to bridge the gap between policy decisions and the
            people they affect. We dig into the{' '}
            <a href="#">public records</a>, break down the numbers, and tell you
            exactly what you can do about it.
          </p>
        </div>
      </Section>

      {/* ===== Color Palette Section ===== */}
      <Section variant="dark">
        <h2 className="text-2xl sm:text-3xl font-heading font-bold uppercase mb-8">
          Color Palette
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 bg-bg-dominant border border-border" />
            <span className="text-xs text-text-on-dark">bg-dominant</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 bg-bg-secondary border border-border" />
            <span className="text-xs text-text-on-dark">bg-secondary</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 bg-accent" />
            <span className="text-xs text-text-on-dark">accent</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 bg-text-primary" />
            <span className="text-xs text-text-on-dark">text-primary</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 bg-text-secondary" />
            <span className="text-xs text-text-on-dark">text-secondary</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 bg-border border border-white/20" />
            <span className="text-xs text-text-on-dark">border</span>
          </div>
        </div>
      </Section>
    </main>
  )
}
