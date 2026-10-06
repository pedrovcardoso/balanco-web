import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../shared/constants/routes.js';
import IntroCard from './components/IntroCard.jsx';
import MoreSection from './components/MoreSection.jsx';
import PrinciplesSection from './components/PrinciplesSection.jsx';
import TeamSection from './components/TeamSection.jsx';
import AchievementCard from '../../shared/components/ui/AchievementCard.jsx';
import { useSaibaMaisProgress } from './hooks/useSaibaMaisProgress.js';
import { Loading } from '../../shared/components/loading/index.js';
import { useLoadingProgress } from '../../shared/hooks/useLoadingProgress.js';
import './saibaMais.css';

const SAIBA_MAIS_MESSAGES = [
  'Carregando informações do projeto...',
  'Preparando créditos e referências...',
  'Carregando diretrizes de acessibilidade...',
  'Finalizando apresentação...',
];

export default function SaibaMaisPage() {
  const [pageReady, setPageReady] = useState(false);
  const [fadeState, setFadeState] = useState('loading'); // 'loading' | 'fading' | 'ready'

  const {
    progress: loadingProgress,
    message: loadingMessage,
    status: loadingStatus,
    setProgress,
  } = useLoadingProgress({
    initialProgress: 20,
    messages: SAIBA_MAIS_MESSAGES,
  });

  const { reachedEnd, claimed, loading: medalLoading, checkStatus, markReachedEnd, claimMedal } =
    useSaibaMaisProgress();

  useEffect(() => {
    const handleAuthChange = () => {
      window.location.reload();
    };
    window.addEventListener('bc:session-expired', handleAuthChange);
    return () => window.removeEventListener('bc:session-expired', handleAuthChange);
  }, []);

  useEffect(() => {
    async function initPage() {
      const startTime = Date.now();
      setProgress(30, 'Consultando progresso da conquista...');

      await checkStatus();

      setProgress(70, 'Preparando informações de transparência...');
      await new Promise((resolve) => setTimeout(resolve, 200));

      setProgress(100, 'Conteúdo carregado!');

      const elapsed = Date.now() - startTime;
      const minDisplayTime = 600;
      if (elapsed < minDisplayTime) {
        await new Promise((resolve) => setTimeout(resolve, minDisplayTime - elapsed));
      }

      setPageReady(true);
    }

    initPage();
  }, [checkStatus]);

  useEffect(() => {
    if (pageReady) {
      setFadeState('fading');
      const timer = setTimeout(() => {
        setFadeState('ready');
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [pageReady]);

  if (fadeState !== 'ready') {
    return (
      <Loading
        animation="random"
        message={loadingMessage}
        progress={loadingProgress}
        status={loadingStatus}
        className={fadeState === 'fading' ? 'loading-fade-out' : ''}
      />
    );
  }

  return (
    <div className="balanco-page content-fade-in">
      <nav className="top-nav mb-4">
        <Link to={ROUTES.HOME} className="nav-pill">
          <Icon icon="fa6-solid:arrow-left" />
          Voltar para início
        </Link>
      </nav>

      <div className="p-4 md:p-8 relative">

        {/* Hero Header */}
        <section className="hero-section grid justify-items-center gap-4 py-4 pb-5 text-center">
          <div className="title-frame relative inline-block">
            <div className="placa-colonial page-title-card relative overflow-visible border-[3px] border-[#8b6914] bg-[linear-gradient(135deg,rgba(253,246,227,.98),rgba(245,230,192,.96)_55%,rgba(237,217,163,.96))] shadow-xl rounded-3xl px-8 py-5 text-center">
              <p className="page-eyebrow mb-1 mt-0 text-xs font-black uppercase tracking-widest text-[#9b6b2a] relative z-[1]">
                Informações e créditos
              </p>
              <h1
                className="main-title m-0 font-display text-4xl md:text-5xl font-black text-[#5d2b0a]"
                id="titulo-principal"
              >
                Saiba Mais
              </h1>
              <div aria-hidden="true" className="title-divider mt-2 flex items-center justify-center gap-2">
                <div className="divider-line h-0.5 w-10 rounded-full bg-[#f5a800]" />
                <span className="state-name font-display text-sm tracking-widest text-[#f5a800]">
                  MINAS GERAIS
                </span>
                <div className="divider-line h-0.5 w-10 rounded-full bg-[#f5a800]" />
              </div>
            </div>
            <span className="bolt bolt-tl absolute h-3.5 w-3.5 rounded-full border border-[#6b4f0f] bg-[#e8c84a] -left-1.5 -top-1.5 shadow-sm" />
            <span className="bolt bolt-tr absolute h-3.5 w-3.5 rounded-full border border-[#6b4f0f] bg-[#e8c84a] -right-1.5 -top-1.5 shadow-sm" />
            <span className="bolt bolt-bl absolute h-3.5 w-3.5 rounded-full border border-[#6b4f0f] bg-[#e8c84a] -bottom-1.5 -left-1.5 shadow-sm" />
            <span className="bolt bolt-br absolute h-3.5 w-3.5 rounded-full border border-[#6b4f0f] bg-[#e8c84a] -bottom-1.5 -right-1.5 shadow-sm" />
          </div>
        </section>

        <IntroCard />
        <MoreSection />
        <PrinciplesSection />
        <TeamSection />

        <AchievementCard
          id="readingAchievement"
          kicker="Conquista de leitura"
          title="Leitura Nota A!"
          description="Chegue ao final da página para habilitar o botão e resgate manualmente esta medalha pela leitura das informações, referências e créditos do projeto."
          messageText="Chegue até o final da página para resgatar sua medalha."
          medalIcon="fa6-solid:book-open-reader"
          reachedEnd={reachedEnd}
          claimed={claimed}
          loading={medalLoading}
          onClaim={claimMedal}
          showClaimButton={true}
        />

        <div aria-hidden="true" id="creditsEndSentinel" className="w-full h-1 mt-4" />
      </div>
    </div>
  );
}

