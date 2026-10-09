import { Icon } from '@iconify/react';

const ribbonStyles = {
  red: 'bg-[linear-gradient(135deg,#c0272d_0_46%,#fdf6e3_46%_56%,#8f1e23_56%)]',
  blue: 'bg-[linear-gradient(135deg,#2563eb_0_46%,#fdf6e3_46%_56%,#1d4ed8_56%)]',
  green: 'bg-[linear-gradient(135deg,#10b981_0_46%,#fdf6e3_46%_56%,#047857_56%)]',
  purple: 'bg-[linear-gradient(135deg,#a855f7_0_46%,#fdf6e3_46%_56%,#6d28d9_56%)]',
  gold: 'bg-[linear-gradient(135deg,#f5a800_0_46%,#fff7d6_46%_56%,#b7791f_56%)]',
  locked: 'bg-[linear-gradient(135deg,#a8a29e_0_46%,#e7e5e4_46%_56%,#57534e_56%)] grayscale opacity-80',
};

const coinStyles = {
  gold: 'bg-[radial-gradient(circle_at_32%_24%,#fff5bf_0_18%,#ffd56a_19%_42%,#f5a800_43%_68%,#9a6817_100%)] border-[#7a4b13] text-[#5d2b0a]',
  silver: 'bg-[radial-gradient(circle_at_32%_24%,#fff_0_18%,#e5e7eb_19%_42%,#cbd5e1_43%_68%,#64748b_100%)] border-slate-600 text-slate-700',
  bronze: 'bg-[radial-gradient(circle_at_32%_24%,#ffe4c7_0_18%,#d99b5f_19%_42%,#b87333_43%_68%,#7c3f18_100%)] border-[#7c3f18] text-[#5d2b0a]',
  locked: 'bg-[radial-gradient(circle_at_32%_24%,#f5f5f4_0_18%,#d6d3d1_19%_42%,#a8a29e_43%_68%,#57534e_100%)] border-stone-600 text-stone-700 grayscale',
};

export default function BadgeCard({ medal, onClick }) {
  const isUnlocked = Boolean(medal.unlocked);
  const ribbonClass = ribbonStyles[isUnlocked ? medal.ribbon : 'locked'] || ribbonStyles.locked;
  const coinClass = coinStyles[isUnlocked ? medal.coin : 'locked'] || coinStyles.locked;

  return (
    <button
      type="button"
      onClick={() => onClick(medal)}
      aria-label={`${medal.title} - ${isUnlocked ? 'Liberada' : 'Bloqueada'}`}
      className="relative flex min-h-[220px] min-w-0 flex-col items-center justify-center rounded-[22px] bg-white/15 px-3 py-4 text-center shadow-[inset_0_1px_0_rgba(255,255,255,.3),0_7px_16px_rgba(0,0,0,.16)] transition hover:bg-white/25 active:scale-[.97]"
    >
      <span aria-hidden="true" className={`mb-[-17px] h-12 w-[46px] rounded-t-md ${ribbonClass} [clip-path:polygon(0_0,100%_0,86%_100%,50%_76%,14%_100%)]`} />
      <span aria-hidden="true" className={`relative grid size-[82px] place-items-center rounded-full border-[5px] text-[2rem] md:size-[92px] ${coinClass}`}>
        <Icon icon={`fa6-solid:${isUnlocked ? medal.icon : 'lock'}`} />
      </span>
      <strong className="mt-3 block min-h-[42px] w-full whitespace-normal break-words px-1 font-display text-[.83rem] font-black leading-tight text-[#fff7d6] [text-shadow:0_2px_3px_rgba(0,0,0,.35)]">
        {medal.title}
      </strong>
      <span className={`mt-2 rounded-full px-2 py-1 text-[9px] font-black uppercase ${isUnlocked ? 'bg-white/80 text-[#5d351d]' : 'bg-stone-300/80 text-stone-700'}`}>
        {isUnlocked ? 'Liberada' : 'Bloqueada'}
      </span>
    </button>
  );
}
