import { describe, it, expect } from 'vitest'
import { computeRisk } from '../domain/risk'
import { makePortal } from './helpers'

describe('computeRisk — база', () => {
  it('база считается из трёх показателей с весами, а сумма вкладов равна базе', () => {
    const p = makePortal({ stability: 60, energy: 55, hoursToCollapse: 30 })
    const r = computeRisk(p)

    const instability = 100 - p.stability
    const timePressure = Math.min(100, Math.max(0, 100 - (p.hoursToCollapse / 48) * 100))
    const base = 0.5 * instability + 0.3 * p.energy + 0.2 * timePressure

    expect(r.base).toBeCloseTo(base, 10)
    const sum = r.parts.reduce((acc, part) => acc + part.contribution, 0)
    expect(sum).toBeCloseTo(r.base, 10)
    expect(r.parts.map((part) => part.weight)).toEqual([0.5, 0.3, 0.2])
  })

  it('факторы применяются последовательно, каждый берёт свою долю остатка', () => {
    // hours = 5 (доля 0.20) и stability = 15 (доля 0.35) — два подряд.
    const r = computeRisk(makePortal({ stability: 15, energy: 40, hoursToCollapse: 5 }))
    const applied = r.steps.filter((s) => s.applied)
    expect(applied.length).toBeGreaterThanOrEqual(2)

    // каждый шаг: after = before + (100 - before) * share
    for (const s of applied) {
      expect(s.after).toBeCloseTo(s.before + (100 - s.before) * s.share, 10)
      expect(s.delta).toBeCloseTo(s.after - s.before, 10)
    }
    // шаги сцеплены: before следующего = after предыдущего
    for (let i = 1; i < r.steps.length; i++) {
      expect(r.steps[i]!.before).toBeCloseTo(r.steps[i - 1]!.after, 10)
    }
    // первый шаг стартует от базы
    expect(r.steps[0]!.before).toBeCloseTo(r.base, 10)
  })
})

describe('computeRisk — особые состояния', () => {
  it('неразведанный портал → known:false и уровень unknown, счёт не считается', () => {
    const r = computeRisk(makePortal({ surveyed: false, stability: 5, energy: 100 }))
    expect(r.known).toBe(false)
    expect(r.level).toBe('unknown')
    expect(r.parts).toHaveLength(0)
    expect(r.steps).toHaveLength(0)
  })

  it('закрытый портал даёт 0 и уровень none', () => {
    const r = computeRisk(makePortal({ status: 'closed', stability: 5, energy: 100 }))
    expect(r.score).toBe(0)
    expect(r.level).toBe('none')
    expect(r.parts).toHaveLength(0)
  })
})

describe('computeRisk — факторы', () => {
  it('стабилизация снижает риск: при росте стабильности (2 ч до схлопывания) счёт падает', () => {
    const low = computeRisk(makePortal({ hoursToCollapse: 2, stability: 40, energy: 70 }))
    const high = computeRisk(makePortal({ hoursToCollapse: 2, stability: 70, energy: 70 }))
    expect(high.score).toBeLessThan(low.score)
  })

  it('доля за живых учитывает наблюдателя и спасателя, а не только существ', () => {
    const withPeople = computeRisk(
      makePortal({ creaturesInside: 0, observerSent: true, rescuerSent: true, stability: 60, energy: 40, hoursToCollapse: 30 }),
    )
    const alone = computeRisk(
      makePortal({ creaturesInside: 0, observerSent: false, rescuerSent: false, stability: 60, energy: 40, hoursToCollapse: 30 }),
    )
    const livesStep = withPeople.steps.find((s) => s.label === 'Внутри живые')!
    expect(livesStep.applied).toBe(true)
    expect(livesStep.note).toContain('2')
    expect(withPeople.score).toBeGreaterThan(alone.score)
  })

  it('доля за живых не превышает 0.30 при большом количестве', () => {
    const r = computeRisk(makePortal({ creaturesInside: 20, stability: 60, energy: 40, hoursToCollapse: 30 }))
    const livesStep = r.steps.find((s) => s.label === 'Внутри живые')!
    expect(livesStep.applied).toBe(true)
    expect(livesStep.share).toBeLessThanOrEqual(0.3)
    expect(livesStep.share).toBeCloseTo(0.3, 10)
  })

  it('dominant указывает на применённый фактор с наибольшим приростом', () => {
    const r = computeRisk(makePortal({ stability: 10, energy: 50, hoursToCollapse: 1, creaturesInside: 1 }))
    const applied = r.steps.filter((s) => s.applied)
    const maxDelta = Math.max(...applied.map((s) => s.delta))
    expect(r.dominant).not.toBeNull()
    expect(r.dominant!.delta).toBeCloseTo(maxDelta, 10)
    expect(r.dominant!.label).toBe(applied.find((s) => s.delta === maxDelta)!.label)
  })
})
