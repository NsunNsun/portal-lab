import type { Portal } from '../domain/types'

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
    history: [],
    ...overrides,
  }
}
