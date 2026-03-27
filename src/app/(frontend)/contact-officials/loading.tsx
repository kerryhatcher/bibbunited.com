import { Section } from '@/components/ui/Section'

export default function ContactOfficialsLoading() {
  return (
    <Section>
      <div className="h-10 w-72 bg-border/50 mb-4 animate-pulse" />
      <div className="h-5 w-96 bg-border/50 mb-12 animate-pulse" />

      <div className="h-8 w-48 bg-border/50 mb-6 animate-pulse" />
      <div className="h-1 w-full bg-accent mb-6" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="border border-border p-6">
            <div className="w-20 h-20 bg-border/50 mb-4 animate-pulse" />
            <div className="h-6 w-3/4 bg-border/50 mb-2 animate-pulse" />
            <div className="h-4 w-1/2 bg-border/50 mb-4 animate-pulse" />
            <div className="h-4 w-full bg-border/50 animate-pulse" />
          </div>
        ))}
      </div>
    </Section>
  )
}
