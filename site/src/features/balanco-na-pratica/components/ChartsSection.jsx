import { Icon } from '@iconify/react';
import ResumoCards from './ResumoCards.jsx';
import RegioesChart from './RegioesChart.jsx';
import OdsChart from './OdsChart.jsx';
import FuncoesChart from './FuncoesChart.jsx';
import UoTreemap from './UoTreemap.jsx';

const EMPTY_ARRAY = [];

function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-red-200 bg-red-50 px-6 py-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-2xl text-red-500">
        <Icon icon="fa6-solid:triangle-exclamation" />
      </div>
      <div>
        <p className="font-black text-red-800">Não foi possível carregar os dados</p>
        <p className="mt-0.5 text-sm font-bold text-red-600">{message}</p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="flex cursor-pointer items-center gap-2 rounded-full bg-red-600 px-5 py-2 text-sm font-black text-white transition-all hover:bg-red-700 active:scale-95"
      >
        <Icon icon="fa6-solid:rotate-right" />
        Tentar novamente
      </button>
    </div>
  );
}

function SectionCard({ id, icon, title, subtitle, children }) {
  return (
    <section
      id={id}
      className="mb-6 min-w-0 max-w-full overflow-hidden rounded-2xl border-2 border-gray-200 bg-white p-3.5 shadow-sm sm:mb-8 sm:rounded-3xl sm:p-6 md:p-7"
    >
      <div className="mb-3 flex items-start gap-3 border-b border-gray-100 pb-3 sm:items-center">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-base text-teal-700 sm:h-10 sm:w-10 sm:text-lg"
          aria-hidden="true"
        >
          <Icon icon={icon} />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="m-0 text-base font-black text-gray-900 sm:text-lg">{title}</h2>
          <p className="m-0 mt-0.5 text-xs font-bold leading-relaxed text-gray-500">{subtitle}</p>
        </div>
      </div>
      <div className="w-full min-w-0 overflow-hidden">{children}</div>
    </section>
  );
}

export default function ChartsSection({
  resumo,
  regioes = EMPTY_ARRAY,
  municipios = EMPTY_ARRAY,
  populacao = EMPTY_ARRAY,
  ods = EMPTY_ARRAY,
  funcoes = EMPTY_ARRAY,
  uos = EMPTY_ARRAY,
  error,
  onRetry,
}) {
  if (error) {
    return (
      <div className="mb-8 rounded-3xl border-2 border-gray-200 bg-white p-6 shadow-sm">
        <ErrorState message={error} onRetry={onRetry} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <ResumoCards resumo={resumo} />

      <SectionCard
        id="secao-regioes"
        icon="fa6-solid:map-location-dot"
        title="Execução Orçamentária por Região"
        subtitle="Mapa da execução orçamentária por Região Geográfica Intermediária de Minas Gerais"
      >
        <RegioesChart
          regioes={regioes}
          municipios={municipios}
          populacao={populacao}
        />
      </SectionCard>

      <SectionCard
        id="secao-ods"
        icon="fa6-solid:seedling"
        title="Alinhamento com os ODS (ONU)"
        subtitle="Distribuição da execução orçamentária vinculada aos Objetivos de Desenvolvimento Sustentável"
      >
        <OdsChart ods={ods} />
      </SectionCard>

      <SectionCard
        id="secao-funcoes"
        icon="fa6-solid:chart-simple"
        title="Execução por Função Orçamentária"
        subtitle="Desempenho financeiro por área de atuação, comparando valores programados e executados"
      >
        <FuncoesChart funcoes={funcoes} />
      </SectionCard>

      <SectionCard
        id="secao-uos"
        icon="fa6-solid:building-columns"
        title="Execução por Unidade Orçamentária (UO)"
        subtitle="Distribuição dos recursos aplicados por órgãos e secretarias do Estado"
      >
        <UoTreemap uos={uos} />
      </SectionCard>
    </div>
  );
}
