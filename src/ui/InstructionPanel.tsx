/** Shown in place of the detail card while no portal is selected. */
export function InstructionPanel() {
  return (
    <div
      className="rounded-lg p-5"
      style={{ background: 'var(--surface)', border: '1px solid var(--ring)' }}
    >
      <h2 className="text-base font-semibold">Смена началась</h2>
      <p className="mt-1 text-sm" style={{ color: 'var(--ink-2)' }}>
        Вы — смотритель лаборатории. Порталы нестабильны: одни скоро схлопнутся, другие опасны.
      </p>
      <ol className="mt-3 flex list-decimal flex-col gap-2 pl-5 text-sm" style={{ color: 'var(--ink-2)' }}>
        <li>Выберите портал в таблице — он отсортирован по уровню риска, сверху самые опасные.</li>
        <li>Посмотрите, из чего сложился риск, и что система рекомендует сделать.</li>
        <li>
          Стабилизируйте, закройте портал или отправьте наблюдателя. Запрещённые действия система
          объяснит.
        </li>
      </ol>
      <p className="mt-4 text-xs" style={{ color: 'var(--ink-muted)' }}>
        Все действия попадают в журнал событий.
      </p>
    </div>
  )
}
