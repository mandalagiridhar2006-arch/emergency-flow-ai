'use client'

import {
  BrainCircuit,
  Eye,
  Navigation,
  Radio,
  RotateCcw,
  TriangleAlert,
  type LucideIcon,
} from 'lucide-react'
import type { CorridorState } from '@/hooks/use-corridor-simulation'

interface CapabilityConfig {
  id: string
  title: string
  detail: string
  icon: LucideIcon
  status: string
  active: boolean
  tone: string
}

export function IntelligentMobilityEngine({ state }: { state: CorridorState }) {
  const {
    phase,
    aiConf,
    cameraActive,
    multiSensorConfirmed,
    routePredicted,
    coordinating,
    corridorActive,
    driverWarning,
    clearedCount,
  } = state

  const capabilities: CapabilityConfig[] = [
    {
      id: 'detection',
      title: 'AI Vehicle Detection',
      detail: 'Optical signature & vehicle localization',
      icon: Eye,
      status: cameraActive ? 'LOCKED 98%' : aiConf > 0 ? 'SCANNING' : 'STANDBY',
      active: cameraActive || aiConf > 0,
      tone: 'var(--tech)',
    },
    {
      id: 'verification',
      title: 'Multimodal Emergency Verification',
      detail: 'Optical + acoustic dual-sensor fusion',
      icon: BrainCircuit,
      status: multiSensorConfirmed ? 'VERIFIED' : phase !== 'idle' ? 'EVALUATING' : 'STANDBY',
      active: multiSensorConfirmed,
      tone: 'var(--corridor)',
    },
    {
      id: 'route',
      title: 'Route Intelligence',
      detail: 'Dynamic corridor trajectory optimization',
      icon: Navigation,
      status: routePredicted ? 'OPTIMIZED' : phase !== 'idle' ? 'ROUTING' : 'STANDBY',
      active: routePredicted,
      tone: 'var(--tech)',
    },
    {
      id: 'signals',
      title: 'Automated Signal Coordination',
      detail: 'Temporary emergency arterial priority',
      icon: Radio,
      status: corridorActive ? 'PRIORITY' : coordinating ? 'CLEARING' : 'STANDBY',
      active: corridorActive || coordinating,
      tone: 'var(--corridor)',
    },
    {
      id: 'alerts',
      title: 'Driver Alerts',
      detail: 'Real-time V2X connected vehicle warning',
      icon: TriangleAlert,
      status: driverWarning ? 'ACTIVE' : phase === 'arrived' ? 'CLEARED' : 'STANDBY',
      active: driverWarning,
      tone: 'var(--primary)',
    },
    {
      id: 'restoration',
      title: 'Automatic Traffic Restoration',
      detail: 'Immediate signal normalization post-passage',
      icon: RotateCcw,
      status:
        phase === 'arrived'
          ? 'RESTORED (4/4)'
          : clearedCount > 0
            ? `RESTORED (${clearedCount}/4)`
            : 'MONITORING',
      active: clearedCount > 0 || phase === 'arrived',
      tone: 'oklch(0.7 0.13 220)',
    },
  ]

  return (
    <section className="rounded-xl border border-border bg-card p-3 sm:p-3.5">
      <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-tech/15 text-tech">
            <BrainCircuit className="h-3.5 w-3.5" />
          </div>
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Intelligent Mobility Engine
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="rounded border border-tech/30 bg-tech/10 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-tech">
            SIH26203 CORE
          </span>
          <span className="font-mono text-[9px] text-muted-foreground">
            Smart Vehicles Architecture
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {capabilities.map((cap) => {
          const Icon = cap.icon
          return (
            <div
              key={cap.id}
              className="flex flex-col justify-between rounded-lg border p-2 transition-all"
              style={{
                borderColor: cap.active ? cap.tone : 'var(--border)',
                backgroundColor: cap.active
                  ? `color-mix(in oklch, ${cap.tone} 8%, transparent)`
                  : 'var(--muted)',
                opacity: cap.active ? 1 : 0.75,
              }}
            >
              <div>
                <div className="flex items-center justify-between gap-1">
                  <div
                    className="flex h-5 w-5 items-center justify-center rounded shrink-0"
                    style={{
                      backgroundColor: `color-mix(in oklch, ${cap.tone} 20%, transparent)`,
                      color: cap.active ? cap.tone : 'var(--muted-foreground)',
                    }}
                  >
                    <Icon className="h-3 w-3" />
                  </div>
                  <span
                    className="truncate rounded px-1 py-0.2 font-mono text-[8.5px] font-bold uppercase tracking-tight"
                    style={{
                      color: cap.active ? cap.tone : 'var(--muted-foreground)',
                      backgroundColor: cap.active
                        ? `color-mix(in oklch, ${cap.tone} 15%, transparent)`
                        : 'transparent',
                    }}
                  >
                    {cap.status}
                  </span>
                </div>
                <p className="mt-1 text-[11px] font-semibold leading-tight text-foreground line-clamp-1">
                  {cap.title}
                </p>
              </div>
              <p className="mt-1 text-[9.5px] leading-tight text-muted-foreground line-clamp-2">
                {cap.detail}
              </p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
