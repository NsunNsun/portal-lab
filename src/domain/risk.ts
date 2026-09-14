import type { Portal, RiskBreakdown, RiskLevel, RiskModifier, RiskPart } from './types'

/** Clamp `value` into the inclusive [min, max] range. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

/** Weights of the three base risk components. They sum to 1. */
const WEIGHTS = {
  instability: 0.5,
  energyLoad: 0.3,
  timePressure: 0.2,
} as const

/** Hard-modifier floor: some conditions force the score to at least this. */
const CRITICAL_FLOOR = 85

/** Hours window used to normalize time pressure into 0..100. */
const TIME_WINDOW_HOURS = 48

/** Map a final 0..100 score to a risk level. */
export function riskLevel(score: number): RiskLevel {
  if (score <= 29) return 'low'
  if (score <= 59) return 'medium'
  if (score <= 84) return 'high'
  return 'critical'
}

/**
 * Compute an explainable risk breakdown for a portal.
 *
 * A closed portal always scores 0 with level 'none'. For every other portal
 * the score is a weighted sum of three normalized components, then adjusted by
 * hard modifiers, then rounded and clamped to 0..100.
 */
export function computeRisk(portal: Portal): RiskBreakdown {
  if (portal.status === 'closed') {
    return {
      score: 0,
      level: 'none',
      parts: [],
      modifiers: [],
    }
  }

  const instability = 100 - portal.stability
  const energyLoad = portal.energy
  const timePressure = clamp(100 - (portal.hoursToCollapse / TIME_WINDOW_HOURS) * 100, 0, 100)

  const parts: RiskPart[] = [
    part('Нестабильность', instability, WEIGHTS.instability),
    part('Энергетическая нагрузка', energyLoad, WEIGHTS.energyLoad),
    part('Дефицит времени', timePressure, WEIGHTS.timePressure),
  ]

  const base = parts.reduce((sum, p) => sum + p.contribution, 0)

  let score = base

  const criticalInstability = portal.stability < 20
  const imminentCollapse = portal.hoursToCollapse <= 2
  const hasCreatures = portal.creaturesInside > 0

  if (criticalInstability) score = Math.max(score, CRITICAL_FLOOR)
  if (imminentCollapse) score = Math.max(score, CRITICAL_FLOOR)
  if (hasCreatures) score = score + 5

  const modifiers: RiskModifier[] = [
    {
      label: 'Критическая нестабильность',
      applied: criticalInstability,
      effect: `stability < 20 → риск не ниже ${CRITICAL_FLOOR}`,
    },
    {
      label: 'Портал вот-вот схлопнется',
      applied: imminentCollapse,
      effect: `hoursToCollapse ≤ 2 → риск не ниже ${CRITICAL_FLOOR}`,
    },
    {
      label: 'Внутри живые существа',
      applied: hasCreatures,
      effect: '+5 к риску',
    },
  ]

  score = clamp(Math.round(score), 0, 100)

  return {
    score,
    level: riskLevel(score),
    parts,
    modifiers,
  }
}

function part(label: string, raw: number, weight: number): RiskPart {
  return { label, raw, weight, contribution: raw * weight }
}
