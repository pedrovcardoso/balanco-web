import { useEffect, useRef } from 'react';
import { Icon } from '@iconify/react';
import { useFocusTrap } from '../../../shared/hooks/useFocusTrap.js';

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

export default function BadgeModal({ medal, onClose }) {
  const modalRef = useRef(null);
  useFocusTrap(modalRef, Boolean(medal));

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!medal) return null;

  const isUnlocked = Boolean(medal.unlocked);
  const ribbonClass = ribbonStyles[isUnlocked ? medal.ribbon : 'locked'] || ribbonStyles.locked;
  const coinClass = coinStyles[isUnlocked ? medal.coin : 'locked'] || coinStyles.locked;
  const iconName = isUnlocked ? medal.icon : 'lock';

  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modalMedalTitle"
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-[#18211a]/60 p-4 backdrop-blur-lg animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-[min(100%,430px)] overflow-hidden rounded-[30px] border-[3px] border-[#8b6914] bg-[linear-gradient(135deg,#fdf6e3,#f5e6c0_58%,#edd9a3)] shadow-[0_24px_60px_rgba(0,0,0,.34)]">
        <div className="p-5 text-center">
          <div
            aria-hidden="true"
            className={`modal-medal-ribbon w-[58px] h-[62px] mx-auto -mb-[21px] rounded-t-[7px] [clip-path:polygon(0_0,100%_0,86%_100%,50%_76%,14%_100%)] shadow-md ${ribbonClass}`}
          />
          <div
            aria-hidden="true"
            className={`modal-medal-coin relative grid w-[112px] h-[112px] mx-auto place-items-center rounded-full border-[6px] text-[2.75rem] shadow-[inset_0_5px_0_rgba(255,255,255,.42),inset_0_-10px_18px_rgba(92,52,8,.28),0_12px_20px_rgba(0,0,0,.24)] ${coinClass}`}
          >
            <Icon icon={`fa6-solid:${iconName}`} />
          </div>

          <p className="mt-4 text-xs font-black uppercase tracking-[.18em] text-[#8f1e23]">
            {medal.type || 'Medalha'}
          </p>
          <h3 id="modalMedalTitle" className="mt-1 font-display text-3xl font-black text-[#2d6a4f]">
            {medal.title}
          </h3>
          <p className="mt-3 text-sm font-extrabold leading-relaxed text-[#6b3a1f]">
            {medal.description}
          </p>

          {medal.meta && (
            <div className="mt-4 rounded-2xl border-2 border-[#f5a800] bg-white/70 px-4 py-3 text-sm font-black text-[#7a4b13]">
              {medal.meta}
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            className="mt-5 w-full rounded-2xl bg-gradient-to-r from-[#2d6a4f] to-emerald-700 px-5 py-3 font-display text-lg font-black text-white shadow-lg transition hover:opacity-95 active:scale-[.98] cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

