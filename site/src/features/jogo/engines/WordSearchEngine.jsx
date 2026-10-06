import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import { Loading } from '../../../shared/components/loading/index.js';
import { Toast } from '../../../shared/components/ui/Toast.jsx';

const COLS = 11;
const ROWS = 15;
const HORIZONTAL = [1, 0];
const VERTICAL = [0, 1];
const PALETTE = ['#a855f7', '#f59e0b', '#3b82f6', '#16a34a', '#dc2626', '#0ea5e9', '#f97316', '#10b981'];

function parseJson(value, fallback = {}) {
  if (!value) return fallback;
  if (typeof value === 'object') return value;
  try { return JSON.parse(value); } catch { return fallback; }
}

function stripAccents(value) {
  return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function normalizeWord(value) {
  return stripAccents(value).toUpperCase().replace(/[^A-Z]/g, '');
}

function normalizeRows(rows) {
  return (rows || [])
    .map((row, index) => {
      const meta = parseJson(row.metadataJson || row.metadata_json || row.metadata, {});
      const raw = meta.word || row.correctAnswer || row.correct_answer || row.answer || row.prompt;
      return {
        word: normalizeWord(raw),
        label: meta.label || meta.title || row.prompt || raw,
        desc: row.simpleExplanation || row.simple_explanation || meta.description || meta.desc || 'Termo importante desta fase.',
        color: meta.color || PALETTE[index % PALETTE.length],
      };
    })
    .filter((item) => item.word && item.word.length >= 3 && item.word.length <= ROWS)
    .slice(0, 8);
}

function shuffle(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function emptyGrid() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(''));
}

function canPlace(grid, word, c0, r0, dc, dr) {
  const endC = c0 + dc * (word.length - 1);
  const endR = r0 + dr * (word.length - 1);
  if (endC < 0 || endC >= COLS || endR < 0 || endR >= ROWS) return null;

  const cells = [];
  for (let i = 0; i < word.length; i += 1) {
    const c = c0 + dc * i;
    const r = r0 + dr * i;
    const current = grid[r][c];
    if (current && current !== word[i]) return null;
    cells.push([c, r]);
  }
  return cells;
}

function solveGrid(words) {
  const ordered = [...words].sort((a, b) => b.word.length - a.word.length);
  const targetHorizontal = Math.floor(ordered.length / 2);
  const targetVertical = ordered.length - targetHorizontal;

  function buildDirectionPlans() {
    const plans = [];

    function visit(index, horizontalUsed, verticalUsed, current) {
      if (horizontalUsed > targetHorizontal || verticalUsed > targetVertical) return;

      if (index === ordered.length) {
        if (horizontalUsed === targetHorizontal && verticalUsed === targetVertical) {
          plans.push([...current]);
        }
        return;
      }

      const item = ordered[index];

      // Palavras maiores que o número de colunas só podem ficar na vertical.
      if (item.word.length <= COLS) {
        current.push(HORIZONTAL);
        visit(index + 1, horizontalUsed + 1, verticalUsed, current);
        current.pop();
      }

      if (item.word.length <= ROWS) {
        current.push(VERTICAL);
        visit(index + 1, horizontalUsed, verticalUsed + 1, current);
        current.pop();
      }
    }

    visit(0, 0, 0, []);
    return shuffle(plans);
  }

  function positionsFor(word, [dc, dr]) {
    const positions = [];
    const maxColumn = dc === 1 ? COLS - word.length : COLS - 1;
    const maxRow = dr === 1 ? ROWS - word.length : ROWS - 1;

    if (maxColumn < 0 || maxRow < 0) return positions;

    for (let r = 0; r <= maxRow; r += 1) {
      for (let c = 0; c <= maxColumn; c += 1) {
        positions.push([c, r, dc, dr]);
      }
    }
    return shuffle(positions);
  }

  function solve(index, grid, placed, directions) {
    if (index === ordered.length) return { grid, placed };

    const item = ordered[index];
    const direction = directions[index];

    for (const [c, r, dc, dr] of positionsFor(item.word, direction)) {
      const cells = canPlace(grid, item.word, c, r, dc, dr);
      if (!cells) continue;

      const nextGrid = grid.map((row) => [...row]);
      cells.forEach(([cellC, cellR], letterIndex) => {
        nextGrid[cellR][cellC] = item.word[letterIndex];
      });

      const result = solve(index + 1, nextGrid, {
        ...placed,
        [item.word]: cells,
      }, directions);

      if (result) return result;
    }

    return null;
  }

  const directionPlans = buildDirectionPlans();
  if (!directionPlans.length) {
    throw new Error('Não existe uma divisão válida entre palavras horizontais e verticais para esta fase.');
  }

  // Cada plano mantém a divisão equilibrada e respeita o tamanho máximo horizontal.
  for (const directions of directionPlans) {
    const layout = solve(0, emptyGrid(), {}, directions);
    if (!layout) continue;

    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let r = 0; r < ROWS; r += 1) {
      for (let c = 0; c < COLS; c += 1) {
        if (!layout.grid[r][c]) {
          layout.grid[r][c] = letters[Math.floor(Math.random() * letters.length)];
        }
      }
    }

    return layout;
  }

  throw new Error('Não foi possível montar o tabuleiro com todas as palavras.');
}

