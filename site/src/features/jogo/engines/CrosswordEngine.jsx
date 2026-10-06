import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import { Toast } from '../../../shared/components/ui/Toast.jsx';

const BOARD_SIZE = 15;
const KEYBOARD_ROWS = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];

function parseJson(value, fallback = {}) {
  if (!value) return fallback;
  if (typeof value === 'object') return value;
  try { return JSON.parse(value); } catch { return fallback; }
}

function normalizeWord(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z]/g, '');
}

function normalizeRows(rows) {
  return (rows || [])
    .map((row, index) => {
      const metadata = parseJson(row.metadataJson || row.metadata_json || row.metadata, {});
      const rawAnswer = metadata.word || metadata.answer || row.correctAnswer || row.correct_answer || '';
      return {
        sourceId: String(row.id || row.publicQuestionId || `cross-${index}`),
        answer: normalizeWord(rawAnswer),
        label: metadata.label || rawAnswer,
        clue: metadata.clue || row.prompt || row.simpleExplanation || row.simple_explanation || `Termo ${index + 1}`,
        explanation: row.simpleExplanation || row.simple_explanation || metadata.explanation || metadata.description || '',
      };
    })
    .filter((item) => item.answer.length >= 3 && item.answer.length <= 14)
    .slice(0, 10);
}

function shuffle(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

const cellKey = (row, column) => `${row},${column}`;

function buildLayout(source) {
  const grid = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null));
  const words = [...source].sort((a, b) => b.answer.length - a.answer.length);
  const placed = [];
  const center = Math.floor(BOARD_SIZE / 2);

  function canPlace(answer, row, column, direction) {
    const rowStep = direction === 'down' ? 1 : 0;
    const columnStep = direction === 'across' ? 1 : 0;
    const endRow = row + rowStep * (answer.length - 1);
    const endColumn = column + columnStep * (answer.length - 1);
    if (row < 0 || column < 0 || endRow >= BOARD_SIZE || endColumn >= BOARD_SIZE) return null;

    const cells = [];
    let crosses = 0;
    for (let index = 0; index < answer.length; index += 1) {
      const currentRow = row + rowStep * index;
      const currentColumn = column + columnStep * index;
      const current = grid[currentRow][currentColumn];
      if (current && current.letter !== answer[index]) return null;
      if (current) crosses += 1;

      if (!current) {
        const neighbors = direction === 'across'
          ? [[currentRow - 1, currentColumn], [currentRow + 1, currentColumn]]
          : [[currentRow, currentColumn - 1], [currentRow, currentColumn + 1]];
        if (neighbors.some(([r, c]) => r >= 0 && c >= 0 && r < BOARD_SIZE && c < BOARD_SIZE && grid[r][c])) return null;
      }
      cells.push([currentRow, currentColumn]);
    }

    const before = [row - rowStep, column - columnStep];
    const after = [endRow + rowStep, endColumn + columnStep];
    if ([before, after].some(([r, c]) => r >= 0 && c >= 0 && r < BOARD_SIZE && c < BOARD_SIZE && grid[r][c])) return null;
    return { cells, crosses };
  }

  function commit(item, row, column, direction, cells) {
    const id = placed.length;
    cells.forEach(([r, c], index) => {
      if (!grid[r][c]) grid[r][c] = { letter: item.answer[index], words: [] };
      grid[r][c].words.push(id);
    });
    placed.push({ ...item, id, row, column, direction, cells });
  }

  const first = words.shift();
  if (!first) return null;
  const firstColumn = Math.max(0, center - Math.floor(first.answer.length / 2));
  const firstPlacement = canPlace(first.answer, center, firstColumn, 'across');
  if (!firstPlacement) return null;
  commit(first, center, firstColumn, 'across', firstPlacement.cells);

  for (const item of words) {
    const candidates = [];
    for (const existing of placed) {
      for (let newIndex = 0; newIndex < item.answer.length; newIndex += 1) {
        for (let existingIndex = 0; existingIndex < existing.answer.length; existingIndex += 1) {
          if (item.answer[newIndex] !== existing.answer[existingIndex]) continue;
          const direction = existing.direction === 'across' ? 'down' : 'across';
          const [crossRow, crossColumn] = existing.cells[existingIndex];
          const row = crossRow - (direction === 'down' ? newIndex : 0);
          const column = crossColumn - (direction === 'across' ? newIndex : 0);
          const result = canPlace(item.answer, row, column, direction);
          if (result?.crosses > 0) candidates.push({ row, column, direction, ...result });
        }
      }
    }
    if (!candidates.length) continue;
    candidates.sort((a, b) => b.crosses - a.crosses || Math.random() - 0.5);
    const selected = candidates[0];
    commit(item, selected.row, selected.column, selected.direction, selected.cells);
  }

  if (placed.length < 3) return null;
  let minRow = BOARD_SIZE;
  let maxRow = 0;
  let minColumn = BOARD_SIZE;
  let maxColumn = 0;
  placed.flatMap((word) => word.cells).forEach(([row, column]) => {
    minRow = Math.min(minRow, row);
    maxRow = Math.max(maxRow, row);
    minColumn = Math.min(minColumn, column);
    maxColumn = Math.max(maxColumn, column);
  });

  placed.sort((a, b) => a.row - b.row || a.column - b.column || (a.direction === 'across' ? -1 : 1));
  placed.forEach((word, index) => { word.number = index + 1; });
  return { grid, placed, bounds: { minRow, maxRow, minColumn, maxColumn } };
}

