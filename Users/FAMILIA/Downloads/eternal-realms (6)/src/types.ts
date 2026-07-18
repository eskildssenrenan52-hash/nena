/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PlayerStats {
  class: PlayerClass;
  skin: PlayerSkin;
  level: number;
  xp: number;
  xpNeeded: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  attack: number;
  defense: number;
  gold: number;
  potions: number;
  manaPotions: number;
  weapon: string;
  armor: string;
  weaponBonus: number;
  armorBonus: number;
}

export type PlayerClass = 'warrior' | 'mage' | 'rogue' | 'cleric' | 'ranger';

export type PlayerSkin = 'classic' | 'golden' | 'shadow' | 'crimson' | 'cosmic' | 'infernal' | 'celestial';

export interface ClassConfig {
  name: string;
  color: string;
  baseHp: number;
  baseMp: number;
  baseAttack: number;
  baseDefense: number;
  skills: Skill[];
  description: string;
  weaponName: string;
  armorName: string;
}

export interface Skill {
  name: string;
  cost: number;
  damageMultiplier: number;
  healMultiplier: number;
  description: string;
  type: 'damage' | 'heal' | 'buff';
  statusEffect?: string;
}

export interface Enemy {
  key: string;
  name: string;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  color: string;
  isBoss: boolean;
  xpReward: number;
  goldReward: number;
}

export interface Biome {
  id: number;
  name: string;
  color: string;
  hazardName: string;
  hazardDescription: string;
  ambientEffect: string;
  backgroundGradient: string;
  particleConfig: {
    color: string;
    speed: number;
    size: number;
    shape: 'circle' | 'square' | 'line' | 'star';
  };
  enemies: Array<{
    key: string;
    name: string;
    hpMultiplier: number;
    atkMultiplier: number;
  }>;
  boss: {
    key: string;
    name: string;
    hpMultiplier: number;
    atkMultiplier: number;
    description: string;
  };
}

export interface Room {
  x: number;
  y: number;
  type: RoomType;
  explored: boolean;
  enemy?: Enemy;
  chestClaimed?: boolean;
  hazardTriggered?: boolean;
  shrineClaimed?: boolean;
}

export type RoomType = 'empty' | 'start' | 'chest' | 'shrine' | 'hazard' | 'enemy' | 'boss' | 'stairs';

export interface GameState {
  currentBiomeIndex: number;
  currentFloor: number; // 1 to 5
  player: PlayerStats;
  dungeonMap: Room[][];
  playerX: number;
  playerY: number;
  combatEnemy?: Enemy;
  combatLogs?: string[];
  unlockedSkins: PlayerSkin[];
}
