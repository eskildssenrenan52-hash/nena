import { useState } from "react";
import { useOverlayState, setOverlayState } from "@/rucoy/store";
import { TROPHY_TRANSLATIONS } from "@/rucoy/trophies";
import { useHostedGame } from "@/game/host";
import { enqueueReward } from "@/rucoy/bridge";
import { PIXEL_FONT, PIXEL_GOLD, PIXEL_BORDER } from "./ui/pixel";
import { Sparkles, Coins, ShoppingBag, Gift, ArrowRightLeft, Lock, CheckCircle, PawPrint } from "lucide-react";

interface Props {
  onClose: () => void;
}

type ShopCategory = "visuals" | "pets" | "chests" | "currency";

interface ShopItem {
  id: string;
  namePt: string;
  nameEn: string;
  descPt: string;
  descEn: string;
  cost: number;
  costType: "gold" | "gems";
  type: "skin" | "pet" | "chest" | "currency_exchange";
  extraValue?: any; // e.g., gold amount for gem exchange, or petId, or customizationId
}

const SHOP_ITEMS: Record<ShopCategory, ShopItem[]> = {
  visuals: [
    {
      id: "shop_title_divino",
      namePt: "Título: Conquistador Divino",
      nameEn: "Title: Divine Conquistador",
      descPt: "Mostre sua soberania com o título divino dourado acima do seu nome.",
      descEn: "Show your sovereignty with the golden divine title above your name.",
      cost: 5000,
      costType: "gold",
      type: "skin",
      extraValue: "title_Conquistador Divino"
    },
    {
      id: "shop_trail_raios",
      namePt: "Efeito: Rastro de Raios",
      nameEn: "FX: Lightning Trail",
      descPt: "Deixe faíscas elétricas por onde passar.",
      descEn: "Leave crackling electric sparks wherever you walk.",
      cost: 30,
      costType: "gems",
      type: "skin",
      extraValue: "trail_Rastro de Raios"
    },
    {
      id: "shop_trail_void",
      namePt: "Efeito: Vórtice do Vazio",
      nameEn: "FX: Void Vortex",
      descPt: "Um rastro de fumaça cósmica escura e estrelas.",
      descEn: "A trail of dark cosmic smoke and shimmering stars.",
      cost: 50,
      costType: "gems",
      type: "skin",
      extraValue: "trail_Vórtice do Vazio"
    },
    {
      id: "shop_badge_coroa",
      namePt: "Insígnia: Coroa Imperial",
      nameEn: "Badge: Imperial Crown",
      descPt: "Uma luxuosa insígnia de coroa imperial ao lado do seu nome.",
      descEn: "A luxurious imperial crown badge next to your name.",
      cost: 15,
      costType: "gems",
      type: "skin",
      extraValue: "badge_Coroa Imperial"
    },
    {
      id: "shop_title_astro",
      namePt: "Título: Lorde Astrológico",
      nameEn: "Title: Astrological Lord",
      descPt: "O prestígio daqueles que dominaram o cosmos de Asterion.",
      descEn: "The prestige of those who mastered the cosmos of Asterion.",
      cost: 2500,
      costType: "gold",
      type: "skin",
      extraValue: "title_Lorde Astrológico"
    },
    {
      id: "shop_trail_natureza",
      namePt: "Efeito: Aura Verdejante",
      nameEn: "FX: Verdant Aura",
      descPt: "Espalhe pétalas e folhas mágicas verdes por onde passar.",
      descEn: "Spread magical green leaves and petals as you walk.",
      cost: 1200,
      costType: "gold",
      type: "skin",
      extraValue: "trail_Aura Verdejante"
    }
  ],
  pets: [
    {
      id: "shop_pet_dragao",
      namePt: "Mascote: Mini Dragão",
      nameEn: "Pet: Fire Wyvern",
      descPt: "Lança chamas pequenas. Ganhe +12 de ataque combatente.",
      descEn: "Breaths tiny flames. Grants +12 combat attack.",
      cost: 20000,
      costType: "gold",
      type: "pet",
      extraValue: "pet-15"
    },
    {
      id: "shop_pet_fada",
      namePt: "Mascote: Fada de Cura",
      nameEn: "Pet: Healing Fairy",
      descPt: "Flutua e recupera seu HP e MP passivamente. Muito útil.",
      descEn: "Hovers and restores your HP and MP passively. High utility.",
      cost: 15000,
      costType: "gold",
      type: "pet",
      extraValue: "pet-18"
    },
    {
      id: "shop_pet_void",
      namePt: "Mascote: Golem Cósmico",
      nameEn: "Pet: Cosmic Golem",
      descPt: "Um mini titan estelar que aumenta sua defesa em +15.",
      descEn: "A mini stellar titan that increases your defense by +15.",
      cost: 60,
      costType: "gems",
      type: "pet",
      extraValue: "pet-29"
    }
  ],
  chests: [
    {
      id: "shop_chest_rare",
      namePt: "Baú de Equipamento Raro",
      nameEn: "Rare Equipment Chest",
      descPt: "Contém 3 itens aleatórios de raridade Rara ou superior.",
      descEn: "Contains 3 random items of Rare rarity or higher.",
      cost: 1500,
      costType: "gold",
      type: "chest",
      extraValue: 1
    },
    {
      id: "shop_chest_epic",
      namePt: "Baú de Equipamento Épico",
      nameEn: "Epic Equipment Chest",
      descPt: "Contém equipamentos de alta performance de raridade Épica.",
      descEn: "Contains high performance equipment of Epic rarity.",
      cost: 5000,
      costType: "gold",
      type: "chest",
      extraValue: 2
    },
    {
      id: "shop_chest_legend",
      namePt: "Baú Imperial Lendário",
      nameEn: "Legendary Imperial Chest",
      descPt: "Tesouro supremo contendo itens Lendários e alta chance de Mítico.",
      descEn: "Supreme treasure containing Legendary items and high chance of Mythic.",
      cost: 15000,
      costType: "gold",
      type: "chest",
      extraValue: 3
    }
  ],
  currency: [
    {
      id: "shop_gems_gold_1",
      namePt: "Bolsa de 1.000 Ouro",
      nameEn: "1,000 Gold Pouch",
      descPt: "Adquira moedas de ouro usando gemas do passe ou troféus.",
      descEn: "Acquire gold coins using gems from the pass or trophy road.",
      cost: 10,
      costType: "gems",
      type: "currency_exchange",
      extraValue: { gold: 1000 }
    },
    {
      id: "shop_gems_gold_2",
      namePt: "Baú de 10.000 Ouro",
      nameEn: "10,000 Gold Chest",
      descPt: "Uma enorme fortuna de moedas enviadas à sua conta de jogo.",
      descEn: "A huge fortune of coins delivered straight to your game account.",
      cost: 80,
      costType: "gems",
      type: "currency_exchange",
      extraValue: { gold: 10000 }
    },
    {
      id: "shop_gold_gems_exchange",
      namePt: "Converter 50.000 Ouro em 50 Joias",
      nameEn: "Exchange 50,000 Gold for 50 Gems",
      descPt: "Invista seu ouro conquistado em masmorras em gemas premium.",
      descEn: "Invest your hard-earned gold from dungeons into premium gems.",
      cost: 50000,
      costType: "gold",
      type: "currency_exchange",
      extraValue: { gems: 50 }
    }
  ]
};

