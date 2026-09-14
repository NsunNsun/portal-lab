import type { ActionType, AppState, ShiftKind } from '../domain/types'
import { advanceHour, applyAction, startShift } from '../domain/reducer'

/**
 * Thin React reducer over the domain functions. It contains no rules of its
 * own — every case delegates to a pure domain function.
 */
export type AppEvent =
  | { type: 'apply'; portalId: string; action: ActionType }
  | { type: 'advanceHour' }
  | { type: 'startShift'; kind: ShiftKind }

export function appReducer(state: AppState, event: AppEvent): AppState {
  switch (event.type) {
    case 'apply':
      return applyAction(state, event.portalId, event.action)
    case 'advanceHour':
      return advanceHour(state)
    case 'startShift':
      return startShift(event.kind)
  }
}

/** Initial state builder: begins with a populated «Новая смена». */
export function initAppState(kind: ShiftKind): AppState {
  return startShift(kind)
}
