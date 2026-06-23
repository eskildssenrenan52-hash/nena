import { useEffect, useRef } from 'react'
import { memo } from 'react'

interface Props {
  combo: { count: number; timer: number; maxCombo: number; multiplier: number } | undefined
  tick: number
}

const COMBO_MESSAGES: { threshold: number; text: string; color: string }[] = [
  { threshold: 50, text: 'GODLIKE!', color: '#ff00ff' },
  { threshold: 40, text: 'UNSTOPPABLE!', color: '#ff0080' },
  { threshold: 30, text: 'RAMPAGE!', color: '#ff4040' },
  { threshold: 20, text: 'DOMINATING!', color: '#ff8040' },
  { threshold: 15, text: 'MASSACRE!', color: '#ffaa00' },
  { threshold: 10, text: 'KILLING SPREE!', color: '#ffff00' },
  { threshold: 5, text: 'ON FIRE!', color: '#40ff40' },
]

function ComboHUD({ combo, tick }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const count = combo?.count ?? 0

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (count < 2) return

    const msg = COMBO_MESSAGES.find(m => count >= m.threshold)
    const scale = 1 + Math.sin(tick * 0.15) * 0.05
    const alpha = combo && combo.timer > 0 ? Math.min(1, combo.timer / 60) : 1

    ctx.save()
    ctx.globalAlpha = alpha
    ctx.translate(80, 30)
    ctx.scale(scale, scale)

    // Combo counter
    ctx.fillStyle = msg ? msg.color : '#ffcc00'
    ctx.font = 'bold 28px monospace'
    ctx.textAlign = 'center'
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 4
    ctx.strokeText(`${count}x`, 0, 0)
    ctx.fillText(`${count}x`, 0, 0)

    // Multiplier
    ctx.font = 'bold 14px monospace'
    ctx.fillStyle = '#ffaa00'
    const mult = combo?.multiplier ?? 1
    ctx.strokeText(`${mult.toFixed(1)}x DMG`, 0, 20)
    ctx.fillText(`${mult.toFixed(1)}x DMG`, 0, 20)

    // Message
    if (msg) {
      const pulse = Math.sin(tick * 0.2) * 0.15 + 0.85
      ctx.globalAlpha = alpha * pulse
      ctx.font = 'bold 16px monospace'
      ctx.fillStyle = msg.color
      ctx.strokeStyle = '#000000'
      ctx.lineWidth = 3
      ctx.strokeText(msg.text, 0, 42)
      ctx.fillText(msg.text, 0, 42)
    }

    ctx.restore()
  }, [count, tick, combo])

  if (count < 2) return null

  return (
    <canvas
      ref={canvasRef}
      width={160}
      height={60}
      className="absolute top-2 left-1/2 -translate-x-1/2 pointer-events-none"
      style={{ zIndex: 15, imageRendering: 'pixelated' }}
    />
  )
}

export default memo(ComboHUD) as unknown as typeof ComboHUD
