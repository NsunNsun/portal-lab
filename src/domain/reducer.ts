import type { ActionType, AppState, HistoryEntry, LogEntry, Portal } from './types'
import { checkAction } from './rules'
import { computeRisk } from './risk'
import { getDataset } from '../data/datasets'

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
 * collapses (closes), resets its people-inside flags, and logs who was left behind.
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

  const tick = logEntry(null, 'system', 'Прошёл час')

  return {
    ...state,
    portals,
    log: [...collapsedLog, tick, ...state.log],
  }
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
 * Replace the current portals with a demo dataset, clearing the log and
 * recording a system entry about the load. Portals are deep-copied so the
 * immutable datasets are never mutated by later actions.
 */
export function loadDataset(key: string): AppState {
  const dataset = getDataset(key)
  const portals = dataset.portals.map((portal) => ({
    ...portal,
    history: [...portal.history],
  }))

  return {
    portals,
    log: [logEntry(null, 'system', `Загружен набор: «${dataset.name}»`)],
    datasetKey: dataset.key,
  }
}
