import { describe, it, expect } from 'vitest'
import { computeRisk } from '../domain/risk'
import { makePortal } from './helpers'

describe('computeRisk', () => {
  it('спокойный портал даёт уровень low', () => {
    const r = computeRisk(makePortal({ stability: 90, energy: 20, hoursToCollapse: 60 }))
    expect(r.level).toBe('low')
    expect(r.score).toBeLessThan(30)
  })

  it('stability = 10 при хороших остальных параметрах всё равно даёт critical', () => {
    const r = computeRisk(makePortal({ stability: 10, energy: 5, hoursToCollapse: 72 }))
    expect(r.level).toBe('critical')
    expect(r.score).toBeGreaterThanOrEqual(85)
    expect(r.modifiers.find((m) => m.label.includes('нестабильность'))?.applied).toBe(true)
  })

  it('hoursToCollapse = 1 даёт critical', () => {
    const r = computeRisk(makePortal({ stability: 90, energy: 5, hoursToCollapse: 1 }))
    expect(r.level).toBe('critical')
    expect(r.score).toBeGreaterThanOrEqual(85)
  })

  it('закрытый портал даёт 0 и уровень none', () => {
    const r = computeRisk(makePortal({ status: 'closed', stability: 5, energy: 100 }))
    expect(r.score).toBe(0)
    expect(r.level).toBe('none')
    expect(r.parts).toHaveLength(0)
  })

  it('сумма contribution по parts равна base до модификаторов', () => {
    const p = makePortal({ stability: 60, energy: 55, hoursToCollapse: 30 })
    const r = computeRisk(p)

    const instability = 100 - p.stability
    const energyLoad = p.energy
    const timePressure = Math.min(100, Math.max(0, 100 - (p.hoursToCollapse / 48) * 100))
    const base = 0.5 * instability + 0.3 * energyLoad + 0.2 * timePressure

    const sum = r.parts.reduce((acc, part) => acc + part.contribution, 0)
    expect(sum).toBeCloseTo(base, 10)
  })
})
