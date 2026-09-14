import type { ActionType, PortalStatus, RiskLevel } from '../domain/types'

/**
 * Presentation-only mappings: how domain values are rendered. No business
 * logic lives here — the level/status/action come from the domain, this file
 * only decides the glyph, word and color used to show them.
 *
 * Rule: color never carries meaning alone. Risk is always icon + word + number.
 */

export interface RiskMeta {
  icon: string
  word: string
  /** CSS variable holding the level color. */
  color: string
}

export const RISK_META: Record<RiskLevel, RiskMeta> = {
  unknown: { icon: '?', word: 'Нет данных', color: 'var(--ink-muted)' },
  none: { icon: '—', word: 'Нет', color: 'var(--risk-none)' },
  low: { icon: '▪', word: 'Низкий', color: 'var(--risk-low)' },
  medium: { icon: '◆', word: 'Средний', color: 'var(--risk-medium)' },
  high: { icon: '▲', word: 'Высокий', color: 'var(--risk-high)' },
  critical: { icon: '⚠', word: 'Критический', color: 'var(--risk-critical)' },
}

export const STATUS_LABEL: Record<PortalStatus, string> = {
  open: 'Открыт',
  questioned: 'Под вопросом',
  closed: 'Закрыт',
}

/** Button captions for actions. `toggleQuestioned` depends on current status. */
export function actionLabel(action: ActionType, status: PortalStatus): string {
  switch (action) {
    case 'stabilize':
      return 'Стабилизировать'
    case 'close':
      return 'Закрыть портал'
    case 'sendObserver':
      return 'Отправить наблюдателя'
    case 'recallObserver':
      return 'Отозвать наблюдателя'
    case 'sendRescuer':
      return 'Отправить спасателя'
    case 'recallRescuer':
      return 'Отозвать спасателя'
    case 'evacuate':
      return 'Эвакуировать существ'
    case 'toggleQuestioned':
      return status === 'questioned' ? 'Снять пометку' : 'Пометить под вопросом'
  }
}

/** Short success-toast copy after an allowed action is applied. */
export function actionSuccessText(action: ActionType, statusAfter: PortalStatus): string {
  switch (action) {
    case 'stabilize':
      return 'Портал стабилизирован'
    case 'close':
      return 'Портал закрыт'
    case 'sendObserver':
      return 'Наблюдатель отправлен'
    case 'recallObserver':
      return 'Наблюдатель отозван'
    case 'sendRescuer':
      return 'Спасатель отправлен'
    case 'recallRescuer':
      return 'Спасатель отозван'
    case 'evacuate':
      return 'Существа эвакуированы'
    case 'toggleQuestioned':
      return statusAfter === 'questioned' ? 'Портал помечен под вопросом' : 'Пометка снята'
  }
}

/** Log-kind visuals for the event log. */
export const LOG_KIND_META: Record<
  'action' | 'blocked' | 'system',
  { word: string; icon: string; color: string }
> = {
  action: { word: 'действие', icon: '✓', color: 'var(--accent)' },
  blocked: { word: 'отказ', icon: '✕', color: 'var(--risk-critical)' },
  system: { word: 'система', icon: '•', color: 'var(--ink-muted)' },
}

/** Format a number with up to one decimal place, comma as the decimal mark. */
export function formatNum(n: number): string {
  return n.toLocaleString('ru-RU', { maximumFractionDigits: 1 })
}

/** Round and prefix with a sign: 12.6 → «+13», 0 → «+0». For risk deltas. */
export function formatSigned(n: number): string {
  const r = Math.round(n)
  return `${r >= 0 ? '+' : ''}${r}`
}

/** Format a 0..1 share as a whole-percent string, e.g. 0.45 → «45%». */
export function formatShare(share: number): string {
  return `${Math.round(share * 100)}%`
}

/** Format an epoch-ms timestamp as HH:MM:SS in local time. */
export function formatTime(at: number): string {
  return new Date(at).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}
