import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';

import { TRAIL_KEYS } from '../../../shared/constants/trails.js';
import StatusSeal from './StatusSeal.jsx';

const TRAIL_ICONS = Object.freeze({
  [TRAIL_KEYS.HISTORIA]: 'fa6-solid:mountain-sun',
  [TRAIL_KEYS.BALANCO]: 'fa6-solid:book-open',
  [TRAIL_KEYS.DADOS]: 'solar:chart-2-bold-duotone',
  [TRAIL_KEYS.JOGOS]: 'fa6-solid:gamepad',
  [TRAIL_KEYS.CREDITOS]: 'fa6-solid:circle-info',
});

const THEMES = Object.freeze({
  orange: {
    card: 'border-orange-500 from-amber-50 to-amber-100',
    icon: 'from-amber-400 to-orange-600',
  },
  blue: {
    card: 'border-blue-500 from-blue-50 to-blue-100',
    icon: 'from-sky-400 to-blue-700',
  },
  teal: {
    card: 'border-teal-700 from-teal-50 to-teal-100',
    icon: 'from-teal-400 to-teal-700',
  },
  purple: {
    card: 'border-purple-500 from-fuchsia-50 to-purple-100',
    icon: 'from-pink-500 to-purple-700',
  },
  green: {
    card: 'border-emerald-500 from-green-50 to-green-100',
    icon: 'from-emerald-400 to-green-700',
  },
});

const DEFAULT_THEME = Object.freeze({
  card: 'border-slate-400 from-slate-50 to-slate-100',
  icon: 'from-slate-400 to-slate-600',
});

export default function TrailCard({
  trail,
  index,
  progress,
  loading = false,
  onProtectedNavigation,
}) {
  const iconName = TRAIL_ICONS[trail.key] || 'fa6-solid:circle-info';
  const theme = THEMES[trail.theme] || DEFAULT_THEME;

  const handleClick = (event) => {
    if (!trail.requiresAuth || !onProtectedNavigation) {
      return;
    }

    const canNavigate = onProtectedNavigation();

    if (!canNavigate) {
      event.preventDefault();
    }
  };

  const alignment =
    index % 2 === 0
      ? 'self-start lg:translate-x-4'
      : 'self-end lg:-translate-x-4';

  const borderRadius =
    index % 2 === 0
      ? 'rounded-[16px_22px_16px_22px]'
      : 'rounded-[22px_16px_22px_16px]';

  return (
    <div
      className={`
        relative z-10
        w-[86%] lg:w-[64%]
        ${alignment}
      `}
    >
      <Link
        to={trail.route}
        onClick={handleClick}
        aria-label={`Abrir ${trail.title}: ${trail.description}`}
        className={`
          group relative
          flex min-h-[76px] w-full
          items-center gap-2.5
          border-[2.5px]
          bg-gradient-to-br
          px-3 py-3
          text-left no-underline
          shadow-lg
          transition-all duration-300 ease-out
          hover:-translate-y-1
          hover:border-[#f5a800]
          hover:shadow-xl
          active:translate-y-0
          active:scale-[0.99]
          focus-visible:outline
          focus-visible:outline-4
          focus-visible:outline-offset-4
          focus-visible:outline-[#f5a800]
          motion-reduce:transition-none
          motion-reduce:hover:translate-y-0
          ${borderRadius}
          ${theme.card}
        `}
      >
        <span
          className="
            absolute -top-3 left-4 z-10
            grid h-7 w-7 place-items-center
            rounded-full
            border-2 border-[#fdf6e3]
            bg-[#8b6914]
            text-[11px] font-black text-white
            shadow-md
          "
          aria-hidden="true"
        >
          {String(index + 1).padStart(2, '0')}
        </span>

        <span
          className={`
            grid h-12 w-12 shrink-0
            place-items-center
            rounded-2xl
            border-[3px] border-white/80
            bg-gradient-to-br
            text-xl text-white
            shadow-md
            transition-transform duration-300 ease-out
            group-hover:scale-105
            motion-reduce:transition-none
            motion-reduce:group-hover:scale-100
            ${theme.icon}
          `}
          aria-hidden="true"
        >
          <Icon icon={iconName} />
        </span>

        <span className="min-w-0 flex-1 pr-16">
          <span className="block font-display text-[1.05rem] font-black leading-tight text-gray-800">
            {trail.title}
          </span>

          <span className="mt-1 block text-[0.72rem] font-bold leading-normal text-gray-600">
            {trail.description}
          </span>
        </span>

        <Icon
          icon="fa6-solid:chevron-right"
          className="
            shrink-0
            text-lg text-slate-400
            transition-transform duration-300 ease-out
            group-hover:translate-x-1
            motion-reduce:transition-none
            motion-reduce:group-hover:translate-x-0
          "
          aria-hidden="true"
        />

        <StatusSeal
          status={progress?.status}
          progressPercent={progress?.progressPercent}
          loading={loading}
        />
      </Link>
    </div>
  );
}