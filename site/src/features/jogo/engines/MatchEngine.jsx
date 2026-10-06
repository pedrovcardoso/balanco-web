import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import { Toast } from '../../../shared/components/ui/Toast.jsx';

const BOARD_SIZE = 5;
const BOARD_CELL_COUNT = BOARD_SIZE * BOARD_SIZE;
const COLORS = ['#3b82f6', '#ef4444', '#a855f7', '#16a34a'];
const DEFAULT_LETTERS = ['B', 'D', 'A', 'C'];

const FLOW_MODELS = [
  [[0,0],[1,0],[2,0],[3,0],[4,0],[4,1],[3,1],[2,1],[1,1],[0,1],[0,2],[1,2],[2,2],[3,2],[4,2],[4,3],[3,3],[2,3],[1,3],[0,3],[0,4],[1,4],[2,4],[3,4],[4,4]],
  [[0,0],[1,0],[2,0],[3,0],[4,0],[4,1],[4,2],[4,3],[4,4],[3,4],[2,4],[1,4],[0,4],[0,3],[0,2],[0,1],[1,1],[2,1],[3,1],[3,2],[3,3],[2,3],[1,3],[1,2],[2,2]],
  [[2,2],[1,2],[1,3],[2,3],[3,3],[3,2],[3,1],[2,1],[1,1],[0,1],[0,2],[0,3],[0,4],[1,4],[2,4],[3,4],[4,4],[4,3],[4,2],[4,1],[4,0],[3,0],[2,0],[1,0],[0,0]],
];

function parseMetadata(row) {
  const value = row.metadataJson || row.metadata_json || row.metadata || {};
  if (typeof value === 'object') return value;
  try { return JSON.parse(value); } catch { return {}; }
}

function normalizeItems(rows) {
  return (rows || [])
    .map((row, index) => {
      const metadata = parseMetadata(row);
      return {
        id: String(metadata.id || row.id || row.publicQuestionId || `flow-${index}`),
        term: metadata.term || row.prompt || `Item ${index + 1}`,
        definition:
          metadata.def ||
          metadata.definition ||
          row.simpleExplanation ||
          row.simple_explanation ||
          'Definição não informada.',
        letter: String(
          metadata.letter ||
          row.correctAnswer ||
          row.correct_answer ||
          DEFAULT_LETTERS[index],
        ).toUpperCase(),
        color: metadata.color || COLORS[index % COLORS.length],
      };
    })
    .filter((item) => item.term && item.definition && item.letter)
    .slice(0, 4);
}

function transformPoint([column, row], transform) {
  switch (transform) {
    case 1: return [4 - row, column];
    case 2: return [4 - column, 4 - row];
    case 3: return [row, 4 - column];
    case 4: return [4 - column, row];
    default: return [column, row];
  }
}

function createBoard(items) {
  const model = FLOW_MODELS[Math.floor(Math.random() * FLOW_MODELS.length)];
  const transform = Math.floor(Math.random() * 5);
  const cuts = [6, 12, 18, 25];
  const endpoints = {};
  let start = 0;

  items.forEach((item, index) => {
    const solutionPath = model
      .slice(start, cuts[index])
      .map((point) => transformPoint(point, transform));

    endpoints[item.id] = {
      concept: solutionPath[0],
      definition: solutionPath[solutionPath.length - 1],
    };
    start = cuts[index];
  });

  return endpoints;
}

function samePoint(first, second) {
  return Boolean(first && second && first[0] === second[0] && first[1] === second[1]);
}

function pointKey([column, row]) {
  return `${column}:${row}`;
}

function isNeighbor(first, second) {
  return Math.abs(first[0] - second[0]) + Math.abs(first[1] - second[1]) === 1;
}

function svgPoints(path) {
  return path.map(([column, row]) => `${column * 20 + 10},${row * 20 + 10}`).join(' ');
}

function countUsedCells(paths) {
  return new Set(Object.values(paths).flat().map(pointKey)).size;
}

