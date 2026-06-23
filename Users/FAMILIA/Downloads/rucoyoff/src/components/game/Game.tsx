
import { useEffect, useRef, useCallback, useState } from 'react'
import type { GameState, CharacterClass, GameScreen, EditorState, GameMap } from '@/lib/game/types'
import {
  movePlayer,
  updateMonsterAI,
  updateMinions,
  updateProjectiles,
  updateAreaEffects,
  tickUpdate,
  tryAutoAttack,
  tryAttackMonster,
  castAbility,
  switchClass,
  useItem,
  changeMap,
  saveGame,
  loadGame,
} from '@/lib/game/engine'
import { resumeAudio, playMusic, stopMusic, playSfx } from '@/lib/game/audio'
import { createCombo } from '@/lib/game/combo'
import { createPlayer, generateMap } from '@/lib/game/data'
import { isLoggedIn, getCurrentAccount, getAllSaveSlots, getSaveSlot, startAutoSave, stopAutoSave, logout, migrateAnonymousToAccount, loadAnonymousProgress } from '@/lib/game/accountSystem'
import type { UserAccount, AccountSaveSlot } from '@/lib/game/accountSystem'
import GameCanvas from './GameCanvas'
import GameHUD from './GameHUD'
import InventoryPanel from './InventoryPanel'
import TitleScreen from './TitleScreen'
import WorldEditor from './WorldEditor'
import AbilityBar from './AbilityBar'
import ClassSwitcher from './ClassSwitcher'
import ComboHUD from './ComboHUD'
import StatusEffectsHUD from './StatusEffectsHUD'
import MiniMap from './MiniMap'
import DevPanel from './DevPanel'
import QuestPanel from './QuestPanel'
import AchievementsPanel from './AchievementsPanel'
import ReputationPanel from './ReputationPanel'
import MasteryPanel from './MasteryPanel'
import PetPanel from './PetPanel'
import AchievementsPanel2 from './AchievementsPanel2'
import BossBar from './BossBar'
import PassiveTree from './PassiveTree'
import CraftingPanel, { CRAFT_RECIPES, type CraftRecipe } from './CraftingPanel'
import StatsPanel from './StatsPanel'
import HelpPanel from './HelpPanel'
import RucoyModalBar from './RucoyModalBar'
import RucoyWorldModal from './RucoyWorldModal'
import AccountPanel from './AccountPanel'
import PrestigePanel from './PrestigePanel'
import SpecPanel from './SpecPanel'

// ─── Estado inicial do editor ──────────────────────────────────────────────

function buildInitialEditorState(): EditorState {
  return {
    isOpen: false,
    activeTool: 'paint',
    selectedTile: 'grass',
    selectedMonsterType: 'slime',
    selectedMonsterLevel: 1,
    brushSize: 1,
    showGrid: true,
    showCollisions: false,
    showMonsters: true,
    showSpawns: true,
    mapName: '',
    history: [],
    historyIndex: -1,
    selectionStart: null,
    selectionEnd: null,
  }
}

function buildInitialState(playerName: string, cls: CharacterClass, mapId = 'city', skin = 0): GameState {
  const map = generateMap(mapId)
  const spawn = map.spawnPoints[0] || { x: 160, y: 160 }
  const player = createPlayer(playerName, cls)
  player.position = { ...spawn }
  player.skin = skin
  const canvasW = 800, canvasH = 540
  const mapW = map.width * 32, mapH = map.height * 32
  const camX = Math.max(0, Math.min(Math.max(0, mapW - canvasW), spawn.x - canvasW / 2 + 16))
  const camY = Math.max(0, Math.min(Math.max(0, mapH - canvasH), spawn.y - canvasH / 2 + 16))
  return {
    screen: 'playing',
    player,
    currentMap: map,
    camera: { x: camX, y: camY },
    tick: 0,
    damageNumbers: [],
    particles: [],
    minions: [],
    projectiles: [],
    areaEffects: [],
    chatMessages: [
      { id: 'start', text: 'Bem-vindo ao Rucoy Offline! Use WASD para mover.', type: 'system', timestamp: Date.now() },
      { id: 'tip', text: 'Aproxime-se de inimigos para atacar automaticamente.', type: 'info', timestamp: Date.now() },
      { id: 'editor_tip', text: 'Pressione F2 ou clique em EDITOR para abrir o Editor de Mundo.', type: 'info', timestamp: Date.now() },
    ],
    notifications: [],
    selectedItem: null,
    hoveredMonster: null,
    mousePos: { x: 0, y: 0 },
    isPaused: false,
    editorOpen: false,
    editorState: buildInitialEditorState(),
  }
}

