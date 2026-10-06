import { MAIN_TRAILS } from '../../../shared/constants/trails.js';
import { isTrailCompleted } from '../../../shared/utils/trailUtils.js';

import TrailCard from './TrailCard.jsx';
import TrophyEnd from './TrophyEnd.jsx';

export default function TreasureMap({
  progressBySlug,
  progressStatus,
  onProtectedNavigation,
}) {
  const allCompleted = MAIN_TRAILS.every((trail) => {
    const progress = progressBySlug.get(trail.slug);

    return isTrailCompleted(progress);
  });

  const isLoading = progressStatus === 'loading';

  return (
    <section
      aria-label="Mapa da Trilha do Tesouro"
      className="w-full min-w-0"
    >
      <div
        className="
          relative w-full overflow-hidden
          rounded-[28px]
          border-[3.5px] border-[#8b5e3c]
          bg-gradient-to-br
          from-[#fdf6e3]/95
          via-[#f5ead2]/95
          to-[#eedeb4]/95
          px-4 py-8
          shadow-2xl
          backdrop-blur-md

          before:pointer-events-none
          before:absolute
          before:inset-2
          before:rounded-[20px]
          before:border-2
          before:border-dashed
          before:border-[#8b5e3c]/25

          lg:min-h-[700px]
          lg:px-8
          lg:py-9
        "
      >
        <svg
          aria-hidden="true"
          focusable="false"
          preserveAspectRatio="none"
          viewBox="0 0 360 860"
          className="
            pointer-events-none
            absolute inset-4
            h-[calc(100%-2rem)]
            w-[calc(100%-2rem)]
            overflow-visible
          "
        >
          <path
            d="
              M92,40
              C92,110 268,120 268,205
              C268,285 92,295 92,380
              C92,460 268,470 268,555
              C268,635 92,645 92,725
              C92,790 180,805 180,850
            "
            className="
              fill-none
              stroke-[#8b5e3c]
              stroke-[5]
              opacity-50
              [stroke-dasharray:8_12]
            "
          />
        </svg>

        <div
          className="
            relative z-10
            flex min-h-[620px]
            flex-col justify-around
            gap-6
            lg:gap-3
          "
        >
          {MAIN_TRAILS.map((trail, index) => (
            <TrailCard
              key={trail.slug}
              trail={trail}
              index={index}
              progress={progressBySlug.get(trail.slug)}
              loading={isLoading}
              onProtectedNavigation={onProtectedNavigation}
            />
          ))}

          <div className="self-center">
            <TrophyEnd unlocked={allCompleted} />
          </div>
        </div>
      </div>
    </section>
  );
}