import React, { useState, useEffect, useRef } from 'react';
import { Icon } from '@iconify/react';
import { Loading } from '../../../shared/components/loading/index.js';

export function QuizEngine({ phase, onUpdateHud, onFeedback, onComplete }) {
  const configuredCount = Number(phase.metadata?.count || 8);
  const configuredTime = Number(phase.metadata?.time || 25);

  const [items, setItems] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(100);
  const [wrongCount, setWrongCount] = useState(0);
  const [sequence, setSequence] = useState(0);
  const [bestSequence, setBestSequence] = useState(0);
  const [timeLeft, setTimeLeft] = useState(configuredTime);
  const [locked, setLocked] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [reviewReady, setReviewReady] = useState(false);
  const [answers, setAnswers] = useState([]);

  const timerRef = useRef(null);
  const optionRefs = useRef([]);
  const nextButtonRef = useRef(null);

  useEffect(() => {
    const rawRows = phase.rows || [];
    const normalized = rawRows
      .map((row, index) => {
        let meta = row.metadataJson || row.metadata_json || row.metadata || {};
        if (typeof meta === 'string') {
          try { meta = JSON.parse(meta); } catch { meta = {}; }
        }
        let opts = row.optionsJson || row.options_json || meta.options || [];
        if (typeof opts === 'string') {
          try { opts = JSON.parse(opts); } catch { opts = []; }
        }
        const rawAns = meta.answer ?? row.correctAnswer ?? row.correct_answer ?? 0;
        let ans = Number(rawAns);
        if (!Number.isFinite(ans)) ans = Math.max(0, opts.findIndex((o) => String(o) === String(rawAns)));
        return {
          prompt: row.prompt || meta.prompt || `Pergunta ${index + 1}`,
          options: opts,
          answer: Math.max(0, ans),
          explanation: row.simpleExplanation || row.simple_explanation || meta.explanation || '',
        };
      })
      .filter((item) => item.prompt && item.options.length >= 2);

    const shuffled = [...normalized].sort(() => Math.random() - 0.5);
    const selectedItems = shuffled.slice(0, Math.min(configuredCount, shuffled.length)).map((item) => {
      const shuffledOpts = item.options
        .map((text, originalIndex) => ({ text, originalIndex }))
        .sort(() => Math.random() - 0.5);
      return {
        ...item,
        options: shuffledOpts,
        correctIndex: shuffledOpts.findIndex((o) => o.originalIndex === item.answer),
      };
    });

    setItems(selectedItems);
  }, [phase]);

  useEffect(() => {
    if (!items.length) return;
    const penaltyPerError = 100 / items.length;
    const currentScore = Math.max(0, Math.round(100 - wrongCount * penaltyPerError));
    setScore(currentScore);
    onUpdateHud?.({
      score: currentScore,
      attempts: `${Math.min(currentIndex + 1, items.length)}/${items.length}`,
      itemsCount: sequence,
      progress: Math.round((currentIndex / items.length) * 100),
      hudLabels: { score: 'nota', attempts: 'questão', itemsCount: 'sequência' },
    });
  }, [currentIndex, wrongCount, sequence, items.length]);

  useEffect(() => {
    if (locked || !items.length || reviewReady) return;
    setTimeLeft(configuredTime);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0.1) {
          clearInterval(timerRef.current);
          handleAnswer(-1, true);
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);

    return () => clearInterval(timerRef.current);
  }, [currentIndex, locked, reviewReady, items.length]);

  useEffect(() => {
    if (!items.length || locked || reviewReady) return;
    const frame = window.requestAnimationFrame(() => optionRefs.current[0]?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [currentIndex, items.length, locked, reviewReady]);

  useEffect(() => {
    if (!reviewReady) return;
    const frame = window.requestAnimationFrame(() => nextButtonRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [reviewReady]);

  function handleOptionKeyDown(event, index) {
    if (locked) return;
    const lastIndex = currentItem.options.length - 1;
    let nextIndex = null;
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') nextIndex = index >= lastIndex ? 0 : index + 1;
    if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') nextIndex = index <= 0 ? lastIndex : index - 1;
    if (nextIndex !== null) {
      event.preventDefault();
      optionRefs.current[nextIndex]?.focus();
    }
  }

  function handleAnswer(selectedIndex, timedOut = false) {
    if (locked || reviewReady) return;
    setLocked(true);
    clearInterval(timerRef.current);
    setSelectedOption(selectedIndex);

    const item = items[currentIndex];
    const correct = !timedOut && selectedIndex === item.correctIndex;

    let newSeq = sequence;
    let newBest = bestSequence;
    let newWrong = wrongCount;

    if (correct) {
      newSeq += 1;
      newBest = Math.max(newBest, newSeq);
      setSequence(newSeq);
      setBestSequence(newBest);
    } else {
      newSeq = 0;
      newWrong += 1;
      setSequence(0);
      setWrongCount(newWrong);
    }

    const newAnswers = [
      ...answers,
      { question: item.prompt, selectedIndex, correctIndex: item.correctIndex, timedOut, correct },
    ];
    setAnswers(newAnswers);

    onFeedback?.({ correct });

    setTimeout(() => {
      setReviewReady(true);
    }, 820);
  }

  function handleNext() {
    if (!reviewReady) return;
    if (currentIndex >= items.length - 1) {
      onComplete?.({
        score,
        attempts: items.length,
        correctCount: items.length - wrongCount,
        totalCount: items.length,
        answers,
      });
    } else {
      setCurrentIndex((prev) => prev + 1);
      setLocked(false);
      setReviewReady(false);
      setSelectedOption(null);
    }
  }

  if (!items.length) {
    return <Loading fullScreen={false} progress={0} message="Carregando perguntas do Quiz..." />;
  }

  const currentItem = items[currentIndex];
  const timerPercent = Math.max(0, (timeLeft / configuredTime) * 100);
  const letters = ['A', 'B', 'C', 'D', 'E'];

  return (
    <article className="quizCard relative mx-auto flex min-h-[360px] w-[min(94vw,620px)] select-none flex-col justify-center gap-4 px-4 pb-16 pt-10 sm:px-6">
      <div
        className="quizTimer absolute right-2 top-2 grid size-12 place-items-center rounded-full shadow-lg"
        style={{
          background: `conic-gradient(#f5a800 ${timerPercent}%, rgba(255, 255, 255, 0.35) 0)`,
        }}
      >
        <span className="grid size-[38px] place-items-center rounded-full bg-[#fff7dc] font-display text-sm font-bold text-[#5d2b0a]">
          {Math.ceil(timeLeft)}
        </span>
      </div>

      <div className="quizContent">
        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-[#9e1f28]/90 px-3 py-1.5 text-xs font-black uppercase tracking-wider text-white">
          <Icon icon="fa6-solid:list-check" aria-hidden="true" /> questão {currentIndex + 1} de {items.length}
        </div>

        <div className="font-display text-[clamp(1.2rem,5.5vw,2.1rem)] font-bold leading-tight text-[#5d2b0a]">
          {currentItem.prompt}
        </div>

        <div className="mt-2 font-black text-[#7a4b13] text-sm">Selecione a alternativa correta.</div>

        <div className="mt-4 grid gap-2.5">
          {currentItem.options.map((option, idx) => {
            const isCorrect = idx === currentItem.correctIndex;
            const isSelected = idx === selectedOption;

            let optionStyle = 'bg-[#fff7dc]/65 border-[#fff7dc]/80 text-[#5d2b0a]';
            if (locked) {
              if (isCorrect) optionStyle = '!bg-[#dcfce7] !border-[#16a34a] text-green-950 ring-2 ring-green-500/20';
              else if (isSelected && !isCorrect) optionStyle = '!bg-[#fee2e2] !border-[#dc2626] text-red-950 ring-2 ring-red-500/20';
              else optionStyle = 'opacity-55 bg-[#fff7dc]/40 border-transparent';
            }

            return (
              <button
                key={idx}
                ref={(element) => { optionRefs.current[idx] = element; }}
                disabled={locked}
                onClick={() => handleAnswer(idx, false)}
                onKeyDown={(event) => handleOptionKeyDown(event, idx)}
                type="button"
                aria-pressed={isSelected}
                aria-current={locked && isCorrect ? 'true' : undefined}
                className={`quizOption grid grid-cols-[auto_1fr_auto] items-center gap-2.5 rounded-[20px] border-2 px-3.5 py-3 text-left font-black shadow-md transition focus:outline-none focus:ring-4 focus:ring-[#f5a800]/70 focus:ring-offset-2 focus:ring-offset-[#fff7dc] ${optionStyle}`}
              >
                <span className="grid size-8 place-items-center rounded-xl bg-gradient-to-br from-[#9e1f28] to-[#6f1620] font-display text-white">
                  {letters[idx] || idx + 1}
                </span>
                <span>{option.text}</span>
                <span className="quizOptionIcon">
                  {locked && isCorrect && <Icon icon="fa6-solid:circle-check" className="text-green-600 text-lg" />}
                  {locked && isSelected && !isCorrect && <Icon icon="fa6-solid:circle-xmark" className="text-red-600 text-lg" />}
                </span>
              </button>
            );
          })}
        </div>

        {locked && (
          <div className="mt-4 border-t border-[#5d2b0a]/10 pt-3" role="status" aria-live="polite">
            <div className="text-xs font-black uppercase tracking-wider text-[#7a4b13]">
              Resposta correta {selectedOption === -1 ? '· tempo esgotado' : ''}
            </div>
            <div className="font-display text-xl font-bold text-[#5d2b0a]">
              {currentItem.options[currentItem.correctIndex]?.text}
            </div>
            {currentItem.explanation && (
              <div className="mt-2 font-black leading-tight text-[#6b3a1f] text-sm">
                {currentItem.explanation}
              </div>
            )}
          </div>
        )}

        {reviewReady && (
          <button
            ref={nextButtonRef}
            onClick={handleNext}
            type="button"
            className="mt-4 min-h-11 w-full rounded-[18px] bg-gradient-to-br from-[#0f7a55] to-[#0b3f2d] px-4 py-3 font-black text-white shadow-md hover:brightness-110 transition cursor-pointer"
          >
            {currentIndex === items.length - 1 ? 'Ver resultado' : 'Ir para a próxima'}
          </button>
        )}
      </div>
    </article>
  );
}
