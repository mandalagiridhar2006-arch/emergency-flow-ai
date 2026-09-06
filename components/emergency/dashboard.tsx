'use client'

import { useCorridorSimulation } from '@/hooks/use-corridor-simulation'
import { TopBar } from './top-bar'
import { DriverAlert } from './driver-alert'
import { CityMap } from './city-map'
import { DetectionPanel } from './detection-panel'
import { WorkflowPipeline } from './workflow-pipeline'
import { CorridorStatus } from './corridor-status'
import { ActivityFeed } from './activity-feed'

export function Dashboard() {
  const state = useCorridorSimulation()

  return (
    <div className="flex min-h-screen flex-col xl:h-screen xl:overflow-hidden">
      <TopBar state={state} />
      <DriverAlert state={state} />

      <main className="grid flex-1 grid-cols-1 gap-4 overflow-hidden p-4 xl:grid-cols-12">
        <div className="flex min-h-0 flex-col gap-4 xl:col-span-3">
          <DetectionPanel state={state} />
          <WorkflowPipeline state={state} />
        </div>

        <div className="min-h-[440px] xl:col-span-6 xl:min-h-0">
          <CityMap state={state} />
        </div>

        <div className="flex min-h-0 flex-col gap-4 xl:col-span-3">
          <CorridorStatus state={state} />
          <ActivityFeed state={state} />
        </div>
      </main>
    </div>
  )
}
