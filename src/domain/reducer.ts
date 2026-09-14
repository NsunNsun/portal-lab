import type { ActionType, AppState, HistoryEntry, LogEntry, Portal, ShiftKind } from './types'
import { checkAction } from './rules'
import { computeRisk } from './risk'
import { SEED, nextRandom, randomInt } from './random'
import { NEW_SHIFT_PORTALS, SPAWN_NAMES } from '../data/datasets'

/** The lab holds at most this many open portals; no new ones appear at the cap. */
export const MAX_OPEN_PORTALS = 12

/**
 * Monotonic id generator for runtime-created log/history entries.
 * Kept out of the datasets so demo data stays fully deterministic.
 */
let idCounter = 0
function nextId(prefix: string): string {
  idCounter += 1
  return `${prefix}-${idCounter}`
}

function logEntry(
  portal: Portal | null,
  kind: LogEntry['kind'],
  message: string,
): LogEntry {
  return {
    id: nextId('log'),
    at: Date.now(),
    portalId: portal ? portal.id : null,
    portalName: portal ? portal.name : null,
    kind,
    message,
  }
}

function historyEntry(message: string): HistoryEntry {
  return { id: nextId('hist'), at: Date.now(), message }
}

interface Effect {
  portal: Portal
  /** The action message: goes to the shared log and the portal history. */
  message: string
  /** Extra history-only notes (e.g. a survey report), newest last. */
  extraHistory?: string[]
}

/** Apply an effect to a portal, returning a new portal plus human messages. */
function effect(portal: Portal, action: ActionType): Effect {
  switch (action) {
    case 'stabilize': {
      const stability = Math.min(100, portal.stability + 25)
      const energy = Math.max(0, portal.energy - 10)
      return {
        portal: { ...portal, stability, energy },
        message: `Стабилизирован: устойчивость ${portal.stability}→${stability}%, энергия ${portal.energy}→${energy}%`,
      }
    }
    case 'close':
      return {
        portal: { ...portal, status: 'closed', observerSent: false, rescuerSent: false },
        message: 'Портал закрыт',
      }
    case 'sendObserver': {
      const wasUnsurveyed = !portal.surveyed
      return {
        portal: { ...portal, observerSent: true, surveyed: true },
        message: 'Отправлен наблюдатель',
        extraHistory: wasUnsurveyed
          ? [
              `Разведка проведена: энергия ${portal.energy}, стабильность ${portal.stability}, существ внутри ${portal.creaturesInside}`,
            ]
          : undefined,
      }
    }
    case 'recallObserver':
      return { portal: { ...portal, observerSent: false }, message: 'Наблюдатель отозван' }
    case 'sendRescuer':
      return { portal: { ...portal, rescuerSent: true }, message: 'Отправлен спасатель' }
    case 'recallRescuer':
      return { portal: { ...portal, rescuerSent: false }, message: 'Спасатель отозван' }
    case 'evacuate': {
      const n = portal.creaturesInside
      return {
        portal: { ...portal, creaturesInside: 0, rescuerSent: false },
        message: `Эвакуировано существ: ${n}. Спасатель вышел вместе с ними.`,
      }
    }
    case 'toggleQuestioned': {
      const status = portal.status === 'questioned' ? 'open' : 'questioned'
      return {
        portal: { ...portal, status },
        message: status === 'questioned' ? 'Помечен как сомнительный' : 'Снята пометка сомнительного',
      }
    }
  }
}

/**
 * Apply an action to a single portal, returning a new AppState.
 *
 * The rule check lives here, not just in the UI: a forbidden action leaves the
 * portal untouched and appends a 'blocked' entry to the shared log. An allowed
 * action mutates the portal and appends both an 'action' log entry and one or
 * more per-portal history entries.
 */
