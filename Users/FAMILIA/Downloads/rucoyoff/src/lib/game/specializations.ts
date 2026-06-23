// @ts-nocheck
import type {
  CharacterClass,
  Player,
  PlayerSpecializations,
  Specialization,
  SpecTalentNode,
  SpecId,
} from './types'

export const SPEC_UNLOCK_LEVEL = 30

function leaf(
  id: string, name: string, icon: string, row: number, col: number,
  desc: string, stat: keyof import('./types').CharacterStats | undefined,
  value: number | undefined, maxRank = 5, cost = 1, requires?: string, flag?: string,
): SpecTalentNode {
  return { id, name, icon, description: desc, row, col, maxRank, cost, requires,
    effect: { stat, value, flag } }
}

function basicTree(prefix: string, theme: { atk?: string; def?: string; util?: string }): SpecTalentNode[] {
  // Árvore genérica de 10 nós em 5 linhas. Cada spec sobreescreve nomes/keystones.
  return [
    leaf(`${prefix}_a1`, theme.atk ?? 'Ofensiva I', '⚔', 1, 0, '+3% Ataque por rank', 'attack', 0.03),
    leaf(`${prefix}_d1`, theme.def ?? 'Defensiva I', '🛡', 1, 2, '+3% Defesa por rank', 'defense', 0.03),
    leaf(`${prefix}_u1`, theme.util ?? 'Utilitária I', '✦', 1, 4, '+0.1 Velocidade por rank', 'speed', 0.1, 3),

    leaf(`${prefix}_a2`, 'Golpe Aprimorado', '✷', 2, 0, '+2% Crítico por rank', 'critChance', 0.02, 5, 1, `${prefix}_a1`),
    leaf(`${prefix}_d2`, 'Couro Endurecido', '◈', 2, 2, '+4% HP por rank', 'maxHp', 0.04, 5, 1, `${prefix}_d1`),
    leaf(`${prefix}_u2`, 'Mente Aguda', '✺', 2, 4, '+5% MP por rank', 'maxMp', 0.05, 5, 1, `${prefix}_u1`),

    leaf(`${prefix}_a3`, 'Fúria Sustentada', '⚡', 3, 1, '+8% Dano Crítico por rank', 'critDamage', 8, 5, 1, `${prefix}_a2`),
    leaf(`${prefix}_d3`, 'Postura Inabalável', '⌘', 3, 3, '+5% Defesa por rank', 'defense', 0.05, 3, 2, `${prefix}_d2`),

    // Tier 4 — escolha
    leaf(`${prefix}_t4a`, 'Ímpeto', '➹', 4, 1, '+5% Alcance por rank', 'range', 0.05, 3, 2, `${prefix}_a3`),
    leaf(`${prefix}_t4b`, 'Bastião', '☗', 4, 3, '+10% HP por rank', 'maxHp', 0.10, 3, 2, `${prefix}_d3`),

    // Tier 5 — Keystone
    leaf(`${prefix}_key`, 'Pedra-Chave', '☼', 5, 2, '+15% Ataque/Magia, 50% mais crit dano', 'attack', 0.15, 1, 3, `${prefix}_t4a`, 'keystone'),
  ]
}

function bossTree(prefix: string): SpecTalentNode[] {
  // Variação mais utilitária
  return [
    leaf(`${prefix}_a1`, 'Mestria I', '✦', 1, 0, '+4% Poder Mágico por rank', 'magicPower', 0.04),
    leaf(`${prefix}_d1`, 'Reserva I', '💧', 1, 2, '+6% MP por rank', 'maxMp', 0.06),
    leaf(`${prefix}_u1`, 'Foco I', '🎯', 1, 4, '+1.5% Crítico por rank', 'critChance', 0.015, 4),
    leaf(`${prefix}_a2`, 'Concentração', '✷', 2, 0, '+5% Ataque por rank', 'attack', 0.05, 5, 1, `${prefix}_a1`),
    leaf(`${prefix}_d2`, 'Pele Encantada', '◈', 2, 2, '+5% Defesa por rank', 'defense', 0.05, 5, 1, `${prefix}_d1`),
    leaf(`${prefix}_u2`, 'Visão Profunda', '👁', 2, 4, '+4% Alcance por rank', 'range', 0.04, 5, 1, `${prefix}_u1`),
    leaf(`${prefix}_a3`, 'Surto Arcano', '⚡', 3, 1, '+10% Magia por rank', 'magicPower', 0.10, 5, 1, `${prefix}_a2`),
    leaf(`${prefix}_d3`, 'Aegis Eterna', '⌘', 3, 3, '+8% HP por rank', 'maxHp', 0.08, 3, 2, `${prefix}_d2`),
    leaf(`${prefix}_t4a`, 'Pulso Acelerado', '➹', 4, 1, '+0.2 Velocidade por rank', 'speed', 0.2, 3, 2, `${prefix}_a3`),
    leaf(`${prefix}_t4b`, 'Fôlego Profundo', '☗', 4, 3, '+12% MP por rank', 'maxMp', 0.12, 3, 2, `${prefix}_d3`),
    leaf(`${prefix}_key`, 'Pedra-Chave', '☼', 5, 2, '+20% Magia, +20% Alcance', 'magicPower', 0.20, 1, 3, `${prefix}_t4a`, 'keystone'),
  ]
}

