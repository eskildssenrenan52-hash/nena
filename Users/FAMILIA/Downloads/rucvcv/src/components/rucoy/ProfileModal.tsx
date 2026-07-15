import { useState, useEffect, useRef } from "react";
import { useOverlayState, setOverlayState, type CustomizationState } from "@/rucoy/store";
import { TROPHY_TRANSLATIONS } from "@/rucoy/trophies";
import { enqueueReward } from "@/rucoy/bridge";
import { PIXEL_FONT, PIXEL_GOLD, PIXEL_BORDER, PixelPanel, PixelButton, PixelBar } from "./ui/pixel";
import {
  Sparkles,
  Eye,
  Shield,
  Key,
  Lock,
  Palette,
  Swords,
  Award,
  Star,
  Coins,
  ShoppingBag,
  Plus,
  User,
  Brain,
  Zap,
  Heart,
} from "lucide-react";
import { useHostedGame, useHostedTick, bumpVersion } from "@/game/host";
import { allocAttr, recalculateStats } from "@/game/game";
import { getSkinSlug } from "@/game/render";
import { getSpriteBySlug } from "@/game/sprites";
import { getCustomOptionsForCategory } from "./CustomizationModal";

type AttrKey = "str" | "agi" | "int" | "vit";

const ATTR_META: Record<
  AttrKey,
  { label: string; short: string; color: string; icon: typeof Swords; desc: string }
> = {
  str: {
    label: "Força",
    short: "STR",
    color: "#ff6b4a",
    icon: Swords,
    desc: "Aumenta o dano de ataque físico e habilidades.",
  },
  agi: {
    label: "Agilidade",
    short: "AGI",
    color: "#4ade80",
    icon: Zap,
    desc: "Aumenta o dano ágil e mobilidade.",
  },
  int: {
    label: "Inteligência",
    short: "INT",
    color: "#60a5fa",
    icon: Brain,
    desc: "Aumenta MP máximo e cura.",
  },
  vit: {
    label: "Vitalidade",
    short: "VIT",
    color: "#f472b6",
    icon: Heart,
    desc: "Aumenta HP máximo e defesa base.",
  },
};

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

function PlayerPreviewCanvas({ cls, skin }: { cls: string; skin: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let active = true;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const tick = () => {
      if (!active) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Shadow
      ctx.fillStyle = "rgba(0,0,0,0.4)";
      ctx.beginPath();
      ctx.ellipse(32, 48, 12, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Bobbing
      const bob = Math.sin(Date.now() / 150) * 1.5;

      const skinSlug = getSkinSlug(cls, skin);
      const sprite = getSpriteBySlug(skinSlug);
      if (sprite) {
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(sprite, 16, 12 + bob, 32, 32);
      }

      requestAnimationFrame(tick);
    };

    tick();
    return () => {
      active = false;
    };
  }, [cls, skin]);

  return (
    <canvas
      ref={canvasRef}
      width={64}
      height={64}
      style={{
        width: 64,
        height: 64,
        display: "block",
        imageRendering: "pixelated",
        background: "rgba(0,0,0,0.55)",
        border: `2px solid ${PIXEL_GOLD}`,
        borderRadius: 8,
        boxShadow: "inset 0 0 10px rgba(245,192,74,0.15)",
      }}
    />
  );
}

