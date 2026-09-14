import type { ActionType, AppState, HistoryEntry, LogEntry, Portal } from './types'
import { checkAction } from './rules'
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

/** Apply an effect to a portal, returning a new portal plus a human message. */
function effect(portal: Portal, action: ActionType): { portal: Portal; message: string } {
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
      return { portal: { ...portal, status: 'closed' }, message: 'Портал закрыт' }
    case 'sendObserver':
      return { portal: { ...portal, observerSent: true }, message: 'Отправлен наблюдатель' }
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
 * action mutates the portal and appends both an 'action' log entry and a
 * per-portal history entry.
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

  const { portal: updated, message } = effect(target, action)
  const withHistory: Portal = {
    ...updated,
    history: [historyEntry(message), ...updated.history],
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
 * points of stability; any portal that hits zero hours collapses (closes).
 */
export function advanceHour(state: AppState): AppState {
  const log: LogEntry[] = []
  const collapsedLog: LogEntry[] = []

  const portals = state.portals.map((portal) => {
    if (portal.status === 'closed') return portal

    const hoursToCollapse = Math.max(0, portal.hoursToCollapse - 1)
    const stability = Math.max(0, portal.stability - 3)
    let next: Portal = { ...portal, hoursToCollapse, stability }

    if (hoursToCollapse === 0) {
      next = {
        ...next,
        status: 'closed',
        history: [historyEntry('Портал схлопнулся'), ...next.history],
      }
      collapsedLog.push(logEntry(next, 'system', 'Портал схлопнулся'))
    }

    return next
  })

  log.push(logEntry(null, 'system', 'Прошёл час'))

  return {
    ...state,
    portals,
    log: [...collapsedLog, ...log, ...state.log],
  }
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
