/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Shield, Sparkles, Flame, Moon, Zap, User, Swords } from 'lucide-react';
import { PlayerClass, PlayerSkin, Biome } from '../types';
import { CLASSES_DATA, BIOMES_DATA } from '../utils/gameData';
import { soundFX } from '../utils/audio';

interface WardrobeProps {
  onBack: () => void;
  unlockedSkins: PlayerSkin[];
  onSelectSkin: (skin: PlayerSkin) => void;
  currentSkin: PlayerSkin;
  currentClass: PlayerClass;
}

export default function Wardrobe({ onBack, unlockedSkins, onSelectSkin, currentSkin, currentClass }: WardrobeProps) {
  const [activeTab, setActiveTab] = useState<'classes' | 'skins' | 'enemies'>('classes');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [selectedBiomeIndex, setSelectedBiomeIndex] = useState<number>(0);

  const classesList = Object.keys(CLASSES_DATA) as PlayerClass[];
  const skinsList: Array<{ key: PlayerSkin; name: string; desc: string; icon: any; color: string }> = [
    { key: 'classic', name: 'Clássica', desc: 'O visual lendário padrão que iniciou a jornada.', icon: User, color: 'text-gray-400' },
    { key: 'golden', name: 'Dourada', desc: 'Forjada em ouro solar sagrado. Brilha sob a luz celestial.', icon: Sparkles, color: 'text-yellow-400' },
    { key: 'shadow', name: 'Sombria', desc: 'Infundida com essência do vazio e poeira estelar de ébano.', icon: Moon, color: 'text-purple-500' },
    { key: 'crimson', name: 'Carmesim', desc: 'Banhasse no fogo e no sangue dos tiranos caídos.', icon: Flame, color: 'text-red-500' },
    { key: 'cosmic', name: 'Cósmica', desc: 'Tecida a partir de constelações e nebulosas vivas.', icon: Zap, color: 'text-teal-400' }
  ];

  const playClick = () => {
    soundFX.playClick();
  };

  return (
    <div className="relative w-full h-full min-h-screen bg-zinc-950 text-slate-100 flex flex-col p-4 md:p-8 z-10 select-none overflow-y-auto">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-radial-at-t from-indigo-950/20 via-zinc-950 to-zinc-950 pointer-events-none z-0" />

      {/* Header */}
      <div className="flex justify-between items-center z-10 mb-8 border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-3">
          <button
            id="back-button-wardrobe"
            onClick={() => { playClick(); onBack(); }}
            className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-lg text-slate-300 hover:text-white transition-all cursor-pointer flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-teal-400 to-indigo-400 bg-clip-text text-transparent">
              Galeria de Sprites & Skins
            </h1>
            <p className="text-xs md:text-sm text-slate-400">
              Explore os arquivos de ativos gerados individualmente e equipe skins majestosas.
            </p>
          </div>
        </div>

        <div className="hidden md:flex bg-zinc-900 border border-zinc-800 rounded-lg p-1 gap-1">
          <button
            onClick={() => { playClick(); setActiveTab('classes'); setSelectedItem(null); }}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-all cursor-pointer ${activeTab === 'classes' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            Classes Base
          </button>
          <button
            onClick={() => { playClick(); setActiveTab('skins'); setSelectedItem(null); }}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-all cursor-pointer ${activeTab === 'skins' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            Skins Disponíveis
          </button>
          <button
            onClick={() => { playClick(); setActiveTab('enemies'); setSelectedItem(null); }}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-all cursor-pointer ${activeTab === 'enemies' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            Lista de Inimigos (40)
          </button>
        </div>
      </div>

      {/* Mobile Tab Selectors */}
      <div className="flex md:hidden bg-zinc-900 border border-zinc-800 rounded-lg p-1 gap-1 mb-6 z-10">
        <button
          onClick={() => { playClick(); setActiveTab('classes'); setSelectedItem(null); }}
          className={`flex-1 py-2 text-center rounded-md text-xs font-semibold transition-all cursor-pointer ${activeTab === 'classes' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
        >
          Classes
        </button>
        <button
          onClick={() => { playClick(); setActiveTab('skins'); setSelectedItem(null); }}
          className={`flex-1 py-2 text-center rounded-md text-xs font-semibold transition-all cursor-pointer ${activeTab === 'skins' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
        >
          Skins
        </button>
        <button
          onClick={() => { playClick(); setActiveTab('enemies'); setSelectedItem(null); }}
          className={`flex-1 py-2 text-center rounded-md text-xs font-semibold transition-all cursor-pointer ${activeTab === 'enemies' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
        >
          Inimigos
        </button>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 z-10 flex-1">
        {/* Left List Pane */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <AnimatePresence mode="wait">
            {activeTab === 'classes' && (
              <motion.div
                key="classes-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-2 sm:grid-cols-3 gap-4"
              >
                {classesList.map((clsKey) => {
                  const cls = CLASSES_DATA[clsKey];
                  const spriteUrl = `/sprites/classes/${clsKey}.svg`;
                  return (
                    <motion.div
                      key={clsKey}
                      whileHover={{ scale: 1.03 }}
                      onClick={() => { playClick(); setSelectedItem(clsKey); }}
                      className={`relative aspect-square bg-zinc-900 border-2 rounded-xl p-4 flex flex-col items-center justify-between cursor-pointer group transition-all duration-300 ${selectedItem === clsKey ? 'border-teal-500 shadow-xl shadow-teal-500/10 bg-zinc-800' : 'border-zinc-800 hover:border-zinc-700'}`}
                    >
                      {/* Sprite File Location Label */}
                      <span className="absolute top-2 left-2 text-[8px] font-mono text-zinc-500 bg-zinc-950 px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        /sprites/classes/{clsKey}.svg
                      </span>
                      <div className="w-24 h-24 mt-4 relative flex items-center justify-center">
                        <img
                          src={spriteUrl}
                          alt={cls.name}
                          className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(255,255,255,0.1)] group-hover:scale-110 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-bold text-slate-200 group-hover:text-teal-400 transition-colors">{cls.name}</div>
                        <div className="text-[10px] text-zinc-400 mt-0.5">Clique para detalhes</div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

            {activeTab === 'skins' && (
              <motion.div
                key="skins-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col gap-6"
              >
                <div className="bg-zinc-900/60 p-4 border border-zinc-800 rounded-lg">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Selecione uma Skin para testar em sua classe:</span>
                  <div className="text-lg font-bold text-teal-400 mt-1 capitalize">{CLASSES_DATA[currentClass].name}</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {skinsList.map((s) => {
                    const isSelected = currentSkin === s.key;
                    const isUnlocked = unlockedSkins.includes(s.key);
                    const spriteUrl = `/sprites/skins/${currentClass}_${s.key}.svg`;
                    const Icon = s.icon;

                    return (
                      <motion.div
                        key={s.key}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => {
                          playClick();
                          if (isUnlocked) {
                            onSelectSkin(s.key);
                          }
                          setSelectedItem(s.key);
                        }}
                        className={`relative bg-zinc-900 border-2 rounded-xl p-4 flex gap-4 items-center cursor-pointer transition-all ${isSelected ? 'border-teal-400 bg-zinc-800 shadow-xl' : 'border-zinc-800 hover:border-zinc-700'} ${!isUnlocked ? 'opacity-60' : ''}`}
                      >
                        <div className="w-16 h-16 bg-zinc-950 p-2 rounded-lg relative flex items-center justify-center">
                          <img
                            src={spriteUrl}
                            alt={s.name}
                            className="w-full h-full object-contain filter drop-shadow-[0_0_4px_rgba(255,255,255,0.15)]"
                            referrerPolicy="no-referrer"
                          />
                        </div>

                        <div className="flex-1 flex flex-col justify-center">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-100">{s.name}</span>
                            <Icon className={`w-4 h-4 ${s.color}`} />
                            {isSelected && (
                              <span className="text-[10px] bg-teal-500/20 text-teal-300 font-bold px-1.5 py-0.5 rounded border border-teal-500/30">
                                Equipado
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-zinc-400 mt-1">{s.desc}</p>
                          <span className="text-[8px] font-mono text-zinc-500 mt-2">
                            /sprites/skins/{currentClass}_{s.key}.svg
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {activeTab === 'enemies' && (
              <motion.div
                key="enemies-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col gap-6"
              >
                {/* Biome selector */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-zinc-800">
                  {BIOMES_DATA.map((b, idx) => (
                    <button
                      key={b.id}
                      onClick={() => { playClick(); setSelectedBiomeIndex(idx); setSelectedItem(null); }}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-all border cursor-pointer ${selectedBiomeIndex === idx ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-zinc-900 text-slate-400 border-zinc-800 hover:text-white'}`}
                    >
                      {idx + 1}. {b.name}
                    </button>
                  ))}
                </div>

                {/* Enemies list inside selected biome */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {/* Standard enemies + boss */}
                  {[
                    ...BIOMES_DATA[selectedBiomeIndex].enemies,
                    BIOMES_DATA[selectedBiomeIndex].boss
                  ].map((e) => {
                    const isBoss = 'description' in e;
                    const spriteUrl = `/sprites/enemies/${e.key}.svg`;
                    return (
                      <motion.div
                        key={e.key}
                        whileHover={{ scale: 1.03 }}
                        onClick={() => { playClick(); setSelectedItem(e.key); }}
                        className={`relative aspect-square bg-zinc-900 border-2 rounded-xl p-4 flex flex-col items-center justify-between cursor-pointer group transition-all ${selectedItem === e.key ? 'border-rose-500 bg-zinc-800 shadow-xl' : 'border-zinc-800 hover:border-zinc-700'}`}
                      >
                        <span className="absolute top-1 right-1 text-[8px] font-mono bg-zinc-950 px-1 py-0.5 rounded text-zinc-500">
                          {isBoss ? 'Chefe' : 'Inimigo'}
                        </span>
                        <div className="w-20 h-20 mt-4 flex items-center justify-center">
                          <img
                            src={spriteUrl}
                            alt={e.name}
                            className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(255,255,255,0.08)] group-hover:scale-110 transition-transform"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="text-center mt-2">
                          <div className={`text-xs font-bold ${isBoss ? 'text-rose-400' : 'text-slate-200'}`}>{e.name}</div>
                          <span className="text-[7px] font-mono text-zinc-500 block mt-1 overflow-hidden text-ellipsis whitespace-nowrap">
                            /sprites/enemies/{e.key}.svg
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Info Card Pane */}
        <div className="lg:col-span-4 flex flex-col bg-zinc-900 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/10 blur-2xl rounded-full" />
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2 mb-4 border-b border-zinc-800 pb-2">
            <Swords className="w-5 h-5 text-teal-400" />
            Especificação Técnica
          </h2>

          <AnimatePresence mode="wait">
            {selectedItem ? (
              <motion.div
                key={selectedItem}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-4 flex-1"
              >
                {/* Render Selected Object */}
                <div className="w-full aspect-video bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-center relative p-4">
                  <img
                    src={
                      activeTab === 'classes' ? `/sprites/classes/${selectedItem}.svg` :
                      activeTab === 'skins' ? `/sprites/skins/${currentClass}_${selectedItem}.svg` :
                      `/sprites/enemies/${selectedItem}.svg`
                    }
                    alt="Inspect"
                    className="h-32 w-32 object-contain filter drop-shadow-[0_0_15px_rgba(20,184,166,0.25)] animate-pulse"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="bg-zinc-950/60 p-3 rounded-lg border border-zinc-800">
                  <span className="text-[10px] font-mono text-teal-400 block mb-1">Caminho do Ativo Físico</span>
                  <code className="text-xs font-mono text-slate-300 break-all select-all">
                    {activeTab === 'classes' ? `/sprites/classes/${selectedItem}.svg` :
                     activeTab === 'skins' ? `/sprites/skins/${currentClass}_${selectedItem}.svg` :
                     `/sprites/enemies/${selectedItem}.svg`}
                  </code>
                </div>

                {activeTab === 'classes' && CLASSES_DATA[selectedItem] && (
                  <div className="flex flex-col gap-2">
                    <h3 className="text-md font-bold text-slate-100">{CLASSES_DATA[selectedItem].name}</h3>
                    <p className="text-xs text-zinc-400">{CLASSES_DATA[selectedItem].description}</p>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="bg-zinc-950 p-2 rounded border border-zinc-800 text-center">
                        <span className="text-[10px] text-zinc-500 block">HP Base</span>
                        <span className="text-xs font-bold text-emerald-400">{CLASSES_DATA[selectedItem].baseHp}</span>
                      </div>
                      <div className="bg-zinc-950 p-2 rounded border border-zinc-800 text-center">
                        <span className="text-[10px] text-zinc-500 block">Ataque Base</span>
                        <span className="text-xs font-bold text-red-400">{CLASSES_DATA[selectedItem].baseAttack}</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'skins' && (
                  <div className="flex flex-col gap-2">
                    <h3 className="text-md font-bold text-slate-100 capitalize">{selectedItem} Skin</h3>
                    <p className="text-xs text-zinc-400">
                      Visual temático especial feito sob medida. Melhora os detalhes das partículas e do brilho orbital ao redor do modelo.
                    </p>
                    <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 flex items-center justify-between text-xs mt-2">
                      <span className="text-zinc-400">Estado</span>
                      <span className={unlockedSkins.includes(selectedItem as PlayerSkin) ? 'text-teal-400 font-bold' : 'text-red-400 font-bold'}>
                        {unlockedSkins.includes(selectedItem as PlayerSkin) ? 'Desbloqueado' : 'Aguardando Desbloqueio'}
                      </span>
                    </div>
                  </div>
                )}

                {activeTab === 'enemies' && (() => {
                  const enemy = [
                    ...BIOMES_DATA[selectedBiomeIndex].enemies,
                    BIOMES_DATA[selectedBiomeIndex].boss
                  ].find(e => e.key === selectedItem);

                  if (!enemy) return null;
                  const isBoss = 'description' in enemy;

                  return (
                    <div className="flex flex-col gap-2">
                      <h3 className="text-md font-bold text-slate-100">{enemy.name}</h3>
                      <p className="text-xs text-zinc-400">
                        {isBoss
                          ? (enemy as any).description
                          : `Criatura hostil encontrada nas profundezas do bioma ${BIOMES_DATA[selectedBiomeIndex].name}. Adaptou-se para usar ataques traiçoeiros.`}
                      </p>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div className="bg-zinc-950 p-2 rounded border border-zinc-800 text-center">
                          <span className="text-[10px] text-zinc-500 block">Tipo</span>
                          <span className={`text-xs font-bold ${isBoss ? 'text-rose-400' : 'text-orange-400'}`}>
                            {isBoss ? 'Chefe de Bioma' : 'Monstro Comum'}
                          </span>
                        </div>
                        <div className="bg-zinc-950 p-2 rounded border border-zinc-800 text-center">
                          <span className="text-[10px] text-zinc-500 block">Dificuldade</span>
                          <span className="text-xs font-bold text-purple-400">
                            {isBoss ? 'Extrema' : 'Subterrânea'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </motion.div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-zinc-500 py-12">
                <User className="w-12 h-12 stroke-[1.5] text-zinc-600 mb-2 animate-bounce" />
                <p className="text-xs">Selecione qualquer card ao lado para inspecionar os detalhes do sprite e visualizar as informações do ativo.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
