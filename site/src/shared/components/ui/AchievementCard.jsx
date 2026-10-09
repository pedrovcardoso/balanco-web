import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes.js';
import { useAuth } from '../../hooks/useAuth.js';
import './AchievementCard.css';

export default function AchievementCard({
  id = 'achievementCard',
  kicker = 'Conquista de leitura',
  title,
  description,
  messageText,
  medalIcon = 'fa6-solid:medal',
  reachedEnd = false,
  claimed = false,
  loading = false,
  onClaim,
  showClaimButton = true,
  statusLockedText = 'Em leitura',
  statusReadyText = 'Pronta para resgate',
  statusClaimedText = 'Medalha conquistada',
  unloggedText = 'Identifique-se para registrar',
}) {
  const { user, isGuest } = useAuth();
  const isLoggedIn = user && !isGuest;
  const [celebrating, setCelebrating] = useState(false);

  const isUnlocked = isLoggedIn && claimed;

  useEffect(() => {
    if (isUnlocked) {
      setCelebrating(true);
      const timer = setTimeout(() => setCelebrating(false), 1300);
      return () => clearTimeout(timer);
    }
  }, [isUnlocked]);

  const handleClaim = async () => {
    try {
      const res = await onClaim?.();
      if (res?.success) {
        setCelebrating(true);
        setTimeout(() => setCelebrating(false), 1300);
      }
    } catch (error) {
      console.error('Falha ao resgatar medalha:', error);
    }
  };

  let currentStatusText = statusLockedText;
  let currentMessageText = messageText;
  let btnText = 'Resgatar medalha';

  if (isUnlocked) {
    currentStatusText = statusClaimedText;
    currentMessageText = 'Conquista registrada com sucesso! Ela já está disponível na sua estante de medalhas.';
    btnText = 'Medalha resgatada';
  } else if (!isLoggedIn) {
    currentStatusText = unloggedText;
  } else if (reachedEnd) {
    currentStatusText = statusReadyText;
  }

  return (
    <section
      aria-labelledby={`${id}Title`}
      className={`achievement-section relative mt-8 overflow-hidden rounded-[28px] border-[3px] border-[#8b6914] bg-[linear-gradient(135deg,rgba(253,246,227,.98),rgba(245,230,192,.96)_55%,rgba(237,217,163,.96))] p-4 md:p-6 shadow-[0_14px_38px_rgba(28,44,30,.22),inset_0_1px_0_rgba(255,255,255,.85)] ${
        reachedEnd && !isUnlocked ? 'is-ready' : ''
      } ${isUnlocked ? 'is-claimed' : ''} ${celebrating ? 'is-celebrating' : ''}`}
      id={id}
    >
      <div aria-hidden="true" className="achievement-burst" />

      <div className="achievement-layout grid grid-cols-1 md:grid-cols-[150px_1fr] items-center gap-4 md:gap-6">
        <div aria-hidden="true" className="achievement-medal-wrap flex flex-col items-center">
          <div className="achievement-ribbon" />
          <div className="achievement-medal">
            <Icon icon={medalIcon} id={`${id}MedalIcon`} />
          </div>
          <span className="achievement-status mt-3 rounded-full bg-[#e7e5e4] px-2.5 py-1 text-[0.68rem] font-black uppercase text-[#57534e]">
            {currentStatusText}
          </span>
        </div>

        <div className="achievement-copy text-left">
          <span className="achievement-kicker inline-flex items-center gap-1 rounded-full bg-[rgba(45,106,79,.12)] px-2.5 py-1 text-xs font-black uppercase tracking-wider text-[#2d6a4f]">
            <Icon icon="fa6-solid:medal" /> {kicker}
          </span>
          <h2
            className="my-2 font-display text-2xl md:text-3xl font-black text-[#3d1a00]"
            id={`${id}Title`}
          >
            {title}
          </h2>
          {description && (
            <p className="font-extrabold text-sm text-[#6b3a1f] mb-1">
              {description}
            </p>
          )}
          {currentMessageText && (
            <p
              aria-live="polite"
              className="font-black text-xs text-[#8b5e3c]"
              id={`${id}Message`}
              role="status"
            >
              {currentMessageText}
            </p>
          )}

          <div className="achievement-actions mt-4 flex flex-wrap gap-2">
            {showClaimButton && !isUnlocked && (
              <button
                className="achievement-btn claim inline-flex items-center gap-1.5 rounded-full bg-[linear-gradient(135deg,#2d6a4f,#10b981)] px-4 py-2.5 font-black text-white shadow-md disabled:grayscale disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed text-sm"
                disabled={isUnlocked || !reachedEnd || loading}
                onClick={handleClaim}
                type="button"
              >
                {loading ? (
                  <>
                    <Icon icon="fa6-solid:spinner" className="animate-spin text-lg" />
                    <span>Resgatando...</span>
                  </>
                ) : (
                  <>
                    <Icon icon="fa6-solid:gift" />
                    <span>{btnText}</span>
                  </>
                )}
              </button>
            )}

            <Link
              className="achievement-btn secondary inline-flex items-center gap-1.5 rounded-full border-2 border-[rgba(139,105,20,.45)] bg-[#fffaf0] px-4 py-2.5 font-black text-[#5d2b0a] text-sm no-underline shadow-sm hover:bg-[#fff7df]"
              to={ROUTES.CONQUISTAS}
            >
              <Icon icon="fa6-solid:trophy" />
              Ver todas as conquistas
            </Link>

            <Link
              className="achievement-btn home inline-flex items-center gap-1.5 rounded-full bg-[linear-gradient(135deg,#c0272d,#8f1e23)] px-4 py-2.5 font-black text-white text-sm no-underline shadow-sm hover:opacity-90"
              to={ROUTES.HOME}
            >
              <Icon icon="fa6-solid:house" />
              Voltar para a tela inicial
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

