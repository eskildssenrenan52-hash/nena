import { useState } from 'react'
import type { Player, Item } from '@/lib/game/types'
import { Overlay, ModalHeader, ModalFooter } from './QuestPanel'

const RARITY_COLORS: Record<string, string> = {
  common: '#8a9ab0', uncommon: '#40cc60', rare: '#4080ff', epic: '#c040ff', legendary: '#ff8c00',
}
const RARITY_LABELS: Record<string, string> = {
  common: 'Comum', uncommon: 'Incomum', rare: 'Raro', epic: 'Épico', legendary: 'Lendário',
}
const STAT_LABELS: Record<string, string> = {
  maxHp: 'HP Máx', maxMp: 'MP Máx', attack: 'Ataque', defense: 'Defesa',
  speed: 'Velocidade', critChance: 'Critico %', critDamage: 'Dano Crit %', magicPower: 'Poder Mágico', range: 'Alcance',
}

interface Props {
  player: Player
  onClose: () => void
  onUseItem: (slotIdx: number) => void
}

export default function InventoryPanel({ player, onClose, onUseItem }: Props) {
  const [hovered, setHovered] = useState<number | null>(null)

  const equip = player.equipment
  const SLOTS = 30
  const slots = Array.from({ length: SLOTS }, (_, i) => player.inventory[i] ?? null)

  return (
    <Overlay onBgClick={onClose}>
      <div style={{ width: 560, maxHeight: '82vh', display: 'flex', flexDirection: 'column', background: 'rgba(6,8,18,0.98)', border: '1.5px solid rgba(40,56,100,0.7)', borderRadius: 12, overflow: 'hidden', boxShadow: '0 8px 48px rgba(0,0,0,0.8)' }}>
        <ModalHeader title="INVENTÁRIO" subtitle={`${player.inventory.filter(Boolean).length} / ${SLOTS} itens`} accent="#80a8d8" onClose={onClose} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', flex: 1, overflow: 'hidden' }}>
          {/* Grid */}
          <div style={{ overflowY: 'auto', padding: '12px 14px' }}>
            {/* Equipment row */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ color: '#2a4060', fontSize: 9, fontFamily: 'monospace', letterSpacing: '0.1em', marginBottom: 6 }}>EQUIPAMENTOS</div>
              <div style={{ display: 'flex', gap: 6 }}>
                {(['weapon','armor','helmet','boots','ring'] as const).map(slot => {
                  const item = equip[slot]
                  return (
                    <div key={slot} title={item ? item.name : slot} style={{
                      width: 44, height: 44, borderRadius: 7, fontSize: 20,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'rgba(8,12,24,0.9)',
                      border: item ? `1.5px solid ${RARITY_COLORS[item.rarity]}60` : '1px solid rgba(24,34,56,0.6)',
                      boxShadow: item ? `0 0 8px ${RARITY_COLORS[item.rarity]}28` : 'none',
                      flexShrink: 0,
                    }}>
                      {item ? item.icon : <span style={{ color: '#1a2535', fontSize: 11 }}>–</span>}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Item grid */}
            <div style={{ color: '#2a4060', fontSize: 9, fontFamily: 'monospace', letterSpacing: '0.1em', marginBottom: 6 }}>MOCHILA</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 5 }}>
              {slots.map((item, i) => {
                const isHov = hovered === i
                const rc    = item ? RARITY_COLORS[item.rarity] : '#1a2535'
                return (
                  <div
                    key={i}
                    onMouseEnter={() => setHovered(i)}
                    onMouseLeave={() => setHovered(null)}
                    onClick={() => item && onUseItem(i)}
                    style={{
                      width: '100%', aspectRatio: '1', borderRadius: 7, fontSize: 20,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: item ? (isHov ? `${rc}18` : 'rgba(8,12,24,0.8)') : 'rgba(6,8,14,0.5)',
                      border: item ? `1.5px solid ${isHov ? rc + 'a0' : rc + '40'}` : '1px solid rgba(16,22,38,0.5)',
                      cursor: item ? 'pointer' : 'default',
                      transition: 'all 0.12s',
                      position: 'relative',
                    }}
                  >
                    {item ? (
                      <>
                        <span>{item.icon}</span>
                        {item.stackable && (item.quantity ?? 0) > 1 && (
                          <span style={{ position: 'absolute', bottom: 2, right: 3, fontSize: 9, color: '#8090a0', fontFamily: 'monospace', fontWeight: 700 }}>{item.quantity}</span>
                        )}
                      </>
                    ) : (
                      <span style={{ color: '#12181e', fontSize: 11 }}>·</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Detail panel */}
          <div style={{ borderLeft: '1px solid rgba(24,34,60,0.7)', overflowY: 'auto', padding: '14px 12px', background: 'rgba(5,7,14,0.6)' }}>
            {hovered !== null && slots[hovered] ? (() => {
              const item = slots[hovered]!
              const rc   = RARITY_COLORS[item.rarity]
              return (
                <>
                  <div style={{ fontSize: 32, textAlign: 'center', marginBottom: 8 }}>{item.icon}</div>
                  <div style={{ color: rc, fontWeight: 700, fontFamily: 'monospace', fontSize: 12, textAlign: 'center', marginBottom: 2 }}>{item.name}</div>
                  <div style={{ color: rc + 'aa', fontSize: 9, fontFamily: 'monospace', textAlign: 'center', marginBottom: 10, textTransform: 'uppercase' }}>{RARITY_LABELS[item.rarity]}</div>
                  <p style={{ color: '#3a5060', fontSize: 10, marginBottom: 10, lineHeight: 1.5 }}>{item.description}</p>
                  {Object.entries(item.stats).filter(([, v]) => v).map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', borderBottom: '1px solid rgba(18,26,44,0.5)' }}>
                      <span style={{ color: '#3a5060', fontSize: 10, fontFamily: 'monospace' }}>{STAT_LABELS[k] ?? k}</span>
                      <span style={{ color: (v as number) > 0 ? '#40c060' : '#c04040', fontSize: 10, fontFamily: 'monospace', fontWeight: 700 }}>{(v as number) > 0 ? '+' : ''}{v}</span>
                    </div>
                  ))}
                  {item.type === 'consumable' && (
                    <button
                      onClick={() => onUseItem(hovered)}
                      style={{ marginTop: 12, width: '100%', background: 'rgba(20,50,20,0.8)', border: '1px solid #308040', borderRadius: 6, color: '#50c060', cursor: 'pointer', padding: '6px 0', fontSize: 11, fontFamily: 'monospace' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(28,70,28,0.9)' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(20,50,20,0.8)' }}
                    >
                      Usar Item
                    </button>
                  )}
                </>
              )
            })() : (
              <div style={{ color: '#1e2a38', textAlign: 'center', paddingTop: 40, fontSize: 11, fontFamily: 'monospace' }}>
                Passe o mouse sobre um item para ver detalhes
              </div>
            )}
          </div>
        </div>

        <ModalFooter hint="[I] fechar  ·  Clique em consumível para usar" />
      </div>
    </Overlay>
  )
}
