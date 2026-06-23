// @ts-nocheck
import type { Monster, Player, GameState } from './types'
import { uid } from './utils'

export type StatusEffectType = 'stun' | 'poison' | 'burn' | 'freeze' | 'slow' | 'bleed' | 'curse' | 'regen'

export interface StatusEffect {
  id: string
  type: StatusEffectType
  source: 'player' | 'monster'
  duration: number
  tickInterval: number
  tickTimer: number
  potency: number
  name: string
  icon: string
  color: string
}

export const STATUS_CONFIG: Record<StatusEffectType, { name: string; icon: string; color: string; tickInterval: number }> = {
  stun: { name: 'Atordoado', icon: '💫', color: '#ffff00', tickInterval: 60 },
  poison: { name: 'Envenenado', icon: '☠', color: '#40ff40', tickInterval: 60 },
  burn: { name: 'Queimando', icon: '🔥', color: '#ff4040', tickInterval: 45 },
  freeze: { name: 'Congelado', icon: '❄', color: '#80ccff', tickInterval: 60 },
  slow: { name: 'Lento', icon: '⏳', color: '#ffaa00', tickInterval: 60 },
  bleed: { name: 'Sangrando', icon: '🩸', color: '#cc0000', tickInterval: 50 },
  curse: { name: 'Amaldiçoado', icon: '👁', color: '#aa00ff', tickInterval: 90 },
  regen: { name: 'Regeneração', icon: '💚', color: '#40ff80', tickInterval: 60 },
}

export function addStatusEffect(
  target: Monster | Player,
  type: StatusEffectType,
  source: 'player' | 'monster',
  potency: number,
  duration: number,
): Monster | Player {
  const config = STATUS_CONFIG[type]
  const existing = target.statusEffects?.find(s => s.type === type)
  if (existing) {
    // Refresh duration and increase potency if new is stronger
    const newEffects = (target.statusEffects ?? []).map(s =>
      s.type === type
        ? { ...s, duration: Math.max(s.duration, duration), potency: Math.max(s.potency, potency) }
        : s
    )
    return { ...target, statusEffects: newEffects }
  }

  const effect: StatusEffect = {
    id: uid('status'),
    type,
    source,
    duration,
    tickInterval: config.tickInterval,
    tickTimer: config.tickInterval,
    potency,
    name: config.name,
    icon: config.icon,
    color: config.color,
  }

  return { ...target, statusEffects: [...(target.statusEffects ?? []), effect] }
}

export function updateStatusEffects(state: GameState): GameState {
  if (!state.currentMap || !state.player) return state
  let player = state.player
  let newDamageNumbers = [...state.damageNumbers]
  let newParticles = [...state.particles]
  let newMessages = [...state.chatMessages]

  // Update player status effects
  const playerEffects = (player.statusEffects ?? []).map(e => {
    const updated = { ...e, duration: e.duration - 1, tickTimer: e.tickTimer - 1 }
    if (updated.tickTimer <= 0) {
      updated.tickTimer = updated.tickInterval
      // Apply effect
      if (updated.type === 'poison' || updated.type === 'burn' || updated.type === 'bleed') {
        const dmg = Math.round(updated.potency)
        player = { ...player, hp: Math.max(1, player.hp - dmg) }
        newDamageNumbers.push({
          id: uid('sdmg'),
          value: dmg,
          x: player.position.x + 16 + (Math.random() - 0.5) * 10,
          y: player.position.y - 8,
          timer: 60,
          type: updated.type === 'burn' ? 'physical' : updated.type === 'poison' ? 'magic' : 'physical',
        })
        // Add particles
        for (let i = 0; i < 3; i++) {
          newParticles.push({
            id: uid('sp'),
            x: player.position.x + 16 + (Math.random() - 0.5) * 12,
            y: player.position.y + 12 + (Math.random() - 0.5) * 8,
            vx: (Math.random() - 0.5) * 2,
            vy: -Math.random() * 2,
            life: 20 + Math.random() * 10,
            maxLife: 30,
            size: 2 + Math.random() * 2,
            color: updated.color,
            type: 'smoke',
          })
        }
      } else if (updated.type === 'regen') {
        const heal = Math.round(updated.potency)
        player = { ...player, hp: Math.min(player.stats.maxHp, player.hp + heal) }
        newDamageNumbers.push({
          id: uid('sreg'),
          value: heal,
          x: player.position.x + 16,
          y: player.position.y - 16,
          timer: 60,
          type: 'heal',
        })
      } else if (updated.type === 'curse') {
        // Curse reduces stats temporarily
        const curseDmg = Math.round(updated.potency)
        player = { ...player, hp: Math.max(1, player.hp - curseDmg) }
        newDamageNumbers.push({
          id: uid('scurse'),
          value: curseDmg,
          x: player.position.x + 16,
          y: player.position.y - 8,
          timer: 60,
          type: 'magic',
        })
      }
    }
    return updated
  }).filter(e => e.duration > 0)

  player = { ...player, statusEffects: playerEffects }

  // Update monster status effects
  const monsters = state.currentMap.monsters.map(m => {
    if (m.isDead || !m.statusEffects || m.statusEffects.length === 0) return m
    const effects = m.statusEffects.map(e => {
      const updated = { ...e, duration: e.duration - 1, tickTimer: e.tickTimer - 1 }
      if (updated.tickTimer <= 0) {
        updated.tickTimer = updated.tickInterval
        if (updated.type === 'poison' || updated.type === 'burn' || updated.type === 'bleed') {
          const dmg = Math.round(updated.potency)
          const newHp = Math.max(0, m.hp - dmg)
          newDamageNumbers.push({
            id: uid('smob'),
            value: dmg,
            x: m.position.x + 16 + (Math.random() - 0.5) * 10,
            y: m.position.y - 8,
            timer: 60,
            type: updated.type === 'burn' ? 'physical' : 'magic',
          })
          return { ...m, hp: newHp, statusEffects: m.statusEffects?.map(se => se.id === updated.id ? updated : se) }
        } else if (updated.type === 'regen') {
          const heal = Math.round(updated.potency)
          return { ...m, hp: Math.min(m.maxHp, m.hp + heal), statusEffects: m.statusEffects?.map(se => se.id === updated.id ? updated : se) }
        }
      }
      return updated
    }).filter(e => e.duration > 0)

    return { ...m, statusEffects: effects }
  })

  return {
    ...state,
    player,
    currentMap: { ...state.currentMap, monsters },
    damageNumbers: newDamageNumbers,
    particles: newParticles,
    chatMessages: newMessages,
  }
}

export function isStunned(entity: { statusEffects?: StatusEffect[] }): boolean {
  return entity.statusEffects?.some(e => e.type === 'stun') ?? false
}

export function getSpeedModifier(entity: { statusEffects?: StatusEffect[] }): number {
  const slow = entity.statusEffects?.find(e => e.type === 'slow')
  const freeze = entity.statusEffects?.find(e => e.type === 'freeze')
  let mod = 1
  if (slow) mod *= 0.5
  if (freeze) mod *= 0.3
  return mod
}
