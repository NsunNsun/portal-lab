import type { ActionType, Portal } from '../domain/types'
import { useMediaQuery } from './useMediaQuery'
import { SummaryTiles } from './SummaryTiles'
import { PortalsTable } from './PortalsTable'
import { PortalCard } from './PortalCard'
import { InstructionPanel } from './InstructionPanel'

/** «Порталы» tab: summary tiles, table (or empty state) and detail card. */
export function PortalsTab({
  portals,
  selectedId,
  selectedPortal,
  hoursElapsed,
  onSelect,
  onAction,
}: {
  portals: Portal[]
  selectedId: string | null
  selectedPortal: Portal | null
  hoursElapsed: number
  onSelect: (id: string | null) => void
  onAction: (action: ActionType) => void
}) {
  const compact = useMediaQuery('(max-width: 899px)')
  const empty = portals.length === 0

  return (
    <div className="flex flex-col gap-4">
      <SummaryTiles portals={portals} />

      {empty ? (
        <EmptyState />
      ) : compact ? (
        // Mobile: accordion list; instructions until a portal is chosen.
        <div className="flex flex-col gap-3">
          {!selectedId && <InstructionPanel />}
          <PortalsTable
            portals={portals}
            selectedId={selectedId}
            hoursElapsed={hoursElapsed}
            onSelect={onSelect}
            onAction={onAction}
            compact
          />
        </div>
      ) : (
        // Wide: table on the left, detail card on the right. min-w-0 lets the
        // fixed-layout table shrink inside the grid instead of overflowing.
        <div className="grid gap-4 lg:grid-cols-[1fr_400px]">
          <div className="min-w-0">
            <PortalsTable
              portals={portals}
              selectedId={selectedId}
              hoursElapsed={hoursElapsed}
              onSelect={onSelect}
              onAction={onAction}
              compact={false}
            />
          </div>
          <div className="min-w-0">
            <PortalCard
              portal={selectedPortal}
              onAction={onAction}
              onClose={() => onSelect(null)}
            />
          </div>
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
          Нажмите «Новая смена» в шапке или «Прошёл час» — со временем порталы появляются сами.
        </p>
      </div>
    </div>
  )
}
