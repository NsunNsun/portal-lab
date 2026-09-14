import type { ActionType, AppState } from '../domain/types'
import { advanceHour, applyAction, loadDataset } from '../domain/reducer'

/**
 * Thin React reducer over the domain functions. It contains no rules of its
 * own — every case delegates to a pure domain function.
 */
export type AppEvent =
  | { type: 'apply'; portalId: string; action: ActionType }
  | { type: 'advanceHour' }
  | { type: 'loadDataset'; key: string }

export function appReducer(state: AppState, event: AppEvent): AppState {
  switch (event.type) {
    case 'apply':
      return applyAction(state, event.portalId, event.action)
    case 'advanceHour':
      return advanceHour(state)
    case 'loadDataset':
      return loadDataset(event.key)
  }
}

/** Initial state builder. */
export function initAppState(key: string): AppState {
  return loadDataset(key)
}
