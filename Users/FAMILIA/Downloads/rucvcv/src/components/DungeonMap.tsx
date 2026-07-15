/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { Shield, Sparkles, AlertTriangle, Eye, Flame, Map, Move, Compass, HelpCircle, Key, ArrowRight, RefreshCw, EyeOff } from 'lucide-react';
import { GameState, Room, Biome } from '../types';
import { soundFX } from '../utils/audio';
import { BIOMES_DATA } from '../utils/gameData';
import { TileDecorations, FlyingCreatures } from './MapDecorations';

interface DungeonMapProps {
  gameState: GameState;
  onMove: (room: Room) => void;
  onHealPotion: () => void;
  onManaPotion: () => void;
  onStairs: () => void;
  onOpenWardrobe: () => void;
  onReset: () => void;
}

export default function DungeonMap({
  gameState,
  onMove,
  onHealPotion,
  onManaPotion,
  onStairs,
  onOpenWardrobe,
  onReset
}: DungeonMapProps) {
  const { dungeonMap, playerX, playerY, player, currentFloor } = gameState;
  const size = dungeonMap.length;
  const currentBiome = gameState.currentBiomeIndex < 10 ? getBiomeByIndex(gameState.currentBiomeIndex) : getBiomeByIndex(9);

  function getBiomeByIndex(idx: number): Biome {
    // Fallback to avoid index out of bounds
    return BIOMES_DATA[idx] || BIOMES_DATA[0];
  }

  const isAdjacent = (rx: number, ry: number) => {
    const dx = Math.abs(rx - playerX);
    const dy = Math.abs(ry - playerY);
    return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
  };

  const handleRoomClick = (room: Room) => {
    if (room.x === playerX && room.y === playerY) return;
    if (isAdjacent(room.x, room.y)) {
      onMove(room);
    }
  };

  // Render correct icon for room type
  const renderRoomIcon = (room: Room) => {
    if (room.x === playerX && room.y === playerY) {
      // Return player avatar
      return (
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-8 h-8 relative flex items-center justify-center"
        >
          <img
            src={`/sprites/skin-${player.class}-${player.skin}.png`}
            alt="Hero"
            className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(20,184,166,0.8)]"
            referrerPolicy="no-referrer"
            style={{ imageRendering: "pixelated" }}
            onError={(e) => {
              const target = e.currentTarget as HTMLImageElement;
              if (target.src.includes(".png")) {
                target.src = `/sprites/organized/skins/skin-${player.class}-${player.skin}.svg`;
              } else {
                target.style.visibility = "hidden";
              }
            }}
          />
        </motion.div>
      );
    }

    if (!room.explored) {
      // In Biome 5 (Shadow Swamp), the map around is completely hidden
      if (currentBiome.id === 5 && !isAdjacent(room.x, room.y)) {
        return <EyeOff className="w-4 h-4 text-zinc-700 animate-pulse" />;
      }
      return <HelpCircle className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />;
    }

    switch (room.type) {
      case 'start':
        return <Compass className="w-5 h-5 text-teal-400" />;
      case 'chest':
        return room.chestClaimed ? (
          <span className="text-zinc-600 line-through text-xs font-mono">Vazio</span>
        ) : (
          <Key className="w-5 h-5 text-yellow-400 animate-bounce" />
        );
      case 'shrine':
        return room.shrineClaimed ? (
          <span className="text-zinc-600 line-through text-xs font-mono">Vazio</span>
        ) : (
          <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
        );
      case 'hazard':
        return <AlertTriangle className="w-5 h-5 text-orange-500 animate-bounce" />;
      case 'enemy':
        return <Flame className="w-5 h-5 text-red-500 animate-pulse" />;
      case 'boss':
        return (
          <div className="flex flex-col items-center">
            <Shield className="w-6 h-6 text-rose-500 animate-bounce" />
            <span className="text-[8px] text-rose-400 font-extrabold uppercase tracking-wide">CHEFE</span>
          </div>
        );
      case 'stairs':
        return (
          <motion.button
            whileHover={{ scale: 1.1 }}
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              onStairs();
            }}
            className="p-1.5 bg-emerald-600 hover:bg-emerald-500 border border-emerald-400 rounded-lg text-white font-bold flex items-center gap-1 shadow-lg shadow-emerald-500/20 text-xs animate-pulse cursor-pointer z-10"
          >
            Descer <ArrowRight className="w-3.5 h-3.5" />
          </motion.button>
        );
      default:
        return <span className="text-[10px] text-zinc-500 font-mono">Vazio</span>;
    }
  };

  return (
    <div className="relative flex flex-col gap-6 z-10 select-none">
      {/* Biome Title Banner */}
      <div className="relative bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="absolute top-0 left-0 w-1.5 h-full" style={{ backgroundColor: currentBiome.color }} />
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border" style={{ borderColor: currentBiome.color + '40', color: currentBiome.color, backgroundColor: currentBiome.color + '10' }}>
              Bioma {currentBiome.id}/10
            </span>
            <span className="text-xs text-zinc-400 font-mono font-medium">Subsolo {currentFloor} de 5</span>
          </div>
          <h2 className="text-2xl font-black text-slate-100 tracking-tight mt-1">
            {currentBiome.name}
          </h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-xl">
            {currentBiome.ambientEffect}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => { soundFX.playClick(); onOpenWardrobe(); }}
            className="flex-1 md:flex-none px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/30 text-indigo-300 font-bold rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Shield className="w-3.5 h-3.5" /> Ver Sprites (Wardrobe)
          </button>
          <button
            onClick={() => { if (window.confirm('Reiniciar progresso total?')) { soundFX.playClick(); onReset(); } }}
            className="p-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl text-slate-400 hover:text-white transition-all cursor-pointer flex items-center justify-center"
            title="Reiniciar Jogo"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid Layout Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Dungeon Map Section */}
        <div className="lg:col-span-8 flex flex-col gap-3">
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 md:p-6 backdrop-blur-md flex flex-col items-center">
            <div className="w-full flex justify-between items-center mb-4 border-b border-zinc-800 pb-2">
              <span className="text-xs font-bold text-zinc-400 flex items-center gap-1.5 uppercase tracking-wide">
                <Map className="w-4 h-4 text-teal-400" /> Explorar Labirinto ({size}x{size})
              </span>
              <span className="text-[10px] font-mono text-zinc-500">Clique nas salas adjacentes iluminadas para se mover</span>
            </div>

            {/* Matrix Grid */}
            <div className="relative w-full max-w-xl aspect-square">
              <FlyingCreatures biomeColor={currentBiome.color} />
              <div
                className="relative grid gap-2 w-full h-full"
                style={{
                  gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
                }}
              >
              {dungeonMap.map((row) =>
                row.map((room) => {
                  const isCurrent = room.x === playerX && room.y === playerY;
                  const canMove = isAdjacent(room.x, room.y);
                  const isExplored = room.explored;

                  let tileBg = 'bg-zinc-950/80 border-zinc-900';
                  if (isCurrent) {
                    tileBg = 'bg-teal-950/40 border-teal-500 shadow-lg shadow-teal-500/10';
                  } else if (isExplored) {
                    tileBg = 'bg-zinc-900 border-zinc-800 hover:bg-zinc-850';
                  } else if (canMove) {
                    tileBg = 'bg-zinc-900/30 border-dashed border-zinc-700 cursor-pointer hover:border-teal-500/50 hover:bg-zinc-850/50';
                  }

                  return (
                    <motion.div
                      key={`${room.x}-${room.y}`}
                      whileHover={canMove ? { scale: 1.04 } : {}}
                      onClick={() => handleRoomClick(room)}
                      className={`relative rounded-xl border-2 flex items-center justify-center transition-all duration-200 group ${tileBg}`}
                    >
                      <TileDecorations room={room} biome={currentBiome} />
                      {/* Compass Coordinate */}
                      <span className="absolute bottom-1 right-1 text-[8px] font-mono text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        {room.x},{room.y}
                      </span>
                      <div className="relative z-10">{renderRoomIcon(room)}</div>
                    </motion.div>
                  );
                })
              )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Status Panel */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Environment Hazard Watch */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-orange-500/5 blur-xl rounded-full" />
            <h3 className="text-sm font-black uppercase tracking-widest text-orange-400 flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-orange-500 animate-pulse" />
              Mecânica do Bioma
            </h3>
            <div className="text-xs text-slate-200 font-bold">{currentBiome.hazardName}</div>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              {currentBiome.hazardDescription}
            </p>
          </div>

          {/* Quick Inventory Controls */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <h3 className="text-sm font-black uppercase tracking-widest text-teal-400 flex items-center gap-1.5 mb-4">
              <Move className="w-4 h-4" /> Consumíveis Rápidos
            </h3>

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                <div>
                  <div className="text-xs font-bold text-slate-200">Poção de Vida ({player.potions})</div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">Recupera 50 HP instantaneamente</div>
                </div>
                <button
                  onClick={() => {
                    if (player.potions > 0 && player.hp < player.maxHp) {
                      soundFX.playHeal();
                      onHealPotion();
                    } else if (player.potions === 0) {
                      alert('Sem poções!');
                    } else {
                      alert('HP já está cheio!');
                    }
                  }}
                  disabled={player.potions === 0}
                  className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white font-bold rounded-lg text-xs border border-emerald-500/30 transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                >
                  Usar
                </button>
              </div>

              <div className="flex items-center justify-between bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                <div>
                  <div className="text-xs font-bold text-slate-200">Poção de Mana ({player.manaPotions})</div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">Recupera 30 MP instantaneamente</div>
                </div>
                <button
                  onClick={() => {
                    if (player.manaPotions > 0 && player.mp < player.maxMp) {
                      soundFX.playHeal();
                      onManaPotion();
                    } else if (player.manaPotions === 0) {
                      alert('Sem poções!');
                    } else {
                      alert('Mana já está cheia!');
                    }
                  }}
                  disabled={player.manaPotions === 0}
                  className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white font-bold rounded-lg text-xs border border-blue-500/30 transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                >
                  Usar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
