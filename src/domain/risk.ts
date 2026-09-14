import type { Portal, RiskBreakdown, RiskLevel, RiskPart, RiskStep } from './types'

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
 * An unsurveyed portal returns `known: false` / level 'unknown' — its score is
 * not computed. A closed portal scores 0 with level 'none'. Otherwise the score
 * is a weighted base of three normalized indicators, then a sequence of factors
 * that each pull the running risk a share of the way toward 100, then rounded
 * and clamped to 0..100.
 */
export function computeRisk(portal: Portal): RiskBreakdown {
  if (!portal.surveyed) {
    return unknown(false)
  }
  if (portal.status === 'closed') {
    return { known: true, score: 0, level: 'none', parts: [], base: 0, steps: [], dominant: null }
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

  const steps: RiskStep[] = []
  let risk = base

  // 1) Time pressure — mutually exclusive: imminent collapse OR under six hours.
  if (portal.hoursToCollapse <= 2) {
    risk = pushApplied(steps, risk, 'Портал вот-вот схлопнется', 0.45, 'До схлопывания не больше 2 часов')
  } else if (portal.hoursToCollapse <= 6) {
    risk = pushApplied(steps, risk, 'Осталось меньше 6 часов', 0.2, 'До схлопывания не больше 6 часов')
  } else {
    pushSkipped(steps, risk, 'Запас времени', `До схлопывания ещё ${portal.hoursToCollapse} ч — фактор не сработал`)
  }

  // 2) Critical instability.
  if (portal.stability < 20) {
    risk = pushApplied(steps, risk, 'Критическая нестабильность', 0.35, `Стабильность ${portal.stability} ниже 20`)
  } else {
    pushSkipped(steps, risk, 'Критическая нестабильность', `Стабильность ${portal.stability} — не ниже 20`)
  }

  // 3) Living beings inside — creatures plus observer plus rescuer.
  const lives = portal.creaturesInside + (portal.observerSent ? 1 : 0) + (portal.rescuerSent ? 1 : 0)
  if (lives > 0) {
    const k = Math.min(0.3, 0.08 + 0.04 * lives)
    risk = pushApplied(steps, risk, 'Внутри живые', k, `Внутри живых: ${lives}`)
  } else {
    pushSkipped(steps, risk, 'Внутри живые', 'Внутри никого нет')
  }

  const score = clamp(Math.round(risk), 0, 100)

  const applied = steps.filter((s) => s.applied)
  const dominant =
    applied.length > 0
      ? applied.reduce((best, s) => (s.delta > best.delta ? s : best))
      : null

  return {
    known: true,
    score,
    level: riskLevel(score),
    parts,
    base,
    steps,
    dominant: dominant ? { label: dominant.label, delta: dominant.delta } : null,
  }
}

/** Breakdown for a portal whose parameters are unknown. */
function unknown(known: boolean): RiskBreakdown {
  return { known, score: 0, level: 'unknown', parts: [], base: 0, steps: [], dominant: null }
}

function part(label: string, raw: number, weight: number): RiskPart {
  return { label, raw, weight, contribution: raw * weight }
}

/** Apply a factor, record the step, and return the new running risk. */
function pushApplied(
  steps: RiskStep[],
  before: number,
  label: string,
  share: number,
  note: string,
): number {
  const after = before + (100 - before) * share
  steps.push({ label, applied: true, share, before, after, delta: after - before, note })
  return after
}

/** Record a factor that did not fire (leaves risk unchanged). */
function pushSkipped(steps: RiskStep[], at: number, label: string, note: string): void {
  steps.push({ label, applied: false, share: 0, before: at, after: at, delta: 0, note })
}
