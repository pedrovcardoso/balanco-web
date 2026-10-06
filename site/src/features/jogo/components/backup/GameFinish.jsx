import React, { useState, useEffect, useRef } from 'react';
import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';

// Confetti interno ao card de resultado (replicando o legado)
function ResultConfetti({ active }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!active) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    const rect = canvas.parentElement.getBoundingClientRect();
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const width = Math.max(1, rect.width);
    const height = Math.max(1, rect.height);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    context.scale(dpr, dpr);

    const colors = ['#15803d', '#b45309', '#1d4ed8', '#be185d'];
    const pieces = Array.from({ length: 72 }, () => ({
      x: width / 2,
      y: height * 0.42,
      vx: (Math.random() - 0.5) * 10,
      vy: -2 - Math.random() * 7,
      g: 0.13 + Math.random() * 0.11,
      s: 4 + Math.random() * 7,
      r: Math.random() * Math.PI,
      c: colors[Math.floor(Math.random() * colors.length)],
    }));

    let frame = 0;
    let rafId;
    function draw() {
      context.clearRect(0, 0, width, height);
      pieces.forEach((p) => {
        p.x += p.vx;
        p.vy += p.g;
        p.y += p.vy;
        p.r += 0.12;
        context.save();
        context.translate(p.x, p.y);
        context.rotate(p.r);
        context.fillStyle = p.c;
        context.fillRect(-p.s / 2, -p.s / 2, p.s, p.s);
        context.restore();
      });
      if (++frame < 100) rafId = requestAnimationFrame(draw);
    }
    rafId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafId);
  }, [active]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}



// Animação de confete fullscreen antes da tela de resultado
function ConfettiOverlay({ onDone }) {
  const canvasRef = useRef(null);
  const doneFired = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      setTimeout(() => { if (!doneFired.current) { doneFired.current = true; onDone(); } }, 0);
      return;
    }

    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      if (!doneFired.current) { doneFired.current = true; onDone(); }
      return;
    }

    const context = canvas.getContext('2d');
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const rect = canvas.parentElement.getBoundingClientRect();
    const width = Math.max(1, rect.width);
    const height = Math.max(1, rect.height);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    context.scale(dpr, dpr);

    const colors = ['#15803d', '#b45309', '#1d4ed8', '#be185d'];
    const pieces = Array.from({ length: 72 }, () => ({
      x: width / 2,
      y: height * 0.42,
      vx: (Math.random() - 0.5) * 10,
      vy: -2 - Math.random() * 7,
      g: 0.13 + Math.random() * 0.11,
      s: 4 + Math.random() * 7,
      r: Math.random() * Math.PI,
      c: colors[Math.floor(Math.random() * colors.length)],
    }));

    let frame = 0;
    let rafId;
    function draw() {
      context.clearRect(0, 0, width, height);
      pieces.forEach((p) => {
        p.x += p.vx;
        p.vy += p.g;
        p.y += p.vy;
        p.r += 0.12;
        context.save();
        context.translate(p.x, p.y);
        context.rotate(p.r);
        context.fillStyle = p.c;
        context.fillRect(-p.s / 2, -p.s / 2, p.s, p.s);
        context.restore();
      });
      if (++frame < 100) {
        rafId = requestAnimationFrame(draw);
      } else {
        if (!doneFired.current) { doneFired.current = true; onDone(); }
      }
    }
    rafId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafId);
  }, [onDone]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}

function FailureOverlay({ onDone }) {
  const doneFired = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!doneFired.current) {
        doneFired.current = true;
        onDone();
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div className="relative z-10 flex h-full min-h-[500px] w-full items-center justify-center">
      <div
        className="relative z-10 flex flex-col items-center justify-center gap-3 text-[#9e1f28]"
        style={{ animation: 'gf-result-sequence 1.5s ease both' }}
        role="status"
        aria-live="polite"
      >
        <Icon
          icon="fa6-solid:xmark"
          className="block text-[clamp(4rem,16vw,6rem)]"
          style={{
            animation: 'gf-x-in .72s cubic-bezier(.16,1,.3,1) both',
            transformOrigin: 'center',
            willChange: 'transform, opacity',
          }}
          aria-hidden="true"
        />
        <span
          className="font-display text-[clamp(1.7rem,7vw,2.7rem)] font-bold"
          style={{ animation: 'gf-message-in .58s cubic-bezier(.16,1,.3,1) .12s both' }}
        >
          Não foi dessa vez
        </span>
      </div>
    </div>
  );
}

