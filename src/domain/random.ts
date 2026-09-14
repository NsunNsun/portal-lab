/**
 * Deterministic pseudo-random generator (mulberry32).
 *
 * The lab needs randomness — new portals appear over time — without giving up
 * reproducibility. So there is no `Math.random` and no `Date.now` here: the
 * generator is a pure function of an integer state. The state lives in AppState
 * and is reset with every shift, so the same shift always unfolds identically.
 */

/** Fixed seed for every shift. Any constant works; this is the golden ratio. */
export const SEED = 0x9e3779b9

/**
 * Advance the generator by one step.
 *
 * Returns the produced value in [0, 1) and the next state to thread forward.
 * Given the same `state`, this always returns the same result.
 */
export function nextRandom(state: number): { value: number; next: number } {
  let a = state | 0
  a = (a + 0x6d2b79f5) | 0
  let t = Math.imul(a ^ (a >>> 15), 1 | a)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  const value = ((t ^ (t >>> 14)) >>> 0) / 4294967296
  return { value, next: a }
}

/** Next integer in the inclusive range [min, max]. */
export function randomInt(
  state: number,
  min: number,
  max: number,
): { value: number; next: number } {
  const { value, next } = nextRandom(state)
  return { value: min + Math.floor(value * (max - min + 1)), next }
}
