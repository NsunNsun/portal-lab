import { useState } from 'react'
import { worklog } from '../data/worklog'

/** «AI Worklog» tab: renders the structured worklog data section by section. */
export function WorklogTab() {
  return (
    <div className="flex max-w-3xl flex-col gap-8">
      <SummarySection />
      <StagesSection />
      <DecisionsSection />
      <MistakesSection />
      <RewritesSection />
      <VerificationSection />
      <ImprovementsSection />
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--ink-muted)' }}>{children}</h2>
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg p-3" style={{ background: 'var(--surface)', border: '1px solid var(--ring)' }}>
      {children}
    </div>
  )
}

function SummarySection() {
  const { summary } = worklog
  const tiles: { value: string; label: string }[] = [
    { value: summary.tools.length.toString(), label: 'Инструментов' },
    { value: summary.totalTime, label: 'Общее время' },
    { value: summary.tokens, label: 'Токены' },
    { value: summary.submittedAt, label: 'Дата' },
  ]
  return (
    <section>
      <SectionTitle>Сводка</SectionTitle>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {tiles.map((t) => (
          <div key={t.label} className="rounded-lg p-3" style={{ background: 'var(--surface)', border: '1px solid var(--ring)' }}>
            <div className="text-lg font-semibold">{t.value}</div>
            <div className="mt-0.5 text-xs" style={{ color: 'var(--ink-muted)' }}>{t.label}</div>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs" style={{ color: 'var(--ink-muted)' }}>
        Инструменты: {summary.tools.join(', ')}
      </p>
    </section>
  )
}

function StagesSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  return (
    <section>
      <SectionTitle>Этапы процесса</SectionTitle>
      <div className="flex flex-col gap-2">
        {worklog.stages.map((stage, i) => {
          const open = openIndex === i
          return (
            <div key={stage.name} className="rounded-lg" style={{ background: 'var(--surface)', border: '1px solid var(--ring)' }}>
              <button
                type="button"
                onClick={() => setOpenIndex(open ? null : i)}
                aria-expanded={open}
                className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm font-medium"
              >
                <span>{stage.name}</span>
                <span className="flex items-center gap-2">
                  {stage.time && (
                    <span className="nums text-xs" style={{ color: 'var(--ink-muted)' }}>{stage.time}</span>
                  )}
                  <span aria-hidden>{open ? '▲' : '▼'}</span>
                </span>
              </button>
              {open && (
                <div className="space-y-2 px-3 pb-3 text-sm" style={{ color: 'var(--ink-2)' }}>
                  <p><span style={{ color: 'var(--ink-muted)' }}>Человек: </span>{stage.human}</p>
                  <p><span style={{ color: 'var(--ink-muted)' }}>AI: </span>{stage.ai}</p>
                  <p><span style={{ color: 'var(--ink-muted)' }}>Ключевой промпт: </span>{stage.prompt}</p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}

function DecisionsSection() {
  return (
    <section>
      <SectionTitle>Мои решения</SectionTitle>
      <div className="flex flex-col gap-2">
        {worklog.decisions.map((d) => (
          <Card key={d.title}>
            <div className="text-sm font-medium">{d.title}</div>
            <p className="mt-1 text-sm" style={{ color: 'var(--ink-2)' }}>
              <span style={{ color: 'var(--ink-muted)' }}>Почему: </span>{d.why}
            </p>
            <p className="mt-1 text-sm" style={{ color: 'var(--ink-2)' }}>
              <span style={{ color: 'var(--ink-muted)' }}>Отклонено: </span>{d.rejected}
            </p>
          </Card>
        ))}
      </div>
    </section>
  )
}

function MistakesSection() {
  return (
    <section>
      <SectionTitle>Где AI ошибся</SectionTitle>
      <div className="flex flex-col gap-2">
        {worklog.aiMistakes.map((m) => (
          <Card key={m.what}>
            <p className="text-sm">{m.what}</p>
            <p className="mt-1 text-sm" style={{ color: 'var(--ink-2)' }}>
              <span style={{ color: 'var(--ink-muted)' }}>Исправление: </span>{m.fix}
            </p>
          </Card>
        ))}
      </div>
    </section>
  )
}

function RewritesSection() {
  return (
    <section>
      <SectionTitle>Что переписано вручную</SectionTitle>
      <ul className="list-inside list-disc space-y-1 text-sm" style={{ color: 'var(--ink-2)' }}>
        {worklog.manualRewrites.map((r) => (
          <li key={r}>{r}</li>
        ))}
      </ul>
    </section>
  )
}

function VerificationSection() {
  const [checked, setChecked] = useState<boolean[]>(() => worklog.verification.map((v) => v.done))
  return (
    <section>
      <SectionTitle>Как проверял</SectionTitle>
      <ul className="flex flex-col gap-2">
        {worklog.verification.map((v, i) => (
          <li key={v.scenario}>
            <label className="flex cursor-pointer items-start gap-2 rounded-lg p-3 text-sm" style={{ background: 'var(--surface)', border: '1px solid var(--ring)' }}>
              <input
                type="checkbox"
                checked={checked[i]}
                onChange={() =>
                  setChecked((prev) => prev.map((c, j) => (j === i ? !c : c)))
                }
                className="mt-0.5 h-4 w-4 shrink-0 accent-[color:var(--accent)]"
              />
              <span>
                <span className="font-medium">{v.scenario}</span>
                <span className="block" style={{ color: 'var(--ink-muted)' }}>{v.expected}</span>
              </span>
            </label>
          </li>
        ))}
      </ul>
    </section>
  )
}

function ImprovementsSection() {
  return (
    <section>
      <SectionTitle>Что улучшил бы в реальном продукте</SectionTitle>
      <ul className="list-inside list-disc space-y-1 text-sm" style={{ color: 'var(--ink-2)' }}>
        {worklog.improvements.map((it) => (
          <li key={it}>{it}</li>
        ))}
      </ul>
    </section>
  )
}
