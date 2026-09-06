'use client'

import { useEffect, useRef, useState } from 'react'
import { CheckCircle2, RotateCcw, ShieldCheck, Timer, Zap } from 'lucide-react'
import {
  CITY_BLOCKS,
  HOSPITAL,
  MAP_VIEWBOX,
  ORIGIN,
  ROUTE_PATH,
  type SignalStatus,
} from '@/lib/emergency-config'
import type { CorridorState } from '@/hooks/use-corridor-simulation'
import { Button } from '@/components/ui/button'

const SIGNAL_COLORS: Record<SignalStatus, string> = {
  red: 'var(--primary)',
  amber: 'var(--warn)',
  green: 'var(--corridor)',
  normal: 'oklch(0.7 0.13 220)',
  reset: 'oklch(0.7 0.13 220)',
}

const SIGNAL_LABELS: Record<SignalStatus, string> = {
  red: 'RED',
  amber: 'AMBER',
  green: 'GREEN',
  normal: 'NORMAL',
  reset: 'NORMAL',
}

function TrafficSignal({
  x,
  y,
  status,
  name,
  id,
}: {
  x: number
  y: number
  status: SignalStatus
  name: string
  id: string
}) {
  const lit = SIGNAL_COLORS[status]
  const isGreen = status === 'green'
  const isAmber = status === 'amber'
  const isNormal = status === 'normal' || status === 'reset'

  return (
    <g transform={`translate(${x} ${y})`}>
      {isGreen && (
        <circle
          r={18}
          fill="var(--corridor)"
          opacity={0.45}
          className="animate-signal-ping"
        />
      )}
      {isAmber && (
        <circle
          r={16}
          fill="var(--warn)"
          opacity={0.35}
          className="animate-pulse"
        />
      )}
      {/* Outer housing */}
      <circle
        r={14}
        fill="var(--card)"
        stroke={lit}
        strokeWidth={2}
        opacity={0.95}
      />
      {/* Light glow & core */}
      <circle
        r={7}
        fill={lit}
        style={{ filter: `drop-shadow(0 0 7px ${lit})` }}
      />
      {/* Junction tag */}
      <rect
        x={-38}
        y={19}
        width={76}
        height={18}
        rx={4}
        fill="var(--card)"
        stroke="var(--border)"
        strokeWidth={0.8}
        opacity={0.92}
      />
      <text
        x={0}
        y={31}
        textAnchor="middle"
        fontSize={8.5}
        fontWeight={600}
        fontFamily="var(--font-mono)"
        fill={isNormal ? 'oklch(0.7 0.13 220)' : lit}
      >
        {id} · {SIGNAL_LABELS[status]}
      </text>
    </g>
  )
}

/**
 * Overlay card displayed when ambulance reaches the hospital
 */
function MissionCompleteOverlay({
  state,
}: {
  state: CorridorState
}) {
  const { missionStats, reset } = state
  if (!missionStats) return null

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-corridor/40 bg-card/95 p-6 text-center shadow-[0_0_40px_-8px_var(--corridor)] animate-in fade-in zoom-in-95 duration-300">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-corridor/15 ring-2 ring-corridor/40 shadow-[0_0_20px_var(--corridor)]">
          <CheckCircle2 className="h-8 w-8 text-corridor" />
        </div>

        <h3 className="text-xl font-bold tracking-tight text-foreground">
          MISSION COMPLETE
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          {missionStats.ambulanceId} safely delivered to{' '}
          <span className="font-semibold text-foreground">{missionStats.hospitalName}</span>
        </p>

        {/* 4 Core Summary Metrics */}
        <div className="mt-5 grid grid-cols-2 gap-3 text-left">
          <div className="rounded-lg border border-border bg-muted/40 p-3">
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Timer className="h-3.5 w-3.5 text-tech" />
              Travel Time
            </div>
            <p className="mt-1 font-mono text-lg font-bold text-tech">
              {missionStats.travelTime}
            </p>
            <span className="text-[10px] text-muted-foreground">vs 5m 20s standard</span>
          </div>

          <div className="rounded-lg border border-corridor/30 bg-corridor/10 p-3">
            <div className="flex items-center gap-1.5 text-[11px] text-corridor">
              <Zap className="h-3.5 w-3.5" />
              Time Saved
            </div>
            <p className="mt-1 font-mono text-lg font-bold text-corridor">
              {missionStats.timeSaved}
            </p>
            <span className="text-[10px] text-muted-foreground">252 sec delay eliminated</span>
          </div>

          <div className="rounded-lg border border-border bg-muted/40 p-3">
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-corridor" />
              Signals Cleared
            </div>
            <p className="mt-1 font-mono text-lg font-bold text-foreground">
              {missionStats.intersectionsCleared} / {missionStats.totalIntersections}
            </p>
            <span className="text-[10px] text-muted-foreground">100% green wave compliance</span>
          </div>

          <div className="rounded-lg border border-border bg-muted/40 p-3">
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Timer className="h-3.5 w-3.5 text-warn" />
              Corridor Duration
            </div>
            <p className="mt-1 font-mono text-lg font-bold text-warn">
              {missionStats.corridorDuration}
            </p>
            <span className="text-[10px] text-muted-foreground">Signals restored to normal</span>
          </div>
        </div>

        <div className="mt-5 flex justify-center">
          <Button
            onClick={reset}
            className="gap-2 bg-corridor font-semibold text-corridor-foreground hover:bg-corridor/90 cursor-pointer shadow-md"
          >
            <RotateCcw className="h-4 w-4" />
            RESTART SIMULATION
          </Button>
        </div>
      </div>
    </div>
  )
}

