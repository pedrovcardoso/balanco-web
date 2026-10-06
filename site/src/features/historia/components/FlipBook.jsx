import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import HTMLFlipBook from 'react-pageflip';
import { Icon } from '@iconify/react';

import { useReducedMotion } from '../../../shared/hooks/useReducedMotion.js';

import ComicPage from './ComicPage.jsx';
import ReadingProgress from './ReadingProgress.jsx';
import TranscriptPanel from './TranscriptPanel.jsx';

const MOBILE_QUERY = '(max-width: 760px)';

function getNormalizedPageIndex(value, totalPages) {
  return Math.max(
    0,
    Math.min(totalPages - 1, Number(value) || 0),
  );
}

export default function FlipBook({
  pages,
  initialPage = 0,
  claimed = false,
  onProgress,
  onComplete,
}) {
  const bookRef = useRef(null);
  const mountedRef = useRef(true);
  const lastSavedPageRef = useRef(0);

  const reducedMotion = useReducedMotion();

  const [isMobile, setIsMobile] = useState(() =>
    window.matchMedia(MOBILE_QUERY).matches,
  );
  const [bookReady, setBookReady] = useState(false);
  const [pageIndex, setPageIndex] = useState(() =>
    getNormalizedPageIndex(initialPage, pages.length),
  );
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const [finishState, setFinishState] = useState('reading');

  const totalPages = pages.length;
  const currentPage = Math.min(pageIndex + 1, totalPages);

  const getPageFlip = useCallback(() => {
    return bookRef.current?.pageFlip?.() || null;
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_QUERY);

    const updateMode = () => {
      setBookReady(false);
      setIsMobile(mediaQuery.matches);
    };

    updateMode();
    mediaQuery.addEventListener('change', updateMode);

    return () => {
      mediaQuery.removeEventListener('change', updateMode);
    };
  }, []);

  useEffect(() => {
    if (!bookReady) return;

    const instance = getPageFlip();
    if (!instance) return;

    const normalizedIndex = getNormalizedPageIndex(
      initialPage,
      totalPages,
    );

    instance.turnToPage(normalizedIndex);
    setPageIndex(normalizedIndex);
  }, [bookReady, getPageFlip, initialPage, totalPages]);

  const persistPage = useCallback(
    (pageNumber) => {
      const normalizedPage = Math.max(
        1,
        Math.min(totalPages, Number(pageNumber) || 1),
      );

      if (lastSavedPageRef.current === normalizedPage) {
        return;
      }

      lastSavedPageRef.current = normalizedPage;
      onProgress?.(normalizedPage);
    },
    [onProgress, totalPages],
  );

  const visiblePages = useMemo(() => {
    const firstPage = pages[pageIndex];

    if (!firstPage) {
      return [];
    }

    if (isMobile) {
      return [firstPage];
    }

    const secondPage = pages[pageIndex + 1];

    return secondPage
      ? [firstPage, secondPage]
      : [firstPage];
  }, [isMobile, pageIndex, pages]);

  const restartReading = useCallback(() => {
    setTranscriptOpen(false);
    setPageIndex(0);
    lastSavedPageRef.current = 0;

    window.requestAnimationFrame(() => {
      getPageFlip()?.turnToPage(0);
      onProgress?.(1);
    });
  }, [getPageFlip, onProgress]);

  const [resgatando, setResgatando] = useState(false);

  const completeReading = useCallback(async () => {
    if (claimed) {
      restartReading();
      return;
    }

    if (resgatando) return;

    setResgatando(true);

    try {
      const result = await onComplete?.();

      if (result?.requiresLogin) {
        setResgatando(false);
        return;
      }

      // Faz o scroll suave até a seção da medalha para mostrar a animação de conquistas
      const medalElem = document.getElementById('historiaAchievement');
      if (medalElem) {
        medalElem.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } catch (error) {
      console.error('[História] Falha ao resgatar medalha:', error);
    } finally {
      setResgatando(false);
    }
  }, [claimed, resgatando, onComplete, restartReading]);

  const goNext = useCallback(() => {
    if (!bookReady) return;

    if (currentPage >= totalPages) {
      completeReading();
      return;
    }

    const instance = getPageFlip();
    if (!instance) return;

    instance.flipNext('bottom');
  }, [
    bookReady,
    completeReading,
    currentPage,
    getPageFlip,
    totalPages,
  ]);

  const goPrevious = useCallback(() => {
    if (!bookReady || currentPage <= 1) return;

    const instance = getPageFlip();
    if (!instance) return;

    instance.flipPrev('bottom');
  }, [bookReady, currentPage, getPageFlip]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey
      ) {
        return;
      }

      if (
        event.target instanceof HTMLElement &&
        event.target.matches(
          'input, textarea, select, [contenteditable="true"]',
        )
      ) {
        return;
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        goNext();
      }

       if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goPrevious();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [goNext, goPrevious]);

  const handleInit = useCallback((event) => {
    const index = getNormalizedPageIndex(
      event?.data?.page ?? initialPage,
      totalPages,
    );

    setBookReady(true);
    setPageIndex(index);
  }, [initialPage, totalPages]);

  const handleFlip = useCallback(
    (event) => {
      const index = getNormalizedPageIndex(
        event.data,
        totalPages,
      );

      setPageIndex(index);
      persistPage(index + 1);
    },
    [persistPage, totalPages],
  );

  return (
    <>
      <div className="history-book-viewport">
        <div className="history-book-stage">
          <HTMLFlipBook
            key={isMobile ? 'portrait' : 'landscape'}
            ref={bookRef}
            width={510}
            height={720}
            size="stretch"
            minWidth={250}
            maxWidth={510}
            minHeight={353}
            maxHeight={720}
            startPage={getNormalizedPageIndex(
              initialPage,
              totalPages,
            )}
            showCover={false}
            usePortrait
            autoSize
            drawShadow
            maxShadowOpacity={0.35}
            mobileScrollSupport
            clickEventForward={false}
            useMouseEvents
            swipeDistance={30}
            showPageCorners={false}
            disableFlipByClick
            flippingTime={reducedMotion ? 1 : 620}
            onInit={handleInit}
            onFlip={handleFlip}
            className="history-flip-book"
          >
            {pages.map((page) => (
              <ComicPage
                key={page.page}
                page={page}
              />
            ))}
          </HTMLFlipBook>
        </div>
      </div>

      <nav
        className="history-reader-controls"
        aria-label="Controles de leitura"
      >
        <strong>
          Página {currentPage} de {totalPages}
        </strong>

        <button
          type="button"
          onClick={goPrevious}
          disabled={!bookReady || currentPage <= 1}
          className="history-btn"
        >
          <Icon icon="fa6-solid:arrow-left" aria-hidden="true" />
          Voltar
        </button>

        <button
          type="button"
          onClick={goNext}
          disabled={!bookReady || resgatando}
          className="history-btn history-btn-primary"
        >
          {resgatando ? (
            <>
              <Icon icon="fa6-solid:spinner" className="animate-spin text-lg" aria-hidden="true" />
              Resgatando...
            </>
          ) : (
            <>
              {currentPage >= totalPages
                ? claimed
                  ? 'Rever leitura'
                  : 'Resgatar medalha'
                : 'Avançar'}
              <Icon
                icon={
                  currentPage >= totalPages
                    ? claimed
                      ? 'fa6-solid:rotate-left'
                      : 'fa6-solid:award'
                    : 'fa6-solid:arrow-right'
                }
                aria-hidden="true"
              />
            </>
          )}
        </button>

        <button
          type="button"
          className="history-btn history-transcript-button"
          aria-expanded={transcriptOpen}
          onClick={() => {
            setTranscriptOpen((value) => !value);
          }}
        >
          <Icon icon="fa6-solid:align-left" aria-hidden="true" />
          Transcrição
        </button>
      </nav>

      <ReadingProgress
        currentPage={currentPage}
        totalPages={totalPages}
      />

      {transcriptOpen && (
        <TranscriptPanel pages={visiblePages} />
      )}
    </>
  );
}
