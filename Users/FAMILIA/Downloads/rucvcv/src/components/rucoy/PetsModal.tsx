import { PETS, PET_ROLE_COLOR } from "@/rucoy/pets";
import { setActivePet, useOverlayState } from "@/rucoy/store";
import { PetSprite } from "@/rucoy/petSprites";
import {
  PixelPanel,
  PixelTitle,
  PixelButton,
  RarityBadge,
  StatChip,
  PIXEL_FONT,
  PIXEL_GOLD,
} from "./ui/pixel";

export default function PetsModal({ playerLevel }: { playerLevel: number }) {
  const state = useOverlayState();
  const activePetObj = PETS.find((p) => p.id === state.activePet);

  return (
    <div style={{ fontFamily: PIXEL_FONT, color: "#e8d5a8" }}>
      <PixelPanel tone="stone" style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <PixelTitle size={11}>
            {state.unlockedPets.length}/{PETS.length} PETS · NVL {playerLevel}
          </PixelTitle>
          <div style={{ fontSize: 8, color: "#c9a86a" }}>Clique para ativar / desativar</div>
        </div>
        {activePetObj && (
          <div style={{ marginTop: 8, fontSize: 8, color: "#22c55e", display: "flex", gap: 10, flexWrap: "wrap", borderTop: "1px dashed rgba(255,255,255,0.15)", paddingTop: 6 }}>
            <span>MASCOTE ATIVO: <strong style={{ color: "#fff" }}>{activePetObj.name.toUpperCase()}</strong></span>
            <span>⚔ +{activePetObj.attack} ATK</span>
            <span>🛡 +{activePetObj.defense} DEF</span>
            <span>♥ +{activePetObj.hp} HP</span>
          </div>
        )}
      </PixelPanel>

      <div
        style={{
          display: "grid",
          gap: 8,
          gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))",
        }}
      >
        {PETS.map((p) => {
          const unlocked = state.unlockedPets.includes(p.id) || playerLevel >= p.unlockLevel;
          const active = state.activePet === p.id;
          return (
            <PixelPanel
              key={p.id}
              tone="wood"
              padded={false}
              style={{
                opacity: unlocked ? 1 : 0.5,
                borderColor: active ? PIXEL_GOLD : undefined,
                boxShadow: active
                  ? `inset 0 0 0 2px ${PIXEL_GOLD}, inset 0 0 0 4px #120a08, 0 6px 0 #000`
                  : undefined,
                cursor: unlocked ? "pointer" : "not-allowed",
              }}
            >
              <div
                onClick={() => unlocked && setActivePet(active ? null : p.id)}
                style={{ padding: 10, display: "flex", flexDirection: "column", gap: 6 }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div
                    style={{
                      background: `${p.color}22`,
                      border: `2px solid ${p.color}`,
                      boxShadow: "inset 0 0 0 1px #000",
                      padding: 2,
                    }}
                  >
                    <PetSprite petId={p.id} size={48} />
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 9, color: "#f8e6ba", lineHeight: 1.3, textShadow: "1px 1px 0 #000" }}>
                      {p.name}
                    </div>
                    <div
                      style={{
                        fontSize: 7,
                        color: PET_ROLE_COLOR[p.role],
                        letterSpacing: 1,
                        marginTop: 3,
                        textTransform: "uppercase",
                      }}
                    >
                      {p.role}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  <RarityBadge rarity={p.rarity} />
                  <StatChip icon="⚔" value={p.attack} color="#ef4444" />
                  <StatChip icon="🛡" value={p.defense} color="#60a5fa" />
                  <StatChip icon="♥" value={p.hp} color="#22c55e" />
                </div>
                <div style={{ fontSize: 7, color: "#c9a86a", lineHeight: 1.5, minHeight: 22 }}>
                  {p.ability}
                </div>
                {!unlocked ? (
                  <div style={{ fontSize: 8, color: PIXEL_GOLD, fontFamily: PIXEL_FONT }}>
                    🔒 NVL {p.unlockLevel}
                  </div>
                ) : (
                  <PixelButton
                    variant={active ? "green" : "gold"}
                    size={8}
                    style={{ padding: "5px 8px" }}
                  >
                    {active ? "★ ATIVO" : "ATIVAR"}
                  </PixelButton>
                )}
              </div>
            </PixelPanel>
          );
        })}
      </div>
    </div>
  );
}
