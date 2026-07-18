import * as React from "react";
import { useState } from "react";
import { useHostedGame } from "@/game/host";
import { useOverlayState, setOverlayState } from "@/rucoy/store";
import { getIslandDetails, sailToTargetIsland } from "@/game/game";
import {
  PixelPanel,
  PixelTitle,
  PixelButton,
  PIXEL_FONT,
  PIXEL_GOLD,
} from "./ui/pixel";
import { Anchor, Compass, MapPin, ShieldAlert, Waves } from "lucide-react";

type Tab = "main" | "naxas" | "limiar" | "deep";

export default function SailingModal() {
  const state = useOverlayState();
  const g = useHostedGame();
  const [activeTab, setActiveTab] = useState<Tab>("main");

  if (!g) return null;

  const currentIsland = state.island || 1;

  // Build the list of islands for each tab
  const getIslandsForTab = (tab: Tab): number[] => {
    switch (tab) {
      case "main":
        return [1, 2, 3, 4];
      case "naxas":
        return Array.from({ length: 10 }, (_, i) => i + 5);
      case "limiar":
        return Array.from({ length: 20 }, (_, i) => i + 15);
      case "deep":
        return Array.from({ length: 20 }, (_, i) => i + 35);
    }
  };

  const islandIds = getIslandsForTab(activeTab);

  const handleSail = (islandId: number) => {
    // Close the current modal
    setOverlayState({ activeModal: null });

    const tips = [
      "Monstros nas ilhas de Mar Profundo (35-54) deixam cair equipamentos Lendários e Míticos!",
      "Colete madeira cortando árvores no Overworld para criar ou consertar barcos.",
      "Você pode mergulhar no oceano do Overworld pressionando G ou o botão de mergulho.",
      "As ilhas de Titãs escondem chefes de poder esmagador. Prepare-se bem!",
      "A Ilha Primordial (Lvl 200+) possui recursos minerais raros em suas cavernas profundas.",
      "Mantenha sempre poções de vida e mana em seu inventário ao viajar para ilhas desconhecidas.",
      "Equipe Pets de defesa para suportar golpes fatais de monstros marinhos abissais.",
      "Os materiais coletados nas ilhas distantes servem para encantar armas lendárias com o ferreiro.",
    ];
    const randomTip = tips[Math.floor(Math.random() * tips.length)];

    // Trigger loading state in the global overlay
    setOverlayState({
      isSailingLoading: true,
      sailingLoadingProgress: 0,
      sailingLoadingTip: randomTip,
      sailingTargetIsland: islandId,
    });
  };

  return (
    <div style={{ fontFamily: PIXEL_FONT, color: "#e8d5a8" }} className="flex flex-col h-full">
      {/* Description Panel */}
      <PixelPanel tone="stone" style={{ marginBottom: 12 }}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 border border-amber-500/40 rounded-md">
            <Compass className="w-5 h-5 text-amber-400 animate-spin-slow" />
          </div>
          <div>
            <PixelTitle size={10}>CARTA DE NAVEGAÇÃO</PixelTitle>
            <div style={{ fontSize: 7, color: "#c9a86a", marginTop: 4 }}>
              Selecione qualquer ilha descoberta para viajar e ancorar em sua costa.
            </div>
          </div>
        </div>
      </PixelPanel>

      {/* Region Tabs */}
      <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1 select-none shrink-0 scrollbar-thin">
        {[
          { id: "main", label: "Principais" },
          { id: "naxas", label: "Naxas" },
          { id: "limiar", label: "Limiar" },
          { id: "deep", label: "Profundo" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as Tab)}
            style={{
              fontFamily: PIXEL_FONT,
              fontSize: 7.5,
              padding: "6px 10px",
              background: activeTab === t.id ? PIXEL_GOLD : "#1d100b",
              color: activeTab === t.id ? "#120805" : "#e8d5a8",
              border: `1.5px solid ${activeTab === t.id ? "#fff" : "#4a3025"}`,
              borderRadius: 4,
              boxShadow: "0 2px 4px rgba(0,0,0,0.4)",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
            className="active:scale-95 transition-transform shrink-0"
          >
            {t.label.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Island Destination Grid */}
      <div
        className="flex-1 overflow-y-auto pr-1 gap-2.5 flex flex-col"
        style={{ maxHeight: "40vh" }}
      >
        {islandIds.map((id) => {
          const info = getIslandDetails(id, g.world.size);
          const isCurrent = id === currentIsland;

          // Customized descriptions for regions
          let desc = "Criaturas misteriosas habitam o litoral.";
          if (id === 1) desc = "Zona pacífica, florestas verdes e monstros iniciais.";
          else if (id === 2) desc = "Lar de titãs antigos, minérios raros e perigo imenso.";
          else if (id === 3) desc = "Profundezas marinhas infestadas de águas-vivas abissais.";
          else if (id === 4) desc = "Vegetação selvagem, dinossauros e chefes ancestrais.";
          else if (id >= 5 && id <= 14) desc = `Naxas ${id}: Litoral rochoso infestado de piratas caóticos.`;
          else if (id >= 15 && id <= 34) desc = `Sombra ${id}: Espectros do vazio dominam o solo e as fendas.`;
          else if (id >= 35 && id <= 54) desc = `Oceano Profundo ${id}: Monstros com modificadores de elite!`;

          return (
            <PixelPanel
              key={id}
              tone={isCurrent ? "stone" : "wood"}
              style={{
                borderColor: isCurrent ? PIXEL_GOLD : undefined,
                boxShadow: isCurrent ? `inset 0 0 0 1px ${PIXEL_GOLD}, 0 4px 0 #000` : undefined,
              }}
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3.5 p-1">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      style={{
                        fontSize: 9.5,
                        color: isCurrent ? PIXEL_GOLD : "#fff",
                        textShadow: "1px 1px 0 #000",
                        fontWeight: "bold",
                      }}
                    >
                      {info.name.toUpperCase()}
                    </span>
                    <span
                      className="px-1.5 py-0.5 rounded text-[6.5px] font-mono font-bold"
                      style={{
                        background: info.level >= 500 ? "#7f1d1d" : info.level >= 200 ? "#ca8a04" : "#1e3a8a",
                        color: "#fff",
                        border: "1px solid rgba(255,255,255,0.15)",
                      }}
                    >
                      NVL {info.level}+
                    </span>
                  </div>

                  <p className="mt-1 text-[7.5px] text-[#c0b090] leading-relaxed">
                    {desc}
                  </p>

                  <div className="flex items-center gap-2.5 mt-2 text-[6.5px] text-amber-500/70 font-mono">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 shrink-0" />
                      COSTA: X: {Math.round(info.cx)} Y: {Math.round(info.cy)}
                    </span>
                    {isCurrent && (
                      <span className="flex items-center gap-1 text-green-400">
                        <Waves className="w-3 h-3 shrink-0 animate-bounce" />
                        VOCÊ ESTÁ AQUI
                      </span>
                    )}
                  </div>
                </div>

                <div className="w-full sm:w-auto shrink-0 self-stretch sm:self-center flex items-center">
                  {isCurrent ? (
                    <div
                      style={{
                        fontFamily: PIXEL_FONT,
                        fontSize: 7.5,
                        color: "#4ade80",
                        border: "1.5px solid #22c55e",
                        background: "rgba(34,197,94,0.1)",
                        padding: "6px 12px",
                        borderRadius: 4,
                        textAlign: "center",
                      }}
                      className="w-full sm:w-auto"
                    >
                      ANCORADO ⚓
                    </div>
                  ) : (
                    <PixelButton
                      variant="gold"
                      onClick={() => handleSail(id)}
                      style={{
                        fontSize: 7.5,
                        padding: "6px 14px",
                        width: "100%",
                      }}
                    >
                      VELEJAR ⛵
                    </PixelButton>
                  )}
                </div>
              </div>
            </PixelPanel>
          );
        })}
      </div>
    </div>
  );
}
