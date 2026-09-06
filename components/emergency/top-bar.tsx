'use client'

import { useEffect, useState } from 'react'
import { Activity, Ambulance, CheckCircle2, Hospital, Play, RotateCcw, Siren } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  AMBULANCE_UNITS,
  HOSPITAL_DESTINATIONS,
  type AmbulanceUnit,
  type HospitalDestination,
} from '@/lib/emergency-config'
import type { CorridorState } from '@/hooks/use-corridor-simulation'

export function TopBar({ state }: { state: CorridorState }) {
  const {
    phase,
    start,
    reset,
    speed,
    setSpeed,
    selectedAmbulance,
    setSelectedAmbulance,
    selectedHospital,
    setSelectedHospital,
  } = state
  const [clock, setClock] = useState('--:--:--')

  useEffect(() => {
    const tick = () =>
      setClock(
        new Date().toLocaleTimeString('en-US', { hour12: false }),
      )
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  const running = phase === 'detecting' || phase === 'active'

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border bg-card/60 px-5 py-2.5 backdrop-blur">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 ring-1 ring-primary/30 shadow-[0_0_16px_-4px_var(--primary)]">
          <Siren className="h-5 w-5 text-primary animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold leading-tight tracking-tight text-balance">
              EmergencyFlow <span className="text-primary">AI</span>
            </h1>
            <span className="rounded border border-primary/30 bg-primary/10 px-1.5 py-0.2 text-[10px] font-mono font-medium text-primary">
              SIMULATOR
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Multimodal Green Corridor Orchestration System
          </p>
        </div>
      </div>

      {/* Selectors for Ambulance and Hospital */}
      <div className="flex flex-wrap items-center gap-2.5 sm:gap-4">
        {/* Ambulance Selector */}
        <div className="flex items-center gap-1.5 rounded-lg border border-border bg-muted/40 px-2.5 py-1 text-xs">
          <Ambulance className="h-3.5 w-3.5 text-tech" />
          <span className="hidden font-mono text-[11px] text-muted-foreground md:inline">Unit:</span>
          <select
            aria-label="Select Ambulance Unit"
            disabled={running}
            value={selectedAmbulance.id}
            onChange={(e) => {
              const unit = AMBULANCE_UNITS.find((u) => u.id === e.target.value)
              if (unit) setSelectedAmbulance(unit)
            }}
            className="cursor-pointer bg-transparent font-mono text-xs font-semibold text-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-75"
          >
            {AMBULANCE_UNITS.map((u) => (
              <option key={u.id} value={u.id} className="bg-card text-foreground">
                {u.id} ({u.callSign})
              </option>
            ))}
          </select>
        </div>

        {/* Destination Hospital Selector */}
        <div className="flex items-center gap-1.5 rounded-lg border border-border bg-muted/40 px-2.5 py-1 text-xs">
          <Hospital className="h-3.5 w-3.5 text-corridor" />
          <span className="hidden font-mono text-[11px] text-muted-foreground md:inline">Dest:</span>
          <select
            aria-label="Select Destination Hospital"
            disabled={running}
            value={selectedHospital.id}
            onChange={(e) => {
              const hosp = HOSPITAL_DESTINATIONS.find((h) => h.id === e.target.value)
              if (hosp) setSelectedHospital(hosp)
            }}
            className="cursor-pointer bg-transparent font-mono text-xs font-semibold text-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-75"
          >
            {HOSPITAL_DESTINATIONS.map((h) => (
              <option key={h.id} value={h.id} className="bg-card text-foreground">
                {h.name}
              </option>
            ))}
          </select>
        </div>

        {/* Speed Multiplier Toggle */}
        <div className="hidden items-center gap-1 rounded-lg border border-border bg-muted/30 p-0.5 lg:flex">
          <button
            type="button"
            onClick={() => setSpeed(1)}
            className={`rounded px-2 py-0.5 text-[11px] font-mono font-medium transition-colors ${
              speed === 1
                ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            1.0x
          </button>
          <button
            type="button"
            onClick={() => setSpeed(1.5)}
            className={`rounded px-2 py-0.5 text-[11px] font-mono font-medium transition-colors ${
              speed === 1.5
                ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            1.5x
          </button>
        </div>
      </div>

      {/* Right Controls & Action Button */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* System Online Status */}
        <div className="hidden items-center gap-2 xl:flex">
          {phase === 'arrived' ? (
            <div className="flex items-center gap-1.5 text-xs text-corridor font-medium">
              <CheckCircle2 className="h-4 w-4" />
              <span>MISSION COMPLETE</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Activity className="h-4 w-4 text-corridor animate-pulse" />
              <span>
                System{' '}
                <span className="font-mono font-medium text-corridor">ONLINE</span>
              </span>
            </div>
          )}
        </div>

        <div className="hidden font-mono text-sm tabular-nums text-muted-foreground md:block">
          {clock}
        </div>

        {phase === 'idle' ? (
          <Button
            id="start-corridor-btn"
            onClick={start}
            className="gap-2 bg-primary font-semibold text-primary-foreground shadow-[0_0_24px_-4px_var(--primary)] hover:bg-primary/90 cursor-pointer transition-transform active:scale-95"
          >
            <Play className="h-4 w-4 fill-current" />
            START EMERGENCY CORRIDOR
          </Button>
        ) : (
          <Button
            id="reset-demo-btn"
            onClick={reset}
            variant="outline"
            className="gap-2 border-border bg-card/80 hover:bg-secondary text-foreground cursor-pointer shadow-sm transition-transform active:scale-95"
          >
            <RotateCcw className="h-4 w-4" />
            RESET DEMO
          </Button>
        )}
      </div>
    </header>
  )
}
