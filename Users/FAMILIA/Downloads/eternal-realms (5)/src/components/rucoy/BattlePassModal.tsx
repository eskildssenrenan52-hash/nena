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

  const totalRewards = BATTLE_PASS.length * 2;
  const claimedCount = state.claimedFree.length + state.claimedPremium.length;

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

  // MISSÕES DE TEMPORADA (Simuladas e integradas com status do jogador)
  const SEASON_MISSIONS = [
    {
      id: 1,
      title: "⚔️ CAMPEÃO DO COLISEU",
      desc: "Derrote oponentes e avance ondas na Arena da Sobrevivência.",
      progress: Math.min(100, Math.floor((playerLevel / 35) * 100)),
      status: playerLevel >= 30 ? "CONCLUÍDO" : "EM PROGRESSO",
      xp: "+350 XP PASSE",
    },
    {
      id: 2,
      title: "🎣 MESTRE DAS ISCAS",
      desc: "Capture peixes lendários no Livro de Recordes de Pesca.",
      progress: Math.min(100, Math.floor((state.claimedFree.length + 1) * 20)),
      status: state.claimedFree.length >= 4 ? "CONCLUÍDO" : "EM PROGRESSO",
      xp: "+200 XP PASSE",
    },
    {
      id: 3,
      title: "🔨 FORJA TRANSCENDENTAL",
      desc: "Aprimore seus equipamentos com minérios raros do Ferreiro.",
      progress: state.hasPremium ? 100 : 33,
      status: state.hasPremium ? "CONCLUÍDO" : "EM PROGRESSO",
      xp: "+500 XP PASSE",
    },
  ];

  return (
    <div style={{ fontFamily: PIXEL_FONT, color: "#e8d5a8", display: "flex", flexDirection: "column", gap: 12 }}>
      {feedback && (
        <div
          style={{
            padding: 8,
            textAlign: "center",
            fontSize: 8,
            background: "rgba(10, 6, 4, 0.95)",
            border: `2px solid ${PIXEL_GOLD}`,
            color: "#fff",
            borderRadius: 4,
            animation: "bounce 1s infinite",
            letterSpacing: 1,
            boxShadow: "0 0 12px rgba(251,191,36,0.3)"
          }}
        >
          {feedback.toUpperCase()}
        </div>
      )}

      {/* CARD DA TEMPORADA ATUAL (MUITO REFINADO) */}
      <PixelPanel tone="stone">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 16 }}>🏵️</span>
              <PixelTitle size={11} color="#c4b5fd">{PASS_SEASON.name.toUpperCase()}</PixelTitle>
            </div>
            <div style={{ fontSize: 7, color: "#c9a86a", marginTop: 4, letterSpacing: 1, fontWeight: "bold" }}>
              ⏳ TEMPO RESTANTE: {PASS_SEASON.endsIn.toUpperCase()} · <span style={{ color: "#22c55e" }}>{claimedCount}/{totalRewards} COLETADOS</span>
            </div>
          </div>
          {!state.hasPremium ? (
            <PixelButton variant="gold" size={9} onClick={handleBuyPremium}>
              💎 COMPRAR PREMIUM (100)
            </PixelButton>
          ) : (
            <div style={{ padding: "4px 8px", background: "rgba(34,197,94,0.12)", border: "2px solid #22c55e", borderRadius: 4, display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: 12 }}>✨</span>
              <span style={{ fontSize: 7, color: "#4ade80", fontWeight: "bold", letterSpacing: 1 }}>PASSE PREMIUM ATIVO</span>
            </div>
          )}
        </div>
        <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 7, color: "#c9a86a", fontWeight: "bold" }}>NVL {playerLevel}</span>
          <div style={{ flex: 1 }}>
            <PixelBar value={playerLevel % 10} max={10} color="#a855f7" height={8} />
          </div>
          <span style={{ fontSize: 7, color: "#c9a86a", fontWeight: "bold" }}>NVL {nextTierLevel}</span>
        </div>
      </PixelPanel>

      {/* LINHA HORIZONTAL DE RECOMPENSAS */}
      <div style={{ fontSize: 8, color: "#fff", letterSpacing: 1, fontWeight: "bold", marginBottom: 2 }}>
        🎁 ESTEIRA DE RECOMPENSAS DA TEMPORADA:
      </div>
      <div style={{ overflowX: "auto", paddingBottom: 8 }}>
        <div style={{ display: "flex", gap: 8, minWidth: "max-content", padding: "4px 2px" }}>
          {BATTLE_PASS.map((tier) => {
            const unlocked = playerLevel >= tier.level;
            const claimedFree = state.claimedFree.includes(tier.level);
            const claimedPremium = state.claimedPremium.includes(tier.level);
            return (
              <PixelPanel
                key={tier.level}
                tone="wood"
                padded={false}
                style={{ 
                  width: 132, 
                  flexShrink: 0, 
                  opacity: unlocked ? 1 : 0.65,
                  border: unlocked ? `2px solid ${PIXEL_GOLD}` : "2px solid #3a251a",
                  boxShadow: unlocked ? "0 0 10px rgba(251,191,36,0.15)" : "none",
                }}
              >
                <div
                  style={{
                    textAlign: "center",
                    padding: "5px 6px",
                    background: unlocked ? "linear-gradient(180deg,#f5c04a,#a86a12)" : "#1c120c",
                    borderBottom: "2px solid #120a08",
                    fontFamily: PIXEL_FONT,
                    fontSize: 8,
                    color: unlocked ? "#1e0b00" : "#785c3b",
                    fontWeight: "bold",
                    letterSpacing: 1.2,
                  }}
                >
                  NÍVEL DE PASSE {tier.level}
                </div>
                <RewardCard
                  label="🟤 TRILHA GRÁTIS"
                  reward={tier.free}
                  claimed={claimedFree}
                  unlocked={unlocked}
                  onClaim={() => claimAndQueuePassReward(tier.level, false)}
                  tone="ghost"
                />
                <RewardCard
                  label="🟣 PREMIUM"
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

      {/* QUADRO DE MISSÕES DE TEMPORADA (NOVO - 100x MAIS REFINADO) */}
      <PixelPanel tone="stone">
        <div style={{ fontSize: 9, color: PIXEL_GOLD, letterSpacing: 2, marginBottom: 8, fontWeight: "bold" }}>
          📜 DIÁRIO DE MISSÕES DE TEMPORADA
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 6 }}>
          {SEASON_MISSIONS.map((m) => (
            <div 
              key={m.id} 
              style={{
                padding: 6,
                background: "rgba(0,0,0,0.35)",
                border: "2px solid #3a251a",
                borderRadius: 4,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between"
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                  <span style={{ fontSize: 8, color: "#fff", fontWeight: "bold" }}>{m.title}</span>
                  <span style={{ fontSize: 6, color: m.status === "CONCLUÍDO" ? "#4ade80" : "#fbbf24", fontWeight: "bold" }}>
                    {m.status}
                  </span>
                </div>
                <p style={{ fontSize: 6.5, color: "#9ca3af", lineHeight: 1.3, marginBottom: 6 }}>{m.desc}</p>
              </div>
              <div style={{ borderTop: "1px solid #27170f", paddingTop: 4, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ width: "65%" }}>
                  <PixelBar value={m.progress} max={100} color="#a855f7" height={5} />
                </div>
                <span style={{ fontSize: 6, color: "#a78bfa", fontWeight: "bold" }}>{m.xp}</span>
              </div>
            </div>
          ))}
        </div>
      </PixelPanel>
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
  const headerBg = tone === "premium" ? "linear-gradient(90deg,#9333ea,#db2777)" : "#22140e";
  return (
    <div style={{ borderTop: "2px solid #120a08" }}>
      <div
        style={{
          fontFamily: PIXEL_FONT,
          fontSize: 6.5,
          color: "#fff",
          textAlign: "center",
          padding: 3,
          background: headerBg,
          letterSpacing: 0.8,
          textShadow: "1px 1px 0 #000",
        }}
      >
        {label}
      </div>
      <div style={{ padding: 6, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
        <div
          style={{
            width: 54,
            height: 54,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 24,
            border: `2px solid ${claimed ? "#22c55e" : unlocked ? PIXEL_GOLD : "#3a251a"}`,
            boxShadow: "inset 0 0 0 2px #000",
            background: claimed ? "rgba(34,197,94,0.12)" : "rgba(0,0,0,0.4)",
            filter: unlocked ? "none" : "grayscale(1)",
          }}
        >
          {reward.icon}
        </div>
        <div style={{ fontSize: 6.5, textAlign: "center", color: "#e8d5a8", minHeight: 20, lineHeight: 1.3, fontWeight: "bold" }}>
          {reward.label}
        </div>
        <PixelButton
          variant={claimed ? "green" : needsPremium && tone === "premium" ? "ghost" : "gold"}
          disabled={!unlocked || claimed}
          onClick={onClaim}
          size={6.5}
          style={{ width: "100%", padding: "4px 3px" }}
        >
          {claimed ? "COLETADO" : needsPremium && tone === "premium" ? "🔒 RESTRITO" : unlocked ? "RESGATAR" : "🔒 BLOQ."}
        </PixelButton>
      </div>
    </div>
  );
}
