/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef } from 'react';
import { Biome } from '../types';

interface ParticlesBgProps {
  activeBiome: Biome;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
  shape: 'circle' | 'square' | 'line' | 'star';
  angle: number;
  spin: number;
}

export default function ParticlesBg({ activeBiome }: ParticlesBgProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];

    const handleResize = () => {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Initialize particles based on biome
    const particleCount = 40;
    particles = Array.from({ length: particleCount }).map(() => createParticle(canvas.width, canvas.height, activeBiome));

    function createParticle(w: number, h: number, biome: Biome, isNew = false): Particle {
      const config = biome.particleConfig;
      return {
        x: Math.random() * w,
        y: isNew ? -10 : Math.random() * h,
        vx: (Math.random() - 0.5) * config.speed * 0.5,
        vy: (Math.random() * 0.5 + 0.5) * config.speed, // mostly drift downwards
        size: Math.random() * config.size + 1.5,
        opacity: Math.random() * 0.6 + 0.1,
        color: config.color,
        shape: config.shape,
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.05,
      };
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p, idx) => {
        // Update physics
        p.x += p.vx;
        p.y += p.vy;
        p.angle += p.spin;

        // Wrap around borders
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y > canvas.height) {
          particles[idx] = createParticle(canvas.width, canvas.height, activeBiome, true);
        }

        // Draw individual particle
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.strokeStyle = p.color;

        if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.shape === 'square') {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        } else if (p.shape === 'line') {
          ctx.beginPath();
          ctx.moveTo(0, -p.size * 2);
          ctx.lineTo(0, p.size * 2);
          ctx.lineWidth = p.size / 3;
          ctx.stroke();
        } else if (p.shape === 'star') {
          ctx.beginPath();
          for (let i = 0; i < 5; i++) {
            ctx.lineTo(Math.cos(((18 + i * 72) * Math.PI) / 180) * p.size, -Math.sin(((18 + i * 72) * Math.PI) / 180) * p.size);
            ctx.lineTo(Math.cos(((54 + i * 72) * Math.PI) / 180) * (p.size / 2), -Math.sin(((54 + i * 72) * Math.PI) / 180) * (p.size / 2));
          }
          ctx.closePath();
          ctx.fill();
        }

        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [activeBiome]);

  return (
    <canvas
      ref={canvasRef}
      id="particles-bg-canvas"
      className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 opacity-80"
    />
  );
}
