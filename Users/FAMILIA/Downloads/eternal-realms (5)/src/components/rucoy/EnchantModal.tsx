// Enchantment & Blacksmith hub. Lets the player:
//   1. RUNAS: Socket ancient runes into their currently-equipped weapon / armor.
//   2. APRIMORAR: Upgrade weapon / armor up to +20 with success rates, regression protection, gold and gem booster options!
//   3. ATRIBUTOS: Roll 1-3 randomized high-tier stats (Speed, Crit %, XP %, Gold %, Life Steal %) based on item rarity!
//   4. DESMONTAR: Melt down unwanted equipment into Rune Shards to recycle items!

import { useState } from "react";
import { ALL_ITEMS, type Item, RARITY_COLOR } from "@/rucoy/items";
import { useOverlayState, setOverlayState } from "@/rucoy/store";
import {
  useSkillsStore,
  getActiveCharacter,
  socketRune,
  unsocketRune,
  setTransmog,
  maxSocketsForRarity,
  upgradeItemEnchant,
  rerollItemStats,
  getUpgradeGoldCost,
  getUpgradeSuccessRate,
} from "@/rucoy/skills";
import { useHostedGame, useHostedTick } from "@/game/host";
import { ANCIENT_RUNES, runeTierLabel, type OwnedRune } from "@/game/ancientRunes";
import { PIXEL_FONT, PIXEL_GOLD, PIXEL_BORDER, PixelPanel, PixelButton } from "./ui/pixel";
import { enqueueReward } from "@/rucoy/bridge";
import { Sparkles, Hammer, RefreshCw, Flame, Trash2 } from "lucide-react";

function itemById(id: string | undefined): Item | undefined {
  if (!id) return undefined;
  return ALL_ITEMS.find((i) => i.id === id);
}

// Get title based on blacksmith level
function getBlacksmithTitle(lvl: number): string {
  if (lvl >= 15) return "👑 DEUS DA FORJA";
  if (lvl >= 10) return "🔥 GRÃO-MESTRE FERREIRO";
  if (lvl >= 7) return "⚒️ FERREIRO SÊNIOR";
  if (lvl >= 4) return "🔨 FORJADOR PROMISSOR";
  return "🪵 APRENDIZ DE FERREIRO";
}

