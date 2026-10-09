import { Icon } from '@iconify/react';
import { formatCurrencyCompact, formatNumber } from '../utils/formatters.js';

const CARD_CONFIGS = [
  {
    key: 'valorExecutado',
    label: 'Total Executado',
    sublabel: 'Execução orçamentária registrada',
    icon: 'fa6-solid:coins',
    color: 'teal',
    format: formatCurrencyCompact,
  },
  {
    key: 'quantidadeProgramas',
    label: 'Programas',
    sublabel: 'Programas presentes na execução',
    icon: 'fa6-solid:layer-group',
    color: 'blue',
    format: formatNumber,
  },
  {
    key: 'quantidadeAcoes',
    label: 'Ações',
    sublabel: 'Ações presentes na execução',
    icon: 'fa6-solid:list-check',
    color: 'violet',
    format: formatNumber,
  },
];

const COLOR_MAP = {
  teal: {
    bg: 'bg-teal-50 border-teal-300 shadow-sm',
    icon: 'bg-teal-700 text-white',
    value: 'text-teal-950 font-black',
    label: 'text-teal-900 font-extrabold',
    sublabel: 'text-teal-800 font-bold',
  },
  blue: {
    bg: 'bg-blue-50 border-blue-300 shadow-sm',
    icon: 'bg-blue-700 text-white',
    value: 'text-blue-950 font-black',
    label: 'text-blue-900 font-extrabold',
    sublabel: 'text-blue-800 font-bold',
  },
  violet: {
    bg: 'bg-violet-50 border-violet-300 shadow-sm',
    icon: 'bg-violet-700 text-white',
    value: 'text-violet-950 font-black',
    label: 'text-violet-900 font-extrabold',
    sublabel: 'text-violet-800 font-bold',
  },
};


/**
 * Cards de resumo com indicadores-chave: Valor Executado, Programas e Ações.
 */
export default function ResumoCards({ resumo }) {

  return (
    <>
    <div className="mb-6 grid grid-cols-1 gap-2.5 sm:grid-cols-3 sm:gap-3" role="list" aria-label="Indicadores fiscais de Minas Gerais">
      {CARD_CONFIGS.map(({ key, label, sublabel, icon, color, format }) => {
        const colors = COLOR_MAP[color];
        const value = resumo?.[key];
        return (
          <div
            key={key}
            role="listitem"
            className={`flex items-center gap-3 rounded-2xl border-2 p-3 sm:p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${colors.bg}`}
          >
            <div className={`flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl text-lg sm:text-xl ${colors.icon}`} aria-hidden="true">
              <Icon icon={icon} />
            </div>
            <div className="min-w-0 flex-1">
              <p className={`text-[10px] sm:text-[11px] font-black uppercase tracking-wider ${colors.label}`}>{label}</p>
              <p className={`text-base sm:text-lg font-black leading-tight ${colors.value}`}>
                {format(value)}
              </p>
              <p className={`text-[9px] sm:text-[10px] font-bold ${colors.sublabel}`}>{sublabel}</p>
            </div>
          </div>
        );
      })}
    </div>
    </>
  );
}

