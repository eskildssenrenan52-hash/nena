import { createFileRoute } from "@tanstack/react-router";
import { GameCanvas } from "@/game/GameCanvas";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Rimhold — Aventura Pixel" },
      { name: "description", content: "Explore 36 biomas, uma cidade principal, batalhe 30+ inimigos e evolua rápido em Rimhold." },
      { property: "og:title", content: "Rimhold" },
      { property: "og:description", content: "Aventura pixel-art com mundo aberto irregular, cidade principal, banco e treino." },
    ],
  }),
});

function Index() {
  return (
    <div className="min-h-screen w-full bg-[#0a0a0a]">
      <GameCanvas />
    </div>
  );
}
