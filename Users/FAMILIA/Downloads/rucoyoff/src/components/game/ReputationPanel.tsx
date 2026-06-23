import { memo } from 'react'
import type { PlayerReputation, FactionType } from '@/lib/game/types'
import { getReputationColor, formatReputationInfo } from '@/lib/game/reputationSystem'

interface Props {
  reputation: PlayerReputation
  onClose: () => void
}

const FACTION_INFO: Record<FactionType, { 
  emoji: string
  title: string
  description: string
  color: string
}> = {
  ORDER: { emoji: '⚔', title: 'Ordem', description: 'Guardiões da Lei', color: '#4080ff' },
  CHAOS: { emoji: '🔥', title: 'Caos', description: 'Libertários do Absurdo', color: '#ff4040' },
  NATURE: { emoji: '🌿', title: 'Natureza', description: 'Guardiões da Floresta', color: '#40c080' },
  CIVILIZATION: { emoji: '🏰', title: 'Civilização', description: 'Construtores do Progresso', color: '#c0a030' },
  SHADOW: { emoji: '👤', title: 'Sombra', description: 'Mestres do Oculto', color: '#8040c0' },
}

function createProgressBar(value: number, max: number, length: number): string {
  const normalized = Math.max(0, Math.min(1, (value + max) / (max * 2)))
  const filled = Math.round(normalized * length)
  return `${'█'.repeat(filled)}${'░'.repeat(length - filled)}`
}

