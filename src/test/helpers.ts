import type { AppState, Portal } from '../domain/types'
import { SEED } from '../domain/random'

/** Build a portal for tests; override only the fields a case cares about. */
export function makePortal(overrides: Partial<Portal> = {}): Portal {
  return {
    id: 't1',
    name: 'Тестовый портал',
    world: 'Тестмир',
    energy: 20,
    stability: 90,
    hoursToCollapse: 60,
    creaturesInside: 0,
    status: 'open',
    observerSent: false,
    surveyed: true,
    rescuerSent: false,
    spawnedAtHour: 0,
    history: [],
    ...overrides,
  }
}

/** Build an AppState around some portals, with a fresh generator seed. */
export function makeState(portals: Portal[] = [], overrides: Partial<AppState> = {}): AppState {
  return {
    portals,
    log: [],
    hoursElapsed: 0,
    rng: SEED,
    spawnCount: 0,
    usedNameIndices: [],
    lastSpawn: null,
    ...overrides,
  }
}
