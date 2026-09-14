import type { Portal } from './types'
import { computeRisk } from './risk'

/**
 * Display ordering for the portals table. Pure and domain-owned so it can be
 * unit-tested and cannot drift between the desktop and mobile views.
 *
 * Order:
 *   1) closed portals always sink to the very bottom
 *   2) among the rest: questioned first, then unsurveyed, then by risk desc
 *   3) ties break by name
 *
 * Previously the view mixed "unsurveyed" and "closed" in one rank, so a closed
 * unsurveyed portal floated to the top — the bug this ordering fixes.
 */
function rank(p: Portal): number {
  if (p.status === 'closed') return 3
  if (p.status === 'questioned') return 0
  if (!p.surveyed) return 1
  return 2
}

/** Compare two portals for the table ordering (stable, total order). */
export function comparePortals(a: Portal, b: Portal): number {
  const byRank = rank(a) - rank(b)
  if (byRank !== 0) return byRank

  // Risk descending only applies within the surveyed-open tier (rank 2).
  if (rank(a) === 2) {
    const byRisk = computeRisk(b).score - computeRisk(a).score
    if (byRisk !== 0) return byRisk
  }

  return a.name.localeCompare(b.name, 'ru')
}

/** Return a new array of portals in display order. */
export function sortPortals(portals: Portal[]): Portal[] {
  return [...portals].sort(comparePortals)
}
