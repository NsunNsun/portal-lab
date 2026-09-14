/**
 * Domain types for the Portal Lab. This layer is framework-agnostic:
 * nothing here imports React or touches the DOM.
 */

export type PortalStatus = 'open' | 'questioned' | 'closed'

export type RiskLevel = 'none' | 'low' | 'medium' | 'high' | 'critical'

export type ActionType = 'stabilize' | 'close' | 'sendObserver' | 'toggleQuestioned'

/** A single entry in a portal's own change history. */
export interface HistoryEntry {
  id: string
  at: number
  message: string
}

export interface Portal {
  id: string
  /** Atmospheric display name, e.g. «Портал Багрового Шёпота». */
  name: string
  /** Destination world. */
  world: string
  /** 0..100 */
  energy: number
  /** 0..100 */
  stability: number
  /** Hours until collapse, 0..72. */
  hoursToCollapse: number
  /** 0..N */
  creaturesInside: number
  status: PortalStatus
  observerSent: boolean
  /** Per-portal change history. */
  history: HistoryEntry[]
}

/** A single entry in the shared, application-wide activity log. */
export interface LogEntry {
  id: string
  at: number
  portalId: string | null
  portalName: string | null
  kind: 'action' | 'blocked' | 'system'
  message: string
}

export interface AppState {
  portals: Portal[]
  log: LogEntry[]
  datasetKey: string
}

/** One weighted component of the risk score. */
export interface RiskPart {
  label: string
  /** The normalized 0..100 input value. */
  raw: number
  /** The weight applied to `raw`. */
  weight: number
  /** raw * weight — how much this part adds to the base score. */
  contribution: number
}

/** A hard modifier that can override or bump the base score. */
export interface RiskModifier {
  label: string
  applied: boolean
  effect: string
}

/** Full, explainable breakdown of a portal's risk. */
export interface RiskBreakdown {
  score: number
  level: RiskLevel
  parts: RiskPart[]
  modifiers: RiskModifier[]
}

/** Result of checking whether an action is permitted on a portal. */
export type ActionCheck =
  | { allowed: true }
  | { allowed: true; confirm: string }
  | { allowed: false; reason: string }

/** A recommended next action for a portal. */
export interface Recommendation {
  text: string
  action: ActionType | null
}
