import React from 'react';
import { Icon } from '@iconify/react';

export function GameHud({ title, subtitle, icon, hudState, onOpenExit }) {
  const { score = 0, attempts = 0, itemsCount = 0, progress = 0, hudLabels = {} } = hudState || {};

  return (
    <header className="topbar grid grid-cols-[1fr_auto] items-center gap-1.5 max-[560px]:grid-cols-1 mb-2">
      <div className="brand soft flex min-w-0 items-center gap-2 rounded-3xl bg-[#fdf6e3]/70 backdrop-blur-md border border-white/60 px-3 py-1.5">
        <div className="grid size-[38px] shrink-0 place-items-center rounded-[14px] border-2 border-[#f5a800] bg-gradient-to-br from-[#9e1f28] to-[#6f1620] text-lg text-white">
          <Icon icon={icon || "fa6-solid:gamepad"} aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h1 className="m-0 font-display text-[clamp(1rem,3.2vw,1.4rem)] font-bold leading-none text-[#5d2b0a] truncate">
            {title || 'Jogo'}
          </h1>
          {subtitle && (
            <p className="mt-0.5 text-[.68rem] font-black leading-none text-[#7a4b13] max-[560px]:hidden truncate">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="hud flex gap-1.5 max-[560px]:grid max-[560px]:grid-cols-4 max-[560px]:gap-1" aria-label="Status da partida">
        <div className="soft min-w-[58px] rounded-[20px] bg-[#fdf6e3]/70 backdrop-blur-md border border-white/60 px-2 py-1.5 text-center">
          <b className="block font-display text-[1.05rem] leading-none text-[#5d2b0a]">{score}</b>
          <span className="text-[.52rem] font-black uppercase tracking-wider text-[#7a4b13]">
            {hudLabels.score || 'nota'}
          </span>
        </div>

        <div className="soft min-w-[58px] rounded-[20px] bg-[#fdf6e3]/70 backdrop-blur-md border border-white/60 px-2 py-1.5 text-center">
          <b className="block font-display text-[1.05rem] leading-none text-[#5d2b0a]">{attempts}</b>
          <span className="text-[.52rem] font-black uppercase tracking-wider text-[#7a4b13]">
            {hudLabels.attempts || 'tentativas'}
          </span>
        </div>

        <div className="soft min-w-[58px] rounded-[20px] bg-[#fdf6e3]/70 backdrop-blur-md border border-white/60 px-2 py-1.5 text-center">
          <b className="block font-display text-[1.05rem] leading-none text-[#9e1f28]">{itemsCount}</b>
          <span className="text-[.52rem] font-black uppercase tracking-wider text-[#7a4b13]">
            {hudLabels.itemsCount || 'itens'}
          </span>
        </div>

        <button
          onClick={onOpenExit}
          type="button"
          className="inline-flex min-h-[38px] items-center justify-center gap-1 rounded-[16px] border border-[#5d2b0a]/15 bg-white/40 px-2.5 text-xs font-black text-[#6b3a1f] transition hover:bg-white/70"
          aria-label="Sair da partida"
        >
          <Icon icon="fa6-solid:arrow-right-from-bracket" aria-hidden="true" />
          <span className="max-[420px]:hidden">Sair</span>
        </button>
      </div>
    </header>
  );
}