// 3 specs × 14 classes = 42 specs. Construídas a partir dos templates para garantir consistência.
function mk(cls: CharacterClass, specs: { id: string; name: string; flavor: string; icon: string; color: string; magic?: boolean }[]): Specialization[] {
  return specs.map(s => ({
    id: s.id,
    cls,
    name: s.name,
    description: s.flavor,
    flavor: s.flavor,
    icon: s.icon,
    color: s.color,
    unlockLevel: SPEC_UNLOCK_LEVEL,
    tree: (s.magic ? bossTree(s.id) : basicTree(s.id, {})),
  }))
}

export const SPECIALIZATIONS: Specialization[] = [
  ...mk('knight', [
    { id: 'knight_guardian', name: 'Guardião', flavor: 'Protetor implacável da linha de frente.', icon: '🛡', color: '#7ab0ff' },
    { id: 'knight_berserk', name: 'Berserker Real', flavor: 'Cavalaria que entra em fúria controlada.', icon: '⚔', color: '#e0604a' },
    { id: 'knight_crusader', name: 'Cruzado', flavor: 'Lâmina abençoada pela luz.', icon: '✚', color: '#ffd070' },
  ]),
  ...mk('archer', [
    { id: 'archer_marksman', name: 'Atirador', flavor: 'Foco mortal a longa distância.', icon: '🏹', color: '#80e050' },
    { id: 'archer_hunter', name: 'Caçador', flavor: 'Armadilhas e companhia animal.', icon: '🪤', color: '#a8c060' },
    { id: 'archer_windrunner', name: 'Corredor do Vento', flavor: 'Mobilidade extrema e flechas em rajada.', icon: '💨', color: '#60c0e0' },
  ]),
  ...mk('mage', [
    { id: 'mage_pyro', name: 'Piromante', flavor: 'Devastação flamejante em área.', icon: '🔥', color: '#e07030', magic: true },
    { id: 'mage_cryo', name: 'Criomante', flavor: 'Controla campo de batalha com gelo.', icon: '❄', color: '#60c0ff', magic: true },
    { id: 'mage_arcane', name: 'Arcanista', flavor: 'Magia pura e penetrante.', icon: '✦', color: '#c060ff', magic: true },
  ]),
  ...mk('necromancer', [
    { id: 'necro_master', name: 'Mestre dos Mortos', flavor: 'Exército de minions massivo.', icon: '💀', color: '#a020e0', magic: true },
    { id: 'necro_blood', name: 'Senhor do Sangue', flavor: 'Drena vida e converte em poder.', icon: '🩸', color: '#c02040', magic: true },
    { id: 'necro_lich', name: 'Lich', flavor: 'Magia da morte pura e gélida.', icon: '☠', color: '#80a0ff', magic: true },
  ]),
  ...mk('paladin', [
    { id: 'pala_protector', name: 'Protetor', flavor: 'Tanque sagrado intransponível.', icon: '✚', color: '#f0d878' },
    { id: 'pala_radiant', name: 'Radiante', flavor: 'Dano sagrado e queima impuros.', icon: '☼', color: '#fff070' },
    { id: 'pala_oathkeeper', name: 'Guardião do Voto', flavor: 'Cura aliados, pune inimigos.', icon: '⛨', color: '#ffe0a0' },
  ]),
  ...mk('berserker', [
    { id: 'berk_warlord', name: 'Senhor da Guerra', flavor: 'Lidera com fúria e brutalidade.', icon: '⚔', color: '#c83030' },
    { id: 'berk_rampage', name: 'Massacrador', flavor: 'Quanto mais mata, mais forte.', icon: '🪓', color: '#e04040' },
    { id: 'berk_titan', name: 'Titã', flavor: 'Corpo gigante, dano descomunal.', icon: '☗', color: '#a06040' },
  ]),
  ...mk('assassin', [
    { id: 'assa_shadow', name: 'Sombra', flavor: 'Stealth e backstab letal.', icon: '🗡', color: '#404060' },
    { id: 'assa_venom', name: 'Veneno', flavor: 'Lâminas envenenadas que corroem.', icon: '☠', color: '#60c060' },
    { id: 'assa_blademaster', name: 'Mestre da Lâmina', flavor: 'Combos cirúrgicos e críticos.', icon: '✦', color: '#b0a0c0' },
  ]),
  ...mk('druid', [
    { id: 'druid_grove', name: 'Guardião do Bosque', flavor: 'Cura e regen contínuos.', icon: '🌿', color: '#3aa84a', magic: true },
    { id: 'druid_storm', name: 'Druida da Tempestade', flavor: 'Relâmpagos e vento devastador.', icon: '⚡', color: '#80c0e0', magic: true },
    { id: 'druid_feral', name: 'Feral', flavor: 'Transforma-se em forma selvagem.', icon: '🐺', color: '#a08040', magic: true },
  ]),
  ...mk('monk', [
    { id: 'monk_windwalker', name: 'Andarilho do Vento', flavor: 'Combos rápidos e mobilidade.', icon: '💨', color: '#ffd070' },
    { id: 'monk_brewmaster', name: 'Mestre do Saquê', flavor: 'Tanque embriagado e elusivo.', icon: '🍶', color: '#c08040' },
    { id: 'monk_mistweaver', name: 'Tecelão da Névoa', flavor: 'Cura por punhos e nevoeiro.', icon: '☁', color: '#a0d0e0' },
  ]),
  ...mk('samurai', [
    { id: 'sam_kensei', name: 'Kensei', flavor: 'Sabre puro e cortes precisos.', icon: '🗡', color: '#e0c060' },
    { id: 'sam_iaijutsu', name: 'Iaijutsu', flavor: 'Saca-corta em um movimento.', icon: '⚔', color: '#ffd080' },
    { id: 'sam_ronin', name: 'Ronin', flavor: 'Mercenário versátil e fatal.', icon: '✦', color: '#a08060' },
  ]),
  ...mk('summoner', [
    { id: 'sum_conjurer', name: 'Conjurador', flavor: 'Multiplica familiares.', icon: '✦', color: '#80c0ff', magic: true },
    { id: 'sum_elementalist', name: 'Elementalista', flavor: 'Invoca elementais primordiais.', icon: '🔥', color: '#ffa040', magic: true },
    { id: 'sum_spiritbond', name: 'Vínculo Espiritual', flavor: 'Fortalece familiares ao máximo.', icon: '☼', color: '#c0a0ff', magic: true },
  ]),
  ...mk('alchemist', [
    { id: 'alch_bomber', name: 'Bombardeiro', flavor: 'Frascos explosivos e ácidos.', icon: '💣', color: '#a8e060', magic: true },
    { id: 'alch_apothecary', name: 'Boticário', flavor: 'Poções de cura e suporte.', icon: '⚗', color: '#90e0a0', magic: true },
    { id: 'alch_transmuter', name: 'Transmutador', flavor: 'Converte recursos e drops.', icon: '☉', color: '#e0c060', magic: true },
  ]),
  ...mk('chronomancer', [
    { id: 'chro_voidwalker', name: 'Caminhante do Vazio', flavor: 'Salta no tempo entre golpes.', icon: '⌛', color: '#80c0ff', magic: true },
    { id: 'chro_eclipse', name: 'Eclipse', flavor: 'Para o tempo dos inimigos.', icon: '◐', color: '#a060e0', magic: true },
    { id: 'chro_paradox', name: 'Paradoxo', flavor: 'Dobra ações via paradoxos.', icon: '∞', color: '#ffd070', magic: true },
  ]),
  ...mk('beastmaster', [
    { id: 'beast_alpha', name: 'Alfa', flavor: 'Lidera matilha de feras.', icon: '🐺', color: '#a08040' },
    { id: 'beast_warden', name: 'Guardião Selvagem', flavor: 'Vínculo profundo com fera.', icon: '🐾', color: '#60c060' },
    { id: 'beast_primal', name: 'Primal', flavor: 'Funde-se com instinto animal.', icon: '🦴', color: '#c08060' },
  ]),
]

