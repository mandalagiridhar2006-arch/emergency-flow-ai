'use client'

import type { EventType, CorridorState } from '@/hooks/use-corridor-simulation'

const TONE: Record<EventType, string> = {
  detect: 'var(--tech)',
  camera: 'var(--corridor)',
  siren: 'var(--warn)',
  verify: 'var(--tech)',
  route: 'var(--tech)',
  intersections: 'var(--tech)',
  coordinate: 'var(--warn)',
  corridor: 'var(--corridor)',
  transit: 'var(--primary)',
  arrived: 'var(--corridor)',
}

export function ActivityFeed({ state }: { state: CorridorState }) {
  const { events } = state

  return (
    <section className="flex min-h-0 flex-1 flex-col rounded-xl border border-border bg-card p-3.5 sm:p-4">
      <div className="mb-2.5 flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-tight">Event Timeline</h2>
        <span className="font-mono text-[10px] uppercase text-muted-foreground">
          {events.length} events
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        {events.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center py-6 text-center text-xs text-muted-foreground">
            <p className="font-medium text-foreground/80">Awaiting Emergency Dispatch</p>
            <p className="mt-1 text-[11px] max-w-[220px]">
              Select an ambulance unit and destination hospital, then click <span className="text-primary font-semibold">START EMERGENCY CORRIDOR</span>.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {events.map((e) => {
              const tone = TONE[e.type]
              return (
                <li
                  key={e.id}
                  className="flex gap-2.5 rounded-md border border-border/40 bg-muted/15 p-2 transition-all hover:bg-muted/30"
                >
                  <div className="flex flex-col items-center pt-1">
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{
                        backgroundColor: tone,
                        boxShadow: `0 0 6px ${tone}`,
                      }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-medium leading-snug text-foreground/95 text-pretty">
                      {e.label}
                    </p>
                    <p className="mt-0.5 font-mono text-[9.5px] text-muted-foreground">
                      {e.time}
                    </p>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </section>
  )
}
