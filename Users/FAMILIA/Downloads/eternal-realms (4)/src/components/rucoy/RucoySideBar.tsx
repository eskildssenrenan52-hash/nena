import * as React from "react";
import { useEffect, useState } from "react";
import {
  Backpack,
  Users,
  Trophy,
  PawPrint,
  Award,
  Sparkles,
  X,
  Menu,
  Map,
  Fish,
  Hammer,
} from "lucide-react";
import InventoryModal from "./InventoryModal";
import PetsModal from "./PetsModal";
import BattlePassModal from "./BattlePassModal";
import RunesModal from "./RunesModal";
import ProfileModal from "./ProfileModal";
import TrophiesModal from "./TrophiesModal";
import ShopModal from "./ShopModal";
import FishingModal from "./FishingModal";
import EnchantModal from "./EnchantModal";
import SailingModal from "./SailingModal";
import { PIXEL_FONT, PIXEL_GOLD, PIXEL_GOLD_DARK, PIXEL_BORDER, PIXEL_WOOD } from "./ui/pixel";
import { useHostedGame } from "@/game/host";
import { useOverlayState, setOverlayState } from "@/rucoy/store";

type ModalId =
  | "inventory"
  | "pets"
  | "pass"
  | "runes"
  | "profile"
  | "trophies"
  | "shop"
  | "fishing"
  | "enchant"
  | "map"
  | "sailing"
  | null;


interface Props {
  playerLevel: number;
}

const BUTTONS: {
  id: Exclude<ModalId, null>;
  label: string;
  icon: React.ElementType;
  color: string;
}[] = [
  { id: "inventory", label: "Inventário", icon: Backpack, color: "#f59e0b" },
  { id: "profile", label: "Perfil", icon: Users, color: "#e64980" },
  { id: "map", label: "Mapa", icon: Map, color: "#22c55e" },
  { id: "runes", label: "Runas", icon: Sparkles, color: "#a78bfa" },
  { id: "pets", label: "Pets", icon: PawPrint, color: "#22c55e" },
  { id: "pass", label: "Passe", icon: Trophy, color: "#a855f7" },
  { id: "trophies", label: "Troféus", icon: Award, color: "#fa5252" },
  { id: "shop", label: "Loja", icon: Sparkles, color: "#ffd43b" },
  { id: "fishing", label: "Pesca", icon: Fish, color: "#22d3ee" },
  { id: "enchant", label: "Encantar", icon: Hammer, color: "#f0b040" },
];

