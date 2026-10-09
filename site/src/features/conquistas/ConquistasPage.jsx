import { useEffect, useMemo, useState } from 'react';
import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../shared/constants/routes.js';
import { useAuth } from '../../shared/hooks/useAuth.js';
import { getConquistasData } from './services/conquistaService.js';
import { Loading } from '../../shared/components/loading/index.js';
import { useLoadingProgress } from '../../shared/hooks/useLoadingProgress.js';
import BadgeList from './components/BadgeList.jsx';
import BadgeModal from './components/BadgeModal.jsx';
import CertificatePreview from './components/CertificatePreview.jsx';

const CONQUISTAS_LOADING_MESSAGES = [
  'Carregando conquistas e estante de medalhas...',
  'Buscando progresso nas trilhas educativas...',
  'Verificando certificados emitidos...',
  'Calculando medalhas conquistadas...',
];

export default function ConquistasPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [fadeState, setFadeState] = useState('loading');
  const [selectedMedal, setSelectedMedal] = useState(null);
  const [medals, setMedals] = useState([]);
  const [achievementSummary, setAchievementSummary] = useState({});
  const [certData, setCertData] = useState(null);
  const [loadError, setLoadError] = useState('');

  const {
    progress: loadingProgress,
    message: loadingMessage,
    status: loadingStatus,
    setProgress: setLoadingProgress,
  } = useLoadingProgress({
    initialProgress: 20,
    messages: CONQUISTAS_LOADING_MESSAGES,
  });

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setLoading(true);
      setFadeState('loading');
      setLoadError('');
      setLoadingProgress(20, CONQUISTAS_LOADING_MESSAGES[0]);

      try {
        setLoadingProgress(45, CONQUISTAS_LOADING_MESSAGES[1]);
        const data = await getConquistasData();
        if (!isMounted) return;

        const receivedMedals = Array.isArray(data?.achievements)
          ? data.achievements
          : [];

        setLoadingProgress(80, CONQUISTAS_LOADING_MESSAGES[2]);
        setMedals(receivedMedals);
        setAchievementSummary(data?.summary || {});
        setCertData(data?.certificate || null);
        setLoadingProgress(100, 'Conquistas carregadas!');

        if (receivedMedals.length === 0) {
          setLoadError('A API respondeu, mas não retornou medalhas em items.');
        }
      } catch (error) {
        console.warn('[ConquistasPage] Erro ao carregar conquistas:', error);
        if (isMounted) {
          setMedals([]);
          setAchievementSummary({});
          setLoadError(error?.message || 'Não foi possível carregar as conquistas.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [user?.publicUserId, setLoadingProgress]);

  useEffect(() => {
    if (loading) return undefined;
    setFadeState('fading');
    const timer = window.setTimeout(() => setFadeState('ready'), 350);
    return () => window.clearTimeout(timer);
  }, [loading]);

  const dashboard = useMemo(() => {
    const unlockedFallback = medals.filter((medal) => medal?.unlocked).length;

    return {
      stars: Number(achievementSummary?.stars || 0),
      possible: Number(achievementSummary?.possibleStars || 0),
      completed: Number(achievementSummary?.completedGameTrails || 0),
      trails: Number(achievementSummary?.totalGameTrails || 0),
      unlocked: Number(achievementSummary?.unlocked ?? unlockedFallback),
      totalMedals: Number(achievementSummary?.total ?? medals.length),
      certificates: Number(certData?.certificateCount || 0),
    };
  }, [achievementSummary, certData, medals]);

  const isCertificateUnlocked = Boolean(certData?.eligible);
  const remainingPhases = Number(certData?.remainingPhases || 0);
  const remainingRedemptions = Number(certData?.remainingRedemptions || 0);
  const missingRequirements = remainingPhases + remainingRedemptions;
  const totalRequirements =
    Number(certData?.totalPhases || 0) +
    Number(certData?.requiredRedemptions || 0);
  const completedRequirements =
    Number(certData?.completedPhases || 0) +
    Number(certData?.redemptions || 0);
  const progressPercent = totalRequirements > 0
    ? Math.min(100, Math.round((completedRequirements / totalRequirements) * 100))
    : 0;

  const participantDisplayName = user?.displayName || 'Participante';
  const formattedDate = useMemo(() => {
    const formatted = new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
    return `Minas Gerais, ${formatted}.`;
  }, []);

  if (fadeState !== 'ready') {
    return (
      <Loading
        animation="random"
        progress={loadingProgress}
        message={loadingMessage}
        status={loadingStatus}
        className={fadeState === 'fading' ? 'loading-fade-out' : ''}
      />
    );
  }

  return (
    <main className="content-fade-in w-full max-w-full px-3 py-4 font-body text-[#233324] sm:px-5 lg:px-8 lg:py-8">
      <div className="mx-auto mb-4 flex w-full max-w-[1220px] justify-start">
        <Link
          to={ROUTES.HOME}
          aria-label="Voltar para a página inicial"
          className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-[#8b6914] bg-[linear-gradient(135deg,#fffaf0,#f5e6c0)] px-4 py-2 text-xs font-black text-[#5d2b0a] no-underline shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
        >
          <Icon icon="fa6-solid:arrow-left" />
          <span>Voltar para início</span>
        </Link>
      </div>

      <div className="mx-auto flex w-full max-w-[1220px] flex-col gap-5">
        <aside className="mx-auto flex w-full max-w-[1220px] flex-col items-center gap-4">
          <section className="relative w-full max-w-[720px] rounded-[28px] border border-[rgba(139,105,20,0.3)] bg-[linear-gradient(135deg,#fffdfa_0%,#fef7e6_50%,#f9ecce_100%)] p-6 text-center shadow-[0_12px_32px_rgba(45,106,79,0.12)]">
            <h1 className="mt-1 font-display text-4xl font-black leading-none text-[#2d6a4f] sm:text-5xl">
              Cidadão Fiscal <span className="text-[#c0272d]">Nota A!</span>
            </h1>
            <p className="mx-auto mt-3 max-w-md text-sm font-extrabold leading-snug text-[#6b3a1f]">
              Gere seu certificado oficial e acompanhe sua estante de medalhas conquistadas ao longo da jornada.
            </p>
          </section>

          <section
            aria-labelledby="progressTitle"
            className="w-full max-w-[920px] rounded-[24px] border-2 border-[rgba(139,94,60,.45)] bg-[linear-gradient(135deg,rgba(255,255,255,.94),rgba(253,246,227,.92))] p-4 shadow-[0_12px_30px_rgba(49,61,37,.16)] sm:p-5"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span aria-hidden="true" className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-[#f5a800] to-[#ea580c] text-lg text-white shadow-md">
                  <Icon icon="fa6-solid:compass" />
                </span>
                <div>
                  <h2 id="progressTitle" className="font-display text-xl font-black text-[#8f1e23]">
                    Seu progresso
                  </h2>
                  <p className="text-xs font-bold text-[#6b3a1f]">
                    {isCertificateUnlocked
                      ? 'Certificado liberado! Você já pode emitir o PDF.'
                      : `Faltam ${missingRequirements} requisito${missingRequirements !== 1 ? 's' : ''} para liberar o certificado.`}
                  </p>
                </div>
              </div>

              <div aria-label="Indicadores de progresso" className="flex flex-wrap gap-2">
                <span className="rounded-full border border-[rgba(139,105,20,.25)] bg-white/80 px-3 py-1.5 text-[.68rem] font-black uppercase text-[#6b3a1f]">
                  <strong className="mr-1 font-display text-base text-[#2d6a4f]">{dashboard.stars}</strong>
                  estrelas
                </span>
                <span className="rounded-full border border-[rgba(139,105,20,.25)] bg-white/80 px-3 py-1.5 text-[.68rem] font-black uppercase text-[#6b3a1f]">
                  <strong className="mr-1 font-display text-base text-[#2d6a4f]">{dashboard.completed}</strong>
                  trilhas
                </span>
                <span className="rounded-full border border-[rgba(139,105,20,.25)] bg-white/80 px-3 py-1.5 text-[.68rem] font-black uppercase text-[#6b3a1f]">
                  <strong className="mr-1 font-display text-base text-[#2d6a4f]">{dashboard.unlocked}</strong>
                  conquistas
                </span>
              </div>
            </div>

            <div
              role="progressbar"
              aria-label="Progresso para liberar o certificado"
              aria-valuemin={0}
              aria-valuemax={totalRequirements}
              aria-valuenow={completedRequirements}
              aria-valuetext={`${completedRequirements} de ${totalRequirements} requisitos concluídos`}
              className="mt-3.5 h-2.5 w-full overflow-hidden rounded-full bg-[#eadfca] shadow-inner"
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#2d6a4f] via-[#10b981] to-[#f5a800] transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </section>
        </aside>

        {loadError && (
          <div role="alert" className="rounded-2xl border-2 border-red-300 bg-red-50 px-4 py-3 text-center font-black text-red-800">
            {loadError}
          </div>
        )}

        <section className="flex w-full flex-col gap-5">
          <CertificatePreview
            participantName={participantDisplayName}
            formattedDate={formattedDate}
            isLocked={!isCertificateUnlocked}
            missingTrailsCount={missingRequirements}
            completedTrailsCount={completedRequirements}
            requiredTrailsCount={totalRequirements}
          />

          <BadgeList
            medals={medals}
            dashboard={dashboard}
            onSelectMedal={setSelectedMedal}
          />
        </section>
      </div>

      <BadgeModal medal={selectedMedal} onClose={() => setSelectedMedal(null)} />
    </main>
  );
}