export default function ShopModal({ onClose }: Props) {
  const g = useHostedGame();
  const state = useOverlayState();
  const lang = state.language || "pt";
  const t = TROPHY_TRANSLATIONS[lang];

  const [activeTab, setActiveTab] = useState<ShopCategory>("visuals");
  const [feedback, setFeedback] = useState<string | null>(null);

  const playerGold = g?.player?.gold ?? 0;
  const userGems = state.gems || 0;

  const handleBuy = (item: ShopItem) => {
    // 1. Check affordability
    if (item.costType === "gold") {
      if (playerGold < item.cost) {
        showFeedback(t.noCoins);
        return;
      }
    } else {
      if (userGems < item.cost) {
        showFeedback(t.noGems);
        return;
      }
    }

    // 2. Already unlocked check for skins and pets
    if (item.type === "skin" && state.unlockedCustomizations.includes(item.extraValue)) {
      showFeedback("Você já possui esta customização!");
      return;
    }
    if (item.type === "pet" && state.unlockedPets.includes(item.extraValue)) {
      showFeedback("Você já possui esta mascote!");
      return;
    }

    // 3. Deduct currency
    if (item.costType === "gold") {
      // Send negative reward to live game loop
      enqueueReward({ kind: "gold", amount: -item.cost });
    } else {
      // Deduct gems directly
      setOverlayState((cs) => ({ ...cs, gems: cs.gems - item.cost }));
    }

    // 4. Apply purchased item benefits
    if (item.type === "skin") {
      setOverlayState((cs) => ({
        ...cs,
        unlockedCustomizations: [...cs.unlockedCustomizations, item.extraValue]
      }));
    } else if (item.type === "pet") {
      setOverlayState((cs) => ({
        ...cs,
        unlockedPets: [...cs.unlockedPets, item.extraValue]
      }));
    } else if (item.type === "chest") {
      // Send chests directly to active game
      enqueueReward({ kind: "chest", amount: item.extraValue });
    } else if (item.type === "currency_exchange") {
      if (item.extraValue.gold) {
        enqueueReward({ kind: "gold", amount: item.extraValue.gold });
      }
      if (item.extraValue.gems) {
        setOverlayState((cs) => ({ ...cs, gems: cs.gems + item.extraValue.gems }));
      }
    }

    showFeedback(t.successBuy);
  };

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 1800);
  };

  return (
    <div className="flex flex-col h-full text-white">
      {/* Wallet Display Bar */}
      <div className="flex items-center justify-between p-2 bg-stone-900/60 border border-stone-800 rounded mb-2 text-xs">
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

      {/* Tabs list (compact, 2x smaller) */}
      <div className="flex gap-1 border-b border-yellow-900/30 pb-1.5 mb-2 overflow-x-auto scrollbar-none">
        {(["visuals", "pets", "chests", "currency"] as ShopCategory[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-2.5 py-1 text-[9px] font-bold rounded transition border ${
              activeTab === tab
                ? "bg-yellow-950/40 border-yellow-700/60 text-yellow-400"
                : "bg-stone-900/40 hover:bg-stone-850 border-transparent text-stone-400"
            }`}
            style={{ fontFamily: PIXEL_FONT }}
          >
            {tab === "visuals" && "VISUAIS"}
            {tab === "pets" && "MASCOTES"}
            {tab === "chests" && "BAÚS"}
            {tab === "currency" && "RECURSOS"}
          </button>
        ))}
      </div>

      {feedback && (
        <div
          className="mb-1.5 p-1 text-center text-[9px] text-yellow-200 bg-yellow-900/60 border border-yellow-500 rounded animate-bounce"
          style={{ fontFamily: PIXEL_FONT }}
        >
          {feedback.toUpperCase()}
        </div>
      )}

      {/* Display List of items in current category */}
      <div
        className="flex-1 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin scrollbar-thumb-yellow-950 scrollbar-track-transparent"
        style={{ maxHeight: "calc(80vh - 160px)" }}
      >
        {SHOP_ITEMS[activeTab].map((item) => {
          const alreadyOwnsSkin = item.type === "skin" && state.unlockedCustomizations.includes(item.extraValue);
          const alreadyOwnsPet = item.type === "pet" && state.unlockedPets.includes(item.extraValue);
          const alreadyOwns = alreadyOwnsSkin || alreadyOwnsPet;

          return (
            <div
              key={item.id}
              className={`flex items-center justify-between p-2 rounded border ${
                alreadyOwns
                  ? "bg-stone-900/20 border-stone-850 opacity-60"
                  : "bg-stone-900/40 border-stone-800 hover:bg-stone-850/60"
              } transition`}
            >
              {/* Left Column: Icon + Text info */}
              <div className="flex items-center gap-2 max-w-[70%]">
                <div className="shrink-0 w-8 h-8 flex items-center justify-center rounded bg-stone-950 border border-stone-800">
                  {item.type === "skin" && <Sparkles className="w-4 h-4 text-pink-400" />}
                  {item.type === "pet" && <PawPrint className="w-4 h-4 text-green-400" />}
                  {item.type === "chest" && <Gift className="w-4 h-4 text-blue-400" />}
                  {item.type === "currency_exchange" && <ArrowRightLeft className="w-4 h-4 text-yellow-400" />}
                </div>

                <div>
                  <h3 className="text-[10px] font-bold text-stone-100">
                    {lang === "pt" ? item.namePt : item.nameEn}
                  </h3>
                  <p className="text-[8px] text-stone-400 mt-0.5 leading-relaxed">
                    {lang === "pt" ? item.descPt : item.descEn}
                  </p>
                </div>
              </div>

              {/* Right Column: Buy Button */}
              <div>
                {alreadyOwns ? (
                  <div className="flex items-center gap-1 text-emerald-400 text-[8px] font-bold" style={{ fontFamily: PIXEL_FONT }}>
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>POSSUÍDO</span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleBuy(item)}
                    className="px-2.5 py-1 rounded text-[8px] font-bold text-black flex items-center gap-1 cursor-pointer transition transform active:scale-95 hover:scale-102"
                    style={{
                      fontFamily: PIXEL_FONT,
                      background:
                        item.costType === "gold"
                          ? "linear-gradient(180deg, #ffd43b 0%, #f08c00 100%)"
                          : "linear-gradient(180deg, #38bdf8 0%, #0369a1 100%)",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.4)"
                    }}
                  >
                    <span>
                      {item.cost.toLocaleString()} {item.costType === "gold" ? "g" : "💎"}
                    </span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
