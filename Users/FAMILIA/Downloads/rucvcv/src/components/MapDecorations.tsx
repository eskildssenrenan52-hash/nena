/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Camada puramente decorativa sobreposta ao mapa da masmorra.
 * Não interfere na jogabilidade — apenas atmosfera visual.
 *
 * Este arquivo foi massivamente expandido: agora inclui mais de 30 tipos de
 * ornamentos distintos e um sistema de estradas antigas que atravessa quase
 * toda tile explorada, produzindo mais de 100 combinações visuais únicas
 * espalhadas pelo mapa.
 */

import { motion } from 'motion/react';
import { useMemo } from 'react';
import { Room, Biome } from '../types';

// ---------- utilidades ----------

function seededRand(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Escolhe ornamentos por tile de forma estável (mesma sala → mesmos ícones).
// Agora escolhe até 4 ornamentos e quase sempre inclui uma estrada antiga.
function pickTileDecos(room: Room, biome: Biome): string[] {
  if (!room.explored) return [];
  if (room.type === 'start' || room.type === 'stairs' || room.type === 'boss') return [];
  const rand = seededRand(room.x * 131 + room.y * 977 + biome.id * 13);
  const pool = biomeOrnaments(biome.id);
  const picks: string[] = [];

  // Estradas antigas em quase todo canto (~80% das salas).
  if (rand() < 0.8) {
    const roads = ['road_old', 'road_cobble', 'road_cracked', 'road_dirt'];
    picks.push(roads[Math.floor(rand() * roads.length)]);
  }

  const decoCount = 2 + Math.floor(rand() * 3); // 2 a 4 decorações
  for (let i = 0; i < decoCount; i++) {
    picks.push(pool[Math.floor(rand() * pool.length)]);
  }
  return picks;
}

// Paleta de ornamentos SVG por bioma (id 0..9). Muito mais variedade agora.
function biomeOrnaments(biomeId: number): string[] {
  const common = ['rock', 'small_rock', 'bush', 'flowers', 'stump', 'log', 'grass_tuft', 'puddle', 'tracks', 'sign', 'lamppost', 'barrel', 'crate', 'fence', 'bench', 'well', 'cart', 'ruin_pillar', 'ruin_arch', 'cross', 'shrine_small', 'hay', 'campfire'];
  if (biomeId <= 1) return [...common, 'tree', 'tree', 'tree', 'bush', 'flowers', 'mushroom_small', 'well', 'cart', 'statue'];
  if (biomeId <= 3) return [...common, 'mushroom', 'mushroom', 'wall', 'torch', 'bones', 'skull', 'vine', 'moss'];
  if (biomeId <= 5) return [...common, 'statue', 'torch', 'wall', 'bones', 'skull', 'cross', 'grave', 'raven', 'chain'];
  if (biomeId <= 7) return [...common, 'bones', 'skull', 'wall', 'statue', 'torch', 'ruin_pillar', 'ash', 'cracked_ground'];
  return [...common, 'statue', 'crystal', 'altar', 'wall', 'torch', 'shrine_small', 'obelisk', 'rune_stone'];
}

// ---------- ornamentos SVG ----------

function Ornament({ kind, tint }: { kind: string; tint: string }) {
  const base = 'absolute pointer-events-none opacity-70';
  switch (kind) {
    case 'tree':
      return (
        <motion.svg
          className={base}
          width="14" height="14" viewBox="0 0 24 24"
          animate={{ rotate: [-3, 3, -3], transformOrigin: '12px 22px' } as any}
          transition={{ repeat: Infinity, duration: 3.4, ease: 'easeInOut' }}
        >
          <rect x="10.5" y="14" width="3" height="8" fill="#5b3a1e" />
          <circle cx="12" cy="10" r="6" fill="#2f6b3a" />
          <circle cx="8" cy="8" r="3.5" fill="#3a8a48" />
          <circle cx="15" cy="7" r="3" fill="#3a8a48" />
        </motion.svg>
      );
    case 'bush':
      return (
        <svg className={base} width="12" height="12" viewBox="0 0 24 24">
          <circle cx="8" cy="16" r="5" fill="#2d5a34" />
          <circle cx="14" cy="15" r="5.5" fill="#377243" />
          <circle cx="11" cy="12" r="4" fill="#3e8a4c" />
        </svg>
      );
    case 'rock':
      return (
        <svg className={base} width="12" height="12" viewBox="0 0 24 24">
          <polygon points="4,20 9,10 15,9 20,20" fill="#6b6a68" />
          <polygon points="9,10 12,13 15,9" fill="#8a8886" />
        </svg>
      );
    case 'small_rock':
      return (
        <svg className={base} width="8" height="8" viewBox="0 0 16 16">
          <ellipse cx="8" cy="11" rx="6" ry="3" fill="#6b6a68" />
          <ellipse cx="6" cy="9" rx="2" ry="1" fill="#8a8886" />
        </svg>
      );
    // Estradas antigas — ocupam a tile inteira
    case 'road_old':
      return (
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-35" viewBox="0 0 24 24" preserveAspectRatio="none">
          <path d="M0 13 Q12 9 24 13 L24 19 Q12 15 0 19 Z" fill="#7a7472" />
          <circle cx="4" cy="15" r="0.9" fill="#4a4442" />
          <circle cx="10" cy="14" r="0.8" fill="#4a4442" />
          <circle cx="17" cy="16" r="0.9" fill="#4a4442" />
          <circle cx="22" cy="15" r="0.7" fill="#4a4442" />
        </svg>
      );
    case 'road_cobble':
      return (
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40" viewBox="0 0 24 24" preserveAspectRatio="none">
          <path d="M0 12 L24 12 L24 20 L0 20 Z" fill="#6b6863" />
          <circle cx="3" cy="14" r="1.2" fill="#8a8681" />
          <circle cx="7" cy="15" r="1" fill="#8a8681" />
          <circle cx="11" cy="14" r="1.3" fill="#8a8681" />
          <circle cx="15" cy="15" r="1.1" fill="#8a8681" />
          <circle cx="19" cy="14" r="1.2" fill="#8a8681" />
          <circle cx="22" cy="16" r="1" fill="#8a8681" />
          <circle cx="5" cy="18" r="1.1" fill="#8a8681" />
          <circle cx="13" cy="18" r="1.2" fill="#8a8681" />
          <circle cx="20" cy="18" r="1" fill="#8a8681" />
        </svg>
      );
    case 'road_cracked':
      return (
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30" viewBox="0 0 24 24" preserveAspectRatio="none">
          <rect x="0" y="12" width="24" height="8" fill="#8a8681" />
          <path d="M2 14 L7 17 L12 14 L18 18 L22 15" stroke="#4a4442" strokeWidth="0.4" fill="none" />
          <path d="M4 19 L9 15 L14 19 L20 16" stroke="#4a4442" strokeWidth="0.4" fill="none" />
        </svg>
      );
    case 'road_dirt':
      return (
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30" viewBox="0 0 24 24" preserveAspectRatio="none">
          <path d="M0 13 Q6 10 12 13 T24 13 L24 20 Q18 17 12 20 T0 20 Z" fill="#7a5a3a" />
          <circle cx="6" cy="16" r="0.4" fill="#3a2410" />
          <circle cx="14" cy="15" r="0.4" fill="#3a2410" />
          <circle cx="20" cy="17" r="0.4" fill="#3a2410" />
        </svg>
      );
    case 'wall':
      return (
        <svg className={base} width="14" height="10" viewBox="0 0 24 16">
          <rect x="0" y="4" width="24" height="10" fill="#5b5957" stroke="#3a3937" />
          <line x1="8" y1="4" x2="8" y2="9" stroke="#3a3937" />
          <line x1="16" y1="4" x2="16" y2="9" stroke="#3a3937" />
          <line x1="0" y1="9" x2="24" y2="9" stroke="#3a3937" />
          <line x1="4" y1="9" x2="4" y2="14" stroke="#3a3937" />
          <line x1="12" y1="9" x2="12" y2="14" stroke="#3a3937" />
          <line x1="20" y1="9" x2="20" y2="14" stroke="#3a3937" />
        </svg>
      );
    case 'fence':
      return (
        <svg className={base} width="16" height="10" viewBox="0 0 24 14">
          <rect x="0" y="8" width="24" height="1.2" fill="#7a5a3a" />
          <rect x="2" y="4" width="1.6" height="10" fill="#7a5a3a" />
          <rect x="7" y="3" width="1.6" height="11" fill="#7a5a3a" />
          <rect x="12" y="4" width="1.6" height="10" fill="#7a5a3a" />
          <rect x="17" y="3" width="1.6" height="11" fill="#7a5a3a" />
          <rect x="21" y="4" width="1.6" height="10" fill="#7a5a3a" />
        </svg>
      );
    case 'statue':
      return (
        <svg className={base} width="12" height="14" viewBox="0 0 24 28">
          <rect x="8" y="22" width="8" height="4" fill="#4a4846" />
          <circle cx="12" cy="8" r="4" fill="#a09e9a" />
          <path d="M8 12 L16 12 L15 22 L9 22 Z" fill="#a09e9a" />
          <path d="M6 15 L8 12 L8 20 Z M18 15 L16 12 L16 20 Z" fill="#8a8884" />
        </svg>
      );
    case 'torch':
      return (
        <motion.svg
          className={base}
          width="8" height="14" viewBox="0 0 12 20"
          animate={{ opacity: [0.6, 1, 0.7] }}
          transition={{ repeat: Infinity, duration: 0.9, ease: 'easeInOut' }}
        >
          <rect x="5" y="8" width="2" height="12" fill="#3a2410" />
          <ellipse cx="6" cy="6" rx="3" ry="5" fill="#ff8a1a" />
          <ellipse cx="6" cy="4" rx="1.6" ry="3" fill="#ffe066" />
        </motion.svg>
      );
    case 'lamppost':
      return (
        <motion.svg
          className={base}
          width="8" height="16" viewBox="0 0 12 22"
          animate={{ opacity: [0.7, 1, 0.75] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
        >
          <rect x="5.2" y="6" width="1.6" height="16" fill="#3a3937" />
          <rect x="3" y="4" width="6" height="3" fill="#4a4846" />
          <ellipse cx="6" cy="5.5" rx="1.6" ry="1.2" fill="#ffe066" />
        </motion.svg>
      );
    case 'mushroom':
      return (
        <svg className={base} width="10" height="12" viewBox="0 0 16 20">
          <rect x="6" y="10" width="4" height="8" fill="#e6dcc4" />
          <ellipse cx="8" cy="10" rx="7" ry="4" fill={tint} />
          <circle cx="5" cy="9" r="1" fill="#fff8" />
          <circle cx="10" cy="10" r="0.8" fill="#fff8" />
        </svg>
      );
    case 'mushroom_small':
      return (
        <svg className={base} width="6" height="7" viewBox="0 0 12 14">
          <rect x="5" y="7" width="2" height="6" fill="#e6dcc4" />
          <ellipse cx="6" cy="7" rx="4" ry="2.5" fill={tint} />
        </svg>
      );
    case 'bones':
      return (
        <svg className={base} width="12" height="10" viewBox="0 0 20 14">
          <circle cx="4" cy="4" r="2.5" fill="#e2ddcc" />
          <circle cx="4" cy="10" r="2.5" fill="#e2ddcc" />
          <rect x="4" y="6" width="14" height="2" fill="#e2ddcc" />
          <circle cx="18" cy="4" r="2.2" fill="#e2ddcc" />
          <circle cx="18" cy="10" r="2.2" fill="#e2ddcc" />
        </svg>
      );
    case 'skull':
      return (
        <svg className={base} width="10" height="10" viewBox="0 0 16 16">
          <circle cx="8" cy="7" r="5" fill="#e2ddcc" />
          <rect x="5" y="11" width="6" height="3" fill="#e2ddcc" />
          <circle cx="6" cy="7" r="1" fill="#000" />
          <circle cx="10" cy="7" r="1" fill="#000" />
        </svg>
      );
    case 'crystal':
      return (
        <motion.svg
          className={base}
          width="10" height="14" viewBox="0 0 16 22"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ repeat: Infinity, duration: 2.2 }}
        >
          <polygon points="8,1 14,8 11,21 5,21 2,8" fill={tint} opacity="0.9" />
          <polygon points="8,1 11,21 8,10" fill="#fff6" />
        </motion.svg>
      );
    case 'altar':
      return (
        <svg className={base} width="14" height="10" viewBox="0 0 24 16">
          <rect x="2" y="8" width="20" height="6" fill="#7a7876" />
          <rect x="4" y="4" width="16" height="4" fill="#a09e9a" />
          <circle cx="12" cy="6" r="1.5" fill={tint} />
        </svg>
      );
    case 'flowers':
      return (
        <svg className={base} width="10" height="8" viewBox="0 0 16 12">
          <rect x="3" y="7" width="0.6" height="4" fill="#3a6a2a" />
          <rect x="8" y="6" width="0.6" height="5" fill="#3a6a2a" />
          <rect x="12" y="7" width="0.6" height="4" fill="#3a6a2a" />
          <circle cx="3.3" cy="6" r="1.4" fill="#e26d8a" />
          <circle cx="8.3" cy="5" r="1.6" fill="#e0e060" />
          <circle cx="12.3" cy="6" r="1.4" fill="#a06de0" />
        </svg>
      );
    case 'grass_tuft':
      return (
        <svg className={base} width="10" height="6" viewBox="0 0 16 10">
          <path d="M2 10 L4 3 L5 10 M6 10 L8 4 L9 10 M10 10 L12 3 L13 10" stroke="#3a8a3a" strokeWidth="0.8" fill="none" />
        </svg>
      );
    case 'stump':
      return (
        <svg className={base} width="10" height="8" viewBox="0 0 16 12">
          <ellipse cx="8" cy="10" rx="6" ry="1.6" fill="#3a2410" />
          <ellipse cx="8" cy="7" rx="6" ry="3" fill="#7a5a3a" />
          <ellipse cx="8" cy="6.4" rx="5" ry="2.4" fill="#a07a4a" />
          <circle cx="8" cy="6.4" r="1.2" fill="#7a5a3a" />
        </svg>
      );
    case 'log':
      return (
        <svg className={base} width="14" height="6" viewBox="0 0 24 10">
          <rect x="1" y="3" width="22" height="5" rx="2" fill="#7a5a3a" />
          <circle cx="3" cy="5.5" r="1.6" fill="#a07a4a" />
          <circle cx="21" cy="5.5" r="1.6" fill="#a07a4a" />
        </svg>
      );
    case 'puddle':
      return (
        <svg className={base} width="14" height="6" viewBox="0 0 24 10">
          <ellipse cx="12" cy="6" rx="10" ry="3" fill="#4a80a0" opacity="0.65" />
          <ellipse cx="8" cy="5" rx="2" ry="0.6" fill="#8ac0e0" opacity="0.7" />
        </svg>
      );
    case 'tracks':
      return (
        <svg className={base} width="14" height="8" viewBox="0 0 24 12">
          <ellipse cx="4" cy="6" rx="1.2" ry="1.6" fill="#3a2410" />
          <ellipse cx="10" cy="5" rx="1.2" ry="1.6" fill="#3a2410" />
          <ellipse cx="16" cy="7" rx="1.2" ry="1.6" fill="#3a2410" />
          <ellipse cx="21" cy="6" rx="1.2" ry="1.6" fill="#3a2410" />
        </svg>
      );
    case 'sign':
      return (
        <svg className={base} width="10" height="12" viewBox="0 0 16 20">
          <rect x="7" y="10" width="1.6" height="9" fill="#5b3a1e" />
          <rect x="2" y="4" width="12" height="7" fill="#a07a4a" stroke="#5b3a1e" />
          <line x1="4" y1="6.5" x2="12" y2="6.5" stroke="#3a2410" strokeWidth="0.5" />
          <line x1="4" y1="8.5" x2="10" y2="8.5" stroke="#3a2410" strokeWidth="0.5" />
        </svg>
      );
    case 'barrel':
      return (
        <svg className={base} width="8" height="12" viewBox="0 0 12 18">
          <rect x="1" y="3" width="10" height="14" rx="1" fill="#7a5a3a" />
          <line x1="1" y1="7" x2="11" y2="7" stroke="#3a2410" strokeWidth="0.6" />
          <line x1="1" y1="13" x2="11" y2="13" stroke="#3a2410" strokeWidth="0.6" />
        </svg>
      );
    case 'crate':
      return (
        <svg className={base} width="10" height="10" viewBox="0 0 16 16">
          <rect x="1" y="1" width="14" height="14" fill="#a07a4a" stroke="#5b3a1e" />
          <line x1="1" y1="8" x2="15" y2="8" stroke="#5b3a1e" strokeWidth="0.6" />
          <line x1="8" y1="1" x2="8" y2="15" stroke="#5b3a1e" strokeWidth="0.6" />
        </svg>
      );
    case 'bench':
      return (
        <svg className={base} width="14" height="8" viewBox="0 0 24 12">
          <rect x="1" y="4" width="22" height="2" fill="#7a5a3a" />
          <rect x="3" y="6" width="1.4" height="5" fill="#5b3a1e" />
          <rect x="19.6" y="6" width="1.4" height="5" fill="#5b3a1e" />
        </svg>
      );
    case 'well':
      return (
        <svg className={base} width="12" height="14" viewBox="0 0 20 22">
          <ellipse cx="10" cy="17" rx="8" ry="3" fill="#6b6863" />
          <ellipse cx="10" cy="15.5" rx="7" ry="2.4" fill="#2a3a4a" />
          <rect x="2" y="2" width="1.4" height="14" fill="#5b3a1e" />
          <rect x="16.6" y="2" width="1.4" height="14" fill="#5b3a1e" />
          <path d="M1 2 L19 2 L14 -1 L6 -1 Z" fill="#7a5a3a" />
        </svg>
      );
    case 'cart':
      return (
        <svg className={base} width="16" height="10" viewBox="0 0 24 14">
          <rect x="3" y="3" width="16" height="6" fill="#7a5a3a" stroke="#3a2410" />
          <circle cx="6" cy="11" r="2.2" fill="#3a2410" />
          <circle cx="16" cy="11" r="2.2" fill="#3a2410" />
        </svg>
      );
    case 'ruin_pillar':
      return (
        <svg className={base} width="8" height="14" viewBox="0 0 12 22">
          <rect x="3" y="4" width="6" height="16" fill="#a09e9a" />
          <rect x="2" y="1" width="8" height="3" fill="#8a8886" />
          <rect x="2" y="20" width="8" height="2" fill="#7a7876" />
          <line x1="6" y1="4" x2="6" y2="20" stroke="#6a6866" strokeWidth="0.4" />
        </svg>
      );
    case 'ruin_arch':
      return (
        <svg className={base} width="16" height="12" viewBox="0 0 24 18">
          <path d="M2 17 L2 6 Q12 -2 22 6 L22 17 L18 17 L18 8 Q12 3 6 8 L6 17 Z" fill="#8a8886" />
        </svg>
      );
    case 'cross':
      return (
        <svg className={base} width="8" height="12" viewBox="0 0 12 18">
          <rect x="5" y="2" width="2" height="15" fill="#5b3a1e" />
          <rect x="1.5" y="6" width="9" height="2" fill="#5b3a1e" />
        </svg>
      );
    case 'grave':
      return (
        <svg className={base} width="10" height="12" viewBox="0 0 16 20">
          <path d="M3 18 L3 8 Q3 3 8 3 Q13 3 13 8 L13 18 Z" fill="#7a7876" />
          <line x1="6" y1="10" x2="10" y2="10" stroke="#3a3937" strokeWidth="0.5" />
          <rect x="7" y="11" width="2" height="4" fill="#3a3937" />
        </svg>
      );
    case 'shrine_small':
      return (
        <svg className={base} width="10" height="14" viewBox="0 0 16 22">
          <rect x="4" y="10" width="8" height="10" fill="#a09e9a" />
          <path d="M2 10 L14 10 L8 3 Z" fill="#8a8886" />
          <circle cx="8" cy="15" r="1.4" fill={tint} />
        </svg>
      );
    case 'hay':
      return (
        <svg className={base} width="12" height="8" viewBox="0 0 20 12">
          <ellipse cx="10" cy="10" rx="9" ry="2.4" fill="#c8a866" />
          <ellipse cx="10" cy="8" rx="7" ry="3" fill="#e0c078" />
          <line x1="3" y1="8" x2="17" y2="8" stroke="#a08040" strokeWidth="0.4" />
        </svg>
      );
    case 'campfire':
      return (
        <motion.svg
          className={base}
          width="10" height="12" viewBox="0 0 16 20"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ repeat: Infinity, duration: 0.9 }}
        >
          <path d="M4 18 L8 12 M12 18 L8 12" stroke="#5b3a1e" strokeWidth="1.6" />
          <ellipse cx="8" cy="9" rx="3.5" ry="5" fill="#ff8a1a" />
          <ellipse cx="8" cy="7" rx="1.8" ry="3" fill="#ffe066" />
        </motion.svg>
      );
    case 'obelisk':
      return (
        <svg className={base} width="8" height="16" viewBox="0 0 12 24">
          <path d="M6 1 L9 22 L3 22 Z" fill="#3a3947" />
          <path d="M6 1 L6 22" stroke={tint} strokeWidth="0.6" />
        </svg>
      );
    case 'rune_stone':
      return (
        <svg className={base} width="10" height="10" viewBox="0 0 16 16">
          <polygon points="3,14 6,3 13,4 12,14" fill="#4a4846" />
          <path d="M6 7 L10 7 M8 5 L8 11 M6 9 L10 11" stroke={tint} strokeWidth="0.6" />
        </svg>
      );
    case 'vine':
      return (
        <motion.svg
          className={base}
          width="8" height="14" viewBox="0 0 12 22"
          animate={{ x: [-1, 1, -1] }}
          transition={{ repeat: Infinity, duration: 3 }}
        >
          <path d="M6 0 Q3 6 6 12 Q9 18 6 22" stroke="#2f6b3a" strokeWidth="1" fill="none" />
          <circle cx="4" cy="4" r="1.2" fill="#3a8a48" />
          <circle cx="8" cy="10" r="1.2" fill="#3a8a48" />
          <circle cx="4" cy="16" r="1.2" fill="#3a8a48" />
        </motion.svg>
      );
    case 'moss':
      return (
        <svg className={base} width="14" height="6" viewBox="0 0 24 10">
          <ellipse cx="6" cy="7" rx="4" ry="2" fill="#3a6a2a" />
          <ellipse cx="14" cy="6" rx="5" ry="2.4" fill="#4a8a3a" />
          <ellipse cx="20" cy="7" rx="3" ry="1.6" fill="#3a6a2a" />
        </svg>
      );
    case 'raven':
      return (
        <motion.svg
          className={base}
          width="8" height="8" viewBox="0 0 12 12"
          animate={{ y: [0, -1.5, 0] }}
          transition={{ repeat: Infinity, duration: 1.4 }}
        >
          <ellipse cx="6" cy="7" rx="4" ry="2.4" fill="#0a0a12" />
          <circle cx="8.5" cy="5" r="1.6" fill="#0a0a12" />
          <path d="M10 5 L11.5 5.4 L10 5.8 Z" fill="#c0a040" />
          <circle cx="9" cy="4.6" r="0.4" fill="#e04040" />
        </motion.svg>
      );
    case 'chain':
      return (
        <svg className={base} width="6" height="12" viewBox="0 0 10 20">
          <circle cx="5" cy="3" r="1.6" stroke="#8a8886" strokeWidth="0.8" fill="none" />
          <circle cx="5" cy="7" r="1.6" stroke="#8a8886" strokeWidth="0.8" fill="none" />
          <circle cx="5" cy="11" r="1.6" stroke="#8a8886" strokeWidth="0.8" fill="none" />
          <circle cx="5" cy="15" r="1.6" stroke="#8a8886" strokeWidth="0.8" fill="none" />
        </svg>
      );
    case 'ash':
      return (
        <svg className={base} width="14" height="4" viewBox="0 0 24 8">
          <ellipse cx="12" cy="5" rx="10" ry="2" fill="#4a4442" opacity="0.7" />
          <circle cx="6" cy="4" r="0.5" fill="#8a7870" />
          <circle cx="14" cy="5" r="0.5" fill="#8a7870" />
          <circle cx="19" cy="4" r="0.5" fill="#8a7870" />
        </svg>
      );
    case 'cracked_ground':
      return (
        <svg className={base} width="14" height="10" viewBox="0 0 24 16">
          <path d="M2 8 L8 4 L12 10 L18 6 L22 12" stroke="#3a2410" strokeWidth="0.6" fill="none" />
          <path d="M4 14 L10 10 L14 14 L20 10" stroke="#3a2410" strokeWidth="0.5" fill="none" />
        </svg>
      );
    default:
      return null;
  }
}

