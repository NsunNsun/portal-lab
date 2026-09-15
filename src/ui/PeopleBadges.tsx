import type { Portal } from '../domain/types'

/** Comma-separated list of the people currently inside a portal, or []. */
export function peopleInside(portal: Portal): string[] {
  const people: string[] = []
  if (portal.observerSent) people.push('наблюдатель')
  if (portal.rescuerSent) people.push('спасатель')
  return people
}

/**
 * Secondary muted line under the creature count in the «Внутри» column: who
 * (observer/rescuer) is inside. Renders nothing when no one is inside.
 */
export function PeopleInside({ portal }: { portal: Portal }) {
  const people = peopleInside(portal)
  if (people.length === 0) return null
  return (
    <div className="text-xs leading-tight" style={{ color: 'var(--ink-muted)' }}>
      {people.join(', ')}
    </div>
  )
}

/** «Новый» badge, shown during the hour a portal appears. Accent-tinted. */
export function NewBadge() {
  return (
    <span
      title="Портал появился только что"
      className="ml-1 inline-flex items-center rounded px-1 py-0.5 align-middle text-[10px] font-medium leading-none"
      style={{ border: '1px solid var(--accent)', color: 'var(--accent)' }}
    >
      Новый
    </span>
  )
}
