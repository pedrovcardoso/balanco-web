import React from 'react';
import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';

export function GameIntro({ phase, engineInfo, onStart }) {
  const instructions = engineInfo?.instructions || [
    { text: 'Responda aos desafios propostos para marcar pontos.' },
    { text: 'Conclua a fase para desbloquear novas fases na trilha.' }
  ];

  return (
    <div className="relative flex flex-col justify-center inset-0 z-30 p-2">
      <div className="flex flex-col items-center justify-center w-full px-0 pb-2.5 pt-1">
        <div className="soft relative flex w-[min(94%,520px)] flex-col justify-center rounded-[34px] bg-[#fdf6e3]/80 backdrop-blur-md border border-white/70 p-6 text-center">
          <Link
            to="/jogos"
            className="absolute left-4 top-4 inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-[#5d2b0a]/15 bg-white/50 px-3 py-1.5 text-xs font-black text-[#6b3a1f] no-underline transition hover:bg-white/80"
          >
            <Icon icon="fa6-solid:arrow-left" aria-hidden="true" />
            Voltar ao mapa
          </Link>

          <div className="mx-auto mb-2 grid size-[52px] place-items-center rounded-[18px] border-2 border-[#f5a800] bg-gradient-to-br from-[#9e1f28] to-[#7a1620] text-2xl text-white shadow-md mt-6">
            <Icon icon={engineInfo?.icon || "fa6-solid:gamepad"} aria-hidden="true" />
          </div>

          <h2 className="m-0 font-display text-[clamp(1.5rem,5.5vw,2.3rem)] font-bold leading-none text-[#5d2b0a]">
            {phase?.title || 'Fase de Jogo'}
          </h2>

          <p className="my-2 font-black leading-tight text-[#6b3a1f] text-sm">
            {phase?.prompt || 'Conclua o desafio para prosseguir na trilha.'}
          </p>

          <div className="my-3 grid gap-1.5 text-left">
            {instructions.map((item, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-white/60 px-3 py-2 text-[.84rem] font-black leading-tight text-[#5d2b0a] border border-white/50 flex items-center gap-2"
              >
                <Icon icon={item.icon || "fa6-solid:circle-check"} className="text-emerald-700 shrink-0 text-base" />
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 w-[min(94%,520px)]">
          <button
            onClick={onStart}
            type="button"
            className="min-h-12 w-full rounded-[19px] border-0 bg-gradient-to-br from-[#f5a800] to-[#c0272d] px-4 py-3 font-display font-extrabold text-white text-lg shadow-[0_8px_0_rgba(93,43,10,.2)] hover:brightness-105 active:translate-y-1 transition cursor-pointer"
          >
            Começar missão
          </button>
        </div>
      </div>
    </div>
  );
}
