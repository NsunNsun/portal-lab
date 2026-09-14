import type { ActionType, Portal } from '../domain/types'
import { SummaryTiles } from './SummaryTiles'
import { PortalsTable } from './PortalsTable'
import { PortalCard } from './PortalCard'

/** «Порталы» tab: summary tiles, table (or empty state) and detail card. */
export function PortalsTab({
  portals,
  selectedId,
  selectedPortal,
  onSelect,
  onAction,
}: {
  portals: Portal[]
  selectedId: string | null
  selectedPortal: Portal | null
  onSelect: (id: string) => void
  onAction: (action: ActionType) => void
}) {
  const empty = portals.length === 0

  return (
    <div className="flex flex-col gap-4">
      <SummaryTiles portals={portals} />

      {empty ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1fr_400px]">
          <PortalsTable portals={portals} selectedId={selectedId} onSelect={onSelect} />
          <PortalCard portal={selectedPortal} onAction={onAction} />
        </div>
      )}
    </div>
  )
}

function EmptyState() {
  return (
    <div
      className="grid place-items-center rounded-lg px-6 py-16 text-center"
      style={{ background: 'var(--surface)', border: '1px solid var(--ring)' }}
    >
      <div>
        <h2 className="text-base font-semibold">В лаборатории нет активных порталов</h2>
        <p className="mt-1 text-sm" style={{ color: 'var(--ink-muted)' }}>
          Выберите другой набор данных в шапке, чтобы увидеть рабочую смену.
        </p>
      </div>
    </div>
  )
}
