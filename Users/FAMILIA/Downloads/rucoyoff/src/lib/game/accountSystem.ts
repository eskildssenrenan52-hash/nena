/**
 * Sistema de Contas - Permitir jogar anonimamente e registrar depois
 */

export interface UserAccount {
  id: string
  email: string
  username: string
  createdAt: number
  updatedAt: number
  verified: boolean
}

export interface AccountSaveSlot {
  id: string
  accountId: string
  playerName: string
  characterClass: string
  level: number
  gold: number
  playtime: number // em segundos
  lastPlayed: number // timestamp
  saveData: string // serialized player state
}

export interface AnonymousProgress {
  sessionId: string
  playerName: string
  level: number
  gold: number
  playtime: number
  lastPlayed: number
  saveData: string
  createdAt: number
}

// ─── Local Storage Keys ───────────────────────────────────────────────────

const STORAGE_KEYS = {
  CURRENT_ACCOUNT: 'rucoy_current_account',
  ANONYMOUS_PROGRESS: 'rucoy_anonymous_progress',
  ACCOUNT_SLOTS: 'rucoy_account_slots',
  GUEST_SESSION_ID: 'rucoy_guest_session_id',
} as const

// ─── Account Management ────────────────────────────────────────────────────

/**
 * Obter sessão anônima atual ou criar uma nova
 */
export function getOrCreateGuestSession(): string {
  let sessionId = localStorage.getItem(STORAGE_KEYS.GUEST_SESSION_ID)
  if (!sessionId) {
    sessionId = `guest_${Date.now()}_${Math.random().toString(36).slice(2)}`
    localStorage.setItem(STORAGE_KEYS.GUEST_SESSION_ID, sessionId)
  }
  return sessionId
}

/**
 * Salvar progresso de um jogador anônimo
 */
export function saveAnonymousProgress(
  playerName: string,
  characterClass: string,
  level: number,
  gold: number,
  playtime: number,
  saveData: string,
): AnonymousProgress {
  const sessionId = getOrCreateGuestSession()
  const progress: AnonymousProgress = {
    sessionId,
    playerName,
    level,
    gold,
    playtime,
    lastPlayed: Date.now(),
    saveData,
    createdAt: Date.now(),
  }

  localStorage.setItem(STORAGE_KEYS.ANONYMOUS_PROGRESS, JSON.stringify(progress))
  return progress
}

/**
 * Carregar progresso anônimo
 */
export function loadAnonymousProgress(): AnonymousProgress | null {
  const data = localStorage.getItem(STORAGE_KEYS.ANONYMOUS_PROGRESS)
  return data ? JSON.parse(data) : null
}

/**
 * Verificar se há progresso anônimo
 */
export function hasAnonymousProgress(): boolean {
  return loadAnonymousProgress() !== null
}

/**
 * Registrar/criar uma conta com email
 */
