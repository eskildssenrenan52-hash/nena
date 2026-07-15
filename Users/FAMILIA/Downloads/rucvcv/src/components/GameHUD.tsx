/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { Shield, Sparkles, Heart, Zap, Coins, Plus, Eye, Swords, ShieldAlert } from 'lucide-react';
import { PlayerStats } from '../types';
import { CLASSES_DATA } from '../utils/gameData';
import { soundFX } from '../utils/audio';

interface GameHUDProps {
  player: PlayerStats;
  onHeal: () => void;
  onBuyPotion: () => void;
  onBuyManaPotion: () => void;
  onUpgradeWeapon: () => void;
  onUpgradeArmor: () => void;
}

export default function GameHUD({
  player,
  onHeal,
  onBuyPotion,
  onBuyManaPotion,
  onUpgradeWeapon,
  onUpgradeArmor
}: GameHUDProps) {
  const classConfig = CLASSES_DATA[player.class];

  // Prices
  const upgradeWeaponCost = 30 + player.weaponBonus * 15;
  const upgradeArmorCost = 30 + player.armorBonus * 15;
  const potionCost = 15;

  return (
    <div className="relative w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col md:flex-row gap-6 justify-between select-none backdrop-blur-md z-10">
      {/* Player Identity and Stats */}
      <div className="flex-1 flex gap-4 items-center">
        {/* Avatar Mini Card */}
        <div className="w-16 h-16 bg-zinc-950 p-1.5 rounded-xl border border-zinc-800 flex items-center justify-center relative">
          <img
            src={`/sprites/skin-${player.class}-${player.skin}.png`}
            alt="Hero Avatar"
            className="w-full h-full object-contain filter drop-shadow-[0_0_6px_rgba(20,184,166,0.3)]"
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
          <span className="absolute -bottom-2 -right-2 bg-indigo-600 border border-indigo-400 text-[10px] font-black font-mono text-white px-1.5 py-0.5 rounded-full shadow-lg">
            Lvl {player.level}
          </span>
        </div>

        {/* Vital Info Bars */}
        <div className="flex-1 flex flex-col gap-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-extrabold text-slate-100 uppercase tracking-wider">{classConfig.name}</span>
            <span className="text-[10px] text-zinc-500 font-mono font-bold">XP: {player.xp}/{player.xpNeeded}</span>
          </div>

          {/* XP Bar */}
          <div className="h-1 bg-zinc-950 rounded overflow-hidden">
            <div className="h-full bg-indigo-500" style={{ width: `${(player.xp / player.xpNeeded) * 100}%` }} />
          </div>

          {/* HP and MP controls */}
          <div className="grid grid-cols-2 gap-3 mt-1">
            <div className="flex flex-col gap-0.5">
              <div className="flex justify-between text-[9px] font-bold text-zinc-400">
                <span className="flex items-center gap-0.5"><Heart className="w-2.5 h-2.5 text-red-500" /> HP</span>
                <span>{player.hp}/{player.maxHp}</span>
              </div>
              <div className="h-1.5 bg-zinc-950 rounded overflow-hidden">
                <div className="h-full bg-red-500 rounded-full transition-all duration-300" style={{ width: `${(player.hp / player.maxHp) * 100}%` }} />
              </div>
            </div>

            <div className="flex flex-col gap-0.5">
              <div className="flex justify-between text-[9px] font-bold text-zinc-400">
                <span className="flex items-center gap-0.5"><Zap className="w-2.5 h-2.5 text-blue-400" /> MP</span>
                <span>{player.mp}/{player.maxMp}</span>
              </div>
              <div className="h-1.5 bg-zinc-950 rounded overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full transition-all duration-300" style={{ width: `${(player.mp / player.maxMp) * 100}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Equipment and Stats detail */}
      <div className="flex-1 grid grid-cols-3 gap-3 border-t md:border-t-0 md:border-l border-zinc-800 pt-4 md:pt-0 md:pl-6">
        <div className="flex flex-col justify-center">
          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">Equipamento</span>
          <div className="text-[10px] text-slate-300 font-bold mt-1 line-clamp-1">{player.weapon}</div>
          <div className="text-[9px] font-mono text-zinc-500 mt-0.5 flex items-center gap-0.5"><Swords className="w-2.5 h-2.5" /> +{player.weaponBonus} Dano</div>
        </div>
        <div className="flex flex-col justify-center">
          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">Defesa</span>
          <div className="text-[10px] text-slate-300 font-bold mt-1 line-clamp-1">{player.armor}</div>
          <div className="text-[9px] font-mono text-zinc-500 mt-0.5 flex items-center gap-0.5"><Shield className="w-2.5 h-2.5" /> +{player.armorBonus} Defesa</div>
        </div>
        <div className="flex flex-col justify-center items-end">
          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">Bolsa</span>
          <div className="flex items-center gap-1 text-yellow-400 font-black text-sm mt-1">
            <Coins className="w-4 h-4 text-yellow-500 animate-pulse" /> {player.gold}
          </div>
          <span className="text-[9px] text-zinc-500 font-mono mt-0.5">Moedas</span>
        </div>
      </div>

      {/* Shop controls */}
      <div className="flex-1 flex flex-col justify-center gap-2 border-t md:border-t-0 md:border-l border-zinc-800 pt-4 md:pt-0 md:pl-6">
        <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">Mercador de Almas</span>
        
        <div className="flex flex-wrap gap-1.5 mt-1">
          {/* Upgrade Weapon */}
          <button
            onClick={() => {
              if (player.gold >= upgradeWeaponCost) {
                soundFX.playLevelUp();
                onUpgradeWeapon();
              } else {
                alert('Ouro insuficiente!');
              }
            }}
            disabled={player.gold < upgradeWeaponCost}
            className="flex-1 py-1 px-2.5 bg-yellow-600/10 hover:bg-yellow-600 border border-yellow-500/30 text-yellow-400 hover:text-white font-bold rounded-lg text-[9px] transition-all flex items-center justify-between cursor-pointer disabled:opacity-35 disabled:pointer-events-none"
          >
            <span>Aprimorar Arma</span>
            <span className="font-mono">{upgradeWeaponCost}g</span>
          </button>

          {/* Upgrade Armor */}
          <button
            onClick={() => {
              if (player.gold >= upgradeArmorCost) {
                soundFX.playLevelUp();
                onUpgradeArmor();
              } else {
                alert('Ouro insuficiente!');
              }
            }}
            disabled={player.gold < upgradeArmorCost}
            className="flex-1 py-1 px-2.5 bg-yellow-600/10 hover:bg-yellow-600 border border-yellow-500/30 text-yellow-400 hover:text-white font-bold rounded-lg text-[9px] transition-all flex items-center justify-between cursor-pointer disabled:opacity-35 disabled:pointer-events-none"
          >
            <span>Aprimorar Armadura</span>
            <span className="font-mono">{upgradeArmorCost}g</span>
          </button>

          {/* Buy Potions */}
          <button
            onClick={() => {
              if (player.gold >= potionCost) {
                soundFX.playChest();
                onBuyPotion();
              } else {
                alert('Ouro insuficiente!');
              }
            }}
            disabled={player.gold < potionCost}
            className="flex-1 py-1 px-2.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-slate-300 font-bold rounded-lg text-[9px] transition-all flex items-center justify-between cursor-pointer disabled:opacity-35 disabled:pointer-events-none"
          >
            <span>Comprar Poção</span>
            <span className="font-mono">{potionCost}g</span>
          </button>

          {/* Buy Mana Potions */}
          <button
            onClick={() => {
              if (player.gold >= potionCost) {
                soundFX.playChest();
                onBuyManaPotion();
              } else {
                alert('Ouro insuficiente!');
              }
            }}
            disabled={player.gold < potionCost}
            className="flex-1 py-1 px-2.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-slate-300 font-bold rounded-lg text-[9px] transition-all flex items-center justify-between cursor-pointer disabled:opacity-35 disabled:pointer-events-none"
          >
            <span>Comprar Mana</span>
            <span className="font-mono">{potionCost}g</span>
          </button>
        </div>
      </div>
    </div>
  );
}
