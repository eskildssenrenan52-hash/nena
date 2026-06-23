import type { Player } from '@/lib/game/types'
import { getUnlockedPassives } from '@/lib/game/passives'
import { Overlay, ModalHeader, ModalFooter } from './QuestPanel'

const RARITY_COLORS: Record<string, string> = { common: '#8a9ab0', uncommon: '#40cc60', rare: '#4080ff', epic: '#c040ff', legendary: '#ff8c00' }
const CLASS_COLORS: Record<string, string>  = { knight: '#d0a030', archer: '#40c060', mage: '#4080ff', necromancer: '#c040ff', paladin: '#f0d878', berserker: '#c83030', assassin: '#a0a0c0', druid: '#3aa84a', monk: '#ffd070', samurai: '#e0c060' }
const CLASS_LABELS: Record<string, string>  = { knight: 'Cavaleiro', archer: 'Arqueiro', mage: 'Mago', necromancer: 'Necromante', paladin: 'Paladino', berserker: 'Berserker', assassin: 'Assassino', druid: 'Druida', monk: 'Monge', samurai: 'Samurai' }

interface Props { player: Player; onClose: () => void }

function StatRow({ label, value, color = '#8090a8' }: { label: string; value: string | number; color?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px solid rgba(20,28,48,0.6)' }}>
      <span style={{ color: '#3a5060', fontSize: 10, fontFamily: 'monospace' }}>{label}</span>
      <span style={{ color, fontSize: 10, fontFamily: 'monospace', fontWeight: 700 }}>{value}</span>
    </div>
  )
}

export default function StatsPanel({ player, onClose }: Props) {
  const passives     = getUnlockedPassives(player)
  const equippedCount = Object.values(player.equipment).filter(Boolean).length
  const cls          = player.class
  const clsColor     = CLASS_COLORS[cls] ?? '#8090a0'

  return (
    <Overlay onBgClick={onClose}>
      <div style={{ width: 520, maxHeight: '84vh', display: 'flex', flexDirection: 'column', background: 'rgba(6,8,18,0.98)', border: '1.5px solid rgba(30,46,80,0.7)', borderRadius: 12, overflow: 'hidden', boxShadow: '0 8px 48px rgba(0,0,0,0.8)' }}>
        <ModalHeader
          title={player.name}
          subtitle={`${CLASS_LABELS[cls]}  ·  Nv ${player.level}`}
          accent={clsColor}
          onClose={onClose}
        />

        <div style={{ overflowY: 'auto', padding: '14px 16px', flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* Combat */}
          <div>
            <div style={{ color: '#3a5070', fontSize: 9, fontFamily: 'monospace', letterSpacing: '0.12em', marginBottom: 8 }}>COMBATE</div>
            <StatRow label="HP"           value={`${player.hp} / ${player.stats.maxHp}`}                     color="#c05050" />
            <StatRow label="MP"           value={`${player.mp} / ${player.stats.maxMp}`}                     color="#4080d0" />
            <StatRow label="Ataque"       value={player.stats.attack}                                         color="#d08040" />
            <StatRow label="Defesa"       value={player.stats.defense}                                        color="#4090c0" />
            <StatRow label="Poder Mágico" value={player.stats.magicPower}                                     color="#a040d0" />
            <StatRow label="Velocidade"   value={player.stats.speed.toFixed(1)}                               color="#40c080" />
            <StatRow label="Crítico"      value={`${(player.stats.critChance * 100).toFixed(1)}%`}            color="#e0d020" />
            <StatRow label="Dano Crítico" value={`${(player.stats.critDamage * 100).toFixed(0)}%`}           color="#e06020" />
          </div>

          {/* Progress */}
          <div>
            <div style={{ color: '#3a5070', fontSize: 9, fontFamily: 'monospace', letterSpacing: '0.12em', marginBottom: 8 }}>PROGRESSO</div>
            <StatRow label="XP"          value={`${player.xp} / ${player.xpToNext}`}                        color="#60a0e0" />
            <StatRow label="Ouro"        value={player.gold.toLocaleString()}                                 color="#d0a030" />
            <StatRow label="Abates"      value={(player._totalKills ?? 0).toLocaleString()}                   color="#c05050" />
            <StatRow label="Chefes"      value={player._bossesKilled ?? 0}                                   color="#d040d0" />
            <StatRow label="Dano Total"  value={((player._totalDamage ?? 0)).toLocaleString()}               color="#e06020" />
            <StatRow label="Mortes"      value={player._deaths ?? 0}                                         color="#806060" />
            <StatRow label="Mapas"       value={player._mapsVisited ?? 1}                                    color="#40c0a0" />
            <StatRow label="Passivas"    value={`${passives.length} ativas`}                                 color="#4080c0" />
            <StatRow label="Equip."      value={`${equippedCount} / 5`}                                      color="#c0a040" />
          </div>

          {/* Equipment */}
          <div style={{ gridColumn: '1 / -1' }}>
            <div style={{ color: '#3a5070', fontSize: 9, fontFamily: 'monospace', letterSpacing: '0.12em', marginBottom: 8 }}>EQUIPAMENTOS</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 7 }}>
              {(['weapon','armor','helmet','boots','ring'] as const).map(slot => {
                const item = player.equipment[slot]
                return (
                  <div key={slot} style={{ background: 'rgba(8,10,20,0.8)', borderRadius: 7, padding: '8px 6px', textAlign: 'center', border: item ? `1px solid ${RARITY_COLORS[item.rarity]}40` : '1px solid rgba(20,28,48,0.5)' }}>
                    <div style={{ fontSize: 20, marginBottom: 3 }}>{item ? item.icon : '—'}</div>
                    <div style={{ color: item ? RARITY_COLORS[item.rarity] : '#24303e', fontSize: 9, fontFamily: 'monospace', lineHeight: 1.3 }}>
                      {item ? item.name : slot}
                    </div>
                    {item && <div style={{ color: '#3a4050', fontSize: 8, marginTop: 2, fontFamily: 'monospace' }}>{item.rarity}</div>}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <ModalFooter hint="[S] fechar  ·  Estatísticas completas do personagem" />
      </div>
    </Overlay>
  )
}