export function GameFinish({ result, onRetry, onNextPhase }) {
  const [phase, setPhase] = useState('confetti'); // 'confetti' | 'result'
  const [savingLeaving, setSavingLeaving] = useState(false);
  const [showButtons, setShowButtons] = useState(false);

  const {
    score = 0,
    stars = 0,
    attempts = 1,
    nextPhaseId = null,
    isApiLoading = false,
    saveError = null,
  } = result || {};

  const passed = score >= 60 || stars >= 1;
  const attemptText = attempts === 1 ? 'Concluído em 1 tentativa' : `Concluído em ${attempts} tentativas`;
  const starStatusText =
    stars === 0
      ? 'Nenhuma estrela conquistada'
      : stars === 1
      ? '1 estrela conquistada'
      : `${stars} estrelas conquistadas`;

  const handleConfettiDone = () => setPhase('result');

  // Quando API terminar (isApiLoading passa a false), anima saída do spinner e mostra botões
  useEffect(() => {
    if (phase !== 'result') return;
    if (!isApiLoading) {
      // Anima saída do spinner
      setSavingLeaving(true);
      const t = setTimeout(() => setShowButtons(true), 320);
      return () => clearTimeout(t);
    }
  }, [phase, isApiLoading]);

  if (phase === 'confetti') {
    return (
      <div className="relative z-10 w-[min(92vw,520px)] min-h-[500px] flex items-center justify-center rounded-[30px] bg-[#fdf6e3]/90 backdrop-blur-md border border-white/80 overflow-hidden text-center mx-auto my-auto animate-[gf-arena-pulse_2s_ease-in-out_infinite]">
        {passed ? (
          <>
            <ConfettiOverlay onDone={handleConfettiDone} />
            <div
              className="relative z-10 flex flex-col items-center justify-center gap-3 text-[#0f7a55]"
              style={{ animation: 'gf-result-sequence 1.5s ease both' }}
              role="status"
              aria-live="polite"
            >
              <Icon
                icon="fa6-solid:check"
                className="block text-[clamp(4rem,16vw,6rem)] text-[#0f7a55]"
                style={{
                  animation: 'gf-check-in .72s cubic-bezier(.16,1,.3,1) both',
                  transformOrigin: 'center',
                  willChange: 'transform, opacity',
                }}
                aria-hidden="true"
              />
              <span
                className="font-display text-[clamp(1.9rem,8vw,3rem)] font-bold"
                style={{ animation: 'gf-message-in .58s cubic-bezier(.16,1,.3,1) .12s both' }}
              >
                Sucesso!
              </span>
            </div>
          </>
        ) : (
          <FailureOverlay onDone={handleConfettiDone} />
        )}
      </div>
    );
  }

  return (
    <>
      <section
        className="relative z-10 w-[min(92vw,520px)] min-h-[500px] flex flex-col justify-between rounded-[30px] bg-[#fdf6e3]/90 backdrop-blur-md border border-white/80 p-6 overflow-hidden text-center mx-auto my-auto animate-[gf-arena-pulse_2s_ease-in-out_infinite]"
        aria-labelledby="gameFinishTitle"
        tabIndex={-1}
        style={{ isolation: 'isolate' }}
      >
        {/* Conteúdo da pontuação e estrelas */}
        <div className="flex-1 flex flex-col justify-center space-y-3">
          <h2 id="gameFinishTitle" className="sr-only">Resultado da fase</h2>

          {/* Pontuação */}
          <div
            className="font-display text-[clamp(3.2rem,10vw,4.7rem)] font-bold leading-none text-[#5d2b0a]"
            style={{ position: 'relative', zIndex: 1 }}
          >
            {score}
          </div>

          {/* Barra de progresso */}
          <div
            className="w-[82%] mx-auto h-[18px] bg-[#5d2b0a]/15 rounded-full overflow-hidden"
            aria-label={`Pontuação ${score} de 100`}
            style={{ position: 'relative', zIndex: 1 }}
          >
            <div
              className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full"
              style={{
                width: `${Math.max(0, Math.min(100, score))}%`,
                animation: 'gf-bar 1.25s ease 0.2s both',
              }}
            />
          </div>

          {/* Tentativas */}
          <p className="font-black text-[#6b3a1f] text-sm" style={{ position: 'relative', zIndex: 1 }}>
            {attemptText}
          </p>

          {/* Estrelas com animação */}
          <div
            className="flex justify-center gap-2 my-1"
            aria-label={`${stars} de 3 estrelas`}
            style={{ position: 'relative', zIndex: 1 }}
          >
            {[1, 2, 3].map((index) => (
              <span
                key={index}
                aria-hidden="true"
                style={{
                  display: 'inline-block',
                  fontSize: 'clamp(2.6rem, 9vw, 3.8rem)',
                  lineHeight: 1,
                  color: index <= stars ? '#f5a800' : 'rgba(139,94,60,0.2)',
                  opacity: 0,
                  transform: 'translateY(-120px) rotate(-260deg) scale(0.2)',
                  animation: index <= stars
                    ? `gf-star-on 1.05s cubic-bezier(.15,1.18,.35,1) ${0.25 + index * 0.3}s forwards`
                    : `gf-star-off 0.55s ease ${0.25 + index * 0.3}s forwards`,
                  filter: index <= stars ? 'drop-shadow(0 8px 0 rgba(139,94,60,0.15))' : undefined,
                }}
              >
                ★
              </span>
            ))}
          </div>

          {/* Status texto */}
          <p
            className="font-black text-[#6b3a1f] text-sm"
            role="status"
            aria-live="polite"
            style={{ position: 'relative', zIndex: 1 }}
          >
            {starStatusText}
          </p>
        </div>

        {/* Área inferior: Spinner / Botões */}
        <div className="w-full pt-2 flex flex-col justify-end min-h-[160px]">
          {/* Spinner de salvando */}
          {!showButtons && (
            <div
              role="status"
              aria-live="polite"
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-[#fdf6e3]/78 text-[#6b3a1f] font-black shadow-md mx-auto my-auto"
              style={{
                position: 'relative',
                zIndex: 1,
                transition: 'opacity 0.3s ease, transform 0.3s ease',
                opacity: savingLeaving ? 0 : 1,
                transform: savingLeaving ? 'translateY(-8px) scale(0.96)' : undefined,
              }}
            >
              <Icon
                icon="fa6-solid:circle-notch"
                aria-hidden="true"
                className="text-[#2d6a4f]"
                style={{ animation: 'gf-spin 1s linear infinite' }}
              />
              <span>Salvando resultado...</span>
            </div>
          )}

          {/* Erro de salvamento */}
          {showButtons && saveError && (
            <p className="text-[#9e1f28] font-black text-sm mb-2" style={{ position: 'relative', zIndex: 1 }}>
              O resultado não foi salvo. Tente novamente ou volte ao mapa.
            </p>
          )}

          {/* Botões de ação */}
          {showButtons && (
            <div
              className="grid gap-2.5 pt-1 w-full"
              style={{ position: 'relative', zIndex: 1 }}
            >
              {passed ? (
                <>
                  {nextPhaseId && (
                    <Link
                      to={`/jogos/${nextPhaseId}`}
                      onClick={() => onNextPhase(nextPhaseId)}
                      className="flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-2xl bg-gradient-to-br from-[#0f7a55] to-[#0b3f2d] text-white font-black text-base no-underline shadow-md hover:brightness-110 transition cursor-pointer"
                      style={{ animation: 'gf-button-in 0.52s cubic-bezier(.16,1,.3,1) both' }}
                    >
                      <Icon icon="fa6-solid:forward" aria-hidden="true" /> Próxima fase
                    </Link>
                  )}

                  <Link
                    to="/jogos"
                    className="flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-2xl bg-gradient-to-br from-[#9e1f28] to-[#6f1620] text-white font-black text-base no-underline shadow-md hover:brightness-110 transition"
                    style={{ animation: 'gf-button-in 0.52s cubic-bezier(.16,1,.3,1) 0.1s both' }}
                  >
                    <Icon icon="fa6-solid:map-location-dot" aria-hidden="true" /> Voltar para o mapa
                  </Link>

                  <button
                    onClick={onRetry}
                    className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-2xl bg-[#fff7dc]/80 border border-[#5d2b0a]/25 text-[#6b3a1f] font-black text-base hover:bg-white transition cursor-pointer"
                    style={{ animation: 'gf-button-in 0.52s cubic-bezier(.16,1,.3,1) 0.2s both' }}
                  >
                    <Icon icon="fa6-solid:rotate-right" aria-hidden="true" /> Jogar novamente
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={onRetry}
                    className="flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-2xl bg-gradient-to-br from-[#0f7a55] to-[#0b3f2d] text-white font-black text-base hover:brightness-110 transition cursor-pointer"
                    style={{ animation: 'gf-button-in 0.52s cubic-bezier(.16,1,.3,1) both' }}
                  >
                    <Icon icon="fa6-solid:rotate-right" aria-hidden="true" /> Jogar novamente
                  </button>

                  <Link
                    to="/jogos"
                    className="flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-2xl bg-gradient-to-br from-[#9e1f28] to-[#6f1620] text-white font-black text-base no-underline shadow-md hover:brightness-110 transition"
                    style={{ animation: 'gf-button-in 0.52s cubic-bezier(.16,1,.3,1) 0.1s both' }}
                  >
                    <Icon icon="fa6-solid:map-location-dot" aria-hidden="true" /> Voltar para o mapa
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </section>

      <style>{`
        @keyframes gf-arena-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4), 0 10px 30px rgba(0, 0, 0, 0.15); }
          50% { box-shadow: 0 0 0 12px rgba(255, 255, 255, 0), 0 14px 40px rgba(0, 0, 0, 0.22); }
        }
        @keyframes gf-bar { from { width: 0%; } }
        @keyframes gf-pop {
          0%   { opacity: 0; transform: scale(0.3); }
          70%  { opacity: 1; transform: scale(1.15); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes gf-message-in {
          from { opacity: 0; transform: translateY(18px) scale(.97); }
          to { opacity: 1; transform: none; }
        }
        @keyframes gf-check-in {
          0% { opacity: 0; transform: translate3d(-22px, -18px, 0) scale(.45) rotate(-24deg); }
          62% { opacity: 1; transform: translate3d(4px, 3px, 0) scale(1.12) rotate(7deg); }
          82% { transform: translate3d(-2px, -1px, 0) scale(.98) rotate(-3deg); }
          100% { opacity: 1; transform: translate3d(0, 0, 0) scale(1) rotate(0deg); }
        }
        @keyframes gf-x-in {
          0% { opacity: 0; transform: translate3d(22px, -18px, 0) scale(.45) rotate(24deg); }
          62% { opacity: 1; transform: translate3d(-4px, 3px, 0) scale(1.12) rotate(-7deg); }
          82% { transform: translate3d(2px, -1px, 0) scale(.98) rotate(3deg); }
          100% { opacity: 1; transform: translate3d(0, 0, 0) scale(1) rotate(0deg); }
        }
        @keyframes gf-result-sequence {
          0%, 80% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes gf-star-on {
          0%   { opacity: 0; transform: translateY(-120px) rotate(-260deg) scale(0.2); }
          62%  { opacity: 1; transform: translateY(10px) rotate(20deg) scale(1.18); }
          100% { opacity: 1; transform: none; }
        }
        @keyframes gf-star-off { to { opacity: 1; transform: none; } }
        @keyframes gf-button-in { to { opacity: 1; transform: none; } }
        @keyframes gf-spin { to { transform: rotate(360deg); } }
        @media (prefers-reduced-motion: reduce) {
          .gameFinish * { animation-duration: 0.01ms !important; animation-delay: 0ms !important; transition-duration: 0.01ms !important; }
        }
      `}</style>
    </>
  );
}
