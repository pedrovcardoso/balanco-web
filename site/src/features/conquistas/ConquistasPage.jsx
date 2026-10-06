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

const REQUIRED_TRAILS = 5;

const visuals = [
  { ribbon: 'red', icon: 'landmark' },
  { ribbon: 'blue', icon: 'coins' },
  { ribbon: 'purple', icon: 'chart-line' },
  { ribbon: 'green', icon: 'magnifying-glass-chart' },
];

function shortName(val) {
  return String(val || 'Trilha')
    .replace(' Pública', '')
    .replace(' e Controle Social', '')
    .slice(0, 22);
}

function groupGameRows(rows) {
  const map = new Map();
  (Array.isArray(rows) ? rows : [])
    .filter(Boolean)
    .sort(
      (a, b) =>
        Number(a?.sectionOrder || 0) - Number(b?.sectionOrder || 0) ||
        Number(a?.phaseOrder || 0) - Number(b?.phaseOrder || 0)
    )
    .forEach((row) => {
      const key = row.sectionSlug || `secao-${row.gameSectionId || map.size + 1}`;
      if (!map.has(key)) {
        map.set(key, {
          slug: key,
          title: row.sectionTitle || key,
          order: Number(row.sectionOrder || map.size + 1),
          phases: [],
        });
      }
      map.get(key).phases.push(row);
    });
  return [...map.values()].sort((a, b) => a.order - b.order);
}

function getMedalCoinLevel(stars, max, unlocked) {
  if (!unlocked) return 'locked';
  if (stars >= Math.ceil(max * 0.75)) return 'gold';
  if (stars >= Math.ceil(max * 0.5)) return 'silver';
  return 'bronze';
}

