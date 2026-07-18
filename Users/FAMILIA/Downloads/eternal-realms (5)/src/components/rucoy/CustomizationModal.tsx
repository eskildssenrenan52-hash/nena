import { useState } from "react";
import { useOverlayState, setOverlayState, type CustomizationState } from "@/rucoy/store";
import { TROPHY_TRANSLATIONS } from "@/rucoy/trophies";
import { enqueueReward } from "@/rucoy/bridge";
import { PIXEL_FONT, PIXEL_GOLD, PIXEL_BORDER } from "./ui/pixel";
import { Sparkles, Eye, Shield, Key, Lock, Palette, Swords, Award, Star, Coins, ShoppingBag } from "lucide-react";
import { useHostedGame } from "@/game/host";

interface Props {
  onClose: () => void;
}

interface CustomOption {
  id: string;
  namePt: string;
  nameEn: string;
  cost: number;
  costType: "gold" | "gems";
  color: string;
}

// 20 Categories List
const CATEGORIES: { id: keyof CustomizationState; namePt: string; nameEn: string; icon: any }[] = [
  { id: "title", namePt: "Título Prestígio", nameEn: "Prestige Title", icon: Award },
  { id: "badge", namePt: "Insígnia de Perfil", nameEn: "Profile Badge", icon: Star },
  { id: "skinColor", namePt: "Tom de Pele", nameEn: "Skin Tone", icon: Palette },
  { id: "hairStyle", namePt: "Corte de Cabelo", nameEn: "Hair Style", icon: Sparkles },
  { id: "hairColor", namePt: "Cor do Cabelo", nameEn: "Hair Color", icon: Palette },
  { id: "eyeColor", namePt: "Cor dos Olhos", nameEn: "Eye Color", icon: Eye },
  { id: "helmetStyle", namePt: "Estilo de Yelmo", nameEn: "Helmet Style", icon: Shield },
  { id: "helmetColor", namePt: "Cor do Yelmo", nameEn: "Helmet Color", icon: Palette },
  { id: "armorStyle", namePt: "Estilo de Peitoral", nameEn: "Armor Style", icon: Shield },
  { id: "armorColor", namePt: "Cor do Peitoral", nameEn: "Armor Color", icon: Palette },
  { id: "weaponStyle", namePt: "Estilo de Arma", nameEn: "Weapon Style", icon: Swords },
  { id: "shieldStyle", namePt: "Estilo de Escudo", nameEn: "Shield Style", icon: Shield },
  { id: "capeStyle", namePt: "Estilo de Capa", nameEn: "Cape Style", icon: Shield },
  { id: "capeColor", namePt: "Cor da Capa", nameEn: "Cape Color", icon: Palette },
  { id: "trailEffect", namePt: "Rastro Divino", nameEn: "Divine Trail", icon: Sparkles },
  { id: "attackAnimation", namePt: "Efeito de Ataque", nameEn: "Attack FX", icon: Swords },
  { id: "petAura", namePt: "Aura do Pet", nameEn: "Pet Aura", icon: Sparkles },
  { id: "victoryPose", namePt: "Pose de Vitória", nameEn: "Victory Pose", icon: Star },
  { id: "walkSound", namePt: "Sons de Passos", nameEn: "Footsteps FX", icon: Sparkles },
  { id: "deathAnimation", namePt: "Animação de Morte", nameEn: "Death FX", icon: Sparkles },
];

