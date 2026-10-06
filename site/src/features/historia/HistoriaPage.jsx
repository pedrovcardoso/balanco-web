import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../shared/constants/routes.js';
import MinasGeraisIntro from './components/MinasGeraisIntro.jsx';
import FlipBook from './components/FlipBook.jsx';
import AchievementCard from '../../shared/components/ui/AchievementCard.jsx';
import { useReadingProgress } from './hooks/useReadingProgress.js';
import { Loading } from '../../shared/components/loading/index.js';
import { useLoadingProgress } from '../../shared/hooks/useLoadingProgress.js';
import historiaJsonUrl from '@assets/json/historia.json?url';
import './historia.css';

const historiaImages = import.meta.glob('@assets/images/historia/*.png', { eager: true, import: 'default' });

const HISTORIA_MESSAGES = [
  'Carregando história do Balanço...',
  'Organizando páginas da história em quadrinhos...',
  'Preparando ilustrações e diálogos...',
  'Finalizando leitor interativo...',
];

export default function HistoriaPage() {
  const [config, setConfig] = useState(null);
  const [error, setError] = useState('');
  const [pageReady, setPageReady] = useState(false);
  const [fadeState, setFadeState] = useState('loading'); // 'loading' | 'fading' | 'ready'

  const {
    progress: loadingProgress,
    message: loadingMessage,
    status: loadingStatus,
    setProgress,
  } = useLoadingProgress({
    initialProgress: 5,
    messages: HISTORIA_MESSAGES,
  });

  useEffect(() => {
    const handleAuthChange = () => {
      window.location.reload();
    };
    window.addEventListener('bc:session-expired', handleAuthChange);
    return () => window.removeEventListener('bc:session-expired', handleAuthChange);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadStory() {
      const startTime = Date.now();
      try {
        setProgress(15, 'Consultando história do Balanço...');
        const response = await fetch(historiaJsonUrl, {
          cache: 'no-store',
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        const rawPages = Array.isArray(data.pages) ? data.pages : [];
        const pages = rawPages.map((p, idx) => {
          const fileName = p.image || `${p.page || idx + 1}.png`;
          return {
            ...p,
            resolvedImage: historiaImages[`/src/assets/images/historia/${fileName}`] || historiaImages[`src/assets/images/historia/${fileName}`],
          };
        });
        setConfig({ pages });

        // Gera URLs das imagens da HQ para pré-carregamento com porcentagem real
        const imageUrls = pages.map((p) => p.resolvedImage).filter(Boolean);

        if (imageUrls.length > 0) {
          let loaded = 0;
          const total = imageUrls.length;
          await Promise.all(
            imageUrls.map(
              (url) =>
                new Promise((resolve) => {
                  const img = new Image();
                  const done = () => {
                    loaded += 1;
                    const percent = Math.round(15 + (loaded / total) * 85);
                    setProgress(percent, `Carregando página ${loaded} de ${total}...`);
                    resolve();
                  };
                  img.onload = done;
                  img.onerror = done;
                  img.src = url;
                })
            )
          );
        }

        setProgress(100, 'História pronta para leitura!');

        // Garante um tempo mínimo de exibição do loader (800ms) para navegação vinda do cache/home
        const elapsed = Date.now() - startTime;
        const minDisplayTime = 800;
        if (elapsed < minDisplayTime) {
          await new Promise((resolve) => setTimeout(resolve, minDisplayTime - elapsed));
        }

        setPageReady(true);
      } catch (requestError) {
        if (requestError.name !== 'AbortError') {
          setError('Não foi possível carregar a história.');
        }
      }
    }

    loadStory();
    return () => controller.abort();
  }, []);

  const totalPages = config?.pages.length || 0;
  const { initialPage, restoring, claimed, readCompleted, claiming, savePage, finishReading, claimMedal } =
    useReadingProgress(totalPages);

  const isDataLoading = (!config || restoring || !pageReady) && !error;

  // Gerencia a transição com animação de fade-out do loader e fade-in do conteúdo
  useEffect(() => {
    if (!isDataLoading) {
      setFadeState('fading');
      const timer = setTimeout(() => {
        setFadeState('ready');
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [isDataLoading]);

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

  return (
    <div className="balanco-page content-fade-in">
      <nav className="top-nav mb-4">
        <Link to={ROUTES.HOME} className="nav-pill">
          <Icon icon="fa6-solid:arrow-left" />
          Voltar para início
        </Link>
      </nav>

      {/* Container do Livro em Fundo Branco (Idêntico ao Legado com parafusos de canto) */}
      <div className="book-card !bg-white p-4 md:p-8 rounded-[32px] mb-8 relative">
        <span className="bolt bolt-tl" />
        <span className="bolt bolt-tr" />
        <span className="bolt bolt-bl" />
        <span className="bolt bolt-br" />

        <MinasGeraisIntro />

        {/* Container do Balanço Cidadão (Leitor da HQ em quadrinhos) */}
        <section
          className="mt-8 rounded-3xl border-[3px] border-[#8b6914] bg-white p-4 shadow-xl md:p-6"
          aria-label="Leitor da história em quadrinhos"
        >
          <header className="mb-4 border-b border-[#8b6914]/20 pb-4">
            <span className="inline-flex items-center gap-2 rounded-full border-2 border-[#f5a800] bg-white/70 px-3 py-1 text-xs font-black uppercase tracking-wider text-[#7a4b13]">
              <Icon icon="fa6-solid:book-open" />
              História em Quadrinhos
            </span>
            <h2 className="mt-2 font-display text-3xl font-black text-[#2d6a4f]">
              Balanço Cidadão em Quadrinhos
            </h2>
          </header>

          {error && (
            <p className="p-10 text-center font-black text-[#8f1e23]" role="alert">
              {error}
            </p>
          )}
          {config && totalPages > 0 && (
            <FlipBook
              pages={config.pages}
              initialPage={initialPage}
              claimed={claimed}
              onProgress={savePage}
              onComplete={finishReading}
            />
          )}
        </section>

        <AchievementCard
          id="historiaAchievement"
          kicker="Conquista de leitura"
          title="Explorador da História!"
          description="Esta medalha é concedida automaticamente ao concluir todas as páginas da história em quadrinhos."
          messageText={claimed ? "Conquista registrada com sucesso! Ela já está disponível na sua estante de medalhas." : "Conclua a leitura da história em quadrinhos para resgatar a medalha."}
          medalIcon="fa6-solid:book-open"
          reachedEnd={readCompleted}
          claimed={claimed}
          showClaimButton={false}
          statusLockedText="Em leitura"
          statusReadyText="Aguardando resgate"
          statusClaimedText="Medalha conquistada"
        />
      </div>
    </div>
  );
}