export function MatchEngine({ phase, onUpdateHud, onFeedback, onComplete }) {
  const items = useMemo(() => normalizeItems(phase.rows), [phase.rows]);
  const definitions = useMemo(
    () => [...items].sort((first, second) => first.letter.localeCompare(second.letter)),
    [items],
  );
  const endpoints = useMemo(() => (items.length === 4 ? createBoard(items) : {}), [items]);

  const [paths, setPaths] = useState({});
  const [pairs, setPairs] = useState({});
  const [errors, setErrors] = useState(0);
  const [draft, setDraft] = useState(null);
  const [toast, setToast] = useState(null);
  const [finished, setFinished] = useState(false);

  const boardRef = useRef(null);
  const pathsRef = useRef({});
  const pairsRef = useRef({});
  const errorsRef = useRef(0);
  const draftRef = useRef(null);
  const finishedRef = useRef(false);
  const callbacksRef = useRef({ onUpdateHud, onFeedback, onComplete });

  useEffect(() => {
    callbacksRef.current = { onUpdateHud, onFeedback, onComplete };
  }, [onUpdateHud, onFeedback, onComplete]);

  useEffect(() => {
    pathsRef.current = {};
    pairsRef.current = {};
    errorsRef.current = 0;
    draftRef.current = null;
    finishedRef.current = false;
    setPaths({});
    setPairs({});
    setErrors(0);
    setDraft(null);
    setToast(null);
    setFinished(false);
  }, [phase.id]);

  const usedCells = countUsedCells(paths);
  const correctPairs = items.filter((item) => pairs[item.id] === item.letter).length;
  const score = Math.max(0, 100 - errors * 10);

  useEffect(() => {
    if (items.length !== 4) return;
    callbacksRef.current.onUpdateHud?.({
      score,
      attempts: errors,
      itemsCount: `${correctPairs}/${items.length}`,
      progress: Math.round((usedCells / BOARD_CELL_COUNT) * 100),
      hudLabels: { score: 'nota', attempts: 'erros', itemsCount: 'fluxos' },
    });
  }, [correctPairs, errors, items.length, score, usedCells]);

  function getItem(itemId) {
    return items.find((item) => item.id === itemId);
  }

  function getEndpoint(point) {
    for (const item of items) {
      const itemEndpoints = endpoints[item.id];
      if (!itemEndpoints) continue;
      if (samePoint(itemEndpoints.concept, point)) return { type: 'concept', item };
      if (samePoint(itemEndpoints.definition, point)) return { type: 'definition', item };
    }
    return null;
  }

  function commit(nextPaths, nextPairs) {
    pathsRef.current = nextPaths;
    pairsRef.current = nextPairs;
    setPaths(nextPaths);
    setPairs(nextPairs);
  }

  function withoutPath(itemId, sourcePaths = pathsRef.current, sourcePairs = pairsRef.current) {
    const nextPaths = { ...sourcePaths };
    const nextPairs = { ...sourcePairs };
    delete nextPaths[itemId];
    delete nextPairs[itemId];
    return { paths: nextPaths, pairs: nextPairs };
  }

  function pathOwnerAt(point, currentItemId) {
    for (const [itemId, path] of Object.entries(pathsRef.current)) {
      if (itemId !== currentItemId && path.some((cell) => samePoint(cell, point))) return itemId;
    }
    return null;
  }

  function startPath(item, mode) {
    if (finishedRef.current) return;
    const cleanState = withoutPath(item.id);
    commit(cleanState.paths, cleanState.pairs);

    const nextDraft = {
      itemId: item.id,
      mode,
      path: [[...endpoints[item.id].concept]],
    };
    draftRef.current = nextDraft;
    setDraft(nextDraft);
  }

  function extendDraft(point) {
    const current = draftRef.current;
    if (!current) return false;

    const last = current.path[current.path.length - 1];
    if (samePoint(last, point)) return true;
    if (getEndpoint(last)?.type === 'definition') return false;
    if (!isNeighbor(last, point)) return false;

    const existingIndex = current.path.findIndex((cell) => samePoint(cell, point));
    if (existingIndex >= 0) {
      const shortened = { ...current, path: current.path.slice(0, existingIndex + 1) };
      draftRef.current = shortened;
      setDraft(shortened);
      return true;
    }

    const endpoint = getEndpoint(point);
    if (endpoint?.type === 'concept' && endpoint.item.id !== current.itemId) return false;

    const ownerId = pathOwnerAt(point, current.itemId);
    if (ownerId) {
      const cleanState = withoutPath(ownerId);
      commit(cleanState.paths, cleanState.pairs);
    }

    const extended = { ...current, path: [...current.path, point] };
    draftRef.current = extended;
    setDraft(extended);
    return true;
  }

  function verifyCompletion(nextPaths, nextPairs) {
    const allPairsCorrect = items.every((item) => nextPairs[item.id] === item.letter);
    if (!allPairsCorrect) return;

    const occupied = countUsedCells(nextPaths);
    if (occupied !== BOARD_CELL_COUNT) {
      const missing = BOARD_CELL_COUNT - occupied;
      setToast({
        message: `As conexões estão corretas, mas ainda ${missing === 1 ? 'falta' : 'faltam'} ${missing} ${missing === 1 ? 'quadrado' : 'quadrados'}.`,
        type: 'warning',
      });
      return;
    }

    if (finishedRef.current) return;
    finishedRef.current = true;
    setFinished(true);
    callbacksRef.current.onFeedback?.({ correct: true });

    const finalErrors = errorsRef.current;
    callbacksRef.current.onComplete?.({
      score: Math.max(0, 100 - finalErrors * 10),
      attempts: finalErrors,
      correctCount: items.length,
      totalCount: items.length,
      answers: { pairs: nextPairs, errors: finalErrors },
      progress: 100,
    });
  }

  function finishDraft() {
    const current = draftRef.current;
    if (!current) return;

    draftRef.current = null;
    setDraft(null);

    const destination = getEndpoint(current.path[current.path.length - 1]);
    if (!destination || destination.type !== 'definition') return;

    let nextPaths = { ...pathsRef.current };
    let nextPairs = { ...pairsRef.current };

    const previousOwner = Object.entries(nextPairs).find(
      ([itemId, letter]) => itemId !== current.itemId && letter === destination.item.letter,
    )?.[0];

    if (previousOwner) {
      const cleanState = withoutPath(previousOwner, nextPaths, nextPairs);
      nextPaths = cleanState.paths;
      nextPairs = cleanState.pairs;
    }

    nextPaths[current.itemId] = current.path;
    nextPairs[current.itemId] = destination.item.letter;
    commit(nextPaths, nextPairs);

    const isCorrect = getItem(current.itemId).letter === destination.item.letter;
    if (!isCorrect) {
      const nextErrors = errorsRef.current + 1;
      errorsRef.current = nextErrors;
      setErrors(nextErrors);
      callbacksRef.current.onFeedback?.({ correct: false });
    }

    verifyCompletion(nextPaths, nextPairs);
  }

  function cancelDraft() {
    draftRef.current = null;
    setDraft(null);
  }

  function pointerToPoint(event) {
    const rect = boardRef.current?.getBoundingClientRect();
    if (!rect) return null;
    const column = Math.floor(((event.clientX - rect.left) / rect.width) * BOARD_SIZE);
    const row = Math.floor(((event.clientY - rect.top) / rect.height) * BOARD_SIZE);
    if (column < 0 || column >= BOARD_SIZE || row < 0 || row >= BOARD_SIZE) return null;
    return [column, row];
  }

  function handlePointerDown(event) {
    const point = pointerToPoint(event);
    const endpoint = point ? getEndpoint(point) : null;
    if (!endpoint || endpoint.type !== 'concept' || finishedRef.current) return;

    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    startPath(endpoint.item, 'pointer');
  }

  function handlePointerMove(event) {
    if (draftRef.current?.mode !== 'pointer') return;
    event.preventDefault();
    const point = pointerToPoint(event);
    if (point) extendDraft(point);
  }

  function handlePointerUp(event) {
    if (draftRef.current?.mode !== 'pointer') return;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    finishDraft();
  }

  function handleCellActivation(point) {
    const endpoint = getEndpoint(point);

    if (!draftRef.current) {
      if (endpoint?.type === 'concept') {
        startPath(endpoint.item, 'keyboard');
      } else {
        setToast({ message: 'Comece o caminho em um conceito colorido.', type: 'info' });
      }
      return;
    }

    if (!extendDraft(point)) {
      setToast({ message: 'Escolha um quadrado vizinho ao último quadrado do caminho.', type: 'warning' });
      return;
    }

    if (endpoint?.type === 'definition') finishDraft();
  }

  function handleCellFocus(point) {
    const current = draftRef.current;
    if (!current || current.mode !== 'keyboard') return;
    const last = current.path[current.path.length - 1];
    if (samePoint(last, point) || !isNeighbor(last, point)) return;
    if (extendDraft(point) && getEndpoint(point)?.type === 'definition') finishDraft();
  }

  function handleCellKeyDown(event, column, row) {
    const direction = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
    }[event.key];

    if (direction) {
      event.preventDefault();
      const nextColumn = Math.max(0, Math.min(4, column + direction[0]));
      const nextRow = Math.max(0, Math.min(4, row + direction[1]));
      const nextPoint = [nextColumn, nextRow];
      boardRef.current
        ?.querySelector(`[data-flow-cell="${nextColumn}:${nextRow}"]`)
        ?.focus();
      if (draftRef.current?.mode === 'keyboard') {
        extendDraft(nextPoint);
        if (getEndpoint(nextPoint)?.type === 'definition') finishDraft();
      }
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleCellActivation([column, row]);
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      cancelDraft();
    }
  }

  if (items.length !== 4) {
    return (
      <div className="mx-auto w-[min(92vw,520px)] rounded-2xl border border-red-200 bg-red-50 p-4 text-center font-black text-red-800">
        O Flow precisa de exatamente 4 conceitos válidos nesta fase.
      </div>
    );
  }

  return (
    <article className="mx-auto flex w-[min(96vw,790px)] select-none flex-col gap-2 px-2.5 pb-16 pt-3">
      <div className="inline-flex self-start items-center gap-1.5 rounded-full bg-[#9e1f28]/90 px-3 py-2 text-xs font-black uppercase tracking-wider text-white">
        <Icon icon="fa6-solid:water" aria-hidden="true" /> flow quiz
      </div>

      <div className="font-display text-[clamp(1rem,4.8vw,1.6rem)] font-bold leading-none text-[#5d2b0a]">
        Arraste cada conceito até a letra da definição correta.
      </div>

      <div className="grid w-full max-w-[560px] grid-cols-2 gap-1.5 self-center max-[560px]:grid-cols-1">
        {definitions.map((item) => (
          <div key={item.id} className="grid grid-cols-[auto_1fr] items-center gap-1.5 rounded-2xl bg-white/50 px-2 py-1.5 text-xs font-black text-[#5d2b0a]">
            <span className="grid size-6 place-items-center rounded-lg bg-[#fff7dc]">{item.letter}</span>
            <span>{item.definition}</span>
          </div>
        ))}
      </div>

      <div
        ref={boardRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={cancelDraft}
        className="relative aspect-square w-[min(92vw,460px)] max-[420px]:w-[min(88vw,380px)] touch-none self-center overflow-visible rounded-[20px] border border-white/60 bg-[rgba(255,247,220,0.42)] shadow-lg"
        role="grid"
        aria-label="Tabuleiro Flow, 5 linhas por 5 colunas"
      >
        <div className="pointer-events-none absolute inset-0 grid grid-cols-5 grid-rows-5" aria-hidden="true">
          {Array.from({ length: BOARD_CELL_COUNT }, (_, index) => (
            <div key={index} className="border-b border-r border-[#5d2b0a]/15" />
          ))}
        </div>

        <svg className="flowBoardSvg pointer-events-none absolute inset-0 z-[2] size-full" viewBox="0 0 100 100" aria-hidden="true">
          {Object.entries(paths).map(([itemId, path]) => {
            const item = getItem(itemId);
            const isWrong = pairs[itemId] !== item.letter;
            return (
              <g key={itemId}>
                <polyline points={svgPoints(path)} fill="none" stroke="rgba(255,255,255,.82)" strokeWidth="7.5" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points={svgPoints(path)} fill="none" stroke={isWrong ? '#ef4444' : item.color} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
                {isWrong && path.length > 0 && (() => {
                  const middle = path[Math.floor(path.length / 2)];
                  return (
                    <g aria-hidden="true">
                      <circle cx={middle[0] * 20 + 10} cy={middle[1] * 20 + 10} r="3.8" fill="#fff7dc" stroke="#ef4444" strokeWidth="1" />
                      <text x={middle[0] * 20 + 10} y={middle[1] * 20 + 12.1} textAnchor="middle" fill="#ef4444" fontSize="6.2" fontWeight="900">×</text>
                    </g>
                  );
                })()}
              </g>
            );
          })}
          {draft && (
            <g>
              <polyline points={svgPoints(draft.path)} fill="none" stroke="rgba(255,255,255,.82)" strokeWidth="7.5" strokeLinecap="round" strokeLinejoin="round" />
              <polyline points={svgPoints(draft.path)} fill="none" stroke={getItem(draft.itemId).color} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          )}
        </svg>

        <div className="absolute inset-0 z-[3] grid grid-cols-5 grid-rows-5">
          {Array.from({ length: BOARD_CELL_COUNT }, (_, index) => {
            const column = index % BOARD_SIZE;
            const row = Math.floor(index / BOARD_SIZE);
            const point = [column, row];
            const endpoint = getEndpoint(point);
            const destinationOwner = endpoint?.type === 'definition'
              ? Object.entries(pairs).find(([, letter]) => letter === endpoint.item.letter)?.[0]
              : null;

            return (
              <button
                key={pointKey(point)}
                data-flow-cell={pointKey(point)}
                type="button"
                onClick={() => handleCellActivation(point)}
                onKeyDown={(event) => handleCellKeyDown(event, column, row)}
                onFocus={() => handleCellFocus(point)}
                className="flowCell group relative min-h-0 min-w-0 rounded-none bg-transparent p-0 focus:z-20 focus:outline-none focus:ring-4 focus:ring-inset focus:ring-[#f5a800]"
                aria-label={`${endpoint?.type === 'concept' ? `Conceito ${endpoint.item.term}` : endpoint?.type === 'definition' ? `Letra ${endpoint.item.letter}` : 'Quadrado vazio'}, linha ${row + 1}, coluna ${column + 1}`}
              >
                {endpoint && (
                  <span
                    className={`pointer-events-none absolute inset-[12%] z-[4] grid place-items-center rounded-[clamp(10px,3vw,18px)] border-[3px] border-white/85 p-0.5 text-center font-display text-[clamp(.58rem,2.8vw,1.05rem)] font-bold leading-none shadow-lg transition ${
                      endpoint.type === 'concept' ? 'text-white' : 'text-[#5d2b0a]'
                    } ${draft?.itemId === endpoint.item.id && endpoint.type === 'concept' ? 'scale-105 ring-4 ring-[#f5a800] ring-offset-2 ring-offset-[#fff7dc]' : ''}`}
                    style={
                      endpoint.type === 'concept'
                        ? { background: endpoint.item.color }
                        : destinationOwner
                          ? {
                              background: getItem(destinationOwner).color,
                              backgroundImage: 'none',
                              color: '#fff',
                            }
                          : { background: 'linear-gradient(145deg, #fff7dc, #ead8ad)' }
                    }
                  >
                    {endpoint.type === 'concept' ? endpoint.item.term : endpoint.item.letter}
                  </span>
                )}
                {endpoint && (
                  <span
                    role="tooltip"
                    className={`pointer-events-none absolute z-[30] w-max max-w-[210px] rounded-xl bg-[#4b220b] px-2.5 py-1.5 text-center text-[.68rem] font-black leading-tight text-white opacity-0 shadow-xl transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100 ${
                      row === 0 ? 'top-[calc(100%-5px)]' : 'bottom-[calc(100%-5px)]'
                    } ${
                      column === 0 ? 'left-1' : column === 4 ? 'right-1' : 'left-1/2 -translate-x-1/2'
                    }`}
                  >
                    {endpoint.type === 'concept'
                      ? endpoint.item.term
                      : `${endpoint.item.letter}: ${endpoint.item.definition}`}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="text-center text-xs font-black text-[#7a4b13]">
        Preencha todos os 25 quadrados.
      </div>

      <div className="sr-only" aria-live="polite">
        {draft
          ? `Caminho de ${getItem(draft.itemId).term} com ${draft.path.length} quadrados.`
          : finished
            ? 'Flow concluído.'
            : ''}
      </div>

      <style>{`
        .flowBoardSvg { border-radius: 19px; overflow: hidden; }
        @media (max-width: 420px) {
          .flowCell > span:first-child { inset: 10%; border-radius: 13px; border-width: 2px; }
        }
      `}</style>

      <Toast
        message={toast?.message || ''}
        type={toast?.type || 'info'}
        position="top-center"
        onClose={() => setToast(null)}
      />
    </article>
  );
}
