import React, { useEffect, useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import { Loading } from '../../../shared/components/loading/index.js';
import { Toast } from '../../../shared/components/ui/Toast.jsx';

const scoreByAttempts = (attempts) =>
  attempts <= 1 ? 100 : attempts === 2 ? 85 : attempts === 3 ? 70 : 60;

function shuffle(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function parseMetadata(row) {
  const value = row.metadataJson || row.metadata_json || row.metadata || {};
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
}

function shiftIntoSlot(baseSlots, item, targetIndex) {
  const result = [...baseSlots];
  const emptyIndex = result.findIndex((value) => !value);

  if (emptyIndex < 0 || emptyIndex === targetIndex) {
    result[targetIndex] = item;
    return result;
  }

  if (targetIndex < emptyIndex) {
    for (let i = emptyIndex; i > targetIndex; i -= 1) result[i] = result[i - 1];
  } else {
    for (let i = emptyIndex; i < targetIndex; i += 1) result[i] = result[i + 1];
  }

  result[targetIndex] = item;
  return result;
}

export function SortEngine({ phase, onUpdateHud, onFeedback, onComplete }) {
  const [correctOrder, setCorrectOrder] = useState([]);
  const [hand, setHand] = useState([]);
  const [slots, setSlots] = useState([]);
  const [attempts, setAttempts] = useState(0);
  const [score, setScore] = useState(100);
  const [toast, setToast] = useState(null);
  const [slotStatus, setSlotStatus] = useState([]);
  const [movingSlots, setMovingSlots] = useState(null);
  const [dragging, setDragging] = useState(null);

  const dragRef = useRef(null);
  const ghostRef = useRef(null);
  const moveTimerRef = useRef(null);
  const suppressClickRef = useRef(false);

  useEffect(() => {
    const parsed = (phase.rows || [])
      .map((row, index) => {
        const meta = parseMetadata(row);
        return {
          id: row.id || row.publicQuestionId || `sort-${index}`,
          text: meta.text || meta.label || row.prompt || `Etapa ${index + 1}`,
          order: Number(
            meta.order || meta.orderIndex || row.correctAnswer || row.correct_answer || index + 1,
          ),
        };
      })
      .filter((item) => item.text)
      .sort((a, b) => a.order - b.order)
      .slice(0, 8);

    setCorrectOrder(parsed);
    setHand(shuffle(parsed));
    setSlots(Array(parsed.length).fill(null));
    setAttempts(0);
    setScore(100);
    setToast(null);
    setSlotStatus([]);
    setMovingSlots(null);
  }, [phase]);

  useEffect(() => {
    if (!correctOrder.length) return;
    const filledCount = slots.filter(Boolean).length;
    onUpdateHud?.({
      score,
      attempts,
      itemsCount: correctOrder.length,
      progress: Math.round((filledCount / correctOrder.length) * 100),
      hudLabels: { score: 'nota', attempts: 'tentativas', itemsCount: 'etapas' },
    });
  }, [slots, attempts, score, correctOrder.length, onUpdateHud]);

  useEffect(
    () => () => {
      window.clearTimeout(moveTimerRef.current);
      ghostRef.current?.remove();
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    },
    [],
  );

  function clearMessage() {
    setToast(null);
    setSlotStatus([]);
  }

  function handleHandClick(handIndex) {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
    placeCard(handIndex);
  }

  function placeCard(handIndex) {
    if (dragging) return;
    const nextSlot = slots.findIndex((value) => !value);
    if (nextSlot < 0) return;

    const newHand = [...hand];
    const [item] = newHand.splice(handIndex, 1);
    const newSlots = [...slots];
    newSlots[nextSlot] = item;

    setHand(newHand);
    setSlots(newSlots);
    clearMessage();
  }

  function removeSlotCard(slotIndex) {
    if (dragging || !slots[slotIndex]) return;
    const newSlots = [...slots];
    const [item] = newSlots.splice(slotIndex, 1, null);
    setSlots(newSlots);
    setHand((current) => [...current, item]);
    clearMessage();
  }

  function moveSlotCard(slotIndex, dir) {
    if (dragging) return;
    const target = slotIndex + dir;
    if (target < 0 || target >= slots.length) return;

    const newSlots = [...slots];
    [newSlots[slotIndex], newSlots[target]] = [newSlots[target], newSlots[slotIndex]];

    window.clearTimeout(moveTimerRef.current);
    setMovingSlots({ from: slotIndex, to: target, dir, key: Date.now() });
    setSlots(newSlots);
    clearMessage();
    moveTimerRef.current = window.setTimeout(() => setMovingSlots(null), 260);
  }

  function startDrag(event, source, index) {
    if (event.target.closest('[data-move-buttons="true"]')) return;

    const item = source === 'hand' ? hand[index] : slots[index];
    if (!item) return;

    const element = event.currentTarget;
    const rect = element.getBoundingClientRect();
    const ghost = element.cloneNode(true);
    ghost.querySelector('[data-move-buttons="true"]')?.remove();
    ghost.className =
      'fixed left-0 top-0 z-[1000] pointer-events-none max-w-[min(86vw,360px)] rounded-2xl border border-[#8b5e3c]/20 bg-gradient-to-br from-white/95 to-[#fff6d7]/90 px-3 py-1.5 font-black text-xs text-[#5d2b0a] shadow-2xl';
    ghost.style.width = `${Math.min(rect.width, window.innerWidth * 0.86, 360)}px`;
    ghost.style.opacity = '0';
    document.body.appendChild(ghost);
    ghostRef.current = ghost;

    const baseSlots = [...slots];
    const baseHand = [...hand];
    if (source === 'slot') baseSlots[index] = null;
    else baseHand.splice(index, 1);

    const drag = {
      source,
      index,
      item,
      baseSlots,
      baseHand,
      hover: null,
      moved: false,
      startX: event.clientX,
      startY: event.clientY,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
    };

    dragRef.current = drag;
    window.addEventListener('pointermove', handlePointerMove, { passive: false });
    window.addEventListener('pointerup', handlePointerUp, { once: true });
    clearMessage();
  }

  function updateGhost(clientX, clientY, drag = dragRef.current) {
    if (!ghostRef.current || !drag) return;
    ghostRef.current.style.transform =
      `translate3d(${clientX - drag.offsetX}px, ${clientY - drag.offsetY}px, 0)`;
  }

  function handlePointerMove(event) {
    const drag = dragRef.current;
    if (!drag) return;

    const distance = Math.hypot(
      event.clientX - drag.startX,
      event.clientY - drag.startY,
    );
    if (!drag.moved && distance < 6) return;

    event.preventDefault();
    drag.moved = true;
    setDragging(drag);
    if (ghostRef.current) ghostRef.current.style.opacity = '1';
    updateGhost(event.clientX, event.clientY, drag);

    const slotElement = document
      .elementFromPoint(event.clientX, event.clientY)
      ?.closest('[data-sort-slot]');
    if (!slotElement) return;

    const targetIndex = Number(slotElement.dataset.sortSlot);
    if (drag.hover === targetIndex) return;

    drag.hover = targetIndex;
    setSlots(shiftIntoSlot(drag.baseSlots, drag.item, targetIndex));
    setHand([...drag.baseHand]);
  }

  function handlePointerUp() {
    window.removeEventListener('pointermove', handlePointerMove);
    const drag = dragRef.current;
    if (!drag) return;

    ghostRef.current?.remove();
    ghostRef.current = null;

    const completedDrag = drag.moved && drag.hover !== null;

    if (drag.moved && drag.hover === null) {
      const restoredSlots = [...drag.baseSlots];
      const restoredHand = [...drag.baseHand];
      if (drag.source === 'slot') restoredHand.push(drag.item);
      else restoredHand.splice(drag.index, 0, drag.item);
      setSlots(restoredSlots);
      setHand(restoredHand);
    }

    // Clique simples continua ativo; somente um arraste concluído suprime o click residual.
    suppressClickRef.current = completedDrag;
    dragRef.current = null;
    setDragging(null);
  }

  function handleCheck() {
    if (dragging) return;
    if (slots.some((item) => !item)) {
      setToast({ message: 'Alocar todos os cards antes de conferir.', type: 'warning' });
      onFeedback?.({ correct: false });
      return;
    }

    const newAttempts = attempts + 1;
    const computedStatus = slots.map((item, index) =>
      item && item.id === correctOrder[index].id ? 'correct' : 'wrong'
    );
    const isCorrect = computedStatus.every((st) => st === 'correct');
    const calcScore = isCorrect
      ? scoreByAttempts(newAttempts)
      : scoreByAttempts(newAttempts + 1);

    setAttempts(newAttempts);
    setScore(calcScore);
    setSlotStatus(computedStatus);
    onFeedback?.({ correct: isCorrect });

    if (isCorrect) {
      setToast({ message: 'Parabéns! Ordem correta!', type: 'success' });
      window.setTimeout(() => {
        onComplete?.({
          score: calcScore,
          attempts: newAttempts,
          correctCount: correctOrder.length,
          totalCount: correctOrder.length,
          answers: {
            order: slots.map((item) => item.text),
            correct: correctOrder.map((item) => item.text),
          },
        });
      }, 1000);
    } else {
      setToast({ message: 'A ordem ainda não está correta. Tente reordenar os cards.', type: 'error' });
    }
  }

  if (!correctOrder.length) {
    return <Loading fullScreen={false} progress={0} message="Carregando Ordem Correta..." />;
  }

  return (
    <article className="mx-auto flex w-[min(94vw,760px)] select-none flex-col gap-2 px-4 pt-2 pb-10">
      <div className="inline-flex self-start items-center gap-1.5 rounded-full bg-[#9e1f28]/90 px-3 py-1.5 text-xs font-black uppercase tracking-wider text-white">
        <Icon icon="fa6-solid:layer-group" aria-hidden="true" /> ordem correta
      </div>

      <div className="font-display text-[clamp(1.1rem,5.2vw,2rem)] font-bold leading-none text-[#5d2b0a]">
        Organize as etapas na sequência correta.
      </div>

      <div className="font-black text-[#7a4b13] text-sm">
        Clique ou arraste os cards da mão para alocar nos espaços.
      </div>

      <div className="rounded-3xl border border-white/55 bg-white/35 px-3 py-2">
        <div className="mb-1.5 text-xs font-black uppercase tracking-wider text-[#7a4b13]">Sua mão:</div>
        <div className="flex flex-wrap gap-2">
          {hand.length > 0 ? (
            hand.map((item, index) => (
              <button
                key={item.id}
                onClick={() => handleHandClick(index)}
                onPointerDown={(event) => startDrag(event, 'hand', index)}
                type="button"
                className="chipCard inline-flex min-h-[34px] max-w-full touch-none cursor-grab items-center rounded-2xl border border-[#8b5e3c]/20 bg-gradient-to-br from-white/95 to-[#fff6d7]/90 px-3 py-1.5 text-left font-black text-xs text-[#5d2b0a] shadow-md transition hover:-translate-y-0.5 active:cursor-grabbing"
              >
                {item.text}
              </button>
            ))
          ) : (
            <div className="font-black text-[#5d2b0a]/60 text-xs">Todos os cards foram alocados.</div>
          )}
        </div>
      </div>

      <div className="mt-1 grid gap-1.5">
        {slots.map((item, index) => {
          const isMovedCard = movingSlots?.to === index;
          const isDisplacedCard = movingSlots?.from === index;
          const movementAnimation = isMovedCard
            ? movingSlots.dir < 0
              ? 'sort-card-move-up 240ms cubic-bezier(.22,1,.36,1)'
              : 'sort-card-move-down 240ms cubic-bezier(.22,1,.36,1)'
            : isDisplacedCard
              ? movingSlots.dir < 0
                ? 'sort-card-displace-down 240ms cubic-bezier(.22,1,.36,1)'
                : 'sort-card-displace-up 240ms cubic-bezier(.22,1,.36,1)'
              : undefined;

          const status = slotStatus[index]; // 'correct' | 'wrong' | undefined
          const slotBg = status === 'correct'
            ? 'border-[#16a34a] bg-[#dcfce7] ring-2 ring-green-500/20'
            : status === 'wrong'
              ? 'border-[#dc2626] bg-[#fee2e2] ring-2 ring-red-500/20'
              : 'border-[#5d2b0a]/30 bg-[#fff7dc]/40';

          const cardBg = status === 'correct'
            ? 'from-[#dcfce7] to-[#bbf7d0] border-[#16a34a]/40 text-[#14532d]'
            : status === 'wrong'
              ? 'from-[#fee2e2] to-[#fecaca] border-[#dc2626]/40 text-[#7f1d1d]'
              : 'from-white/95 to-[#fff6d7]/90 border-[#8b5e3c]/20 text-[#5d2b0a]';

          return (
            <div
              key={`${index}-${movingSlots?.key || 'idle'}`}
              data-sort-slot={index}
              className={`slot relative grid min-h-[44px] w-full grid-cols-[auto_minmax(0,1fr)] items-center gap-2 rounded-[17px] border-2 border-dashed px-2.5 py-1 transition-all duration-300 ${slotBg}`}
              style={{ animation: movementAnimation }}
            >
              <div className="grid size-[30px] place-items-center rounded-xl bg-gradient-to-br from-[#9e1f28] to-[#6f1620] font-display font-bold text-white text-sm">
                {index + 1}
              </div>

              {item ? (
                <div
                  onPointerDown={(event) => startDrag(event, 'slot', index)}
                  className={`slotCard grid min-h-[34px] w-full min-w-0 touch-none cursor-grab grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-2xl border bg-gradient-to-br px-3 py-1.5 font-black text-xs shadow-xs active:cursor-grabbing transition-all duration-300 ${cardBg}`}
                >
                  <span className="flex items-center gap-1.5">
                    {status === 'correct' && (
                      <Icon icon="fa6-solid:circle-check" className="text-green-600 shrink-0 text-sm" aria-hidden="true" />
                    )}
                    {status === 'wrong' && (
                      <Icon icon="fa6-solid:circle-xmark" className="text-red-600 shrink-0 text-sm" aria-hidden="true" />
                    )}
                    {item.text}
                  </span>
                  <span className="flex gap-1" data-move-buttons="true">
                    <button
                      onClick={() => moveSlotCard(index, -1)}
                      disabled={index === 0}
                      type="button"
                      aria-label={`Mover etapa ${index + 1} para cima`}
                      className="grid size-8 cursor-pointer place-items-center rounded-xl border border-[#5d2b0a]/10 bg-white/80 text-[#6b3a1f] shadow-sm transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <Icon icon="fa6-solid:arrow-up" className="pointer-events-none" aria-hidden="true" />
                    </button>
                    <button
                      onClick={() => moveSlotCard(index, 1)}
                      disabled={index === slots.length - 1}
                      type="button"
                      aria-label={`Mover etapa ${index + 1} para baixo`}
                      className="grid size-8 cursor-pointer place-items-center rounded-xl border border-[#5d2b0a]/10 bg-white/80 text-[#6b3a1f] shadow-sm transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <Icon icon="fa6-solid:arrow-down" className="pointer-events-none" aria-hidden="true" />
                    </button>
                    <button
                      onClick={() => removeSlotCard(index)}
                      type="button"
                      aria-label={`Remover etapa ${index + 1}`}
                      className="grid size-8 cursor-pointer place-items-center rounded-xl border border-red-200 bg-red-100 text-red-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-red-200 hover:text-red-800 hover:shadow-md active:translate-y-0"
                    >
                      <Icon icon="fa6-solid:xmark" className="pointer-events-none" aria-hidden="true" />
                    </button>
                  </span>
                </div>
              ) : (
                <div className="font-black text-[#5d2b0a]/50 text-xs">Espaço livre</div>
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={handleCheck}
        disabled={Boolean(dragging)}
        type="button"
        className="mt-2 min-h-11 w-full rounded-[18px] bg-gradient-to-br from-[#0f7a55] to-[#0b3f2d] px-4 py-2.5 font-black text-white shadow-md flex items-center justify-center gap-2 hover:brightness-110 transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Icon icon="fa6-solid:check-double" aria-hidden="true" /> Conferir ordem
      </button>

      {/* Toast flutuante */}
      <Toast
        message={toast?.message}
        type={toast?.type}
        position="top-right"
        onClose={() => setToast(null)}
      />

      <style>{`
        @keyframes sort-card-move-up {
          from { transform: translateY(18px) scale(.985); opacity: .78; }
          65% { transform: translateY(-3px) scale(1.01); }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes sort-card-move-down {
          from { transform: translateY(-18px) scale(.985); opacity: .78; }
          65% { transform: translateY(3px) scale(1.01); }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes sort-card-displace-up {
          from { transform: translateY(18px); }
          to { transform: translateY(0); }
        }
        @keyframes sort-card-displace-down {
          from { transform: translateY(-18px); }
          to { transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .slot { animation: none !important; }
        }
      `}</style>
    </article>
  );
}
