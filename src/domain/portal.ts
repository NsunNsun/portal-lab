import type { Portal } from './types'

/**
 * A portal counts as «new» during the hour it appeared. Starting portals have
 * `spawnedAtHour === 0`; at the very start of a shift `hoursElapsed` is also 0,
 * so a plain `hoursElapsed - spawnedAtHour < 1` check would flag every starting
 * portal as new. Requiring `spawnedAtHour > 0` restricts the badge to portals
 * that actually appeared during the shift.
 */
export function isNewPortal(portal: Portal, hoursElapsed: number): boolean {
  return portal.spawnedAtHour > 0 && hoursElapsed - portal.spawnedAtHour < 1
}