export default function ConquistasPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [fadeState, setFadeState] = useState('loading');
  const [selectedMedal, setSelectedMedal] = useState(null);
  const [rawGameRows, setRawGameRows] = useState([]);
  const [certData, setCertData] = useState(null);
  const [userProgressData, setUserProgressData] = useState(null);
  const [trailProgressData, setTrailProgressData] = useState([]);

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
      setLoadingProgress(20, CONQUISTAS_LOADING_MESSAGES[0]);
      try {
        setLoadingProgress(45, CONQUISTAS_LOADING_MESSAGES[1]);
        const data = await getConquistasData();
        if (isMounted) {
          setLoadingProgress(80, CONQUISTAS_LOADING_MESSAGES[2]);
          setRawGameRows(data.gameMap || []);
          setCertData(data.certificate);
          setUserProgressData(data.progress);
          setTrailProgressData(data.trailProgress || []);
          setLoadingProgress(100, 'Conquistas carregadas!');
        }
      } catch (err) {
        console.warn('[ConquistasPage] Erro ao carregar conquistas:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [user, setLoadingProgress]);

  useEffect(() => {
    if (!loading) {
      setFadeState('fading');
      const timer = setTimeout(() => {
        setFadeState('ready');
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  const { medals, dashboard } = useMemo(() => {
    const sections = groupGameRows(rawGameRows);

    const trailMedals = sections.map((section, index) => {
      const phases = Array.isArray(section?.phases) ? section.phases : [];
      const total = phases.length;
      const done = phases.filter(
        (p) => p && String(p.status || '').toLowerCase() === 'completed'
      ).length;
      const stars = phases.reduce(
        (n, p) => n + Number(p?.bestStars || 0),
        0
      );
      const max = total * 3;
      const unlocked = total > 0 && done === total;
      const visual = visuals[index % visuals.length] || visuals[0];

      return {
        type: 'Trilha',
        key: section.slug,
        title: section.title,
        shortName: shortName(section.title),
        icon: visual.icon,
        ribbon: visual.ribbon,
        coin: getMedalCoinLevel(stars, max, unlocked),
        unlocked,
        stars,
        max,
        brilliant: unlocked && stars >= max,
        description: unlocked
          ? `Concedida por concluir todas as ${total} fases da trilha ${section.title}.`
          : `Bloqueada. Conclua as ${total} fases da trilha ${section.title}.`,
        meta: unlocked ? `${stars} de ${max} estrelas` : `${done}/${total} fases concluídas`,
      };
    });

    const completedTrailsFromBackend = (Array.isArray(trailProgressData) ? trailProgressData : []).filter(
      (t) => t && (t.isCompleted || t.status === 'completed')
    ).length;

    const gameStars = trailMedals.reduce((n, m) => n + m.stars, 0);
    const totalStars =
      userProgressData?.totalStars != null
        ? Number(userProgressData.totalStars)
        : gameStars;
    const possibleStars = trailMedals.reduce((n, m) => n + m.max, 0);
    const completedGameTrails = trailMedals.filter((m) => m.unlocked).length;
    const effectiveCompletedTrails = Math.max(
      completedGameTrails,
      completedTrailsFromBackend
    );

    const brilliantCount = trailMedals.filter((m) => m.brilliant).length;
    const certificatesCount = Number(certData?.certificateCount || 0);
    const totalTrailsCount = Math.max(trailMedals.length, REQUIRED_TRAILS);

    const achievement = (
      key,
      title,
      short,
      description,
      icon,
      ribbon,
      coin,
      current,
      target,
      unlocked,
      meta
    ) => ({
      type: 'Conquista',
      key,
      title,
      shortName: short,
      description,
      icon,
      ribbon,
      coin: unlocked ? coin : 'locked',
      current,
      target,
      unlocked,
      meta: unlocked ? meta : `Bloqueada · ${current}/${target}`,
    });

    const achievementsList = [
      achievement(
        'stars-25',
        'Colecionador 25 Estrelas',
        '25 Estrelas',
        'Liberada ao conquistar pelo menos 25 estrelas nos jogos.',
        'star',
        'gold',
        'gold',
        totalStars,
        25,
        totalStars >= 25,
        `${totalStars} estrelas conquistadas`
      ),
      achievement(
        'stars-35',
        'Colecionador 35 Estrelas',
        '35 Estrelas',
        'Liberada ao conquistar pelo menos 35 estrelas nos jogos.',
        'star',
        'purple',
        'gold',
        totalStars,
        35,
        totalStars >= 35,
        `${totalStars} estrelas conquistadas`
      ),
      achievement(
        'all-trails',
        'Todas as Trilhas',
        'Todas Trilhas',
        'Liberada ao concluir todas as trilhas educativas da jornada.',
        'route',
        'green',
        'gold',
        effectiveCompletedTrails,
        totalTrailsCount,
        totalTrailsCount > 0 && effectiveCompletedTrails >= totalTrailsCount,
        `${effectiveCompletedTrails} de ${totalTrailsCount} trilhas concluídas`
      ),
      achievement(
        'two-brilliant',
        'Duas Medalhas Brilhantes',
        'Brilhantes',
        'Liberada ao conquistar duas medalhas brilhantes nas trilhas.',
        'medal',
        'gold',
        'gold',
        brilliantCount,
        2,
        brilliantCount >= 2,
        `${brilliantCount} medalha(s) brilhante(s)`
      ),
      achievement(
        'certificate',
        'Certificado Final',
        'Certificado',
        'Liberada quando existe certificado emitido no banco de dados.',
        'file-signature',
        'blue',
        'silver',
        certificatesCount,
        1,
        certificatesCount > 0,
        certificatesCount > 0 ? 'Certificado emitido' : 'Nenhum certificado emitido'
      ),
      achievement(
        'legend',
        `Lenda Fiscal ${possibleStars} Estrelas`,
        'Lenda Fiscal',
        'Liberada ao conquistar todas as estrelas disponíveis nas fases cadastradas.',
        'crown',
        'gold',
        'gold',
        totalStars,
        possibleStars,
        possibleStars > 0 && totalStars >= possibleStars,
        `${totalStars} de ${possibleStars} estrelas`
      ),
    ];

    const allMedals = [...trailMedals, ...achievementsList];
    const unlockedMedalsCount = allMedals.filter((m) => m.unlocked).length;

    return {
      medals: allMedals,
      dashboard: {
        stars: totalStars,
        possible: possibleStars,
        completed: effectiveCompletedTrails,
        trails: totalTrailsCount,
        unlocked: unlockedMedalsCount,
        certificates: certificatesCount,
      },
    };
  }, [rawGameRows, certData, userProgressData, trailProgressData]);

  const isCertificateUnlocked = dashboard.completed >= REQUIRED_TRAILS;
  const missingTrails = Math.max(0, REQUIRED_TRAILS - dashboard.completed);
  const progressPercent = Math.min(
    100,
    Math.round((dashboard.completed / REQUIRED_TRAILS) * 100)
  );

  const participantDisplayName = user?.displayName || 'Pedro Henrique Vieira Cardoso';

  const formattedDate = useMemo(() => {
    const d = new Date();
    const formattedStr = d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
    return `Minas Gerais, ${formattedStr}.`;
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
    <main className="content-fade-in w-full max-w-full px-3 py-4 sm:px-5 lg:px-8 lg:py-8 font-body text-[#233324]">
      {/* Back to Home Navigation Button */}
      <div className="back-home-row mx-auto mb-4 flex w-full max-w-[1220px] justify-start">
        <Link
          to={ROUTES.HOME}
          aria-label="Voltar para a página inicial"
          className="back-home-btn inline-flex items-center justify-center gap-2 rounded-full border-2 border-[#8b6914] bg-[linear-gradient(135deg,#fffaf0,#f5e6c0)] px-4 py-2 text-xs font-black text-[#5d2b0a] no-underline shadow-md transition hover:-translate-y-0.5 hover:shadow-lg cursor-pointer"
        >
          <Icon icon="fa6-solid:arrow-left" />
          <span>Voltar para início</span>
        </Link>
      </div>

      <div className="app-shell mx-auto flex w-full max-w-[1220px] flex-col gap-5">
        {/* Top Page Stack: Hero Banner + Separate Progress Panel */}
        <aside className="top-page-stack flex flex-col items-center gap-4 w-full max-w-[1220px] mx-auto">
          {/* Clean Modern Hero Banner */}
          <div className="hero-banner-wrap flex w-full justify-center">
            <section className="hero-banner relative w-full max-w-[720px] rounded-[28px] border border-[rgba(139,105,20,0.3)] bg-[linear-gradient(135deg,#fffdfa_0%,#fef7e6_50%,#f9ecce_100%)] p-6 text-center shadow-[0_12px_32px_rgba(45,106,79,0.12)]">
              <h1 className="mt-1 font-display text-4xl sm:text-5xl font-black leading-none text-[#2d6a4f]">
                Cidadão Fiscal <span className="text-[#c0272d]">Nota A!</span>
              </h1>

              <p className="mx-auto mt-3 max-w-md text-sm font-extrabold leading-snug text-[#6b3a1f]">
                Gere seu certificado oficial e acompanhe sua estante de medalhas conquistadas ao longo da jornada.
              </p>
            </section>
          </div>

          {/* Separated Progress Panel */}
          <section
            aria-labelledby="progressTitle"
            className="progress-panel w-full max-w-[920px] rounded-[24px] border-2 border-[rgba(139,94,60,.45)] bg-[linear-gradient(135deg,rgba(255,255,255,.94),rgba(253,246,227,.92))] p-4 sm:p-5 shadow-[0_12px_30px_rgba(49,61,37,.16)]"
          >
            <div className="progress-panel-head flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="progress-panel-title flex items-center gap-3">
                <span aria-hidden="true" className="progress-icon grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-[#f5a800] to-[#ea580c] text-white text-lg shadow-md">
                  <Icon icon="fa6-solid:compass" />
                </span>
                <div>
                  <h2 id="progressTitle" className="font-display text-xl font-black text-[#8f1e23]">
                    Seu progresso
                  </h2>
                  <p className="progress-copy text-xs font-bold text-[#6b3a1f]">
                    {isCertificateUnlocked
                      ? 'Certificado liberado! Você já pode emitir o PDF.'
                      : `Faltam ${missingTrails} trilha${missingTrails !== 1 ? 's' : ''} para liberar o certificado.`}
                  </p>
                </div>
              </div>

              <div aria-label="Indicadores de progresso" className="progress-metrics flex flex-wrap gap-2">
                <span className="progress-chip flex items-baseline gap-1 rounded-full border border-[rgba(139,105,20,.25)] bg-white/80 px-3 py-1.5 text-[0.68rem] font-black uppercase text-[#6b3a1f]">
                  <strong className="font-display text-base text-[#2d6a4f]">{dashboard.stars}</strong> estrelas
                </span>
                <span className="progress-chip flex items-baseline gap-1 rounded-full border border-[rgba(139,105,20,.25)] bg-white/80 px-3 py-1.5 text-[0.68rem] font-black uppercase text-[#6b3a1f]">
                  <strong className="font-display text-base text-[#2d6a4f]">{dashboard.completed}</strong> trilhas
                </span>
                <span className="progress-chip flex items-baseline gap-1 rounded-full border border-[rgba(139,105,20,.25)] bg-white/80 px-3 py-1.5 text-[0.68rem] font-black uppercase text-[#6b3a1f]">
                  <strong className="font-display text-base text-[#2d6a4f]">{dashboard.unlocked}</strong> conquistas
                </span>
              </div>
            </div>

            <div
              role="progressbar"
              aria-label="Progresso para liberar o certificado"
              aria-valuemin={0}
              aria-valuemax={REQUIRED_TRAILS}
              aria-valuenow={dashboard.completed}
              aria-valuetext={`${dashboard.completed} de ${REQUIRED_TRAILS} trilhas concluídas`}
              className="progress-track mt-3.5 h-2.5 w-full overflow-hidden rounded-full bg-[#eadfca] shadow-inner"
            >
              <div
                className="progress-fill h-full rounded-full bg-gradient-to-r from-[#2d6a4f] via-[#10b981] to-[#f5a800] transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </section>
        </aside>

        <section className="flex w-full flex-col gap-5">
          <CertificatePreview
            participantName={participantDisplayName}
            formattedDate={formattedDate}
            isLocked={!isCertificateUnlocked}
            missingTrailsCount={missingTrails}
            completedTrailsCount={dashboard.completed}
            requiredTrailsCount={REQUIRED_TRAILS}
          />

          <BadgeList
            medals={medals}
            dashboard={dashboard}
            onSelectMedal={setSelectedMedal}
          />
        </section>
      </div>

      <BadgeModal
        medal={selectedMedal}
        onClose={() => setSelectedMedal(null)}
      />
    </main>
  );
}
