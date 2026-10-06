import React from 'react';
import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';

export function ExitGameModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-[#233324]/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="exitGameTitle"
    >
      <div className="w-[min(92vw,420px)] rounded-[28px] bg-[#fdf6e3] p-5 text-center shadow-2xl border border-white/60">
        <div className="mx-auto mb-3 grid size-14 place-items-center rounded-[18px] border border-[#5d2b0a]/10 bg-white/50 text-xl text-[#6b3a1f]">
          <Icon icon="fa6-solid:arrow-right-from-bracket" aria-hidden="true" />
        </div>
        <h2 id="exitGameTitle" className="m-0 font-display text-2xl font-bold text-[#5d2b0a]">
          Sair do jogo?
        </h2>
        <p className="my-3 font-black text-sm leading-tight text-[#6b3a1f]">
          O progresso desta tentativa não será salvo.
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          <button
            onClick={onClose}
            type="button"
            className="min-h-11 rounded-2xl border border-[#5d2b0a]/20 bg-white/50 px-4 py-3 font-black text-[#6b3a1f] transition hover:bg-white"
          >
            Continuar jogando
          </button>
          <Link
            to="/jogos"
            className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-[#9e1f28] px-4 py-3 font-black text-white no-underline shadow-md transition hover:brightness-110"
          >
            Sair para o mapa
          </Link>
        </div>
      </div>
    </div>
  );
}
