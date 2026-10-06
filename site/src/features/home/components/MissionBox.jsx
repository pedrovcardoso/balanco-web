import { Icon } from '@iconify/react';

export default function MissionBox() {
  return (
    <section className="relative w-full max-w-sm rounded-[22px] border-[2.5px] border-[#f5a800] bg-gradient-to-br from-white/95 to-[#fdf6e3]/95 px-[18px] py-[15px] shadow-lg backdrop-blur-md before:pointer-events-none before:absolute before:inset-1.5 before:rounded-2xl before:border before:border-dashed before:border-[#f5a800]/40" aria-labelledby="mission-title">
      <div className="relative">
        <h2 id="mission-title" className="m-0 flex items-center gap-2 font-display text-lg font-black text-[#3d1a00]">
          <Icon icon="solar:map-point-wave-bold-duotone" aria-hidden="true" />
          Trilha do Tesouro
        </h2>
        <p className="mt-1 text-sm font-bold leading-relaxed text-[#6b3a1f]">
          Siga o mapa, desbrave Minas Gerais e chegue ao final para se tornar um <strong>Cidadão Fiscal Nota A</strong>!
        </p>
        <div className="mt-3 flex items-center justify-center gap-1" aria-label="Cinco paradas pela frente">
          <span className="h-2 w-2 rounded-full bg-[#f5a800]" />
          <span className="h-2 w-2 rounded-full bg-[#f5a800]" />
          <span className="h-2 w-2 rounded-full bg-[#f5a800]" />
          <span className="ml-2 text-xs font-black text-[#8b5e3c]">5 paradas pela frente</span>
        </div>
      </div>
    </section>
  );
}
