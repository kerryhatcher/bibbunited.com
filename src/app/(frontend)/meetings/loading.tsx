import { Section } from '@/components/ui/Section'

export default function MeetingsLoading() {
  return (
    <Section>
      <div className="h-10 w-64 bg-border/50 mb-4 animate-pulse" />
      <div className="h-5 w-96 bg-border/50 mb-12 animate-pulse" />

      <div className="h-8 w-48 bg-border/50 mb-6 animate-pulse" />

      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="border border-border p-6 mb-4">
          <div className="h-6 w-1/2 bg-border/50 mb-3 animate-pulse" />
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="h-4 w-40 bg-border/50 animate-pulse" />
            <div className="h-4 w-20 bg-border/50 animate-pulse" />
            <div className="h-4 w-32 bg-border/50 animate-pulse" />
          </div>
        </div>
      ))}
    </Section>
  )
}
