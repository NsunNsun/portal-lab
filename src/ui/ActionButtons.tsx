import type { ActionType, Portal } from '../domain/types'
import { checkAction } from '../domain/rules'
import { actionLabel } from './visuals'

const ACTIONS: ActionType[] = ['stabilize', 'close', 'sendObserver', 'toggleQuestioned']

/**
 * Four action buttons. Forbidden actions are NOT disabled — they stay
 * clickable but look muted and carry a rejection-colored outline plus the
 * reason as a title. The click handler in App shows the toast and logs it.
 */
export function ActionButtons({
  portal,
  onAction,
}: {
  portal: Portal
  onAction: (action: ActionType) => void
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {ACTIONS.map((action) => {
        const check = checkAction(portal, action)
        const forbidden = !check.allowed
        const reason = check.allowed ? undefined : check.reason
        return (
          <button
            key={action}
            type="button"
            onClick={() => onAction(action)}
            title={reason}
            className="rounded-md px-3 py-2 text-sm"
            style={{
              border: `1px solid ${forbidden ? 'var(--risk-critical)' : 'var(--line)'}`,
              background: 'var(--surface)',
              color: forbidden ? 'var(--ink-muted)' : 'var(--ink)',
              opacity: forbidden ? 0.6 : 1,
            }}
          >
            {actionLabel(action, portal.status)}
          </button>
        )
      })}
    </div>
  )
}
