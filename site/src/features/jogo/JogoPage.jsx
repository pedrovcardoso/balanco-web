import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useGamePhase } from './hooks/useGamePhase';
import { GameShell } from './components/GameShell';
import { Loading } from '../../shared/components/loading/index.js';
import { useLoadingProgress } from '../../shared/hooks/useLoadingProgress.js';

const JOGO_MESSAGES = [
  'Consultando fase do jogo...',
  'Buscando banco de questões e desafios...',
  'Preparando elementos visuais da missão...',
  'Finalizando ambiente do jogo...',
];

export default function JogoPage() {
  const { phaseId } = useParams();
  const { phase, loading: dataLoading, error } = useGamePhase(phaseId);
  const [fadeState, setFadeState] = useState('loading'); // 'loading' | 'fading' | 'ready'

  useEffect(() => {
    setFadeState('loading');
  }, [phaseId]);

  const {
    progress: loadingProgress,
    message: loadingMessage,
    status: loadingStatus,
    setProgress,
  } = useLoadingProgress({
    initialProgress: 20,
    messages: JOGO_MESSAGES,
  });

  useEffect(() => {
    if (dataLoading) {
      setProgress(50, 'Carregando dados da fase...');
    } else if (phase) {
      setProgress(100, 'Fase pronta para jogar!');
    }
  }, [dataLoading, phase, setProgress]);

  const isStillLoading = (dataLoading || !phase) && !error;

  useEffect(() => {
    if (!isStillLoading) {
      setFadeState('fading');
      const timer = setTimeout(() => {
        setFadeState('ready');
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [isStillLoading]);

  if (fadeState !== 'ready') {
    return (
      <Loading
        animation="random"
        progress={loadingProgress}
        message={loadingMessage}
        status={loadingStatus}
        className={fadeState === 'fading' ? 'loading-fade-out' : ''}
      />
    );
  }

  if (error || !phase) {
    return (
      <div className="min-h-[60vh] grid place-items-center p-4">
        <div className="w-[min(92vw,440px)] text-center rounded-3xl bg-[#fdf6e3]/90 border border-white/80 p-6 space-y-4">
          <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-red-100 text-red-600 text-2xl">
            <Icon icon="fa6-solid:triangle-exclamation" />
          </div>
          <h2 className="font-display text-2xl font-bold text-[#5d2b0a]">Fase Não Encontrada</h2>
          <p className="font-black text-sm text-[#6b3a1f]">
            {error || 'Não foi possível carregar as informações desta fase.'}
          </p>
          <Link
            to="/jogos"
            className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-[#9e1f28] text-white font-black text-sm no-underline shadow-md hover:brightness-110 transition"
          >
            <Icon icon="fa6-solid:arrow-left" /> Voltar ao mapa de jogos
          </Link>
        </div>
      </div>
    );
  }

  return <GameShell key={phase.id} phase={phase} />;
}
