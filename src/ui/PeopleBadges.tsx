import type { Portal } from '../domain/types'

/**
 * Small text badges shown next to a portal name when a person is inside.
 * Plain framed text, never emoji: «Набл.» for an observer, «Спас.» for a rescuer.
 */
export function PeopleBadges({ portal }: { portal: Portal }) {
  if (!portal.observerSent && !portal.rescuerSent) return null
  return (
    <span className="ml-1 inline-flex gap-1 align-middle">
      {portal.observerSent && <Badge title="Внутри наблюдатель">Набл.</Badge>}
      {portal.rescuerSent && <Badge title="Внутри спасатель">Спас.</Badge>}
    </span>
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

function Badge({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <span
      title={title}
      className="inline-flex items-center rounded px-1 py-0.5 text-[10px] font-medium leading-none"
      style={{ border: '1px solid var(--line)', color: 'var(--ink-muted)' }}
    >
      {children}
    </span>
  )
}
