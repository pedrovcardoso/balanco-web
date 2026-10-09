import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '@iconify/react';

function parseJson(value, fallback) {
  if (value == null || value === '') return fallback;
  if (typeof value === 'object') return value;
  try { return JSON.parse(value); } catch { return fallback; }
}

function normalizeQuestions(phase) {
  return (phase?.rows || [])
    .map((row, index) => {
      const metadata = parseJson(row.metadataJson ?? row.metadata_json ?? row.metadata, {});
      const rawOptions = row.options ?? row.optionsJson ?? row.options_json ?? metadata.options ?? [];
      const options = parseJson(rawOptions, []);
      const rawAnswer = metadata.answer ?? row.correctAnswer ?? row.correct_answer ?? 0;
      let answer = Number(rawAnswer);
      if (!Number.isFinite(answer)) {
        answer = options.findIndex((option) =>
          String(option?.text ?? option) === String(rawAnswer)
        );
      }
      return {
        id: row.id ?? row.questionId ?? `question-${index}`,
        prompt: row.prompt ?? metadata.prompt ?? `Pergunta ${index + 1}`,
        options: Array.isArray(options) ? options.map((option) => option?.text ?? option) : [],
        answer: Math.max(0, answer),
        explanation: row.simpleExplanation ?? row.simple_explanation ?? metadata.explanation ?? '',
      };
    })
    .filter((item) => item.prompt && item.options.length >= 2);
}

