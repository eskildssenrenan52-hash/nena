import { useState, useEffect, useRef } from 'react'
import type { CharacterClass } from '@/lib/game/types'
import { drawCharacter, SKIN_NAMES, SKIN_COUNT } from '@/lib/game/sprites'
import { playMusic, stopMusic, resumeAudio } from '@/lib/game/audio'
import { isLoggedIn, getCurrentAccount, hasAnonymousProgress, loadAnonymousProgress, registerAccount, loginAccount, logout, migrateAnonymousToAccount, getAllSaveSlots } from '@/lib/game/accountSystem'
import LoginPanel from './LoginPanel'
import RegisterPanel from './RegisterPanel'
import type { UserAccount } from '@/lib/game/accountSystem'

interface Props {
  onStart: (name: string, cls: CharacterClass, skin: number) => void
  onLoad: () => boolean
}

const CLASS_INFO: Record<CharacterClass, { label: string; desc: string; stats: string[]; color: string }> = {
  knight:      { label: 'Cavaleiro',   desc: 'Guerreiro de combate corpo-a-corpo. Alta defesa e HP, mas lento e de curto alcance.',
                 stats: ['HP: +++','MP: +','Ataque: ++','Defesa: +++','Velocidade: +'],
                 color: '#c0c8d8' },
  archer:      { label: 'Arqueiro',    desc: 'Especialista em ataques a distancia. Rapido e com alto critico, mas fragil.',
                 stats: ['HP: ++','MP: ++','Ataque: +++','Defesa: +','Velocidade: +++'],
                 color: '#6a8040' },
  mage:        { label: 'Mago',        desc: 'Mestre das artes arcanas. Poder magico devastador, mas HP e defesa baixos.',
                 stats: ['HP: +','MP: +++','Magia: +++','Defesa: +','Alcance: +++'],
                 color: '#9040d0' },
  necromancer: { label: 'Necromante',  desc: 'Senhor dos mortos. Invoca minions para lutar e drena a vida dos inimigos.',
                 stats: ['HP: ++','MP: +++','Magia: +++','Invocação: +++','Defesa: ++'],
                 color: '#7a30b0' },
  paladin:     { label: 'Paladino',    desc: 'Guardião sagrado. Defesa massiva, cura aliada e ataques sagrados.',
                 stats: ['HP: +++','MP: ++','Ataque: ++','Defesa: +++','Cura: +++'],
                 color: '#f0d878' },
  berserker:   { label: 'Berserker',   desc: 'Furioso em batalha. Dano colossal mas defesa baixa.',
                 stats: ['HP: +++','MP: +','Ataque: +++','Defesa: +','Fúria: +++'],
                 color: '#c83030' },
  assassin:    { label: 'Assassino',   desc: 'Letal nas sombras. Crítico altíssimo, velocidade extrema, frágil.',
                 stats: ['HP: +','MP: ++','Ataque: +++','Crítico: +++','Velocidade: +++'],
                 color: '#404060' },
  druid:       { label: 'Druida',      desc: 'Filho da natureza. Magia natural, regeneração e formas selvagens.',
                 stats: ['HP: ++','MP: +++','Magia: +++','Regen: +++','Natureza: +++'],
                 color: '#3aa84a' },
  monk:        { label: 'Monge',       desc: 'Mestre das artes marciais. Velocidade e combos sem mana.',
                 stats: ['HP: ++','MP: ++','Ataque: ++','Velocidade: +++','Crítico: ++'],
                 color: '#ffd070' },
  samurai:     { label: 'Samurai',     desc: 'Espadachim disciplinado. Cortes precisos e críticos devastadores.',
                 stats: ['HP: ++','MP: +','Ataque: +++','Crítico: +++','Velocidade: ++'],
                 color: '#e0c060' },
  summoner:    { label: 'Invocador',   desc: 'Conjurador de espíritos. Comanda familiares e enxames arcanos.',
                 stats: ['HP: ++','MP: +++','Magia: +++','Invocação: +++','Defesa: +'],
                 color: '#80c0ff' },
  alchemist:   { label: 'Alquimista',  desc: 'Mestre das poções. Frascos explosivos, ácidos e elixires curativos.',
                 stats: ['HP: ++','MP: +++','Magia: ++','Suporte: +++','Versátil: +++'],
                 color: '#a8e060' },
  chronomancer:{ label: 'Cronomante',  desc: 'Manipula o tempo. Acelera-se, atrasa inimigos e abre fendas temporais.',
                 stats: ['HP: +','MP: +++','Magia: +++','Crítico: ++','Alcance: +++'],
                 color: '#80c0ff' },
  beastmaster: { label: 'Domador',     desc: 'Senhor das feras. Invoca companheiros e ruge com poder primordial.',
                 stats: ['HP: ++','MP: ++','Ataque: +++','Crítico: ++','Invocação: +++'],
                 color: '#a08040' },
}

