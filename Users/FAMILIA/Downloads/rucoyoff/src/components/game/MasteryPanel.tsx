import { memo, useState } from 'react'
import type { PlayerMasteries, MasteryType } from '@/lib/game/types'

interface Props {
  masteries: PlayerMasteries
  onClose: () => void
  onSwitchMastery?: (type: MasteryType) => void
  onUpgradeNode?: (masteryType: MasteryType, nodeId: string) => void
}

const MASTERY_COLORS: Record<MasteryType, { color: string; emoji: string; category: string }> = {
  SWORD: { color: '#c0c0c0', emoji: '⚔', category: 'Melee' },
  AXE: { color: '#cc8040', emoji: '🪓', category: 'Melee' },
  SPEAR: { color: '#d0d080', emoji: '⚡', category: 'Melee' },
  DAGGER: { color: '#8040c0', emoji: '🗡', category: 'Melee' },
  BOW: { color: '#40a080', emoji: '🏹', category: 'Ranged' },
  STAFF: { color: '#4080ff', emoji: '🔱', category: 'Ranged' },
  SHIELD: { color: '#ffd080', emoji: '🛡', category: 'Defense' },
  BARE_HANDS: { color: '#ff6040', emoji: '👊', category: 'Melee' },
  FIRE: { color: '#ff4020', emoji: '🔥', category: 'Magic' },
  ICE: { color: '#40d0ff', emoji: '❄', category: 'Magic' },
  LIGHTNING: { color: '#ffff40', emoji: '⚡', category: 'Magic' },
  DEFENSE: { color: '#80ff80', emoji: '🛡', category: 'Stats' },
  VITALITY: { color: '#ff80c0', emoji: '❤', category: 'Stats' },
  SHADOW: { color: '#404040', emoji: '👤', category: 'Stats' },
  LIGHT: { color: '#ffff80', emoji: '✨', category: 'Stats' },
}

