/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import { Play, Sparkles, Swords, Wand2, Footprints, ShieldCheck, Target } from 'lucide-react';
import { PlayerClass, PlayerSkin } from '../types';
import { CLASSES_DATA } from '../utils/gameData';
import { soundFX } from '../utils/audio';

interface CharacterSelectionProps {
  onStart: (playerClass: PlayerClass, playerSkin: PlayerSkin) => void;
}

export default function CharacterSelection({ onStart }: CharacterSelectionProps) {
  const [selectedClass, setSelectedClass] = useState<PlayerClass>('warrior');
  const [selectedSkin, setSelectedSkin] = useState<PlayerSkin>('classic');

  const classesList = Object.keys(CLASSES_DATA) as PlayerClass[];
  const skinsList: Array<{ key: PlayerSkin; name: string; color: string }> = [
    { key: 'classic', name: 'Clássico', color: 'bg-zinc-800 border-zinc-700 text-slate-300' },
    { key: 'golden', name: 'Dourado', color: 'bg-yellow-950/40 border-yellow-500 text-yellow-300' },
    { key: 'shadow', name: 'Sombrio', color: 'bg-purple-950/40 border-purple-500 text-purple-300' },
    { key: 'crimson', name: 'Carmesim', color: 'bg-red-950/40 border-red-500 text-red-300' },
    { key: 'cosmic', name: 'Cósmico', color: 'bg-teal-950/40 border-teal-500 text-teal-300' },
    { key: 'infernal', name: 'Infernal', color: 'bg-orange-950/40 border-orange-500 text-orange-300' },
    { key: 'celestial', name: 'Celestial', color: 'bg-sky-950/40 border-sky-300 text-sky-200' }
  ];
  const isPngSkin = (s: PlayerSkin) => s === 'infernal' || s === 'celestial';

  const getClassIcon = (cls: PlayerClass) => {
    switch (cls) {
      case 'warrior': return <Swords className="w-5 h-5 text-red-500" />;
      case 'mage': return <Wand2 className="w-5 h-5 text-blue-500" />;
      case 'rogue': return <Footprints className="w-5 h-5 text-emerald-500" />;
      case 'cleric': return <ShieldCheck className="w-5 h-5 text-orange-500" />;
      case 'ranger': return <Target className="w-5 h-5 text-purple-500" />;
    }
  };

  const handleStartGame = () => {
    soundFX.playLevelUp();
    onStart(selectedClass, selectedSkin);
  };

  return (
    <div className="relative w-full max-w-4xl bg-zinc-900/60 border border-zinc-800 rounded-3xl p-6 md:p-10 backdrop-blur-md flex flex-col gap-8 z-10 select-none overflow-hidden">
      {/* Glow Backing */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-teal-500/10 blur-3xl rounded-full" />

      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-teal-400 via-indigo-400 to-rose-400 bg-clip-text text-transparent">
          AETHES
        </h1>
        <p className="text-sm md:text-base text-slate-400 mt-2 max-w-xl mx-auto leading-relaxed">
          Os 10 Biomas Sagrados aguardam seu sacrifício. Escolha seu herói e adentre as profundezas insaciáveis do labirinto eterno.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left list: Classes selectors */}
        <div className="md:col-span-4 flex flex-col gap-3">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Escolha sua Classe</span>
          {classesList.map((clsKey) => {
            const cls = CLASSES_DATA[clsKey];
            const isSelected = selectedClass === clsKey;
            return (
              <motion.button
                key={clsKey}
                whileHover={{ x: 4 }}
                onClick={() => { soundFX.playClick(); setSelectedClass(clsKey); }}
                className={`w-full p-3.5 rounded-xl border-2 flex items-center justify-between text-left transition-all cursor-pointer ${isSelected ? 'border-teal-500 bg-zinc-800 shadow-xl shadow-teal-500/5' : 'border-zinc-800 hover:border-zinc-700 bg-zinc-950/40'}`}
              >
                <div className="flex items-center gap-3">
                  {getClassIcon(clsKey)}
                  <div>
                    <span className="text-sm font-black text-slate-200 block">{cls.name}</span>
                    <span className="text-[10px] text-zinc-500 font-medium">Equipamento: {cls.weaponName}</span>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Center: Skin and Model preview */}
        <div className="md:col-span-5 flex flex-col items-center justify-center p-6 bg-zinc-950/60 border border-zinc-800 rounded-2xl relative min-h-[280px]">
          <span className="absolute top-2 left-2 text-[10px] font-mono text-zinc-500">Visualização do Ativo</span>
          
          <div className="w-40 h-40 relative flex items-center justify-center mt-4">
            <img
              src={`/sprites/skins/${selectedClass}_${selectedSkin}.${isPngSkin(selectedSkin) ? 'png' : 'svg'}`}
              alt="Class Avatar Preview"
              className="w-full h-full object-contain filter drop-shadow-[0_0_15px_rgba(20,184,166,0.25)] animate-pulse"
              referrerPolicy="no-referrer"
              onError={(e) => {
                const img = e.currentTarget;
                if (!img.src.endsWith('.svg')) {
                  img.src = `/sprites/skins/${selectedClass}_classic.svg`;
                }
              }}
            />
          </div>

          <div className="flex flex-wrap gap-1.5 justify-center mt-6">
            {skinsList.map((sk) => (
              <button
                key={sk.key}
                onClick={() => { soundFX.playClick(); setSelectedSkin(sk.key); }}
                className={`px-3 py-1 text-xs font-bold rounded-lg border cursor-pointer transition-all ${selectedSkin === sk.key ? 'bg-indigo-600 text-white border-indigo-500 scale-105 shadow-md shadow-indigo-500/20' : 'bg-zinc-900 text-slate-400 border-zinc-800 hover:text-white'}`}
              >
                {sk.name}
              </button>
            ))}
          </div>
        </div>

        {/* Right Info: Class properties */}
        <div className="md:col-span-3 flex flex-col gap-4 bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <div>
            <h3 className="text-md font-bold text-slate-200 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-teal-400" />
              {CLASSES_DATA[selectedClass].name}
            </h3>
            <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
              {CLASSES_DATA[selectedClass].description}
            </p>
          </div>

          <div className="border-t border-zinc-800 pt-3 flex flex-col gap-2">
            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">Atributos Iniciais</span>
            <div className="flex justify-between text-xs font-mono text-zinc-400">
              <span>Vida Máxima:</span>
              <span className="font-bold text-emerald-400">{CLASSES_DATA[selectedClass].baseHp}</span>
            </div>
            <div className="flex justify-between text-xs font-mono text-zinc-400">
              <span>Mana Máxima:</span>
              <span className="font-bold text-blue-400">{CLASSES_DATA[selectedClass].baseMp}</span>
            </div>
            <div className="flex justify-between text-xs font-mono text-zinc-400">
              <span>Dano Base:</span>
              <span className="font-bold text-red-400">{CLASSES_DATA[selectedClass].baseAttack}</span>
            </div>
            <div className="flex justify-between text-xs font-mono text-zinc-400">
              <span>Defesa Base:</span>
              <span className="font-bold text-slate-400">{CLASSES_DATA[selectedClass].baseDefense}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Play CTA */}
      <button
        id="play-button"
        onClick={handleStartGame}
        className="w-full py-4 bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white font-black rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xl shadow-indigo-500/20 text-sm md:text-base"
      >
        <Play className="w-5 h-5 fill-current" /> Começar Jornada
      </button>
    </div>
  );
}
