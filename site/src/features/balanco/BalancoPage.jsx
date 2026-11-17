import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../shared/constants/routes.js';
import AdministracaoPublicaChapter from './chapters/AdministracaoPublicaChapter.jsx';
import ControleCidadaniaChapter from './chapters/ControleCidadaniaChapter.jsx';
import RelatoriosFiscaisChapter from './chapters/RelatoriosFiscaisChapter.jsx';
import BalancoBookshelf from './components/BalancoBookshelf.jsx';
import AchievementCard from '../../shared/components/ui/AchievementCard.jsx';
import { SECTION_TITLES } from './constants/sections.js';
import { useBalancoProgress } from './hooks/useBalancoProgress.js';
import { TRAIL_ITEM_KEYS } from './services/balancoService.js';
import { Loading } from '../../shared/components/loading/index.js';
import { useLoadingProgress } from '../../shared/hooks/useLoadingProgress.js';
import { useAuth } from '../../shared/hooks/useAuth.js';
import './balanco.css';

import imgMinas3d from '@assets/images/balanco/1_minasgerais3d.png';
import imgAleijadinho from '@assets/images/balanco/aleijadinho.png';
import imgCongado from '@assets/images/balanco/congado.png';
import imgFotoQueijo from '@assets/images/balanco/foto_queijo.png';
import imgIgrejinha from '@assets/images/balanco/igrejinha_pampulha.png';
import imgTiradentes from '@assets/images/balanco/tiradentes.svg';

const SCALE_KEY = 'bc-balanco-scale';

const BALANCO_KEY_IMAGES = [
  imgMinas3d,
  imgAleijadinho,
  imgCongado,
  imgFotoQueijo,
  imgIgrejinha,
  imgTiradentes,
];

const BALANCO_MESSAGES = [
  'Consultando dados públicos de Minas Gerais...',
  'Organizando capítulos e indicadores do Balanço...',
  'Carregando ilustrações e mapas...',
  'Preparando o caderno cidadão...',
];

