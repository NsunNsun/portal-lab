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
    case 'recallObserver':
      return checkRecallObserver(portal)
    case 'sendRescuer':
      return checkSendRescuer(portal)
    case 'recallRescuer':
      return checkRecallRescuer(portal)
    case 'evacuate':
      return checkEvacuate(portal)
    case 'toggleQuestioned':
      return checkToggleQuestioned(portal)
  }
}

function checkStabilize(portal: Portal): ActionCheck {
  if (portal.status === 'closed') {
    return { allowed: false, reason: 'Портал закрыт — стабилизировать нечего.' }
  }
  if (!portal.surveyed) {
    return { allowed: false, reason: 'Параметры портала неизвестны. Сначала отправьте наблюдателя.' }
  }
  return { allowed: true }
}

function checkClose(portal: Portal): ActionCheck {
  if (portal.status === 'closed') {
    return { allowed: false, reason: 'Портал уже закрыт.' }
  }

  if (!portal.surveyed) {
    return {
      allowed: true,
      confirm: 'Портал не разведан: неизвестно, есть ли внутри живые. Закрыть вслепую?',
    }
  }

  const parts: string[] = []
  if (portal.creaturesInside > 0) {
    parts.push(`Внутри портала существ: ${portal.creaturesInside}.`)
  }
  if (portal.observerSent) {
    parts.push('Внутри наблюдатель.')
  }
  if (portal.rescuerSent) {
    parts.push('Внутри спасатель.')
  }

  if (parts.length > 0) {
    return {
      allowed: true,
      confirm: `${parts.join(' ')} Они останутся в мире назначения. Закрыть?`,
    }
  }
  return { allowed: true }
}

function checkSendObserver(portal: Portal): ActionCheck {
  if (portal.status === 'closed') {
    return { allowed: false, reason: 'Нельзя отправить наблюдателя в закрытый портал.' }
  }
  if (portal.observerSent) {
    return { allowed: false, reason: 'Наблюдатель уже находится внутри.' }
  }

  // An unsurveyed portal has no known risk — sending an observer IS the survey.
  if (portal.surveyed) {
    const { level, score } = computeRisk(portal)
    if (level === 'critical') {
      return {
        allowed: false,
        reason: `Риск критический (${score} из 100). Отправлять наблюдателя запрещено регламентом.`,
      }
    }
  }

  return { allowed: true }
}

function checkRecallObserver(portal: Portal): ActionCheck {
  if (!portal.observerSent) {
    return { allowed: false, reason: 'Наблюдателя внутри нет.' }
  }
  if (portal.status === 'closed') {
    return { allowed: false, reason: 'Портал закрыт.' }
  }
  return { allowed: true }
}

function checkSendRescuer(portal: Portal): ActionCheck {
  if (portal.status === 'closed') {
    return { allowed: false, reason: 'Нельзя отправить спасателя в закрытый портал.' }
  }
  if (!portal.surveyed) {
    return { allowed: false, reason: 'Портал не разведан: неизвестно, есть ли внутри кого спасать.' }
  }
  if (portal.rescuerSent) {
    return { allowed: false, reason: 'Спасатель уже внутри.' }
  }
  if (portal.creaturesInside === 0) {
    return { allowed: false, reason: 'Внутри нет существ — спасать некого.' }
  }

  const { level, score } = computeRisk(portal)
  if (level === 'critical') {
    return {
      allowed: false,
      reason: `Риск критический (${score} из 100). Отправлять спасателя запрещено регламентом.`,
    }
  }

  return { allowed: true }
}

function checkRecallRescuer(portal: Portal): ActionCheck {
  if (!portal.rescuerSent) {
    return { allowed: false, reason: 'Спасателя внутри нет.' }
  }
  if (portal.status === 'closed') {
    return { allowed: false, reason: 'Портал закрыт.' }
  }
  return { allowed: true }
}

function checkEvacuate(portal: Portal): ActionCheck {
  if (portal.status === 'closed') {
    return { allowed: false, reason: 'Портал закрыт.' }
  }
  if (!portal.surveyed) {
    return { allowed: false, reason: 'Портал не разведан.' }
  }
  if (portal.creaturesInside === 0) {
    return { allowed: false, reason: 'Внутри нет существ — эвакуировать некого.' }
  }
  if (!portal.rescuerSent) {
    return { allowed: false, reason: 'Внутри нет спасателя. Сначала отправьте спасателя.' }
  }
  return { allowed: true }
}

function checkToggleQuestioned(portal: Portal): ActionCheck {
  if (portal.status === 'closed') {
    return { allowed: false, reason: 'Портал закрыт — пометка не имеет смысла.' }
  }
  return { allowed: true }
}
