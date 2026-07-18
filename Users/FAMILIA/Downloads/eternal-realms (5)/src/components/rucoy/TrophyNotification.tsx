import { useEffect, useState } from "react";
import { useOverlayState } from "@/rucoy/store";
import { TROPHY_TRANSLATIONS } from "@/rucoy/trophies";
import { Award, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PIXEL_FONT } from "./ui/pixel";

interface NotificationData {
  id: string;
  amount: number;
  reasonPt: string;
  reasonEn: string;
  currentTrophies: number;
}

export default function TrophyNotification() {
  const state = useOverlayState();
  const lang = state.language || "pt";
  const t = TROPHY_TRANSLATIONS[lang];

  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  useEffect(() => {
    const handleTrophyGained = (e: Event) => {
      const customEvent = e as CustomEvent<{
        amount: number;
        reasonPt: string;
        reasonEn: string;
        currentTrophies: number;
      }>;
      
      const { amount, reasonPt, reasonEn, currentTrophies } = customEvent.detail;
      const id = Math.random().toString(36).substring(2, 9);

      // Add to list
      setNotifications((prev) => [
        ...prev,
        { id, amount, reasonPt, reasonEn, currentTrophies },
      ]);

      // Remove after 3.2 seconds
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, 3200);
    };

    window.addEventListener("trophy-gained", handleTrophyGained);
    return () => {
      window.removeEventListener("trophy-gained", handleTrophyGained);
    };
  }, []);

  return (
    <div className="fixed bottom-16 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none w-[90%] max-w-xs select-none">
      <AnimatePresence>
        {notifications.map((n) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.85, transition: { duration: 0.15 } }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="flex items-center gap-3 p-2.5 rounded-lg border text-white shadow-xl pointer-events-auto"
            style={{
              background: "linear-gradient(180deg, #1f120e 0%, #120a08 100%)",
              border: "2px solid #eab308",
              boxShadow: "0 8px 24px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.1)",
            }}
          >
            {/* Trophy Icon with sparkling badge background */}
            <div className="shrink-0 w-8 h-8 flex items-center justify-center rounded bg-yellow-500/10 border border-yellow-500/40 relative">
              <Award className="w-5 h-5 text-yellow-400 animate-pulse" />
              <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-0.5 animate-ping opacity-75" />
            </div>

            {/* Notification Text */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-yellow-400 tracking-wide" style={{ fontFamily: PIXEL_FONT }}>
                  +{n.amount} {t.trophies.toUpperCase()}!
                </span>
                <span className="text-[7px] text-stone-400 font-mono">
                  {t.progress}: {n.currentTrophies} 🏆
                </span>
              </div>
              <p className="text-[8px] text-stone-200 mt-0.5 truncate leading-tight">
                {lang === "pt" ? n.reasonPt : n.reasonEn}
              </p>
            </div>

            {/* Sparkly visual details */}
            <div className="shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-yellow-500/60 animate-bounce" />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
