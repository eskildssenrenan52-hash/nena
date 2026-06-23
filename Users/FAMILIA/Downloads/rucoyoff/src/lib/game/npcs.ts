import type { Vec2, Player, GameMap } from './types'
import { ITEMS } from './data'

export interface NPC {
  id: string
  name: string
  type: 'merchant' | 'healer' | 'blacksmith' | 'quest_giver' | 'guard'
  position: Vec2
  sprite: string
  dialog: string[]
  shopItems?: { itemId: string; price: number; quantity: number }[]
  healCost?: number
  healPercent?: number
}

export const CITY_NPCS: NPC[] = [
  {
    id: 'merchant_1',
    name: 'Vendedor Geral',
    type: 'merchant',
    position: { x: 22 * 32, y: 22 * 32 },
    sprite: 'merchant',
    dialog: [
      'Bem-vindo, aventureiro!',
      'Tenho os melhores itens da cidade.',
      'Compre algo antes de partir!',
    ],
    shopItems: [
      { itemId: 'small_potion', price: 25, quantity: 99 },
      { itemId: 'potion', price: 60, quantity: 99 },
      { itemId: 'great_potion', price: 150, quantity: 99 },
      { itemId: 'mana_potion', price: 35, quantity: 99 },
      { itemId: 'iron_sword', price: 100, quantity: 1 },
      { itemId: 'iron_bow', price: 120, quantity: 1 },
      { itemId: 'iron_staff', price: 130, quantity: 1 },
      { itemId: 'leather_armor', price: 80, quantity: 1 },
      { itemId: 'leather_helmet', price: 50, quantity: 1 },
      { itemId: 'leather_boots', price: 50, quantity: 1 },
      { itemId: 'copper_ring', price: 60, quantity: 1 },
    ],
  },
  {
    id: 'healer_1',
    name: 'Curandeira Elara',
    type: 'healer',
    position: { x: 28 * 32, y: 22 * 32 },
    sprite: 'healer',
    dialog: [
      'Ah, você parece ferido.',
      'Posso curar suas feridas por um preço.',
      'A saude e o que mais importa!',
    ],
    healCost: 30,
    healPercent: 0.5,
  },
  {
    id: 'blacksmith_1',
    name: 'Ferreiro Thorin',
    type: 'blacksmith',
    position: { x: 22 * 32, y: 28 * 32 },
    sprite: 'blacksmith',
    dialog: [
      'Meu ferro e o melhor!',
      'Precisa de armas ou armaduras?',
      'Aço de verdade, nada de madeira!',
    ],
    shopItems: [
      { itemId: 'steel_sword', price: 350, quantity: 1 },
      { itemId: 'chainmail', price: 280, quantity: 1 },
      { itemId: 'iron_helmet', price: 180, quantity: 1 },
      { itemId: 'iron_boots', price: 150, quantity: 1 },
      { itemId: 'magic_ring', price: 320, quantity: 1 },
    ],
  },
  {
    id: 'guard_1',
    name: 'Guarda do Portao',
    type: 'guard',
    position: { x: 25 * 32, y: 35 * 32 },
    sprite: 'guard',
    dialog: [
      'Cuidado la fora!',
      'Monstros rondam a floresta.',
      'O portal leva para a Floresta das Sombras.',
    ],
  },
]

export function buyItem(player: Player, itemId: string, price: number): { success: boolean; player: Player; message: string } {
  if (player.gold < price) {
    return { success: false, player, message: 'Ouro insuficiente!' }
  }

  const item = ITEMS[itemId]
  if (!item) {
    return { success: false, player, message: 'Item nao encontrado!' }
  }

  const emptySlot = player.inventory.findIndex(s => s === null)
  if (emptySlot === -1) {
    return { success: false, player, message: 'Inventario cheio!' }
  }

  const newInventory = [...player.inventory]
  newInventory[emptySlot] = { ...item, quantity: item.stackable ? 1 : undefined }

  return {
    success: true,
    player: { ...player, gold: player.gold - price, inventory: newInventory },
    message: `Comprou: ${item.name}!`,
  }
}

export function sellItem(player: Player, slotIdx: number): { success: boolean; player: Player; message: string } {
  const item = player.inventory[slotIdx]
  if (!item) {
    return { success: false, player, message: 'Slot vazio!' }
  }

  const sellPrice = Math.round(item.value * 0.3)
  const newInventory = [...player.inventory]
  newInventory[slotIdx] = null

  return {
    success: true,
    player: { ...player, gold: player.gold + sellPrice, inventory: newInventory },
    message: `Vendeu: ${item.name} por ${sellPrice} Ouro!`,
  }
}

export function healPlayer(player: Player, cost: number, percent: number): { success: boolean; player: Player; message: string } {
  if (player.gold < cost) {
    return { success: false, player, message: 'Ouro insuficiente para cura!' }
  }
  if (player.hp >= player.stats.maxHp) {
    return { success: false, player, message: 'Ja esta com HP cheio!' }
  }

  const healAmount = Math.round(player.stats.maxHp * percent)
  const newHp = Math.min(player.stats.maxHp, player.hp + healAmount)

  return {
    success: true,
    player: { ...player, gold: player.gold - cost, hp: newHp },
    message: `Curado: +${healAmount} HP!`,
  }
}