export function applyAction(state: AppState, portalId: string, action: ActionType): AppState {
  const target = state.portals.find((p) => p.id === portalId)
  if (!target) return state

  const check = checkAction(target, action)

  if (!check.allowed) {
    return {
      ...state,
      log: [logEntry(target, 'blocked', check.reason), ...state.log],
    }
  }

  const { portal: updated, message, extraHistory } = effect(target, action)
  const notes = [message, ...(extraHistory ?? [])]
  const withHistory: Portal = {
    ...updated,
    history: [...notes.map(historyEntry), ...updated.history],
  }

  return {
    ...state,
    portals: state.portals.map((p) => (p.id === portalId ? withHistory : p)),
    log: [logEntry(withHistory, 'action', message), ...state.log],
  }
}

/**
 * Advance the simulation by one hour. Time never ticks on its own — this is the
 * only way clocks move. Every non-closed portal loses an hour of runway and 3
 * points of stability. Portals with an observer inside get detailed telemetry in
 * their history; the rest get a short note. Any portal that hits zero hours
 * collapses (closes), resets its people-inside flags, and logs who was left
 * behind. Finally, a new (unsurveyed) portal may appear — see `maybeSpawn`.
 */
export function advanceHour(state: AppState): AppState {
  const collapsedLog: LogEntry[] = []

  const portals = state.portals.map((portal) => {
    if (portal.status === 'closed') return portal

    const hoursToCollapse = Math.max(0, portal.hoursToCollapse - 1)
    const stability = Math.max(0, portal.stability - 3)
    let next: Portal = { ...portal, hoursToCollapse, stability }

    const note = portal.observerSent
      ? hourlyTelemetry(portal, next)
      : 'Час прошёл.'
    next = { ...next, history: [historyEntry(note), ...next.history] }

    if (hoursToCollapse === 0) {
      collapsedLog.push(logEntry(next, 'system', collapseMessage(portal)))
      next = {
        ...next,
        status: 'closed',
        observerSent: false,
        rescuerSent: false,
        history: [historyEntry('Портал схлопнулся.'), ...next.history],
      }
    }

    return next
  })

  const hoursElapsed = state.hoursElapsed + 1
  const tick = logEntry(null, 'system', 'Прошёл час')

  // A new portal may appear once collapses are resolved.
  const spawn = maybeSpawn(state, portals, hoursElapsed)

  return {
    ...state,
    portals: spawn.portals,
    hoursElapsed,
    rng: spawn.rng,
    spawnCount: spawn.spawnCount,
    usedNameIndices: spawn.usedNameIndices,
    lastSpawn: spawn.name,
    log: [...spawn.log, ...collapsedLog, tick, ...state.log],
  }
}

/**
 * Probability that a new portal appears this hour. Rises as the lab empties
 * out and, slowly, as the shift wears on; capped so a long shift never becomes
 * a guaranteed spawn.
 */
export function spawnChance(open: number, hoursElapsed: number): number {
  return 0.35 * (1 - open / MAX_OPEN_PORTALS) + Math.min(0.25, hoursElapsed * 0.02)
}

interface SpawnResult {
  portals: Portal[]
  rng: number
  spawnCount: number
  usedNameIndices: number[]
  log: LogEntry[]
  /** Name of the portal that appeared, or null if none did. */
  name: string | null
}

/**
 * Decide whether a portal appears and, if so, roll its parameters and name.
 * Threads the seeded generator state so the same shift always spawns the same
 * portals. No roll is consumed when the lab is already at the open cap.
 */
function maybeSpawn(state: AppState, portals: Portal[], hoursElapsed: number): SpawnResult {
  const base: SpawnResult = {
    portals,
    rng: state.rng,
    spawnCount: state.spawnCount,
    usedNameIndices: state.usedNameIndices,
    log: [],
    name: null,
  }

  const open = portals.filter((p) => p.status !== 'closed').length
  if (open >= MAX_OPEN_PORTALS) return base

  const decision = nextRandom(state.rng)
  const chance = spawnChance(open, hoursElapsed)
  if (decision.value >= chance) {
    return { ...base, rng: decision.next }
  }

  // Roll parameters in a fixed order, then pick a name — all from one generator.
  const energy = randomInt(decision.next, 20, 100)
  const stability = randomInt(energy.next, 5, 95)
  const collapse = randomInt(stability.next, 3, 60)
  const creatures = randomInt(collapse.next, 0, 4)
  const named = pickSpawnName(creatures.next, state.spawnCount, state.usedNameIndices)

  const portal: Portal = {
    id: nextId('portal'),
    name: named.name,
    world: named.world,
    energy: energy.value,
    stability: stability.value,
    hoursToCollapse: collapse.value,
    creaturesInside: creatures.value,
    status: 'open',
    observerSent: false,
    surveyed: false,
    rescuerSent: false,
    spawnedAtHour: hoursElapsed,
    history: [],
  }

  return {
    portals: [...portals, portal],
    rng: named.rng,
    spawnCount: state.spawnCount + 1,
    usedNameIndices: named.usedNameIndices,
    log: [
      logEntry(
        portal,
        'system',
        `Открылся новый портал: ${portal.name} (мир ${portal.world}). Параметры неизвестны.`,
      ),
    ],
    name: portal.name,
  }
}

