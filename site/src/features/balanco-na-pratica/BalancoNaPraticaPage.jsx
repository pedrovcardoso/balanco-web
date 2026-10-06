import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { ROUTES } from '../../shared/constants/routes.js';
import { Loading } from '../../shared/components/loading/index.js';
import { useLoadingProgress } from '../../shared/hooks/useLoadingProgress.js';
import AchievementCard from '../../shared/components/ui/AchievementCard.jsx';
import { useTrailProgress } from './hooks/useTrailProgress.js';
import ChartsSection from './components/ChartsSection.jsx';
import {
  getResumoBalanco,
  getExecucaoRegioes,
  getMunicipios,
  getPopulacao,
  getExecucaoOds,
  getFuncoes,
  getUos,
} from './services/dadosService.js';
import { loadAndRegisterRegionsMap } from './services/mapService.js';

const LOADING_MESSAGES = [
  'Consultando dados do SIGPLAN...',
  'Calculando execução orçamentária por região...',
  'Relacionando municípios e regiões...',
  'Organizando dados de Funções e Unidades Orçamentárias...',
  'Alinhando indicadores com as ODS...',
  'Preparando o painel de gráficos interativos...',
];

const INITIAL_DATA = {
  resumo: null,
  regioes: [],
  municipios: [],
  populacao: [],
  ods: [],
  funcoes: [],
  uos: [],
};

export default function BalancoNaPraticaPage() {
  const [dados, setDados] = useState(INITIAL_DATA);
  const [error, setError] = useState(null);
  const [fadeState, setFadeState] = useState('loading');
  const { claimed, claiming, claimMedal } = useTrailProgress();

  const {
    progress: loadingProgress,
    message: loadingMessage,
    status: loadingStatus,
    setProgress: setLoadingProgress,
  } = useLoadingProgress({
    initialProgress: 10,
    messages: LOADING_MESSAGES,
  });

  async function carregarDados() {
    setFadeState('loading');
    setError(null);
    setLoadingProgress(10, LOADING_MESSAGES[0]);

    try {
      setLoadingProgress(25, LOADING_MESSAGES[1]);

      // Usa Promise.allSettled para garantir que falhas/timeouts individuais em endpoints secundários não travem a página
      const results = await Promise.allSettled([
        getResumoBalanco(),
        getExecucaoRegioes(),
        getMunicipios(),
        getPopulacao(),
        getExecucaoOds(),
        getFuncoes(),
        getUos(),
      ]);

      const [resumoRes, regioesRes, municipiosRes, populacaoRes, odsRes, funcoesRes, uosRes] = results;

      const resumo = resumoRes.status === 'fulfilled' ? resumoRes.value : null;
      const regioes = regioesRes.status === 'fulfilled' ? regioesRes.value : [];
      const municipios = municipiosRes.status === 'fulfilled' ? municipiosRes.value : [];
      const populacao = populacaoRes.status === 'fulfilled' ? populacaoRes.value : [];
      const ods = odsRes.status === 'fulfilled' ? odsRes.value : [];
      const funcoes = funcoesRes.status === 'fulfilled' ? funcoesRes.value : [];
      const uos = uosRes.status === 'fulfilled' ? uosRes.value : [];

      setLoadingProgress(65, LOADING_MESSAGES[3]);

      try {
        await loadAndRegisterRegionsMap(municipios);
      } catch (mapErr) {
        console.warn('Não foi possível carregar as divisões do mapa:', mapErr);
      }

      setLoadingProgress(85, LOADING_MESSAGES[5]);
      setDados({ resumo, regioes, municipios, populacao, ods, funcoes, uos });
      setLoadingProgress(100, 'Dados carregados!');

      window.setTimeout(() => setFadeState('fading'), 200);
      window.setTimeout(() => setFadeState('ready'), 550);
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          err?.message ||
          'Erro ao carregar dados.',
      );
      setFadeState('ready');
    }
  }

  useEffect(() => {
    carregarDados();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <div className="content-fade-in mx-auto max-w-4xl min-w-0 w-full overflow-x-hidden px-3 sm:px-4 py-4 sm:py-6">
      <nav className="mb-3 flex items-center gap-2">
        <Link
          to={ROUTES.HOME}
          className="inline-flex items-center gap-2 rounded-full border-2 border-teal-800/30 bg-teal-50 px-3 py-1.5 text-xs font-black text-teal-950 shadow-xs no-underline transition-all hover:bg-teal-100 sm:px-3.5"
        >
          <Icon icon="fa6-solid:arrow-left" aria-hidden="true" />
          Voltar para início
        </Link>
      </nav>

      <header className="relative mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="absolute inset-y-0 left-0 w-1.5 bg-teal-600" />

        <div className="pointer-events-none absolute -right-12 -top-16 h-52 w-52 rounded-full bg-teal-100/70" />
        <div className="pointer-events-none absolute -bottom-20 right-24 h-40 w-40 rounded-full bg-blue-100/50" />

        <div className="relative flex items-center justify-between gap-6 px-4 py-5 sm:gap-8 sm:px-8 sm:py-8">
          <div className="max-w-2xl">
            <div className="mb-2 flex flex-wrap items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-teal-700">
              <Icon icon="fa6-solid:chart-pie" aria-hidden="true" />
              <span>Trilha 3</span>
              <span className="h-1 w-1 rounded-full bg-teal-400" />
              <span>Balanço na prática</span>
            </div>

            <h1 className="m-0 text-xl font-black tracking-tight text-slate-900 sm:text-2xl md:text-3xl">
              O Balanço na Prática
            </h1>

            <p className="m-0 mt-2 max-w-xl text-xs font-medium leading-5 text-slate-600 sm:mt-3 sm:text-sm sm:leading-6">
              Consulte dados reais da execução orçamentária de Minas Gerais por
              regiões de planejamento, áreas funcionais, Unidades Orçamentárias
              e Objetivos de Desenvolvimento Sustentável.
            </p>
          </div>

          <div
            className="hidden h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 sm:flex md:h-24 md:w-24 md:rounded-3xl"
            aria-hidden="true"
          >
            <Icon icon="fa6-solid:chart-column" className="text-3xl md:text-4xl" />
          </div>
        </div>
      </header>

      <ChartsSection
        resumo={dados.resumo}
        regioes={dados.regioes}
        municipios={dados.municipios}
        populacao={dados.populacao}
        ods={dados.ods}
        funcoes={dados.funcoes}
        uos={dados.uos}
        error={error}
        onRetry={carregarDados}
      />

      <AchievementCard
        id="achievementBalancoNaPratica"
        kicker="Trilha 3 Concluída"
        title="Balanço na Prática"
        description="Você explorou dados reais da execução orçamentária do estado de Minas Gerais!"
        medalIcon="fa6-solid:chart-pie"
        reachedEnd={true}
        claimed={claimed}
        loading={claiming}
        onClaim={claimMedal}
      />
    </div>
  );
}