export default function EnchantModal() {
  useSkillsStore();
  useHostedTick(400);
  const overlay = useOverlayState();
  const g = useHostedGame();
  const c = getActiveCharacter();

  const [activeTab, setActiveTab] = useState<"runas" | "aprimorar" | "reroll" | "desmontar">("runas");
  const [pickerSlot, setPickerSlot] = useState<"weapon" | "armor" | null>(null);
  const [transmogPicker, setTransmogPicker] = useState<"weapon" | "armor" | null>(null);

  // Upgrade state
  const [useLuckGem, setUseLuckGem] = useState(false);
  const [blacksmithMessage, setBlacksmithMessage] = useState<string | null>(null);
  const [blacksmithStatus, setBlacksmithStatus] = useState<"success" | "fail" | null>(null);
  const [isAnimate, setIsAnimate] = useState(false);
  const [forgeHeat, setForgeHeat] = useState(30); // Dynamic temperature gauge

  // Reroll state
  const [rerollMessage, setRerollMessage] = useState<string | null>(null);

  const playerGold = g?.player?.gold ?? 0;
  const userGems = overlay.gems || 0;
  const runeShards = overlay.shards || 0;
  const smithLvl = overlay.blacksmithLvl || 1;

  const equippedItems: { slot: "weapon" | "armor"; item: Item | undefined }[] = [
    { slot: "weapon", item: itemById(overlay.equipped.weapon) },
    { slot: "armor", item: itemById(overlay.equipped.chest) },
  ];

  const inventoryItems = overlay.inventory
    .map((id) => itemById(id))
    .filter((it): it is Item => it !== undefined);

  const ownedRunes: OwnedRune[] = g?.player?.runes ?? [];
  const socketedUids = new Set<string>();
  for (const list of Object.values(c.sockets)) {
    for (const uid of list) {
      socketedUids.add(uid);
    }
  }
  const freeRunes = ownedRunes.filter((r) => !socketedUids.has(r.uid));

  const handleUpgrade = (slot: "weapon" | "armor", item: Item) => {
    const currentLvl = c.enchants[item.id] || 0;
    if (currentLvl >= 20) {
      setBlacksmithMessage("O item já está no nível máximo (+20)!");
      setBlacksmithStatus("fail");
      return;
    }

    const goldCost = getUpgradeGoldCost(currentLvl);
    if (playerGold < goldCost) {
      setBlacksmithMessage("Ouro insuficiente para aprimorar!");
      setBlacksmithStatus("fail");
      return;
    }

    if (useLuckGem && userGems < 5) {
      setBlacksmithMessage("Gemas insuficientes para usar a Gema de Sorte!");
      setBlacksmithStatus("fail");
      return;
    }

    // Trigger animation
    setIsAnimate(true);
    setForgeHeat((prev) => Math.min(100, prev + 15)); // Heat up the forge!
    setBlacksmithMessage("Ferreiro trabalhando... 🔨💥");
    setBlacksmithStatus(null);

    setTimeout(() => {
      setIsAnimate(false);

      // Deduct resources
      enqueueReward({ kind: "gold", amount: -goldCost });
      if (useLuckGem) {
        setOverlayState((cs) => ({ ...cs, gems: cs.gems - 5 }));
      }

      // Perform upgrade
      const res = upgradeItemEnchant(item.id, useLuckGem);
      setBlacksmithMessage(res.message);
      setBlacksmithStatus(res.success ? "success" : "fail");

      // Handle blacksmith mastery XP on success
      if (res.success) {
        setOverlayState((cs) => {
          const lvl = cs.blacksmithLvl || 1;
          const upChance = Math.random() < 0.4; // 40% chance of level up on successful forge
          return {
            ...cs,
            blacksmithLvl: lvl + (upChance ? 1 : 0),
          };
        });
      }
    }, 1200);
  };

  const handleReroll = (slot: "weapon" | "armor", item: Item) => {
    const rerollCost = 2500;
    if (playerGold < rerollCost) {
      setRerollMessage("Ouro insuficiente para re-rolar atributos!");
      return;
    }

    if (item.rarity === "common" || item.rarity === "uncommon") {
      setRerollMessage("Apenas itens de raridade Rara ou superior podem possuir atributos adicionais!");
      return;
    }

    enqueueReward({ kind: "gold", amount: -rerollCost });
    const res = rerollItemStats(item.id, item.rarity);
    setRerollMessage(res.message);
    setTimeout(() => setRerollMessage(null), 3000);
  };

  // Melting system (Meltdown unwanted items to shards)
  const handleMeltDown = (item: Item) => {
    const yields: Record<string, number> = {
      common: 1,
      uncommon: 3,
      rare: 8,
      epic: 20,
      legendary: 55,
      mythic: 130,
    };
    const rewardAmt = yields[item.rarity] || 1;

    setOverlayState((cs) => {
      const idx = cs.inventory.indexOf(item.id);
      if (idx < 0) return cs;
      const nextInv = [...cs.inventory];
      nextInv.splice(idx, 1);

      // Unequip if equipped
      const nextEquipped = { ...cs.equipped };
      if (nextEquipped.weapon === item.id) delete nextEquipped.weapon;
      if (nextEquipped.chest === item.id) delete nextEquipped.chest;

      const currentShards = cs.shards || 0;
      return {
        ...cs,
        inventory: nextInv,
        equipped: nextEquipped,
        shards: currentShards + rewardAmt,
      };
    });

    setRerollMessage(`🔥 ${item.name.toUpperCase()} foi derretido em +${rewardAmt} ESTILHAÇOS RÚNICOS!`);
    setTimeout(() => setRerollMessage(null), 3000);
  };

  const handleExchangeShards = () => {
    if (runeShards < 30) {
      setRerollMessage("Você precisa de pelo menos 30 Estilhaços Rúnicos para trocar!");
      return;
    }

    setOverlayState((cs) => ({
      ...cs,
      shards: (cs.shards || 0) - 30,
      gems: cs.gems + 5, // Gives 5 gems for luck gem boosters
    }));

    setRerollMessage("🔮 TROCA EFETUADA! +5 💎 GEMAS ADICIONADAS PARA O BOOST DA FORJA!");
    setTimeout(() => setRerollMessage(null), 3500);
  };

  return (
    <div style={{ fontFamily: PIXEL_FONT, color: "#e8d8a8", fontSize: 10 }}>
      {/* Wallet Display Bar (Enhanced with shards) */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-stone-950/90 border border-stone-800 rounded mb-2 text-[8.5px] font-bold">
        <div className="flex items-center gap-1 text-yellow-400">
          <span>🪙 {playerGold.toLocaleString()} OURO</span>
        </div>
        <div className="flex items-center gap-1 text-sky-400">
          <span>💎 {userGems.toLocaleString()} GEMAS</span>
        </div>
        <div className="flex items-center gap-1 text-pink-400">
          <span>🔮 {runeShards.toLocaleString()} ESTILHAÇOS</span>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex flex-wrap gap-1 mb-3">
        <button
          onClick={() => {
            setActiveTab("runas");
            setBlacksmithMessage(null);
            setRerollMessage(null);
          }}
          className={`flex-1 min-w-[70px] py-1 text-[7.5px] font-black rounded border transition-colors ${
            activeTab === "runas"
              ? "bg-yellow-950/40 border-yellow-700/60 text-yellow-400"
              : "bg-stone-900/40 border-transparent text-stone-400 hover:bg-stone-850"
          }`}
        >
          ◈ SOCKET RUNAS
        </button>
        <button
          onClick={() => {
            setActiveTab("aprimorar");
            setBlacksmithMessage(null);
            setRerollMessage(null);
          }}
          className={`flex-1 min-w-[70px] py-1 text-[7.5px] font-black rounded border transition-colors ${
            activeTab === "aprimorar"
              ? "bg-yellow-950/40 border-yellow-700/60 text-yellow-400"
              : "bg-stone-900/40 border-transparent text-stone-400 hover:bg-stone-850"
          }`}
        >
          <Hammer className="w-2.5 h-2.5 inline mr-1" />
          BIGORNA (+20)
        </button>
        <button
          onClick={() => {
            setActiveTab("reroll");
            setBlacksmithMessage(null);
            setRerollMessage(null);
          }}
          className={`flex-1 min-w-[70px] py-1 text-[7.5px] font-black rounded border transition-colors ${
            activeTab === "reroll"
              ? "bg-yellow-950/40 border-yellow-700/60 text-yellow-400"
              : "bg-stone-900/40 border-transparent text-stone-400 hover:bg-stone-850"
          }`}
        >
          <RefreshCw className="w-2.5 h-2.5 inline mr-1" />
          ATRIBUTOS
        </button>
        <button
          onClick={() => {
            setActiveTab("desmontar");
            setBlacksmithMessage(null);
            setRerollMessage(null);
          }}
          className={`flex-1 min-w-[70px] py-1 text-[7.5px] font-black rounded border transition-colors ${
            activeTab === "desmontar"
              ? "bg-yellow-950/40 border-yellow-700/60 text-yellow-400"
              : "bg-stone-900/40 border-transparent text-stone-400 hover:bg-stone-850"
          }`}
        >
          <Trash2 className="w-2.5 h-2.5 inline mr-1 text-red-400" />
          RECICLAR GEAR
        </button>
      </div>

      {/* --- RUNAS TAB --- */}
      {activeTab === "runas" && (
        <>
          <PixelPanel tone="parchment" style={{ marginBottom: 10 }}>
            <div style={{ color: PIXEL_GOLD, fontSize: 8, letterSpacing: 1, lineHeight: 1.5, fontWeight: "bold" }}>
              ◈ Os sockets ligam runas diretamente à arma/armadura equipada. Os bônus de atributos se aplicam instantaneamente!
            </div>
          </PixelPanel>

          {equippedItems.map(({ slot, item }) => {
            if (!item) {
              return (
                <PixelPanel key={slot} tone="wood" style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 9, color: PIXEL_GOLD, letterSpacing: 2, marginBottom: 4, fontWeight: "bold" }}>
                    {slot === "weapon" ? "⚔️ ARMA" : "🛡️ ARMADURA"}
                  </div>
                  <div style={{ fontSize: 8, color: "#c9a86a", letterSpacing: 1 }}>
                    Nenhum item equipado neste slot no inventário.
                  </div>
                </PixelPanel>
              );
            }
            const cap = maxSocketsForRarity(item.rarity);
            const socketList = c.sockets[item.id] || [];
            return (
              <PixelPanel
                key={slot}
                tone="wood"
                style={{
                  marginBottom: 10,
                  boxShadow: `inset 0 0 0 2px ${RARITY_COLOR[item.rarity]}, inset 0 0 0 4px #120a08, 0 4px 0 #000`,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      background: `${RARITY_COLOR[item.rarity]}22`,
                      border: `2px solid ${RARITY_COLOR[item.rarity]}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 20,
                    }}
                  >
                    {slot === "weapon" ? "⚔️" : "🛡️"}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: RARITY_COLOR[item.rarity], fontSize: 9, letterSpacing: 1, fontWeight: "bold" }}>
                      {(slot === "weapon" ? "ARMA · " : "ARMADURA · ") + item.name.toUpperCase()}
                    </div>
                    <div style={{ fontSize: 7, color: "#c9a86a", marginTop: 3, fontWeight: "bold" }}>
                      SOCKETS DISPONÍVEIS: {socketList.length}/{cap} · RARIDADE: {item.rarity.toUpperCase()}
                    </div>
                  </div>
                </div>

                {/* Sockets row */}
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                  {Array.from({ length: cap }).map((_, i) => {
                    const uid = socketList[i];
                    const rune = uid ? ownedRunes.find((r) => r.uid === uid) : undefined;
                    const info = rune ? ANCIENT_RUNES[rune.runeId] : null;
                    return (
                      <div
                        key={i}
                        onClick={() => {
                          if (uid) unsocketRune(item.id, uid);
                          else setPickerSlot(slot);
                        }}
                        style={{
                          width: 54,
                          height: 54,
                          background: info ? `${info.color}22` : "rgba(0,0,0,0.5)",
                          border: `2px dashed ${info ? info.color : PIXEL_BORDER}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          textAlign: "center",
                          fontSize: 8,
                          color: info?.color ?? "#7a5a3a",
                          letterSpacing: 1,
                        }}
                        title={info ? `${info.name} ${runeTierLabel(rune!.tier)} — clique para remover` : "Slot vazio"}
                      >
                        {info ? (
                          <>
                            <div style={{ fontSize: 18 }}>◈</div>
                            <div style={{ fontSize: 6 }}>T{rune!.tier}</div>
                          </>
                        ) : (
                          "+"
                        )}
                      </div>
                    );
                  })}
                </div>
              </PixelPanel>
            );
          })}
        </>
      )}

      {/* --- APRIMORAR TAB (BIGORNA COM TEMPERATURA E MAESTRIA) --- */}
      {activeTab === "aprimorar" && (
        <>
          {/* Blacksmith Mastery Rank HUD */}
          <div className="p-2.5 mb-3 rounded border-2 border-amber-600 bg-neutral-950/95 flex items-center justify-between gap-4">
            <div>
              <div className="text-[10px] font-black text-amber-400 tracking-wider">
                {getBlacksmithTitle(smithLvl)}
              </div>
              <div className="text-[7.5px] text-zinc-400 font-bold mt-0.5 uppercase">
                nível de forja: {smithLvl} · bônus extra de sucesso: +{smithLvl}%
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[8px] text-zinc-300 font-black">
              <span>FORJA: READY</span>
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
            </div>
          </div>

          <PixelPanel tone="stone" style={{ marginBottom: 10 }}>
            <div className="flex items-center justify-between">
              <div style={{ color: PIXEL_GOLD, fontSize: 9, letterSpacing: 1, fontWeight: "bold" }}>
                🔥 TERMÔMETRO DA COMPACTAÇÃO DE FERRO
              </div>
              <span className="text-[8px] text-orange-400 font-bold">{forgeHeat}°C</span>
            </div>
            <div className="w-full h-2 bg-neutral-900 border border-neutral-800 rounded-full overflow-hidden mt-1">
              <div 
                className="h-full bg-gradient-to-r from-yellow-500 via-orange-500 to-red-600 transition-all duration-500"
                style={{ width: `${forgeHeat}%` }}
              />
            </div>
          </PixelPanel>

          {blacksmithMessage && (
            <div
              className={`p-2.5 mb-2.5 rounded border text-center text-[8.5px] font-black tracking-widest ${
                isAnimate ? "animate-bounce" : ""
              }`}
              style={{
                background:
                  blacksmithStatus === "success"
                    ? "rgba(16, 185, 129, 0.2)"
                    : blacksmithStatus === "fail"
                    ? "rgba(239, 68, 68, 0.2)"
                    : "rgba(245, 158, 11, 0.2)",
                borderColor:
                  blacksmithStatus === "success"
                    ? "#10b981"
                    : blacksmithStatus === "fail"
                    ? "#ef4444"
                    : "#f59e0b",
              }}
            >
              {isAnimate ? "🔨💥 DIG-DONG! DIG-DONG! MALHANDO O AÇO! ✨" : blacksmithMessage.toUpperCase()}
            </div>
          )}

          {/* Booster Gem Checkbox */}
          <div className="flex items-center justify-between p-2 bg-stone-900/60 border border-stone-800 rounded mb-2 text-[8.5px] font-bold">
            <span className="text-stone-300">GEMA DE SORTE (+25% CHANCE ADICIONAL)</span>
            <button
              onClick={() => setUseLuckGem(!useLuckGem)}
              className={`px-2 py-1 rounded text-[7.5px] font-black transition border ${
                useLuckGem
                  ? "bg-emerald-950/60 border-emerald-500 text-emerald-400"
                  : "bg-stone-800/60 border-stone-700 text-stone-400"
              }`}
            >
              {useLuckGem ? "ATIVADO (5💎)" : "DESATIVADO"}
            </button>
          </div>

          {equippedItems.map(({ slot, item }) => {
            if (!item) return null;
            const currentLvl = c.enchants[item.id] || 0;
            // Success rate scales positively with blacksmith level!
            const successRate = Math.min(100, getUpgradeSuccessRate(currentLvl, useLuckGem) + smithLvl);
            const goldCost = getUpgradeGoldCost(currentLvl);

            return (
              <PixelPanel
                key={slot}
                tone="wood"
                style={{
                  marginBottom: 10,
                  boxShadow: `inset 0 0 0 2px ${RARITY_COLOR[item.rarity]}, inset 0 0 0 4px #120a08, 0 4px 0 #000`,
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span style={{ color: RARITY_COLOR[item.rarity] }} className="text-[10px] font-black">
                      {item.name.toUpperCase()}
                    </span>
                    <span className="text-yellow-400 font-black text-[10px]">+{currentLvl}</span>
                  </div>
                  <span className="text-[8px] text-stone-400 font-bold uppercase">{slot === "weapon" ? "Arma" : "Armadura"}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[8px] text-stone-300 mb-3 bg-stone-950/40 p-1.5 rounded border border-stone-900 font-bold">
                  <div>
                    <span>STATUS ATUAL:</span>
                    <br />
                    <span className="text-stone-400 font-black">
                      {slot === "weapon"
                        ? `+${currentLvl * 15} Ataque`
                        : `+${currentLvl * 15} Defesa | +${currentLvl * 40} HP`}
                    </span>
                  </div>
                  <div>
                    <span>FORJAR (+{currentLvl + 1}):</span>
                    <br />
                    <span className="text-emerald-400 font-black">
                      {slot === "weapon"
                        ? `+${(currentLvl + 1) * 15} Ataque`
                        : `+${(currentLvl + 1) * 15} Defesa | +${(currentLvl + 1) * 40} HP`}
                    </span>
                  </div>
                </div>

                {currentLvl >= 20 ? (
                  <div className="text-center text-emerald-400 font-black py-1.5 bg-stone-900 border border-emerald-600 rounded text-[9px] tracking-widest">
                    ★ FORJA TRANSCENDENTE +20 COMPLETA ★
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-[8px] font-bold">
                      <div>
                        SUCESSO: <span className="text-emerald-400 font-black">{successRate}%</span>
                      </div>
                      <div className="mt-0.5">
                        FORJAR: <span className="text-yellow-400 font-black">🪙 {goldCost.toLocaleString()}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleUpgrade(slot, item)}
                      disabled={isAnimate}
                      className="px-3 py-2 rounded bg-gradient-to-b from-yellow-400 to-amber-600 hover:from-yellow-300 hover:to-amber-500 text-black font-black text-[8.5px] cursor-pointer flex items-center gap-1.5 shadow-lg active:scale-95 transition-transform"
                    >
                      <Hammer className="w-3.5 h-3.5 animate-bounce" />
                      FORJAR AGORA
                    </button>
                  </div>
                )}
              </PixelPanel>
            );
          })}
        </>
      )}

      {/* --- REROLL TAB --- */}
      {activeTab === "reroll" && (
        <>
          <PixelPanel tone="stone" style={{ marginBottom: 10 }}>
            <div style={{ color: PIXEL_GOLD, fontSize: 9, letterSpacing: 1, marginBottom: 4, fontWeight: "bold" }}>
              ⚡ PROPRIEDADES DE COMBATE (RE-ROLL)
            </div>
            <div style={{ fontSize: 8, color: "#c9a86a", lineHeight: 1.5 }}>
              Modifique os atributos mágicos secundários de seus equipamentos <span className="text-blue-400 font-bold">Raros</span> ou superiores!
              <br />
              <span className="text-yellow-400 font-black">RARA: 1</span> · <span className="text-purple-400 font-black">ÉPICA: 2</span> · <span className="text-orange-400 font-black">LENDÁRIA/MÍTICA: 3</span> atributos.
            </div>
          </PixelPanel>

          {rerollMessage && (
            <div className="p-2 mb-2.5 rounded border text-center text-[8.5px] font-black bg-purple-950/40 border-purple-500 text-purple-300 tracking-wider">
              {rerollMessage.toUpperCase()}
            </div>
          )}

          {equippedItems.map(({ slot, item }) => {
            if (!item) return null;
            const rolls = c.rerolledStats[item.id] || {};
            const keys = Object.keys(rolls) as (keyof typeof rolls)[];

            return (
              <PixelPanel
                key={slot}
                tone="wood"
                style={{
                  marginBottom: 10,
                  boxShadow: `inset 0 0 0 2px ${RARITY_COLOR[item.rarity]}, inset 0 0 0 4px #120a08, 0 4px 0 #000`,
                }}
              >
                <div className="flex items-center justify-between mb-2 border-b border-stone-800 pb-1">
                  <span style={{ color: RARITY_COLOR[item.rarity] }} className="text-[9px] font-black">
                    {item.name.toUpperCase()}
                  </span>
                  <span className="text-[8px] text-stone-400 font-bold uppercase">{item.rarity}</span>
                </div>

                {/* Rolled Attributes List */}
                <div className="bg-stone-950/60 p-2 rounded mb-3 border border-stone-900 space-y-1.5 min-h-[45px] font-bold">
                  {keys.length === 0 ? (
                    <div className="text-[8px] text-stone-500 text-center py-2 uppercase">
                      Sem propriedades mágicas adicionadas.
                    </div>
                  ) : (
                    keys.map((k) => {
                      const val = rolls[k];
                      return (
                        <div key={k} className="flex justify-between items-center text-[8px]">
                          <span className="text-purple-300 font-bold uppercase">
                            {k === "speed" && "⚡ Velocidade"}
                            {k === "crit" && "🎯 Chance de Crítico"}
                            {k === "xp" && "✨ Bônus de XP"}
                            {k === "gold" && "🪙 Bônus de Ouro"}
                            {k === "lifeSteal" && "🩸 Roubo de Vida"}
                          </span>
                          <span className="text-emerald-400 font-black">
                            +{val}
                            {k !== "speed" && "%"}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-[8px] font-bold">
                    <div>CUSTO: <span className="text-yellow-400 font-black">🪙 2,500</span></div>
                  </div>
                  <button
                    onClick={() => handleReroll(slot, item)}
                    className="px-3 py-1.5 rounded bg-purple-750 hover:bg-purple-600 text-white font-black text-[8px] flex items-center gap-1 active:scale-95 transition-transform"
                  >
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    RE-ROLAR ATRIBUTOS
                  </button>
                </div>
              </PixelPanel>
            );
          })}
        </>
      )}

      {/* --- DESMONTAR TAB (NEW COHESION FEATURE - melting gear for shards) --- */}
      {activeTab === "desmontar" && (
        <>
          <PixelPanel tone="stone" style={{ marginBottom: 10 }}>
            <div style={{ color: PIXEL_GOLD, fontSize: 9, letterSpacing: 1, marginBottom: 4, fontWeight: "bold" }}>
              ♻️ FUNDIÇÃO DE RECONVERSÃO DE SUCATA
            </div>
            <div style={{ fontSize: 8, color: "#c9a86a", lineHeight: 1.5 }}>
              Derreta equipamentos sobressalentes que você não usa para extrair <span className="text-pink-400 font-black">Estilhaços Rúnicos</span>!
              <br />
              Estilhaços podem ser trocados diretamente por Gemas (Booster de Forja) na bigorna!
            </div>
          </PixelPanel>

          {rerollMessage && (
            <div className="p-2 mb-2 rounded border text-center text-[8.5px] font-black bg-pink-950/45 border-pink-500 text-pink-300 tracking-wider">
              {rerollMessage.toUpperCase()}
            </div>
          )}

          {/* Shards Exchange Panel */}
          <div className="p-2.5 mb-3 border-2 border-dashed border-pink-600 bg-neutral-950/90 rounded flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <div>
              <div className="text-[8.5px] font-black text-pink-300 tracking-wider">
                🔮 TROCADOR DE ESTILHAÇOS DE ASTERION
              </div>
              <div className="text-[7.5px] text-zinc-400 font-bold mt-0.5">
                CUSTO: 30 ESTILHAÇOS ➔ CONCEDE +5 💎 GEMAS
              </div>
            </div>
            <button
              onClick={handleExchangeShards}
              className="px-3 py-1 text-[8px] font-black bg-pink-600 text-white hover:bg-pink-500 rounded transition-transform active:scale-95 cursor-pointer"
            >
              CRAFTAR GEMAS
            </button>
          </div>

          <div style={{ fontSize: 8, color: "#fff", letterSpacing: 1, fontWeight: "bold", marginBottom: 6 }}>
            ⚙️ SELECIONE UM EQUIPAMENTO PARA DERRETER:
          </div>

          {inventoryItems.length === 0 ? (
            <div className="text-center py-6 text-stone-500 font-bold text-[8.5px] uppercase bg-stone-900/30 border border-dashed border-stone-800 rounded">
              Seu inventário está vazio. Conquiste equipamentos matando monstros!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-1">
              {inventoryItems.map((it) => (
                <div 
                  key={it.id} 
                  style={{ borderColor: RARITY_COLOR[it.rarity] }} 
                  className="p-2 bg-stone-950/70 border rounded flex justify-between items-center font-bold"
                >
                  <div>
                    <span style={{ color: RARITY_COLOR[it.rarity] }} className="text-[8px] font-black uppercase">
                      {it.name}
                    </span>
                    <div className="text-[7px] text-zinc-400 font-bold mt-0.5 uppercase">
                      Tier {Math.floor(it.level / 3) + 1} · {it.rarity}
                    </div>
                  </div>
                  <button
                    onClick={() => handleMeltDown(it)}
                    className="px-2.5 py-1 text-[7px] font-black bg-red-600 hover:bg-red-500 text-white rounded transition-transform active:scale-95 cursor-pointer flex items-center gap-1"
                  >
                    <Flame className="w-2.5 h-2.5" />
                    DERRETER
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Rune picker overlay */}
      {pickerSlot && (
        <PixelPanel tone="stone" style={{ marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ color: PIXEL_GOLD, fontSize: 9, letterSpacing: 2, fontWeight: "bold" }}>
              ESCOLHA UMA RUNA PARA ACOPLAR
            </span>
            <button
              onClick={() => setPickerSlot(null)}
              style={{
                background: "transparent",
                border: "none",
                color: "#fff",
                cursor: "pointer",
                fontFamily: PIXEL_FONT,
                fontSize: 10,
              }}
            >
              ✕
            </button>
          </div>
          {freeRunes.length === 0 ? (
            <div style={{ fontSize: 8, color: "#c9a86a" }}>Nenhuma runa livre disponível em sua posse.</div>
          ) : (
            <div style={{ display: "grid", gap: 6, gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))" }}>
              {freeRunes.map((r) => {
                const info = ANCIENT_RUNES[r.runeId];
                const item =
                  pickerSlot === "weapon" ? itemById(overlay.equipped.weapon) : itemById(overlay.equipped.chest);
                if (!item) return null;
                return (
                  <button
                    key={r.uid}
                    onClick={() => {
                      const list = c.sockets[item.id] || [];
                      if (list.length >= maxSocketsForRarity(item.rarity)) return;
                      socketRune(item.id, r.uid);
                      setPickerSlot(null);
                    }}
                    style={{
                      padding: 6,
                      background: `${info.color}22`,
                      border: `2px solid ${info.color}`,
                      color: "#fff",
                      fontFamily: PIXEL_FONT,
                      fontSize: 8,
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <div style={{ color: info.color, marginBottom: 2 }}>{info.name}</div>
                    <div style={{ fontSize: 7, color: "#c9a86a" }}>{runeTierLabel(r.tier)}</div>
                  </button>
                );
              })}
            </div>
          )}
        </PixelPanel>
      )}

      {/* Transmog picker */}
      {transmogPicker && (
        <PixelPanel tone="stone" style={{ marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ color: PIXEL_GOLD, fontSize: 9, letterSpacing: 2 }}>
              ESCOLHA APARÊNCIA · {transmogPicker.toUpperCase()}
            </span>
            <button
              onClick={() => setTransmogPicker(null)}
              style={{
                background: "transparent",
                border: "none",
                color: "#fff",
                cursor: "pointer",
                fontFamily: PIXEL_FONT,
                fontSize: 10,
              }}
            >
              ✕
            </button>
          </div>
          <div style={{ display: "grid", gap: 6, gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))" }}>
            {overlay.inventory
              .map((id) => itemById(id))
              .filter((it): it is Item => !!it && (transmogPicker === "weapon" ? it.slot === "weapon" : it.slot === "chest"))
              .map((it) => (
                <button
                  key={it.id}
                  onClick={() => {
                    setTransmog(transmogPicker, it.id);
                    setTransmogPicker(null);
                  }}
                  style={{
                    padding: 6,
                    background: `${RARITY_COLOR[it.rarity]}22`,
                    border: `2px solid ${RARITY_COLOR[it.rarity]}`,
                    color: "#fff",
                    fontFamily: PIXEL_FONT,
                    fontSize: 8,
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <div style={{ color: RARITY_COLOR[it.rarity], marginBottom: 2 }}>{it.name}</div>
                  <div style={{ fontSize: 7, color: "#c9a86a" }}>{it.rarity}</div>
                </button>
              ))}
          </div>
        </PixelPanel>
      )}
    </div>
  );
}
