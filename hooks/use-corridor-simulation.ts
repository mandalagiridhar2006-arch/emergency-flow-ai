'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  AMBULANCE_UNITS,
  HOSPITAL_DESTINATIONS,
  MOVE_MS,
  SIGNALS,
  STEP_MS,
  TOTAL_TIME_SAVED,
  type AmbulanceUnit,
  type HospitalDestination,
  type SignalConfig,
  type SignalStatus,
} from '@/lib/emergency-config'

export type Phase = 'idle' | 'detecting' | 'active' | 'arrived'

export type EventType =
  | 'detect'
  | 'camera'
  | 'siren'
  | 'verify'
  | 'route'
  | 'intersections'
  | 'coordinate'
  | 'corridor'
  | 'transit'
  | 'arrived'

export interface FeedEvent {
  id: number
  time: string
  label: string
  type: EventType
}

export interface MissionStats {
  travelTime: string
  timeSaved: string
  corridorDuration: string
  intersectionsCleared: number
  totalIntersections: number
  greenWaveCompliance: string
  hospitalName: string
  ambulanceId: string
}

export interface CorridorState {
  phase: Phase
  progress: number
  currentStep: number
  aiConf: number
  sirenConf: number
  sirenAudioLevel: number
  cameraActive: boolean
  cameraBBoxVisible: boolean
  sirenActive: boolean
  verified: boolean
  multiSensorConfirmed: boolean
  routePredicted: boolean
  coordinating: boolean
  corridorActive: boolean
  driverWarning: boolean
  timeSaved: number
  clearedCount: number
  speed: number
  setSpeed: (s: number) => void
  selectedAmbulance: AmbulanceUnit
  setSelectedAmbulance: (unit: AmbulanceUnit) => void
  selectedHospital: HospitalDestination
  setSelectedHospital: (hosp: HospitalDestination) => void
  events: FeedEvent[]
  signals: Array<SignalConfig & { status: SignalStatus }>
  missionStats: MissionStats | null
  start: () => void
  reset: () => void
  stop: () => void
}

