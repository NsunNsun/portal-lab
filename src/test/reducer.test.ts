import { describe, it, expect } from 'vitest'
import { applyAction, advanceHour } from '../domain/reducer'
import { computeRisk } from '../domain/risk'
import type { AppState } from '../domain/types'
import { makePortal } from './helpers'

function stateWith(...portals: ReturnType<typeof makePortal>[]): AppState {
  return { portals, log: [], datasetKey: 'test' }
}

describe('applyAction', () => {
  it('после стабилизации риск снижается, а в журнале появляется запись action', () => {
    const before = makePortal({ id: 'p', stability: 40, energy: 75, hoursToCollapse: 12 })
    const state = stateWith(before)

    const next = applyAction(state, 'p', 'stabilize')
    const after = next.portals.find((p) => p.id === 'p')!

    expect(computeRisk(after).score).toBeLessThan(computeRisk(before).score)
    expect(after.stability).toBe(65)
    expect(after.energy).toBe(65)
    expect(next.log[0]?.kind).toBe('action')
    expect(after.history).toHaveLength(1)
  })

  it('запрещённое действие не меняет портал, но добавляет запись blocked', () => {
    const closed = makePortal({ id: 'p', status: 'closed' })
    const state = stateWith(closed)

    const next = applyAction(state, 'p', 'stabilize')
    const after = next.portals.find((p) => p.id === 'p')!

    expect(after).toEqual(closed) // портал не тронут
    expect(next.log[0]?.kind).toBe('blocked')
    expect(next.log[0]?.message).toBe('Портал закрыт — стабилизировать нечего.')
  })

  it('advanceHour закрывает портал, у которого время вышло', () => {
    const dying = makePortal({ id: 'p', hoursToCollapse: 1, stability: 50, status: 'open' })
    const state = stateWith(dying)

    const next = advanceHour(state)
    const after = next.portals.find((p) => p.id === 'p')!

    expect(after.hoursToCollapse).toBe(0)
    expect(after.status).toBe('closed')
    expect(next.log.some((e) => e.kind === 'system' && e.message === 'Портал схлопнулся')).toBe(true)
    expect(next.log.some((e) => e.kind === 'system' && e.message === 'Прошёл час')).toBe(true)
  })
})
