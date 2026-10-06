import React, { useEffect, useRef } from 'react';

export function ConfettiCanvas({ active = true }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!active) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = canvas.parentElement ? canvas.parentElement.clientWidth : window.innerWidth;
    const height = canvas.parentElement ? canvas.parentElement.clientHeight : window.innerHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const colors = ['#15803d', '#b45309', '#1d4ed8', '#be185d', '#f5a800', '#9e1f28'];
    const pieces = Array.from({ length: 72 }, () => ({
      x: width / 2,
      y: height * 0.35,
      vx: (Math.random() - 0.5) * 10,
      vy: -2 - Math.random() * 7,
      g: 0.13 + Math.random() * 0.11,
      s: 4 + Math.random() * 7,
      r: Math.random() * Math.PI,
      c: colors[Math.floor(Math.random() * colors.length)],
    }));

    let animId;
    let frame = 0;

    function draw() {
      ctx.clearRect(0, 0, width, height);
      pieces.forEach((p) => {
        p.x += p.vx;
        p.vy += p.g;
        p.y += p.vy;
        p.r += 0.12;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.r);
        ctx.fillStyle = p.c;
        ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s);
        ctx.restore();
      });
      if (++frame < 120) {
        animId = requestAnimationFrame(draw);
      }
    }

    animId = requestAnimationFrame(draw);

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [active]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
      aria-hidden="true"
    />
  );
}