// ---------- camada de tiles ----------

const CORNERS = [
  { top: '3px', left: '3px' },
  { top: '3px', right: '3px' },
  { bottom: '3px', left: '3px' },
  { bottom: '3px', right: '3px' },
];

function isRoad(kind: string) {
  return kind.startsWith('road_');
}

export function TileDecorations({ room, biome }: { room: Room; biome: Biome }) {
  const decos = useMemo(() => pickTileDecos(room, biome), [room, biome]);
  if (decos.length === 0) return null;

  let cornerIdx = 0;
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
      {decos.map((kind, i) => {
        if (isRoad(kind)) return <Ornament key={i} kind={kind} tint={biome.color} />;
        const pos = CORNERS[cornerIdx % CORNERS.length];
        cornerIdx++;
        return (
          <div key={i} style={pos as any} className="absolute">
            <Ornament kind={kind} tint={biome.color} />
          </div>
        );
      })}
    </div>
  );
}

// ---------- camada de criaturas voadoras ----------

export function FlyingCreatures({ biomeColor }: { biomeColor: string }) {
  const fireflies = useMemo(() => {
    const rand = seededRand(42);
    return Array.from({ length: 12 }, (_, i) => ({
      id: i,
      startX: rand() * 100,
      startY: rand() * 100,
      duration: 6 + rand() * 6,
      delay: rand() * 4,
    }));
  }, []);

  const mosquitoes = useMemo(() => {
    const rand = seededRand(1337);
    return Array.from({ length: 7 }, (_, i) => ({
      id: i,
      startX: rand() * 100,
      startY: rand() * 100,
      duration: 3 + rand() * 3,
      delay: rand() * 2,
    }));
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
      {fireflies.map((f) => (
        <motion.div
          key={`ff-${f.id}`}
          className="absolute w-1.5 h-1.5 rounded-full"
          style={{
            left: `${f.startX}%`,
            top: `${f.startY}%`,
            backgroundColor: '#ffe066',
            boxShadow: `0 0 8px 2px ${biomeColor}, 0 0 4px #ffe066`,
          }}
          animate={{
            x: [0, 30, -20, 10, 0],
            y: [0, -20, 15, -10, 0],
            opacity: [0.2, 1, 0.4, 1, 0.2],
          }}
          transition={{
            repeat: Infinity,
            duration: f.duration,
            delay: f.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
      {mosquitoes.map((m) => (
        <motion.div
          key={`mq-${m.id}`}
          className="absolute w-1 h-1 rounded-full bg-zinc-950/80"
          style={{ left: `${m.startX}%`, top: `${m.startY}%` }}
          animate={{
            x: [0, 15, -10, 20, -5, 0],
            y: [0, -8, 12, -6, 8, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: m.duration,
            delay: m.delay,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  );
}
