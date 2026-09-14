import { DATASET_OPTIONS } from '../data/datasets'

/** App header: title on the left, dataset switch + time/reset controls right. */
export function Header({
  datasetKey,
  onSelectDataset,
  onAdvanceHour,
  onReset,
}: {
  datasetKey: string
  onSelectDataset: (key: string) => void
  onAdvanceHour: () => void
  onReset: () => void
}) {
  return (
    <header className="flex flex-col gap-4 border-b py-4 md:flex-row md:items-center md:justify-between"
      style={{ borderColor: 'var(--line)' }}
    >
      <div>
        <h1 className="text-lg font-semibold leading-tight">
          Лаборатория нестабильных порталов
        </h1>
        <p className="text-xs" style={{ color: 'var(--ink-muted)' }}>
          Панель смотрителя
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Segmented value={datasetKey} onChange={onSelectDataset} />
        <button type="button" onClick={onAdvanceHour} className="control">
          ⏱ Прошёл час
        </button>
        <button type="button" onClick={onReset} className="control">
          Сбросить
        </button>
      </div>
    </header>
  )
}

function Segmented({ value, onChange }: { value: string; onChange: (key: string) => void }) {
  return (
    <div
      className="inline-flex rounded-md p-0.5"
      style={{ border: '1px solid var(--line)' }}
      role="tablist"
      aria-label="Набор данных"
    >
      {DATASET_OPTIONS.map((opt) => {
        const active = opt.key === value
        return (
          <button
            key={opt.key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.key)}
            className="rounded px-3 py-1 text-sm"
            style={{
              background: active ? 'var(--accent)' : 'transparent',
              color: active ? 'var(--ink)' : 'var(--ink-2)',
            }}
          >
            {opt.name}
          </button>
        )
      })}
    </div>
  )
}
