import { describe, it, expect } from 'vitest'
import { isNewPortal } from '../domain/portal'
import { makePortal } from './helpers'

describe('isNewPortal', () => {
  it('стартовый портал в час 0 не считается новым', () => {
    const starting = makePortal({ spawnedAtHour: 0 })
    expect(isNewPortal(starting, 0)).toBe(false)
  })

  it('спавненный в час N — новый в час N', () => {
    const spawned = makePortal({ spawnedAtHour: 3 })
    expect(isNewPortal(spawned, 3)).toBe(true)
  })

  it('спавненный в час N — уже не новый в час N+1', () => {
    const spawned = makePortal({ spawnedAtHour: 3 })
    expect(isNewPortal(spawned, 4)).toBe(false)
  })
})
