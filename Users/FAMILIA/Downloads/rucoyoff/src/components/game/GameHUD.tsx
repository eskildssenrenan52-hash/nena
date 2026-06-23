import { memo } from 'react'
import type { Player, GameMap, GameNotification, ChatMessage } from '@/lib/game/types'

interface Props {
  player: Player
  currentMap: GameMap
  notifications: GameNotification[]
  chatMessages: ChatMessage[]
  onOpenInventory: () => void
  onMapChange: (mapId: string) => void
  onSave: () => void
  onOpenQuests?: () => void
  onOpenAchievements?: () => void
  onOpenPassives?: () => void
  onOpenCrafting?: () => void
  onOpenStats?: () => void
  onOpenHelp?: () => void
  timeOfDay?: number
  weather?: string
  killStreak?: number
  devMode?: boolean
}

const CLASS_LABELS: Record<string, string> = {
  knight: 'Cavaleiro', archer: 'Arqueiro', mage: 'Mago', necromancer: 'Necromante',
  paladin: 'Paladino', berserker: 'Berserker', assassin: 'Assassino', druid: 'Druida',
  monk: 'Monge', samurai: 'Samurai',
}
const CLASS_COLORS: Record<string, string> = {
  knight: '#d0a030', archer: '#40c060', mage: '#4080ff', necromancer: '#c040ff',
  paladin: '#f0d878', berserker: '#c83030', assassin: '#a0a0c0', druid: '#3aa84a',
  monk: '#ffd070', samurai: '#e0c060',
}
const RARITY_COLORS: Record<string, string> = {
  common: '#8a9ab0', uncommon: '#40cc60', rare: '#4080ff', epic: '#c040ff', legendary: '#ff8c00',
}
const MSG_COLORS: Record<string, string> = {
  system: '#607080', loot: '#e0b020', level: '#40e080', combat: '#e06040', info: '#8090a0',
}
const MAP_LIST = [
  { id: 'city',       name: 'Cidade',      minLvl: 1  },
  { id: 'forest',     name: 'Floresta',    minLvl: 1  },
  { id: 'deepforest', name: 'F. Antiga',   minLvl: 10 },
  { id: 'dungeon',    name: 'Masmorra',    minLvl: 5  },
  { id: 'tundra',     name: 'Tundra',      minLvl: 12 },
  { id: 'desert',     name: 'Deserto',     minLvl: 8  },
  { id: 'swamp',      name: 'Pântano',     minLvl: 15 },
  { id: 'volcano',    name: 'Vulcão',      minLvl: 18 },
  { id: 'abyss',      name: 'Abismo',      minLvl: 22 },
  // Crystal Cave floors
  { id: 'crystal1',   name: 'Cristal 1',   minLvl: 18 },
  { id: 'crystal2',   name: 'Cristal 2',   minLvl: 24 },
  { id: 'crystal3',   name: 'Cristal 3',   minLvl: 30 },
  // Haunted Ruins floors
  { id: 'haunted1',   name: 'Ruínas 1',    minLvl: 20 },
  { id: 'haunted2',   name: 'Ruínas 2',    minLvl: 28 },
  { id: 'haunted3',   name: 'Ruínas 3',    minLvl: 35 },
  // Sky Realm floors
  { id: 'sky1',       name: 'Céu 1',       minLvl: 22 },
  { id: 'sky2',       name: 'Céu 2',       minLvl: 30 },
  { id: 'sky3',       name: 'Céu 3',       minLvl: 40 },
]

