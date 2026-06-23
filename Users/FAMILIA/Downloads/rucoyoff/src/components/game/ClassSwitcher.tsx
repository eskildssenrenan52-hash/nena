import { useState } from 'react'
import type { CharacterClass, Player } from '@/lib/game/types'

interface Props {
  player: Player
  onSwitch: (cls: CharacterClass) => void
}

const CLASSES: { id: CharacterClass; label: string; icon: string; color: string }[] = [
  { id: 'knight',      label: 'Cavaleiro',   icon: '⚔', color: '#d8b048' },
  { id: 'archer',      label: 'Arqueiro',    icon: '🏹', color: '#60c040' },
  { id: 'mage',        label: 'Mago',        icon: '✦', color: '#60c0ff' },
  { id: 'necromancer', label: 'Necromante',  icon: '☠', color: '#a020e0' },
  { id: 'paladin',     label: 'Paladino',    icon: '✚', color: '#f0d878' },
  { id: 'berserker',   label: 'Berserker',   icon: '🪓', color: '#c83030' },
  { id: 'assassin',    label: 'Assassino',   icon: '🗡', color: '#a0a0c0' },
  { id: 'druid',       label: 'Druida',      icon: '🌿', color: '#3aa84a' },
  { id: 'monk',        label: 'Monge',       icon: '✊', color: '#ffd070' },
  { id: 'samurai',     label: 'Samurai',     icon: '🗡', color: '#e0c060' },
  { id: 'summoner',    label: 'Invocador',   icon: '✦', color: '#80c0ff' },
  { id: 'alchemist',   label: 'Alquimista',  icon: '⚗', color: '#a8e060' },
]

export default function ClassSwitcher({ player, onSwitch }: Props) {
  const [open, setOpen] = useState(false)
  const current = CLASSES.find(c => c.id === player.class)!

  return (
    <div className="pointer-events-auto" style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(v => !v)}
        title="Trocar de classe [C]"
        style={{
          background: 'rgba(8,10,18,0.92)',
          border: `2px solid ${current.color}`,
          color: current.color,
          borderRadius: 6,
          padding: '6px 10px',
          fontSize: 11,
          fontWeight: 700,
          fontFamily: 'monospace',
          letterSpacing: 1,
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 6,
          boxShadow: `0 0 10px ${current.color}33`,
        }}
      >
        <span style={{ fontSize: 14 }}>{current.icon}</span>
        <span>{current.label.toUpperCase()}</span>
        <span style={{ fontSize: 9, color: '#5a7a9a' }}>[C]</span>
      </button>
      {open && (
        <div
          style={{
            position: 'absolute', top: '110%', right: 0,
            background: 'rgba(8,10,18,0.97)',
            border: '2px solid #2a3860',
            borderRadius: 6,
            padding: 4,
            display: 'flex', flexDirection: 'column', gap: 3,
            minWidth: 180,
            boxShadow: '0 6px 20px rgba(0,0,0,0.7)',
            zIndex: 40,
          }}
        >
          {CLASSES.map(c => {
            const prog = player.classProgress[c.id]
            const lvl = prog?.level ?? 1
            const active = c.id === player.class
            return (
              <button
                key={c.id}
                onClick={() => { onSwitch(c.id); setOpen(false) }}
                disabled={active}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '6px 8px',
                  background: active ? `${c.color}22` : 'transparent',
                  border: `1px solid ${active ? c.color : '#2a3060'}`,
                  borderRadius: 4,
                  color: active ? c.color : '#c8c0b0',
                  cursor: active ? 'default' : 'pointer',
                  fontFamily: 'monospace',
                  fontSize: 12,
                  textAlign: 'left',
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.borderColor = c.color }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.borderColor = '#2a3060' }}
              >
                <span style={{ fontSize: 16, color: c.color }}>{c.icon}</span>
                <span style={{ flex: 1 }}>{c.label}</span>
                <span style={{ fontSize: 10, color: '#8a9ab0' }}>Nv.{lvl}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