function createLayout(source) {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const layout = buildLayout(shuffle(source));
    if (layout) return layout;
  }
  return null;
}

export function CrosswordEngine({ phase, onUpdateHud, onFeedback, onComplete }) {
  const source = useMemo(() => normalizeRows(phase.rows), [phase.rows]);
  const layout = useMemo(() => createLayout(source), [source]);
  const [values, setValues] = useState({});
  const [activeWordId, setActiveWordId] = useState(0);
  const [activeCellIndex, setActiveCellIndex] = useState(0);
  const [hints, setHints] = useState(0);
  const [toast, setToast] = useState(null);
  const [hintCell, setHintCell] = useState(null);
  const [pressedKey, setPressedKey] = useState(null);
  const finishedRef = useRef(false);
  const cellRefs = useRef({});
  const callbacksRef = useRef({ onUpdateHud, onFeedback, onComplete });

  useEffect(() => {
    callbacksRef.current = { onUpdateHud, onFeedback, onComplete };
  }, [onUpdateHud, onFeedback, onComplete]);

  useEffect(() => {
    setValues({});
    setActiveWordId(layout?.placed[0]?.id || 0);
    setActiveCellIndex(0);
    setHints(0);
    setToast(null);
    setHintCell(null);
    finishedRef.current = false;
  }, [phase.id, layout]);

  const placed = layout?.placed || [];
  const activeWord = placed.find((word) => word.id === activeWordId) || placed[0];
  const completedIds = useMemo(() => new Set(
    placed
      .filter((word) => word.cells.every(([r, c], index) => values[cellKey(r, c)] === word.answer[index]))
      .map((word) => word.id),
  ), [placed, values]);
  const score = Math.max(0, 100 - hints * 10);

  useEffect(() => {
    if (!placed.length) return;
    callbacksRef.current.onUpdateHud?.({
      score,
      attempts: `${completedIds.size}/${placed.length}`,
      itemsCount: hints,
      progress: Math.round((completedIds.size / placed.length) * 100),
      hudLabels: { score: 'nota', attempts: 'palavras', itemsCount: 'dicas' },
    });
  }, [completedIds.size, hints, placed.length, score]);

  useEffect(() => {
    if (!activeWord) return;
    const [row, column] = activeWord.cells[activeCellIndex] || activeWord.cells[0];
    const frame = window.requestAnimationFrame(() => cellRefs.current[cellKey(row, column)]?.focus({ preventScroll: true }));
    return () => window.cancelAnimationFrame(frame);
  }, [activeCellIndex, activeWordId]);

  useEffect(() => {
    if (!placed.length || completedIds.size !== placed.length || finishedRef.current) return;
    finishedRef.current = true;
    callbacksRef.current.onFeedback?.({ correct: true });
    window.setTimeout(() => callbacksRef.current.onComplete?.({
      score,
      attempts: 1,
      correctCount: placed.length,
      totalCount: placed.length,
      hintsUsed: hints,
      answers: { words: placed.map((word) => word.answer), hints },
      progress: 100,
    }), 700);
  }, [completedIds.size, hints, placed, score]);

  function selectWord(wordId, cellIndex = 0) {
    setActiveWordId(Number(wordId));
    setActiveCellIndex(Math.max(0, cellIndex));
  }

  function selectCell(row, column) {
    const owners = layout.grid[row][column].words;
    let wordId = owners.includes(activeWordId) ? activeWordId : owners[0];
    if (owners.length > 1 && owners.includes(activeWordId)) {
      const current = placed.find((word) => word.id === activeWordId);
      const clickedIndex = current?.cells.findIndex(([r, c]) => r === row && c === column);
      if (clickedIndex === activeCellIndex) wordId = owners.find((id) => id !== activeWordId) ?? activeWordId;
    }
    const word = placed.find((item) => item.id === wordId);
    selectWord(wordId, word.cells.findIndex(([r, c]) => r === row && c === column));
  }

  function adjacentWord(delta) {
    const index = placed.findIndex((word) => word.id === activeWordId);
    const next = placed[(index + delta + placed.length) % placed.length];
    selectWord(next.id, 0);
  }

  function move(delta) {
    if (!activeWord) return;
    const nextIndex = activeCellIndex + delta;
    if (nextIndex < 0) adjacentWord(-1);
    else if (nextIndex >= activeWord.cells.length) adjacentWord(1);
    else setActiveCellIndex(nextIndex);
  }

  function flashKey(key) {
    setPressedKey(key);
    window.setTimeout(() => setPressedKey(null), 150);
  }

  function enterLetter(letter) {
    if (!activeWord || finishedRef.current) return;
    const clean = normalizeWord(letter).slice(0, 1);
    if (!clean) return;
    const [row, column] = activeWord.cells[activeCellIndex];
    setValues((current) => ({ ...current, [cellKey(row, column)]: clean }));
    flashKey(clean);
    move(1);
  }

  function erase() {
    if (!activeWord || finishedRef.current) return;
    const [row, column] = activeWord.cells[activeCellIndex];
    setValues((current) => {
      const next = { ...current };
      delete next[cellKey(row, column)];
      return next;
    });
    flashKey('BACKSPACE');
    move(-1);
  }

  function useHint() {
    if (!activeWord || finishedRef.current) return;
    const candidates = activeWord.cells
      .map(([row, column], index) => ({ row, column, index }))
      .filter(({ row, column, index }) => values[cellKey(row, column)] !== activeWord.answer[index]);
    if (!candidates.length) {
      setToast({ message: 'Esta palavra já está correta.', type: 'info' });
      return;
    }
    const selected = candidates[Math.floor(Math.random() * candidates.length)];
    setValues((current) => ({
      ...current,
      [cellKey(selected.row, selected.column)]: activeWord.answer[selected.index],
    }));
    setHints((current) => current + 1);
    setActiveCellIndex(selected.index);
    setHintCell(cellKey(selected.row, selected.column));
    setToast({ message: 'Uma letra foi preenchida. 10 pontos foram descontados.', type: 'info' });
    window.setTimeout(() => setHintCell(null), 1100);
  }

  function handleBoardKeyDown(event) {
    if (/^[a-zA-Z]$/.test(event.key)) {
      event.preventDefault();
      enterLetter(event.key);
    } else if (event.key === 'Backspace' || event.key === 'Delete') {
      event.preventDefault();
      erase();
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      flashKey('PREV');
      move(-1);
    } else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      flashKey('NEXT');
      move(1);
    } else if (event.key === 'Tab') {
      event.preventDefault();
      adjacentWord(event.shiftKey ? -1 : 1);
    } else if (event.key === 'Enter' && layout.grid[activeWord.cells[activeCellIndex][0]][activeWord.cells[activeCellIndex][1]].words.length > 1) {
      event.preventDefault();
      const [row, column] = activeWord.cells[activeCellIndex];
      selectCell(row, column);
    }
  }

  if (source.length < 3) {
    return <div className="p-6 text-center font-black text-[#9e1f28]">Cadastre pelo menos 3 respostas válidas para montar a cruzadinha.</div>;
  }
  if (!layout) {
    return <div className="p-6 text-center font-black text-[#9e1f28]">Não foi possível montar uma cruzadinha conectada com os termos cadastrados.</div>;
  }

  const { minRow, maxRow, minColumn, maxColumn } = layout.bounds;
  const visibleRows = maxRow - minRow + 1;
  const visibleColumns = maxColumn - minColumn + 1;
  const starts = new Map(placed.map((word) => [cellKey(word.row, word.column), word.number]));

  function wordStatus(word) {
    const complete = word.cells.every(([r, c]) => Boolean(values[cellKey(r, c)]));
    if (!complete) return 'incomplete';
    return word.cells.every(([r, c], index) => values[cellKey(r, c)] === word.answer[index]) ? 'correct' : 'wrong';
  }

  return (
    <article className="mx-auto flex w-[min(100%,850px)] select-none flex-col gap-2 px-2 pb-24 pt-3 sm:px-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-[#9e1f28]/90 px-3 py-2 text-xs font-black uppercase tracking-wider text-white">
          <Icon icon="fa6-solid:table-cells" aria-hidden="true" /> cruzadinha
        </div>
        <button onClick={useHint} type="button" className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-gradient-to-br from-[#f5a800] to-[#c0272d] px-3 py-2 text-xs font-black text-white shadow-lg focus:outline-none focus:ring-4 focus:ring-[#f5a800]/35">
          <Icon icon="fa6-solid:lightbulb" aria-hidden="true" /> Dica
        </button>
      </div>

      <div className="font-display text-[clamp(1.05rem,4.8vw,1.65rem)] font-bold leading-none text-[#5d2b0a]">
        Complete os termos usando as pistas.
      </div>

      <div className="grid min-h-0 gap-3 lg:grid-cols-[minmax(300px,520px)_minmax(220px,1fr)]">
        <div className="min-w-0">
          <div
            className="crossGrid mx-auto grid w-full max-w-[500px] gap-0.5 rounded-[20px] bg-[#5d2b0a]/10 p-1.5 shadow-lg"
            style={{
              gridTemplateColumns: `repeat(${visibleColumns}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${visibleRows}, minmax(0, 1fr))`,
            }}
            role="grid"
            aria-label={`Cruzadinha com ${placed.length} palavras`}
            onKeyDown={handleBoardKeyDown}
          >
            {Array.from({ length: visibleRows }, (_, rowOffset) =>
              Array.from({ length: visibleColumns }, (_, columnOffset) => {
                const row = minRow + rowOffset;
                const column = minColumn + columnOffset;
                const data = layout.grid[row][column];
                if (!data) return <div key={`${row}-${column}`} aria-hidden="true" />;

                const key = cellKey(row, column);
                const value = values[key] || '';
                const number = starts.get(key);
                const activeIndex = activeWord?.cells.findIndex(([r, c]) => r === row && c === column) ?? -1;
                const inActiveWord = activeIndex >= 0;
                const isActive = inActiveWord && activeIndex === activeCellIndex;
                const statuses = data.words.map((id) => wordStatus(placed.find((word) => word.id === id)));
                const hasWrong = statuses.includes('wrong');
                const allCorrect = statuses.every((status) => status === 'correct');
                const stateClass = allCorrect
                  ? 'border-[#16a34a] bg-[#dcfce7] text-[#14532d]'
                  : hasWrong
                    ? 'border-[#dc2626] bg-[#fee2e2] text-[#7f1d1d]'
                    : isActive
                      ? 'z-10 scale-105 border-[#f5a800] bg-[#fff2a8] ring-4 ring-[#f5a800]/30'
                      : inActiveWord
                        ? 'border-[#c98500]/45 bg-[#fff7dc]'
                        : 'border-[#5d2b0a]/20 bg-white/80';

                return (
                  <button
                    key={key}
                    ref={(element) => { cellRefs.current[key] = element; }}
                    type="button"
                    tabIndex={isActive ? 0 : -1}
                    onClick={() => selectCell(row, column)}
                    aria-current={isActive ? 'true' : undefined}
                    aria-label={`${number ? `Início ${number}. ` : ''}Letra ${value || 'vazia'}, linha ${rowOffset + 1}, coluna ${columnOffset + 1}`}
                    className={`crossCell relative grid aspect-square min-h-0 min-w-0 place-items-center rounded-[5px] border font-display text-[clamp(.62rem,2.7vw,1.05rem)] font-bold uppercase shadow-sm transition-all focus:outline-none ${stateClass} ${hintCell === key ? 'animate-pulse ring-4 ring-blue-400/50' : ''}`}
                  >
                    {number && <span className="absolute left-0.5 top-0 text-[clamp(.4rem,1.4vw,.58rem)] font-black leading-none text-[#7a4b13]">{number}</span>}
                    <span>{value}</span>
                  </button>
                );
              }),
            )}
          </div>

          <div className="sticky bottom-1 z-20 mt-3 grid gap-1 rounded-2xl border border-white/70 bg-[#fdf6e3]/95 p-1.5 shadow-2xl backdrop-blur-xl">
            <div className="mb-1 flex items-center rounded-xl bg-white/60 px-2.5 py-2 text-xs font-black leading-tight text-[#5d2b0a]" aria-live="polite">
              <span className="mr-1.5 grid size-6 shrink-0 place-items-center rounded-lg bg-[#9e1f28] text-[.68rem] text-white">{activeWord.number}</span>
              <span>{activeWord.clue}</span>
            </div>
            {KEYBOARD_ROWS.map((row, rowIndex) => (
              <div key={row} className={`flex justify-center gap-1 ${rowIndex === 2 ? 'px-5' : ''}`}>
                {[...row].map((letter) => (
                  <button
                    key={letter}
                    type="button"
                    onClick={() => enterLetter(letter)}
                    tabIndex={-1}
                    className={`grid h-9 min-w-0 flex-1 place-items-center rounded-lg border border-[#5d2b0a]/15 bg-[#fff7dc] font-display text-sm font-bold text-[#5d2b0a] shadow-[0_3px_0_rgba(93,43,10,.14)] transition ${pressedKey === letter ? 'translate-y-0.5 bg-[#f5a800] text-white shadow-none' : 'active:translate-y-0.5 active:shadow-none'}`}
                  >{letter}</button>
                ))}
              </div>
            ))}
            <div className="mt-0.5 flex justify-center gap-1">
              <button type="button" tabIndex={-1} onClick={erase} className={`inline-flex h-9 flex-[2] items-center justify-center gap-1 rounded-lg bg-[#5d2b0a]/10 px-3 text-xs font-black text-[#5d2b0a] ${pressedKey === 'BACKSPACE' ? 'bg-[#f5a800]/60' : ''}`}>
                <Icon icon="fa6-solid:delete-left" aria-hidden="true" /> Apagar
              </button>
              <button type="button" tabIndex={-1} onClick={() => move(-1)} aria-label="Letra anterior" className="inline-flex h-9 flex-1 items-center justify-center rounded-lg bg-[#5d2b0a]/10 text-[#5d2b0a]"><Icon icon="fa6-solid:chevron-left" aria-hidden="true" /></button>
              <button type="button" tabIndex={-1} onClick={() => move(1)} aria-label="Próxima letra" className="inline-flex h-9 flex-1 items-center justify-center rounded-lg bg-[#5d2b0a]/10 text-[#5d2b0a]"><Icon icon="fa6-solid:chevron-right" aria-hidden="true" /></button>
            </div>
          </div>
        </div>

        <div className="grid content-start gap-3 rounded-3xl bg-white/25 p-3 sm:grid-cols-2 lg:grid-cols-1">
          {['across', 'down'].map((direction) => (
            <section key={direction}>
              <h3 className="mb-1 font-display text-base font-bold text-[#5d2b0a]">{direction === 'across' ? 'Horizontais' : 'Verticais'}</h3>
              <div className="grid gap-1">
                {placed.filter((word) => word.direction === direction).map((word) => {
                  const status = wordStatus(word);
                  const active = word.id === activeWordId;
                  return (
                    <button
                      key={word.id}
                      type="button"
                      onClick={() => selectWord(word.id, 0)}
                      className={`rounded-xl border px-2 py-1.5 text-left text-xs font-black leading-tight transition focus:outline-none focus:ring-2 focus:ring-[#f5a800] ${active ? 'border-[#f5a800] bg-[#fff7dc] shadow-sm' : status === 'correct' ? 'border-green-300 bg-green-50 text-green-900' : status === 'wrong' ? 'border-red-300 bg-red-50 text-red-900' : 'border-transparent bg-white/45 text-[#5d2b0a]'}`}
                    >
                      <b>{word.number}.</b> {word.clue}
                      {status === 'correct' && <Icon icon="fa6-solid:check" className="ml-1 inline text-green-700" aria-hidden="true" />}
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>

      <div className="sr-only" aria-live="polite">Palavra {activeWord.number}, {activeWord.direction === 'across' ? 'horizontal' : 'vertical'}. Letra {activeCellIndex + 1} de {activeWord.answer.length}.</div>
      <Toast message={toast?.message || ''} type={toast?.type || 'info'} position="top-center" onClose={() => setToast(null)} />
      <style>{`
        @media (max-width: 480px) {
          .crossGrid { max-width: min(94vw, 430px); gap: 1px; padding: 4px; border-radius: 15px; }
          .crossCell { border-radius: 3px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .crossCell { transition: none !important; animation: none !important; }
        }
      `}</style>
    </article>
  );
}
