'use client'

import { Check } from 'lucide-react'
import { WORKFLOW_STEPS } from '@/lib/emergency-config'
import type { CorridorState } from '@/hooks/use-corridor-simulation'

export function WorkflowPipeline({ state }: { state: CorridorState }) {
  const { currentStep, phase, selectedAmbulance, selectedHospital } = state

  return (
    <section className="flex min-h-0 flex-1 flex-col rounded-xl border border-border bg-card p-3.5 sm:p-4">
      <div className="mb-2.5 flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-tight">
          Corridor Workflow
        </h2>
        <span className="font-mono text-[10px] uppercase text-muted-foreground">
          {phase === 'idle'
            ? 'READY'
            : phase === 'arrived'
              ? 'COMPLETE'
              : `STEP ${Math.min(WORKFLOW_STEPS.length, currentStep + 1)}/${WORKFLOW_STEPS.length}`}
        </span>
      </div>

      <ol className="min-h-0 flex-1 space-y-0 overflow-y-auto pr-1">
        {WORKFLOW_STEPS.map((step, i) => {
          const done = i < currentStep || phase === 'arrived'
          const active = i === currentStep && phase !== 'arrived'
          const last = i === WORKFLOW_STEPS.length - 1

          let dynamicDetail = step.detail
          if (step.key === 'detect') {
            dynamicDetail = `Optical tracking · ${selectedAmbulance.id}`
          } else if (step.key === 'verify') {
            dynamicDetail = 'Multimodal CCTV + siren fusion'
          } else if (step.key === 'route') {
            dynamicDetail = `Route locked → ${selectedHospital.shortName}`
          } else if (step.key === 'coordinate') {
            dynamicDetail = 'Temporary priority granted to corridor'
          } else if (step.key === 'alert') {
            dynamicDetail = 'V2X driver alert broadcast'
          } else if (step.key === 'restore') {
            dynamicDetail =
              phase === 'arrived'
                ? 'All junctions restored to normal cycle'
                : state.clearedCount > 0
                  ? `${state.clearedCount}/4 junctions restored to normal`
                  : 'Pending vehicle clearance'
          }

          return (
            <li key={step.key} className="flex gap-2.5 sm:gap-3">
              <div className="flex flex-col items-center">
                <span
                  className={`flex h-5 w-5 sm:h-6 sm:w-6 shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold transition-colors ${
                    done
                      ? 'border-corridor bg-corridor text-corridor-foreground'
                      : active
                        ? 'border-primary bg-primary/15 text-primary animate-soft-pulse'
                        : 'border-border bg-muted text-muted-foreground'
                  }`}
                >
                  {done ? <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> : i + 1}
                </span>
                {!last && (
                  <span
                    className={`my-0.5 w-px flex-1 ${
                      done ? 'bg-corridor/50' : 'bg-border'
                    }`}
                    style={{ minHeight: 12 }}
                  />
                )}
              </div>
              <div className={`pb-2.5 ${active ? '' : 'opacity-90'}`}>
                <p
                  className={`text-[12px] sm:text-[13px] font-medium leading-tight ${
                    active
                      ? 'text-primary'
                      : done
                        ? 'text-foreground'
                        : 'text-muted-foreground'
                  }`}
                >
                  {step.label}
                </p>
                <p className="text-[10px] sm:text-[11px] text-muted-foreground">
                  {dynamicDetail}
                </p>
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