export default function ProfileModal() {
  const state = useOverlayState();
  const g = useHostedGame();
  useHostedTick(300);

  const [activeTab, setActiveTab] = useState<"attributes" | "customization">("attributes");
  const [custCategory, setCustCategory] = useState<keyof CustomizationState>("title");
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!g) {
    return (
      <div style={{ fontFamily: PIXEL_FONT, color: PIXEL_GOLD, fontSize: 10, padding: 12 }}>
        CARREGANDO PERFIL...
      </div>
    );
  }

  const p = g.player;
  const lang = state.language;

  const t = {
    attributes: lang === "pt" ? "Atributos" : "Attributes",
    appearance: lang === "pt" ? "Aparência" : "Appearance",
    points: lang === "pt" ? "PONTOS" : "POINTS",
    gold: lang === "pt" ? "Ouro" : "Gold",
    gems: lang === "pt" ? "Gemas" : "Gems",
    equipped: lang === "pt" ? "Equipado" : "Equipped",
    categories: lang === "pt" ? "Categorias" : "Categories",
    unlocked: lang === "pt" ? "Desbloqueado" : "Unlocked",
    equip: lang === "pt" ? "Equipar" : "Equip",
    noCoins: lang === "pt" ? "Sem ouro suficiente!" : "Not enough gold!",
    noGems: lang === "pt" ? "Sem gemas suficientes!" : "Not enough gems!",
    successBuy: lang === "pt" ? "Comprado e equipado! ✨" : "Bought and equipped! ✨",
  };

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 1800);
  };

  const doAlloc = (k: AttrKey) => {
    if (p.attrPoints <= 0) return;
    allocAttr(g, k);
    recalculateStats(g);
    bumpVersion();
  };

  const attrKeys: AttrKey[] = ["str", "agi", "int", "vit"];

  // Customization variables
  const currentOptions = getCustomOptionsForCategory(custCategory);
  const currentEquipped = state.customization[custCategory];
  const playerGold = p.gold;
  const userGems = state.gems;

  const handleSelectCustom = (opt: any) => {
    const isUnlocked = state.unlockedCustomizations.includes(opt.id) || opt.cost === 0;

    if (isUnlocked) {
      setOverlayState((cs) => ({
        ...cs,
        customization: {
          ...cs.customization,
          [custCategory]: opt.namePt,
        },
      }));
      showFeedback(`${opt[lang === "pt" ? "namePt" : "nameEn"]} EQUIPADO!`);
    } else {
      if (opt.costType === "gems" && userGems < opt.cost) {
        showFeedback(t.noGems);
        return;
      }
      if (opt.costType === "gold" && playerGold < opt.cost) {
        showFeedback(t.noCoins);
        return;
      }

      if (opt.costType === "gold") {
        enqueueReward({ kind: "gold", amount: -opt.cost });
      } else {
        setOverlayState((cs) => ({ ...cs, gems: cs.gems - opt.cost }));
      }

      setOverlayState((cs) => ({
        ...cs,
        unlockedCustomizations: [...cs.unlockedCustomizations, opt.id],
        customization: {
          ...cs.customization,
          [custCategory]: opt.namePt,
        },
      }));

      showFeedback(t.successBuy);
    }
  };

  return (
    <div
      style={{
        fontFamily: PIXEL_FONT,
        color: "#e8d8a8",
        fontSize: 9,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        padding: "8px 10px",
        overflowY: "auto",
        gap: 8,
      }}
    >
      {/* Real-time Player Card */}
      <div
        style={{
          display: "flex",
          gap: 10,
          background: "rgba(0,0,0,0.4)",
          padding: 8,
          borderRadius: 8,
          border: `1.5px solid ${PIXEL_GOLD}44`,
        }}
      >
        <PlayerPreviewCanvas cls={p.cls} skin={p.skin ?? 0} />

        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 3, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span style={{ fontSize: 11, color: PIXEL_GOLD, fontWeight: "bold" }}>
              NÍVEL {p.level} ({p.cls.toUpperCase()})
            </span>
            <span style={{ fontSize: 8, color: "#a8987a" }}>{state.customization.title}</span>
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 7, color: "#f87171" }}>
              <span>HP {Math.round(p.hp)}/{p.maxHp}</span>
            </div>
            <PixelBar value={p.hp} max={p.maxHp} color="#ef4444" height={6} />
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 7, color: "#60a5fa" }}>
              <span>MP {Math.round(p.mp)}/{p.maxMp}</span>
            </div>
            <PixelBar value={p.mp} max={p.maxMp} color="#3b82f6" height={6} />
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 7, color: PIXEL_GOLD }}>
              <span>XP {Math.floor(p.xp)}/{p.xpNext}</span>
            </div>
            <PixelBar value={p.xp} max={p.xpNext} color={PIXEL_GOLD} height={5} />
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div style={{ display: "flex", gap: 6 }}>
        <PixelButton
          variant={activeTab === "attributes" ? "gold" : "ghost"}
          size={8}
          style={{ flex: 1, padding: "5px 0" }}
          onClick={() => setActiveTab("attributes")}
        >
          ⚡ {t.attributes.toUpperCase()}
        </PixelButton>
        <PixelButton
          variant={activeTab === "customization" ? "gold" : "ghost"}
          size={8}
          style={{ flex: 1, padding: "5px 0" }}
          onClick={() => setActiveTab("customization")}
        >
          🎨 {t.appearance.toUpperCase()}
        </PixelButton>
      </div>

      {/* Tab Contents */}
      <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
        {activeTab === "attributes" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {/* Points Summary */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "rgba(0,0,0,0.3)",
                padding: "4px 8px",
                border: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <span style={{ color: "#a8987a" }}>PONTOS DE ATRIBUTO:</span>
              <span
                style={{
                  color: p.attrPoints > 0 ? "#4ade80" : "#fff",
                  fontWeight: "bold",
                  fontSize: 11,
                }}
              >
                {p.attrPoints}
              </span>
            </div>

            {/* Attributes List */}
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {attrKeys.map((k) => {
                const m = ATTR_META[k];
                const val = p.attr[k];
                const cap = Math.max(50, Math.ceil(val / 50) * 50);
                return (
                  <div
                    key={k}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      background: "rgba(0,0,0,0.45)",
                      padding: 6,
                      border: `1px solid ${m.color}33`,
                      borderRadius: 4,
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                        <span style={{ color: m.color, fontWeight: "bold" }}>{m.label.toUpperCase()}</span>
                        <span style={{ color: "#fff", fontWeight: "bold" }}>{val}</span>
                      </div>
                      <PixelBar value={val} max={cap} color={m.color} height={4} />
                    </div>
                    <PixelButton
                      variant={p.attrPoints > 0 ? "gold" : "ghost"}
                      disabled={p.attrPoints <= 0}
                      onClick={() => doAlloc(k)}
                      size={6}
                      style={{ padding: "4px 8px", minWidth: 32 }}
                    >
                      +1
                    </PixelButton>
                  </div>
                );
              })}
            </div>

            {/* Extra Stats summary row */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 6,
                background: "rgba(0,0,0,0.2)",
                padding: 6,
                borderRadius: 4,
              }}
            >
              <div style={{ textAlign: "center" }}>
                <span style={{ color: "#ff6b4a" }}>ATAQUE:</span>{" "}
                <strong style={{ color: "#fff" }}>{p.atk()}</strong>
              </div>
              <div style={{ textAlign: "center" }}>
                <span style={{ color: "#60a5fa" }}>DEFESA:</span>{" "}
                <strong style={{ color: "#fff" }}>{p.def()}</strong>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
            {/* Wallets */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                background: "rgba(0,0,0,0.35)",
                padding: 4,
                borderRadius: 4,
                fontSize: 8,
              }}
            >
              <span style={{ color: "#facc15", display: "flex", alignItems: "center", gap: 2 }}>
                <Coins size={10} /> {p.gold.toLocaleString()}
              </span>
              <span style={{ color: "#60a5fa", display: "flex", alignItems: "center", gap: 2 }}>
                <ShoppingBag size={10} /> {userGems} Gems
              </span>
            </div>

            {/* Customization Grid */}
            <div style={{ display: "flex", gap: 6, height: "130px" }}>
              {/* Left Column: Categories list */}
              <div
                style={{
                  width: "40%",
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: 3,
                  background: "rgba(0,0,0,0.2)",
                  padding: 2,
                }}
              >
                {CATEGORIES.map((c) => {
                  const isSelected = custCategory === c.id;
                  return (
                    <button
                      key={c.id}
                      onClick={() => setCustCategory(c.id)}
                      style={{
                        padding: "3px 4px",
                        textAlign: "left",
                        background: isSelected ? "rgba(245,192,74,0.15)" : "transparent",
                        border: isSelected ? `1px solid ${PIXEL_GOLD}` : "1px solid transparent",
                        color: isSelected ? PIXEL_GOLD : "#ccc",
                        fontSize: 7,
                        borderRadius: 3,
                        cursor: "pointer",
                      }}
                    >
                      {lang === "pt" ? c.namePt : c.nameEn}
                    </button>
                  );
                })}
              </div>

              {/* Right Column: Options grid */}
              <div
                style={{
                  width: "60%",
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: 3,
                  background: "rgba(0,0,0,0.35)",
                  padding: 4,
                }}
              >
                {feedback && (
                  <div
                    style={{
                      background: "rgba(10,6,4,0.9)",
                      border: "1px solid #f5c04a",
                      color: "#fff",
                      fontSize: 7,
                      textAlign: "center",
                      padding: 2,
                      borderRadius: 3,
                    }}
                  >
                    {feedback.toUpperCase()}
                  </div>
                )}

                {currentOptions.map((opt) => {
                  const isUnlocked = state.unlockedCustomizations.includes(opt.id) || opt.cost === 0;
                  const isEquipped = currentEquipped === opt.namePt;

                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectCustom(opt)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: 4,
                        background: isEquipped
                          ? "rgba(34,197,94,0.15)"
                          : isUnlocked
                          ? "rgba(255,255,255,0.05)"
                          : "rgba(0,0,0,0.25)",
                        border: isEquipped
                          ? "1px solid #22c55e"
                          : "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 3,
                        fontSize: 7,
                        color: "#fff",
                        textAlign: "left",
                        cursor: "pointer",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 3, minWidth: 0 }}>
                        <div
                          style={{
                            width: 5,
                            height: 5,
                            borderRadius: "50%",
                            backgroundColor: opt.color,
                            flexShrink: 0,
                          }}
                        />
                        <span style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                          {lang === "pt" ? opt.namePt : opt.nameEn}
                        </span>
                      </div>

                      <div style={{ fontSize: 6, flexShrink: 0 }}>
                        {isEquipped ? (
                          <span style={{ color: "#22c55e" }}>ATIVO</span>
                        ) : isUnlocked ? (
                          <span style={{ color: "#a8987a" }}>EQUIPAR</span>
                        ) : (
                          <span style={{ color: "#facc15" }}>
                            {opt.cost}
                            {opt.costType === "gold" ? "g" : "💎"}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
