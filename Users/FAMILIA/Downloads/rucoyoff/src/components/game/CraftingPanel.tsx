import { useState } from 'react'
import type { Player, Item } from '@/lib/game/types'
import { playSfx } from '@/lib/game/audio'
import { Overlay, ModalHeader, ModalFooter, Section } from './QuestPanel'

export interface CraftRecipe {
  id: string
  name: string
  icon: string
  result: Item
  materials: { id: string; name: string; count: number }[]
  goldCost: number
}

const RARITY_COLORS: Record<string, string> = {
  common: '#8a9ab0', uncommon: '#40cc60', rare: '#4080ff', epic: '#c040ff', legendary: '#ff8c00',
}

const RARITY_LABELS: Record<string, string> = {
  common: 'Comum', uncommon: 'Incomum', rare: 'Raro', epic: 'Épico', legendary: 'Lendário',
}

const MAT_DISPLAY: Record<string, { label: string; icon: string }> = {
  slime_gel:          { label: 'Gel',     icon: '💚' },
  bone_shard:         { label: 'Osso',    icon: '🦴' },
  wolf_pelt:          { label: 'Pele',    icon: '🐺' },
  demon_horn:         { label: 'Chifre',  icon: '😈' },
  dragon_scale:       { label: 'Escama',  icon: '🐉' },
  void_crystal:       { label: 'Cristal', icon: '🔷' },
  ghost_essence:      { label: 'Espírito',icon: '👻' },
  ancient_bark_piece: { label: 'Casca',   icon: '🪵' },
}

