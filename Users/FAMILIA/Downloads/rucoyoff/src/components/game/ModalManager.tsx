import { useState, useCallback } from 'react'

export type ModalType = 
  | 'inventory' 
  | 'shop' 
  | 'quest' 
  | 'achievements' 
  | 'passive' 
  | 'crafting' 
  | 'stats' 
  | 'help' 
  | 'worldmap' 
  | 'class' 
  | 'dev'
  | 'none'

interface ModalState {
  isOpen: boolean
  type: ModalType
  priority: number // Para sobreposição de modais
}

export function useModalManager() {
  const [modals, setModals] = useState<Record<ModalType, ModalState>>({
    inventory: { isOpen: false, type: 'inventory', priority: 1 },
    shop: { isOpen: false, type: 'shop', priority: 2 },
    quest: { isOpen: false, type: 'quest', priority: 1 },
    achievements: { isOpen: false, type: 'achievements', priority: 1 },
    passive: { isOpen: false, type: 'passive', priority: 3 },
    crafting: { isOpen: false, type: 'crafting', priority: 2 },
    stats: { isOpen: false, type: 'stats', priority: 1 },
    help: { isOpen: false, type: 'help', priority: 1 },
    worldmap: { isOpen: false, type: 'worldmap', priority: 2 },
    class: { isOpen: false, type: 'class', priority: 4 },
    dev: { isOpen: false, type: 'dev', priority: 5 },
    none: { isOpen: false, type: 'none', priority: 0 },
  })

  const openModal = useCallback((type: ModalType) => {
    setModals(prev => ({
      ...prev,
      [type]: { ...prev[type], isOpen: true },
      // Fecha modais de menor prioridade
      ...Object.fromEntries(
        Object.entries(prev)
          .filter(([key, value]) => 
            key !== type && value.isOpen && value.priority < prev[type].priority
          )
          .map(([key]) => [key, { ...prev[key as ModalType], isOpen: false }])
      )
    }))
  }, [])

  const closeModal = useCallback((type: ModalType) => {
    setModals(prev => ({
      ...prev,
      [type]: { ...prev[type], isOpen: false }
    }))
  }, [])

  const toggleModal = useCallback((type: ModalType) => {
    setModals(prev => ({
      ...prev,
      [type]: { ...prev[type], isOpen: !prev[type].isOpen }
    }))
  }, [])

  const closeAllModals = useCallback(() => {
    setModals(prev => 
      Object.fromEntries(
        Object.entries(prev).map(([key, value]) => [key, { ...value, isOpen: false }])
      ) as Record<ModalType, ModalState>
    )
  }, [])

  const getActiveModal = useCallback((): ModalType => {
    const active = Object.values(modals)
      .filter(m => m.isOpen)
      .sort((a, b) => b.priority - a.priority)
    
    return active.length > 0 ? active[0].type : 'none'
  }, [modals])

  const isModalOpen = useCallback((type: ModalType): boolean => {
    return modals[type].isOpen
  }, [modals])

  return {
    modals,
    openModal,
    closeModal,
    toggleModal,
    closeAllModals,
    getActiveModal,
    isModalOpen,
  }
}