function shuffle(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function QuizEngine({ phase, onUpdateHud, onFeedback, onComplete }) {
  const configuredCount = Number(phase?.metadata?.count || phase?.config?.count || 8);
  const configuredTime = Number(phase?.metadata?.time || phase?.config?.time || 25);
  const items = useMemo(() => {
    return shuffle(normalizeQuestions(phase))
      .slice(0, configuredCount)
      .map((item) => {
        const options = shuffle(item.options.map((text, originalIndex) => ({ text, originalIndex })));
        return { ...item, options, correctIndex: options.findIndex((o) => o.originalIndex === item.answer) };
      });
  }, [phase, configuredCount]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [sequence, setSequence] = useState(0);
  const [timeLeft, setTimeLeft] = useState(configuredTime);
  const [locked, setLocked] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [reviewReady, setReviewReady] = useState(false);
  const [answers, setAnswers] = useState([]);
  const timerRef = useRef(null);

  useEffect(() => {
    setCurrentIndex(0); setWrongCount(0); setSequence(0); setTimeLeft(configuredTime);
    setLocked(false); setSelectedOption(null); setReviewReady(false); setAnswers([]);
  }, [phase?.id, configuredTime]);

  const score = items.length ? Math.max(0, Math.round(100 - wrongCount * (100 / items.length))) : 0;

  useEffect(() => {
    if (!items.length) return;
    onUpdateHud?.({
      score,
      attempts: `${Math.min(currentIndex + 1, items.length)}/${items.length}`,
      itemsCount: sequence,
      progress: Math.round((currentIndex / items.length) * 100),
      hudLabels: { score: 'nota', attempts: 'questão', itemsCount: 'sequência' },
    });
  }, [currentIndex, items.length, onUpdateHud, score, sequence]);

  useEffect(() => {
    if (!items.length || locked || reviewReady) return undefined;
    setTimeLeft(configuredTime);
    timerRef.current = window.setInterval(() => {
      setTimeLeft((value) => {
        if (value <= 0.1) {
          window.clearInterval(timerRef.current);
          window.setTimeout(() => answer(-1, true), 0);
          return 0;
        }
        return value - 0.1;
      });
    }, 100);
    return () => window.clearInterval(timerRef.current);
  }, [currentIndex, items.length, locked, reviewReady, configuredTime]);

  function answer(selectedIndex, timedOut = false) {
    if (locked || reviewReady || !items.length) return;
    window.clearInterval(timerRef.current);
    setLocked(true);
    setSelectedOption(selectedIndex);
    const item = items[currentIndex];
    const correct = !timedOut && selectedIndex === item.correctIndex;
    const nextAnswers = [...answers, {
      question: item.prompt, selectedIndex, correctIndex: item.correctIndex, timedOut, correct,
    }];
    setAnswers(nextAnswers);
    if (correct) setSequence((value) => value + 1);
    else { setSequence(0); setWrongCount((value) => value + 1); }
    onFeedback?.({ correct });
    window.setTimeout(() => setReviewReady(true), 500);
  }

  function next() {
    if (!reviewReady) return;
    if (currentIndex >= items.length - 1) {
      const finalWrong = wrongCount + (answers.at(-1)?.correct === false && answers.length < items.length ? 1 : 0);
      const finalScore = Math.max(0, Math.round(100 - finalWrong * (100 / items.length)));
      onComplete?.({
        score: finalScore,
        attempts: items.length,
        correctCount: items.length - finalWrong,
        totalCount: items.length,
        answers,
      });
      return;
    }
    setCurrentIndex((value) => value + 1);
    setLocked(false); setSelectedOption(null); setReviewReady(false);
  }

  if (!items.length) {
    return (
      <div className="mx-auto w-[min(92vw,520px)] rounded-2xl border border-red-200 bg-red-50 p-5 text-center font-black text-red-800">
        Esta fase não possui perguntas válidas. Verifique as opções e a resposta correta cadastradas.
      </div>
    );
  }

  const currentItem = items[currentIndex];
  const timerPercent = Math.max(0, (timeLeft / configuredTime) * 100);
  const letters = ['A', 'B', 'C', 'D', 'E'];

  return (
    <article className="relative mx-auto flex min-h-[360px] w-[min(94vw,620px)] flex-col justify-center gap-4 px-4 pb-16 pt-10 sm:px-6">
      <div className="absolute right-2 top-2 grid size-12 place-items-center rounded-full shadow-lg"
        style={{ background: `conic-gradient(#f5a800 ${timerPercent}%, rgba(255,255,255,.35) 0)` }}>
        <span className="grid size-[38px] place-items-center rounded-full bg-[#fff7dc] font-bold text-[#5d2b0a]">{Math.ceil(timeLeft)}</span>
      </div>
      <div className="inline-flex self-start rounded-full bg-[#9e1f28]/90 px-3 py-1.5 text-xs font-black uppercase text-white">
        questão {currentIndex + 1} de {items.length}
      </div>
      <div className="font-display text-[clamp(1.2rem,5.5vw,2.1rem)] font-bold text-[#5d2b0a]">{currentItem.prompt}</div>
      <div className="grid gap-2.5">
        {currentItem.options.map((option, index) => {
          const isCorrect = index === currentItem.correctIndex;
          const isSelected = index === selectedOption;
          const state = locked
            ? isCorrect ? 'bg-green-100 border-green-600' : isSelected ? 'bg-red-100 border-red-600' : 'opacity-50'
            : 'bg-[#fff7dc]/65 border-[#fff7dc]/80';
          return (
            <button key={`${option.originalIndex}-${index}`} disabled={locked} onClick={() => answer(index)} type="button"
              className={`grid grid-cols-[auto_1fr_auto] items-center gap-2 rounded-[20px] border-2 px-3.5 py-3 text-left font-black shadow-md ${state}`}>
              <span className="grid size-8 place-items-center rounded-xl bg-[#9e1f28] text-white">{letters[index] || index + 1}</span>
              <span>{option.text}</span>
              {locked && isCorrect && <Icon icon="fa6-solid:circle-check" className="text-green-600" />}
              {locked && isSelected && !isCorrect && <Icon icon="fa6-solid:circle-xmark" className="text-red-600" />}
            </button>
          );
        })}
      </div>
      {locked && currentItem.explanation && <div className="font-black text-sm text-[#6b3a1f]">{currentItem.explanation}</div>}
      {reviewReady && <button onClick={next} type="button" className="min-h-11 rounded-[18px] bg-[#0f7a55] px-4 py-3 font-black text-white">
        {currentIndex === items.length - 1 ? 'Ver resultado' : 'Ir para a próxima'}
      </button>}
    </article>
  );
}