export function CityMap({ state }: { state: CorridorState }) {
  const {
    progress,
    routePredicted,
    corridorActive,
    signals,
    phase,
    driverWarning,
    selectedHospital,
    selectedAmbulance,
  } = state
  const pathRef = useRef<SVGPathElement>(null)
  const [len, setLen] = useState(0)

  useEffect(() => {
    if (pathRef.current) setLen(pathRef.current.getTotalLength())
  }, [])

  let ax = ORIGIN.x
  let ay = ORIGIN.y
  let angle = 0
  if (pathRef.current && len > 0) {
    const p = pathRef.current.getPointAtLength(progress * len)
    const p2 = pathRef.current.getPointAtLength(Math.min(len, progress * len + 1))
    ax = p.x
    ay = p.y
    angle = (Math.atan2(p2.y - p.y, p2.x - p.x) * 180) / Math.PI
  }

  const moving = corridorActive && progress > 0 && progress < 1

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl border border-border bg-[oklch(0.14_0.02_258)]">
      <div className="pointer-events-none absolute inset-0 grid-texture opacity-60" />

      {/* Mission Complete Modal Overlay */}
      {phase === 'arrived' && <MissionCompleteOverlay state={state} />}

      <svg
        viewBox={`0 0 ${MAP_VIEWBOX.w} ${MAP_VIEWBOX.h}`}
        className="relative h-full w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="hospitalGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--corridor)" stopOpacity={0.35} />
            <stop offset="1" stopColor="var(--corridor)" stopOpacity={0.05} />
          </linearGradient>
        </defs>

        {/* City blocks */}
        {CITY_BLOCKS.map((b, i) => (
          <rect
            key={i}
            x={b.x}
            y={b.y}
            width={b.w}
            height={b.h}
            rx={6}
            fill="oklch(0.22 0.02 260)"
            stroke="oklch(1 0 0 / 5%)"
          />
        ))}

        {/* Cross-street stubs at each intersection */}
        {signals.map((s) =>
          s.cross === 'v' ? (
            <line
              key={`c-${s.id}`}
              x1={s.x}
              y1={s.y - 70}
              x2={s.x}
              y2={s.y + 70}
              stroke="oklch(0.3 0.015 260)"
              strokeWidth={22}
              strokeLinecap="round"
            />
          ) : (
            <line
              key={`c-${s.id}`}
              x1={s.x - 70}
              y1={s.y}
              x2={s.x + 70}
              y2={s.y}
              stroke="oklch(0.3 0.015 260)"
              strokeWidth={22}
              strokeLinecap="round"
            />
          ),
        )}

        {/* The arterial road that carries the route */}
        <path
          d={ROUTE_PATH}
          fill="none"
          stroke="oklch(0.3 0.015 260)"
          strokeWidth={26}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Lane dashes */}
        <path
          d={ROUTE_PATH}
          fill="none"
          stroke="oklch(0.45 0.02 260)"
          strokeWidth={1.5}
          strokeDasharray="10 12"
          strokeLinecap="round"
        />

        {/* Predicted route (before corridor activation) */}
        {routePredicted && !corridorActive && (
          <path
            ref={pathRef}
            d={ROUTE_PATH}
            fill="none"
            stroke="var(--tech)"
            strokeWidth={5}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="4 12"
            opacity={0.9}
            className="animate-corridor-flow"
          />
        )}

        {/* Active glowing green corridor */}
        {(corridorActive || phase === 'arrived') && (
          <>
            <path
              d={ROUTE_PATH}
              fill="none"
              stroke="var(--corridor)"
              strokeWidth={18}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={phase === 'arrived' ? 0.15 : 0.35}
              style={{ filter: 'blur(4px)' }}
            />
            <path
              d={ROUTE_PATH}
              fill="none"
              stroke="var(--corridor)"
              strokeWidth={6}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={phase === 'arrived' ? 0.6 : 0.95}
              style={{ filter: 'drop-shadow(0 0 8px var(--corridor))' }}
            />
            {corridorActive && (
              <path
                d={ROUTE_PATH}
                fill="none"
                stroke="oklch(0.98 0.03 150)"
                strokeWidth={2}
                strokeLinecap="round"
                strokeDasharray="2 16"
                className="animate-corridor-flow"
              />
            )}
          </>
        )}

        {/* Hidden reference path for point sampling (always present) */}
        {!(routePredicted && !corridorActive) && (
          <path ref={pathRef} d={ROUTE_PATH} fill="none" stroke="none" />
        )}

        {/* Destination Hospital */}
        <g transform={`translate(${HOSPITAL.x} ${HOSPITAL.y})`}>
          <circle r={40} fill="url(#hospitalGrad)" />
          <rect
            x={-22}
            y={-22}
            width={44}
            height={44}
            rx={8}
            fill="var(--card)"
            stroke="var(--corridor)"
            strokeWidth={2}
          />
          <rect x={-4} y={-13} width={8} height={26} rx={2} fill="var(--corridor)" />
          <rect x={-13} y={-4} width={26} height={8} rx={2} fill="var(--corridor)" />
          <text
            x={0}
            y={40}
            textAnchor="middle"
            fontSize={10}
            fontFamily="var(--font-mono)"
            fontWeight={600}
            fill="var(--corridor)"
          >
            {selectedHospital.shortName}
          </text>
        </g>

        {/* Origin marker */}
        <g transform={`translate(${ORIGIN.x} ${ORIGIN.y})`}>
          <circle r={6} fill="var(--muted-foreground)" />
          <text
            x={0}
            y={26}
            textAnchor="middle"
            fontSize={9}
            fontFamily="var(--font-mono)"
            fill="var(--muted-foreground)"
          >
            DISPATCH ({selectedAmbulance.id})
          </text>
        </g>

        {/* Traffic signals */}
        {signals.map((s) => (
          <TrafficSignal
            key={s.id}
            id={s.id}
            x={s.x}
            y={s.y}
            status={s.status}
            name={s.name}
          />
        ))}

        {/* Ambulance Vehicle Marker */}
        {phase !== 'idle' && (
          <g transform={`translate(${ax} ${ay}) rotate(${angle})`}>
            {(moving || driverWarning) && (
              <ellipse
                rx={32}
                ry={22}
                fill="var(--primary)"
                opacity={0.32}
                className="animate-soft-pulse"
              />
            )}
            <rect
              x={-20}
              y={-11}
              width={40}
              height={22}
              rx={5}
              fill="oklch(0.97 0.005 250)"
              stroke="oklch(0.4 0.01 250)"
              strokeWidth={0.6}
            />
            {/* rear compartment stripe */}
            <rect x={-20} y={-11} width={14} height={22} rx={4} fill="var(--primary)" />
            {/* red cross */}
            <rect x={2} y={-4} width={8} height={2.4} rx={1} fill="var(--primary)" />
            <rect x={4.8} y={-6.8} width={2.4} height={8} rx={1} fill="var(--primary)" />
            {/* windshield */}
            <rect x={12} y={-7.5} width={5.5} height={15} rx={2} fill="var(--tech)" opacity={0.85} />
            {/* emergency light bar */}
            <rect
              x={-2}
              y={-12.5}
              width={6}
              height={3.5}
              rx={1}
              fill="var(--primary)"
              className={moving ? 'animate-light-flash' : ''}
            />
            <rect
              x={-2}
              y={9}
              width={6}
              height={3.5}
              rx={1}
              fill="var(--tech)"
              className={moving ? 'animate-light-flash' : ''}
            />
          </g>
        )}
      </svg>

      {/* Overlay labels */}
      <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-2 rounded-md border border-border bg-card/80 px-3 py-1.5 backdrop-blur">
        <span className="text-xs font-semibold tracking-wide text-muted-foreground">
          LIVE CORRIDOR MAP
        </span>
        <span
          className={`h-2 w-2 rounded-full ${
            corridorActive
              ? 'bg-corridor animate-soft-pulse'
              : phase === 'idle'
                ? 'bg-muted-foreground'
                : 'bg-warn animate-soft-pulse'
          }`}
        />
      </div>

      {(corridorActive || phase === 'arrived') && (
        <div className="pointer-events-none absolute right-4 top-4 rounded-md border border-corridor/40 bg-corridor/15 px-3 py-1.5 backdrop-blur shadow-[0_0_16px_-4px_var(--corridor)]">
          <span className="font-mono text-xs font-semibold text-corridor">
            {phase === 'arrived' ? 'CORRIDOR RELEASED · ARRIVED' : 'EMERGENCY CORRIDOR ACTIVE'}
          </span>
        </div>
      )}
    </div>
  )
}