export function useCorridorSimulation(): CorridorState {
  const [phase, setPhase] = useState<Phase>('idle')
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(-1)
  const [aiConf, setAiConf] = useState(0)
  const [sirenConf, setSirenConf] = useState(0)
  const [sirenAudioLevel, setSirenAudioLevel] = useState(0)
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraBBoxVisible, setCameraBBoxVisible] = useState(false)
  const [sirenActive, setSirenActive] = useState(false)
  const [verified, setVerified] = useState(false)
  const [multiSensorConfirmed, setMultiSensorConfirmed] = useState(false)
  const [routePredicted, setRoutePredicted] = useState(false)
  const [coordinating, setCoordinating] = useState(false)
  const [corridorActive, setCorridorActive] = useState(false)
  const [driverWarning, setDriverWarning] = useState(false)
  const [timeSaved, setTimeSaved] = useState(0)
  const [clearedCount, setClearedCount] = useState(0)
  const [speed, setSpeed] = useState(1)
  const [events, setEvents] = useState<FeedEvent[]>([])
  const [missionStats, setMissionStats] = useState<MissionStats | null>(null)

  const [selectedAmbulance, setSelectedAmbulance] = useState<AmbulanceUnit>(AMBULANCE_UNITS[0])
  const [selectedHospital, setSelectedHospital] = useState<HospitalDestination>(HOSPITAL_DESTINATIONS[0])

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])
  const rafRef = useRef<number | null>(null)
  const rampRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const audioIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const targetRef = useRef({ ai: 0, siren: 0 })
  const startTimeRef = useRef(0)
  const transitStartRef = useRef(0)
  const eventIdRef = useRef(0)
  const clearedJunctionsRef = useRef<Set<string>>(new Set())
  const isRunningRef = useRef(false)

  const clearAll = useCallback(() => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    if (rampRef.current !== null) {
      clearInterval(rampRef.current)
      rampRef.current = null
    }
    if (audioIntervalRef.current !== null) {
      clearInterval(audioIntervalRef.current)
      audioIntervalRef.current = null
    }
    isRunningRef.current = false
  }, [])

  useEffect(() => clearAll, [clearAll])

  const pushEvent = useCallback((label: string, type: EventType) => {
    const elapsed = startTimeRef.current > 0 ? (performance.now() - startTimeRef.current) / 1000 : 0
    setEvents((prev) => [
      {
        id: eventIdRef.current++,
        time: `T+${elapsed.toFixed(1)}s`,
        label,
        type,
      },
      ...prev,
    ])
  }, [])

  const reset = useCallback(() => {
    clearAll()
    setPhase('idle')
    setProgress(0)
    setCurrentStep(-1)
    setAiConf(0)
    setSirenConf(0)
    setSirenAudioLevel(0)
    setCameraActive(false)
    setCameraBBoxVisible(false)
    setSirenActive(false)
    setVerified(false)
    setMultiSensorConfirmed(false)
    setRoutePredicted(false)
    setCoordinating(false)
    setCorridorActive(false)
    setDriverWarning(false)
    setTimeSaved(0)
    setClearedCount(0)
    setEvents([])
    setMissionStats(null)
    targetRef.current = { ai: 0, siren: 0 }
    clearedJunctionsRef.current.clear()
    startTimeRef.current = 0
    transitStartRef.current = 0
  }, [clearAll])

  const stop = useCallback(() => {
    reset()
  }, [reset])

  const startMovement = useCallback(() => {
    transitStartRef.current = performance.now()
    const moveDuration = MOVE_MS / speed
    const startedAt = performance.now()

    const tick = (now: number) => {
      const p = Math.min(1, (now - startedAt) / moveDuration)
      setProgress(p)
      setTimeSaved(p * TOTAL_TIME_SAVED)

      // Track individual junction clearance as ambulance progresses past each junction
      SIGNALS.forEach((s) => {
        if (p >= s.at + 0.04 && !clearedJunctionsRef.current.has(s.id)) {
          clearedJunctionsRef.current.add(s.id)
          const newCount = clearedJunctionsRef.current.size
          setClearedCount(newCount)
          pushEvent(
            `Junction ${s.id} (${s.name}) passed [${newCount}/4] — Emergency hold released, signal restored to normal traffic cycle`,
            'coordinate',
          )
        }
      })

      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        setProgress(1)
        setTimeSaved(TOTAL_TIME_SAVED)
        setClearedCount(SIGNALS.length)
        setCurrentStep(9)
        setPhase('arrived')
        setDriverWarning(false)
        setCorridorActive(false)
        if (rampRef.current !== null) {
          clearInterval(rampRef.current)
          rampRef.current = null
        }
        if (audioIntervalRef.current !== null) {
          clearInterval(audioIntervalRef.current)
          audioIntervalRef.current = null
        }
        setSirenAudioLevel(0)

        const transitElapsedSec = transitStartRef.current > 0
          ? Math.round((performance.now() - transitStartRef.current) / 1000)
          : Math.round(MOVE_MS / 1000)

        setMissionStats({
          travelTime: selectedHospital.corridorEta,
          timeSaved: '4m 12s',
          corridorDuration: `${transitElapsedSec}s`,
          intersectionsCleared: SIGNALS.length,
          totalIntersections: SIGNALS.length,
          greenWaveCompliance: '100%',
          hospitalName: selectedHospital.name,
          ambulanceId: selectedAmbulance.id,
        })

        pushEvent(
          `MISSION COMPLETE — ${selectedAmbulance.id} safely arrived at ${selectedHospital.name} (${selectedHospital.department})`,
          'arrived',
        )
        pushEvent(
          'Corridor status: RELEASED / COMPLETED — All arterial signals restored to automated city grid timing',
          'corridor',
        )
        isRunningRef.current = false
      }
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [speed, pushEvent, selectedHospital, selectedAmbulance])

  const start = useCallback(() => {
    // Guard against duplicate triggers
    if (isRunningRef.current) return
    isRunningRef.current = true

    reset()
    isRunningRef.current = true
    startTimeRef.current = performance.now()
    setPhase('detecting')

    // Ease detection confidences smoothly toward their targets
    rampRef.current = setInterval(() => {
      setAiConf((c) => {
        const t = targetRef.current.ai
        return Math.abs(t - c) < 0.2 ? t : c + (t - c) * 0.15
      })
      setSirenConf((c) => {
        const t = targetRef.current.siren
        return Math.abs(t - c) < 0.2 ? t : c + (t - c) * 0.15
      })
    }, 45)

    // Dynamic simulated microphone sound spectrum
    audioIntervalRef.current = setInterval(() => {
      setSirenAudioLevel(() => {
        if (targetRef.current.siren > 50) {
          return 75 + Math.floor(Math.random() * 23)
        } else if (targetRef.current.siren > 0) {
          return 30 + Math.floor(Math.random() * 20)
        }
        return 4 + Math.floor(Math.random() * 8)
      })
    }, 120)

    const stepDuration = STEP_MS / speed

    // Sequence of 16-step core demo flow
    const actions: Array<() => void> = [
      // Step 0: Detect Ambulance via CCTV Camera
      () => {
        targetRef.current.ai = 98.4
        setCameraBBoxVisible(true)
        pushEvent(
          `CCTV Vision Model: Fast-approaching emergency vehicle detected [${selectedAmbulance.id}] (${targetRef.current.ai}% confidence)`,
          'detect',
        )
      },
      // Step 1: Camera Verification ACTIVE
      () => {
        setCameraActive(true)
        pushEvent(
          `Camera Verification: Optical signature ACTIVE & LOCKED · EMS Fleet Registry matched to ${selectedAmbulance.callSign}`,
          'camera',
        )
      },
      // Step 2: Siren Detected via Audio Input
      () => {
        setSirenActive(true)
        targetRef.current.siren = 96.2
        pushEvent(
          `Acoustic Sensor Array: High-priority emergency siren pattern detected (96.2% confidence, 88 dB, 900 Hz Yelp)`,
          'siren',
        )
      },
      // Step 3: Multimodal Fusion Engine combines Camera + Siren -> VERIFIED
      () => {
        setVerified(true)
        setMultiSensorConfirmed(true)
        pushEvent(
          'MULTIMODAL FUSION CONFIRMED: Dual visual CCTV + acoustic siren correlation verified emergency status (VERIFIED)',
          'verify',
        )
      },
      // Step 4: Predict Ambulance Route to Destination Hospital
      () => {
        setRoutePredicted(true)
        pushEvent(
          `Predictive Route Analysis: Optimal emergency path to ${selectedHospital.name} (${selectedHospital.distance}) locked`,
          'route',
        )
      },
      // Step 5: Identify Upcoming Intersections
      () => {
        pushEvent(
          `4 upcoming corridor intersections identified: ${SIGNALS.map((s) => `${s.id} (${s.name})`).join(', ')}`,
          'intersections',
        )
      },
      // Step 6: Automatically coordinate simulated traffic signals (Preempt cross traffic -> Amber)
      () => {
        setCoordinating(true)
        pushEvent(
          'Coordinating simulated traffic signal controllers — pre-empting cross traffic (Signals cycling AMBER → RED for cross streets)',
          'coordinate',
        )
      },
      // Step 7: Activate Green Corridor (Signals ahead RED -> GREEN) + Driver Warning
      () => {
        setCoordinating(false)
        setCorridorActive(true)
        setPhase('active')
        setDriverWarning(true)
        pushEvent(
          'EMERGENCY CORRIDOR ACTIVE: Green wave engaged ahead of ambulance route',
          'corridor',
        )
        pushEvent(
          `Driver Alert Broadcast: "AMBULANCE APPROACHING — CLEAR THE WAY" issued to connected vehicles along corridor`,
          'corridor',
        )
        setCurrentStep(8)
        pushEvent(
          `Ambulance ${selectedAmbulance.id} entering green corridor — transit in progress`,
          'transit',
        )
        startMovement()
      },
    ]

    actions.forEach((fn, i) => {
      const delay = i === 0 ? 300 : i * stepDuration
      const t = setTimeout(() => {
        setCurrentStep(i)
        fn()
      }, delay)
      timersRef.current.push(t)
    })
  }, [speed, reset, selectedAmbulance, selectedHospital, pushEvent, startMovement])

  // Compute dynamic signal states along the corridor:
  // - Holding RED when cross traffic is stopped
  // - Turning GREEN as ambulance approaches each intersection
  // - Returning to NORMAL / RESET once ambulance has passed
  const signals = useMemo(
    () =>
      SIGNALS.map((s) => {
        if (phase === 'arrived') {
          return { ...s, status: 'normal' as SignalStatus }
        }

        if (phase === 'idle') {
          return { ...s, status: 'red' as SignalStatus }
        }

        if (corridorActive) {
          // If ambulance has passed this junction:
          if (progress >= s.at + 0.04) {
            return { ...s, status: 'normal' as SignalStatus }
          }
          // If ambulance is in approach zone (within 24% before junction, or immediately ahead for first junction):
          const approachThreshold = s.id === 'JX-01' ? 0.28 : 0.22
          if (progress >= s.at - approachThreshold && progress < s.at + 0.04) {
            return { ...s, status: 'green' as SignalStatus }
          }
          // Upcoming junction holds red cross-traffic
          return { ...s, status: 'red' as SignalStatus }
        }

        if (coordinating) {
          return { ...s, status: 'amber' as SignalStatus }
        }

        return { ...s, status: 'red' as SignalStatus }
      }),
    [corridorActive, coordinating, phase, progress],
  )

  return {
    phase,
    progress,
    currentStep,
    aiConf,
    sirenConf,
    sirenAudioLevel,
    cameraActive,
    cameraBBoxVisible,
    sirenActive,
    verified,
    multiSensorConfirmed,
    routePredicted,
    coordinating,
    corridorActive,
    driverWarning,
    timeSaved,
    clearedCount,
    speed,
    setSpeed,
    selectedAmbulance,
    setSelectedAmbulance,
    selectedHospital,
    setSelectedHospital,
    events,
    signals,
    missionStats,
    start,
    reset,
    stop,
  }
}
