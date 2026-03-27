import { Section } from '@/components/ui/Section'

export default function NewsLoading() {
  return (
    <Section>
      <output aria-busy="true">
        <span className="sr-only">Loading news...</span>
      </output>
      <div className="h-10 w-48 bg-border/50 mb-8 animate-pulse" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="border border-border">
            <div className="aspect-video bg-border/50 animate-pulse" />
            <div className="p-6">
              <div className="h-8 w-3/4 bg-border/50 mb-2 animate-pulse" />
              <div className="h-4 w-24 bg-border/50 animate-pulse" />
            </div>
          </div>
        </div>
        <div className="lg:col-span-1 flex flex-col gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="border border-border p-6">
              <div className="h-5 w-full bg-border/50 mb-2 animate-pulse" />
              <div className="h-4 w-3/4 bg-border/50 mb-2 animate-pulse" />
              <div className="h-3 w-20 bg-border/50 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </Section>
  )
}
