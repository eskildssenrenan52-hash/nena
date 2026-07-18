import { useState, useRef, useEffect } from "react";
import { useOverlayState, setOverlayState } from "@/rucoy/store";
import { getTrophyMilestones, TROPHY_TRANSLATIONS, type TrophyMilestone } from "@/rucoy/trophies";
import { enqueueReward } from "@/rucoy/bridge";
import { PIXEL_FONT, PIXEL_GOLD, PIXEL_BORDER, PIXEL_WOOD } from "./ui/pixel";
import { Award, Lock, CheckCircle, Gift, Globe, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  onClose: () => void;
}

export default function TrophiesModal({ onClose }: Props) {
  const state = useOverlayState();
  const lang = state.language || "pt";
  const t = TROPHY_TRANSLATIONS[lang];

  // Get milestones
  const allMilestones = getTrophyMilestones();
  
  // Show first 200 milestones (or all, but scroll nicely)
  // Let's filter or slice so the modal is fast, but let's show all since it's virtualized or lists nicely with scroll.
  // Actually, standard list with scroll is perfectly fine, we can render the first 300 initially or all 2000 in a container with scrolling.
  // To keep it high-performing, let's display the first 250 milestones, and show "Carregar Mais" if they want to scroll further,
  // or focus around their current trophy level so they don't have to scroll from 0! This is an amazing user experience.
  const userTrophies = state.trophies || 0;
  
  // Find index closest to user trophies so we can auto-scroll or focus
  const currentMilestoneIndex = allMilestones.findIndex((m) => m.trophies > userTrophies);
  const initialShowCount = Math.max(100, currentMilestoneIndex + 50);
  const [displayCount, setDisplayCount] = useState(initialShowCount);

  const listRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to current progression on load
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.querySelector("[data-active='true']");
      if (activeEl) {
        activeEl.scrollIntoView({ block: "center", behavior: "smooth" });
      }
    }
  }, []);

  const handleClaim = (m: TrophyMilestone) => {
    if (userTrophies < m.trophies) return;
    if (state.claimedTrophyMilestones.includes(m.trophies)) return;

    // Apply reward
    if (m.rewardType === "gold") {
      enqueueReward({ kind: "gold", amount: m.rewardAmount });
    } else if (m.rewardType === "gems") {
      setOverlayState((cs) => ({ ...cs, gems: cs.gems + m.rewardAmount }));
    } else if (m.rewardType === "pet") {
      // Unlock mini titan or golden sentinel
      const petId = m.trophies === 500 ? "pet-10" : "pet-25"; // thematic IDs
      setOverlayState((cs) => {
        const unlocked = [...cs.unlockedPets];
        if (!unlocked.includes(petId)) unlocked.push(petId);
        return { ...cs, unlockedPets: unlocked };
      });
    } else if (m.rewardType === "skin") {
      // Unlock title or custom trail
      const customId = m.trophies === 50 ? "title_Novato Incansável" : "trail_Rastro de Fogo";
      setOverlayState((cs) => {
        const unlocked = [...cs.unlockedCustomizations];
        if (!unlocked.includes(customId)) unlocked.push(customId);
        return { ...cs, unlockedCustomizations: unlocked };
      });
    } else if (m.rewardType === "chest") {
      // Chest reward
      enqueueReward({ kind: "chest", amount: m.rewardAmount });
    }

    // Mark as claimed
    setOverlayState((cs) => ({
      ...cs,
      claimedTrophyMilestones: [...cs.claimedTrophyMilestones, m.trophies],
    }));
  };

  const toggleLanguage = () => {
    setOverlayState((cs) => ({
      ...cs,
      language: cs.language === "pt" ? "en" : "pt",
    }));
  };

  const visibleMilestones = allMilestones.slice(0, displayCount);

  return (
    <div className="flex flex-col h-full text-white">
      {/* Top Controls: Language and Info */}
      <div className="flex items-center justify-between border-b border-yellow-900/40 pb-2 mb-2">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-yellow-400 animate-pulse" />
          <div>
            <div className="text-xs text-yellow-400 font-bold" style={{ fontFamily: PIXEL_FONT }}>
              {userTrophies} 🏆 {t.trophies.toUpperCase()}
            </div>
            <div className="text-[9px] text-gray-400">
              {t.progress}: {Math.min(100, Math.floor((userTrophies / 100000) * 100))}% (100k Max)
            </div>
          </div>
        </div>

        {/* Mini Language Switcher */}
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-1.5 px-2 py-1 bg-yellow-950/40 border border-yellow-700/50 rounded hover:bg-yellow-900/60 transition"
          style={{ fontFamily: PIXEL_FONT, fontSize: 8 }}
        >
          <Globe className="w-3 h-3 text-yellow-500" />
          <span>{lang.toUpperCase()}</span>
        </button>
      </div>

      {/* Progress Track (Brawl Stars Style) */}
      <div
        ref={listRef}
        className="flex-1 overflow-y-auto pr-1 space-y-1.5 scrollbar-thin scrollbar-thumb-yellow-950 scrollbar-track-transparent"
        style={{ maxHeight: "calc(85vh - 120px)" }}
      >
        {visibleMilestones.map((m, idx) => {
          const isReached = userTrophies >= m.trophies;
          const isClaimed = state.claimedTrophyMilestones.includes(m.trophies);
          const isCurrent = isReached && !isClaimed;
          
          // Next milestone to reach is the first one where userTrophies < m.trophies
          const isNextToReach = idx > 0 && allMilestones[idx - 1].trophies <= userTrophies && userTrophies < m.trophies;

          return (
            <div
              key={m.trophies}
              data-active={isCurrent || isNextToReach}
              className={`relative flex items-center justify-between p-2 rounded border transition-all ${
                isClaimed
                  ? "bg-emerald-950/20 border-emerald-900/30 opacity-75"
                  : isCurrent
                  ? "bg-yellow-500/10 border-yellow-500/60 ring-1 ring-yellow-500/40"
                  : isReached
                  ? "bg-blue-950/20 border-blue-900/40"
                  : "bg-stone-900/40 border-stone-800/60"
              }`}
            >
              {/* Left Column: Trophy Level Indicator */}
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 flex items-center justify-center rounded-full text-[10px] font-bold border-2 ${
                    isReached
                      ? "bg-gradient-to-b from-yellow-400 to-yellow-600 text-black border-yellow-300"
                      : "bg-stone-800 text-stone-500 border-stone-700"
                  }`}
                  style={{ fontFamily: PIXEL_FONT }}
                >
                  {m.trophies}
                </div>

                {/* Reward details */}
                <div>
                  <div className="text-[10px] font-bold flex items-center gap-1">
                    <Gift className={`w-3.5 h-3.5 ${isReached ? "text-yellow-400" : "text-gray-500"}`} />
                    <span className={isReached ? "text-yellow-100" : "text-stone-400"}>
                      {lang === "pt" ? m.rewardNamePt : m.rewardNameEn}
                    </span>
                  </div>
                  <div className="text-[8px] text-stone-400 mt-0.5">
                    {m.rewardType === "gold" && "Ouro Extra"}
                    {m.rewardType === "gems" && "Gemas Premium"}
                    {m.rewardType === "chest" && "Baú com Itens Raros"}
                    {m.rewardType === "skin" && "Customização Visual"}
                    {m.rewardType === "pet" && "Companheiro Exclusivo"}
                  </div>
                </div>
              </div>

              {/* Right Column: Claim Button / Status */}
              <div>
                {isClaimed ? (
                  <div className="flex items-center gap-1 px-2 py-1 text-emerald-400 text-[8px]" style={{ fontFamily: PIXEL_FONT }}>
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>{t.claimed.toUpperCase()}</span>
                  </div>
                ) : isCurrent ? (
                  <button
                    onClick={() => handleClaim(m)}
                    className="px-3 py-1 text-[8px] font-bold text-black rounded animate-pulse cursor-pointer transition transform active:scale-90 hover:scale-105"
                    style={{
                      fontFamily: PIXEL_FONT,
                      background: "linear-gradient(180deg, #ffca28 0%, #ffa000 100%)",
                      border: "2px solid #ffca28",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.4)"
                    }}
                  >
                    {t.claim.toUpperCase()}
                  </button>
                ) : isReached ? (
                  <div className="flex items-center gap-1 px-2 py-1 text-blue-400 text-[8px]" style={{ fontFamily: PIXEL_FONT }}>
                    <Gift className="w-3.5 h-3.5" />
                    <span>LIBERADO</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 px-2 py-1 text-stone-600 text-[8px]" style={{ fontFamily: PIXEL_FONT }}>
                    <Lock className="w-3 h-3" />
                    <span>{t.locked.toUpperCase()}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Load More Button */}
        {displayCount < allMilestones.length && (
          <button
            onClick={() => setDisplayCount((prev) => Math.min(allMilestones.length, prev + 150))}
            className="w-full py-2 bg-stone-900/60 hover:bg-stone-850 border border-stone-800 rounded text-center text-[9px] hover:text-yellow-400 transition"
            style={{ fontFamily: PIXEL_FONT }}
          >
            CARREGAR MAIS MARCOS DE TROFÉU...
          </button>
        )}
      </div>
    </div>
  );
}
