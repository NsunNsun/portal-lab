import { describe, it, expect } from 'vitest'
import { advanceHour, spawnChance, startShift, MAX_OPEN_PORTALS } from '../domain/reducer'
import type { AppState } from '../domain/types'
import { makePortal, makeState } from './helpers'

/** Compare-friendly projection of the board (ignores runtime ids / timestamps). */
function project(state: AppState) {
  return state.portals.map((p) => ({
    name: p.name,
    world: p.world,
    energy: p.energy,
    stability: p.stability,
    hoursToCollapse: p.hoursToCollapse,
    creaturesInside: p.creaturesInside,
    status: p.status,
    surveyed: p.surveyed,
  }))
}

describe('spawnChance', () => {
  it('растёт с числом прошедших часов', () => {
    expect(spawnChance(3, 10)).toBeGreaterThan(spawnChance(3, 1))
  })

  it('падает с числом открытых порталов', () => {
    expect(spawnChance(2, 4)).toBeGreaterThan(spawnChance(8, 4))
  })
})

describe('advanceHour — появление порталов', () => {
  it('одно и то же зерно даёт одну и ту же последовательность появлений', () => {
    let a = startShift('empty')
    let b = startShift('empty')
    for (let i = 0; i < 12; i++) {
      a = advanceHour(a)
      b = advanceHour(b)
    }
    expect(project(a)).toEqual(project(b))
    // хотя бы один портал за это время появился
    expect(a.portals.length).toBeGreaterThan(0)
  })

  it('при 12 открытых портал не появляется никогда, бросок не расходуется', () => {
    const portals = Array.from({ length: MAX_OPEN_PORTALS }, (_, i) =>
      makePortal({ id: `p${i}`, name: `Портал ${i}`, hoursToCollapse: 50, stability: 80 }),
    )
    let state = makeState(portals)
    for (let i = 0; i < 20; i++) {
      const rngBefore = state.rng
      state = advanceHour(state)
      expect(state.portals.length).toBe(MAX_OPEN_PORTALS)
      expect(state.portals.filter((p) => p.status !== 'closed').length).toBe(MAX_OPEN_PORTALS)
      expect(state.rng).toBe(rngBefore)
      expect(state.lastSpawn).toBeNull()
    }
  })

  it('новый портал приходит неразведанным', () => {
    let state = startShift('empty')
    for (let i = 0; i < 30 && state.portals.length === 0; i++) {
      state = advanceHour(state)
    }
    expect(state.portals.length).toBeGreaterThan(0)
    for (const p of state.portals) {
      expect(p.surveyed).toBe(false)
      expect(p.status).not.toBe('closed')
      expect(p.spawnedAtHour).toBeGreaterThan(0)
    }
  })

  it('лаборатория не превышает потолок открытых порталов', () => {
    let state = startShift('empty')
    for (let i = 0; i < 200; i++) state = advanceHour(state)
    expect(state.portals.filter((p) => p.status !== 'closed').length).toBeLessThanOrEqual(
      MAX_OPEN_PORTALS,
    )
  })
})
