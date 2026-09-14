import type { ActionCheck, ActionType, Portal } from './types'
import { computeRisk } from './risk'

/**
 * Decide whether `action` is permitted on `portal`.
 *
 * Returns one of:
 *  - { allowed: true }                    — do it, no questions asked
 *  - { allowed: true, confirm }           — allowed, but ask the user first
 *  - { allowed: false, reason }           — forbidden, with a user-facing reason
 *
 * These same checks run inside the reducer, so the UI cannot bypass them.
 */
export function checkAction(portal: Portal, action: ActionType): ActionCheck {
  switch (action) {
    case 'stabilize':
      return checkStabilize(portal)
    case 'close':
      return checkClose(portal)
    case 'sendObserver':
      return checkSendObserver(portal)
    case 'toggleQuestioned':
      return checkToggleQuestioned(portal)
  }
}

function checkStabilize(portal: Portal): ActionCheck {
  if (portal.status === 'closed') {
    return { allowed: false, reason: 'Портал закрыт — стабилизировать нечего.' }
  }
  return { allowed: true }
}

function checkClose(portal: Portal): ActionCheck {
  if (portal.status === 'closed') {
    return { allowed: false, reason: 'Портал уже закрыт.' }
  }

  const warnings: string[] = []
  if (portal.creaturesInside > 0) {
    warnings.push(
      `Внутри портала существ: ${portal.creaturesInside}. Они останутся в мире назначения. Закрыть?`,
    )
  }
  if (portal.observerSent) {
    warnings.push('Внутри портала наблюдатель. Закрыть?')
  }

  if (warnings.length > 0) {
    return { allowed: true, confirm: warnings.join(' ') }
  }
  return { allowed: true }
}

function checkSendObserver(portal: Portal): ActionCheck {
  if (portal.status === 'closed') {
    return { allowed: false, reason: 'Нельзя отправить наблюдателя в закрытый портал.' }
  }

  const { level, score } = computeRisk(portal)
  if (level === 'critical') {
    return {
      allowed: false,
      reason: `Риск критический (${score} из 100). Отправлять наблюдателя запрещено регламентом.`,
    }
  }

  if (portal.observerSent) {
    return { allowed: false, reason: 'Наблюдатель уже находится внутри.' }
  }

  return { allowed: true }
}

function checkToggleQuestioned(portal: Portal): ActionCheck {
  if (portal.status === 'closed') {
    return { allowed: false, reason: 'Портал закрыт — пометка не имеет смысла.' }
  }
  return { allowed: true }
}