function MasteryPanel({ masteries, onClose, onSwitchMastery, onUpgradeNode }: Props) {
  const [selectedMastery, setSelectedMastery] = useState<MasteryType>(masteries.active)

  const activeMastery = masteries.masteries[selectedMastery]
  const config = MASTERY_COLORS[selectedMastery]

  const categories = Array.from(
    new Set(Object.values(MASTERY_COLORS).map(c => c.category))
  )

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.7)',
          zIndex: 40,
          cursor: 'pointer',
        }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 50,
          background: 'rgba(4,6,14,0.96)',
          border: '3px solid rgba(42,56,96,0.8)',
          borderRadius: 12,
          boxShadow: '0 0 40px rgba(0,0,0,0.9)',
          maxHeight: '90vh',
          maxWidth: '95vw',
          width: '1200px',
          backdropFilter: 'blur(8px)',
          display: 'grid',
          gridTemplateColumns: '300px 1fr',
          overflow: 'hidden',
        }}
      >
        {/* Sidebar - Lista de Masteries */}
        <div
          style={{
            borderRight: '2px solid rgba(42,56,96,0.6)',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '12px',
              borderBottom: '1px solid rgba(42,56,96,0.4)',
              background: 'rgba(20,30,60,0.5)',
            }}
          >
            <div style={{ color: '#80b8ff', fontSize: 11, fontWeight: 'bold', fontFamily: 'monospace' }}>
              MASTERIES
            </div>
          </div>

          {/* Masteries by Category */}
          {categories.map(category => {
            const categoryMasteries = (Object.keys(MASTERY_COLORS) as MasteryType[]).filter(
              m => MASTERY_COLORS[m].category === category
            )

            return (
              <div key={category} style={{ paddingBottom: 8 }}>
                <div
                  style={{
                    padding: '8px 12px',
                    color: '#4a6a8a',
                    fontSize: 9,
                    fontFamily: 'monospace',
                    fontWeight: 'bold',
                    letterSpacing: '0.05em',
                  }}
                >
                  {category.toUpperCase()}
                </div>

                {categoryMasteries.map(masteryType => {
                  const masteryConfig = MASTERY_COLORS[masteryType]
                  const mastery = masteries.masteries[masteryType]
                  const isActive = selectedMastery === masteryType

                  return (
                    <button
                      key={masteryType}
                      onClick={() => {
                        setSelectedMastery(masteryType)
                        onSwitchMastery?.(masteryType)
                      }}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        background: isActive
                          ? `rgba(${parseInt(masteryConfig.color.slice(1, 3), 16)}, ${parseInt(masteryConfig.color.slice(3, 5), 16)}, ${parseInt(masteryConfig.color.slice(5, 7), 16)}, 0.2)`
                          : 'transparent',
                        border: isActive ? `1px solid ${masteryConfig.color}60` : '1px solid transparent',
                        borderLeft: isActive ? `3px solid ${masteryConfig.color}` : '3px solid transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        transition: 'all 0.15s',
                        justifyContent: 'space-between',
                      }}
                      onMouseEnter={e => {
                        if (!isActive) {
                          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(30,40,60,0.4)'
                        }
                      }}
                      onMouseLeave={e => {
                        if (!isActive) {
                          (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
                        }
                      }}
                    >
                      <span style={{ fontSize: 14 }}>{masteryConfig.emoji}</span>
                      <div style={{ textAlign: 'left', flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            color: isActive ? masteryConfig.color : '#7a90b0',
                            fontSize: 9,
                            fontWeight: 'bold',
                            fontFamily: 'monospace',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {masteryType}
                        </div>
                        <div
                          style={{
                            color: '#2a3a5a',
                            fontSize: 8,
                            fontFamily: 'monospace',
                          }}
                        >
                          Nv {mastery.level}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )
          })}
        </div>

        {/* Main Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '16px',
              borderBottom: '2px solid rgba(42,56,96,0.6)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 32 }}>{config.emoji}</span>
              <div>
                <h2
                  style={{
                    color: config.color,
                    fontSize: 18,
                    fontWeight: 'bold',
                    fontFamily: 'monospace',
                    margin: 0,
                    letterSpacing: '0.1em',
                  }}
                >
                  {selectedMastery}
                </h2>
                <div
                  style={{
                    color: '#4a6a8a',
                    fontSize: 10,
                    fontFamily: 'monospace',
                  }}
                >
                  Nível {activeMastery.level} • Total {activeMastery.totalLevel} nodes
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              style={{
                background: 'rgba(200,80,80,0.6)',
                border: '1px solid rgba(200,80,80,0.8)',
                color: '#ff9090',
                width: 32,
                height: 32,
                borderRadius: 4,
                fontSize: 16,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ✕
            </button>
          </div>

          {/* Nodes Grid */}
          <div
            style={{
              padding: '16px',
              overflowY: 'auto',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: 12,
              flex: 1,
            }}
          >
            {Object.values(activeMastery.nodes).map(node => (
              <div
                key={node.id}
                style={{
                  background: 'rgba(20,30,60,0.5)',
                  border: `1px solid ${config.color}40`,
                  borderRadius: 8,
                  padding: 12,
                  transition: 'all 0.2s',
                  cursor: node.level < 10 ? 'pointer' : 'default',
                }}
                onMouseEnter={e => {
                  if (node.level < 10) {
                    (e.currentTarget as HTMLDivElement).style.background = `rgba(${parseInt(config.color.slice(1, 3), 16)}, ${parseInt(config.color.slice(3, 5), 16)}, ${parseInt(config.color.slice(5, 7), 16)}, 0.15)`
                    ;(e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 12px ${config.color}30`
                  }
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.background = 'rgba(20,30,60,0.5)'
                  ;(e.currentTarget as HTMLDivElement).style.boxShadow = 'none'
                }}
              >
                {/* Node Header */}
                <div style={{ marginBottom: 8 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      marginBottom: 4,
                    }}
                  >
                    <span style={{ fontSize: 18 }}>{node.icon}</span>
                    <h3
                      style={{
                        color: config.color,
                        fontSize: 11,
                        fontWeight: 'bold',
                        fontFamily: 'monospace',
                        margin: 0,
                        flex: 1,
                      }}
                    >
                      {node.name}
                    </h3>
                    <div
                      style={{
                        background: 'rgba(0,0,0,0.3)',
                        border: `1px solid ${config.color}60`,
                        borderRadius: 3,
                        padding: '2px 6px',
                        fontSize: 9,
                        fontWeight: 'bold',
                        fontFamily: 'monospace',
                        color: config.color,
                      }}
                    >
                      {node.level}/10
                    </div>
                  </div>
                  <p
                    style={{
                      color: '#7a90b0',
                      fontSize: 9,
                      fontFamily: 'monospace',
                      margin: '0 0 8px 0',
                      lineHeight: 1.3,
                    }}
                  >
                    {node.description}
                  </p>
                </div>

                {/* Progress Bar */}
                <div style={{ marginBottom: 8 }}>
                  <div
                    style={{
                      height: 6,
                      background: 'rgba(0,0,0,0.3)',
                      borderRadius: 3,
                      overflow: 'hidden',
                      border: `1px solid ${config.color}30`,
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        background: `linear-gradient(90deg, ${config.color}, ${config.color}80)`,
                        width: `${(node.xp / node.xpToNext) * 100}%`,
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                  <div
                    style={{
                      color: '#2a3a5a',
                      fontSize: 8,
                      fontFamily: 'monospace',
                      marginTop: 2,
                    }}
                  >
                    {node.xp} / {node.xpToNext} XP
                  </div>
                </div>

                {/* Upgrade Button */}
                <button
                  onClick={() => onUpgradeNode?.(selectedMastery, node.id)}
                  disabled={node.level >= 10}
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    background:
                      node.level >= 10
                        ? 'rgba(0,0,0,0.2)'
                        : `rgba(${parseInt(config.color.slice(1, 3), 16)}, ${parseInt(config.color.slice(3, 5), 16)}, ${parseInt(config.color.slice(5, 7), 16)}, 0.2)`,
                    border:
                      node.level >= 10
                        ? '1px solid rgba(0,0,0,0.3)'
                        : `1px solid ${config.color}60`,
                    borderRadius: 4,
                    color: node.level >= 10 ? '#2a3a5a' : config.color,
                    fontSize: 9,
                    fontFamily: 'monospace',
                    fontWeight: 'bold',
                    cursor: node.level >= 10 ? 'not-allowed' : 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => {
                    if ((e.currentTarget as HTMLButtonElement).disabled) return
                    ;(e.currentTarget as HTMLButtonElement).style.background = `rgba(${parseInt(config.color.slice(1, 3), 16)}, ${parseInt(config.color.slice(3, 5), 16)}, ${parseInt(config.color.slice(5, 7), 16)}, 0.3)`
                  }}
                  onMouseLeave={e => {
                    if ((e.currentTarget as HTMLButtonElement).disabled) return
                    ;(e.currentTarget as HTMLButtonElement).style.background = `rgba(${parseInt(config.color.slice(1, 3), 16)}, ${parseInt(config.color.slice(3, 5), 16)}, ${parseInt(config.color.slice(5, 7), 16)}, 0.2)`
                  }}
                >
                  {node.level >= 10 ? 'MÁXIMO' : '➕ UPGRADE'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

export default memo(MasteryPanel)
