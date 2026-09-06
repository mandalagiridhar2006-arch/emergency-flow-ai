'use client'

import { Ambulance, Check, Clock, MapPin, Navigation, Radio, ShieldCheck } from 'lucide-react'
import { formatClock, SIGNALS, type SignalStatus } from '@/lib/emergency-config'
import type { CorridorState } from '@/hooks/use-corridor-simulation'

const SIGNAL_STATUS_BADGE: Record<
  SignalStatus,
  { label: string; textClass: string; bgClass: string; borderClass: string }
> = {
  red: {
    label: 'HOLD RED',
    textClass: 'text-primary',
    bgClass: 'bg-primary/10',
    borderClass: 'border-primary/30',
  },
  amber: {
    label: 'CLEARING',
    textClass: 'text-warn',
    bgClass: 'bg-warn/10',
    borderClass: 'border-warn/30',
  },
  green: {
    label: 'GREEN WAVE',
    textClass: 'text-corridor',
    bgClass: 'bg-corridor/15',
    borderClass: 'border-corridor/40',
  },
  normal: {
    label: 'RESTORED',
    textClass: 'text-tech',
    bgClass: 'bg-tech/10',
    borderClass: 'border-tech/30',
  },
  reset: {
    label: 'RESTORED',
    textClass: 'text-tech',
    bgClass: 'bg-tech/10',
    borderClass: 'border-tech/30',
  },
}

export function CorridorStatus({ state }: { state: CorridorState }) {
  const {
    phase,
    corridorActive,
    routePredicted,
    timeSaved,
    progress,
    signals,
    clearedCount: activeClearedCount,
    selectedAmbulance,
    selectedHospital,
  } = state

  const greenCount = signals.filter((s) => s.status === 'green').length
  const clearedCount = phase === 'arrived' ? SIGNALS.length : activeClearedCount
  const etaSeconds = Math.max(0, Math.round((1 - progress) * 36))

  const corridorLabel =
    phase === 'arrived'
      ? 'MISSION COMPLETE'
      : corridorActive
        ? 'CORRIDOR ACTIVE'
        : phase === 'idle'
          ? 'STANDBY'
          : 'COORDINATING'

  const corridorTone =
    corridorActive || phase === 'arrived' ? 'var(--corridor)' : 'var(--warn)'

  const ambulanceStatus =
    phase === 'arrived'
      ? 'PATIENT DELIVERED'
      : corridorActive
        ? 'GREEN WAVE TRANSIT'
        : phase === 'detecting'
          ? 'VERIFYING CORRIDOR'
          : 'STATION STANDBY'

  return (
    <section className="rounded-xl border border-border bg-card p-3.5 sm:p-4">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold tracking-tight">Corridor Status</h2>
          <p className="text-[11px] text-muted-foreground">
            {selectedAmbulance.id} → {selectedHospital.shortName}
          </p>
        </div>
        <span
          className="rounded px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider"
          style={{
            color: corridorTone,
            backgroundColor: `color-mix(in oklch, ${corridorTone} 14%, transparent)`,
          }}
        >
          {corridorLabel}
        </span>
      </div>

      {/* Main KPI: Estimated Time Saved */}
      <div className="mb-3 rounded-lg border border-corridor/25 bg-corridor/5 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Clock className="h-3.5 w-3.5 text-corridor" />
            Estimated time saved
          </div>
          <span className="font-mono text-[10px] text-corridor uppercase tracking-wider">
            Active Wave
          </span>
        </div>
        <div className="mt-1 flex items-baseline justify-between">
          <p className="font-mono text-3xl font-bold tabular-nums text-corridor">
            {formatClock(timeSaved)}
            <span className="ml-1 text-xs font-normal text-muted-foreground">min saved</span>
          </p>
          <span className="text-[11px] font-mono text-muted-foreground">
            Goal: 4:12 min
          </span>
        </div>
      </div>

      {/* 4 Metric grid */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <Metric
          icon={Ambulance}
          label="Ambulance"
          value={ambulanceStatus}
          isHighlight={corridorActive}
        />
        <Metric
          icon={Navigation}
          label="ETA to hospital"
          value={
            phase === 'arrived'
              ? 'ARRIVED'
              : corridorActive
                ? `${etaSeconds}s`
                : selectedHospital.corridorEta
          }
        />
        <Metric
          icon={Radio}
          label="Signals green"
          value={`${greenCount} / ${SIGNALS.length}`}
        />
        <Metric
          icon={ShieldCheck}
          label="Junctions cleared"
          value={`${clearedCount} / ${SIGNALS.length}`}
        />
      </div>

      {/* Upcoming Traffic Signals & Controller States */}
      <div className="rounded-lg border border-border/70 bg-muted/20 p-2.5">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[11px] font-semibold text-foreground">
            Upcoming Signals & Live States
          </span>
          <span className="font-mono text-[10px] text-muted-foreground">
            {clearedCount}/{SIGNALS.length} Cleared
          </span>
        </div>

        <div className="space-y-1.5">
          {signals.map((sig) => {
            const badge = SIGNAL_STATUS_BADGE[sig.status]
            const passed = progress >= sig.at + 0.04 || phase === 'arrived'
            return (
              <div
                key={sig.id}
                className="flex items-center justify-between rounded border border-border/50 bg-card/60 px-2 py-1 text-xs"
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className={`flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold ${
                      passed
                        ? 'bg-tech text-tech-foreground'
                        : sig.status === 'green'
                          ? 'bg-corridor text-corridor-foreground animate-pulse'
                          : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {passed ? <Check className="h-2.5 w-2.5" /> : sig.id.slice(-2)}
                  </span>
                  <div className="flex flex-col">
                    <span className="font-mono text-[11px] font-semibold leading-tight">
                      {sig.name}
                    </span>
                    <span className="text-[9px] text-muted-foreground leading-none">
                      {sig.crossStreet}
                    </span>
                  </div>
                </div>

                <span
                  className={`rounded border px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider ${badge.bgClass} ${badge.textClass} ${badge.borderClass}`}
                >
                  {badge.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Corridor Progress Bar */}
      <div className="mt-3 space-y-1">
        <div className="flex items-center justify-between font-mono text-[10px] text-muted-foreground">
          <span>Corridor Progress</span>
          <span className="font-semibold text-foreground">{Math.round(progress * 100)}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-corridor transition-[width] duration-100 ease-out shadow-[0_0_8px_var(--corridor)]"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>

      {/* Safety & Prototype note */}
      <p className="mt-2.5 text-center text-[10px] text-muted-foreground/70">
        Simulated municipal traffic control in software. Safe demo mode.
      </p>
    </section>
  )
}

function Metric({
  icon: Icon,
  label,
  value,
  isHighlight,
}: {
  icon: typeof Clock
  label: string
  value: string
  isHighlight?: boolean
}) {
  return (
    <div
      className={`rounded-lg border p-2 ${
        isHighlight
          ? 'border-corridor/40 bg-corridor/10'
          : 'border-border bg-muted/30'
      }`}
    >
      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <p
        className={`mt-0.5 truncate font-mono text-xs font-bold leading-tight ${
          isHighlight ? 'text-corridor' : 'text-foreground'
        }`}
      >
        {value}
      </p>
    </div>
  )
}
