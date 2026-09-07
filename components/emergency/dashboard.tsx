'use client'

import { useCorridorSimulation } from '@/hooks/use-corridor-simulation'
import { TopBar } from './top-bar'
import { DriverAlert } from './driver-alert'
import { CityMap } from './city-map'
import { DetectionPanel } from './detection-panel'
import { WorkflowPipeline } from './workflow-pipeline'
import { CorridorStatus } from './corridor-status'
import { ActivityFeed } from './activity-feed'
import { IntelligentMobilityEngine } from './intelligent-mobility-engine'

export function Dashboard() {
  const state = useCorridorSimulation()

  return (
    <div className="flex min-h-screen flex-col xl:h-screen xl:overflow-hidden">
      <TopBar state={state} />
      <DriverAlert state={state} />

      <main className="grid flex-1 grid-cols-1 gap-3.5 overflow-hidden p-3 sm:p-4 xl:grid-cols-12">
        <div className="flex min-h-0 flex-col gap-3.5 xl:col-span-3">
          <DetectionPanel state={state} />
          <WorkflowPipeline state={state} />
        </div>

        <div className="flex min-h-0 flex-col gap-3 xl:col-span-6">
          <div className="min-h-[380px] flex-1 xl:min-h-0">
            <CityMap state={state} />
          </div>
          <IntelligentMobilityEngine state={state} />
        </div>

        <div className="flex min-h-0 flex-col gap-3.5 xl:col-span-3">
          <CorridorStatus state={state} />
          <ActivityFeed state={state} />
        </div>
      </main>

      {/* SIH Alignment Footer */}
      <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-border/50 bg-card/40 px-4 py-1.5 text-[10px] font-mono text-muted-foreground backdrop-blur">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-foreground">SIH 2026</span>
          <span>•</span>
          <span className="text-tech font-medium">Smart Vehicles</span>
          <span>•</span>
          <span className="rounded bg-muted px-1.5 py-0.2 font-bold text-foreground">SIH26203</span>
        </div>
        <p className="hidden md:block text-[9.5px] text-muted-foreground/80">
          Student Innovation — Creating intelligent devices to improve commutation sector
        </p>
        <div className="flex items-center gap-1.5 text-[9.5px]">
          <span className="h-1.5 w-1.5 rounded-full bg-corridor" />
          <span>Intelligent Emergency Mobility Software Prototype</span>
        </div>
      </footer>
    </div>
  )
}
