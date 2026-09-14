import type { ActionType, Portal } from '../domain/types'
import { StatusBadge } from './StatusBadge'
import { PortalDetails } from './PortalDetails'
import { InstructionPanel } from './InstructionPanel'

/** Desktop side card for the selected portal; instructions when none is selected. */
export function PortalCard({
  portal,
  onAction,
  onClose,
}: {
  portal: Portal | null
  onAction: (action: ActionType) => void
  onClose: () => void
}) {
  if (!portal) {
    return <InstructionPanel />
  }

  return (
    <div
      className="flex flex-col gap-4 rounded-lg p-4"
      style={{ background: 'var(--surface)', border: '1px solid var(--ring)' }}
    >
      {/* Title / world / status + close cross */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold leading-tight">{portal.name}</h2>
          <p className="text-xs" style={{ color: 'var(--ink-muted)' }}>
            мир {portal.world}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={portal.status} />
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть карточку"
            title="Закрыть карточку (Esc)"
            className="grid h-6 w-6 shrink-0 place-items-center rounded"
            style={{ border: '1px solid var(--line)', color: 'var(--ink-muted)' }}
          >
            ✕
          </button>
        </div>
      </div>

      <PortalDetails portal={portal} onAction={onAction} />
    </div>
  )
}