export function registerAccount(email: string, username: string): UserAccount {
  const account: UserAccount = {
    id: `user_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    email,
    username,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    verified: false,
  }

  // Aqui você faria uma chamada de API para registrar no servidor
  // Por enquanto, salvamos localmente
  localStorage.setItem(STORAGE_KEYS.CURRENT_ACCOUNT, JSON.stringify(account))
  return account
}

/**
 * Fazer login em uma conta
 */
export function loginAccount(email: string): UserAccount | null {
  // Aqui você faria uma chamada de API para verificar credenciais no servidor
  // Por enquanto, apenas retornamos uma conta mock
  const account: UserAccount = {
    id: `user_${email.replace(/[^a-z0-9]/g, '_')}`,
    email,
    username: email.split('@')[0],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    verified: true,
  }

  localStorage.setItem(STORAGE_KEYS.CURRENT_ACCOUNT, JSON.stringify(account))
  return account
}

/**
 * Obter conta atual
 */
export function getCurrentAccount(): UserAccount | null {
  const data = localStorage.getItem(STORAGE_KEYS.CURRENT_ACCOUNT)
  return data ? JSON.parse(data) : null
}

/**
 * Fazer logout
 */
export function logout(): void {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_ACCOUNT)
}

/**
 * Verificar se está logado
 */
export function isLoggedIn(): boolean {
  return getCurrentAccount() !== null
}

// ─── Save Slots Management ─────────────────────────────────────────────────

/**
 * Migrar progresso anônimo para conta
 */
export function migrateAnonymousToAccount(accountId: string): AccountSaveSlot | null {
  const anonymousProgress = loadAnonymousProgress()
  if (!anonymousProgress) return null

  const saveSlot: AccountSaveSlot = {
    id: `slot_${Date.now()}`,
    accountId,
    playerName: anonymousProgress.playerName,
    characterClass: 'warrior', // será atualizado com a classe real
    level: anonymousProgress.level,
    gold: anonymousProgress.gold,
    playtime: anonymousProgress.playtime,
    lastPlayed: anonymousProgress.lastPlayed,
    saveData: anonymousProgress.saveData,
  }

  // Adicionar ao histórico de slots
  const slots = getAllSaveSlots(accountId)
  slots.push(saveSlot)
  localStorage.setItem(`${STORAGE_KEYS.ACCOUNT_SLOTS}_${accountId}`, JSON.stringify(slots))

  // Remover progresso anônimo após migração
  localStorage.removeItem(STORAGE_KEYS.ANONYMOUS_PROGRESS)

  return saveSlot
}

/**
 * Salvar slot para uma conta
 */
export function saveSaveSlot(slot: AccountSaveSlot): void {
  const slots = getAllSaveSlots(slot.accountId)
  const existingIndex = slots.findIndex(s => s.id === slot.id)

  if (existingIndex >= 0) {
    slots[existingIndex] = slot
  } else {
    slots.push(slot)
  }

  localStorage.setItem(`${STORAGE_KEYS.ACCOUNT_SLOTS}_${slot.accountId}`, JSON.stringify(slots))
}

/**
 * Obter todos os slots de uma conta
 */
export function getAllSaveSlots(accountId: string): AccountSaveSlot[] {
  const data = localStorage.getItem(`${STORAGE_KEYS.ACCOUNT_SLOTS}_${accountId}`)
  return data ? JSON.parse(data) : []
}

/**
 * Obter slot específico
 */
export function getSaveSlot(accountId: string, slotId: string): AccountSaveSlot | null {
  const slots = getAllSaveSlots(accountId)
  return slots.find(s => s.id === slotId) || null
}

/**
 * Deletar slot
 */
export function deleteSaveSlot(accountId: string, slotId: string): void {
  const slots = getAllSaveSlots(accountId).filter(s => s.id !== slotId)
  localStorage.setItem(`${STORAGE_KEYS.ACCOUNT_SLOTS}_${accountId}`, JSON.stringify(slots))
}

// ─── Auto-save ────────────────────────────────────────────────────────────

let autoSaveInterval: NodeJS.Timeout | null = null

/**
 * Iniciar auto-save periódico
 */
export function startAutoSave(
  getPlayerData: () => { playerName: string; level: number; gold: number; playtime: number; saveData: string },
  isGuest: boolean,
  intervalMs: number = 30000, // 30 segundos
): void {
  if (autoSaveInterval) clearInterval(autoSaveInterval)

  autoSaveInterval = setInterval(() => {
    const data = getPlayerData()

    if (isGuest) {
      saveAnonymousProgress(
        data.playerName,
        'warrior',
        data.level,
        data.gold,
        data.playtime,
        data.saveData,
      )
    } else {
      const account = getCurrentAccount()
      if (account) {
        const slots = getAllSaveSlots(account.id)
        if (slots.length > 0) {
          const primarySlot = slots[0]
          saveSaveSlot({
            ...primarySlot,
            level: data.level,
            gold: data.gold,
            playtime: data.playtime,
            lastPlayed: Date.now(),
            saveData: data.saveData,
          })
        }
      }
    }
  }, intervalMs)
}

/**
 * Parar auto-save
 */
export function stopAutoSave(): void {
  if (autoSaveInterval) {
    clearInterval(autoSaveInterval)
    autoSaveInterval = null
  }
}
