import { memo, useState } from 'react'
import type { Player } from '@/lib/game/types'

interface MapData {
  id: string
  name: string
  minLvl: number
  description?: string
}

interface Props {
  isOpen: boolean
  onClose: () => void
  player: Player
  currentMapId: string
  onMapChange: (mapId: string) => void
}

const MAP_LIST: MapData[] = [
  { id: 'city',       name: 'Cidade',      minLvl: 1,  description: 'Local seguro para iniciantes' },
  { id: 'forest',     name: 'Floresta',    minLvl: 1,  description: 'Primeiras aventuras' },
  { id: 'deepforest', name: 'F. Antiga',   minLvl: 10, description: 'Floresta perigosa' },
  { id: 'dungeon',    name: 'Masmorra',    minLvl: 5,  description: 'Calabouço profundo' },
  { id: 'tundra',     name: 'Tundra',      minLvl: 12, description: 'Terras geladas' },
  { id: 'desert',     name: 'Deserto',     minLvl: 8,  description: 'Areias áridas' },
  { id: 'swamp',      name: 'Pântano',     minLvl: 15, description: 'Terras pântanosas' },
  { id: 'volcano',    name: 'Vulcão',      minLvl: 18, description: 'Vulcão ativo' },
  { id: 'abyss',      name: 'Abismo',      minLvl: 22, description: 'Profundezas escuras' },
  { id: 'crystal1',   name: 'Cristal 1',   minLvl: 18, description: 'Caverna de Cristal' },
  { id: 'crystal2',   name: 'Cristal 2',   minLvl: 24, description: 'Cristais radiantes' },
  { id: 'crystal3',   name: 'Cristal 3',   minLvl: 30, description: 'Coração de Cristal' },
  { id: 'haunted1',   name: 'Ruínas 1',    minLvl: 20, description: 'Ruínas Assombradas' },
  { id: 'haunted2',   name: 'Ruínas 2',    minLvl: 28, description: 'Câmaras Antigas' },
  { id: 'haunted3',   name: 'Ruínas 3',    minLvl: 35, description: 'Santuário Esquecido' },
  { id: 'sky1',       name: 'Céu 1',       minLvl: 22, description: 'Reinos do Céu' },
  { id: 'sky2',       name: 'Céu 2',       minLvl: 30, description: 'Ilhas Flutuantes' },
  { id: 'sky3',       name: 'Céu 3',       minLvl: 40, description: 'Trono Celestial' },
  // ─── NOVOS BIOMAS NORMAIS ───
  { id: 'crystgrove1', name: 'Bosque Cristal',  minLvl: 4,  description: 'Floresta bioluminescente (oeste)' },
  { id: 'crystgrove2', name: 'B.Cristal A2',    minLvl: 12, description: 'Câmara cristalina profunda' },
  { id: 'savanna1',    name: 'Savana Dourada',  minLvl: 6,  description: 'Pradaria âmbar do sul' },
  { id: 'savanna2',    name: 'Savana A2',       minLvl: 16, description: 'Savana escorchada vulcânica' },
  { id: 'archipel1',   name: 'Arquipélago',     minLvl: 10, description: 'Ilhas conectadas por pontes' },
  { id: 'archipel2',   name: 'Arquipélago A2',  minLvl: 22, description: 'Ilhas celestes flutuantes' },
  { id: 'vale1',       name: 'Vale Esquecido',  minLvl: 8,  description: 'Canyon de pedra com névoa' },
  { id: 'vale2',       name: 'Vale A2',         minLvl: 20, description: 'Cripta ancestral profunda' },
  // ─── SECRETOS (precisa de chave craftada) ───
  { id: 'stellar1',    name: '✦ F.Estelar 1',   minLvl: 33, description: 'SECRETO · Chave Estelar' },
  { id: 'stellar2',    name: '✦ F.Estelar 2',   minLvl: 41, description: 'Fenda mais profunda' },
  { id: 'stellar3',    name: '✦ F.Estelar 3',   minLvl: 49, description: 'Núcleo cósmico' },
  { id: 'stellar4',    name: '✦ F.Estelar 4',   minLvl: 57, description: 'Vácuo absoluto' },
  { id: 'stellar5',    name: '✦ F.Estelar 5',   minLvl: 65, description: 'Coração estelar' },
  { id: 'stellar6',    name: '✦ F.Estelar 6',   minLvl: 73, description: 'Trono do Vazio' },
  { id: 'eden1',       name: '❀ Jardim 1',      minLvl: 36, description: 'SECRETO · Semente Primordial' },
  { id: 'eden2',       name: '❀ Jardim 2',      minLvl: 44, description: 'Floresta ancestral' },
  { id: 'eden3',       name: '❀ Jardim 3',      minLvl: 52, description: 'Raízes vivas' },
  { id: 'eden4',       name: '❀ Jardim 4',      minLvl: 60, description: 'Coração do bosque' },
  { id: 'eden5',       name: '❀ Jardim 5',      minLvl: 68, description: 'Santuário verde' },
  { id: 'eden6',       name: '❀ Jardim 6',      minLvl: 76, description: 'Árvore da Vida' },
]