export function createDefaultSpecializations(): PlayerSpecializations {
  const invested: Record<SpecId, Record<string, number>> = {}
  const loadouts: Record<SpecId, { name: string; ranks: Record<string, number> }[]> = {}
  for (const s of SPECIALIZATIONS) {
    invested[s.id] = {}
    loadouts[s.id] = []
  }
  return { active: {}, invested, loadouts }
}

export function getSpecsForClass(cls: CharacterClass): Specialization[] {
  return SPECIALIZATIONS.filter(s => s.cls === cls)
}

export function getActiveSpec(player: Player): Specialization | null {
  if (!player.specializations) return null
  const id = player.specializations.active[player.class]
  if (!id) return null
  return SPECIALIZATIONS.find(s => s.id === id) ?? null
}

export function setActiveSpec(player: Player, specId: SpecId): Player {
  if (!player.specializations) return player
  if (player.level < SPEC_UNLOCK_LEVEL) return player
  const spec = SPECIALIZATIONS.find(s => s.id === specId)
  if (!spec || spec.cls !== player.class) return player
  return {
    ...player,
    specializations: {
      ...player.specializations,
      active: { ...player.specializations.active, [player.class]: specId },
    },
  }
}

export function specPointsAvailable(player: Player, specId: SpecId): number {
  if (!player.specializations) return 0
  // 1 ponto por nível acima de 30 (cap em level − 29). Compartilhado por spec.
  const earned = Math.max(0, player.level - (SPEC_UNLOCK_LEVEL - 1))
  const spent = Object.entries(player.specializations.invested[specId] ?? {})
    .reduce((s, [id, r]) => {
      const node = SPECIALIZATIONS.flatMap(sp => sp.tree).find(n => n.id === id)
      return s + (node?.cost ?? 1) * (r as number)
    }, 0)
  return earned - spent
}

