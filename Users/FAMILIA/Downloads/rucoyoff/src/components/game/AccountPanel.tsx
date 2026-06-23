import { useState } from 'react'
import type { UserAccount, AccountSaveSlot } from '@/lib/game/accountSystem'

interface AccountPanelProps {
  account: UserAccount
  saveSlots: AccountSaveSlot[]
  onLoadSave: (slotId: string) => void
  onDeleteSave: (slotId: string) => void
  onLogout: () => void
  onClose: () => void
}

export default function AccountPanel({
  account,
  saveSlots,
  onLoadSave,
  onDeleteSave,
  onLogout,
  onClose,
}: AccountPanelProps) {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }

  const formatPlaytime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  return (
    <div
      className="absolute inset-0 flex items-center justify-center p-4"
      style={{ zIndex: 100, background: 'rgba(0,0,0,0.8)' }}
      onClick={onClose}
    >
      <div
        className="rounded-lg w-full max-w-2xl max-h-96 overflow-hidden flex flex-col"
        style={{
          background: 'rgba(8,10,18,0.98)',
          border: '2px solid #2a3860',
          boxShadow: '0 0 60px rgba(0,0,0,0.9)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b" style={{ borderColor: '#2a3860' }}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold" style={{ color: '#f0c040', fontFamily: 'serif' }}>
                Minha Conta
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {account.username} • {account.email}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground text-xl"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Save Slots */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {saveSlots.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground text-sm">Nenhum save encontrado</p>
              <p className="text-xs text-muted-foreground/50 mt-1">
                Seus saves aparecerão aqui quando começar a jogar
              </p>
            </div>
          ) : (
            saveSlots.map((slot) => (
              <div
                key={slot.id}
                className="p-3 rounded cursor-pointer transition-all"
                style={{
                  background:
                    selectedSlot === slot.id
                      ? 'rgba(201,149,42,0.15)'
                      : 'rgba(42,56,96,0.2)',
                  border:
                    selectedSlot === slot.id
                      ? '1px solid #c9952a'
                      : '1px solid #2a3860',
                }}
                onClick={() => setSelectedSlot(slot.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-bold text-sm" style={{ color: '#e8d9b5' }}>
                      {slot.playerName} {/* • Nível {slot.level} */}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      <span>{slot.characterClass}</span>
                      <span> • Nível {slot.level}</span>
                      <span> • {slot.gold.toLocaleString()} Ouro</span>
                      <span> • {formatPlaytime(slot.playtime)}</span>
                    </div>
                    <div className="text-xs text-muted-foreground/50 mt-1">
                      Salvo em: {formatDate(slot.lastPlayed)}
                    </div>
                  </div>

                  {confirmDelete === slot.id ? (
                    <div className="flex gap-1 ml-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onDeleteSave(slot.id)
                          setConfirmDelete(null)
                          setSelectedSlot(null)
                        }}
                        className="px-2 py-1 text-xs rounded font-bold"
                        style={{
                          background: 'rgba(200,64,64,0.3)',
                          border: '1px solid #c84040',
                          color: '#ff8080',
                        }}
                      >
                        Sim
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setConfirmDelete(null)
                        }}
                        className="px-2 py-1 text-xs rounded font-bold"
                        style={{
                          background: 'rgba(100,120,160,0.2)',
                          border: '1px solid #6478a0',
                          color: '#90b0d0',
                        }}
                      >
                        Não
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setConfirmDelete(slot.id)
                      }}
                      className="px-2 py-1 text-xs rounded font-bold ml-2"
                      style={{
                        background: 'rgba(0,0,0,0.4)',
                        border: '1px solid #2a3860',
                        color: '#8a9ab0',
                      }}
                      title="Deletar save"
                    >
                      🗑
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex gap-2" style={{ borderColor: '#2a3860' }}>
          {selectedSlot && (
            <button
              onClick={() => {
                onLoadSave(selectedSlot)
                onClose()
              }}
              className="flex-1 py-2 rounded font-bold text-sm transition-all"
              style={{
                background: 'linear-gradient(135deg,rgba(201,149,42,0.25),rgba(201,149,42,0.1))',
                border: '2px solid #c9952a',
                color: '#f0c040',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg,rgba(201,149,42,0.4),rgba(201,149,42,0.2))'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg,rgba(201,149,42,0.25),rgba(201,149,42,0.1))'
              }}
            >
              Carregar Save
            </button>
          )}

          <button
            onClick={() => {
              onLogout()
              onClose()
            }}
            className="flex-1 py-2 rounded font-bold text-sm transition-all"
            style={{
              background: 'rgba(200,64,64,0.1)',
              border: '1px solid #c84040',
              color: '#ff8080',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(200,64,64,0.2)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(200,64,64,0.1)'
            }}
          >
            Desconectar
          </button>

          <button
            onClick={onClose}
            className="flex-1 py-2 rounded font-bold text-sm"
            style={{
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid #2a3860',
              color: '#8a9ab0',
            }}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}