export const CRAFT_RECIPES: CraftRecipe[] = [
  {
    id: 'craft_chainmail', name: 'Cota de Malha', icon: '🛡',
    result: { id: 'chainmail', name: 'Cota de Malha', type: 'armor', rarity: 'uncommon', icon: '🛡', description: 'Aneis metálicos.', stats: { defense: 12, maxHp: 40 }, value: 250 },
    materials: [{ id: 'bone_shard', name: 'Fragmento de Osso', count: 5 }], goldCost: 80,
  },
  {
    id: 'craft_swift_boots', name: 'Botas Velozes', icon: '👢',
    result: { id: 'swift_boots', name: 'Botas Velozes', type: 'boots', rarity: 'rare', icon: '👢', description: 'Encantadas para velocidade.', stats: { speed: 4, defense: 4 }, value: 800 },
    materials: [{ id: 'wolf_pelt', name: 'Pele de Lobo', count: 5 }, { id: 'slime_gel', name: 'Gel de Slime', count: 3 }], goldCost: 300,
  },
  {
    id: 'craft_power_ring', name: 'Anel do Poder', icon: '💍',
    result: { id: 'power_ring', name: 'Anel do Poder', type: 'ring', rarity: 'rare', icon: '💍', description: 'Amplifica o portador.', stats: { maxHp: 50, maxMp: 50, attack: 10, critChance: 5 }, value: 1500 },
    materials: [{ id: 'wolf_pelt', name: 'Pele de Lobo', count: 3 }, { id: 'slime_gel', name: 'Gel de Slime', count: 5 }], goldCost: 200,
  },
  {
    id: 'craft_titan_armor', name: 'Armadura do Titan', icon: '🛡',
    result: { id: 'titan_armor', name: 'Armadura do Titan', type: 'armor', rarity: 'epic', icon: '🛡', description: 'Forjada no abismo.', stats: { defense: 50, maxHp: 200, speed: -2 }, value: 5000 },
    materials: [{ id: 'dragon_scale', name: 'Escama de Dragão', count: 3 }, { id: 'demon_horn', name: 'Chifre Demonico', count: 5 }], goldCost: 2000,
  },
  {
    id: 'craft_void_blade', name: 'Lâmina do Vazio', icon: '🗡',
    result: { id: 'void_blade', name: 'Lâmina do Vazio', type: 'weapon', rarity: 'legendary', icon: '🗡', description: 'Forjada no Abismo Eterno.', stats: { attack: 120, critChance: 20, critDamage: 80, speed: 1 }, value: 25000 },
    materials: [{ id: 'void_crystal', name: 'Cristal do Vazio', count: 8 }, { id: 'demon_horn', name: 'Chifre Demonico', count: 5 }, { id: 'dragon_scale', name: 'Escama de Dragão', count: 2 }], goldCost: 5000,
  },
  {
    id: 'craft_ghost_staff', name: 'Cajado das Almas', icon: '🪄',
    result: { id: 'soul_staff', name: 'Cajado das Almas', type: 'weapon', rarity: 'legendary', icon: '🪄', description: 'Alimentado por almas.', stats: { attack: 60, magicPower: 150, maxMp: 200, critChance: 15 }, value: 28000 },
    materials: [{ id: 'ghost_essence', name: 'Essência Fantasmal', count: 5 }, { id: 'void_crystal', name: 'Cristal do Vazio', count: 4 }], goldCost: 6000,
  },
  {
    id: 'craft_ancient_armor', name: 'Armadura do Abismo', icon: '🛡',
    result: { id: 'abyss_armor', name: 'Armadura do Abismo', type: 'armor', rarity: 'legendary', icon: '🛡', description: 'Tecida das trevas.', stats: { defense: 90, maxHp: 500, speed: -1 }, value: 30000 },
    materials: [{ id: 'ancient_bark_piece', name: 'Casca Ancião', count: 10 }, { id: 'dragon_scale', name: 'Escama de Dragão', count: 4 }], goldCost: 8000,
  },
  // ─── CHAVES DE PORTAL SECRETO ───
  {
    id: 'craft_stellar_key', name: '✦ Chave Estelar', icon: '✦',
    result: { id: 'stellar_key', name: 'Chave Estelar', type: 'consumable', rarity: 'legendary', icon: '✦', description: 'Abre o portal secreto da Fenda Estelar (norte da cidade, esquerda).', stats: {}, stackable: true, quantity: 1, value: 50000 },
    materials: [
      { id: 'void_crystal', name: 'Cristal do Vazio', count: 12 },
      { id: 'ghost_essence', name: 'Essência Fantasmal', count: 8 },
      { id: 'dragon_scale', name: 'Escama de Dragão', count: 5 },
    ],
    goldCost: 15000,
  },
  {
    id: 'craft_primordial_seed', name: '❀ Semente Primordial', icon: '🌱',
    result: { id: 'primordial_seed', name: 'Semente Primordial', type: 'consumable', rarity: 'legendary', icon: '🌱', description: 'Abre o portal secreto do Jardim Eterno (norte da cidade, direita).', stats: {}, stackable: true, quantity: 1, value: 50000 },
    materials: [
      { id: 'ancient_bark_piece', name: 'Casca Ancião', count: 15 },
      { id: 'slime_gel', name: 'Gel de Slime', count: 30 },
      { id: 'wolf_pelt', name: 'Pele de Lobo', count: 20 },
      { id: 'demon_horn', name: 'Chifre Demonico', count: 6 },
    ],
    goldCost: 15000,
  },
]

function countMat(player: Player, id: string): number {
  return player.inventory.reduce((sum, item) => item?.id === id ? sum + (item.quantity ?? 1) : sum, 0)
}

interface Props {
  player: Player
  onClose: () => void
  onCraft: (recipe: CraftRecipe) => void
}

