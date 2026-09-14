import type { PortalStatus } from '../domain/types'
import { STATUS_LABEL } from './visuals'

/** Text status badge: Открыт / Под вопросом / Закрыт. */
export function StatusBadge({ status }: { status: PortalStatus }) {
  return (
    <span
      className="inline-flex items-center rounded px-2 py-0.5 text-xs"
      style={{
        border: '1px solid var(--line)',
        color: status === 'closed' ? 'var(--ink-muted)' : 'var(--ink-2)',
      }}
    >
      {STATUS_LABEL[status]}
    </span>
  )
}