const CLASS_ORDER: CharacterClass[] = [
  'knight','paladin','berserker','samurai','monk','beastmaster','archer','assassin','mage','chronomancer','druid','necromancer','summoner','alchemist',
]

function ClassPreview({ cls, tick, scale = 2, skin = 0 }: { cls: CharacterClass; tick: number; scale?: number; skin?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const size = 32 * scale
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, size, size)
    drawCharacter(ctx, cls, 'down', true, false, tick, 0, 0, scale, skin)
  }, [cls, tick, scale, skin, size])
  return <canvas ref={canvasRef} width={size} height={size} style={{ imageRendering: 'pixelated' }} />
}

export default function TitleScreen({ onStart, onLoad }: Props) {
  const [name, setName] = useState('')
  const [classIdx, setClassIdx] = useState(0)
  const [skin, setSkin] = useState(0)
  const [screen, setScreen] = useState<'title' | 'create' | 'auth' | 'register'>('auth')
  const [tick, setTick] = useState(0)
  const [error, setError] = useState('')
  const [musicStarted, setMusicStarted] = useState(false)
  const [account, setAccount] = useState<UserAccount | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const selectedClass = CLASS_ORDER[classIdx]
  const info = CLASS_INFO[selectedClass]

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 50)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const startMusic = () => {
      if (!musicStarted) { resumeAudio(); playMusic('title'); setMusicStarted(true) }
    }
    window.addEventListener('click', startMusic, { once: true })
    window.addEventListener('keydown', startMusic, { once: true })
    return () => {
      window.removeEventListener('click', startMusic)
      window.removeEventListener('keydown', startMusic)
    }
  }, [musicStarted])

  useEffect(() => () => { stopMusic() }, [])

  // ── Account System Integration ─────────────────────────────────────────────
  
  const handleLogin = (email: string) => {
    setIsLoading(true)
    // Simula delay de autenticação
    setTimeout(() => {
      const acc = loginAccount(email)
      setAccount(acc)
      setIsLoading(false)
      if (!acc) return
      // Verifica se há progresso anônimo para migrar
      if (hasAnonymousProgress()) {
        // Migra progresso anônimo para conta
        migrateAnonymousToAccount(acc.id)
        setError('Seu progresso anterior foi migrado para sua conta!')
      }
      
      // Se há saves, vai para a tela principal
      const slots = getAllSaveSlots(acc.id)
      if (slots.length > 0) {
        setScreen('title')
      } else {
        setScreen('title')
      }
    }, 500)
  }

  const handleRegister = (email: string, username: string) => {
    setIsLoading(true)
    setTimeout(() => {
      const acc = registerAccount(email, username)
      setAccount(acc)
      setIsLoading(false)
      
      // Se há progresso anônimo, migra
      if (hasAnonymousProgress()) {
        migrateAnonymousToAccount(acc.id)
      }
      
      setScreen('title')
    }, 500)
  }

  const handleContinueAsGuest = () => {
    setAccount(null)
    setScreen('title')
  }

  const handleLogout = () => {
    logout()
    setAccount(null)
    setScreen('auth')
  }

  // Background
  const bgCanvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = bgCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = '#060810'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    for (let i = 0; i < 100; i++) {
      const sx = ((i * 137.5 + tick * 0.1) % canvas.width)
      const sy = ((i * 97.3) % canvas.height)
      const b = 0.3 + Math.sin(tick * 0.05 + i) * 0.2
      ctx.fillStyle = `rgba(200,210,255,${b})`
      ctx.fillRect(sx, sy, i % 3 === 0 ? 2 : 1, i % 3 === 0 ? 2 : 1)
    }
  }, [tick])

  const handleStart = () => {
    if (!name.trim()) { setError('Digite um nome.'); return }
    if (name.trim().length < 2) { setError('O nome deve ter pelo menos 2 caracteres.'); return }
    onStart(name.trim(), selectedClass, skin)
  }

  const prevClass = () => { setClassIdx(i => (i - 1 + CLASS_ORDER.length) % CLASS_ORDER.length); setSkin(0) }
  const nextClass = () => { setClassIdx(i => (i + 1) % CLASS_ORDER.length); setSkin(0) }

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: '#060810' }}>
      <canvas ref={bgCanvasRef} width={800} height={400} className="absolute inset-0 w-full h-full" style={{ imageRendering: 'pixelated', objectFit: 'cover' }} />

      {/* Auth Screen */}
      {screen === 'auth' && (
        <LoginPanel
          onLogin={handleLogin}
          onSwitchToRegister={() => setScreen('register')}
          onContinueAsGuest={handleContinueAsGuest}
          isLoading={isLoading}
        />
      )}

      {screen === 'register' && (
        <RegisterPanel
          onRegister={handleRegister}
          onSwitchToLogin={() => setScreen('auth')}
          isLoading={isLoading}
        />
      )}

      {screen !== 'auth' && screen !== 'register' && (
        <div className="absolute inset-0 flex flex-col items-center justify-start pt-8 px-4 overflow-y-auto">
          <div className="text-center mb-6">
            <h1 className="text-6xl font-bold tracking-widest" style={{ fontFamily: 'serif', color: '#f0c040', textShadow: '0 0 30px rgba(240,192,64,0.6), 0 0 60px rgba(240,192,64,0.3)', letterSpacing: '0.15em' }}>RUCOY</h1>
            <h2 className="text-2xl tracking-[0.4em] mt-1" style={{ color: '#c8a060', fontFamily: 'serif' }}>OFFLINE</h2>
            <p className="text-muted-foreground text-sm mt-2">RPG de Fantasia — Aventura Offline</p>
            {account && (
              <p className="text-xs text-muted-foreground mt-2" style={{ color: '#90b0d0' }}>
                Logado como <span style={{ color: '#f0c040' }}>{account.username}</span>
              </p>
            )}
          </div>

          {screen === 'title' ? (
            <div className="flex flex-col items-center gap-3 mt-4">
              <button onClick={() => setScreen('create')} className="w-56 py-3 text-lg font-bold rounded" style={{ background: 'linear-gradient(135deg,rgba(201,149,42,0.2),rgba(201,149,42,0.1))', border: '2px solid #c9952a', color: '#f0c040', fontFamily: 'serif' }}>
                Novo Personagem
              </button>
              <button onClick={() => { const ok = onLoad(); if (!ok) setError('Nenhum save encontrado.') }} className="w-56 py-3 text-lg font-bold rounded" style={{ background: 'linear-gradient(135deg,rgba(42,74,138,0.2),rgba(42,74,138,0.1))', border: '2px solid #2a4a8a', color: '#80a0e0', fontFamily: 'serif' }}>
                Continuar
              </button>
              {account && (
                <button onClick={handleLogout} className="w-56 py-3 text-lg font-bold rounded" style={{ background: 'rgba(200,64,64,0.1)', border: '1px solid #c84040', color: '#ff8080', fontFamily: 'serif' }}>
                  Desconectar
                </button>
              )}
              {!account && (
                <button onClick={() => setScreen('auth')} className="w-56 py-3 text-lg font-bold rounded" style={{ background: 'rgba(100,120,160,0.1)', border: '1px solid #6478a0', color: '#90b0d0', fontFamily: 'serif' }}>
                  Conectar Conta
                </button>
              )}
              {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
              <div className="mt-6 text-muted-foreground/50 text-xs text-center space-y-1">
                <p>WASD ou Setas para mover</p>
                <p>Clique nos inimigos para atacar</p>
              </div>
            </div>
          ) : (
            <div className="rounded-lg p-5 w-full max-w-xl" style={{ background: 'rgba(8,10,18,0.95)', border: '2px solid #2a3860', boxShadow: '0 0 60px rgba(0,0,0,0.9)' }}>
              <h3 className="text-lg font-bold mb-3 text-center" style={{ color: '#f0c040', fontFamily: 'serif' }}>Criar Personagem</h3>

              <div className="mb-3">
                <label className="block text-sm text-muted-foreground mb-1">Nome</label>
                <input type="text" value={name} onChange={(e) => { setName(e.target.value); setError('') }} maxLength={20} placeholder="Digite seu nome..." className="w-full px-3 py-2 rounded text-sm outline-none"
                  style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid #2a3860', color: '#e8d9b5', fontFamily: 'monospace' }}
                  onKeyDown={(e) => e.key === 'Enter' && handleStart()} />
                {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
              </div>

              {/* SLIDE da classe */}
              <div className="mb-3 rounded p-3" style={{ background: 'rgba(0,0,0,0.4)', border: `2px solid ${info.color}` }}>
                <div className="flex items-center justify-between mb-2">
                  <button onClick={prevClass} className="px-3 py-1 rounded font-bold" style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid #2a3860', color: info.color }}>◀</button>
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">Classe {classIdx + 1} / {CLASS_ORDER.length}</div>
                    <div className="text-xl font-bold" style={{ color: info.color, fontFamily: 'serif' }}>{info.label}</div>
                  </div>
                  <button onClick={nextClass} className="px-3 py-1 rounded font-bold" style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid #2a3860', color: info.color }}>▶</button>
                </div>

                <div className="flex justify-center my-2"><ClassPreview cls={selectedClass} tick={tick} scale={3} skin={skin} /></div>

                <p className="text-xs text-foreground/80 mb-2 text-center">{info.desc}</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs text-muted-foreground mb-3 mx-auto" style={{ maxWidth: 320 }}>
                  {info.stats.map((s) => <span key={s}>{s}</span>)}
                </div>

                {/* SKIN selector */}
                <div className="border-t pt-2 mt-1" style={{ borderColor: `${info.color}30` }}>
                  <div className="text-xs text-center text-muted-foreground mb-2">Escolha sua Skin ({skin + 1}/{SKIN_COUNT})</div>
                  <div className="grid grid-cols-5 gap-1">
                    {Array.from({ length: SKIN_COUNT }, (_, s) => (
                      <button key={s} onClick={() => setSkin(s)} className="p-1 rounded flex flex-col items-center gap-1"
                        style={{ background: skin === s ? `${info.color}25` : 'rgba(0,0,0,0.5)', border: `2px solid ${skin === s ? info.color : '#2a3060'}` }}>
                        <ClassPreview cls={selectedClass} tick={tick} scale={1.5} skin={s} />
                        <span className="text-[10px] font-bold leading-tight text-center" style={{ color: skin === s ? info.color : '#8a9ab0' }}>{SKIN_NAMES[selectedClass]?.[s] ?? `Skin ${s + 1}`}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={() => { setScreen('title'); setError('') }} className="flex-1 py-2 rounded text-sm text-muted-foreground" style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid #2a3060' }}>Voltar</button>
                <button onClick={handleStart} className="flex-1 py-2 rounded text-sm font-bold" style={{ background: 'linear-gradient(135deg,rgba(201,149,42,0.25),rgba(201,149,42,0.1))', border: '2px solid #c9952a', color: '#f0c040' }}>Começar Aventura</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
