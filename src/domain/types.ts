/**
 * Domain types for the Portal Lab. This layer is framework-agnostic:
 * nothing here imports React or touches the DOM.
 */

export type PortalStatus = 'open' | 'questioned' | 'closed'

export type RiskLevel = 'unknown' | 'none' | 'low' | 'medium' | 'high' | 'critical'

export type ActionType =
  | 'stabilize'
  | 'close'
  | 'sendObserver'
  | 'recallObserver'
  | 'sendRescuer'
  | 'recallRescuer'
  | 'evacuate'
  | 'toggleQuestioned'

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
  /** Portal has been surveyed — its parameters are known. */
  surveyed: boolean
  /** A rescuer is currently inside the portal. */
  rescuerSent: boolean
  /** The shift hour at which this portal appeared (0 for starting portals). */
  spawnedAtHour: number
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

/** Which shift to start: a populated lab or an empty one. */
export type ShiftKind = 'new' | 'empty'

export interface AppState {
  portals: Portal[]
  log: LogEntry[]
  /** How many times «Прошёл час» has been pressed this shift. */
  hoursElapsed: number
  /** Current PRNG state (see domain/random.ts); reset with every shift. */
  rng: number
  /** Total portals spawned this shift — drives id and name cycling. */
  spawnCount: number
  /** Name-pool indices already used in the current naming cycle. */
  usedNameIndices: number[]
  /**
   * Name of the portal spawned by the most recent advanceHour, or null if none.
   * A UI-facing hint so the «Прошёл час» toast can mention a new portal.
   */
  lastSpawn: string | null
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

/**
 * One factor applied sequentially after the base. Each factor pulls the running
 * risk a share `k` of the way toward 100: `after = before + (100 - before) * k`.
 * Non-applied factors are still returned (applied: false) so the UI can show
 * them muted with a note explaining why they did not fire.
 */
export interface RiskStep {
  label: string
  applied: boolean
  /** The share of the remaining distance to 100 this factor took (0 if not applied). */
  share: number
  /** Running risk before this factor. */
  before: number
  /** Running risk after this factor. */
  after: number
  /** after - before. */
  delta: number
  /** Human note: the trigger phrase, or why the factor did not apply. */
  note: string
}

/** Full, explainable breakdown of a portal's risk. */
export interface RiskBreakdown {
  /** false when the portal is not surveyed — nothing below is meaningful. */
  known: boolean
  score: number
  level: RiskLevel
  /** The three weighted base indicators. */
  parts: RiskPart[]
  /** The weighted base score (sum of `parts` contributions). */
  base: number
  /** Sequential factors, in order, including the ones that did not fire. */
  steps: RiskStep[]
  /** The applied factor that added the most, or null if none applied. */
  dominant: { label: string; delta: number } | null
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