export default function RucoySideBar({ playerLevel }: Props) {
  const state = useOverlayState();
  const open = state.activeModal as ModalId;
  const setOpen = (id: ModalId) => setOverlayState({ activeModal: id });
  const [isCollapsed, setIsCollapsed] = useState(true);
  const g = useHostedGame();

  // Track short viewport (landscape phones) → switch to a 2-column grid so
  // 10 buttons fit vertically without overflowing off-screen.
  const [twoCols, setTwoCols] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-height: 620px)");
    const update = () => setTwoCols(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return (
    <>
      {/* Right-side vertical pixel bar (works on desktop AND mobile). */}
      <div
        className="fixed z-40 flex flex-col gap-1.5 select-none items-end"
        style={{
          right: "max(0.4rem, env(safe-area-inset-right))",
          top: "50%",
          transform: "translateY(-50%) scale(0.55)",
          transformOrigin: "right center",
        }}
      >
        {/* Toggle Collapse Button */}
        <button
          onClick={() => setIsCollapsed((prev) => !prev)}
          aria-label={isCollapsed ? "Abrir Menu" : "Fechar Menu"}
          className="group relative flex items-center justify-center touch-manipulation hover:scale-105 active:scale-95 transition-transform"
          style={{
            width: 32,
            height: 32,
            background: "linear-gradient(180deg, #ca8a04 0%, #854d0e 100%)",
            border: `1.8px solid ${PIXEL_BORDER}`,
            boxShadow: `inset 0 0 0 1px ${PIXEL_GOLD}, inset 0 0 0 2px #120a08, 0 2px 0 #000`,
            imageRendering: "pixelated",
          }}
        >
          {isCollapsed ? (
            <Menu size={14} color="#f5c04a" strokeWidth={2.5} />
          ) : (
            <X size={14} color="#f5c04a" strokeWidth={2.5} />
          )}
          <span
            className="hidden md:block absolute right-full mr-2 px-1.5 py-0.5 whitespace-nowrap opacity-0 group-hover:opacity-100 transition"
            style={{
              background: "#120a08",
              color: "#facc15",
              border: `1.5px solid #facc15`,
              fontFamily: PIXEL_FONT,
              fontSize: 7,
              letterSpacing: 1,
              textTransform: "uppercase",
            }}
          >
            {isCollapsed ? "Menu" : "Fechar"}
          </span>
        </button>

        {/* Action Buttons list (visible only when expanded) */}
        {!isCollapsed && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: twoCols ? "repeat(2, 32px)" : "32px",
              gap: 6,
              justifyItems: "end",
            }}
          >
        {BUTTONS.map((b) => {
            const Icon = b.icon;
            const active =
              b.id === "map"
                ? g?.panel === "map"
                : open === b.id;

            const handleBtnClick = () => {
              if (b.id === "map") {
                if (g) {
                  g.panel = g.panel === "map" ? "none" : "map";
                }
                setOpen(null);
              } else {
                if (g) {
                  g.panel = "none";
                }
                setOpen(active ? null : b.id);
              }
            };

            return (
              <button
                key={b.id}
                onClick={handleBtnClick}
                aria-label={b.label}
                className="group relative flex items-center justify-center touch-manipulation animate-in slide-in-from-right-4 duration-150"
                style={{
                  width: 32,
                  height: 32,
                  background: active
                    ? `linear-gradient(180deg, ${b.color} 0%, ${b.color}66 100%)`
                    : `linear-gradient(180deg, #3a251a 0%, ${PIXEL_WOOD} 100%)`,
                  border: `1.8px solid ${PIXEL_BORDER}`,
                  boxShadow: active
                    ? `inset 0 0 0 1px #fff, inset 0 0 0 2px #120a08, 0 2px 0 #000`
                    : `inset 0 0 0 1px ${PIXEL_GOLD_DARK}, inset 0 0 0 2px #120a08, 0 2px 0 #000`,
                  imageRendering: "pixelated",
                  transform: active ? "translateY(1.5px)" : "translateY(0)",
                  transition: "transform 60ms",
                }}
              >
                <Icon size={14} color={active ? "#fff" : b.color} strokeWidth={2.2} />
                <span
                  className="hidden md:block absolute right-full mr-2 px-1.5 py-0.5 whitespace-nowrap opacity-0 group-hover:opacity-100 transition"
                  style={{
                    background: "#120a08",
                    color: b.color,
                    border: `1.5px solid ${b.color}`,
                    fontFamily: PIXEL_FONT,
                    fontSize: 7,
                    letterSpacing: 1,
                    textTransform: "uppercase",
                  }}
                >
                  {b.label}
                </span>
              </button>
            );
        })}
          </div>
        )}
      </div>


      {/* Modals */}
      {open && (
        <ModalShell title={BUTTONS.find((b) => b.id === open)?.label ?? "Navegação"} onClose={() => setOpen(null)}>
          {open === "inventory" && <InventoryModal />}
          {open === "profile" && <ProfileModal />}
          {open === "runes" && <RunesModal />}
          {open === "pets" && <PetsModal playerLevel={playerLevel} />}
          {open === "pass" && <BattlePassModal playerLevel={playerLevel} />}
          {/* classes modal removed intentionally */}
          {open === "trophies" && <TrophiesModal onClose={() => setOpen(null)} />}
          {open === "shop" && <ShopModal onClose={() => setOpen(null)} />}
          {open === "fishing" && <FishingModal />}
          {open === "enchant" && <EnchantModal />}
          {open === "sailing" && <SailingModal />}
        </ModalShell>
      )}
    </>
  );
}

function ModalShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const btn = BUTTONS.find((b) => b.label === title);
  const accent = btn?.color ?? "#f5c04a";
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 animate-in fade-in duration-200"
      style={{
        background:
          "radial-gradient(ellipse at center, rgba(20,8,4,0.65) 0%, rgba(0,0,0,0.85) 100%)",
        backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full ${btn?.id === "inventory" ? "sm:max-w-3xl lg:max-w-5xl" : "sm:max-w-sm"} flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-300`}
        style={{
          maxHeight: btn?.id === "inventory" ? "88vh" : "65vh",
          background: "linear-gradient(180deg, #2a1a12 0%, #1a0f0a 60%, #120806 100%)",
          border: `2px solid ${accent}`,
          boxShadow: `
            0 0 0 3px #0a0604,
            0 0 25px ${accent}44,
            inset 0 1px 0 rgba(255,255,255,0.08),
            inset 0 -2px 0 rgba(0,0,0,0.6),
            0 12px 40px rgba(0,0,0,0.8)
          `,
          borderRadius: 12,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
        }}
      >
        {/* Header */}
        <div
          className="relative flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5"
          style={{
            background: `linear-gradient(180deg, ${accent} 0%, ${accent}cc 55%, ${accent}88 100%)`,
            borderBottom: `2px solid #0a0604`,
            boxShadow: "inset 0 -2px 0 rgba(0,0,0,0.4), inset 0 1.5px 0 rgba(255,255,255,0.3)",
          }}
        >
          {/* decorative sparkle line */}
          <div
            className="absolute inset-x-4 -bottom-[2.5px] h-[2.5px] pointer-events-none"
            style={{
              background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
              filter: "blur(1.5px)",
              opacity: 0.6,
            }}
          />
          <div className="flex items-center gap-2 min-w-0">
            {btn && (
              <div
                className="shrink-0 flex items-center justify-center rounded"
                style={{
                  width: 26,
                  height: 26,
                  background: "rgba(20,8,4,0.55)",
                  border: "1.5px solid rgba(0,0,0,0.55)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.15)",
                }}
              >
                <btn.icon size={14} color="#fff2c8" strokeWidth={2.4} />
              </div>
            )}
            <h2
              className="truncate"
              style={{
                fontFamily: PIXEL_FONT,
                fontSize: 10,
                color: "#2a1300",
                letterSpacing: 1.5,
                textTransform: "uppercase",
                textShadow: "1px 1px 0 rgba(255,255,255,0.3)",
              }}
            >
              {title}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="shrink-0 flex items-center justify-center transition-transform active:scale-90 hover:rotate-90"
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: "linear-gradient(180deg,#ff5a5a 0%, #7a1010 100%)",
              border: "1.5px solid #0a0604",
              boxShadow:
                "inset 0 -2px 0 rgba(0,0,0,0.45), inset 0 1.5px 0 rgba(255,255,255,0.25), 0 2px 0 #0a0604",
              cursor: "pointer",
            }}
          >
            <X size={14} color="#fff" strokeWidth={3} />
          </button>
        </div>

        {/* Body */}
        <div
          className="flex-1 overflow-y-auto p-2 sm:p-3.5 overscroll-contain retro-scrollbar"
          style={{
            background: `
              radial-gradient(ellipse at top, ${accent}08 0%, transparent 60%),
              linear-gradient(180deg, #241612 0%, #1a0e0a 100%)
            `,
            backgroundSize: "100% 100%, 100% 100%",
          }}
        >
          {children}
        </div>

        {/* Footer decoration */}
        <div
          style={{
            height: 6,
            background: `linear-gradient(180deg, ${accent}44, transparent)`,
            borderTop: `1px solid ${accent}55`,
          }}
        />
      </div>
    </div>
  );
}

// Re-export for convenience
export { Users, Award };
