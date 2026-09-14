import type { ActionType, Portal } from '../domain/types'
import { StatusBadge } from './StatusBadge'
import { PortalDetails } from './PortalDetails'
import { InstructionPanel } from './InstructionPanel'

/** Desktop side card for the selected portal; instructions when none is selected. */
export function PortalCard({
  portal,
  onAction,
}: {
  portal: Portal | null
  onAction: (action: ActionType) => void
}) {
  if (!portal) {
    return <InstructionPanel />
  }

  return (
    <div
      className="flex flex-col gap-4 rounded-lg p-4"
      style={{ background: 'var(--surface)', border: '1px solid var(--ring)' }}
    >
      {/* Title / world / status */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold leading-tight">{portal.name}</h2>
          <p className="text-xs" style={{ color: 'var(--ink-muted)' }}>
            мир {portal.world}
          </p>
        </div>
        <StatusBadge status={portal.status} />
      </div>

      <PortalDetails portal={portal} onAction={onAction} />
    </div>
  )
}
