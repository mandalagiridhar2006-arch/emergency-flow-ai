'use client'

import { BrainCircuit, Camera, Mic, ShieldAlert, Volume2, type LucideIcon } from 'lucide-react'
import type { CorridorState } from '@/hooks/use-corridor-simulation'

function ConfidenceBar({ value, tone }: { value: number; tone: string }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <div
        className="h-full rounded-full transition-[width] duration-150 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, value))}%`, backgroundColor: tone }}
      />
    </div>
  )
}

/**
 * Simulated live CCTV camera viewport with bounding box and HUD telemetry
 */
function SimulatedCCTVViewport({ state }: { state: CorridorState }) {
  const { phase, aiConf, cameraActive, cameraBBoxVisible, selectedAmbulance } = state
  const isScanning = phase !== 'idle'

  return (
    <div className="relative mb-3 h-24 w-full overflow-hidden rounded-lg border border-border bg-black/80 font-mono text-[10px]">
      {/* CCTV static scanline effect */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.4)_50%)] bg-[length:100%_4px] opacity-40" />

      {/* CCTV HUD Header */}
      <div className="absolute left-2 top-1.5 right-2 flex items-center justify-between text-[9px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              cameraActive ? 'bg-primary animate-ping' : isScanning ? 'bg-warn animate-pulse' : 'bg-muted-foreground'
            }`}
          />
          <span className="font-semibold text-foreground">
            {cameraActive ? 'CAM-04 · LIVE FEED' : 'CAM-04 · 4TH & MAIN'}
          </span>
        </span>
        <span className="text-[9px] font-mono">
          {cameraActive ? (
            <span className="font-semibold text-primary">● REC 30FPS</span>
          ) : isScanning ? (
            <span className="text-warn">SCANNING...</span>
          ) : (
            'STANDBY'
          )}
        </span>
      </div>

      {/* Crosshairs & Center target */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-10 w-10 rounded-full border border-white/10 opacity-60" />
        <div className="absolute h-px w-16 bg-white/15" />
        <div className="absolute h-16 w-px bg-white/15" />
      </div>

      {/* Target Bounding Box when detected */}
      {cameraBBoxVisible && (
        <div className="absolute inset-x-8 inset-y-4 flex items-center justify-center">
          <div className="relative h-12 w-32 rounded border border-primary bg-primary/10 shadow-[0_0_12px_rgba(255,0,0,0.3)] transition-all">
            {/* Corner brackets */}
            <div className="absolute -left-1 -top-1 h-2 w-2 border-l-2 border-t-2 border-primary" />
            <div className="absolute -right-1 -top-1 h-2 w-2 border-r-2 border-t-2 border-primary" />
            <div className="absolute -left-1 -bottom-1 h-2 w-2 border-l-2 border-b-2 border-primary" />
            <div className="absolute -right-1 -bottom-1 h-2 w-2 border-r-2 border-b-2 border-primary" />

            <div className="flex h-full flex-col justify-between p-1 text-[8px] leading-tight">
              <span className="font-semibold text-primary">
                {selectedAmbulance.id} · DETECTED
              </span>
              <div className="flex items-center justify-between text-white/90">
                <span>EMS VEHICLE</span>
                <span className="font-bold text-primary">{aiConf.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Standby / Scanning prompt */}
      {!cameraBBoxVisible && (
        <div className="flex h-full items-center justify-center text-center text-[10px] text-muted-foreground/80">
          {isScanning ? (
            <span className="animate-pulse text-tech">Analyzing optical street traffic...</span>
          ) : (
            <span>CCTV Vision Neural Net Ready</span>
          )}
        </div>
      )}

      {/* Bottom Telemetry */}
      <div className="absolute bottom-1 left-2 right-2 flex justify-between text-[8px] text-muted-foreground">
        <span>SENSOR: RGB-HD-CCTV</span>
        <span>OPTICAL LOCK: {cameraActive ? 'ACTIVE' : 'IDLE'}</span>
      </div>
    </div>
  )
}

/**
 * Simulated acoustic microphone sound spectrum visualizer
 */
function SimulatedAudioSpectrum({ state }: { state: CorridorState }) {
  const { sirenActive, sirenAudioLevel } = state

  // Simulated frequency bars
  const bars = [
    { freq: '200Hz', height: sirenActive ? 25 + (sirenAudioLevel % 25) : 8 },
    { freq: '500Hz', height: sirenActive ? 45 + (sirenAudioLevel % 35) : 12 },
    { freq: '850Hz', height: sirenActive ? 85 + (sirenAudioLevel % 15) : 10 },
    { freq: '960Hz', height: sirenActive ? 95 - (sirenAudioLevel % 15) : 14 },
    { freq: '1.2k', height: sirenActive ? 75 + (sirenAudioLevel % 20) : 12 },
    { freq: '2.4k', height: sirenActive ? 40 + (sirenAudioLevel % 25) : 8 },
    { freq: '4.0k', height: sirenActive ? 20 + (sirenAudioLevel % 15) : 6 },
  ]

  return (
    <div className="mt-2 rounded-md border border-border/60 bg-muted/20 p-2 font-mono text-[10px]">
      <div className="mb-1.5 flex items-center justify-between text-[9px]">
        <span className="flex items-center gap-1 text-muted-foreground">
          <Mic className="h-3 w-3 text-warn" />
          Acoustic Mic Array
        </span>
        <span className="font-semibold text-warn">
          {sirenActive ? `${sirenAudioLevel} dB · SIREN MATCH` : '42 dB · AMBIENT'}
        </span>
      </div>
      <div className="flex h-7 items-end gap-1.5 justify-between px-1">
        {bars.map((bar, idx) => (
          <div key={idx} className="flex flex-1 flex-col items-center gap-0.5">
            <div
              className="w-full rounded-t transition-all duration-100"
              style={{
                height: `${bar.height}%`,
                backgroundColor: sirenActive ? 'var(--warn)' : 'var(--muted-foreground)',
                opacity: sirenActive ? 0.9 : 0.4,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

function DetectionCard({
  icon: Icon,
  title,
  status,
  active,
  confidence,
  tone,
  detail,
  children,
}: {
  icon: LucideIcon
  title: string
  status: string
  active: boolean
  confidence?: number
  tone: string
  detail: string
  children?: React.ReactNode
}) {
  return (
    <div
      className="rounded-lg border p-2.5 transition-colors"
      style={{
        borderColor: active ? tone : 'var(--border)',
        backgroundColor: active ? `color-mix(in oklch, ${tone} 8%, transparent)` : 'transparent',
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-md shrink-0"
            style={{
              backgroundColor: `color-mix(in oklch, ${tone} 15%, transparent)`,
              color: active ? tone : 'var(--muted-foreground)',
            }}
          >
            <Icon className="h-3.5 w-3.5" />
          </div>
          <div>
            <p className="text-xs font-semibold leading-tight">{title}</p>
            <p className="text-[11px] text-muted-foreground">{detail}</p>
          </div>
        </div>
        <span
          className="rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase shrink-0"
          style={{
            color: active ? tone : 'var(--muted-foreground)',
            backgroundColor: active
              ? `color-mix(in oklch, ${tone} 14%, transparent)`
              : 'var(--muted)',
          }}
        >
          {status}
        </span>
      </div>

      {confidence !== undefined && (
        <div className="mt-2 space-y-1">
          <div className="flex items-center justify-between font-mono text-[10px]">
            <span className="text-muted-foreground">confidence</span>
            <span style={{ color: active ? tone : 'var(--muted-foreground)' }}>
              {confidence.toFixed(1)}%
            </span>
          </div>
          <ConfidenceBar value={confidence} tone={tone} />
        </div>
      )}

      {children}
    </div>
  )
}

export function DetectionPanel({ state }: { state: CorridorState }) {
  const {
    phase,
    aiConf,
    sirenConf,
    cameraActive,
    sirenActive,
    verified,
    multiSensorConfirmed,
  } = state
  const scanning = phase !== 'idle'

  return (
    <section className="rounded-xl border border-border bg-card p-3 sm:p-4">
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <BrainCircuit className="h-4 w-4 text-tech" />
          <h2 className="text-sm font-semibold tracking-tight">AI Multimodal Detection</h2>
        </div>
        {multiSensorConfirmed ? (
          <span className="flex items-center gap-1.5 rounded border border-corridor/40 bg-corridor/15 px-2 py-0.5 font-mono text-[10px] font-semibold text-corridor shadow-[0_0_12px_-2px_var(--corridor)]">
            <span className="h-1.5 w-1.5 rounded-full bg-corridor animate-pulse" />
            FUSION VERIFIED
          </span>
        ) : (
          <span className="font-mono text-[10px] uppercase text-muted-foreground">
            {scanning ? 'FUSING SENSORS...' : 'DUAL STANDBY'}
          </span>
        )}
      </div>

      {/* Simulated live CCTV viewport */}
      <SimulatedCCTVViewport state={state} />

      <div className="space-y-2">
        {/* Optical / CCTV detection */}
        <DetectionCard
          icon={Camera}
          title="Camera Detection (CCTV)"
          detail="Vision model · Bounding box lock"
          tone="var(--corridor)"
          active={cameraActive}
          status={
            !scanning
              ? 'STANDBY'
              : cameraActive
                ? 'ACTIVE'
                : aiConf > 0
                  ? 'DETECTING'
                  : 'STANDBY'
          }
          confidence={cameraActive ? aiConf : aiConf > 0 ? aiConf : 0}
        />

        {/* Acoustic / Siren detection */}
        <DetectionCard
          icon={Volume2}
          title="Siren Detection (Audio)"
          detail="Microphone array · 850–960 Hz"
          tone="var(--warn)"
          active={sirenActive}
          status={!scanning ? 'STANDBY' : sirenActive ? 'ACTIVE' : 'LISTENING'}
          confidence={sirenActive ? sirenConf : sirenConf > 0 ? sirenConf : 0}
        >
          <SimulatedAudioSpectrum state={state} />
        </DetectionCard>

        {/* Multimodal Fusion Engine Card */}
        <div
          className={`rounded-lg border p-2.5 transition-colors ${
            multiSensorConfirmed
              ? 'border-corridor bg-corridor/10'
              : scanning
                ? 'border-tech/40 bg-tech/5'
                : 'border-border bg-muted/20'
          }`}
        >
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-semibold text-foreground">
              <ShieldAlert
                className={`h-3.5 w-3.5 ${
                  multiSensorConfirmed
                    ? 'text-corridor'
                    : scanning
                      ? 'text-tech animate-pulse'
                      : 'text-muted-foreground'
                }`}
              />
              Multimodal Fusion Engine
            </span>
            <span
              className={`font-mono text-[10px] font-semibold uppercase ${
                verified ? 'text-corridor' : 'text-muted-foreground'
              }`}
            >
              {verified ? 'VERIFIED' : scanning ? 'EVALUATING' : 'IDLE'}
            </span>
          </div>

          <p className="mt-1 text-[11px] text-muted-foreground leading-tight">
            {verified
              ? 'CCTV Visual (98.4%) + Siren Acoustic (96.2%) confirmed. Emergency corridor authorized.'
              : scanning
                ? 'Cross-correlating camera bounding box with acoustic frequency signature...'
                : 'Awaiting simultaneous optical & acoustic confirmation from municipal sensors.'}
          </p>
        </div>
      </div>
    </section>
  )
}
