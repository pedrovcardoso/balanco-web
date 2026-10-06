import { Icon } from '@iconify/react';
import BadgeCard from './BadgeCard.jsx';

export default function BadgeList({ medals = [], dashboard = {}, onSelectMedal }) {
  const unlockedCount = dashboard.unlocked || medals.filter((m) => m.unlocked).length;
  const totalCount = medals.length;
  const starsCount = dashboard.stars || 0;
  const possibleStars = dashboard.possible || 0;

  return (
    <section aria-labelledby="medalShelfTitle" className="map-parchment relative w-full rounded-[30px] border-[3.5px] border-[#8b5e3c] bg-[linear-gradient(135deg,#fdf6e3,#f5ead2_60%,#eedeb4)] p-4 sm:p-5 lg:p-6 shadow-[0_22px_54px_rgba(57,75,40,.3)]">
      <div className="relative z-10">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <h2 id="medalShelfTitle" className="font-display text-3xl font-black text-[#2d6a4f] sm:text-4xl">
              Estante de medalhas
            </h2>
            <p className="mt-1 text-sm font-extrabold text-[#6b3a1f]">
              Toque em uma medalha para ver os detalhes da conquista.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="rounded-full border-2 border-[#f5a800] bg-white/75 px-4 py-2 text-xs font-black uppercase text-[#7a4b13] shadow">
              <Icon icon="fa6-solid:medal" className="mr-1 text-[#f5a800] inline" />
              {unlockedCount} de {totalCount} medalhas
            </div>
            <div className="rounded-full border-2 border-[#f5a800] bg-white/75 px-4 py-2 text-xs font-black uppercase text-[#7a4b13] shadow">
              <Icon icon="fa6-solid:star" className="mr-1 text-[#f5a800] inline" />
              {starsCount} de {possibleStars} estrelas
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[28px] border-4 border-[#5d351d] bg-[repeating-linear-gradient(90deg,#8b5e3c_0_38px,#7a4b2b_39px_43px,#9a6a43_44px_82px)] shadow-[inset_0_-10px_24px_rgba(39,20,8,.24),0_18px_38px_rgba(58,38,24,.26)]">
          <div className="relative z-[1] px-3 pb-[22px] pt-[14px]">
            {medals.length === 0 ? (
              <p className="text-center py-8 font-extrabold text-[#fff7d6]">
                Nenhuma medalha encontrada no momento.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-4 min-[480px]:grid-cols-3 md:grid-cols-4">
                {medals.map((medal, index) => (
                  <BadgeCard
                    key={medal.key || index}
                    medal={medal}
                    onClick={onSelectMedal}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