// Generate over 1,000 distinct options programmatically across all 20 categories (50 options per category)
export function getCustomOptionsForCategory(catId: keyof CustomizationState): CustomOption[] {
  const options: CustomOption[] = [];
  
  // Base default options
  const defaultOptionName = {
    title: "Recruta de Asterion",
    badge: "Iniciante",
    skinColor: "Pele Padrão",
    hairStyle: "Curto",
    hairColor: "Castanho",
    eyeColor: "Azul",
    helmetStyle: "Nenhum",
    helmetColor: "Padrão",
    armorStyle: "Nenhum",
    armorColor: "Padrão",
    weaponStyle: "Nenhum",
    shieldStyle: "Nenhum",
    capeStyle: "Nenhuma",
    capeColor: "Padrão",
    trailEffect: "Nenhum",
    attackAnimation: "Corte Rápido",
    petAura: "Nenhuma",
    victoryPose: "Heroica",
    walkSound: "Armadura Leve",
    deathAnimation: "Desvanecer Cósmico",
  }[catId];

  // Add the base free option first
  options.push({
    id: `${String(catId)}_${defaultOptionName}`,
    namePt: defaultOptionName,
    nameEn: defaultOptionName,
    cost: 0,
    costType: "gold" as const,
    color: "#ffffff"
  });

  // Programmatically generate 50 options per category to cross 1000 total options (20 * 50 = 1000)
  for (let i = 1; i <= 50; i++) {
    let namePt = "";
    let nameEn = "";
    let cost = 100 + i * 50;
    let costType: "gold" | "gems" = i % 5 === 0 ? "gems" : "gold";
    if (costType === "gems") {
      cost = 5 + Math.floor(i / 3);
    }
    let color = "#3b82f6"; // default blue

    if (catId === "title") {
      const titles = [
        "Gladiador", "Algoz", "Aniquilador", "Soberano", "Deus da Guerra", 
        "Cazador", "Mestre", "Eterno", "Rúnico", "Celestial", "Místico",
        "Lendário", "Centurião", "Vanguardista", "Templário", "Paladino"
      ];
      const base = titles[i % titles.length];
      namePt = `${base} Nível ${i}`;
      nameEn = `${base} Level ${i}`;
      color = "#f43f5e";
    } else if (catId === "badge") {
      const badges = ["Prata", "Ouro", "Runa", "Cristal", "Cosmos", "Fênix", "Estelar"];
      const base = badges[i % badges.length];
      namePt = `Insígnia ${base} #${i}`;
      nameEn = `Badge ${base} #${i}`;
      color = "#eab308";
    } else if (catId === "skinColor") {
      const colorsPt = ["Branco", "Pardo", "Negro", "Bronze", "Azul Elétrico", "Vazio Rúnico", "Rubi", "Esmeralda", "Dourado Solar", "Sombra"];
      const colorsEn = ["Pale", "Tanned", "Ebony", "Bronze", "Electric Blue", "Runic Void", "Ruby", "Emerald", "Solar Gold", "Shadow"];
      const idx = i % colorsPt.length;
      namePt = `Pele: ${colorsPt[idx]} (Tonalidade ${i})`;
      nameEn = `Skin: ${colorsEn[idx]} (Hue ${i})`;
      color = "#22c55e";
    } else if (catId === "hairStyle") {
      namePt = `Corte Exótico #${i}`;
      nameEn = `Exotic Cut #${i}`;
      color = "#a855f7";
    } else if (catId === "hairColor") {
      namePt = `Cabelo Colorido #${i}`;
      nameEn = `Dyed Hair #${i}`;
    } else if (catId === "eyeColor") {
      namePt = `Olhar Cósmico #${i}`;
      nameEn = `Cosmic Glow #${i}`;
    } else if (catId === "helmetStyle" || catId === "armorStyle" || catId === "weaponStyle" || catId === "shieldStyle") {
      const materialsPt = ["Placa de Cobre", "Aço Rúnico", "Obsidiana", "Mitril Cósmico", "Metal Dracônico", "Éter Antigo"];
      const materialsEn = ["Copper Plate", "Runic Steel", "Obsidian", "Cosmic Mithril", "Dragon Metal", "Ancient Ether"];
      const base = materialsPt[i % materialsPt.length];
      const baseEn = materialsEn[i % materialsEn.length];
      const part = catId === "helmetStyle" ? "Capacete" : catId === "armorStyle" ? "Peitoral" : catId === "weaponStyle" ? "Lâmina" : "Brocador";
      const partEn = catId === "helmetStyle" ? "Helm" : catId === "armorStyle" ? "Chest" : catId === "weaponStyle" ? "Blade" : "Bulwark";
      namePt = `${part} de ${base} (V${i})`;
      nameEn = `${partEn} of ${baseEn} (V${i})`;
      color = "#38bdf8";
    } else if (catId === "helmetColor" || catId === "armorColor" || catId === "capeColor") {
      namePt = `Cor Seletiva #${i}`;
      nameEn = `Accent Dye #${i}`;
    } else if (catId === "capeStyle") {
      namePt = `Manto Sagrado #${i}`;
      nameEn = `Sacred Cloak #${i}`;
    } else if (catId === "trailEffect") {
      const trailsPt = ["Labaredas", "Chuva Estelar", "Cristais de Gelo", "Poeira Cósmica", "Vórtice Escuro", "Aura Elétrica"];
      const trailsEn = ["Blazing Sparks", "Star Shower", "Frost Shards", "Cosmic Stardust", "Dark Vortex", "Electric Aura"];
      namePt = `Efeito: ${trailsPt[i % trailsPt.length]} #${i}`;
      nameEn = `FX: ${trailsEn[i % trailsEn.length]} #${i}`;
      color = "#ec4899";
    } else if (catId === "attackAnimation") {
      namePt = `Impacto Elemental #${i}`;
      nameEn = `Elemental Cleave #${i}`;
    } else if (catId === "petAura") {
      namePt = `Aura de Mascote #${i}`;
      nameEn = `Familiar Aura #${i}`;
    } else if (catId === "victoryPose") {
      namePt = `Postura Heroica #${i}`;
      nameEn = `Heroic Pose #${i}`;
    } else if (catId === "walkSound") {
      namePt = `Efeito Sonoro #${i}`;
      nameEn = `Acoustic Steps #${i}`;
    } else if (catId === "deathAnimation") {
      namePt = `Estouro de Almas #${i}`;
      nameEn = `Soul Burst #${i}`;
    }

    options.push({
      id: `${String(catId)}_${namePt}`,
      namePt,
      nameEn,
      cost,
      costType,
      color,
    });
  }

  return options;
}

