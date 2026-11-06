'use client';

import React, { useEffect, useRef } from 'react';
import mapsData from '@/data/mapsShards.json';

type MapKey = 'usa' | 'africa' | 'ci';
const MAP_KEYS: MapKey[] = ['usa', 'africa', 'ci'];

interface Shard {
  id: string;
  polygon: string[];
  dx: number;
  dy: number;
  rot: number;
  rotSpeed: number;
  scaleEnd: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
}

export default function HeroGlassMapAnimation() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let isMounted = true;

    // Gestion de prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    // Pré-parser les polygones SVG pour un tracé Canvas ultra rapide
    const parsedMaps: Record<
      MapKey,
      {
        width: number;
        height: number;
        title: string;
        path2D: Path2D;
        shards: {
          pts: [number, number][];
          dx: number;
          dy: number;
          rot: number;
          rotSpeed: number;
          scaleEnd: number;
        }[];
      }
    > = {
      usa: {
        width: mapsData.usa.width,
        height: mapsData.usa.height,
        title: mapsData.usa.title,
        path2D: new Path2D(mapsData.usa.outline),
        shards: (mapsData.usa.shards as Shard[]).map((s) => ({
          pts: s.polygon.map(
            (p) => p.split(',').map(Number) as [number, number]
          ),
          dx: s.dx,
          dy: s.dy,
          rot: s.rot,
          rotSpeed: s.rotSpeed,
          scaleEnd: s.scaleEnd,
        })),
      },
      africa: {
        width: mapsData.africa.width,
        height: mapsData.africa.height,
        title: mapsData.africa.title,
        path2D: new Path2D(mapsData.africa.outline),
        shards: (mapsData.africa.shards as Shard[]).map((s) => ({
          pts: s.polygon.map(
            (p) => p.split(',').map(Number) as [number, number]
          ),
          dx: s.dx,
          dy: s.dy,
          rot: s.rot,
          rotSpeed: s.rotSpeed,
          scaleEnd: s.scaleEnd,
        })),
      },
      ci: {
        width: mapsData.ci.width,
        height: mapsData.ci.height,
        title: mapsData.ci.title,
        path2D: new Path2D(mapsData.ci.outline),
        shards: (mapsData.ci.shards as Shard[]).map((s) => ({
          pts: s.polygon.map(
            (p) => p.split(',').map(Number) as [number, number]
          ),
          dx: s.dx,
          dy: s.dy,
          rot: s.rot,
          rotSpeed: s.rotSpeed,
          scaleEnd: s.scaleEnd,
        })),
      },
    };

    let width = 0;
    let height = 0;
    const resize = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    // Paramètres d'animation séquentielle
    // ZOOM_DURATION : temps de zoom avant et apparition (1.6s)
    // SHATTER_DURATION : temps d'explosion en éclats de verre (1.0s)
    // Dwell / transition (0.2s)
    const ZOOM_DURATION = 1600;
    const SHATTER_DURATION = 1000;
    const TOTAL_STAGE_TIME = ZOOM_DURATION + SHATTER_DURATION;

    let currentMapIndex = 0;
    let stageStartTime = performance.now();
    let particles: Particle[] = [];

    const spawnParticles = (cx: number, cy: number, count = 28) => {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 100 + Math.random() * 260;
        particles.push({
          x: cx,
          y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 1.5 + Math.random() * 3.5,
          alpha: 1.0,
          color: Math.random() > 0.4 ? '#38bdf8' : '#fbbf24',
        });
      }
    };

    let prevTime = performance.now();

    const render = (now: number) => {
      if (!isMounted) return;
      const dt = Math.min((now - prevTime) / 1000, 0.1);
      prevTime = now;

      ctx.clearRect(0, 0, width, height);

      if (prefersReducedMotion) {
        // En mode mouvement réduit : affichage statique doux
        animId = requestAnimationFrame(render);
        return;
      }

      const elapsed = now - stageStartTime;

      if (elapsed >= TOTAL_STAGE_TIME) {
        // Passer à la carte suivante (USA -> Afrique -> Côte d'Ivoire -> USA ...)
        currentMapIndex = (currentMapIndex + 1) % MAP_KEYS.length;
        stageStartTime = now;
        particles = [];
      }

      const mapKey = MAP_KEYS[currentMapIndex];
      const map = parsedMaps[mapKey];

      const stageElapsed = now - stageStartTime;
      const isShattering = stageElapsed > ZOOM_DURATION;

      // Centrage de la carte dans le conteneur hero
      const centerX = width / 2;
      const centerY = height / 2;

      // Échelle adaptée à l'écran (mobile vs desktop)
      const isMobile = width < 640;
      const baseScale = isMobile
        ? Math.min((width * 0.85) / map.width, (height * 0.75) / map.height)
        : Math.min((width * 0.58) / map.width, (height * 0.85) / map.height);

      if (!isShattering) {
        // ==========================================
        // PHASE 1 : ZOOM AVANT VERS L'UTILISATEUR
        // ==========================================
        const progress = Math.min(stageElapsed / ZOOM_DURATION, 1.0);
        // Easing doux vers l'avant
        const ease = 1 - Math.pow(1 - progress, 3);
        const currentScale = baseScale * (0.45 + ease * 0.75); // De scale(0.45) à scale(1.20)
        const opacity = Math.min(progress * 1.5, 1.0);

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.scale(currentScale, currentScale);
        ctx.translate(-map.width / 2, -map.height / 2);
        ctx.globalAlpha = opacity;

        // 1. Lueurs extérieures volumétriques de verre
        ctx.shadowColor = 'rgba(56, 189, 248, 0.75)';
        ctx.shadowBlur = 35;
        ctx.lineWidth = 4;
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.8)';
        ctx.stroke(map.path2D);

        // 2. Deuxième lueur intense blanche (lumière de contour rasante)
        ctx.shadowColor = 'rgba(255, 255, 255, 0.95)';
        ctx.shadowBlur = 15;
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke(map.path2D);

        // 3. Remplissage verre dépoli translucide avec reflets
        const grad = ctx.createLinearGradient(0, 0, map.width, map.height);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.22)');
        grad.addColorStop(0.35, 'rgba(56, 189, 248, 0.12)');
        grad.addColorStop(0.7, 'rgba(251, 191, 36, 0.10)');
        grad.addColorStop(1, 'rgba(255, 255, 255, 0.18)');
        ctx.fillStyle = grad;
        ctx.shadowBlur = 0;
        ctx.fill(map.path2D);

        // 4. Lignes de fractures cristallines internes (visibles quand le zoom avance)
        if (progress > 0.55) {
          const crackAlpha = (progress - 0.55) / 0.45;
          ctx.strokeStyle = `rgba(255, 255, 255, ${0.4 * crackAlpha})`;
          ctx.lineWidth = 1;
          map.shards.forEach((s) => {
            if (s.pts.length > 2) {
              ctx.beginPath();
              ctx.moveTo(s.pts[0][0], s.pts[0][1]);
              for (let i = 1; i < s.pts.length; i++) {
                ctx.lineTo(s.pts[i][0], s.pts[i][1]);
              }
              ctx.stroke();
            }
          });
        }

        ctx.restore();

        // Déclencher l'explosion de particules à la fin du zoom
        if (progress >= 0.98 && particles.length === 0) {
          spawnParticles(centerX, centerY, 35);
        }
      } else {
        // ==========================================
        // PHASE 2 : ÉCLATEMENT EN ÉCLATS DE VERRE
        // ==========================================
        const shatterElapsed = stageElapsed - ZOOM_DURATION;
        const shatterProgress = Math.min(shatterElapsed / SHATTER_DURATION, 1.0);
        const easeOut = 1 - Math.pow(1 - shatterProgress, 2);
        const peakScale = baseScale * 1.2;
        const shardAlpha = Math.max(0, 1 - shatterProgress * 1.15);

        ctx.save();
        ctx.translate(centerX, centerY);

        map.shards.forEach((s) => {
          ctx.save();
          // Déplacement des éclats de verre vers l'extérieur
          const offsetX = s.dx * easeOut * (isMobile ? 0.65 : 1.0);
          const offsetY = s.dy * easeOut * (isMobile ? 0.65 : 1.0);
          const rot = ((s.rot + s.rotSpeed * shatterProgress) * Math.PI) / 180;
          const shardScale = peakScale * (1 - shatterProgress * 0.35);

          ctx.translate(offsetX, offsetY);
          ctx.rotate(rot);
          ctx.scale(shardScale, shardScale);
          ctx.translate(-map.width / 2, -map.height / 2);

          ctx.globalAlpha = shardAlpha;

          // Contour lumineux éclat de verre
          ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
          ctx.shadowBlur = 12;
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
          ctx.lineWidth = 1.8;

          // Remplissage éclat de verre
          ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';

          if (s.pts.length > 2) {
            ctx.beginPath();
            ctx.moveTo(s.pts[0][0], s.pts[0][1]);
            for (let i = 1; i < s.pts.length; i++) {
              ctx.lineTo(s.pts[i][0], s.pts[i][1]);
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
          }

          ctx.restore();
        });

        ctx.restore();
      }

      // ==========================================
      // PARTICULES LUMINEUSES ET ÉTINCELLES
      // ==========================================
      if (particles.length > 0) {
        ctx.save();
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.alpha -= dt * 1.2;

          if (p.alpha <= 0) {
            particles.splice(i, 1);
            continue;
          }

          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 8;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      isMounted = false;
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div
      className="absolute inset-0 z-[2] pointer-events-none flex items-center justify-center overflow-hidden"
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full object-cover select-none pointer-events-none opacity-90"
      />
    </div>
  );
}

