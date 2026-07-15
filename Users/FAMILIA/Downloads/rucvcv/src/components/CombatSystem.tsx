/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Swords, Shield, Heart, Sparkles, Zap, Flame, AlertCircle } from 'lucide-react';
import { PlayerStats, Enemy, Biome, Skill } from '../types';
import { CLASSES_DATA } from '../utils/gameData';
import { soundFX } from '../utils/audio';

interface CombatSystemProps {
  player: PlayerStats;
  enemy: Enemy;
  activeBiome: Biome;
  onVictory: (xpEarned: number, goldEarned: number) => void;
  onDefeat: () => void;
  onUpdatePlayerStats: (stats: Partial<PlayerStats>) => void;
}

interface FloatingText {
  id: number;
  text: string;
  type: 'damage' | 'heal' | 'mana' | 'crit' | 'miss';
  x: number; // percentage offset
  y: number;
}

export default function CombatSystem({
  player,
  enemy,
  activeBiome,
  onVictory,
  onDefeat,
  onUpdatePlayerStats
}: CombatSystemProps) {
  const [enemyHp, setEnemyHp] = useState(enemy.hp);
  const [playerHp, setPlayerHp] = useState(player.hp);
  const [playerMp, setPlayerMp] = useState(player.mp);
  const [combatLogs, setCombatLogs] = useState<string[]>([`Um selvagem ${enemy.name} bloqueia seu caminho!`]);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [playerShake, setPlayerShake] = useState(false);
  const [enemyShake, setEnemyShake] = useState(false);
  const [playerActionAnim, setPlayerActionAnim] = useState('');
  const [enemyActionAnim, setEnemyActionAnim] = useState('');

  const classConfig = CLASSES_DATA[player.class];

  // Helper to spawn floating text
  const spawnFloatingText = (text: string, type: 'damage' | 'heal' | 'mana' | 'crit' | 'miss', isPlayer: boolean) => {
    const id = Date.now() + Math.random();
    const newText: FloatingText = {
      id,
      text,
      type,
      x: isPlayer ? 30 + (Math.random() - 0.5) * 10 : 70 + (Math.random() - 0.5) * 10,
      y: 40 + (Math.random() - 0.5) * 10
    };
    setFloatingTexts((prev) => [...prev, newText]);
  };

  // Check death states
  useEffect(() => {
    if (enemyHp <= 0) {
      soundFX.playChest();
      addLog(`✨ Vitória! Você derrotou ${enemy.name}!`);
      setTimeout(() => {
        onVictory(enemy.xpReward, enemy.goldReward);
      }, 1500);
    }
  }, [enemyHp]);

  useEffect(() => {
    if (playerHp <= 0) {
      soundFX.playDeath();
      addLog(`💀 Você foi derrotado por ${enemy.name}...`);
      setTimeout(() => {
        onDefeat();
      }, 1500);
    }
  }, [playerHp]);

  const addLog = (msg: string) => {
    setCombatLogs((prev) => [msg, ...prev.slice(0, 10)]);
  };

  const executeEnemyTurn = () => {
    if (enemyHp <= 0 || playerHp <= 0) return;

    setTimeout(() => {
      // Enemy attack calculation
      const isMiss = Math.random() < 0.1; // 10% dodge chance from background or agile movement
      if (isMiss) {
        spawnFloatingText('ESQUIVOU!', 'miss', true);
        addLog(`💨 Você esquivou habilidosamente do ataque de ${enemy.name}!`);
        setIsPlayerTurn(true);
        return;
      }

      // Check if biome is frozen and slows down or affects enemy
      let enemyAtk = enemy.attack;
      let isCrit = Math.random() < 0.15;
      if (isCrit) {
        enemyAtk = Math.floor(enemyAtk * 1.5);
      }

      const damageTaken = Math.max(1, Math.floor(enemyAtk - player.defense - (player.armorBonus)));
      const nextHp = Math.max(0, playerHp - damageTaken);

      setPlayerHp(nextHp);
      onUpdatePlayerStats({ hp: nextHp });

      // Visual shaking and sound
      setPlayerShake(true);
      setTimeout(() => setPlayerShake(false), 300);
      setEnemyActionAnim('enemy-attack');
      setTimeout(() => setEnemyActionAnim(''), 400);

      if (isCrit) {
        soundFX.playCrit();
        spawnFloatingText(`-${damageTaken} CRÍTICO!`, 'crit', true);
        addLog(`💥 CRÍTICO! ${enemy.name} atacou ferozmente causando ${damageTaken} de dano!`);
      } else {
        soundFX.playHit();
        spawnFloatingText(`-${damageTaken}`, 'damage', true);
        addLog(`⚔️ ${enemy.name} atacou e causou ${damageTaken} de dano.`);
      }

      setIsPlayerTurn(true);
    }, 1200);
  };

  const handleBaseAttack = () => {
    if (!isPlayerTurn || playerHp <= 0 || enemyHp <= 0) return;
    setIsPlayerTurn(false);

    // Player attack
    let isCrit = Math.random() < 0.20; // 20% critical chance
    let baseAtk = player.attack + player.weaponBonus;

    // Apply Citadel of Chaos fluctuating damage mechanic (Biome 10)
    if (activeBiome.id === 10) {
      const multiplier = 0.5 + Math.random() * 1.5; // between 50% and 200%
      baseAtk = Math.floor(baseAtk * multiplier);
    }

    if (isCrit) {
      baseAtk = Math.floor(baseAtk * 1.8);
    }

    const damageDealt = Math.max(1, Math.floor(baseAtk - enemy.defense));
    const nextHp = Math.max(0, enemyHp - damageDealt);

    setEnemyHp(nextHp);

    setEnemyShake(true);
    setTimeout(() => setEnemyShake(false), 300);
    setPlayerActionAnim('player-attack');
    setTimeout(() => setPlayerActionAnim(''), 400);

    if (isCrit) {
      soundFX.playCrit();
      spawnFloatingText(`-${damageDealt} CRÍTICO!`, 'crit', false);
      addLog(`💥 Golpe Crítico! Você causou ${damageDealt} de dano em ${enemy.name}!`);
    } else {
      soundFX.playHit();
      spawnFloatingText(`-${damageDealt}`, 'damage', false);
      addLog(`⚔️ Você desferiu um ataque preciso, causando ${damageDealt} de dano.`);
    }

    executeEnemyTurn();
  };

  const handleSkillUsage = (skill: Skill) => {
    if (!isPlayerTurn || playerHp <= 0 || enemyHp <= 0) return;
    if (playerMp < skill.cost) {
      alert('Mana insuficiente!');
      return;
    }

    setIsPlayerTurn(false);

    // Consume Mana
    const nextMp = playerMp - skill.cost;
    setPlayerMp(nextMp);
    onUpdatePlayerStats({ mp: nextMp });

    // Handle Skill Effects
    if (skill.type === 'damage') {
      let skillDmg = Math.floor((player.attack + player.weaponBonus) * skill.damageMultiplier);
      const finalDmg = Math.max(1, Math.floor(skillDmg - enemy.defense));
      const nextHp = Math.max(0, enemyHp - finalDmg);

      setEnemyHp(nextHp);
      setEnemyShake(true);
      setTimeout(() => setEnemyShake(false), 300);
      setPlayerActionAnim('player-cast');
      setTimeout(() => setPlayerActionAnim(''), 400);

      soundFX.playCrit();
      spawnFloatingText(`-${finalDmg}`, 'crit', false);
      addLog(`🔮 Você conjurou [${skill.name}] causando ${finalDmg} de dano mágico!`);

      // Special life steal / healing effect for Cleric's Divina Punição
      if (skill.healMultiplier > 0) {
        const lifesteal = Math.floor(finalDmg * skill.healMultiplier);
        const healedHp = Math.min(player.maxHp, playerHp + lifesteal);
        setPlayerHp(healedHp);
        onUpdatePlayerStats({ hp: healedHp });
        spawnFloatingText(`+${lifesteal}`, 'heal', true);
        addLog(`💚 [${skill.name}] drenou ${lifesteal} de vida para você.`);
      }
    } else if (skill.type === 'heal' || skill.type === 'buff') {
      let healAmount = Math.floor(player.maxHp * skill.healMultiplier);
      const nextHp = Math.min(player.maxHp, playerHp + healAmount);

      setPlayerHp(nextHp);
      onUpdatePlayerStats({ hp: nextHp });
      setPlayerActionAnim('player-cast');
      setTimeout(() => setPlayerActionAnim(''), 400);

      soundFX.playHeal();
      spawnFloatingText(`+${healAmount}`, 'heal', true);
      addLog(`🛡️ Você utilizou [${skill.name}] e recuperou ${healAmount} de HP.`);
    }

    executeEnemyTurn();
  };

  return (
    <div className="relative w-full h-full min-h-[500px] bg-zinc-950/90 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-6 select-none overflow-hidden backdrop-blur-md z-10">
      {/* Glow Ambient background based on Biome */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-950/20 to-zinc-950 pointer-events-none" />

      {/* Floating combat numbers */}
      <div className="absolute inset-0 pointer-events-none z-30">
        <AnimatePresence>
          {floatingTexts.map((ft) => (
            <motion.div
              key={ft.id}
              initial={{ opacity: 1, y: ft.y, scale: 0.8 }}
              animate={{ opacity: 0, y: ft.y - 60, scale: 1.2 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              onAnimationComplete={() => {
                setFloatingTexts((prev) => prev.filter((t) => t.id !== ft.id));
              }}
              className="absolute font-black text-lg md:text-xl tracking-tight z-50 drop-shadow-[0_2px_4px_rgba(0,0,0,1)]"
              style={{ left: `${ft.x}%` }}
            >
              <span
                className={
                  ft.type === 'damage' ? 'text-red-500' :
                  ft.type === 'heal' ? 'text-emerald-400' :
                  ft.type === 'crit' ? 'text-yellow-400 font-extrabold text-2xl animate-bounce' :
                  'text-slate-300'
                }
              >
                {ft.text}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Arena Split-Screen Screen */}
      <div className="grid grid-cols-2 gap-4 md:gap-12 flex-1 items-center py-6 min-h-[220px]">
        {/* Left Side: Player */}
        <motion.div
          animate={
            playerShake ? { x: [-10, 10, -10, 10, 0] } :
            playerActionAnim === 'player-attack' ? { x: [0, 40, 0] } :
            playerActionAnim === 'player-cast' ? { scale: [1, 1.1, 1], y: [-10, 0] } : {}
          }
          transition={{ duration: playerShake ? 0.3 : 0.4 }}
          className="flex flex-col items-center justify-center gap-4 relative"
        >
          {/* delayed hp indicator & raw values */}
          <div className="w-full max-w-[180px] bg-zinc-900 border border-zinc-800 rounded-lg p-2 flex flex-col gap-1.5 relative">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Herói</span>
            <div className="h-2 bg-zinc-950 rounded overflow-hidden relative">
              <motion.div
                initial={{ width: `${(playerHp / player.maxHp) * 100}%` }}
                animate={{ width: `${(playerHp / player.maxHp) * 100}%` }}
                className="h-full bg-emerald-500 rounded-full"
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-zinc-400">
              <span>HP: {playerHp}/{player.maxHp}</span>
              <span>MP: {playerMp}/{player.maxMp}</span>
            </div>
          </div>

          {/* Model avatar img */}
          <div className="w-28 h-28 md:w-36 md:h-36 relative flex items-center justify-center">
            <img
              src={`/sprites/skin-${player.class}-${player.skin}.png`}
              alt="Player Class"
              className="w-full h-full object-contain filter drop-shadow-[0_0_12px_rgba(20,184,166,0.3)]"
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
          </div>
          <span className="text-xs font-bold text-slate-300 capitalize">{CLASSES_DATA[player.class].name} ({player.skin})</span>
        </motion.div>

        {/* Right Side: Enemy */}
        <motion.div
          animate={
            enemyShake ? { x: [10, -10, 10, -10, 0] } :
            enemyActionAnim === 'enemy-attack' ? { x: [0, -40, 0] } : {}
          }
          transition={{ duration: enemyShake ? 0.3 : 0.4 }}
          className="flex flex-col items-center justify-center gap-4 relative"
        >
          {/* delayed hp indicator & raw values */}
          <div className="w-full max-w-[180px] bg-zinc-900 border border-zinc-800 rounded-lg p-2 flex flex-col gap-1.5 relative">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">{enemy.isBoss ? 'Chefe de Elite' : 'Monstro'}</span>
            <div className="h-2 bg-zinc-950 rounded overflow-hidden">
              <motion.div
                initial={{ width: `${(enemyHp / enemy.hp) * 100}%` }}
                animate={{ width: `${(enemyHp / enemy.hp) * 100}%` }}
                className="h-full bg-red-500 rounded-full"
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-zinc-400">
              <span>{enemy.name}</span>
              <span>HP: {enemyHp}/{enemy.hp}</span>
            </div>
          </div>

          {/* Model avatar img */}
          <div className="w-28 h-28 md:w-36 md:h-36 relative flex items-center justify-center">
            <img
              src={`/sprites/${enemy.key}.png`}
              alt={enemy.name}
              className="w-full h-full object-contain filter drop-shadow-[0_0_12px_rgba(239,68,68,0.25)]"
              referrerPolicy="no-referrer"
              style={{ imageRendering: "pixelated" }}
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                if (target.src.includes(".png")) {
                  target.src = `/sprites/organized/enemies/${enemy.key.replace(/_/g, "-")}.svg`;
                } else if (target.src.includes(".svg")) {
                  target.src = `/sprites/enemies/${enemy.key}.svg`;
                } else {
                  target.style.visibility = "hidden";
                }
              }}
            />
          </div>
          <span className={`text-xs font-bold capitalize ${enemy.isBoss ? 'text-rose-400' : 'text-slate-300'}`}>{enemy.name}</span>
        </motion.div>
      </div>

      {/* Bottom Command Center */}
      <div className="border-t border-zinc-800 pt-6 flex flex-col md:grid md:grid-cols-12 gap-6 z-10">
        {/* Left Side: Skills & Command Buttons */}
        <div className="md:col-span-8 flex flex-col gap-3">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Ações do Turno</span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {/* Standard attack */}
            <button
              onClick={handleBaseAttack}
              disabled={!isPlayerTurn || playerHp <= 0 || enemyHp <= 0}
              className="py-3 px-4 bg-red-600 hover:bg-red-500 disabled:opacity-30 disabled:pointer-events-none text-white font-black rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-red-500/10 border border-red-400/20"
            >
              <Swords className="w-4 h-4" /> Ataque Físico
            </button>

            {/* Class Skill 1 */}
            {classConfig.skills.map((skill, idx) => (
              <button
                key={idx}
                onClick={() => handleSkillUsage(skill)}
                disabled={!isPlayerTurn || playerHp <= 0 || enemyHp <= 0 || playerMp < skill.cost}
                className="py-3 px-4 bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/30 text-indigo-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none font-black rounded-xl text-xs transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer"
                title={skill.description}
              >
                <div className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> {skill.name}
                </div>
                <div className="text-[9px] font-mono text-indigo-400 flex items-center gap-0.5">
                  <Zap className="w-2.5 h-2.5" /> {skill.cost} MP
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: Combat Feed logs */}
        <div className="md:col-span-4 flex flex-col gap-2">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Registro de Batalha</span>
          <div className="bg-zinc-950 rounded-xl p-3 border border-zinc-800 h-24 overflow-y-auto text-[11px] font-mono text-zinc-400 flex flex-col gap-1.5 scrollbar-none relative">
            <div className="absolute bottom-0 left-0 w-full h-4 bg-gradient-to-t from-zinc-950 to-transparent pointer-events-none" />
            {combatLogs.map((log, idx) => (
              <div key={idx} className={idx === 0 ? 'text-slate-200 font-bold' : ''}>
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