export default function Game() {
  const [gameState, setGameState] = useState<GameState>({
    screen: 'title',
    player: null,
    currentMap: null,
    camera: { x: 0, y: 0 },
    tick: 0,
    damageNumbers: [],
    particles: [],
    minions: [],
    projectiles: [],
    areaEffects: [],
    chatMessages: [],
    notifications: [],
    selectedItem: null,
    hoveredMonster: null,
    mousePos: { x: 0, y: 0 },
    isPaused: false,
    editorOpen: false,
    editorState: buildInitialEditorState(),
  })

  const [showInventory, setShowInventory] = useState(false)
  const [showRucoyWorld, setShowRucoyWorld] = useState(false)
  const [showDevPanel, setShowDevPanel] = useState(false)
  const [teleportMode, setTeleportMode] = useState(false)
  const [showQuestPanel, setShowQuestPanel] = useState(false)
  const [showAchPanel, setShowAchPanel] = useState(false)
  const [showPassiveTree, setShowPassiveTree] = useState(false)
  const [showCrafting, setShowCrafting] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [showReputation, setShowReputation] = useState(false)
  const [showMastery, setShowMastery] = useState(false)
  const [showPets, setShowPets] = useState(false)
  const [showAch2, setShowAch2] = useState(false)
  const [showAccount, setShowAccount] = useState(false)
  const [showPrestige, setShowPrestige] = useState(false)
  const [showSpec, setShowSpec] = useState(false)
  const [account, setAccount] = useState<UserAccount | null>(isLoggedIn() ? getCurrentAccount() : null)
  const [saveSlots, setSaveSlots] = useState<AccountSaveSlot[]>(account ? getAllSaveSlots(account.id) : [])
  const keysRef = useRef<Set<string>>(new Set())
  const rafRef = useRef<number>(0)
  const stateRef = useRef(gameState)
  stateRef.current = gameState

  // ── Game loop ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (gameState.screen !== 'playing') return

    // Start auto-save for logged-in users
    if (account && gameState.player) {
      startAutoSave(
        () => ({
          playerName: gameState.player!.name,
          level: gameState.player!.level,
          gold: gameState.player!.gold,
          playtime: Math.floor(gameState.tick / 60), // Convert ticks to seconds (assuming 60 ticks/sec)
          saveData: JSON.stringify(gameState),
        }),
        false, // not guest
        30000, // auto-save every 30 seconds
      )
    }

    return () => {
      stopAutoSave()
    }
  }, [account, gameState.screen, gameState.player?.name])

  useEffect(() => {
    if (gameState.screen !== 'playing') return

    let lastTime = performance.now()
    let hidden = typeof document !== 'undefined' && document.hidden
    const onVis = () => { hidden = document.hidden; lastTime = performance.now() }
    document.addEventListener('visibilitychange', onVis)

    const loop = (now: number) => {
      const dt = now - lastTime
      lastTime = now

      // Skip frames when tab oculta: economiza CPU/bateria sem perder estado.
      if (!hidden && dt < 100) {
        setGameState((prev) => {
          if (prev.screen !== 'playing' || prev.isPaused || prev.editorOpen) return prev
          let s = tickUpdate(prev)
          s = movePlayer(s, keysRef.current)
          s = updateMonsterAI(s)
          s = updateMinions(s)
          s = updateProjectiles(s)
          s = updateAreaEffects(s)
          s = tryAutoAttack(s)

          // Portal transition
          if (s._portalTarget) {
            const target = s._portalTarget
            const consumeKey = (s as any)._portalConsumeKey as string | null
            let changed = changeMap(s, target)
            if (consumeKey && changed.player) {
              // Remove 1 stack of the key item (consumes it)
              let removed = false
              const inv = changed.player.inventory.map(it => {
                if (!removed && it?.id === consumeKey) {
                  removed = true
                  const q = (it.quantity ?? 1) - 1
                  return q <= 0 ? null : { ...it, quantity: q }
                }
                return it
              })
              changed = {
                ...changed,
                player: { ...changed.player, inventory: inv },
                notifications: [
                  ...changed.notifications,
                  { id: `portal_${Date.now()}`, text: `Chave consumida — portal aberto!`, type: 'achievement' as const, timer: 180 },
                ],
              }
            }
            return { ...changed, _portalTarget: null, _portalCooldown: 90, _portalConsumeKey: null } as GameState
          }
          if ((s._portalCooldown ?? 0) > 0) {
            s = { ...s, _portalCooldown: (s._portalCooldown ?? 0) - 1 }
          }

          if (s.player && s.player.hp <= 0) {
            return {
              ...s,
              screen: 'dead' as GameScreen,
              notifications: [
                ...s.notifications,
                { id: `dead_${Date.now()}`, text: 'Voce foi derrotado!', type: 'level', timer: 300 },
              ],
            }
          }

          return s
        })
      }

      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [gameState.screen])

  // ── Keyboard input ────────────────────────────────────────────────────────
  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.code)

      // F2 — toggle editor
      if (e.code === 'F2') {
        e.preventDefault()
        setGameState((prev) => {
          if (!prev.currentMap || prev.screen !== 'playing') return prev
          const isOpen = !prev.editorOpen
          return {
            ...prev,
            editorOpen: isOpen,
            isPaused: isOpen,
            chatMessages: [
              ...prev.chatMessages,
              {
                id: `ed_${Date.now()}`,
                text: isOpen
                  ? 'Editor de Mundo aberto. Jogo pausado.'
                  : 'Editor fechado. Alteracoes aplicadas ao mapa.',
                type: 'system',
                timestamp: Date.now(),
              },
            ],
          }
        })
        return
      }

      if (e.code === 'KeyI' && !stateRef.current.editorOpen) {
        setShowInventory((v) => !v)
        e.preventDefault()
      }
      if (e.code === 'KeyM' && !stateRef.current.editorOpen) {
        setShowRucoyWorld((v) => !v)
        e.preventDefault()
      }
      if (e.code === 'KeyQ' && !stateRef.current.editorOpen) {
        setShowQuestPanel((v) => !v)
        setShowAchPanel(false)
        e.preventDefault()
      }
      if (e.code === 'KeyA' && !stateRef.current.editorOpen) {
        setShowAchPanel((v) => !v)
        setShowQuestPanel(false)
        e.preventDefault()
      }
      if (e.code === 'KeyP' && !stateRef.current.editorOpen) {
        setShowPassiveTree((v) => !v)
        e.preventDefault()
      }
      if (e.code === 'KeyC' && !stateRef.current.editorOpen) {
        setShowCrafting((v) => !v)
        e.preventDefault()
      }
      if (e.code === 'KeyS' && !e.ctrlKey && !stateRef.current.editorOpen) {
        setShowStats((v) => !v)
        e.preventDefault()
      }
      if (e.code === 'KeyH' && !stateRef.current.editorOpen) {
        setShowHelp((v) => !v)
        e.preventDefault()
      }
      // New system panels - R for Reputation, O for Mastery (O like "dominio"), E for Pets
      if (e.code === 'KeyR' && !e.ctrlKey && !stateRef.current.editorOpen) {
        setShowReputation((v) => !v)
        e.preventDefault()
      }
      if (e.code === 'KeyO' && !stateRef.current.editorOpen) {
        setShowMastery((v) => !v)
        e.preventDefault()
      }
      if (e.code === 'KeyE' && !stateRef.current.editorOpen) {
        setShowPets((v) => !v)
        e.preventDefault()
      }
      if (e.code === 'Key2' && !stateRef.current.editorOpen) {
        setShowAch2((v) => !v)
        e.preventDefault()
      }
      // Account panel hotkey (U for "User")
      if (e.code === 'KeyU' && !e.ctrlKey && !stateRef.current.editorOpen) {
        setShowAccount((v) => !v)
        e.preventDefault()
      }
      // Ability hotkeys 1-4
      if (!stateRef.current.editorOpen && !stateRef.current.isPaused) {
        const slotMatch = /^Digit([1-4])$/.exec(e.code)
        if (slotMatch) {
          const slot = parseInt(slotMatch[1], 10) - 1
          setGameState((prev) => castAbility(prev, slot))
          e.preventDefault()
          return
        }
      }
      if (e.code === 'Escape') {
        setShowInventory(false)
        setShowRucoyWorld(false)
        setShowQuestPanel(false)
        setShowAchPanel(false)
        setShowPassiveTree(false)
        setShowCrafting(false)
        setShowStats(false)
        setShowHelp(false)
        setShowReputation(false)
        setShowMastery(false)
        setShowPets(false)
        setShowAch2(false)
        setShowAccount(false)
        setTeleportMode(false)
      }
      if (e.code === 'F9') {
        setShowDevPanel((v) => !v)
        setGameState((prev) => ({ ...prev, _devMode: !prev._devMode }))
        e.preventDefault()
      }
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)) {
        if (!stateRef.current.editorOpen) e.preventDefault()
      }
    }
    const onUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.code)
    }

    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup', onUp)
    return () => {
      window.removeEventListener('keydown', onDown)
      window.removeEventListener('keyup', onUp)
    }
  }, [])

  // ── Handlers do jogo ──────────────────────────────────────────────────────
  const handleStart = useCallback((name: string, cls: CharacterClass, skin: number = 0) => {
    setGameState(buildInitialState(name, cls, 'city', skin))
    setShowInventory(false)
  }, [])

  const handleLoad = useCallback((): boolean => {
    const save = loadGame()
    if (!save) return false
    const map = generateMap(save.mapId)
    setGameState({
      screen: 'playing',
      player: save.player,
      currentMap: map,
      camera: { x: 0, y: 0 },
      tick: 0,
      damageNumbers: [],
      particles: [],
      minions: [],
      projectiles: [],
      areaEffects: [],
      chatMessages: [
        { id: 'load', text: 'Jogo carregado! Bem-vindo de volta.', type: 'system', timestamp: Date.now() },
        { id: 'editor_tip2', text: 'Pressione F2 para abrir o Editor de Mundo.', type: 'info', timestamp: Date.now() },
      ],
      notifications: [],
      selectedItem: null,
      hoveredMonster: null,
      mousePos: { x: 0, y: 0 },
      isPaused: false,
      editorOpen: false,
      editorState: buildInitialEditorState(),
    })
    setShowInventory(false)
    return true
  }, [])

  const handleCanvasClick = useCallback((worldX: number, worldY: number) => {
    if (teleportMode) {
      setGameState((prev) => {
        if (!prev.player) return prev
        return {
          ...prev,
          player: { ...prev.player, position: { x: worldX - 16, y: worldY - 16 } },
        }
      })
      return
    }
    setGameState((prev) => {
      if (!prev.currentMap || prev.editorOpen) return prev
      const monster = prev.currentMap.monsters.find((m) => {
        if (m.isDead) return false
        return worldX >= m.position.x - 8 && worldX <= m.position.x + 40 &&
               worldY >= m.position.y - 8 && worldY <= m.position.y + 40
      })
      if (monster) return tryAttackMonster(prev, monster.id)
      return prev
    })
  }, [])

  const handleMapChange = useCallback((mapId: string) => {
    setGameState((prev) => {
      if (!prev.player) return prev
      if (prev.currentMap?.id === mapId) return prev
      const newState = changeMap(prev, mapId)
      return {
        ...newState,
        chatMessages: [
          ...prev.chatMessages,
          { id: `map_${Date.now()}`, text: `Viajando para: ${newState.currentMap?.name}...`, type: 'system', timestamp: Date.now() },
        ],
        tick: 0,
        editorState: buildInitialEditorState(),
      }
    })
  }, [])

  const handleSave = useCallback(() => {
    const state = stateRef.current
    saveGame(state)
    setGameState((prev) => ({
      ...prev,
      chatMessages: [
        ...prev.chatMessages,
        { id: `save_${Date.now()}`, text: 'Jogo salvo com sucesso!', type: 'system', timestamp: Date.now() },
      ],
      notifications: [
        ...prev.notifications,
        { id: `savenot_${Date.now()}`, text: 'Jogo Salvo!', type: 'item', timer: 120 },
      ],
    }))
  }, [])

  const handleUseItem = useCallback((slotIdx: number) => {
    setGameState((prev) => useItem(prev, slotIdx))
  }, [])

  const handleCraft = useCallback((recipe: CraftRecipe) => {
    setGameState((prev) => {
      if (!prev.player) return prev
      let inv = [...prev.player.inventory]
      for (const mat of recipe.materials) {
        let toRemove = mat.count
        inv = inv.map(item => {
          if (!item || item.id !== mat.id || toRemove <= 0) return item
          const qty = item.quantity ?? 1
          if (qty <= toRemove) { toRemove -= qty; return null }
          return { ...item, quantity: qty - mat.count }
        })
      }
      const newGold = prev.player.gold - recipe.goldCost
      const emptySlot = inv.findIndex(s => s === null)
      if (emptySlot >= 0) inv[emptySlot] = { ...recipe.result, quantity: 1 }
      else inv.push({ ...recipe.result, quantity: 1 })
      return {
        ...prev,
        player: { ...prev.player, gold: newGold, inventory: inv },
        notifications: [
          ...prev.notifications,
          { id: `craft_${Date.now()}`, text: `Criado: ${recipe.name}!`, type: 'item' as const, timer: 180 },
        ],
      }
    })
  }, [])

  const handlePlayerUpdate = useCallback((player: GameState['player']) => {
    if (!player) return
    setGameState((prev) => ({ ...prev, player }))
  }, [])

  const handleRespawn = useCallback(() => {
    setGameState((prev) => {
      if (!prev.player) return prev
      const newState = changeMap(prev, 'city')
      const canvasW = 800, canvasH = 540
      const spawn = newState.currentMap?.spawnPoints[0] || { x: 4000, y: 4000 }
      return {
        ...newState,
        screen: 'playing' as const,
        player: {
          ...newState.player!,
          hp: newState.player!.stats.maxHp, // Full HP on respawn
          mp: newState.player!.stats.maxMp,
          _deaths: (prev.player._deaths ?? 0) + 1,
        },
        camera: { x: spawn.x - canvasW / 2 + 16, y: spawn.y - canvasH / 2 + 16 },
        damageNumbers: [],
        particles: [],
        chatMessages: [
          { id: `resp_${Date.now()}`, text: 'Voce renasceu na Cidade de Valor com HP cheio.', type: 'system', timestamp: Date.now() },
        ],
        notifications: [{ id: `resp_not_${Date.now()}`, text: 'Renascido!', type: 'achievement', timer: 180 }],
        tick: 0,
        editorOpen: false,
        editorState: buildInitialEditorState(),
        _killStreak: 0,
        _killStreakTimer: 0,
      }
    })
  }, [])

  // ── Handlers do editor ────────────────────────────────────────────────────

  const handleEditorMapChange = useCallback((updatedMap: GameMap) => {
    setGameState((prev) => ({ ...prev, currentMap: updatedMap }))
  }, [])

  const handleEditorStateChange = useCallback((newEditorState: EditorState) => {
    setGameState((prev) => ({ ...prev, editorState: newEditorState }))
  }, [])

  const handleEditorClose = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      editorOpen: false,
      isPaused: false,
      chatMessages: [
        ...prev.chatMessages,
        {
          id: `ed_done_${Date.now()}`,
          text: 'Editor fechado. Alteracoes aplicadas ao mapa atual.',
          type: 'system',
          timestamp: Date.now(),
        },
      ],
    }))
  }, [])

  const openEditor = useCallback(() => {
    setGameState((prev) => {
      if (!prev.currentMap || prev.screen !== 'playing') return prev
      return {
        ...prev,
        editorOpen: true,
        isPaused: true,
        chatMessages: [
          ...prev.chatMessages,
          { id: `ed_open_${Date.now()}`, text: 'Editor de Mundo aberto. Jogo pausado.', type: 'system', timestamp: Date.now() },
        ],
      }
    })
  }, [])

  // ── Render ────────────────────────────────────────────────────────────────
  if (gameState.screen === 'title') {
    return (
      <div className="w-full h-full relative">
        <TitleScreen onStart={handleStart} onLoad={handleLoad} />
      </div>
    )
  }

  const isDead = gameState.screen === 'dead'

  return (
    <div className="w-full h-full relative overflow-hidden" style={{ background: '#080a0e' }}>

      {/* Editor de Mundo — ocupa a tela inteira quando aberto */}
      {gameState.editorOpen && gameState.currentMap && (
        <WorldEditor
          map={gameState.currentMap}
          editorState={gameState.editorState}
          onEditorStateChange={handleEditorStateChange}
          onMapChange={handleEditorMapChange}
          onClose={handleEditorClose}
        />
      )}

      {/* Canvas do jogo — visível apenas quando editor está fechado */}
      {!gameState.editorOpen && gameState.player && gameState.currentMap && (
        <GameCanvas
          gameState={gameState}
          onCanvasClick={handleCanvasClick}
        />
      )}

      {/* HUD */}
      {!gameState.editorOpen && gameState.player && gameState.currentMap && !isDead && (
        <GameHUD
          player={gameState.player}
          currentMap={gameState.currentMap}
          notifications={gameState.notifications}
          chatMessages={gameState.chatMessages}
          onOpenInventory={() => setShowInventory((v) => !v)}
          onMapChange={handleMapChange}
          onSave={handleSave}
          onOpenQuests={() => { setShowQuestPanel(v => !v); setShowAchPanel(false) }}
          onOpenAchievements={() => { setShowAchPanel(v => !v); setShowQuestPanel(false) }}
          onOpenPassives={() => setShowPassiveTree(v => !v)}
          onOpenCrafting={() => setShowCrafting(v => !v)}
          onOpenStats={() => setShowStats(v => !v)}
          onOpenHelp={() => setShowHelp(v => !v)}
          timeOfDay={gameState._timeOfDay}
          weather={gameState._weather}
          killStreak={gameState._killStreak}
          devMode={gameState._devMode}
        />
      )}

      {/* Barra de modais Rucoy (topo direito) */}
      {!gameState.editorOpen && gameState.player && gameState.currentMap && !isDead && (
        <RucoyModalBar
          isMapOpen={showRucoyWorld}
          isInventoryOpen={showInventory}
          isStatsOpen={showStats}
          isQuestOpen={showQuestPanel}
          isAchievementsOpen={showAchPanel}
          isPassiveOpen={showPassiveTree}
          isCraftingOpen={showCrafting}
          isHelpOpen={showHelp}
          isPrestigeOpen={showPrestige}
          isSpecOpen={showSpec}
          onToggleMap={() => setShowRucoyWorld(v => !v)}
          onToggleInventory={() => setShowInventory(v => !v)}
          onToggleStats={() => setShowStats(v => !v)}
          onToggleQuest={() => { setShowQuestPanel(v => !v); setShowAchPanel(false) }}
          onToggleAchievements={() => { setShowAchPanel(v => !v); setShowQuestPanel(false) }}
          onTogglePassive={() => setShowPassiveTree(v => !v)}
          onToggleCrafting={() => setShowCrafting(v => !v)}
          onToggleHelp={() => setShowHelp(v => !v)}
          onTogglePrestige={() => setShowPrestige(v => !v)}
          onToggleSpec={() => setShowSpec(v => !v)}
          onSave={handleSave}
        />
      )}

      {/* Modal do Mundo estilo Rucoy */}
      {showRucoyWorld && !gameState.editorOpen && gameState.player && (
        <RucoyWorldModal
          isOpen={showRucoyWorld}
          onClose={() => setShowRucoyWorld(false)}
          player={gameState.player}
          currentMapId={gameState.currentMap?.id || 'city'}
          onMapChange={handleMapChange}
        />
      )}

      {/* Barra de habilidades (bottom-center) */}
      {!gameState.editorOpen && gameState.player && gameState.currentMap && !isDead && (
        <AbilityBar
          player={gameState.player}
          onCast={(slot) => setGameState((prev) => castAbility(prev, slot))}
        />
      )}

      {/* Combo HUD */}
      {!gameState.editorOpen && gameState.player && gameState.currentMap && !isDead && (
        <ComboHUD combo={gameState._combo} tick={gameState.tick} />
      )}

      {/* Player Status Effects */}
      {!gameState.editorOpen && gameState.player && gameState.currentMap && !isDead && (
        <div className="absolute top-2 left-60" style={{ zIndex: 11 }}>
          <StatusEffectsHUD effects={gameState.player.statusEffects} />
        </div>
      )}

      {/* Mini Map */}
      {!gameState.editorOpen && gameState.player && gameState.currentMap && gameState.screen === 'playing' && !isDead && (
        <MiniMap
          gameState={gameState}
        />
      )}

      {/* Troca de classe — abaixo do toolbar lateral, sem sobrepor */}
      {!gameState.editorOpen && gameState.player && gameState.currentMap && !isDead && (
        <div style={{ position: 'absolute', top: 124, right: 8, zIndex: 60 }}>
          <ClassSwitcher
            player={gameState.player}
            onSwitch={(cls) => setGameState((prev) => switchClass(prev, cls))}
          />
        </div>
      )}

      {/* Boss bar + kill streak */}
      {gameState.screen === 'playing' && !gameState.editorOpen && (
        <BossBar gameState={gameState} />
      )}

      {/* Quest Panel */}
      {showQuestPanel && !gameState.editorOpen && (
        <QuestPanel gameState={gameState} onClose={() => setShowQuestPanel(false)} />
      )}

      {/* Achievements Panel */}
      {showAchPanel && !gameState.editorOpen && (
        <AchievementsPanel gameState={gameState} onClose={() => setShowAchPanel(false)} />
      )}

      {/* Passive Tree */}
      {showPassiveTree && !gameState.editorOpen && gameState.player && (
        <PassiveTree player={gameState.player} onClose={() => setShowPassiveTree(false)} />
      )}

      {/* Help Panel */}
      {showHelp && (
        <HelpPanel onClose={() => setShowHelp(false)} />
      )}

      {/* Reputation Panel */}
      {showReputation && !gameState.editorOpen && gameState.player && gameState.player.reputation && (
        <ReputationPanel reputation={gameState.player.reputation} onClose={() => setShowReputation(false)} />
      )}

      {/* Mastery Panel */}
      {showMastery && !gameState.editorOpen && gameState.player && gameState.player.masteries && (
        <MasteryPanel masteries={gameState.player.masteries} onClose={() => setShowMastery(false)} />
      )}

      {/* Pet Panel */}
      {showPets && !gameState.editorOpen && gameState.player && gameState.player.pets && (
        <PetPanel pets={gameState.player.pets} onClose={() => setShowPets(false)} />
      )}

      {/* Achievements Panel v2 */}
      {showAch2 && !gameState.editorOpen && gameState.player && gameState.player.achievements && (
        <AchievementsPanel2 achievements={gameState.player.achievements} onClose={() => setShowAch2(false)} />
      )}

      {/* Account Panel */}
      {showAccount && !gameState.editorOpen && account && (
        <AccountPanel
          account={account}
          saveSlots={saveSlots}
          onLoadSave={(slotId) => {
            const slot = getSaveSlot(account.id, slotId)
            if (slot) {
              try {
                const loadedState = JSON.parse(slot.saveData) as GameState
                setGameState(loadedState)
              } catch (e) {
                console.error('Failed to load save:', e)
              }
            }
            setShowAccount(false)
          }}
          onDeleteSave={(slotId) => {
            setSaveSlots(saveSlots.filter(s => s.id !== slotId))
            setShowAccount(false)
          }}
          onLogout={() => {
            logout()
            setAccount(null)
            setSaveSlots([])
            setGameState((prev) => ({ ...prev, screen: 'title' as const }))
            setShowAccount(false)
          }}
          onClose={() => setShowAccount(false)}
        />
      )}

      {/* Stats Panel */}
      {showStats && !gameState.editorOpen && gameState.player && (
        <StatsPanel player={gameState.player} onClose={() => setShowStats(false)} />
      )}

      {/* Crafting Panel */}
      {showCrafting && !gameState.editorOpen && gameState.player && (
        <CraftingPanel
          player={gameState.player}
          onClose={() => setShowCrafting(false)}
          onCraft={handleCraft}
        />
      )}

      {/* Prestige Panel */}
      {showPrestige && !gameState.editorOpen && gameState.player && (
        <PrestigePanel
          player={gameState.player}
          onClose={() => setShowPrestige(false)}
          onPlayerUpdate={(p) => setGameState((prev) => ({ ...prev, player: p }))}
        />
      )}

      {/* Spec Panel */}
      {showSpec && !gameState.editorOpen && gameState.player && (
        <SpecPanel
          player={gameState.player}
          onClose={() => setShowSpec(false)}
          onPlayerUpdate={(p) => setGameState((prev) => ({ ...prev, player: p }))}
        />
      )}
      {showDevPanel && gameState.screen === 'playing' && gameState.player && (
        <DevPanel
          gameState={gameState}
          onToggleDevMode={() => { setShowDevPanel(false); setGameState((p) => ({ ...p, _devMode: false })) }}
          onTeleportClick={() => setTeleportMode((v) => !v)}
          onGiveMoney={() => setGameState((p) => p.player ? { ...p, player: { ...p.player, gold: p.player.gold + 10000 } } : p)}
          onGiveXP={() => setGameState((p) => {
            if (!p.player) return p
            const newXP = p.player.classProgress[p.player.class].xp + p.player.classProgress[p.player.class].xpToNext * 5
            return { ...p, player: { ...p.player, classProgress: { ...p.player.classProgress, [p.player.class]: { ...p.player.classProgress[p.player.class], xp: newXP } } } }
          })}
          onGiveItem={() => setGameState((p) => {
            if (!p.player) return p
            const items = p.player.inventory
            const newItem = { id: 'arcane_staff', name: 'Bastao Arcano', type: 'weapon' as const, rarity: 'legendary' as const, icon: '⚡', description: 'Poderoso', stats: { attack: 200, magicPower: 300 }, value: 5000, quantity: 1 }
            return { ...p, player: { ...p.player, inventory: [...items, newItem] } }
          })}
          onKillAll={() => setGameState((p) => {
            if (!p.currentMap) return p
            return { ...p, currentMap: { ...p.currentMap, monsters: p.currentMap.monsters.map(m => ({ ...m, isDead: true, hp: 0, deathTimer: 0 })) } }
          })}
          onSetHP={(pct) => setGameState((p) => p.player ? { ...p, player: { ...p.player, hp: Math.max(1, Math.round(p.player.stats.maxHp * pct)) } } : p)}
          onSetMP={(pct) => setGameState((p) => p.player ? { ...p, player: { ...p.player, mp: Math.round(p.player.stats.maxMp * pct) } } : p)}
          onChangeMap={(mapId) => setGameState((p) => ({ ...changeMap(p, mapId), screen: 'playing' as const }))}
        />
      )}

      {/* (botões EDITOR/DEV/SHOP foram movidos para TopRightToolbar acima) */}

      {/* Inventário */}
      {showInventory && !gameState.editorOpen && gameState.player && (
        <InventoryPanel
          player={gameState.player}
          onClose={() => setShowInventory(false)}
          onUseItem={(idx) => { handleUseItem(idx) }}
        />
      )}

      {/* Tela de morte */}
      {isDead && !gameState.editorOpen && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ zIndex: 50, background: 'rgba(60,0,0,0.85)' }}
        >
          <div
            className="text-center p-8 rounded-lg"
            style={{
              background: 'rgba(8,4,4,0.95)',
              border: '2px solid #8a1010',
              boxShadow: '0 0 60px rgba(140,16,16,0.4)',
            }}
          >
            <h2
              className="text-4xl font-bold mb-2"
              style={{
                color: '#cc1010',
                textShadow: '0 0 20px rgba(200,16,16,0.8)',
                fontFamily: 'serif',
              }}
            >
              Voce foi Derrotado
            </h2>
            {gameState.player && (
              <p className="text-muted-foreground mb-6 text-sm">
                {gameState.player.name} — Nivel {gameState.player.level} — {gameState.player.gold} Ouro
              </p>
            )}
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleRespawn}
                className="px-6 py-3 rounded font-bold transition-all"
                style={{
                  background: 'rgba(140,16,16,0.3)',
                  border: '2px solid #8a1010',
                  color: '#ff6060',
                  fontFamily: 'serif',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(140,16,16,0.5)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(140,16,16,0.3)' }}
              >
                Renascer
              </button>
              <button
                onClick={() => { setGameState((p) => ({ ...p, screen: 'title' })); setShowInventory(false) }}
                className="px-6 py-3 rounded font-bold transition-all"
                style={{
                  background: 'rgba(42,48,80,0.3)',
                  border: '2px solid #2a3060',
                  color: '#8a9ab0',
                  fontFamily: 'serif',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(42,48,80,0.5)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(42,48,80,0.3)' }}
              >
                Menu Principal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