function ReputationPanel({ reputation, onClose }: Props) {
  const factions = Object.values(reputation) as typeof reputation[keyof typeof reputation][]

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
          boxShadow: '0 0 40px rgba(0,0,0,0.9), inset 0 0 20px rgba(0,0,0,0.5)',
          maxHeight: '90vh',
          maxWidth: '85vw',
          width: 'fit-content',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          flexDirection: 'column',
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
            🌍 REPUTAÇÃO COM FAÇÕES
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
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(220,100,100,0.8)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(200,80,80,0.6)'
            }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div
          style={{
            padding: '16px',
            overflowY: 'auto',
            maxHeight: 'calc(90vh - 80px)',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          {/* Total Reputation Score */}
          <div
            style={{
              background: 'rgba(20,30,60,0.5)',
              border: '1px solid rgba(80,120,200,0.3)',
              borderRadius: 8,
              padding: 12,
              textAlign: 'center',
            }}
          >
            <div style={{ color: '#80b8ff', fontSize: 12, fontWeight: 'bold', fontFamily: 'monospace' }}>
              PONTUAÇÃO TOTAL
            </div>
            <div
              style={{
                color: '#ffd040',
                fontSize: 24,
                fontWeight: 'bold',
                fontFamily: 'monospace',
                marginTop: 4,
              }}
            >
              {factions.reduce((sum, f) => sum + f.level, 0)}/500
            </div>
            <div
              style={{
                color: '#4a6a8a',
                fontSize: 10,
                fontFamily: 'monospace',
                marginTop: 4,
              }}
            >
              Influência total sobre as fações do mundo
            </div>
          </div>

          {/* Faction Cards */}
          {(Object.keys(FACTION_INFO) as FactionType[]).map((factionKey) => {
            const faction = reputation[factionKey.toLowerCase() as Lowercase<FactionType>]
            const info = FACTION_INFO[factionKey]

            if (!faction) return null

            const levelColor = getReputationColor(faction.level)
            const progressBar = createProgressBar(faction.level, 100, 25)

            return (
              <div
                key={factionKey}
                style={{
                  background: `rgba(${parseInt(info.color.slice(1, 3), 16)}, ${parseInt(info.color.slice(3, 5), 16)}, ${parseInt(info.color.slice(5, 7), 16)}, 0.1)`,
                  border: `1px solid ${info.color}40`,
                  borderRadius: 8,
                  padding: 12,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.background = `rgba(${parseInt(info.color.slice(1, 3), 16)}, ${parseInt(info.color.slice(3, 5), 16)}, ${parseInt(info.color.slice(5, 7), 16)}, 0.15)`
                  ;(e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 12px ${info.color}30`
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.background = `rgba(${parseInt(info.color.slice(1, 3), 16)}, ${parseInt(info.color.slice(3, 5), 16)}, ${parseInt(info.color.slice(5, 7), 16)}, 0.1)`
                  ;(e.currentTarget as HTMLDivElement).style.boxShadow = 'none'
                }}
              >
                {/* Header da Fação */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 8,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <span style={{ fontSize: 24 }}>{info.emoji}</span>
                    <div>
                      <div
                        style={{
                          color: info.color,
                          fontSize: 12,
                          fontWeight: 'bold',
                          fontFamily: 'monospace',
                          letterSpacing: '0.05em',
                        }}
                      >
                        {info.title.toUpperCase()}
                      </div>
                      <div
                        style={{
                          color: '#4a6a8a',
                          fontSize: 9,
                          fontFamily: 'monospace',
                        }}
                      >
                        {info.description}
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      background: 'rgba(0,0,0,0.3)',
                      border: `1px solid ${levelColor}60`,
                      borderRadius: 4,
                      padding: '4px 8px',
                      textAlign: 'center',
                    }}
                  >
                    <div
                      style={{
                        color: levelColor,
                        fontSize: 11,
                        fontWeight: 'bold',
                        fontFamily: 'monospace',
                      }}
                    >
                      {faction.level > 0 ? '+' : ''}{faction.level}
                    </div>
                    <div
                      style={{
                        color: '#2a3a5a',
                        fontSize: 8,
                        fontFamily: 'monospace',
                      }}
                    >
                      {faction.title}
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div style={{ marginBottom: 8 }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: 4,
                      fontSize: 9,
                      fontFamily: 'monospace',
                    }}
                  >
                    <span style={{ color: '#4a6a8a' }}>NÍVEL</span>
                    <span style={{ color: levelColor }}>
                      {faction.points % 1000} / 1000
                    </span>
                  </div>
                  <div
                    style={{
                      background: 'rgba(0,0,0,0.3)',
                      borderRadius: 4,
                      overflow: 'hidden',
                      border: `1px solid ${info.color}30`,
                    }}
                  >
                    <div
                      style={{
                        background: `linear-gradient(90deg, ${info.color}, ${info.color}80)`,
                        height: 8,
                        width: `${((faction.points % 1000) / 1000) * 100}%`,
                        transition: 'width 0.3s ease',
                        boxShadow: `0 0 8px ${info.color}60 inset`,
                      }}
                    />
                  </div>
                </div>

                {/* Efeitos da Reputação */}
                <div
                  style={{
                    background: 'rgba(0,0,0,0.2)',
                    borderRadius: 4,
                    padding: 8,
                    fontSize: 9,
                    fontFamily: 'monospace',
                    color: '#7a90b0',
                  }}
                >
                  {faction.level < -50 && (
                    <div style={{ color: '#ff6060' }}>
                      ⚠ INIMIGO: -30% XP, -30% Drops, Inimigos hostis
                    </div>
                  )}
                  {faction.level >= -50 && faction.level < 0 && (
                    <div style={{ color: '#ffaa00' }}>
                      ⚠ ADVERSÁRIO: -15% XP, -15% Drops
                    </div>
                  )}
                  {faction.level >= 0 && faction.level < 50 && (
                    <div style={{ color: '#aaaaaa' }}>
                      → NEUTRO: Sem bônus especiais
                    </div>
                  )}
                  {faction.level >= 50 && faction.level < 75 && (
                    <div style={{ color: '#40c080' }}>
                      ✓ ALIADO: +10% XP, +10% Drops
                    </div>
                  )}
                  {faction.level >= 75 && (
                    <div style={{ color: '#4080ff' }}>
                      ★ HERÓI: +20% XP, +20% Drops, Quests exclusivas
                    </div>
                  )}
                </div>
              </div>
            )
          })}

          {/* Info */}
          <div
            style={{
              background: 'rgba(30,60,120,0.2)',
              border: '1px solid rgba(80,120,200,0.3)',
              borderRadius: 8,
              padding: 12,
              fontSize: 9,
              fontFamily: 'monospace',
              color: '#7a90b0',
              lineHeight: 1.5,
            }}
          >
            <div style={{ color: '#80b8ff', fontWeight: 'bold', marginBottom: 4 }}>
              💡 SOBRE REPUTAÇÃO
            </div>
            Sua reputação afeta:<br/>
            • Quantidade de XP e Drops<br/>
            • Quais inimigos spawnam<br/>
            • Acesso a Quests especiais<br/>
            • Vendedores disponíveis<br/>
            • Conquistas desbloqueáveis<br/>
          </div>
        </div>
      </div>
    </>
  )
}

export default memo(ReputationPanel)