export default function CraftingPanel({ player, onClose, onCraft }: Props) {
  const [msg, setMsg] = useState('')
  const [msgOk, setMsgOk] = useState(false)

  const handleCraft = (recipe: CraftRecipe) => {
    if (player.gold < recipe.goldCost) { setMsg('Ouro insuficiente!'); setMsgOk(false); return }
    if (!recipe.materials.every(m => countMat(player, m.id) >= m.count)) { setMsg('Materiais insuficientes!'); setMsgOk(false); return }
    onCraft(recipe)
    playSfx('item_drop')
    setMsg(`${recipe.name} criado com sucesso!`)
    setMsgOk(true)
  }

  /* Materials the player actually has */
  const matKeys = Object.keys(MAT_DISPLAY)
  const ownedMats = matKeys.filter(id => countMat(player, id) > 0)

  return (
    <Overlay onBgClick={onClose}>
      <div style={{ width: 560, maxHeight: '82vh', display: 'flex', flexDirection: 'column', background: 'rgba(6,8,18,0.98)', border: '1.5px solid rgba(60,40,10,0.6)', borderRadius: 12, overflow: 'hidden', boxShadow: '0 8px 48px rgba(0,0,0,0.8)' }}>
        <ModalHeader title="FERRARIA  ·  CRAFTING" accent="#c08030" onClose={onClose} />

        {/* Inventory strip */}
        <div style={{ padding: '7px 16px', background: 'rgba(10,8,4,0.6)', borderBottom: '1px solid rgba(40,28,8,0.6)', display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ color: '#c09020', fontSize: 10, fontFamily: 'monospace' }}>⬡ {player.gold.toLocaleString()}g</span>
          {ownedMats.map(id => {
            const d = MAT_DISPLAY[id]
            return <span key={id} style={{ color: '#807060', fontSize: 10, fontFamily: 'monospace' }}>{d.icon} {d.label}: <span style={{ color: '#a09060' }}>{countMat(player, id)}</span></span>
          })}
          {ownedMats.length === 0 && <span style={{ color: '#3a3020', fontSize: 10, fontFamily: 'monospace' }}>Nenhum material — derrote monstros para coletar</span>}
        </div>

        {/* Status message */}
        {msg && (
          <div style={{ padding: '6px 16px', background: msgOk ? 'rgba(8,30,10,0.9)' : 'rgba(30,8,8,0.9)', color: msgOk ? '#30c050' : '#c03030', fontSize: 11, fontFamily: 'monospace', borderBottom: `1px solid ${msgOk ? '#103020' : '#301010'}` }}>
            {msg}
          </div>
        )}

        <div style={{ overflowY: 'auto', padding: '12px 16px', flex: 1 }}>
          <Section label="RECEITAS">
            {CRAFT_RECIPES.map(recipe => {
              const canAfford = player.gold >= recipe.goldCost
              const hasMats   = recipe.materials.every(m => countMat(player, m.id) >= m.count)
              const canCraft  = canAfford && hasMats
              const rc        = RARITY_COLORS[recipe.result.rarity]

              return (
                <div key={recipe.id} style={{ display: 'flex', gap: 12, alignItems: 'center', background: 'rgba(10,8,4,0.7)', borderRadius: 8, padding: '10px 13px', marginBottom: 7, border: `1px solid ${canCraft ? '#3a2808' : '#18160c'}` }}>
                  <span style={{ fontSize: 26, flexShrink: 0 }}>{recipe.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
                      <span style={{ color: rc, fontWeight: 700, fontSize: 12, fontFamily: 'monospace' }}>{recipe.name}</span>
                      <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 10, background: rc + '18', color: rc, border: `1px solid ${rc}40`, fontFamily: 'monospace' }}>{RARITY_LABELS[recipe.result.rarity]}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      {recipe.materials.map(m => {
                        const have = countMat(player, m.id)
                        const ok   = have >= m.count
                        return (
                          <span key={m.id} style={{ fontSize: 10, fontFamily: 'monospace', color: ok ? '#508040' : '#803030' }}>
                            {MAT_DISPLAY[m.id]?.icon ?? '·'} {m.name}  <span style={{ opacity: 0.7 }}>{have}/{m.count}</span>
                          </span>
                        )
                      })}
                      <span style={{ fontSize: 10, fontFamily: 'monospace', color: canAfford ? '#a08020' : '#804020' }}>⬡ {recipe.goldCost.toLocaleString()}g</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCraft(recipe)}
                    disabled={!canCraft}
                    style={{
                      flexShrink: 0, padding: '7px 16px', borderRadius: 7,
                      background: canCraft ? 'rgba(60,38,6,0.9)' : 'rgba(16,14,10,0.6)',
                      border: `1px solid ${canCraft ? '#806020' : '#201c14'}`,
                      color: canCraft ? '#d09030' : '#302c20',
                      cursor: canCraft ? 'pointer' : 'not-allowed',
                      fontSize: 11, fontFamily: 'monospace', fontWeight: 700,
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { if (canCraft) e.currentTarget.style.background = 'rgba(80,50,8,0.9)' }}
                    onMouseLeave={e => { if (canCraft) e.currentTarget.style.background = 'rgba(60,38,6,0.9)' }}
                  >
                    Criar
                  </button>
                </div>
              )
            })}
          </Section>
        </div>

        <ModalFooter hint="[C] fechar  ·  Colete materiais derrotando inimigos" />
      </div>
    </Overlay>
  )
}
