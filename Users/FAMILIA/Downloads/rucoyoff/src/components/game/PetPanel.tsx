import { memo, useState } from 'react'
import type { PlayerPets, Pet } from '@/lib/game/types'

interface Props {
  pets: PlayerPets
  onClose: () => void
  onSelectPet?: (petId: string) => void
  onFeedPet?: (petId: string) => void
  onAddToParty?: (petId: string, slot: number) => void
}

const PET_COLORS: Record<string, string> = {
  SLIME: '#40c080',
  WOLF: '#8080a0',
  DRAGON: '#ff4020',
  PHOENIX: '#ff8040',
  GOLEM: '#a0a0a0',
  GHOST: '#c0c0e0',
  TREANT: '#40a040',
  SPIDER: '#804040',
}

function getMoodEmoji(mood: Pet['mood']): string {
  const emojis = { happy: '😊', neutral: '😐', angry: '😠', hungry: '😋' }
  return emojis[mood]
}

function getMoodColor(mood: Pet['mood']): string {
  const colors = { happy: '#40c080', neutral: '#8090b0', angry: '#ff6060', hungry: '#ffa040' }
  return colors[mood]
}

function PetPanel({ pets, onClose, onSelectPet, onFeedPet, onAddToParty }: Props) {
  const [selectedPetId, setSelectedPetId] = useState<string | null>(pets.active)
  const selectedPet = selectedPetId ? pets.pets.find(p => p.id === selectedPetId) : null

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
          maxWidth: '85vw',
          width: 'fit-content',
          backdropFilter: 'blur(8px)',
          display: 'grid',
          gridTemplateColumns: selectedPet ? '280px 1fr' : '1fr',
          overflow: 'hidden',
        }}
      >
        {/* Pet List Sidebar */}
        <div
          style={{
            borderRight: selectedPet ? '2px solid rgba(42,56,96,0.6)' : 'none',
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
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ color: '#80b8ff', fontSize: 11, fontWeight: 'bold', fontFamily: 'monospace' }}>
              PETS ({pets.pets.length})
            </div>
            {!selectedPet && (
              <button
                onClick={onClose}
                style={{
                  background: 'rgba(200,80,80,0.6)',
                  border: '1px solid rgba(200,80,80,0.8)',
                  color: '#ff9090',
                  width: 24,
                  height: 24,
                  borderRadius: 3,
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Pet List */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {pets.pets.map(pet => {
              const isSelected = selectedPetId === pet.id
              const petColor = PET_COLORS[pet.type] || '#8090b0'

              return (
                <button
                  key={pet.id}
                  onClick={() => {
                    setSelectedPetId(pet.id)
                    onSelectPet?.(pet.id)
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    background: isSelected ? 'rgba(80,120,200,0.2)' : 'transparent',
                    border: isSelected ? `1px solid rgba(80,120,200,0.6)` : '1px solid transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                    transition: 'all 0.15s',
                    textAlign: 'left',
                  }}
                  onMouseEnter={e => {
                    if (!isSelected) {
                      (e.currentTarget as HTMLButtonElement).style.background = 'rgba(30,40,60,0.4)'
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isSelected) {
                      (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 14 }}>{pet.image}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          color: isSelected ? petColor : '#7a90b0',
                          fontSize: 9,
                          fontWeight: 'bold',
                          fontFamily: 'monospace',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {pet.name}
                      </div>
                      <div
                        style={{
                          color: '#2a3a5a',
                          fontSize: 8,
                          fontFamily: 'monospace',
                        }}
                      >
                        Nv {pet.level}
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      height: 3,
                      background: 'rgba(0,0,0,0.3)',
                      borderRadius: 2,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        background: `linear-gradient(90deg, ${petColor}, ${petColor}80)`,
                        width: `${(pet.stats.hp / pet.stats.maxHp) * 100}%`,
                      }}
                    />
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Pet Details */}
        {selectedPet && (
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
                <span style={{ fontSize: 40 }}>{selectedPet.image}</span>
                <div>
                  <h2
                    style={{
                      color: PET_COLORS[selectedPet.type],
                      fontSize: 18,
                      fontWeight: 'bold',
                      fontFamily: 'monospace',
                      margin: 0,
                      letterSpacing: '0.1em',
                    }}
                  >
                    {selectedPet.name}
                  </h2>
                  <div
                    style={{
                      color: '#4a6a8a',
                      fontSize: 10,
                      fontFamily: 'monospace',
                    }}
                  >
                    {selectedPet.type} • Nível {selectedPet.level}
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
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              {/* Rarity Badge */}
              <div
                style={{
                  background: 'rgba(20,30,60,0.5)',
                  border: `1px solid ${PET_COLORS[selectedPet.type]}40`,
                  borderRadius: 8,
                  padding: 12,
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    color: '#ffd040',
                    fontSize: 11,
                    fontWeight: 'bold',
                    fontFamily: 'monospace',
                  }}
                >
                  {selectedPet.rarity.toUpperCase()}
                </div>
              </div>

              {/* Stats Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: 8,
                }}
              >
                {[
                  { label: 'HP', value: selectedPet.stats.hp, max: selectedPet.stats.maxHp },
                  { label: 'ATK', value: selectedPet.stats.attack, color: '#ff8040' },
                  { label: 'DEF', value: selectedPet.stats.defense, color: '#40a0d0' },
                  { label: 'SPD', value: selectedPet.stats.speed, color: '#40d080' },
                ].map(stat => (
                  <div
                    key={stat.label}
                    style={{
                      background: 'rgba(20,30,60,0.5)',
                      border: '1px solid rgba(80,120,200,0.3)',
                      borderRadius: 6,
                      padding: 8,
                    }}
                  >
                    <div
                      style={{
                        color: '#2a3a5a',
                        fontSize: 8,
                        fontFamily: 'monospace',
                        marginBottom: 2,
                      }}
                    >
                      {stat.label}
                    </div>
                    <div
                      style={{
                        color: stat.color || '#80b8ff',
                        fontSize: 12,
                        fontWeight: 'bold',
                        fontFamily: 'monospace',
                      }}
                    >
                      {Math.round(stat.value)}
                      {stat.max ? `/${stat.max}` : ''}
                    </div>
                  </div>
                ))}
              </div>

              {/* Mood & Loyalty */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 8,
                }}
              >
                <div
                  style={{
                    background: 'rgba(20,30,60,0.5)',
                    border: '1px solid rgba(80,120,200,0.3)',
                    borderRadius: 6,
                    padding: 8,
                  }}
                >
                  <div
                    style={{
                      color: '#2a3a5a',
                      fontSize: 8,
                      fontFamily: 'monospace',
                      marginBottom: 2,
                    }}
                  >
                    HUMOR
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <span style={{ fontSize: 16 }}>{getMoodEmoji(selectedPet.mood)}</span>
                    <span
                      style={{
                        color: getMoodColor(selectedPet.mood),
                        fontSize: 10,
                        fontWeight: 'bold',
                        fontFamily: 'monospace',
                      }}
                    >
                      {selectedPet.mood.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    background: 'rgba(20,30,60,0.5)',
                    border: '1px solid rgba(80,120,200,0.3)',
                    borderRadius: 6,
                    padding: 8,
                  }}
                >
                  <div
                    style={{
                      color: '#2a3a5a',
                      fontSize: 8,
                      fontFamily: 'monospace',
                      marginBottom: 2,
                    }}
                  >
                    FIDELIDADE
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <div style={{ flex: 1, height: 6, background: 'rgba(0,0,0,0.3)', borderRadius: 3, overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          background: 'linear-gradient(90deg, #ff80c0, #ff40a0)',
                          width: `${selectedPet.loyalty}%`,
                        }}
                      />
                    </div>
                    <span style={{ color: '#ff80c0', fontSize: 10, fontWeight: 'bold', fontFamily: 'monospace', width: 30 }}>
                      {selectedPet.loyalty}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div
                style={{
                  display: 'flex',
                  gap: 8,
                }}
              >
                <button
                  onClick={() => onFeedPet?.(selectedPet.id)}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    background: 'rgba(80,120,200,0.2)',
                    border: '1px solid rgba(80,120,200,0.6)',
                    borderRadius: 6,
                    color: '#80b8ff',
                    fontSize: 10,
                    fontWeight: 'bold',
                    fontFamily: 'monospace',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'rgba(80,120,200,0.3)'
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'rgba(80,120,200,0.2)'
                  }}
                >
                  🍖 ALIMENTAR
                </button>
              </div>

              {/* Party Slots */}
              <div>
                <div
                  style={{
                    color: '#2a3a5a',
                    fontSize: 9,
                    fontFamily: 'monospace',
                    fontWeight: 'bold',
                    marginBottom: 6,
                  }}
                >
                  SLOTS DA PARTY
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                  {[0, 1, 2].map(slot => {
                    const petInSlot = pets.partySlots[slot]
                    const isOccupied = petInSlot === selectedPet.id

                    return (
                      <button
                        key={slot}
                        onClick={() => onAddToParty?.(selectedPet.id, slot)}
                        style={{
                          padding: '8px',
                          background: isOccupied ? 'rgba(80,120,200,0.2)' : 'rgba(0,0,0,0.2)',
                          border: isOccupied ? '1px solid rgba(80,120,200,0.6)' : '1px solid rgba(80,120,200,0.2)',
                          borderRadius: 4,
                          color: isOccupied ? '#80b8ff' : '#2a3a5a',
                          fontSize: 9,
                          fontFamily: 'monospace',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(80,120,200,0.15)'
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLButtonElement).style.background = isOccupied
                            ? 'rgba(80,120,200,0.2)'
                            : 'rgba(0,0,0,0.2)'
                        }}
                      >
                        {isOccupied ? '✓' : '+'}Slot {slot + 1}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Skills */}
              <div>
                <div
                  style={{
                    color: '#2a3a5a',
                    fontSize: 9,
                    fontFamily: 'monospace',
                    fontWeight: 'bold',
                    marginBottom: 6,
                  }}
                >
                  HABILIDADES
                </div>
                {selectedPet.skills.map(skill => (
                  <div
                    key={skill.name}
                    style={{
                      background: 'rgba(20,30,60,0.5)',
                      border: '1px solid rgba(80,120,200,0.3)',
                      borderRadius: 4,
                      padding: 6,
                      marginBottom: 4,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <span style={{ fontSize: 12 }}>{skill.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          color: '#80b8ff',
                          fontSize: 8,
                          fontWeight: 'bold',
                          fontFamily: 'monospace',
                        }}
                      >
                        {skill.name}
                      </div>
                      <div
                        style={{
                          color: '#2a3a5a',
                          fontSize: 7,
                          fontFamily: 'monospace',
                        }}
                      >
                        {skill.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default memo(PetPanel)
