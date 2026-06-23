import { memo, useState } from 'react'
import type { Achievement, AchievementRarity } from '@/lib/game/types'

interface Props {
  achievements: Record<string, Achievement>
  onClose: () => void
}

const RARITY_CONFIG: Record<AchievementRarity, { color: string; bgColor: string }> = {
  common: { color: '#8a9ab0', bgColor: 'rgba(138,154,176,0.1)' },
  uncommon: { color: '#40cc60', bgColor: 'rgba(64,204,96,0.1)' },
  rare: { color: '#4080ff', bgColor: 'rgba(64,128,255,0.1)' },
  epic: { color: '#c040ff', bgColor: 'rgba(192,64,255,0.1)' },
  legendary: { color: '#ffd040', bgColor: 'rgba(255,208,64,0.1)' },
}

type FilterType = 'all' | 'unlocked' | 'locked' | 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

function AchievementsPanel2({ achievements, onClose }: Props) {
  const [filter, setFilter] = useState<FilterType>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const achievementsList = Object.values(achievements)

  const filteredAchievements = achievementsList.filter(ach => {
    // Search filter
    if (searchTerm && !ach.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }

    // Status filter
    if (filter === 'unlocked' && !ach.unlocked) return false
    if (filter === 'locked' && ach.unlocked) return false
    if (['common', 'uncommon', 'rare', 'epic', 'legendary'].includes(filter)) {
      return ach.rarity === filter
    }

    return true
  })

  const stats = {
    total: achievementsList.length,
    unlocked: achievementsList.filter(a => a.unlocked).length,
    points: achievementsList.reduce((sum, a) => sum + (a.unlocked ? a.points : 0), 0),
    maxPoints: achievementsList.reduce((sum, a) => sum + a.points, 0),
  }

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
          maxWidth: '90vw',
          width: '1000px',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '2px solid rgba(42,56,96,0.6)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h2
            style={{
              color: '#80b8ff',
              fontSize: 18,
              fontWeight: 'bold',
              fontFamily: 'monospace',
              margin: 0,
              letterSpacing: '0.1em',
            }}
          >
            🏆 CONQUISTAS ({stats.unlocked}/{stats.total})
          </h2>
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
            }}
          >
            ✕
          </button>
        </div>

        {/* Stats Bar */}
        <div
          style={{
            padding: '12px 16px',
            background: 'rgba(20,30,60,0.5)',
            borderBottom: '1px solid rgba(42,56,96,0.4)',
            display: 'flex',
            gap: 24,
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', gap: 16 }}>
            {[
              { label: 'Desbloqueadas', value: stats.unlocked, color: '#40c080' },
              { label: 'Pontos', value: stats.points, color: '#ffd040' },
              { label: '% Completo', value: Math.round((stats.unlocked / stats.total) * 100) + '%', color: '#80b8ff' },
            ].map(stat => (
              <div key={stat.label}>
                <div style={{ color: '#2a3a5a', fontSize: 8, fontFamily: 'monospace' }}>
                  {stat.label}
                </div>
                <div
                  style={{
                    color: stat.color,
                    fontSize: 12,
                    fontWeight: 'bold',
                    fontFamily: 'monospace',
                  }}
                >
                  {stat.value}
                </div>
              </div>
            ))}
          </div>

          {/* Progress Bar */}
          <div style={{ flex: 1, minWidth: 150 }}>
            <div
              style={{
                height: 8,
                background: 'rgba(0,0,0,0.3)',
                borderRadius: 4,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  background: 'linear-gradient(90deg, #40c080, #ffd040)',
                  width: `${(stats.unlocked / stats.total) * 100}%`,
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div
          style={{
            padding: '12px 16px',
            borderBottom: '1px solid rgba(42,56,96,0.4)',
            display: 'flex',
            gap: 8,
            flexWrap: 'wrap',
          }}
        >
          {/* Search */}
          <input
            type="text"
            placeholder="Buscar conquista..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(80,120,200,0.3)',
              borderRadius: 4,
              padding: '6px 8px',
              color: '#7a90b0',
              fontFamily: 'monospace',
              fontSize: 10,
              flex: 1,
              minWidth: 150,
            }}
          />

          {/* Filter Buttons */}
          {(['all', 'unlocked', 'locked'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '6px 12px',
                background: filter === f ? 'rgba(80,120,200,0.2)' : 'rgba(0,0,0,0.2)',
                border: filter === f ? '1px solid rgba(80,120,200,0.6)' : '1px solid rgba(80,120,200,0.2)',
                borderRadius: 4,
                color: filter === f ? '#80b8ff' : '#2a3a5a',
                fontSize: 9,
                fontFamily: 'monospace',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => {
                if (filter !== f) {
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(80,120,200,0.15)'
                }
              }}
              onMouseLeave={e => {
                if (filter !== f) {
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,0,0,0.2)'
                }
              }}
            >
              {f === 'all' ? 'TODAS' : f === 'unlocked' ? '✓ DESBLOQUEADAS' : '🔒 BLOQUEADAS'}
            </button>
          ))}

          {/* Rarity Filters */}
          <div style={{ borderLeft: '1px solid rgba(80,120,200,0.2)', paddingLeft: 8, display: 'flex', gap: 6 }}>
            {(['common', 'uncommon', 'rare', 'epic', 'legendary'] as const).map(rarity => (
              <button
                key={rarity}
                onClick={() => setFilter(rarity)}
                title={rarity}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 4,
                  background:
                    filter === rarity
                      ? RARITY_CONFIG[rarity].color + '40'
                      : 'rgba(0,0,0,0.2)',
                  border:
                    filter === rarity
                      ? `1px solid ${RARITY_CONFIG[rarity].color}`
                      : '1px solid rgba(80,120,200,0.2)',
                  color: RARITY_CONFIG[rarity].color,
                  fontSize: 11,
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ●
              </button>
            ))}
          </div>
        </div>

        {/* Achievement Grid */}
        <div
          style={{
            padding: '16px',
            overflowY: 'auto',
            flex: 1,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 12,
          }}
        >
          {filteredAchievements.length > 0 ? (
            filteredAchievements.map(ach => {
              const config = RARITY_CONFIG[ach.rarity]

              return (
                <div
                  key={ach.id}
                  style={{
                    background: ach.unlocked ? config.bgColor : 'rgba(10,10,20,0.5)',
                    border: `1px solid ${ach.unlocked ? config.color + '40' : 'rgba(30,30,60,0.3)'}`,
                    borderRadius: 8,
                    padding: 12,
                    transition: 'all 0.2s',
                    opacity: ach.secret && !ach.unlocked ? 0.7 : 1,
                    filter: ach.secret && !ach.unlocked ? 'blur(1px)' : 'blur(0px)',
                  }}
                >
                  {/* Header */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 8,
                      marginBottom: 8,
                    }}
                  >
                    <span style={{ fontSize: 24 }}>
                      {ach.unlocked ? ach.icon : '🔒'}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3
                        style={{
                          color: ach.unlocked ? config.color : '#2a3a5a',
                          fontSize: 10,
                          fontWeight: 'bold',
                          fontFamily: 'monospace',
                          margin: 0,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {ach.unlocked || !ach.secret ? ach.name : '❌ Secreto'}
                      </h3>
                      <div
                        style={{
                          color: '#2a3a5a',
                          fontSize: 8,
                          fontFamily: 'monospace',
                          marginTop: 1,
                        }}
                      >
                        {ach.points} pts • {ach.rarity}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p
                    style={{
                      color: '#4a6a8a',
                      fontSize: 8,
                      fontFamily: 'monospace',
                      margin: '0 0 8px 0',
                      lineHeight: 1.3,
                      minHeight: 16,
                    }}
                  >
                    {ach.unlocked || !ach.secret ? ach.description : 'Desbloqueie para ver a descrição'}
                  </p>

                  {/* Progress Bar */}
                  {ach.progress < ach.requirement && (
                    <div style={{ marginBottom: 8 }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: 2,
                          fontSize: 7,
                          fontFamily: 'monospace',
                        }}
                      >
                        <span style={{ color: '#2a3a5a' }}>Progresso</span>
                        <span style={{ color: config.color }}>
                          {ach.progress}/{ach.requirement}
                        </span>
                      </div>
                      <div
                        style={{
                          height: 4,
                          background: 'rgba(0,0,0,0.3)',
                          borderRadius: 2,
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            background: `linear-gradient(90deg, ${config.color}, ${config.color}80)`,
                            width: `${Math.min((ach.progress / ach.requirement) * 100, 100)}%`,
                            transition: 'width 0.3s ease',
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Unlock Date */}
                  {ach.unlocked && ach.unlockedAt && (
                    <div
                      style={{
                        color: '#2a3a5a',
                        fontSize: 7,
                        fontFamily: 'monospace',
                        textAlign: 'center',
                        paddingTop: 6,
                        borderTop: `1px solid ${config.color}30`,
                      }}
                    >
                      ✓ Desbloqueado
                    </div>
                  )}
                </div>
              )
            })
          ) : (
            <div
              style={{
                gridColumn: '1 / -1',
                textAlign: 'center',
                color: '#2a3a5a',
                padding: '40px',
                fontFamily: 'monospace',
              }}
            >
              Nenhuma conquista encontrada
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default memo(AchievementsPanel2)
