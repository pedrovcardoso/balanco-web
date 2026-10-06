import { useEffect, useState } from 'react';
import { useAccessibility } from '../../hooks/useAccessibility.js';

export default function ReadingGuide() {
  const { readingRuler, readingGuide } = useAccessibility();
  const [{ posX, posY }, setPos] = useState({ posX: -500, posY: -500 });

  useEffect(() => {
    if (!readingRuler && !readingGuide) return;

    const handleMouseMove = (e) => {
      setPos({ posX: e.clientX, posY: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [readingRuler, readingGuide]);

  if (!readingRuler && !readingGuide) return null;

  const RULER_HEIGHT = 68;
  const GUIDE_WIDTH = 280;

  return (
    <>
      {/* 1. RÉGUA DE LEITURA (Mascara leve + Blur ultra suave) */}
      {readingRuler && (
        <div className="pointer-events-none fixed inset-0 z-[99998] overflow-hidden" aria-hidden="true" tabIndex={-1}>
          {/* Cortina Superior */}
          <div
            className="absolute top-0 inset-x-0 bg-slate-950/15 backdrop-blur-[0.5px] transition-transform duration-75 ease-out"
            style={{ height: `${Math.max(0, posY - RULER_HEIGHT / 2)}px` }}
          />

          {/* Cortina Inferior */}
          <div
            className="absolute bottom-0 inset-x-0 bg-slate-950/15 backdrop-blur-[0.5px] transition-transform duration-75 ease-out"
            style={{ top: `${Math.max(0, posY + RULER_HEIGHT / 2)}px` }}
          />

          {/* Faixa Transparente Limpa com Bordas de Destaque */}
          <div
            className="absolute inset-x-0 border-y-2 border-[#c0272d] transition-transform duration-75 ease-out"
            style={{
              top: `${posY - RULER_HEIGHT / 2}px`,
              height: `${RULER_HEIGHT}px`,
              backgroundColor: 'transparent',
            }}
          />
        </div>
      )}

      {/* 2. GUIA DE LEITURA LOCALIZADA (Posição original centralizada no mouse) */}
      {readingGuide && !readingRuler && (
        <div
          aria-hidden="true"
          tabIndex={-1}
          className="pointer-events-none fixed z-[99999] h-1.5 rounded-full bg-[#c0272d] shadow-[0_2px_8px_rgba(192,39,45,0.75)] transition-transform duration-75 ease-out"
          style={{
            width: `${GUIDE_WIDTH}px`,
            transform: `translate(${posX - GUIDE_WIDTH / 2}px, ${posY}px)`,
          }}
        />
      )}
    </>
  );
}
