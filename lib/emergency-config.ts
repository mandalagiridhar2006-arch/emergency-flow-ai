// Static simulation configuration for the EmergencyFlow AI prototype.
// Coordinates are in the map SVG's 1000 x 600 viewBox.

export const MAP_VIEWBOX = { w: 1000, h: 600 }

// The ambulance route, following the main arterial through the city grid.
export const ROUTE_PATH =
  'M 60 500 L 260 500 L 260 340 L 500 340 L 500 200 L 720 200 L 720 380 L 940 380'

export const HOSPITAL = { x: 952, y: 380 }
export const ORIGIN = { x: 60, y: 500 }

export type SignalStatus = 'red' | 'amber' | 'green' | 'normal' | 'reset'

export interface SignalConfig {
  id: string
  name: string
  crossStreet: string
  speedLimit: string
  x: number
  y: number
  /** Route progress (0-1) at which the ambulance passes this intersection. */
  at: number
  /** Orientation of the cross-street stub through the intersection. */
  cross: 'h' | 'v'
}

export const SIGNALS: SignalConfig[] = [
  { id: 'JX-01', name: '4th & Main', crossStreet: '4th Avenue Arterial', speedLimit: '35 mph', x: 260, y: 500, at: 0.15, cross: 'v' },
  { id: 'JX-02', name: 'Central Ave', crossStreet: 'Central Boulevard', speedLimit: '40 mph', x: 500, y: 340, at: 0.44, cross: 'h' },
  { id: 'JX-03', name: 'Park Crossing', crossStreet: 'Park Lane Junction', speedLimit: '35 mph', x: 720, y: 200, at: 0.7, cross: 'v' },
  { id: 'JX-04', name: 'Hospital Gate', crossStreet: 'Emergency Access Rd', speedLimit: '25 mph', x: 820, y: 380, at: 0.9, cross: 'h' },
]

export interface AmbulanceUnit {
  id: string
  callSign: string
  type: string
  station: string
  crew: string
}

export const AMBULANCE_UNITS: AmbulanceUnit[] = [
  {
    id: 'MED-912',
    callSign: 'Rescue 912',
    type: 'Advanced Life Support (ALS)',
    station: 'North District EMS Hub',
    crew: 'Par. Chen & Par. Martinez',
  },
  {
    id: 'MED-404',
    callSign: 'Critical 404',
    type: 'Critical Care Transport (CCT)',
    station: 'West Metro Trauma Base',
    crew: 'Nurse Gomez & EMT Davis',
  },
  {
    id: 'MED-718',
    callSign: 'Medic 718',
    type: 'Rapid Intervention Vehicle',
    station: 'Downtown Central Station',
    crew: 'Par. Novak & Par. Wilson',
  },
]

export interface HospitalDestination {
  id: string
  name: string
  shortName: string
  department: string
  distance: string
  normalEta: string
  corridorEta: string
}

export const HOSPITAL_DESTINATIONS: HospitalDestination[] = [
  {
    id: 'hosp-city-gen',
    name: 'City General Hospital',
    shortName: 'CITY GENERAL',
    department: 'Level 1 Trauma Center',
    distance: '3.4 km',
    normalEta: '5m 20s',
    corridorEta: '1m 08s',
  },
  {
    id: 'hosp-st-jude',
    name: 'St. Jude Medical Center',
    shortName: 'ST. JUDE MED',
    department: 'Comprehensive Cardiac Center',
    distance: '3.6 km',
    normalEta: '5m 45s',
    corridorEta: '1m 14s',
  },
  {
    id: 'hosp-metro-ped',
    name: 'Metro Children\'s Hospital',
    shortName: 'METRO CHILD',
    department: 'Pediatric Emergency Care',
    distance: '3.8 km',
    normalEta: '6m 10s',
    corridorEta: '1m 18s',
  },
]

// Decorative city blocks behind the road network (dark control-room map).
export const CITY_BLOCKS = [
  { x: 40, y: 60, w: 150, h: 110 },
  { x: 220, y: 60, w: 180, h: 110 },
  { x: 560, y: 60, w: 150, h: 90 },
  { x: 760, y: 60, w: 200, h: 90 },
  { x: 40, y: 220, w: 150, h: 180 },
  { x: 320, y: 240, w: 120, h: 60 },
  { x: 560, y: 260, w: 130, h: 120 },
  { x: 800, y: 260, w: 160, h: 60 },
  { x: 60, y: 300, w: 120, h: 80 },
  { x: 320, y: 400, w: 120, h: 140 },
  { x: 560, y: 420, w: 120, h: 120 },
  { x: 760, y: 440, w: 120, h: 100 },
  { x: 900, y: 440, w: 60, h: 100 },
]

export interface WorkflowStep {
  key: string
  label: string
  detail: string
}

export const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    key: 'detect',
    label: 'Detect Ambulance',
    detail: 'CCTV vehicle detection',
  },
  {
    key: 'camera',
    label: 'Camera Verification',
    detail: 'Visual signature locked',
  },
  { key: 'siren', label: 'Siren Detection', detail: 'Acoustic pattern matched' },
  {
    key: 'verify',
    label: 'Verify Emergency',
    detail: 'Multi-sensor fusion',
  },
  { key: 'route', label: 'Predict Route', detail: 'Destination corridor locked' },
  {
    key: 'intersections',
    label: 'Identify Intersections',
    detail: '4 corridor junctions',
  },
  {
    key: 'coordinate',
    label: 'Coordinate Signals',
    detail: 'Pre-empt cross traffic',
  },
  {
    key: 'corridor',
    label: 'Activate Green Corridor',
    detail: 'Emergency corridor active',
  },
  { key: 'transit', label: 'Ambulance Transit', detail: 'Priority green wave' },
  { key: 'arrived', label: 'Hospital Arrival', detail: 'Corridor released' },
]

// Total simulated seconds saved versus normal signalling.
export const TOTAL_TIME_SAVED = 252 // 4:12 (320s - 68s)
export const STEP_MS = 2200 // Responsive step transition for demo
export const MOVE_MS = 36000 // 36s movement for smooth, brisk hackathon demo

export function formatClock(totalSeconds: number) {
  const s = Math.max(0, Math.round(totalSeconds))
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${m}:${r.toString().padStart(2, '0')}`
}
