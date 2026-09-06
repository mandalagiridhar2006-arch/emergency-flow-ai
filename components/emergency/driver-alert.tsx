'use client'

import { TriangleAlert } from 'lucide-react'
import type { CorridorState } from '@/hooks/use-corridor-simulation'

export function DriverAlert({ state }: { state: CorridorState }) {
  if (!state.driverWarning) return null

  return (
    <aside
      aria-label="Emergency driver alert broadcast"
      className="relative overflow-hidden border-b border-primary/40 bg-primary/15"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="h-full w-1/3 animate-sweep bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      </div>
      <div className="relative flex items-center justify-center gap-3 px-4 py-2">
        <TriangleAlert className="h-4 w-4 shrink-0 text-primary animate-light-flash" />
        <p className="text-center text-xs sm:text-sm font-bold tracking-wide text-primary text-balance">
          NEARBY DRIVER ALERT · AMBULANCE APPROACHING — CLEAR THE WAY ({state.selectedAmbulance.id} · ARTERIAL CORRIDOR)
        </p>
        <TriangleAlert className="h-4 w-4 shrink-0 text-primary animate-light-flash" />
      </div>
    </aside>
  )
}