function GameHUD({
  player, currentMap, notifications, chatMessages,
  onOpenInventory, onMapChange, onSave,
  onOpenQuests, onOpenAchievements, onOpenPassives,
  onOpenCrafting, onOpenStats, onOpenHelp,
  timeOfDay, weather, killStreak = 0, devMode = false,
}: Props) {
  const hpPct  = Math.max(0, Math.min(100, (player.hp / player.stats.maxHp) * 100))
  const mpPct  = Math.max(0, Math.min(100, (player.mp / player.stats.maxMp) * 100))
  const xpPct  = Math.max(0, Math.min(100, (player.xp / player.xpToNext) * 100))
  const cls    = player.class
  const clsClr = CLASS_COLORS[cls] ?? '#8090a0'

  const hour = timeOfDay !== undefined ? Math.floor((timeOfDay / 14400) * 24) : 12
  const isDay   = hour >= 8  && hour < 18
  const isDawn  = hour >= 5  && hour < 8
  const isDusk  = hour >= 18 && hour < 21
  const timeClr = isDay ? '#f0d060' : (isDawn || isDusk) ? '#ff8040' : '#6080d0'
  const timeLabel = isDay ? '☀' : (isDawn ? '🌅' : (isDusk ? '🌇' : '🌙'))
  const weatherIcon: Record<string, string> = { rain: '🌧', snow: '❄', fog: '🌫', storm: '⛈', none: '' }

  return (
    <>
      {/* ── TOP-LEFT: Character panel ─────────────────────────────────────── */}
      <div
        className="absolute top-2 left-2 select-none pointer-events-none"
        style={{ zIndex: 10, width: 220 }}
      >
        <div
          className="rounded-lg px-3 py-2.5 text-xs"
          style={{
            background: 'rgba(4,6,14,0.92)',
            border: '1px solid rgba(42,56,96,0.6)',
            boxShadow: '0 2px 16px rgba(0,0,0,0.7)',
          }}
        >
          {/* Name + class */}
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-sm truncate" style={{ color: clsClr, fontFamily: 'serif' }}>
              {player.name}
            </span>
            <span className="text-xs ml-2 shrink-0" style={{ color: clsClr, opacity: 0.7, fontFamily: 'monospace' }}>
              {CLASS_LABELS[cls]}
            </span>
          </div>

          {/* Level + Gold row */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <span style={{ color: '#6070a0', fontSize: 10 }}>Nv.</span>
              <span className="font-bold" style={{ color: '#c0d0ff' }}>{player.level}</span>
            </div>
            <div className="flex items-center gap-1">
              <span style={{ color: '#d0a020', fontSize: 13 }}>⬡</span>
              <span className="font-bold" style={{ color: '#d0a020', fontSize: 11 }}>{player.gold.toLocaleString()}</span>
            </div>
          </div>

          {/* HP bar */}
          <div className="mb-1.5">
            <div className="flex justify-between mb-0.5">
              <span style={{ color: '#c05050', fontSize: 9, fontFamily: 'monospace' }}>HP</span>
              <span style={{ color: '#804040', fontSize: 9, fontFamily: 'monospace' }}>{player.hp}/{player.stats.maxHp}</span>
            </div>
            <div className="rounded-full overflow-hidden" style={{ height: 8, background: '#110808' }}>
              <div
                className="h-full rounded-full transition-all duration-100"
                style={{
                  width: `${hpPct}%`,
                  background: hpPct > 50 ? 'linear-gradient(90deg,#803020,#c04030,#e05040)'
                    : hpPct > 25 ? 'linear-gradient(90deg,#803020,#e08020)'
                    : 'linear-gradient(90deg,#6a0000,#cc0000)',
                  boxShadow: `0 0 4px rgba(200,50,50,${hpPct > 25 ? 0.4 : 0.8})`,
                }}
              />
            </div>
          </div>

          {/* MP bar */}
          <div className="mb-1.5">
            <div className="flex justify-between mb-0.5">
              <span style={{ color: '#4070d0', fontSize: 9, fontFamily: 'monospace' }}>MP</span>
              <span style={{ color: '#304870', fontSize: 9, fontFamily: 'monospace' }}>{player.mp}/{player.stats.maxMp}</span>
            </div>
            <div className="rounded-full overflow-hidden" style={{ height: 6, background: '#080f1c' }}>
              <div
                className="h-full rounded-full transition-all duration-100"
                style={{
                  width: `${mpPct}%`,
                  background: 'linear-gradient(90deg,#1a3a80,#2060c0,#4090e0)',
                  boxShadow: '0 0 4px rgba(40,100,220,0.4)',
                }}
              />
            </div>
          </div>

          {/* XP bar */}
          <div className="mb-2">
            <div className="flex justify-between mb-0.5">
              <span style={{ color: '#4090a0', fontSize: 9, fontFamily: 'monospace' }}>XP</span>
              <span style={{ color: '#2a5060', fontSize: 9, fontFamily: 'monospace' }}>{player.xp}/{player.xpToNext}</span>
            </div>
            <div className="rounded-full overflow-hidden" style={{ height: 4, background: '#060e10' }}>
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${xpPct}%`,
                  background: 'linear-gradient(90deg,#1a5060,#20a0b0)',
                  boxShadow: '0 0 3px rgba(30,160,180,0.4)',
                }}
              />
            </div>
          </div>

          {/* Core stats row */}
          <div className="flex gap-3 flex-wrap" style={{ borderTop: '1px solid rgba(42,56,96,0.4)', paddingTop: 6 }}>
            {[
              { label: 'ATK', val: player.stats.attack,   color: '#d08040' },
              { label: 'DEF', val: player.stats.defense,  color: '#4090c0' },
              { label: 'SPD', val: player.stats.speed.toFixed(1), color: '#40c080' },
              { label: 'CRT', val: `${(player.stats.critChance*100).toFixed(0)}%`, color: '#e0d020' },
            ].map(s => (
              <div key={s.label} className="flex flex-col items-center" style={{ minWidth: 36 }}>
                <span style={{ color: '#3a4a6a', fontSize: 8, fontFamily: 'monospace' }}>{s.label}</span>
                <span style={{ color: s.color, fontSize: 10, fontWeight: 'bold', fontFamily: 'monospace' }}>{s.val}</span>
              </div>
            ))}
          </div>

          {/* Equipped items icons */}
          <div className="flex gap-1 mt-2" style={{ borderTop: '1px solid rgba(42,56,96,0.4)', paddingTop: 6 }}>
            {(['weapon','armor','helmet','boots','ring'] as const).map(slot => {
              const item = player.equipment[slot]
              return (
                <div
                  key={slot}
                  title={item ? `${item.name} (${item.rarity})` : slot}
                  style={{
                    width: 28, height: 28, borderRadius: 5, fontSize: 14,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(10,14,28,0.8)',
                    border: item ? `1px solid ${RARITY_COLORS[item.rarity]}50` : '1px solid #1a2030',
                    boxShadow: item ? `0 0 4px ${RARITY_COLORS[item.rarity]}30` : 'none',
                    color: item ? RARITY_COLORS[item.rarity] : '#2a3040',
                  }}
                >
                  {item ? item.icon : '·'}
                </div>
              )
            })}
          </div>
        </div>

        {/* Environment strip */}
        <div
          className="flex items-center gap-2 mt-1 px-2 py-1 rounded"
          style={{ background: 'rgba(4,6,12,0.75)', border: '1px solid rgba(42,56,96,0.3)', fontSize: 9, fontFamily: 'monospace' }}
        >
          <span style={{ color: timeClr }}>{timeLabel} {hour.toString().padStart(2,'0')}:00</span>
          {weather && weather !== 'none' && (
            <span style={{ color: '#6090c0' }}>{weatherIcon[weather] ?? ''}  {weather}</span>
          )}
          {killStreak >= 3 && (
            <span style={{ color: '#ff8040', fontWeight: 'bold' }}>⚔ ×{killStreak}</span>
          )}
          {devMode && (
            <span style={{ color: '#c060ff' }}>⚙ DEV</span>
          )}
        </div>
      </div>

      {/* ── TOP-RIGHT: Map + Menu ──────────────────────────────────────────── */}
      <div
        className="absolute top-2 right-2 flex flex-col gap-1 items-end select-none pointer-events-auto"
        style={{ zIndex: 10 }}
      >
        {/* Current map */}
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded pointer-events-none"
          style={{
            background: 'rgba(4,6,14,0.92)',
            border: '1px solid rgba(42,56,96,0.6)',
            fontSize: 11, fontFamily: 'monospace',
          }}
        >
          <span style={{ color: '#3a5070' }}>📍</span>
          <span className="font-bold" style={{ color: '#a0b8d8' }}>{currentMap.name}</span>
        </div>

        {/* Map grid — 3 columns */}
        <div
          className="rounded-lg p-2"
          style={{
            background: 'rgba(4,6,14,0.92)',
            border: '1px solid rgba(42,56,96,0.6)',
            boxShadow: '0 2px 16px rgba(0,0,0,0.7)',
          }}
        >
          <div style={{ color: '#2a3a5a', fontSize: 9, fontFamily: 'monospace', marginBottom: 6, letterSpacing: '0.08em' }}>
            MUNDOS  <span style={{ color: '#1a2a3a' }}>· [M] mapa completo</span>
          </div>
          <div style={{ maxHeight: 130, overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3 }}>
            {MAP_LIST.map(m => {
              const locked   = player.level < m.minLvl
              const active   = currentMap.id === m.id
              return (
                <button
                  key={m.id}
                  onClick={() => !locked && onMapChange(m.id)}
                  disabled={locked}
                  title={locked ? `Requer Nv. ${m.minLvl}` : m.name}
                  style={{
                    fontSize: 9, fontFamily: 'monospace', fontWeight: active ? 'bold' : 'normal',
                    padding: '3px 6px', borderRadius: 4, cursor: locked ? 'not-allowed' : 'pointer',
                    border: active
                      ? '1px solid rgba(100,160,255,0.6)'
                      : locked
                        ? '1px solid rgba(30,40,60,0.4)'
                        : '1px solid rgba(42,56,96,0.5)',
                    background: active
                      ? 'rgba(30,60,120,0.5)'
                      : locked ? 'rgba(8,10,18,0.5)' : 'rgba(10,14,28,0.6)',
                    color: active ? '#80b8ff' : locked ? '#2a3040' : '#7a90b0',
                    transition: 'all 0.15s',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={e => { if (!locked && !active) { e.currentTarget.style.background = 'rgba(20,40,80,0.6)'; e.currentTarget.style.color = '#a0c0e0' } }}
                  onMouseLeave={e => { if (!locked && !active) { e.currentTarget.style.background = 'rgba(10,14,28,0.6)'; e.currentTarget.style.color = '#7a90b0' } }}
                >
                  {m.name}
                  {locked && <span style={{ color: '#1a2030', display: 'block', fontSize: 8 }}>Nv{m.minLvl}</span>}
                </button>
              )
            })}
          </div>
        </div>

        {/* Action menu */}
        <div
          className="rounded-lg p-2"
          style={{
            background: 'rgba(4,6,14,0.92)',
            border: '1px solid rgba(42,56,96,0.6)',
            boxShadow: '0 2px 16px rgba(0,0,0,0.7)',
          }}
        >
          <div style={{ color: '#2a3a5a', fontSize: 9, fontFamily: 'monospace', marginBottom: 6, letterSpacing: '0.08em' }}>
            MENU
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 3 }}>
            {[
              { label: 'Inventário', key: 'I', cb: onOpenInventory,       color: '#8090b0' },
              { label: 'Missões',    key: 'Q', cb: onOpenQuests,          color: '#c0a030' },
              { label: 'Conquistas',key: 'A', cb: onOpenAchievements,     color: '#9060d0' },
              { label: 'Passivas',  key: 'P', cb: onOpenPassives,         color: '#4080c0' },
              { label: 'Ferraria',  key: 'C', cb: onOpenCrafting,         color: '#c06020' },
              { label: 'Status',    key: 'S', cb: onOpenStats,            color: '#40a0b0' },
              { label: 'Ajuda',     key: 'H', cb: onOpenHelp,             color: '#607080' },
              { label: 'Salvar',    key: '',  cb: onSave,                 color: '#406040' },
            ].map(btn => btn.cb && (
              <button
                key={btn.label}
                onClick={btn.cb}
                style={{
                  background: 'rgba(10,14,28,0.8)',
                  border: '1px solid rgba(42,56,96,0.4)',
                  borderRadius: 5, cursor: 'pointer',
                  padding: '5px 4px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
                  transition: 'all 0.15s',
                  minWidth: 50,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(20,30,60,0.9)'; e.currentTarget.style.borderColor = btn.color + '80' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(10,14,28,0.8)'; e.currentTarget.style.borderColor = 'rgba(42,56,96,0.4)' }}
              >
                <span style={{ color: btn.color, fontSize: 10, fontFamily: 'monospace', fontWeight: 600 }}>{btn.label}</span>
                {btn.key && <span style={{ color: '#2a3a5a', fontSize: 8, fontFamily: 'monospace' }}>[{btn.key}]</span>}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── BOTTOM-LEFT: Equipment slots ─────────────────────────────────── */}
      <div
        className="absolute bottom-20 left-2 flex gap-1.5 select-none pointer-events-none"
        style={{ zIndex: 10 }}
      >
        {(['weapon','armor','helmet','boots','ring'] as const).map(slot => {
          const item = player.equipment[slot]
          return (
            <div
              key={slot}
              title={item ? item.name : slot}
              style={{
                width: 40, height: 40, borderRadius: 7, fontSize: 18,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(4,6,14,0.92)',
                border: item ? `1.5px solid ${RARITY_COLORS[item.rarity]}60` : '1px solid rgba(30,40,60,0.5)',
                boxShadow: item ? `0 0 8px ${RARITY_COLORS[item.rarity]}30, inset 0 0 10px rgba(0,0,0,0.4)` : 'none',
              }}
            >
              <span>{item ? item.icon : <span style={{ color: '#1a2030', fontSize: 10 }}>–</span>}</span>
            </div>
          )
        })}
      </div>

      {/* ── BOTTOM-CENTER: Chat log ───────────────────────────────────────── */}
      <div
        className="absolute bottom-2 pointer-events-none select-none"
        style={{ zIndex: 10, left: '50%', transform: 'translateX(-50%)', width: 340 }}
      >
        <div
          className="rounded-lg px-3 py-2"
          style={{
            background: 'rgba(4,6,14,0.82)',
            border: '1px solid rgba(30,40,60,0.5)',
          }}
        >
          {chatMessages.slice(-4).map(m => (
            <div key={m.id} style={{ fontSize: 10, fontFamily: 'monospace', color: MSG_COLORS[m.type] ?? '#607080', marginBottom: 1 }}>
              {m.text}
            </div>
          ))}
          {chatMessages.length === 0 && (
            <div style={{ fontSize: 10, color: '#2a3040', fontFamily: 'monospace' }}>Bem-vindo! Use WASD para mover.</div>
          )}
        </div>
      </div>

      {/* ── NOTIFICATIONS (center-top) ────────────────────────────────────── */}
      <div
        className="absolute pointer-events-none select-none"
        style={{ zIndex: 25, top: '18%', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}
      >
        {notifications.slice(0, 3).map(n => {
          const bg  = n.type === 'level' ? 'rgba(10,40,20,0.95)' : n.type === 'achievement' ? 'rgba(30,10,50,0.95)' : 'rgba(6,10,20,0.95)'
          const bdr = n.type === 'level' ? '#30c060' : n.type === 'achievement' ? '#9040d0' : '#2a4070'
          const clr = n.type === 'level' ? '#60e080' : n.type === 'achievement' ? '#d060ff' : '#80a0d0'
          return (
            <div
              key={n.id}
              style={{
                background: bg, border: `1.5px solid ${bdr}`, borderRadius: 8,
                padding: '7px 18px', textAlign: 'center',
                fontSize: 12, fontFamily: 'monospace', fontWeight: 'bold', color: clr,
                boxShadow: `0 0 20px ${bdr}40`,
                animation: 'fadeSlideIn 0.25s ease-out',
              }}
            >
              {n.text}
            </div>
          )
        })}
      </div>
    </>
  )
}

export default memo(GameHUD) as unknown as typeof GameHUD
