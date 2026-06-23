import { createFileRoute } from "@tanstack/react-router"
import { lazy, Suspense, useEffect, useState } from "react"

const Game = lazy(() => import("@/components/game/Game"))

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Rucoy Offline" },
      { name: "description", content: "RPG 2D top-down com editor de mundo embutido." },
      { property: "og:title", content: "Rucoy Offline" },
      { property: "og:description", content: "RPG 2D top-down com editor de mundo embutido." },
    ],
  }),
  component: Index,
})

function Index() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden", background: "#06070b" }}>
      {mounted && (
        <Suspense fallback={<div style={{ color: "#c9952a", padding: 20, fontFamily: "monospace" }}>Carregando jogo…</div>}>
          <Game />
        </Suspense>
      )}
    </div>
  )
}
