import React, { useState, useEffect, useRef } from 'react';
import { Icon } from '@iconify/react';

export function SwipeEngine({ phase, onUpdateHud, onFeedback, onComplete }) {
  const count = Number(phase.metadata?.count || 10);
  const time = Number(phase.metadata?.time || 12);

  const [items, setItems] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [sequence, setSequence] = useState(0);
  const [bestSequence, setBestSequence] = useState(0);
  const [timeLeft, setTimeLeft] = useState(time);
  const [locked, setLocked] = useState(false);
  const [reviewReady, setReviewReady] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [selectedCorrect, setSelectedCorrect] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const timerRef = useRef(null);
  const dragStartRef = useRef(null);
  const dragOffsetRef = useRef(0);
  const leftButtonRef = useRef(null);
  const rightButtonRef = useRef(null);
  const nextButtonRef = useRef(null);
  const answerAnimationRef = useRef(null);

  const labels = { corrente: 'Corrente', capital: 'Capital' };

  useEffect(() => () => {
    if (answerAnimationRef.current) clearTimeout(answerAnimationRef.current);
  }, []);

  useEffect(() => {
    const rawRows = phase.rows || [];
    const normalized = rawRows
      .map((row, i) => {
        let meta = row.metadataJson || row.metadata_json || row.metadata || {};
        if (typeof meta === 'string') {
          try { meta = JSON.parse(meta); } catch { meta = {}; }
        }
        const answer = String(meta.answer || row.correctAnswer || row.correct_answer || '').toLowerCase().trim();
        return {
          prompt: meta.prompt || row.prompt || `Item ${i + 1}`,
          answer,
          explanation: row.simpleExplanation || row.simple_explanation || meta.explanation || '',
        };
      })
      .filter((x) => x.prompt && ['corrente', 'capital'].includes(x.answer));

    const shuffled = [...normalized].sort(() => Math.random() - 0.5).slice(0, Math.min(count, normalized.length));
    setItems(shuffled);
  }, [phase]);

  useEffect(() => {
    if (!items.length) return;
    const penaltyPerError = 100 / items.length;
    const score = Math.max(0, Math.round(100 - wrongCount * penaltyPerError));
    onUpdateHud?.({
      score,
      attempts: `${Math.min(currentIndex + 1, items.length)}/${items.length}`,
      itemsCount: sequence,
      progress: Math.round((currentIndex / items.length) * 100),
      hudLabels: { score: 'nota', attempts: 'questão', itemsCount: 'sequência' },
    });
  }, [currentIndex, wrongCount, sequence, items.length]);

  useEffect(() => {
    if (locked || !items.length || reviewReady) return;
    setTimeLeft(time);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          window.setTimeout(() => handleAnswer('__timeout__', true), 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [currentIndex, locked, reviewReady, items.length]);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      if (!reviewReady && !locked && event.key === 'ArrowLeft') {
        event.preventDefault();
        handleAnswer('corrente');
      }
      if (!reviewReady && !locked && event.key === 'ArrowRight') {
        event.preventDefault();
        handleAnswer('capital');
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  useEffect(() => {
    if (reviewReady) nextButtonRef.current?.focus();
  }, [reviewReady]);

  function handleChoiceKeyDown(event, side) {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      const nextSide = event.key === 'ArrowLeft' ? 'left' : 'right';
      if (nextSide === side) return;
      (nextSide === 'left' ? leftButtonRef : rightButtonRef).current?.focus();
    }
  }

  function commitAnswer(value, timed = false) {
    const item = items[currentIndex];
    const normalizedValue = String(value || '').toLowerCase().trim();
    const normalizedAnswer = String(item.answer || '').toLowerCase().trim();
    const correct = !timed && normalizedValue === normalizedAnswer;

    setSelectedAnswer(timed ? '__timeout__' : normalizedValue);
    setSelectedCorrect(correct);

    if (correct) {
      const nextSeq = sequence + 1;
      setSequence(nextSeq);
      setBestSequence((previous) => Math.max(previous, nextSeq));
    } else {
      setSequence(0);
      setWrongCount((previous) => previous + 1);
    }

    setAnswers((previous) => [
      ...previous,
      {
        prompt: item.prompt,
        answer: normalizedAnswer,
        selected: timed ? '__timeout__' : normalizedValue,
        timedOut: timed,
        correct,
      },
    ]);

    onFeedback?.({ correct });
    setIsExiting(false);
    dragOffsetRef.current = 0;
    setDragOffset(0);

    window.setTimeout(() => setReviewReady(true), 820);
  }

  function handleAnswer(value, timed = false) {
    if (locked || reviewReady || isExiting) return;

    setLocked(true);
    clearInterval(timerRef.current);

    if (timed) {
      commitAnswer(value, true);
      return;
    }

    const direction = value === 'capital' ? 1 : -1;
    const exitDistance = Math.min(Math.max(window.innerWidth * 0.34, 260), 420);

    setIsDragging(false);
    setIsExiting(true);
    dragOffsetRef.current = direction * exitDistance;
    setDragOffset(direction * exitDistance);

    answerAnimationRef.current = window.setTimeout(() => {
      answerAnimationRef.current = null;
      commitAnswer(value, false);
    }, 340);
  }

  function handleNext() {
    if (!reviewReady) return;
    if (currentIndex >= items.length - 1) {
      const penaltyPerError = 100 / items.length;
      const finalScore = Math.max(0, Math.round(100 - wrongCount * penaltyPerError));
      onComplete?.({
        score: finalScore,
        attempts: items.length,
        correctCount: items.length - wrongCount,
        totalCount: items.length,
        answers,
      });
    } else {
      setCurrentIndex((prev) => prev + 1);
      setLocked(false);
      setReviewReady(false);
      setSelectedAnswer(null);
      setSelectedCorrect(null);
      setIsExiting(false);
      dragOffsetRef.current = 0;
      setDragOffset(0);
    }
  }

  function handlePointerDown(event) {
    if (locked || reviewReady || isExiting || event.button !== 0) return;
    event.preventDefault();
    dragStartRef.current = event.clientX;
    dragOffsetRef.current = 0;
    setIsDragging(true);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }

  function handlePointerMove(event) {
    if (dragStartRef.current === null || locked || isExiting) return;
    event.preventDefault();
    const diff = event.clientX - dragStartRef.current;
    const limit = Math.min(window.innerWidth * 0.55, 320);
    const nextOffset = Math.max(-limit, Math.min(limit, diff));
    dragOffsetRef.current = nextOffset;
    setDragOffset(nextOffset);
  }

  function handlePointerUp(event) {
    if (dragStartRef.current === null) return;
    event.preventDefault();
    const finalOffset = dragOffsetRef.current;
    const threshold = Math.min(72, window.innerWidth * 0.18);

    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    dragStartRef.current = null;
    setIsDragging(false);

    if (Math.abs(finalOffset) >= threshold) {
      handleAnswer(finalOffset > 0 ? 'capital' : 'corrente');
      return;
    }

    dragOffsetRef.current = 0;
    setDragOffset(0);
  }

  function handlePointerCancel(event) {
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    dragStartRef.current = null;
    dragOffsetRef.current = 0;
    setIsDragging(false);
    setDragOffset(0);
  }

  if (!items.length) return null;

  const currentItem = items[currentIndex];
  const timerPercent = Math.max(0, (timeLeft / time) * 100);
  const cardRotation = Math.max(-16, Math.min(16, dragOffset / 11));

  return (
    <article className="relative mx-auto flex w-[min(94vw,620px)] select-none flex-col gap-3 px-2 pb-14 pt-3">
      <div className="flex items-center justify-between gap-3">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-[#9e1f28]/90 px-3 py-1.5 text-xs font-black uppercase tracking-wider text-white">
          <Icon icon="fa6-solid:hand-pointer" aria-hidden="true" /> item {currentIndex + 1} de {items.length}
        </div>
        <div
          className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full bg-[#fff7dc] px-3.5 font-black text-[#5d2b0a] shadow-md ring-4 ring-[#f5a800]/20"
          role="timer"
          aria-live="off"
          aria-label={`Tempo restante: ${timeLeft} segundos`}
        >
          <Icon icon="fa6-solid:clock" className="text-[#c98500]" aria-hidden="true" />
          <span className="text-xs uppercase tracking-wide">Tempo restante</span>
          <span className="font-display text-base">{timeLeft}s</span>
        </div>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-white/40" aria-hidden="true">
        <div
          className="h-full rounded-full bg-[#f5a800]"
          style={{
            width: `${timerPercent}%`,
            transition: timeLeft === time ? 'none' : 'width 1s linear',
          }}
        />
      </div>

      <div className="relative overflow-visible rounded-[26px] border border-white/65 bg-white/18 p-2.5 shadow-lg backdrop-blur-[2px]">
        <div className="pointer-events-none absolute inset-x-3 top-1/2 z-[1] flex -translate-y-1/2 justify-between text-xs font-black uppercase tracking-wider text-[#5d2b0a]/55" aria-hidden="true">
          <span className={dragOffset < -42 ? 'opacity-100' : 'opacity-0'}>Corrente</span>
          <span className={dragOffset > 42 ? 'opacity-100' : 'opacity-0'}>Capital</span>
        </div>

        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          onLostPointerCapture={() => {
            if (!isExiting && dragStartRef.current !== null) handlePointerCancel({
              currentTarget: { hasPointerCapture: () => false },
            });
          }}
          onDragStart={(event) => event.preventDefault()}
          style={{
            transform: isDragging || dragOffset !== 0
              ? `translate3d(${dragOffset}px,0,0) rotate(${cardRotation}deg)`
              : 'none',
            transition: isDragging
              ? 'none'
              : isExiting
                ? 'transform 340ms cubic-bezier(.22,.8,.3,1), opacity 280ms ease'
                : 'transform 180ms cubic-bezier(.2,.8,.2,1)',
            opacity: isExiting ? 0.42 : 1,
            willChange: isDragging || isExiting ? 'transform, opacity' : 'auto',
          }}
          className={`swipePlayCard relative z-[2] grid min-h-[260px] select-none place-items-center rounded-[22px] border border-white/80 bg-gradient-to-br from-white/95 via-[#fff8df] to-[#f7e9b9] px-6 py-8 text-center shadow-xl touch-none ${isExiting ? 'pointer-events-none cursor-default' : 'cursor-grab active:cursor-grabbing'}`}
          tabIndex={0}
          aria-label={`${currentItem.prompt}. Use seta para esquerda para Corrente ou seta para direita para Capital.`}
        >
          <div className="font-display text-[clamp(1.35rem,6vw,2.25rem)] font-bold leading-tight text-[#5d2b0a]">
            {currentItem.prompt}
          </div>

          {locked && (
            <div className="mt-5 w-full border-t border-[#5d2b0a]/10 pt-3" role="status" aria-live="polite">
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="rounded-2xl border border-[#5d2b0a]/10 bg-white/45 px-3 py-2">
                  <div className="text-[.68rem] font-black uppercase tracking-wider text-[#7a4b13]">
                    Sua escolha
                  </div>
                  <div className="mt-0.5 flex items-center justify-center gap-2 font-display text-lg font-bold text-[#5d2b0a]">
                    <span>
                      {selectedAnswer === '__timeout__' ? 'Tempo esgotado' : labels[selectedAnswer]}
                    </span>
                    <span className="sr-only">
                      {selectedAnswer === '__timeout__'
                        ? 'Nenhuma opção foi selecionada.'
                        : selectedCorrect === true
                          ? 'Resposta correta.'
                          : selectedCorrect === false
                            ? 'Resposta incorreta.'
                            : 'Resposta em processamento.'}
                    </span>
                    {selectedCorrect !== null && (
                      <Icon
                        icon={selectedCorrect === true ? 'fa6-solid:circle-check' : 'fa6-solid:circle-xmark'}
                        className={selectedCorrect === true ? 'text-[#0f7a55]' : 'text-[#9e1f28]'}
                        aria-hidden="true"
                      />
                    )}
                  </div>
                </div>
                <div className="rounded-2xl border border-[#5d2b0a]/10 bg-white/45 px-3 py-2">
                  <div className="text-[.68rem] font-black uppercase tracking-wider text-[#7a4b13]">
                    Classificação correta
                  </div>
                  <div className="mt-0.5 font-display text-lg font-bold text-[#5d2b0a]">
                    {labels[currentItem.answer]}
                  </div>
                </div>
              </div>
              {currentItem.explanation && (
                <div className="mt-2 text-sm font-black text-[#6b3a1f]">{currentItem.explanation}</div>
              )}
            </div>
          )}
        </div>
      </div>

      {!reviewReady ? (
        <div className="grid grid-cols-2 gap-3" role="group" aria-label="Opções de classificação">
          <button
            ref={leftButtonRef}
            onClick={() => handleAnswer('corrente')}
            onKeyDown={(event) => handleChoiceKeyDown(event, 'left')}
            disabled={locked}
            type="button"
            className="flex min-h-12 items-center justify-center gap-2 rounded-[18px] border-2 border-[#5d2b0a]/20 bg-[#fff7dc]/85 p-3.5 font-black text-[#5d2b0a] shadow-md transition hover:-translate-y-0.5 hover:border-[#9e1f28]/55 hover:bg-white focus:outline-none focus:ring-4 focus:ring-[#f5a800]/60 disabled:cursor-default disabled:opacity-55"
          >
            <Icon icon="fa6-solid:arrow-left" aria-hidden="true" /> Corrente
          </button>
          <button
            ref={rightButtonRef}
            onClick={() => handleAnswer('capital')}
            onKeyDown={(event) => handleChoiceKeyDown(event, 'right')}
            disabled={locked}
            type="button"
            className="flex min-h-12 items-center justify-center gap-2 rounded-[18px] border-2 border-[#5d2b0a]/20 bg-[#fff7dc]/85 p-3.5 font-black text-[#5d2b0a] shadow-md transition hover:-translate-y-0.5 hover:border-[#9e1f28]/55 hover:bg-white focus:outline-none focus:ring-4 focus:ring-[#f5a800]/60 disabled:cursor-default disabled:opacity-55"
          >
            Capital <Icon icon="fa6-solid:arrow-right" aria-hidden="true" />
          </button>
        </div>
      ) : (
        <button
          ref={nextButtonRef}
          onClick={handleNext}
          type="button"
          className="min-h-12 rounded-[18px] bg-gradient-to-br from-[#0f7a55] to-[#0b3f2d] p-3.5 font-black text-white shadow-md transition hover:brightness-110 focus:outline-none focus:ring-4 focus:ring-[#f5a800]/60"
        >
          {currentIndex === items.length - 1 ? 'Ver resultado' : 'Ir para o próximo'}
        </button>
      )}

      {!locked && !reviewReady && (
        <div className="flex items-center justify-center gap-1.5 text-center text-xs font-black text-[#7a4b13]">
          <span>Arraste o card, use os botões ou pressione</span>
          <Icon icon="fa6-solid:arrow-left" aria-hidden="true" />
          <span>e</span>
          <Icon icon="fa6-solid:arrow-right" aria-hidden="true" />
        </div>
      )}
    </article>
  );
}