export function investSpecPoint(player: Player, specId: SpecId, nodeId: string): Player {
  if (!player.specializations) return player
  const spec = SPECIALIZATIONS.find(s => s.id === specId)
  if (!spec) return player
  const node = spec.tree.find(n => n.id === nodeId)
  if (!node) return player
  if (node.requires) {
    const prereq = (player.specializations.invested[specId] ?? {})[node.requires] ?? 0
    if (prereq < 1) return player
  }
  const current = (player.specializations.invested[specId] ?? {})[nodeId] ?? 0
  if (current >= node.maxRank) return player
  if (specPointsAvailable(player, specId) < node.cost) return player
  const investedForSpec = { ...(player.specializations.invested[specId] ?? {}), [nodeId]: current + 1 }
  return {
    ...player,
    specializations: {
      ...player.specializations,
      invested: { ...player.specializations.invested, [specId]: investedForSpec },
    },
  }
}

export function resetSpec(player: Player, specId: SpecId): Player {
  if (!player.specializations) return player
  return {
    ...player,
    specializations: {
      ...player.specializations,
      invested: { ...player.specializations.invested, [specId]: {} },
    },
  }
}

export function applySpecToStats(player: Player): Player {
  const spec = getActiveSpec(player)
  if (!spec) return player
  const invested = player.specializations?.invested[spec.id] ?? {}
  const stats = { ...player.stats }
  for (const [nodeId, ranks] of Object.entries(invested)) {
    const node = spec.tree.find(n => n.id === nodeId)
    if (!node || !node.effect.stat || node.effect.value === undefined) continue
    const r = ranks as number
    const stat = node.effect.stat
    const val = node.effect.value
    if (val < 1) {
      // multiplicador percentual
      stats[stat] = Math.round((stats[stat] as number) * (1 + val * r) * 100) / 100
    } else {
      // flat
      if (stat === 'critChance') {
        stats.critChance = Math.min(0.95, (stats.critChance as number) + val * r)
      } else {
        stats[stat] = (stats[stat] as number) + val * r
      }
    }
    // Keystone: bônus extra
    if (node.effect.flag === 'keystone' && r > 0) {
      stats.attack = Math.round(stats.attack * 1.15)
      stats.magicPower = Math.round(stats.magicPower * 1.15)
      stats.critDamage = stats.critDamage + 50
    }
  }
  return { ...player, stats }
}

export function saveSpecLoadout(player: Player, specId: SpecId, name: string): Player {
  if (!player.specializations) return player
  const ranks = { ...(player.specializations.invested[specId] ?? {}) }
  const list = [...(player.specializations.loadouts[specId] ?? [])]
  if (list.length >= 3) list.shift()
  list.push({ name, ranks })
  return {
    ...player,
    specializations: {
      ...player.specializations,
      loadouts: { ...player.specializations.loadouts, [specId]: list },
    },
  }
}

export function loadSpecLoadout(player: Player, specId: SpecId, index: number): Player {
  if (!player.specializations) return player
  const loadout = (player.specializations.loadouts[specId] ?? [])[index]
  if (!loadout) return player
  return {
    ...player,
    specializations: {
      ...player.specializations,
      invested: { ...player.specializations.invested, [specId]: { ...loadout.ranks } },
    },
  }
}