export default function BalancoPage() {
  const { isGuest } = useAuth();
  const contentRef = useRef(null);
  const [scale] = useState(() => Number(localStorage.getItem(SCALE_KEY)) || 1);
  const [activeSection, setActiveSection] = useState('administracao-publica');
  const [progress, setProgress] = useState(0);
  const [assetsReady, setAssetsReady] = useState(false);
  const [fadeState, setFadeState] = useState('loading'); // 'loading' | 'fading' | 'ready'

  // Estado para controlar a visão da Estante vs Leitura do Livro
  const [selectedBook, setSelectedBook] = useState(null); // null = visão estante; 'chapter-1' | 'chapter-2' | 'chapter-3'
  const [viewTransitioning, setViewTransitioning] = useState(false);
  const [saveError, setSaveError] = useState('');

  const {
    progress: loadingProgress,
    message: loadingMessage,
    status: loadingStatus,
    setProgress: setLoadingProgress,
  } = useLoadingProgress({
    initialProgress: 10,
    messages: BALANCO_MESSAGES,
  });

  const totalSections = Object.keys(SECTION_TITLES).length;
  const {
    restoring,
    restoreError,
    retryRestore,
    initialSection,
    savedSection,
    saveSection,
    concludeBook,
    redeemedBooks,
    claimed,
    readCompleted,
    claiming,
    claimMedal,
  } = useBalancoProgress(totalSections);

  useEffect(() => {
    let active = true;

    async function preloadBalancoAssets() {
      const startTime = Date.now();
      setLoadingProgress(20, 'Carregando ilustrações de Minas Gerais...');
      let loaded = 0;
      const total = BALANCO_KEY_IMAGES.length;

      await Promise.all(
        BALANCO_KEY_IMAGES.map(
          (url) =>
            new Promise((resolve) => {
              const img = new Image();
              const done = () => {
                if (active) {
                  loaded += 1;
                  const currentPercent = Math.round(20 + (loaded / total) * 70);
                  setLoadingProgress(currentPercent, `Carregando ilustrações (${loaded}/${total})...`);
                }
                resolve();
              };
              img.onload = done;
              img.onerror = done;
              img.src = url;
            })
        )
      );

      if (active) {
        setLoadingProgress(100, 'Caderno pronto para navegação!');

        const elapsed = Date.now() - startTime;
        const minDisplayTime = 800;
        if (elapsed < minDisplayTime) {
          await new Promise((resolve) => setTimeout(resolve, minDisplayTime - elapsed));
        }

        setAssetsReady(true);
      }
    }

    preloadBalancoAssets();
    return () => {
      active = false;
    };
  }, [setLoadingProgress]);

  const isPageLoading = restoring || !assetsReady;

  useEffect(() => {
    if (!isPageLoading) {
      setFadeState('fading');
      const timer = setTimeout(() => {
        setFadeState('ready');
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [isPageLoading]);

  // Calcula a maior seção alcançada sincronizada estritamente com o backend
  const highestSection = useMemo(() => {
    return Math.max(savedSection || 1, initialSection || 1);
  }, [savedSection, initialSection]);

  // Calcula o status de leitura de cada livro com base na API/Backend (um de cada vez)
  const chaptersProgress = useMemo(() => {
    const isRead1 = Boolean(redeemedBooks?.LIVRO_1);
    const isRead2 = Boolean(redeemedBooks?.LIVRO_2);
    const isRead3 = Boolean(redeemedBooks?.LIVRO_3);

    return {
      'chapter-1': isRead1
        ? 'read'
        : selectedBook === 'chapter-1' || (highestSection > 1 && highestSection < 5)
        ? 'in_progress'
        : 'unread',
      'chapter-2': isRead2
        ? 'read'
        : selectedBook === 'chapter-2' || (highestSection > 5 && highestSection < 18)
        ? 'in_progress'
        : 'unread',
      'chapter-3': isRead3
        ? 'read'
        : selectedBook === 'chapter-3' || (highestSection > 18 && highestSection < 21)
        ? 'in_progress'
        : 'unread',
    };
  }, [redeemedBooks, highestSection, selectedBook]);

  // Troca de visão instantânea com fade suave
  const changeBookView = useCallback((targetBookId) => {
    setViewTransitioning(true);
    setTimeout(() => {
      setSelectedBook(targetBookId);
      setViewTransitioning(false);
      if (targetBookId) {
        setTimeout(() => {
          if (targetBookId === 'chapter-1') {
            document.getElementById('administracao-publica')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          } else if (targetBookId === 'chapter-2') {
            document.getElementById('balanco-geral')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          } else if (targetBookId === 'chapter-3') {
            document.getElementById('controle-accountability')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }, 80);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 120);
  }, []);

  // Conclusão imediata do capítulo salvando a seção no backend de forma transparente
  const handleConcludeAndReturn = useCallback(async () => {
    const currentChapter = selectedBook;
    if (!currentChapter) return;

    setSaveError('');
    try {
      if (currentChapter === 'chapter-1') {
        await concludeBook(TRAIL_ITEM_KEYS.LIVRO_1);
        saveSection(5);
      } else if (currentChapter === 'chapter-2') {
        await concludeBook(TRAIL_ITEM_KEYS.LIVRO_2);
        saveSection(18);
      } else if (currentChapter === 'chapter-3') {
        await concludeBook(TRAIL_ITEM_KEYS.LIVRO_3);
        saveSection(21);
      }
      changeBookView(null);
    } catch {
      setSaveError('Não foi possível salvar a conclusão do caderno. Tente novamente.');
    }
  }, [selectedBook, saveSection, concludeBook, changeBookView]);

  useEffect(() => {
    localStorage.setItem(SCALE_KEY, scale);
    contentRef.current?.style.setProperty('--scale', scale);
  }, [scale]);

  useEffect(() => {
    if (!selectedBook) return;
    const sections = [...document.querySelectorAll('.balanco-page .content-section[id]')];
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) =>
              Math.abs(a.boundingClientRect.top - 110) -
              Math.abs(b.boundingClientRect.top - 110)
          )[0];
        if (!visible) return;
        const index = sections.indexOf(visible.target) + 1;
        setActiveSection(visible.target.id);
        saveSection(index);
      },
      { rootMargin: '-12% 0px -72%', threshold: [0, 0.01, 0.25] }
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [selectedBook, saveSection]);

  useEffect(() => {
    if (!selectedBook) return;
    const update = () => {
      const content = contentRef.current;
      if (!content) return;
      const rect = content.getBoundingClientRect();
      setProgress(
        Math.round(
          Math.min(
            1,
            Math.max(0, (-rect.top + 80) / Math.max(1, content.offsetHeight - innerHeight))
          ) * 100
        )
      );
    };
    update();
    addEventListener('scroll', update, { passive: true });
    addEventListener('resize', update, { passive: true });
    return () => {
      removeEventListener('scroll', update);
      removeEventListener('resize', update);
    };
  }, [selectedBook]);

  // Medalha liberada estritamente quando TODOS os 3 cadernos forem resgatados no banco
  const allChaptersCompleted = useMemo(() => {
    return Boolean(
      claimed ||
      (redeemedBooks?.LIVRO_1 && redeemedBooks?.LIVRO_2 && redeemedBooks?.LIVRO_3)
    );
  }, [claimed, redeemedBooks]);

  if (isPageLoading || fadeState !== 'ready') {
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

  if (restoreError) {
    return (
      <div role="alert" className="mx-auto max-w-4xl p-6 text-center">
        <p>{restoreError}</p>
        <button type="button" onClick={retryRestore}>Tentar novamente</button>
      </div>
    );
  }

  return (
    <div className="balanco-page content-fade-in max-w-4xl mx-auto px-4 py-4">
      {/* NAVEGAÇÃO SUPERIOR */}
      <nav className="top-nav flex justify-between items-center gap-2 mb-3">
        <div className="flex gap-2">
          {selectedBook ? (
            <button
              type="button"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border-2 border-amber-800/30 bg-amber-50 hover:bg-amber-100 text-amber-950 font-black text-xs shadow-xs transition-all cursor-pointer"
              onClick={() => changeBookView(null)}
            >
              <Icon icon="fa6-solid:arrow-left" />
              <span>Voltar para a Estante</span>
            </button>
          ) : (
            <Link
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border-2 border-amber-800/30 bg-amber-50 hover:bg-amber-100 text-amber-950 font-black text-xs shadow-xs transition-all no-underline"
              to={ROUTES.HOME}
            >
              <Icon icon="fa6-solid:arrow-left" />
              <span>Voltar para início</span>
            </Link>
          )}
        </div>
      </nav>

      {/* HERO CARD */}
      <header className="relative max-w-4xl mx-auto w-full bg-gradient-to-br from-[#fffdfa] via-[#f7ebda] to-[#ebd4b3] border-3 border-[#c7a475] rounded-3xl p-5 sm:p-6 shadow-xs mb-3 overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-start gap-1.5">
          <div className="inline-flex items-center gap-1.5 bg-[#8b6914] text-amber-50 text-[10px] font-black px-3 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
            <Icon icon="fa6-solid:book-bookmark" />
            <span>Trilha 2 · Balanço Cidadão</span>
          </div>

          <h1 className="text-[#3d1a00] text-xl sm:text-3xl font-black tracking-tight mt-0.5">
            Balanço Cidadão 2025
          </h1>

          <p className="text-[#6b4728] text-xs sm:text-sm font-extrabold max-w-xl leading-relaxed">
            Explore a administração pública, os relatórios fiscais e a cidadania em Minas Gerais através dos nossos cadernos didáticos.
          </p>
        </div>
      </header>

      {/* CONTAINER COM TRANSIÇÃO FADE SUAVE ENTRE VISÕES */}
      {isGuest && (
        <p role="status" className="mb-3 rounded-xl bg-amber-50 p-3 text-sm font-bold text-amber-900">
          Identifique-se para salvar a leitura dos cadernos no banco de dados.
        </p>
      )}
      <div className={`transition-all duration-150 ease-in-out ${viewTransitioning ? 'opacity-0 scale-[0.99]' : 'opacity-100 scale-100'}`}>
        {/* VISÃO 1: ESTANTE DE LIVROS + CARD DE CONQUISTAS ABAIXO (TELA INICIAL) */}
        {!selectedBook && (
          <div className="flex flex-col max-w-4xl mx-auto">
            <BalancoBookshelf
              chaptersProgress={chaptersProgress}
              onSelectBook={changeBookView}
            />

            {/* Seção da Conquista de Leitura na tela inicial */}
            <div className="w-full -mt-5 sm:-mt-6">
              <AchievementCard
                id="balancoAchievement"
                kicker="Conquista da Trilha"
                title="Especialista no Balanço!"
                description="Leia todos os 3 cadernos do Balanço Cidadão para resgatar sua medalha de especialista na administração pública e relatórios fiscais de Minas Gerais."
                messageText={
                  claimed
                    ? 'Conquista registrada com sucesso! Ela já está disponível na sua estante de medalhas.'
                    : allChaptersCompleted
                    ? 'Você concluiu todos os cadernos! Clique no botão abaixo para resgatar sua medalha.'
                    : 'Leia os 3 cadernos da estante para liberar o resgate da medalha.'
                }
                medalIcon="fa6-solid:award"
                reachedEnd={allChaptersCompleted}
                claimed={claimed}
                loading={claiming}
                onClaim={claimMedal}
                showClaimButton={true}
                statusLockedText="Em leitura"
                statusReadyText="Pronta para resgate"
                statusClaimedText="Medalha conquistada"
              />
            </div>
          </div>
        )}

        {/* VISÃO 2: CONTEÚDO DO CAPÍTULO SELECIONADO */}
        {selectedBook && (
          <section className="book-card bg-[#fffcf7] border-3 border-[#c7a475] rounded-3xl p-5 sm:p-8 shadow-xs max-w-4xl mx-auto">
            {/* Header do capítulo */}
            <div className="flex items-center justify-between border-b border-amber-900/10 pb-3 mb-5">
              <div>
                <span className="text-[#8b6914] text-xs font-black uppercase tracking-wider">
                  {selectedBook === 'chapter-1' && 'Vol. 01 · Administração Pública'}
                  {selectedBook === 'chapter-2' && 'Vol. 02 · Relatórios Fiscais'}
                  {selectedBook === 'chapter-3' && 'Vol. 03 · Controle e Cidadania'}
                </span>
                <h2 className="text-[#3d1a00] text-lg sm:text-xl font-black mt-0.5">
                  {selectedBook === 'chapter-1' && 'Administração Pública'}
                  {selectedBook === 'chapter-2' && 'Demonstrativos e Relatórios Fiscais'}
                  {selectedBook === 'chapter-3' && 'Controle, Cidadania e Accountability'}
                </h2>
              </div>

              <button
                type="button"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 border-amber-800/30 bg-amber-50 hover:bg-amber-100 text-amber-950 font-black text-xs shadow-2xs transition-all cursor-pointer"
                onClick={() => changeBookView(null)}
              >
                <Icon icon="fa6-solid:arrow-left" />
                <span>Voltar à Estante</span>
              </button>
            </div>

            {/* Artigo contendo apenas o conteúdo do capítulo */}
            <article ref={contentRef} className="web-content">
              {selectedBook === 'chapter-1' && <AdministracaoPublicaChapter />}
              {selectedBook === 'chapter-2' && <RelatoriosFiscaisChapter />}
              {selectedBook === 'chapter-3' && <ControleCidadaniaChapter />}
            </article>

            {/* AÇÃO DO FINAL DO CAPÍTULO */}
            {saveError && <p role="alert" className="mt-4 font-bold text-red-700">{saveError}</p>}
            <div className="mt-10 pt-6 border-t border-amber-900/15 flex flex-col sm:flex-row items-center justify-between gap-4 bg-amber-50/60 p-5 rounded-2xl border border-amber-800/20">
              <div>
                <h4 className="text-[#3d1a00] font-black text-sm sm:text-base">
                  Fim do capítulo
                </h4>
                <p className="text-[#6b4728] text-xs font-bold mt-0.5">
                  Conclua a leitura deste caderno para atualizar seu progresso no sistema e retornar à estante.
                </p>
              </div>

              <button
                type="button"
                onClick={handleConcludeAndReturn}
                className="inline-flex items-center gap-2 bg-[#8b6914] hover:bg-[#73560f] active:bg-[#5c440a] text-amber-50 font-black text-xs sm:text-sm px-6 py-3 rounded-full shadow-md active:translate-y-0.5 transition-all cursor-pointer shrink-0"
              >
                <Icon icon="fa6-solid:circle-check" className="text-base" />
                <span>Concluir leitura e voltar para a estante</span>
              </button>
            </div>
          </section>
        )}
      </div>

      {/* BARRA FIXA DE PROGRESSO VIA PORTAL NO DOCUMENT.BODY */}
      {selectedBook &&
        createPortal(
          <div className="balanco-progress-fixed">
            <span style={{ width: `${progress}%` }} />
          </div>,
          document.body
        )}
    </div>
  );
}
