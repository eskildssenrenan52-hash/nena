import { useState } from "react";
import { BATTLE_PASS, PASS_SEASON } from "@/rucoy/battlePass";
import { useOverlayState, setOverlayState } from "@/rucoy/store";
import { claimAndQueuePassReward } from "@/rucoy/bridge";
import {
  PixelPanel,
  PixelTitle,
  PixelButton,
  PixelBar,
  PIXEL_FONT,
  PIXEL_GOLD,
} from "./ui/pixel";

export default function BattlePassModal({ playerLevel }: { playerLevel: number }) {
  const state = useOverlayState();
  const [feedback, setFeedback] = useState<string | null>(null);
  const nextTierLevel = Math.floor(playerLevel / 10) * 10 + 10;

  const handleBuyPremium = () => {
    if (state.hasPremium) return;
    if (state.gems < 100) {
      showFeedback("Você precisa de 100 💎 para o Passe Premium!");
      return;
    }
    setOverlayState((cs) => ({
      ...cs,
      hasPremium: true,
      gems: cs.gems - 100,
    }));
    showFeedback("PASSE PREMIUM ATIVADO COM SUCESSO! 🎉");
  };

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 2500);
  };

  return (
    <div style={{ fontFamily: PIXEL_FONT, color: "#e8d5a8", display: "flex", flexDirection: "column", gap: 12 }}>
      {feedback && (
        <div
          style={{
            padding: 8,
            textAlign: "center",
            fontSize: 9,
            background: "rgba(10, 6, 4, 0.9)",
            border: `2px solid ${PIXEL_GOLD}`,
            color: "#fff",
            borderRadius: 6,
            animation: "bounce 1s infinite",
          }}
        >
          {feedback.toUpperCase()}
        </div>
      )}

      <PixelPanel tone="stone">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <div>
            <PixelTitle size={12} color="#c4b5fd">{PASS_SEASON.name.toUpperCase()}</PixelTitle>
            <div style={{ fontSize: 7, color: "#c9a86a", marginTop: 4, letterSpacing: 1 }}>
              TERMINA EM {PASS_SEASON.endsIn.toUpperCase()}
            </div>
          </div>
          {!state.hasPremium ? (
            <PixelButton variant="gold" size={10} onClick={handleBuyPremium}>
              💎 COMPRAR PREMIUM (100)
            </PixelButton>
          ) : (
            <span style={{ fontSize: 9, color: "#22c55e", fontWeight: "bold" }}>✨ PREMIUM ATIVO</span>
          )}
        </div>
        <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 8, color: "#c9a86a" }}>NVL {playerLevel}</span>
          <div style={{ flex: 1 }}>
            <PixelBar value={playerLevel % 10} max={10} color="#a855f7" />
          </div>
          <span style={{ fontSize: 8, color: "#c9a86a" }}>NVL {nextTierLevel}</span>
        </div>
      </PixelPanel>

      <div style={{ overflowX: "auto", paddingBottom: 6 }}>
        <div style={{ display: "flex", gap: 6, minWidth: "max-content" }}>
          {BATTLE_PASS.map((tier) => {
            const unlocked = playerLevel >= tier.level;
            const claimedFree = state.claimedFree.includes(tier.level);
            const claimedPremium = state.claimedPremium.includes(tier.level);
            return (
              <PixelPanel
                key={tier.level}
                tone="wood"
                padded={false}
                style={{ width: 128, flexShrink: 0, opacity: unlocked ? 1 : 0.5 }}
              >
                <div
                  style={{
                    textAlign: "center",
                    padding: 6,
                    background: unlocked ? "linear-gradient(180deg,#f5c04a,#a86a12)" : "#0a0906",
                    borderBottom: "2px solid #120a08",
                    fontFamily: PIXEL_FONT,
                    fontSize: 9,
                    color: unlocked ? "#2a1300" : "#5a4020",
                    letterSpacing: 1,
                  }}
                >
                  NVL {tier.level}
                </div>
                <RewardCard
                  label="GRÁTIS"
                  reward={tier.free}
                  claimed={claimedFree}
                  unlocked={unlocked}
                  onClaim={() => claimAndQueuePassReward(tier.level, false)}
                  tone="ghost"
                />
                <RewardCard
                  label="PREMIUM"
                  reward={tier.premium}
                  claimed={claimedPremium}
                  unlocked={unlocked && state.hasPremium}
                  onClaim={() => claimAndQueuePassReward(tier.level, true)}
                  tone="premium"
                  needsPremium={!state.hasPremium}
                />
              </PixelPanel>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function RewardCard({
  label,
  reward,
  claimed,
  unlocked,
  onClaim,
  tone,
  needsPremium,
}: {
  label: string;
  reward: { icon: string; label: string; amount?: number };
  claimed: boolean;
  unlocked: boolean;
  onClaim: () => void;
  tone: "ghost" | "premium";
  needsPremium?: boolean;
}) {
  const headerBg = tone === "premium" ? "linear-gradient(90deg,#a855f7,#ec4899)" : "#2a1e14";
  return (
    <div style={{ borderTop: "2px solid #120a08" }}>
      <div
        style={{
          fontFamily: PIXEL_FONT,
          fontSize: 7,
          color: "#fff",
          textAlign: "center",
          padding: 3,
          background: headerBg,
          letterSpacing: 1,
          textShadow: "1px 1px 0 #000",
        }}
      >
        {label}
      </div>
      <div style={{ padding: 6, display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
        <div
          style={{
            width: 60,
            height: 60,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 26,
            border: `2px solid ${claimed ? "#22c55e" : unlocked ? PIXEL_GOLD : "#3a251a"}`,
            boxShadow: "inset 0 0 0 2px #000",
            background: claimed ? "rgba(34,197,94,0.15)" : "rgba(0,0,0,0.45)",
            filter: unlocked ? "none" : "grayscale(1)",
          }}
        >
          {reward.icon}
        </div>
        <div style={{ fontSize: 7, textAlign: "center", color: "#e8d5a8", minHeight: 22, lineHeight: 1.5 }}>
          {reward.label}
        </div>
        <PixelButton
          variant={claimed ? "green" : needsPremium && tone === "premium" ? "ghost" : "gold"}
          disabled={!unlocked || claimed}
          onClick={onClaim}
          size={7}
          style={{ width: "100%", padding: "5px 4px" }}
        >
          {claimed ? "OK" : needsPremium && tone === "premium" ? "🔒" : unlocked ? "COLETAR" : "🔒"}
        </PixelButton>
      </div>
    </div>
  );
}