function RucoyWorldModal({ isOpen, onClose, player, currentMapId, onMapChange }: Props) {
  const [hoveredMap, setHoveredMap] = useState<string | null>(null)

  if (!isOpen) return null

  const handleMapClick = (mapId: string, minLvl: number) => {
    if (player.level >= minLvl) {
      onMapChange(mapId)
      onClose()
    }
  }

  return (
    <>
      {/* Backdrop semi-transparente */}
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

      {/* Modal - Centralizado */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 50,
          background: 'rgba(4,6,14,0.95)',
          border: '3px solid rgba(42,56,96,0.8)',
          borderRadius: 12,
          boxShadow: '0 0 40px rgba(0,0,0,0.9), inset 0 0 20px rgba(0,0,0,0.5)',
          maxHeight: '85vh',
          maxWidth: '90vw',
          width: 'fit-content',
          display: 'flex',
          flexDirection: 'column',
          backdropFilter: 'blur(8px)',
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
            🗺 MUNDOS
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
              ;(e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 12px rgba(200,80,80,0.5)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(200,80,80,0.6)'
              ;(e.currentTarget as HTMLButtonElement).style.boxShadow = 'none'
            }}
          >
            ✕
          </button>
        </div>

        {/* Content - Grid de Mundos */}
        <div
          style={{
            padding: '16px',
            overflowY: 'auto',
            maxHeight: 'calc(85vh - 80px)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 12,
          }}
        >
          {MAP_LIST.map(mapData => {
            const locked = player.level < mapData.minLvl
            const isActive = currentMapId === mapData.id

            return (
              <div
                key={mapData.id}
                onMouseEnter={() => !locked && setHoveredMap(mapData.id)}
                onMouseLeave={() => setHoveredMap(null)}
                onClick={() => handleMapClick(mapData.id, mapData.minLvl)}
                style={{
                  cursor: locked ? 'not-allowed' : 'pointer',
                  padding: 12,
                  borderRadius: 8,
                  border: isActive
                    ? '2px solid #80b8ff'
                    : locked
                      ? '1px solid rgba(30,40,60,0.3)'
                      : '1px solid rgba(42,56,96,0.5)',
                  background: isActive
                    ? 'rgba(80,120,200,0.2)'
                    : hoveredMap === mapData.id
                      ? 'rgba(40,80,160,0.2)'
                      : locked
                        ? 'rgba(8,10,18,0.4)'
                        : 'rgba(10,14,28,0.6)',
                  boxShadow:
                    isActive
                      ? '0 0 16px rgba(80,120,200,0.4), inset 0 0 8px rgba(80,120,200,0.2)'
                      : hoveredMap === mapData.id
                        ? '0 0 12px rgba(40,80,160,0.3)'
                        : 'inset 0 0 4px rgba(0,0,0,0.3)',
                  transition: 'all 0.2s ease',
                  filter: locked ? 'opacity(0.6)' : 'opacity(1)',
                }}
              >
                {/* Ícone e Nome */}
                <div style={{ marginBottom: 8 }}>
                  <div
                    style={{
                      fontSize: 28,
                      marginBottom: 4,
                      filter: isActive ? 'drop-shadow(0 0 8px #80b8ff)' : 'none',
                    }}
                  >
                    {mapData.id === 'city' && '🏰'}
                    {mapData.id === 'forest' && '🌲'}
                    {mapData.id === 'deepforest' && '🌳'}
                    {mapData.id === 'dungeon' && '🏚'}
                    {mapData.id === 'tundra' && '❄'}
                    {mapData.id === 'desert' && '🏜'}
                    {mapData.id === 'swamp' && '🌿'}
                    {mapData.id === 'volcano' && '🌋'}
                    {mapData.id === 'abyss' && '🌌'}
                    {mapData.id.includes('crystal') && '💎'}
                    {mapData.id.includes('haunted') && '👻'}
                    {mapData.id.includes('sky') && '☁'}
                    {mapData.id.startsWith('crystgrove') && '🔮'}
                    {mapData.id.startsWith('savanna') && '🌾'}
                    {mapData.id.startsWith('archipel') && '🏝'}
                    {mapData.id.startsWith('vale') && '🗿'}
                    {mapData.id.startsWith('stellar') && '✦'}
                    {mapData.id.startsWith('eden') && '❀'}
                  </div>
                  <h3
                    style={{
                      color: isActive ? '#80b8ff' : locked ? '#2a3a5a' : '#a0b8d8',
                      fontSize: 13,
                      fontWeight: 'bold',
                      margin: 0,
                      fontFamily: 'monospace',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {mapData.name}
                  </h3>
                </div>

                {/* Descrição */}
                <p
                  style={{
                    color: '#4a6a8a',
                    fontSize: 10,
                    margin: '4px 0 8px 0',
                    fontFamily: 'monospace',
                    lineHeight: 1.3,
                  }}
                >
                  {mapData.description}
                </p>

                {/* Status */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: 10,
                    fontFamily: 'monospace',
                    borderTop: '1px solid rgba(42,56,96,0.3)',
                    paddingTop: 8,
                  }}
                >
                  <span style={{ color: '#4a6a8a' }}>
                    Nv. {mapData.minLvl}
                  </span>
                  {isActive && (
                    <span style={{ color: '#60d080', fontWeight: 'bold' }}>✓ AQUI</span>
                  )}
                  {locked && (
                    <span style={{ color: '#a04040', fontWeight: 'bold' }}>
                      🔒 BLOQUEADO
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}

export default memo(RucoyWorldModal)
