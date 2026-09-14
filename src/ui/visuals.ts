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

/**
 * Human-readable effect text for each risk modifier, keyed by the modifier
 * label the domain returns. Presentation only — keeps code field names
 * (stability, hoursToCollapse) out of the interface.
 */
export const MODIFIER_EFFECT: Record<string, string> = {
  'Критическая нестабильность': 'Стабильность ниже 20 → риск не ниже 85',
  'Портал вот-вот схлопнется': 'Меньше 2 часов до схлопывания → риск не ниже 85',
  'Внутри живые существа': 'Внутри живые существа → +5 к риску',
}

/** Format a number with up to one decimal place, comma as the decimal mark. */
export function formatNum(n: number): string {
  return n.toLocaleString('ru-RU', { maximumFractionDigits: 1 })
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