/**
 * Pick a name from the pool: a random unused entry this cycle. Once the pool is
 * exhausted a fresh cycle starts and a Roman numeral (II, III, …) is appended.
 */
function pickSpawnName(
  rng: number,
  spawnCount: number,
  usedNameIndices: number[],
): { name: string; world: string; usedNameIndices: number[]; rng: number } {
  const poolLen = SPAWN_NAMES.length
  const used = usedNameIndices.length >= poolLen ? [] : usedNameIndices

  const available: number[] = []
  for (let i = 0; i < poolLen; i++) {
    if (!used.includes(i)) available.push(i)
  }

  const pick = randomInt(rng, 0, available.length - 1)
  const idx = available[pick.value]!
  const entry = SPAWN_NAMES[idx]!

  const cycle = Math.floor(spawnCount / poolLen) + 1
  const name = cycle > 1 ? `${entry.name} ${toRoman(cycle)}` : entry.name

  return { name, world: entry.world, usedNameIndices: [...used, idx], rng: pick.next }
}

const ROMAN: [number, string][] = [
  [10, 'X'],
  [9, 'IX'],
  [5, 'V'],
  [4, 'IV'],
  [1, 'I'],
]

/** Small Roman-numeral formatter — only ever used for low repeat counts. */
function toRoman(n: number): string {
  let out = ''
  let rest = n
  for (const [value, symbol] of ROMAN) {
    while (rest >= value) {
      out += symbol
      rest -= value
    }
  }
  return out
}

/** Detailed hour-change note for a portal with an observer inside. */
function hourlyTelemetry(before: Portal, after: Portal): string {
  const riskBefore = computeRisk(before).score
  const riskAfter = computeRisk(after).score
  return (
    `Час прошёл. Стабильность ${before.stability}→${after.stability}, ` +
    `энергия ${after.energy}, ` +
    `до схлопывания ${before.hoursToCollapse}→${after.hoursToCollapse} ч, ` +
    `риск ${riskBefore}→${riskAfter}.`
  )
}

/** System-log line for a collapsing portal, naming everyone left inside. */
function collapseMessage(portal: Portal): string {
  const left: string[] = []
  if (portal.creaturesInside > 0) left.push(`существ ${portal.creaturesInside}`)
  if (portal.observerSent) left.push('наблюдатель')
  if (portal.rescuerSent) left.push('спасатель')
  if (left.length === 0) return 'Портал схлопнулся.'
  return `Портал схлопнулся. Внутри оставались: ${left.join(', ')}.`
}

/**
 * Start a fresh shift, fully resetting state: portals, log, the hour counter and
 * the generator seed. «Новая смена» loads the starting board (portals deep-copied
 * so the static dataset is never mutated); «Пустая смена» starts with none.
 */
export function startShift(kind: ShiftKind): AppState {
  const portals =
    kind === 'empty'
      ? []
      : NEW_SHIFT_PORTALS.map((portal) => ({ ...portal, history: [...portal.history] }))

  const message =
    kind === 'empty'
      ? 'Началась пустая смена: активных порталов нет.'
      : `Началась новая смена: порталов ${portals.length}.`

  return {
    portals,
    log: [logEntry(null, 'system', message)],
    hoursElapsed: 0,
    rng: SEED,
    spawnCount: 0,
    usedNameIndices: [],
    lastSpawn: null,
  }
}
