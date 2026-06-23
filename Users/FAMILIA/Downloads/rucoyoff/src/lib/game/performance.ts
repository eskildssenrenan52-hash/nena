// @ts-nocheck
// Sistema de otimização de performance avançado

interface PerformanceConfig {
  targetFPS: number
  adaptiveQuality: boolean
  cullingDistance: number
  maxVisibleEntities: number
  enableChunkLoading: boolean
  chunkSize: number
}

class PerformanceOptimizer {
  private config: PerformanceConfig
  private fpsHistory: number[] = []
  private currentQualityLevel: number = 3 // 0-3 (lowest to highest)
  
  constructor(config: Partial<PerformanceConfig> = {}) {
    this.config = {
      targetFPS: 60,
      adaptiveQuality: true,
      cullingDistance: 1000,
      maxVisibleEntities: 50,
      enableChunkLoading: true,
      chunkSize: 32,
      ...config
    }
    // Initialize at max quality for best performance
    this.currentQualityLevel = 3
  }

  // Calcular FPS médio
  calculateAverageFPS(): number {
    if (this.fpsHistory.length === 0) return 60
    const sum = this.fpsHistory.reduce((a, b) => a + b, 0)
    return sum / this.fpsHistory.length
  }

  // Atualizar histórico de FPS
  updateFPS(fps: number) {
    this.fpsHistory.push(fps)
    if (this.fpsHistory.length > 60) { // Manter últimos 60 frames
      this.fpsHistory.shift()
    }
  }

  // Ajustar qualidade automaticamente baseado no FPS
  adjustQualityIfNeeded(): PerformanceConfig {
    if (!this.config.adaptiveQuality) return this.config

    const avgFPS = this.calculateAverageFPS()
    const targetFPS = this.config.targetFPS

    if (avgFPS < targetFPS * 0.7) { // Se FPS < 70% do alvo
      this.currentQualityLevel = Math.max(0, this.currentQualityLevel - 1)
    } else if (avgFPS > targetFPS * 1.1) { // Se FPS > 110% do alvo
      this.currentQualityLevel = Math.min(3, this.currentQualityLevel + 1)
    }

    return this.getQualityConfig()
  }

  // Obter configuração baseada no nível de qualidade
  getQualityConfig(): PerformanceConfig {
    const qualityConfigs = [
      { // Nível 0 - Baixa qualidade
        cullingDistance: 400,
        maxVisibleEntities: 20,
        enableChunkLoading: true,
        chunkSize: 96,
        targetFPS: 30,
        adaptiveQuality: true,
      },
      { // Nível 1 - Qualidade média-baixa
        cullingDistance: 600,
        maxVisibleEntities: 30,
        enableChunkLoading: true,
        chunkSize: 64,
        targetFPS: 45,
        adaptiveQuality: true,
      },
      { // Nível 2 - Qualidade média-alta
        cullingDistance: 800,
        maxVisibleEntities: 40,
        enableChunkLoading: true,
        chunkSize: 48,
        targetFPS: 60,
        adaptiveQuality: true,
      },
      { // Nível 3 - Alta qualidade (ultra optimized)
        cullingDistance: 1000,
        maxVisibleEntities: 60,
        enableChunkLoading: true,
        chunkSize: 32,
        targetFPS: 60,
        adaptiveQuality: true,
      },
    ]

    return { ...this.config, ...qualityConfigs[this.currentQualityLevel] }
  }

  // Sistema de chunk loading para mapas enormes
  getVisibleChunks(cameraX: number, cameraY: number, mapWidth: number, mapHeight: number) {
    if (!this.config.enableChunkLoading) {
      return { startX: 0, endX: mapWidth, startY: 0, endY: mapHeight }
    }

    const chunkSize = this.config.chunkSize
    // More aggressive culling for better performance
    const startX = Math.max(0, Math.floor(cameraX / chunkSize))
    const endX = Math.min(mapWidth, Math.ceil((cameraX + 800) / chunkSize) + 1)
    const startY = Math.max(0, Math.floor(cameraY / chunkSize))
    const endY = Math.min(mapHeight, Math.ceil((cameraY + 600) / chunkSize) + 1)

    return { startX, endX, startY, endY }
  }

  // Sistema de LOD (Level of Detail) para renderização
  shouldRenderHighQuality(distance: number): boolean {
    return distance < this.config.cullingDistance * 0.3
  }

  shouldRenderMediumQuality(distance: number): boolean {
    return distance < this.config.cullingDistance * 0.7
  }

  // Otimização de física - apenas atualizar entidades próximas
  shouldUpdateEntity(entityX: number, entityY: number, cameraX: number, cameraY: number): boolean {
    const distance = Math.hypot(entityX - cameraX, entityY - cameraY)
    return distance < this.config.cullingDistance
  }

  // Sistema de garbage collection otimizado
  cleanupOldEntities(entities: any[], maxAge: number = 30000) {
    const now = Date.now()
    return entities.filter(entity => {
      if (entity.createdAt && now - entity.createdAt > maxAge) {
        return false
      }
      return true
    })
  }

  // Compactar estado do jogo para economia de memória
  compressGameState(state: any): any {
    // Remover dados desnecessários
    const compressed = {
      ...state,
      particles: state.particles?.slice(-100) || [], // Manter apenas 100 partículas recentes
      damageNumbers: state.damageNumbers?.slice(-50) || [], // Manter apenas 50 números de dano recentes
      notifications: state.notifications?.filter(n => n.timer > 0) || [],
    }
    return compressed
  }

  // Monitorar uso de memória
  getMemoryUsage(): number {
    if (performance && (performance as any).memory) {
      return (performance as any).memory.usedJSHeapSize / 1048576 // MB
    }
    return 0
  }

  // Forçar garbage collection se necessário
  forceGarbageCollection() {
    if (typeof gc !== 'undefined') {
      (global as any).gc()
    }
  }
}

export const performanceOptimizer = new PerformanceOptimizer()
