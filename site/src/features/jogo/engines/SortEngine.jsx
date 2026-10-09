import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import { Toast } from '../../../shared/components/ui/Toast.jsx';

const scoreByAttempts = (attempts) =>
  attempts <= 1 ? 100 : attempts === 2 ? 85 : attempts === 3 ? 70 : 60;

function parseJson(value, fallback = {}) {
  if (value == null || value === '') return fallback;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function shuffle(items) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
  }
  return result;
}

function normalizeRows(rows) {
  return (Array.isArray(rows) ? rows : [])
    .map((row, index) => {
      const metadata = parseJson(
        row.metadata ?? row.metadataJson ?? row.metadata_json,
        {},
      );
      const rawOrder =
        metadata.order ??
        metadata.orderIndex ??
        row.correctAnswer ??
        row.correct_answer ??
        index + 1;
      const order = Number(rawOrder);

      return {
        id: String(row.id ?? row.questionId ?? row.publicQuestionId ?? `sort-${index}`),
        text: String(metadata.text ?? metadata.label ?? row.prompt ?? '').trim(),
        order: Number.isFinite(order) ? order : index + 1,
      };
    })
    .filter((item) => item.text)
    .sort((first, second) => first.order - second.order)
    .slice(0, 8);
}

export function SortEngine({ phase, onUpdateHud, onFeedback, onComplete }) {
  const correctOrder = useMemo(() => normalizeRows(phase?.rows), [phase?.rows]);
  const [hand, setHand] = useState([]);
  const [slots, setSlots] = useState([]);
  const [attempts, setAttempts] = useState(0);
  const [score, setScore] = useState(100);
  const [toast, setToast] = useState(null);
  const [slotStatus, setSlotStatus] = useState([]);
  const completedRef = useRef(false);

  useEffect(() => {
    setHand(shuffle(correctOrder));
    setSlots(Array(correctOrder.length).fill(null));
    setAttempts(0);
    setScore(100);
    setToast(null);
    setSlotStatus([]);
    completedRef.current = false;
  }, [phase?.id, correctOrder]);

  useEffect(() => {
    if (!correctOrder.length) return;
    const filledCount = slots.filter(Boolean).length;
    onUpdateHud?.({
      score,
      attempts,
      itemsCount: correctOrder.length,
      progress: Math.round((filledCount / correctOrder.length) * 100),
      hudLabels: {
        score: 'nota',
        attempts: 'tentativas',
        itemsCount: 'etapas',
      },
    });
  }, [attempts, correctOrder.length, onUpdateHud, score, slots]);

  function clearValidation() {
    setSlotStatus([]);
    setToast(null);
  }

  function addToNextSlot(handIndex) {
    const emptyIndex = slots.findIndex((item) => item === null);
    if (emptyIndex < 0) return;

    const item = hand[handIndex];
    if (!item) return;

    const nextHand = hand.filter((_, index) => index !== handIndex);
    const nextSlots = [...slots];
    nextSlots[emptyIndex] = item;

    setHand(nextHand);
    setSlots(nextSlots);
    clearValidation();
  }

  function removeFromSlot(slotIndex) {
    const item = slots[slotIndex];
    if (!item) return;

    const nextSlots = [...slots];
    nextSlots[slotIndex] = null;

    setSlots(nextSlots);
    setHand((current) => [...current, item]);
    clearValidation();
  }

  function moveSlot(slotIndex, direction) {
    const targetIndex = slotIndex + direction;
    if (targetIndex < 0 || targetIndex >= slots.length || !slots[slotIndex]) return;

    const nextSlots = [...slots];
    [nextSlots[slotIndex], nextSlots[targetIndex]] = [
      nextSlots[targetIndex],
      nextSlots[slotIndex],
    ];

    setSlots(nextSlots);
    clearValidation();
  }

  function checkOrder() {
    if (slots.some((item) => !item)) {
      setToast({
        message: 'Aloque todos os cards antes de conferir.',
        type: 'warning',
      });
      onFeedback?.({ correct: false });
      return;
    }

    const nextAttempts = attempts + 1;
    const status = slots.map((item, index) =>
      item.id === correctOrder[index].id ? 'correct' : 'wrong',
    );
    const isCorrect = status.every((value) => value === 'correct');
    const nextScore = isCorrect
      ? scoreByAttempts(nextAttempts)
      : scoreByAttempts(nextAttempts + 1);

    setAttempts(nextAttempts);
    setScore(nextScore);
    setSlotStatus(status);
    onFeedback?.({ correct: isCorrect });

    if (!isCorrect) {
      setToast({
        message: 'A ordem ainda não está correta. Ajuste os cards e tente novamente.',
        type: 'error',
      });
      return;
    }

    setToast({ message: 'Parabéns! Ordem correta!', type: 'success' });

    if (completedRef.current) return;
    completedRef.current = true;

    window.setTimeout(() => {
      onComplete?.({
        score: nextScore,
        attempts: nextAttempts,
        correctCount: correctOrder.length,
        totalCount: correctOrder.length,
        answers: {
          order: slots.map((item) => item.text),
          correct: correctOrder.map((item) => item.text),
        },
      });
    }, 700);
  }

  if (!correctOrder.length) {
    return (
      <div
        className="mx-auto w-[min(92vw,560px)] rounded-2xl border border-red-200 bg-red-50 p-5 text-center font-black text-red-800"
        role="alert"
      >
        Esta fase não possui etapas válidas para o jogo Ordem Correta. Verifique se as
        perguntas estão vinculadas à fase e se cada item possui um texto e uma ordem.
      </div>
    );
  }

  return (
    <article className="mx-auto flex w-[min(94vw,760px)] select-none flex-col gap-3 px-4 pb-10 pt-2">
      <div className="inline-flex self-start items-center gap-1.5 rounded-full bg-[#9e1f28]/90 px-3 py-1.5 text-xs font-black uppercase tracking-wider text-white">
        <Icon icon="fa6-solid:layer-group" aria-hidden="true" />
        ordem correta
      </div>

      <div className="font-display text-[clamp(1.1rem,5.2vw,2rem)] font-bold leading-none text-[#5d2b0a]">
        Organize as etapas na sequência correta.
      </div>

      <div className="font-black text-[#7a4b13] text-sm">
        Clique nos cards para colocá-los nos espaços. Use as setas para ajustar a ordem.
      </div>

      <section className="rounded-3xl border border-white/55 bg-white/35 px-3 py-3">
        <div className="mb-2 text-xs font-black uppercase tracking-wider text-[#7a4b13]">
          Cards disponíveis
        </div>
        <div className="flex flex-wrap gap-2">
          {hand.length ? (
            hand.map((item, index) => (
              <button
                key={item.id}
                onClick={() => addToNextSlot(index)}
                type="button"
                className="inline-flex min-h-[38px] max-w-full items-center rounded-2xl border border-[#8b5e3c]/20 bg-gradient-to-br from-white/95 to-[#fff6d7]/90 px-3 py-2 text-left text-xs font-black text-[#5d2b0a] shadow-md transition hover:-translate-y-0.5"
              >
                {item.text}
              </button>
            ))
          ) : (
            <div className="text-xs font-black text-[#5d2b0a]/60">
              Todos os cards foram alocados.
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-2" aria-label="Ordem escolhida">
        {slots.map((item, index) => {
          const status = slotStatus[index];
          const slotClass =
            status === 'correct'
              ? 'border-green-600 bg-green-100'
              : status === 'wrong'
                ? 'border-red-600 bg-red-100'
                : 'border-[#5d2b0a]/30 bg-[#fff7dc]/40';

          return (
            <div
              key={index}
              className={`grid min-h-[52px] grid-cols-[auto_minmax(0,1fr)] items-center gap-2 rounded-[17px] border-2 border-dashed px-2.5 py-1.5 ${slotClass}`}
            >
              <div className="grid size-[32px] place-items-center rounded-xl bg-gradient-to-br from-[#9e1f28] to-[#6f1620] font-display text-sm font-bold text-white">
                {index + 1}
              </div>

              {item ? (
                <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-2xl border border-[#8b5e3c]/20 bg-white/90 px-3 py-1.5 text-xs font-black text-[#5d2b0a] shadow-sm">
                  <span className="min-w-0">{item.text}</span>
                  <span className="flex gap-1">
                    <button
                      onClick={() => moveSlot(index, -1)}
                      disabled={index === 0}
                      type="button"
                      aria-label={`Mover etapa ${index + 1} para cima`}
                      className="grid size-8 place-items-center rounded-xl bg-white disabled:opacity-30"
                    >
                      <Icon icon="fa6-solid:arrow-up" aria-hidden="true" />
                    </button>
                    <button
                      onClick={() => moveSlot(index, 1)}
                      disabled={index === slots.length - 1}
                      type="button"
                      aria-label={`Mover etapa ${index + 1} para baixo`}
                      className="grid size-8 place-items-center rounded-xl bg-white disabled:opacity-30"
                    >
                      <Icon icon="fa6-solid:arrow-down" aria-hidden="true" />
                    </button>
                    <button
                      onClick={() => removeFromSlot(index)}
                      type="button"
                      aria-label={`Remover etapa ${index + 1}`}
                      className="grid size-8 place-items-center rounded-xl bg-red-100 text-red-700"
                    >
                      <Icon icon="fa6-solid:xmark" aria-hidden="true" />
                    </button>
                  </span>
                </div>
              ) : (
                <div className="text-xs font-black text-[#5d2b0a]/50">Espaço livre</div>
              )}
            </div>
          );
        })}
      </section>

      <button
        onClick={checkOrder}
        type="button"
        className="mt-1 flex min-h-11 w-full items-center justify-center gap-2 rounded-[18px] bg-gradient-to-br from-[#0f7a55] to-[#0b3f2d] px-4 py-2.5 font-black text-white shadow-md transition hover:brightness-110"
      >
        <Icon icon="fa6-solid:check-double" aria-hidden="true" />
        Conferir ordem
      </button>

      <Toast
        message={toast?.message || ''}
        type={toast?.type || 'info'}
        position="top-right"
        onClose={() => setToast(null)}
      />
    </article>
  );
}
