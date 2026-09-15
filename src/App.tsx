import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import type { ActionType, Portal, PortalStatus, ShiftKind } from './domain/types'
import { checkAction } from './domain/rules'
import { appReducer, initAppState } from './ui/appReducer'
import { Header } from './ui/Header'
import type { TabKey } from './ui/Tabs'
import { PortalsTab } from './ui/PortalsTab'
import { EventLog } from './ui/EventLog'
import { WorklogTab } from './ui/WorklogTab'
import { Toasts } from './ui/Toasts'
import type { Toast, ToastKind } from './ui/toast'
import { ConfirmDialog } from './ui/ConfirmDialog'
import { actionSuccessText } from './ui/visuals'

interface PendingConfirm {
  portalId: string
  action: ActionType
  text: string
}

/** Predict a portal's status after an allowed action (for success-toast copy). */
function statusAfter(portal: Portal, action: ActionType): PortalStatus {
  if (action === 'close') return 'closed'
  if (action === 'toggleQuestioned') return portal.status === 'questioned' ? 'open' : 'questioned'
  return portal.status
}

export default function App() {
  const [state, dispatch] = useReducer(appReducer, 'new', initAppState)
  const [tab, setTab] = useState<TabKey>('portals')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [confirm, setConfirm] = useState<PendingConfirm | null>(null)
  const toastSeq = useRef(0)

  const selectedPortal = state.portals.find((p) => p.id === selectedId) ?? null
  const openCount = state.portals.filter((p) => p.status !== 'closed').length

  const notify = useCallback((kind: ToastKind, message: string) => {
    toastSeq.current += 1
    const id = toastSeq.current
    // Keep only the three most recent toasts so the stack never buries the UI.
    setToasts((prev) => [...prev, { id, kind, message }].slice(-3))
  }, [])

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  // Esc clears the selection (and thus closes the detail card). When a confirm
  // dialog is open it handles Esc itself, so we leave the selection alone.
  useEffect(() => {
    if (!selectedId || confirm) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedId(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedId, confirm])

  // «Прошёл час» toast, merged with a spawn note when a portal appeared. Driven
  // off the hour counter so it fires once per advance and never on a shift reset.
  const prevHours = useRef(state.hoursElapsed)
  useEffect(() => {
    if (state.hoursElapsed > prevHours.current) {
      const n = state.hoursElapsed
      notify(
        'system',
        state.lastSpawn
          ? `Прошёл час. С начала смены: ${n} ч. Открылся портал: ${state.lastSpawn}`
          : `Прошёл час. С начала смены: ${n} ч`,
      )
    }
    prevHours.current = state.hoursElapsed
  }, [state.hoursElapsed, state.lastSpawn, notify])

  const performApply = useCallback(
    (portal: Portal, action: ActionType) => {
      dispatch({ type: 'apply', portalId: portal.id, action })
      notify('success', actionSuccessText(action, statusAfter(portal, action)))
    },
    [notify],
  )

  // Action requested from the selected portal's card.
  const handleAction = useCallback(
    (action: ActionType) => {
      const portal = selectedPortal
      if (!portal) return
      const check = checkAction(portal, action)

      if (!check.allowed) {
        // Still dispatch so the reducer records the 'blocked' log entry.
        dispatch({ type: 'apply', portalId: portal.id, action })
        notify('blocked', check.reason)
        return
      }

      if ('confirm' in check && check.confirm) {
        setConfirm({ portalId: portal.id, action, text: check.confirm })
        return
      }

      performApply(portal, action)
    },
    [selectedPortal, notify, performApply],
  )

  const handleConfirmProceed = useCallback(() => {
    if (!confirm) return
    const portal = state.portals.find((p) => p.id === confirm.portalId)
    if (portal) performApply(portal, confirm.action)
    setConfirm(null)
  }, [confirm, state.portals, performApply])

  // Starting a shift fully resets domain state; the reducer writes a system log
  // entry. Toasts stay reserved for actions, rejections and the hourly tick.
  const handleStartShift = useCallback((kind: ShiftKind) => {
    dispatch({ type: 'startShift', kind })
    setSelectedId(null)
  }, [])

  const handleAdvanceHour = useCallback(() => {
    dispatch({ type: 'advanceHour' })
  }, [])

  return (
    <div className="mx-auto min-h-screen max-w-6xl px-4">
      <Header
        tab={tab}
        onTabChange={setTab}
        openCount={openCount}
        onAdvanceHour={handleAdvanceHour}
        onStartShift={handleStartShift}
      />

      <main className="py-5">
        {tab === 'portals' && (
          <PortalsTab
            portals={state.portals}
            selectedId={selectedId}
            selectedPortal={selectedPortal}
            hoursElapsed={state.hoursElapsed}
            onSelect={setSelectedId}
            onAction={handleAction}
          />
        )}
        {tab === 'log' && <EventLog log={state.log} />}
        {tab === 'worklog' && <WorklogTab />}
      </main>

      <Toasts toasts={toasts} onDismiss={dismissToast} />

      {confirm && (
        <ConfirmDialog
          text={confirm.text}
          confirmLabel="Всё равно закрыть"
          onCancel={() => setConfirm(null)}
          onConfirm={handleConfirmProceed}
        />
      )}
    </div>
  )
}
