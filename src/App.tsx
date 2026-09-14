import { useCallback, useReducer, useRef, useState } from 'react'
import type { ActionType, Portal, PortalStatus } from './domain/types'
import { checkAction } from './domain/rules'
import { DEFAULT_DATASET_KEY } from './data/datasets'
import { appReducer, initAppState } from './ui/appReducer'
import { Header } from './ui/Header'
import { Tabs } from './ui/Tabs'
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
  const [state, dispatch] = useReducer(appReducer, DEFAULT_DATASET_KEY, initAppState)
  const [tab, setTab] = useState<TabKey>('portals')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [confirm, setConfirm] = useState<PendingConfirm | null>(null)
  const toastSeq = useRef(0)

  const selectedPortal = state.portals.find((p) => p.id === selectedId) ?? null

  const notify = useCallback((kind: ToastKind, message: string) => {
    toastSeq.current += 1
    const id = toastSeq.current
    setToasts((prev) => [...prev, { id, kind, message }])
  }, [])

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

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

  // Loading a dataset no longer raises a toast — the reducer still writes a
  // system entry to the log. Toasts are reserved for actions, rejections and
  // the «Прошёл час» event.
  const handleSelectDataset = useCallback((key: string) => {
    dispatch({ type: 'loadDataset', key })
    setSelectedId(null)
  }, [])

  const handleReset = useCallback(() => {
    dispatch({ type: 'loadDataset', key: state.datasetKey })
    setSelectedId(null)
  }, [state.datasetKey])

  const handleAdvanceHour = useCallback(() => {
    dispatch({ type: 'advanceHour' })
    notify('system', 'Прошёл час')
  }, [notify])

  return (
    <div className="mx-auto min-h-screen max-w-6xl px-4">
      <Header
        datasetKey={state.datasetKey}
        onSelectDataset={handleSelectDataset}
        onAdvanceHour={handleAdvanceHour}
        onReset={handleReset}
      />

      <div className="mt-4">
        <Tabs value={tab} onChange={setTab} />
      </div>

      <main className="py-5">
        {tab === 'portals' && (
          <PortalsTab
            portals={state.portals}
            selectedId={selectedId}
            selectedPortal={selectedPortal}
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
