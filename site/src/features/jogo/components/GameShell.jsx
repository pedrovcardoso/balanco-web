import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameHud } from './GameHud';
import { GameIntro } from './GameIntro';
import { GameFinish } from './GameFinish';
import { ExitGameModal } from './ExitGameModal';
import { ENGINE_REGISTRY } from '../engines';
import { registerGameAttempt, getNextPhaseForPhase, getGameMap } from '../services/jogoService';
import { saveStoredGamePhaseProgress } from '../../trilha-jogos/hooks/useGameMap';
import { useAuth } from '../../../shared/hooks/useAuth';

export function GameShell({ phase }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [gameState, setGameState] = useState('INTRO'); // 'INTRO' | 'PLAYING' | 'FINISH'
  const [hudState, setHudState] = useState({
    score: 100,
    attempts: 0,
    itemsCount: 0,
    progress: 0,
    hudLabels: {},
  });
  const [feedbackEffect, setFeedbackEffect] = useState(null); // 'ok' | 'bad'
  const [finishResult, setFinishResult] = useState(null);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);

  const engineSlug = phase?.engineSlug || 'quiz';
  const engineConfig = ENGINE_REGISTRY[engineSlug] || ENGINE_REGISTRY['quiz'];
  const EngineComponent = engineConfig?.component;

  function handleStart() {
    setGameState('PLAYING');
  }

  function handleUpdateHud(hudData) {
    setHudState((prev) => ({ ...prev, ...hudData }));
  }

  function handleFeedback({ correct }) {
    setFeedbackEffect(correct ? 'ok' : 'bad');
    setTimeout(() => {
      setFeedbackEffect(null);
    }, 850);
  }

  async function resolveNextPhaseId(currentPhaseId) {
    try {
      const nextData = await getNextPhaseForPhase(currentPhaseId);
      if (nextData?.publicPhaseId || nextData?.nextPhaseId || nextData?.phase_id || nextData?.id) {
        return nextData.publicPhaseId || nextData.nextPhaseId || nextData.phase_id || nextData.id;
      }
    } catch (err) {
      console.warn('[GameShell] getNextPhaseForPhase retornou nulo, buscando no mapa...', err);
    }

    try {
      const map = await getGameMap();
      if (Array.isArray(map)) {
        const idx = map.findIndex(
          (p) => String(p.publicPhaseId || p.phase_id || p.id) === String(currentPhaseId)
        );
        if (idx >= 0 && idx < map.length - 1) {
          const nextItem = map[idx + 1];
          return nextItem.publicPhaseId || nextItem.phase_id || nextItem.id;
        }
      }
    } catch (err) {
      console.warn('[GameShell] Erro ao buscar mapa para calcular próxima fase:', err);
    }
    return null;
  }

  async function handleComplete(gameResult) {
    const finalScore = gameResult.score ?? 100;
    const stars = finalScore >= 95 ? 3 : finalScore >= 80 ? 2 : finalScore >= 60 ? 1 : 0;

    // Salva progresso localmente para liberar no mapa de jogos
    saveStoredGamePhaseProgress(phase.id, {
      score: finalScore,
      stars,
      attempts: gameResult.attempts || 1,
    });

    // ── IMPORTANTE: transição imediata para FINISH com isApiLoading: true ──
    // O confete começa antes de qualquer await (replicando o legado)
    const initialResult = {
      score: finalScore,
      stars,
      attempts: gameResult.attempts || 1,
      nextPhaseId: null,
      isApiLoading: true,
      saveError: null,
    };
    setFinishResult(initialResult);
    setGameState('FINISH');

    // ── API calls em background enquanto o confete toca ──
    const savePromise = user?.publicUserId || user?.id
      ? registerGameAttempt(phase.id, {
          score: finalScore,
          stars,
          timeSeconds: gameResult.timeSeconds || null,
          details: {
            attemptsUsed: gameResult.attempts || 1,
            correctCount: gameResult.correctCount,
            totalCount: gameResult.totalCount,
            answers: gameResult.answers,
          },
        })
      : Promise.resolve(null);

    const nextPromise = resolveNextPhaseId(phase.id);

    const [saveResult, nextResult] = await Promise.allSettled([savePromise, nextPromise]);

    const nextPhaseId = nextResult.status === 'fulfilled' ? nextResult.value : null;
    const saveError = saveResult.status === 'rejected' ? saveResult.reason : null;

    if (saveError) console.warn('[GameShell] Falha ao salvar tentativa:', saveError);

    // Atualiza o resultado: API concluída → remove spinner → exibe botões
    setFinishResult((prev) => ({
      ...prev,
      nextPhaseId,
      isApiLoading: false,
      saveError,
    }));
  }

  function handleRetry() {
    setGameState('PLAYING');
    setFinishResult(null);
  }

  function handleNextPhase(nextId) {
    if (nextId) {
      setGameState('INTRO');
      setFinishResult(null);
      navigate(`/jogos/${nextId}`);
    }
  }

  let arenaPulseClass = '';
  if (feedbackEffect === 'ok') arenaPulseClass = 'ring-4 ring-green-500/50';
  if (feedbackEffect === 'bad') arenaPulseClass = 'ring-4 ring-red-500/50';

  return (
    <main className="relative z-[5] p-2 flex flex-col items-center justify-center">
      <section className="game w-full max-w-[980px] flex flex-col gap-2">
        {/* HUD (Oculto no modo Intro ou Finish) */}
        {gameState === 'PLAYING' && (
          <GameHud
            title={phase.title}
            subtitle={phase.subtitle}
            hudState={hudState}
            onOpenExit={() => setIsExitModalOpen(true)}
          />
        )}

        {/* Arena Principal */}
        <section
          className={`arena flex-1 flex flex-col relative overflow-hidden transition-all duration-300 ${
            gameState === 'PLAYING'
              ? `soft rounded-[30px] bg-[#fdf6e3]/70 backdrop-blur-md border border-white/60 ${arenaPulseClass}`
              : ''
          }`}
        >
          {/* Overlay de feedback pulse sobre o fundo da arena */}
          {feedbackEffect === 'ok' && (
            <div className="pointer-events-none absolute inset-0 z-[1] bg-green-500/15 animate-pulse rounded-[30px]" />
          )}
          {feedbackEffect === 'bad' && (
            <div className="pointer-events-none absolute inset-0 z-[1] bg-red-500/15 animate-pulse rounded-[30px]" />
          )}
          {/* Progress fill (Modo Jogando) */}
          {gameState === 'PLAYING' && (
            <div
              className="progress absolute bottom-0 left-0 right-0 z-[8] h-2 bg-[#5d2b0a]/15 overflow-hidden"
              role="progressbar"
              aria-valuenow={hudState.progress}
            >
              <div
                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-[#f5a800] transition-all duration-300"
                style={{ width: `${hudState.progress}%` }}
              />
            </div>
          )}

          {/* Renderização condicional por estado */}
          {gameState === 'INTRO' && (
            <GameIntro phase={phase} engineInfo={engineConfig} onStart={handleStart} />
          )}

          {gameState === 'PLAYING' && EngineComponent && (
            <div className="arenaScroll py-4 px-2 overflow-y-auto">
              <EngineComponent
                phase={phase}
                onUpdateHud={handleUpdateHud}
                onFeedback={handleFeedback}
                onComplete={handleComplete}
              />
            </div>
          )}

          {gameState === 'FINISH' && (
            <GameFinish
              result={finishResult}
              onRetry={handleRetry}
              onNextPhase={handleNextPhase}
            />
          )}
        </section>
      </section>

      {/* Modal de Saída */}
      <ExitGameModal isOpen={isExitModalOpen} onClose={() => setIsExitModalOpen(false)} />
    </main>
  );
}