function lineCells([c0, r0], [c1, r1]) {
  const dc = c1 - c0;
  const dr = r1 - r0;
  const steps = Math.max(Math.abs(dc), Math.abs(dr));
  if (!steps) return [[c0, r0]];
  if (!(dc === 0 || dr === 0 || Math.abs(dc) === Math.abs(dr))) return [];
  const isLeftToRight = dr === 0 && dc > 0;
  const isTopToBottom = dc === 0 && dr > 0;
  if (!isLeftToRight && !isTopToBottom) return [];
  const sc = Math.sign(dc);
  const sr = Math.sign(dr);
  return Array.from({ length: steps + 1 }, (_, i) => [c0 + sc * i, r0 + sr * i]);
}

export function WordSearchEngine({ phase, onUpdateHud, onFeedback, onComplete }) {
  const words = useMemo(() => normalizeRows(phase.rows), [phase.rows]);
  const [grid, setGrid] = useState([]);
  const [placed, setPlaced] = useState({});
  const [foundWords, setFoundWords] = useState(new Set());
  const [hints, setHints] = useState(0);
  const [score, setScore] = useState(100);
  const [showHintModal, setShowHintModal] = useState(false);
  const [hintedCell, setHintedCell] = useState(null);
  const [dragCells, setDragCells] = useState([]);
  const [clickStart, setClickStart] = useState(null);
  const [toast, setToast] = useState(null);
  const [layoutError, setLayoutError] = useState(null);

  const boardRef = useRef(null);
  const dragRef = useRef(null);
  const completionRef = useRef(false);
  const scoreRef = useRef(100);
  const hintsRef = useRef(0);
  const foundRef = useRef(new Set());

  useEffect(() => {
    try {
      const layout = solveGrid(words);
      setGrid(layout.grid);
      setPlaced(layout.placed);
      setFoundWords(new Set());
      foundRef.current = new Set();
      setHints(0);
      hintsRef.current = 0;
      setScore(100);
      scoreRef.current = 100;
      setHintedCell(null);
      setToast(null);
      setLayoutError(null);
      completionRef.current = false;
      dragRef.current = null;
      setDragCells([]);
      setClickStart(null);
    } catch (error) {
      setLayoutError(error.message);
      setGrid([]);
    }
  }, [words]);

  useEffect(() => {
    if (!words.length) return;
    onUpdateHud?.({
      score,
      attempts: `${foundWords.size}/${words.length}`,
      itemsCount: hints,
      progress: Math.round((foundWords.size / words.length) * 100),
      hudLabels: { score: 'nota', attempts: 'palavras', itemsCount: 'dicas' },
    });
  }, [foundWords, hints, onUpdateHud, score, words.length]);

  const cellFromPoint = useCallback((x, y) => {
    const element = document.elementFromPoint(x, y)?.closest?.('[data-word-cell]');
    if (!element || !boardRef.current?.contains(element)) return null;
    return [Number(element.dataset.c), Number(element.dataset.r)];
  }, []);

  function finishSelection(cells) {
    if (!cells.length) return;
    const text = cells.map(([c, r]) => grid[r]?.[c] || '').join('');
    const currentFound = foundRef.current;
    const hit = words.find((word) => !currentFound.has(word.word) && word.word === text);
    if (!hit) return;

    const nextFound = new Set(currentFound);
    nextFound.add(hit.word);
    foundRef.current = nextFound;
    setFoundWords(nextFound);
    setHintedCell(null);
    setToast({ message: `${hit.label}: ${hit.desc}`, type: 'success' });
    onFeedback?.({ correct: true });

    if (nextFound.size === words.length && !completionRef.current) {
      completionRef.current = true;
      window.setTimeout(() => {
        onComplete?.({
          score: scoreRef.current,
          attempts: 1,
          correctCount: words.length,
          totalCount: words.length,
          hintsUsed: hintsRef.current,
          answers: { found: Array.from(nextFound) },
          progress: 100,
        });
      }, 3000);
    }
  }

  function activateCell(cell) {
    if (completionRef.current) return;

    if (!clickStart) {
      setClickStart(cell);
      setDragCells([cell]);
      setToast({
        message: 'Primeira letra selecionada. Escolha agora a última letra.',
        type: 'info',
      });
      return;
    }

    const cells = lineCells(clickStart, cell);
    setClickStart(null);
    setDragCells([]);

    if (!cells.length) {
      setToast({
        message: 'Selecione a última letra à direita ou abaixo da primeira.',
        type: 'warning',
      });
      return;
    }

    finishSelection(cells);
  }

  function handleCellKeyDown(event, c, r) {
    const movement = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
    }[event.key];

    if (movement) {
      event.preventDefault();
      const nextC = Math.min(COLS - 1, Math.max(0, c + movement[0]));
      const nextR = Math.min(ROWS - 1, Math.max(0, r + movement[1]));
      boardRef.current
        ?.querySelector(`[data-word-cell][data-c="${nextC}"][data-r="${nextR}"]`)
        ?.focus();
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      activateCell([c, r]);
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      setClickStart(null);
      setDragCells([]);
    }
  }

  function handlePointerDown(event) {
    if (completionRef.current) return;
    const cell = cellFromPoint(event.clientX, event.clientY);
    if (!cell) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    dragRef.current = { start: cell, cells: [cell], moved: false };
    setHintedCell(null);
    setDragCells([cell]);
  }

  function handlePointerMove(event) {
    if (!dragRef.current) return;
    event.preventDefault();
    const end = cellFromPoint(event.clientX, event.clientY);
    if (!end) return;
    const cells = lineCells(dragRef.current.start, end);
    if (!cells.length) return;
    dragRef.current.cells = cells;
    if (cells.length > 1) dragRef.current.moved = true;
    setDragCells(cells);
  }

  function handlePointerUp(event) {
    const drag = dragRef.current;
    if (!drag) return;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    dragRef.current = null;
    if (drag.moved && drag.cells.length > 1) {
      setClickStart(null);
      setDragCells([]);
      finishSelection(drag.cells);
    } else {
      activateCell(drag.start);
    }
  }

  function handlePointerCancel() {
    dragRef.current = null;
    setDragCells([]);
  }

  function applyHint() {
    const remaining = words.filter((word) => !foundRef.current.has(word.word));
    if (!remaining.length) return;
    const item = remaining[Math.floor(Math.random() * remaining.length)];
    const firstCell = placed[item.word]?.[0];
    if (!firstCell) return;

    const nextHints = hintsRef.current + 1;
    const nextScore = Math.max(0, scoreRef.current - 10);
    hintsRef.current = nextHints;
    scoreRef.current = nextScore;
    setHints(nextHints);
    setScore(nextScore);
    setHintedCell(firstCell);
    setClickStart(null);
    setDragCells([]);
    setShowHintModal(false);
  }

  if (!words.length) {
    return <div className="p-6 text-center font-black text-[#9e1f28]">Nenhuma palavra válida foi encontrada para esta fase.</div>;
  }

  if (layoutError) {
    return <div className="p-6 text-center font-black text-[#9e1f28]">{layoutError}</div>;
  }

  if (!grid.length) {
    return <Loading fullScreen={false} progress={0} message="Carregando Caça-Palavras..." />;
  }

  return (
    <article className="mx-auto flex w-[min(96vw,790px)] select-none flex-col gap-2 px-2.5 pb-20 pt-3 sm:pb-16">
      <div className="inline-flex self-start items-center gap-1.5 rounded-full bg-[#9e1f28]/90 px-3 py-2 text-xs font-black uppercase tracking-wider text-white">
        <Icon icon="fa6-solid:scale-balanced" aria-hidden="true" /> termos da fase
      </div>

      <div>
        <div className="font-display text-[clamp(1.05rem,4.8vw,1.75rem)] font-bold leading-none text-[#5d2b0a]">Encontre os termos desta fase.</div>
        <div className="text-sm font-black text-[#7a4b13]">Arraste ou selecione a primeira e a última letra. Use Tab, setas e Enter no teclado.</div>
      </div>

      <div className="grid w-full min-h-0 justify-items-center gap-1.5 px-2">
        <div className="flex w-[calc(100%-12px)] max-w-[500px] justify-end">
          <button onClick={() => setShowHintModal(true)} type="button" className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-br from-[#f5a800] to-[#c0272d] px-3 py-2 text-xs font-black text-white shadow-md">
            <Icon icon="fa6-solid:lightbulb" aria-hidden="true" /> Dica
          </button>
        </div>

        <div className="flex w-[calc(100%-12px)] max-w-[500px] flex-wrap justify-center gap-1">
          {words.map((word) => {
            const found = foundWords.has(word.word);
            return <span key={word.word} className={`rounded-full px-2 py-1.5 text-[.68rem] font-black ${found ? 'text-white line-through' : 'bg-white/50 text-[#5d2b0a]'}`} style={found ? { backgroundColor: word.color } : undefined}>{word.label}</span>;
          })}
        </div>

        <div
          ref={boardRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          className="relative grid aspect-[11/15] h-auto w-[min(calc(100%-8px),430px)] shrink-0 touch-none grid-cols-11 grid-rows-[repeat(15,minmax(0,1fr))] gap-px rounded-[16px] border border-white/60 bg-[#fff7dc]/40 p-1 shadow-lg"
          aria-label="Tabuleiro de caça-palavras"
        >
          {grid.flatMap((row, r) => row.map((letter, c) => {
            const selected = dragCells.some(([sc, sr]) => sc === c && sr === r);
            const selectionStart = clickStart?.[0] === c && clickStart?.[1] === r;
            const hinted = hintedCell?.[0] === c && hintedCell?.[1] === r;
            let foundColor = null;
            for (const word of words) {
              if (foundWords.has(word.word) && placed[word.word]?.some(([fc, fr]) => fc === c && fr === r)) {
                foundColor = word.color;
                break;
              }
            }
            return (
              <button
                key={`${r}-${c}`}
                data-word-cell
                data-c={c}
                data-r={r}
                type="button"
                tabIndex={0}
                onKeyDown={(event) => handleCellKeyDown(event, c, r)}
                aria-label={`Letra ${letter}, linha ${r + 1}, coluna ${c + 1}${selectionStart ? ', início selecionado' : ''}`}
                aria-pressed={selectionStart}
                className={`letterCell relative z-[2] grid min-h-0 min-w-0 place-items-center rounded-[4px] border-0 font-display text-[clamp(.5rem,2.05vw,.82rem)] font-bold leading-none shadow-sm transition ${selected || selectionStart ? '!bg-gradient-to-br from-blue-500 to-purple-600 !text-white scale-105 z-10' : foundColor ? '!text-white font-black' : hinted ? 'bg-yellow-300 text-[#5d2b0a] ring-4 ring-yellow-400 animate-pulse' : 'bg-white/60 text-[#5d2b0a]'}`}
                style={foundColor && !selected ? { backgroundColor: foundColor } : undefined}
              >
                {letter}
              </button>
            );
          }))}
        </div>
      </div>

      <Toast
        message={toast?.message || ''}
        type={toast?.type || 'info'}
        duration={2800}
        position="top-center"
        onClose={() => setToast(null)}
      />

      {showHintModal && (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-[#233324]/30 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="w-[min(92vw,420px)] rounded-[30px] bg-[#fdf6e3] p-5 text-center border border-white/60 shadow-2xl">
            <div className="mx-auto mb-2 grid size-14 place-items-center rounded-[18px] bg-gradient-to-br from-[#f5a800] to-[#c0272d] text-xl text-white"><Icon icon="fa6-solid:lightbulb" aria-hidden="true" /></div>
            <h2 className="font-display text-2xl font-bold text-[#5d2b0a]">Usar dica?</h2>
            <p className="my-3 font-black text-sm text-[#6b3a1f]">A primeira letra será destacada e você perderá 10 pontos.</p>
            <div className="grid gap-2">
              <button onClick={() => setShowHintModal(false)} type="button" className="rounded-2xl border border-[#5d2b0a]/25 bg-white/40 p-3 font-black text-[#6b3a1f]">Cancelar</button>
              <button onClick={applyHint} type="button" className="rounded-2xl bg-gradient-to-br from-[#0f7a55] to-[#0b3f2d] p-3 font-black text-white">Continuar e perder 10</button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