export default function CustomizationModal({ onClose }: Props) {
  const g = useHostedGame();
  const state = useOverlayState();
  const lang = state.language || "pt";
  const t = TROPHY_TRANSLATIONS[lang];

  const [activeTab, setActiveTab] = useState<keyof CustomizationState>("title");
  const [feedback, setFeedback] = useState<string | null>(null);

  const currentOptions = getCustomOptionsForCategory(activeTab);
  const currentEquipped = state.customization[activeTab];

  const playerGold = g?.player?.gold ?? 0;
  const userGems = state.gems || 0;

  const handleSelect = (opt: any) => {
    const isUnlocked = state.unlockedCustomizations.includes(opt.id) || opt.cost === 0;

    if (isUnlocked) {
      // Equip instantly
      setOverlayState((cs) => ({
        ...cs,
        customization: {
          ...cs.customization,
          [activeTab]: opt.namePt, // Store the selected option name
        },
      }));
      showFeedback(`${opt[lang === "pt" ? "namePt" : "nameEn"]} equipado!`);
    } else {
      // Prompt to purchase from Virtual Store logic
      if (opt.costType === "gems" && userGems < opt.cost) {
        showFeedback(t.noGems);
        return;
      }

      if (opt.costType === "gold" && playerGold < opt.cost) {
        showFeedback(t.noCoins);
        return;
      }

      // If gold, we check if the user has enough gold
      // We deduct gold by enqueuing a negative reward
      if (opt.costType === "gold") {
        // Enqueue negative gold reward to deduct from game loop
        enqueueReward({ kind: "gold", amount: -opt.cost });
      } else {
        // Gems are overlay-native, deduct directly
        setOverlayState((cs) => ({ ...cs, gems: cs.gems - opt.cost }));
      }

      // Unlock and equip
      setOverlayState((cs) => ({
        ...cs,
        unlockedCustomizations: [...cs.unlockedCustomizations, opt.id],
        customization: {
          ...cs.customization,
          [activeTab]: opt.namePt,
        },
      }));

      showFeedback(t.successBuy);
    }
  };

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 1800);
  };

  return (
    <div className="flex flex-col h-full text-white">
      {/* Wallet Display Bar */}
      <div className="flex items-center justify-between p-2 bg-stone-900/60 border border-stone-800 rounded mb-2 text-xs shrink-0">
        <div className="flex items-center gap-1">
          <Coins className="w-4 h-4 text-yellow-400" />
          <span className="font-bold text-yellow-400" style={{ fontFamily: PIXEL_FONT }}>
            {playerGold.toLocaleString()} Ouro
          </span>
        </div>
        <div className="flex items-center gap-1">
          <ShoppingBag className="w-4 h-4 text-blue-400" />
          <span className="font-bold text-blue-400" style={{ fontFamily: PIXEL_FONT }}>
            {userGems.toLocaleString()} Gemas
          </span>
        </div>
      </div>

      {/* Category Sidebar and Grid layout */}
      <div className="flex flex-1 overflow-hidden" style={{ height: "calc(80vh - 160px)" }}>
        {/* Categories Tabs list - Scrollable */}
        <div className="w-1/3 border-r border-yellow-900/30 pr-1 overflow-y-auto space-y-1 scrollbar-none">
          {CATEGORIES.map((c) => {
            const Icon = c.icon;
            const isSelected = activeTab === c.id;
            return (
              <button
                key={String(c.id)}
                onClick={() => setActiveTab(c.id)}
                className={`w-full flex items-center gap-1.5 p-1.5 text-left rounded text-[9px] transition ${
                  isSelected
                    ? "bg-yellow-950/40 border border-yellow-700/60 text-yellow-400"
                    : "bg-stone-900/30 hover:bg-stone-850 text-stone-300 border border-transparent"
                }`}
                style={{ fontFamily: PIXEL_FONT }}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-yellow-400" : "text-stone-400"}`} />
                <span className="truncate">{lang === "pt" ? c.namePt : c.nameEn}</span>
              </button>
            );
          })}
        </div>

        {/* Option Grid */}
        <div className="w-2/3 pl-2 overflow-y-auto scrollbar-thin scrollbar-thumb-yellow-950 scrollbar-track-transparent">
          {/* Header */}
          <div className="mb-2 p-1.5 bg-yellow-950/20 border border-yellow-900/30 rounded flex items-center justify-between">
            <div>
              <div className="text-[10px] text-yellow-400 font-bold" style={{ fontFamily: PIXEL_FONT }}>
                {t.categories.toUpperCase()}
              </div>
              <div className="text-[9px] text-stone-300">
                {t.equipped}: <span className="text-emerald-400 font-semibold">{currentEquipped}</span>
              </div>
            </div>
          </div>

          {/* Feedback popup */}
          {feedback && (
            <div
              className="mb-1.5 p-1 text-center text-[9px] text-yellow-200 bg-yellow-900/60 border border-yellow-500 rounded animate-bounce"
              style={{ fontFamily: PIXEL_FONT }}
            >
              {feedback.toUpperCase()}
            </div>
          )}

          {/* Options Grid Items */}
          <div className="grid grid-cols-1 gap-1.5 pb-4">
            {currentOptions.map((opt) => {
              const isUnlocked = state.unlockedCustomizations.includes(opt.id) || opt.cost === 0;
              const isEquipped = currentEquipped === opt.namePt;

              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelect(opt)}
                  className={`w-full flex items-center justify-between p-1.5 rounded border transition text-left cursor-pointer ${
                    isEquipped
                      ? "bg-emerald-950/20 border-emerald-500/70 shadow-sm"
                      : isUnlocked
                      ? "bg-stone-900/40 hover:bg-stone-850 border-stone-800"
                      : "bg-stone-950/50 hover:bg-stone-900 border-red-950/40 opacity-85"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {/* Visual color dot as preview indicator */}
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: opt.color }} />
                    
                    <div>
                      <div className="text-[9px] font-medium text-stone-100">
                        {lang === "pt" ? opt.namePt : opt.nameEn}
                      </div>
                      <div className="text-[8px] text-stone-400">
                        {isEquipped ? t.equipped : isUnlocked ? t.unlocked : "Bloqueado"}
                      </div>
                    </div>
                  </div>

                  {/* Pricing / Equip action button */}
                  <div className="text-right">
                    {isEquipped ? (
                      <span className="text-[8px] text-emerald-400 font-bold" style={{ fontFamily: PIXEL_FONT }}>
                        [ ACTIVE ]
                      </span>
                    ) : isUnlocked ? (
                      <span className="text-[8px] text-stone-500 hover:text-yellow-400 font-bold" style={{ fontFamily: PIXEL_FONT }}>
                        {t.equip.toUpperCase()}
                      </span>
                    ) : (
                      <div
                        className="flex items-center gap-1.5 px-2 py-1 rounded bg-yellow-950/30 border border-yellow-800/40 text-[8px] font-bold text-yellow-300"
                        style={{ fontFamily: PIXEL_FONT }}
                      >
                        <Lock className="w-2.5 h-2.5 text-stone-500" />
                        <span>
                          {opt.cost} {opt.costType === "gold" ? "g" : "💎"}
                        </span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
