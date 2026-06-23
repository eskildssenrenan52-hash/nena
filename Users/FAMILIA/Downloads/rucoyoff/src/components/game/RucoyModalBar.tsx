import { memo } from 'react'

interface Props {
  isInventoryOpen: boolean
  isQuestOpen: boolean
  isAchievementsOpen: boolean
  isPassiveOpen: boolean
  isCraftingOpen: boolean
  isStatsOpen: boolean
  isHelpOpen: boolean
  isMapOpen: boolean
  isPrestigeOpen?: boolean
  isSpecOpen?: boolean
  onToggleInventory: () => void
  onToggleQuest: () => void
  onToggleAchievements: () => void
  onTogglePassive: () => void
  onToggleCrafting: () => void
  onToggleStats: () => void
  onToggleHelp: () => void
  onToggleMap: () => void
  onTogglePrestige?: () => void
  onToggleSpec?: () => void
  onSave: () => void
}

const MODAL_BUTTONS = [
  { 
    key: 'map', 
    icon: '🗺', 
    label: 'Mundo', 
    color: '#4080ff',
    shortcut: 'M'
  },
  { 
    key: 'inventory', 
    icon: '🎒', 
    label: 'Inventário', 
    color: '#8090b0',
    shortcut: 'I'
  },
  { 
    key: 'stats', 
    icon: '📊', 
    label: 'Status', 
    color: '#40a0b0',
    shortcut: 'S'
  },
  { 
    key: 'quest', 
    icon: '📜', 
    label: 'Missões', 
    color: '#c0a030',
    shortcut: 'Q'
  },
  { 
    key: 'achievements', 
    icon: '🏆', 
    label: 'Conquistas', 
    color: '#9060d0',
    shortcut: 'A'
  },
  { 
    key: 'passive', 
    icon: '🌳', 
    label: 'Passivas', 
    color: '#4080c0',
    shortcut: 'P'
  },
  { 
    key: 'crafting', 
    icon: '⚒', 
    label: 'Ferraria', 
    color: '#c06020',
    shortcut: 'C'
  },
  { 
    key: 'prestige', 
    icon: '★', 
    label: 'Prestígio', 
    color: '#d8a534',
    shortcut: 'X'
  },
  { 
    key: 'spec', 
    icon: '✦', 
    label: 'Specs', 
    color: '#7ab8ff',
    shortcut: 'B'
  },
  { 
    key: 'help', 
    icon: '❓', 
    label: 'Ajuda', 
    color: '#607080',
    shortcut: 'H'
  },
]

function RucoyModalBar({
  isInventoryOpen,
  isQuestOpen,
  isAchievementsOpen,
  isPassiveOpen,
  isCraftingOpen,
  isStatsOpen,
  isHelpOpen,
  isMapOpen,
  isPrestigeOpen,
  isSpecOpen,
  onToggleInventory,
  onToggleQuest,
  onToggleAchievements,
  onTogglePassive,
  onToggleCrafting,
  onToggleStats,
  onToggleHelp,
  onToggleMap,
  onTogglePrestige,
  onToggleSpec,
  onSave,
}: Props) {
  const toggleMap: Record<string, () => void> = {
    map: onToggleMap,
    inventory: onToggleInventory,
    stats: onToggleStats,
    quest: onToggleQuest,
    achievements: onToggleAchievements,
    passive: onTogglePassive,
    crafting: onToggleCrafting,
    prestige: onTogglePrestige ?? (() => {}),
    spec: onToggleSpec ?? (() => {}),
    help: onToggleHelp,
  }

  const isOpen: Record<string, boolean> = {
    map: isMapOpen,
    inventory: isInventoryOpen,
    stats: isStatsOpen,
    quest: isQuestOpen,
    achievements: isAchievementsOpen,
    passive: isPassiveOpen,
    crafting: isCraftingOpen,
    prestige: !!isPrestigeOpen,
    spec: !!isSpecOpen,
    help: isHelpOpen,
  }

  return (
    <div
      className="absolute top-2 right-2 flex items-center gap-1 select-none pointer-events-auto"
      style={{ zIndex: 15 }}
    >
      {/* Barra de modais pixelados */}
      <div
        className="flex items-center gap-1 px-2 py-1.5 rounded-lg"
        style={{
          background: 'rgba(4,6,14,0.92)',
          border: '2px solid rgba(42,56,96,0.6)',
          boxShadow: '0 2px 16px rgba(0,0,0,0.7), inset 0 0 8px rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
        }}
      >
        {MODAL_BUTTONS.map(btn => (
          <button
            key={btn.key}
            onClick={toggleMap[btn.key]}
            title={`${btn.label} [${btn.shortcut}]`}
            style={{
              width: 42,
              height: 42,
              borderRadius: 4,
              fontSize: 18,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              border: isOpen[btn.key] 
                ? `2px solid ${btn.color}` 
                : '1px solid rgba(30,40,60,0.4)',
              background: isOpen[btn.key]
                ? `rgba(${btn.color === '#4080ff' ? '64,128,255' : '0,0,0'},0.2)`
                : 'rgba(10,14,28,0.6)',
              boxShadow: isOpen[btn.key]
                ? `0 0 12px ${btn.color}40, inset 0 0 8px ${btn.color}20`
                : 'inset 0 0 4px rgba(0,0,0,0.3)',
              filter: isOpen[btn.key] ? 'brightness(1.2)' : 'brightness(0.9)',
              aspectRatio: '1',
            }}
            onMouseEnter={e => {
              if (!isOpen[btn.key]) {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(20,30,60,0.6)'
                ;(e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 8px ${btn.color}30, inset 0 0 4px rgba(0,0,0,0.3)`
              }
            }}
            onMouseLeave={e => {
              if (!isOpen[btn.key]) {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(10,14,28,0.6)'
                ;(e.currentTarget as HTMLButtonElement).style.boxShadow = 'inset 0 0 4px rgba(0,0,0,0.3)'
              }
            }}
          >
            <span style={{ filter: isOpen[btn.key] ? `drop-shadow(0 0 4px ${btn.color})` : 'none' }}>
              {btn.icon}
            </span>
          </button>
        ))}
      </div>

      {/* Botão Salvar */}
      <button
        onClick={onSave}
        title="Salvar Jogo [G]"
        style={{
          width: 42,
          height: 42,
          borderRadius: 4,
          fontSize: 18,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          border: '1px solid rgba(64,96,64,0.5)',
          background: 'rgba(10,28,10,0.6)',
          boxShadow: 'inset 0 0 4px rgba(0,0,0,0.3)',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(30,80,30,0.6)'
          ;(e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 8px rgba(64,192,64,0.3), inset 0 0 4px rgba(0,0,0,0.3)'
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(10,28,10,0.6)'
          ;(e.currentTarget as HTMLButtonElement).style.boxShadow = 'inset 0 0 4px rgba(0,0,0,0.3)'
        }}
      >
        💾
      </button>
    </div>
  )
}

export default memo(RucoyModalBar)
