import { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import { formatCurrencyCompact } from '../utils/formatters.js';

const ODS = {
  1: ['Erradicação da pobreza', '#E5243B'],
  2: ['Fome zero', '#DDA63A'],
  3: ['Saúde e bem-estar', '#4C9F38'],
  4: ['Educação', '#C5192D'],
  5: ['Igualdade de gênero', '#FF3A21'],
  6: ['Água e saneamento', '#26BDE2'],
  7: ['Energia limpa', '#FCC30B'],
  8: ['Trabalho decente', '#A21942'],
  9: ['Indústria e inovação', '#FD6925'],
  10: ['Menos desigualdades', '#DD1367'],
  11: ['Cidades sustentáveis', '#FD9D24'],
  12: ['Consumo responsável', '#BF8B2E'],
  13: ['Ação climática', '#3F7E44'],
  14: ['Vida na água', '#0A97D9'],
  15: ['Vida terrestre', '#56C02B'],
  16: ['Paz e justiça', '#00689D'],
  17: ['Parcerias', '#19486A'],
};

const numberFormatter = new Intl.NumberFormat('pt-BR');

function numeric(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  const parsed = Number(String(value ?? 0).replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : 0;
}

function odsNumber(title) {
  const match = String(title ?? '').match(/(?:ODS\s*)?(\d{1,2})/i);
  return match ? Number(match[1]) : null;
}

const odsImages = import.meta.glob('@assets/images/ods/SDG-*.svg', { eager: true, import: 'default' });

function odsImageUrl(number) {
  return odsImages[`/src/assets/images/ods/SDG-${number}.svg`] || odsImages[`src/assets/images/ods/SDG-${number}.svg`] || '';
}

/**
 * Visualização em cards da execução orçamentária por ODS.
 *
 * Compatível com os dados do legado:
 * [{ odsTitulo, odsSubtitulo, valorExecutado, quantidadeProgramas }]
 */
export default function OdsChart({ ods = [] }) {
  const [order, setOrder] = useState('ods');
  const [openTooltip, setOpenTooltip] = useState(null);
  const rootRef = useRef(null);

  const cards = useMemo(() => {
    const data = new Map();

    ods.forEach((row) => {
      const number = odsNumber(row?.odsTitulo);
      if (!number || !ODS[number]) return;

      data.set(number, {
        value: numeric(row?.valorExecutado),
        programs: numeric(row?.quantidadeProgramas),
        description: String(row?.odsSubtitulo || 'Descrição não informada.'),
      });
    });

    const maxValue = Math.max(...Array.from(data.values(), (item) => item.value), 1);

    return Object.entries(ODS)
      .map(([key, [title, color]]) => {
        const number = Number(key);
        const item = data.get(number) || {
          value: 0,
          programs: 0,
          description: 'Descrição não informada.',
        };

        return {
          number,
          title,
          color,
          ...item,
          percentage: (item.value / maxValue) * 100,
        };
      })
      .sort((a, b) =>
        order === 'execucao'
          ? b.value - a.value || a.number - b.number
          : a.number - b.number,
      );
  }, [ods, order]);

  useEffect(() => {
    function handlePointerDown(event) {
      if (!rootRef.current?.contains(event.target)) {
        setOpenTooltip(null);
        return;
      }

      if (!event.target.closest('[data-ods-card]')) {
        setOpenTooltip(null);
      }

    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setOpenTooltip(null);
      }
    }

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);


  if (!ods.length) {
    return (
      <p className="py-12 text-center text-sm font-bold text-gray-500" role="status">
        Nenhum dado de ODS encontrado.
      </p>
    );
  }

  return (
    <div ref={rootRef} className="relative">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-xs font-black uppercase tracking-wider text-gray-500">
          Ordenação:
        </span>

        {[
          {
            id: 'ods',
            label: 'Ordem dos ODS',
            icon: 'fa6-solid:list-ol',
          },
          {
            id: 'execucao',
            label: 'Maior execução',
            icon: 'fa6-solid:chart-line',
          },
        ].map((option) => {
          const active = order === option.id;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setOrder(option.id)}
              aria-pressed={active}
              className={`flex cursor-pointer items-center gap-1.5 rounded-full border-2 px-3 py-1 text-xs font-black transition-all ${
                active
                  ? 'border-teal-700 bg-teal-700 text-white shadow'
                  : 'border-gray-300 bg-white text-gray-600 hover:border-teal-300 hover:text-teal-700'
              }`}
            >
              <Icon icon={option.icon} aria-hidden="true" />
              {option.label}
            </button>
          );
        })}
      </div>

      <div
        role="list"
        aria-label="Cards dos Objetivos de Desenvolvimento Sustentável com valor executado rateado"
        className="grid grid-cols-2 gap-2 min-[480px]:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 sm:gap-2.5"
      >
        {cards.map((card) => {
          const tooltipId = `ods-tooltip-${card.number}`;
          const tooltipOpen = openTooltip === card.number;

          return (
            <article
              key={card.number}
              data-ods-card
              role="listitem"
              tabIndex={0}
              aria-label={`ODS ${card.number}: ${card.title}. ${card.description}`}
              aria-describedby={tooltipId}
              onClick={() =>
                setOpenTooltip((current) => (current === card.number ? null : card.number))
              }
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  setOpenTooltip((current) =>
                    current === card.number ? null : card.number,
                  );
                }
              }}
              className="group relative grid cursor-pointer grid-cols-[38px_1fr] items-center gap-2 rounded-xl border border-gray-300 bg-white p-2 shadow-2xs transition-all duration-200 hover:border-teal-600 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 sm:grid-cols-[44px_1fr]"
            >
              <img
                className="size-9 rounded-md object-cover sm:size-[44px]"
                style={{ backgroundColor: card.color }}
                src={odsImageUrl(card.number)}
                alt={`ODS ${card.number}: ${card.title}`}
                loading="lazy"
              />

              <div className="min-w-0 flex-1">
                <strong className="block truncate text-[11px] leading-tight text-gray-800 sm:text-xs">
                  {card.title}
                </strong>
                <span className="block text-[11px] font-black text-teal-800 sm:text-xs">
                  {formatCurrencyCompact(card.value)}
                </span>
                <span
                  className="my-1 block h-1.5 overflow-hidden rounded-full bg-gray-200"
                  aria-hidden="true"
                >
                  <span
                    className="block h-full min-w-[2px] rounded-[inherit]"
                    style={{ width: `${card.percentage}%`, backgroundColor: card.color }}
                  />
                </span>
                <small className="block truncate text-[9px] font-bold text-gray-500 sm:text-[10px]">
                  {numberFormatter.format(card.programs)} programa(s)
                </small>
              </div>

              <span
                id={tooltipId}
                role="tooltip"
                className={`absolute bottom-[calc(100%+8px)] left-1/2 z-50 w-[min(260px,85vw)] -translate-x-1/2 rounded-xl border-2 border-teal-900 bg-slate-900 px-3 py-2 text-[11px] font-medium leading-normal text-white shadow-xl transition-all pointer-events-none max-sm:fixed max-sm:bottom-4 max-sm:left-4 max-sm:right-4 max-sm:w-auto max-sm:translate-x-0 ${
                  tooltipOpen
                    ? 'visible translate-y-0 opacity-100 pointer-events-auto'
                    : 'invisible translate-y-1 opacity-0 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus:visible group-focus:translate-y-0 group-focus:opacity-100'
                }`}
              >
                <div className="mb-0.5 flex items-center justify-between font-black text-teal-300">
                  <span>ODS {card.number}</span>
                  {tooltipOpen && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenTooltip(null);
                      }}
                      className="ml-2 text-xs text-gray-400 hover:text-white"
                      aria-label="Fechar informações"
                    >
                      ✕
                    </button>
                  )}
                </div>
                {card.description}
              </span>
            </article>
          );
        })}
      </div>
    </div>
  );
}
