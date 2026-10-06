import { useEffect, useMemo, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { Icon } from '@iconify/react';
import * as echarts from 'echarts/core';
import { MapChart } from 'echarts/charts';
import {
  TooltipComponent,
  VisualMapComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { formatCurrencyCompact, calcPercent } from '../utils/formatters.js';

echarts.use([
  MapChart,
  TooltipComponent,
  VisualMapComponent,
  CanvasRenderer,
]);

import { loadAndRegisterRegionsMap, MAP_NAME } from '../services/mapService.js';

import { useWindowWidth } from '../hooks/useWindowWidth.js';

const COLORS = ['#ecfdf5', '#a7f3d0', '#5eead4', '#14b8a6', '#0f766e'];
const EMPTY_ARRAY = [];
const numberFormatter = new Intl.NumberFormat('pt-BR');
const perCapitaFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 2,
});
const compactCurrencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  notation: 'compact',
  maximumFractionDigits: 1,
});

function numeric(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  const parsed = Number(String(value ?? 0).replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalize(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/regiao geografica intermediaria de|regiao intermediaria de/gi, '')
    .trim()
    .toLowerCase();
}

function shortRegionName(value) {
  return String(value || 'Não informado')
    .replace(/Região (Geográfica )?Intermediária de /i, '')
    .trim();
}

/**
 * Mapa da execução orçamentária por Região Geográfica Intermediária de MG.
 */
export default function RegioesChart({
  regioes = EMPTY_ARRAY,
  municipios = EMPTY_ARRAY,
  populacao = EMPTY_ARRAY,
}) {
  const windowWidth = useWindowWidth();
  const isMobile = windowWidth < 640;

  const [mode, setMode] = useState('map');
  const [mapState, setMapState] = useState(() => ({
    status: echarts.getMap(MAP_NAME) ? 'ready' : 'loading',
    error: null,
  }));

  useEffect(() => {
    if (echarts.getMap(MAP_NAME)) {
      setMapState({ status: 'ready', error: null });
      return;
    }

    let isMounted = true;
    loadAndRegisterRegionsMap(municipios)
      .then(() => {
        if (isMounted) {
          setMapState({ status: 'ready', error: null });
        }
      })
      .catch((error) => {
        if (isMounted) {
          setMapState({
            status: 'error',
            error: error?.message || 'Não foi possível montar o mapa das regiões.',
          });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [municipios]);

  const populationByRegion = useMemo(() => {
    const populationByMunicipality = new Map(
      populacao.map((item) => [
        String(item?.municipioIbgeCod ?? '').replace(/\D/g, ''),
        numeric(item?.populacao),
      ]),
    );
    const totals = new Map();
    municipios.forEach((item) => {
      const regionKey = normalize(item?.regiao);
      const municipalityKey = String(item?.municipioIbgeCod ?? '').replace(/\D/g, '');
      totals.set(
        regionKey,
        (totals.get(regionKey) || 0) + (populationByMunicipality.get(municipalityKey) || 0),
      );
    });
    return totals;
  }, [municipios, populacao]);

  const statePopulation = useMemo(
    () => populacao.reduce((sum, item) => sum + numeric(item?.populacao), 0),
    [populacao],
  );

  const mapData = useMemo(() => {
    return regioes
      .filter((item) => !normalize(item?.regiao).includes('estadual'))
      .map((item) => {
        const population = populationByRegion.get(normalize(item?.regiao)) || 0;
        const executed = numeric(item?.valorExecutado);
        return {
          name: String(item?.regiao || 'Não informado').trim(),
          value: mode === 'percapita' ? (population ? executed / population : 0) : executed,
          valorExecutado: executed,
          valorProgramado: numeric(item?.valorProgramado),
          populacao: population,
          valorPerCapita: population ? executed / population : 0,
        };
      });
  }, [regioes, populationByRegion, mode]);

  const tableRows = useMemo(
    () =>
      regioes
        .filter((item) => !normalize(item?.regiao).includes('estadual'))
        .map((item) => {
          const population = populationByRegion.get(normalize(item?.regiao)) || 0;
          const executed = numeric(item?.valorExecutado);
          return {
            ...item,
            valorExecutado: executed,
            valorProgramado: numeric(item?.valorProgramado),
            populacao: population,
            valorPerCapita: population ? executed / population : 0,
          };
        })
        .sort((a, b) => b.valorExecutado - a.valorExecutado),
    [regioes, populationByRegion],
  );

  const stateRow = useMemo(
    () => regioes.find((item) => normalize(item?.regiao).includes('estadual')),
    [regioes],
  );
  const stateExecuted = numeric(stateRow?.valorExecutado);
  const stateProgrammed = numeric(stateRow?.valorProgramado);
  const totalRegionalExecuted = useMemo(
    () => tableRows.reduce(
      (total, region) => total + numeric(region.valorExecutado),
      0,
    ),
    [tableRows],
  );
  const totalRegionalProgrammed = useMemo(
    () => tableRows.reduce(
      (total, region) => total + numeric(region.valorProgramado),
      0,
    ),
    [tableRows],
  );
  const totalRegionalPopulation = useMemo(
    () => tableRows.reduce(
      (total, region) => total + numeric(region.populacao),
      0,
    ),
    [tableRows],
  );
  const totalRegionalPerCapita = totalRegionalPopulation
    ? totalRegionalExecuted / totalRegionalPopulation
    : 0;
  const totalExecutedIncludingState = totalRegionalExecuted + stateExecuted;
  const totalProgrammedIncludingState = totalRegionalProgrammed + stateProgrammed;
  const stateShareOfTotal = totalExecutedIncludingState
    ? (stateExecuted / totalExecutedIncludingState) * 100
    : null;
  const mapLegendPieces = useMemo(() => {
    if (!mapData.length) return [];
    const positiveValues = mapData
      .map((item) => item.value)
      .filter((value) => value > 0)
      .sort((a, b) => a - b);
    const maxValue = Math.max(...positiveValues, 1);
    const limits = [0.2, 0.4, 0.6, 0.8].map((ratio) => {
      const index = Math.min(
        positiveValues.length - 1,
        Math.max(0, Math.ceil(positiveValues.length * ratio) - 1),
      );
      return positiveValues[index] || maxValue * ratio;
    });

    return [
      { min: 0, max: limits[0], label: `Até ${compactCurrencyFormatter.format(limits[0])}`, color: COLORS[0] },
      { min: limits[0], max: limits[1], label: `Até ${compactCurrencyFormatter.format(limits[1])}`, color: COLORS[1] },
      { min: limits[1], max: limits[2], label: `Até ${compactCurrencyFormatter.format(limits[2])}`, color: COLORS[2] },
      { min: limits[2], max: limits[3], label: `Até ${compactCurrencyFormatter.format(limits[3])}`, color: COLORS[3] },
      { min: limits[3], label: `Acima de ${compactCurrencyFormatter.format(limits[3])}`, color: COLORS[4] },
    ];
  }, [mapData]);

  const option = useMemo(() => {
    if (mapState.status !== 'ready' || !mapData.length) return {};

    const valuesByRegion = new Map(
      mapData.map((item) => [normalize(item.name), item]),
    );

    const registeredMap = echarts.getMap(MAP_NAME);
    const regionNames =
      registeredMap?.geoJSON?.features?.map(
        (feature) => feature.properties?.name || feature.properties?.regiao,
      ) || [];

    const data = regionNames.map((name) => {
      const row = valuesByRegion.get(normalize(name));
      return {
        name,
        value: row?.value || 0,
        valorExecutado: row?.valorExecutado || 0,
        valorProgramado: row?.valorProgramado || 0,
        populacao: row?.populacao || 0,
        valorPerCapita: row?.valorPerCapita || 0,
      };
    });

    return {
      backgroundColor: 'transparent',
      animationDuration: 550,
      tooltip: {
        trigger: 'item',
        backgroundColor: '#1e293b',
        borderColor: '#334155',
        textStyle: { color: '#f8fafc', fontSize: isMobile ? 11 : 12 },
        extraCssText: 'border-radius:10px;padding:8px 12px;z-index:99',
        formatter({ name, data: item }) {
          const executed = numeric(item?.valorExecutado);
          const programmed = numeric(item?.valorProgramado);
          const percent = calcPercent(executed, programmed);

          return `
            <div style="font-weight:800;margin-bottom:4px;font-size:${isMobile ? '12px' : '13px'}">${shortRegionName(name)}</div>
            <div style="font-size:${isMobile ? '11px' : '12px'}">Executado: <b>${formatCurrencyCompact(executed)}</b></div>
            <div style="font-size:${isMobile ? '11px' : '12px'}">Programado: <b>${formatCurrencyCompact(programmed)}</b></div>
            <div style="font-size:${isMobile ? '11px' : '12px'}">População: <b>${numberFormatter.format(item?.populacao || 0)}</b></div>
            <div style="font-size:${isMobile ? '11px' : '12px'}">Executado per capita: <b>${perCapitaFormatter.format(item?.valorPerCapita || 0)}</b></div>
            ${percent != null ? `<div style="font-size:${isMobile ? '11px' : '12px'}">Execução: <b>${percent}%</b></div>` : ''}
          `;
        },
      },
      visualMap: {
        show: !isMobile,
        type: 'piecewise',
        seriesIndex: 0,
        pieces: mapLegendPieces,
        left: 'center',
        bottom: 10,
        orient: 'horizontal',
        itemWidth: 18,
        itemHeight: 10,
        itemGap: 8,
        textStyle: { color: '#4b5563', fontSize: 9, fontWeight: 'bold' },
        borderColor: '#9ca3af',
        borderWidth: 1,
        backgroundColor: 'rgba(255,255,255,.94)',
        padding: [8, 10],
      },
      series: [
        {
          name: 'Execução por região',
          type: 'map',
          map: MAP_NAME,
          roam: true,
          scaleLimit: { min: 1, max: 6 },
          selectedMode: false,
          aspectScale: 0.88,
          boundingCoords: [[-51.2, -14.1], [-39.7, -23.0]],
          layoutCenter: ['50%', isMobile ? '45%' : '47%'],
          layoutSize: isMobile ? '92%' : '88%',
          label: {
            show: true,
            color: '#134e4a',
            fontSize: isMobile ? 8 : 10,
            fontWeight: 'bold',
            lineHeight: isMobile ? 10 : 12,
            textBorderColor: 'rgba(255,255,255,.95)',
            textBorderWidth: 3,
            formatter: ({ name }) => {
              const label = shortRegionName(name);
              const words = label.split(/\s+/);
              if (words.length < 3) return label;
              const middle = Math.ceil(words.length / 2);
              return `${words.slice(0, middle).join(' ')}\n${words.slice(middle).join(' ')}`;
            },
          },
          itemStyle: {
            borderColor: '#64748b',
            borderWidth: 0.75,
            areaColor: '#f0fdfa',
          },
          emphasis: {
            label: { color: '#134e4a' },
            itemStyle: {
              areaColor: '#2563eb',
              borderColor: '#1e3a8a',
              borderWidth: 1,
            },
          },
          data,
        },
      ],
    };
  }, [mapData, mapState.status, mapLegendPieces, isMobile]);

  if (!regioes.length) {
    return (
      <p className="py-12 text-center text-sm font-bold text-gray-500">
        Nenhum dado de região encontrado.
      </p>
    );
  }

  if (mapState.status === 'loading') {
    return (
      <div className="grid h-[380px] sm:h-[480px] place-items-center rounded-xl border border-gray-300 bg-gray-50">
        <p className="text-sm font-bold text-gray-600">Montando o mapa das regiões...</p>
      </div>
    );
  }

  if (mapState.status === 'error') {
    return (
      <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm font-bold text-red-800" role="alert">
        {mapState.error}
      </div>
    );
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-xs font-black uppercase tracking-wider text-gray-500">
          Visualização:
        </span>
        {[
          { id: 'map', label: 'Mapa', icon: 'fa6-solid:map' },
          { id: 'percapita', label: 'Per capita', icon: 'fa6-solid:people-group' },
          { id: 'table', label: 'Tabela', icon: 'fa6-solid:table-list' },
        ].map((optionItem) => {
          const active = mode === optionItem.id;
          return (
            <button
              key={optionItem.id}
              type="button"
              onClick={() => setMode(optionItem.id)}
              aria-pressed={active}
              className={`flex cursor-pointer items-center gap-1.5 rounded-full border-2 px-3 py-1 text-xs font-black transition-all ${
                active
                  ? 'border-teal-700 bg-teal-700 text-white shadow'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-teal-300 hover:text-teal-700'
              }`}
            >
              <Icon icon={optionItem.icon} aria-hidden="true" />
              {optionItem.label}
            </button>
          );
        })}
      </div>

      {mode !== 'table' ? (
        <div>
          <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
            {mode === 'map' && (
              <div className="mb-2 flex items-center justify-between rounded-lg border border-teal-700/30 bg-white px-3 py-2 shadow-xs sm:absolute sm:right-3 sm:top-3 sm:z-20 sm:mb-0 sm:block sm:border-teal-700/40 sm:bg-white/95 sm:shadow-sm">
                <span className="block text-[10px] font-black uppercase tracking-wider text-gray-500">
                  Execução estadual
                </span>
                <strong className="block text-xs font-black text-teal-800 sm:mt-0.5 sm:text-sm">
                  {formatCurrencyCompact(stateExecuted)}
                </strong>
              </div>
            )}
            <ReactECharts
              option={option}
              notMerge
              lazyUpdate
              style={{ height: isMobile ? '380px' : '500px', width: '100%' }}
              opts={{ renderer: 'canvas' }}
              aria-label="Mapa da execução orçamentária por Regiões Geográficas Intermediárias de Minas Gerais"
            />
          </div>

          {/* Legenda responsiva em HTML no mobile para leitura nítida sem sobreposição no mapa */}
          {isMobile && mapLegendPieces.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white p-2.5 shadow-2xs">
              <span className="w-full text-center text-[10px] font-black uppercase tracking-wider text-slate-500">
                Legenda de Execução:
              </span>
              {mapLegendPieces.map((piece, i) => (
                <div key={i} className="flex items-center gap-1.5 px-1 py-0.5">
                  <span
                    className="h-3 w-3 shrink-0 rounded-xs border border-slate-300"
                    style={{ backgroundColor: piece.color }}
                    aria-hidden="true"
                  />
                  <span className="whitespace-nowrap text-[10px] font-bold text-slate-700">
                    {piece.label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="w-full max-w-full min-w-0 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-3 py-2 text-[10px] font-bold text-slate-600 sm:hidden">
            <span className="flex items-center gap-1.5">
              <Icon icon="fa6-solid:hand-pointer" className="animate-pulse text-teal-600" />
              <span>Deslize a tabela para os lados para ver os dados</span>
            </span>
          </div>
          <div
            className="block w-full max-w-full min-w-0 overflow-x-auto scrollbar-thin scrollbar-thumb-teal-600 scrollbar-track-slate-100"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            <table className="w-full min-w-[580px] border-collapse text-left text-[11px] sm:text-xs">
              <caption className="sr-only">Execução orçamentária por região</caption>
              <thead className="bg-gray-100 text-gray-800">
                <tr>
                  <th scope="col" className="px-3 py-2 font-black sm:py-2.5">Região</th>
                  <th scope="col" className="px-3 py-2 text-right font-black sm:py-2.5">Programado</th>
                  <th scope="col" className="px-3 py-2 text-right font-black sm:py-2.5">Executado</th>
                  <th scope="col" className="px-3 py-2 text-right font-black sm:py-2.5">População</th>
                  <th scope="col" className="px-3 py-2 text-right font-black sm:py-2.5">Per capita</th>
                  <th scope="col" className="px-3 py-2 text-right font-black sm:py-2.5">% Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr className="transition-colors hover:bg-teal-50">
                  <th scope="row" className="whitespace-nowrap px-3 py-2 font-bold text-gray-800 sm:py-2.5">
                    Execução estadual
                  </th>
                  <td className="whitespace-nowrap px-3 py-2 text-right font-bold text-gray-600 sm:py-2.5">
                    {formatCurrencyCompact(stateProgrammed)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-right font-black text-teal-800 sm:py-2.5">
                    {formatCurrencyCompact(stateExecuted)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-right font-bold text-gray-700 sm:py-2.5">
                    –
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-right font-black text-teal-800 sm:py-2.5">
                    –
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-right font-bold text-gray-700 sm:py-2.5">
                    {stateShareOfTotal == null
                      ? '–'
                      : `${stateShareOfTotal.toFixed(2).replace('.', ',')}%`}
                  </td>
                </tr>
                {tableRows.map((region) => {
                  return (
                    <tr key={region.regiao} className="transition-colors hover:bg-teal-50">
                      <th scope="row" className="whitespace-nowrap px-3 py-2 font-bold text-gray-800 sm:py-2.5">
                        {shortRegionName(region.regiao)}
                      </th>
                      <td className="whitespace-nowrap px-3 py-2 text-right font-bold text-gray-600 sm:py-2.5">
                        {formatCurrencyCompact(region.valorProgramado)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-right font-black text-teal-800 sm:py-2.5">
                        {formatCurrencyCompact(region.valorExecutado)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-right font-bold text-gray-700 sm:py-2.5">
                        {numberFormatter.format(region.populacao)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-right font-black text-teal-800 sm:py-2.5">
                        {perCapitaFormatter.format(region.valorPerCapita)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-right font-bold text-gray-700 sm:py-2.5">
                        {totalExecutedIncludingState > 0
                          ? `${((region.valorExecutado / totalExecutedIncludingState) * 100).toFixed(2).replace('.', ',')}%`
                          : '–'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="border-t-2 border-teal-700 bg-teal-100/80">
                <tr>
                  <th scope="row" className="whitespace-nowrap px-3 py-2 font-black text-teal-950 sm:py-2.5">Total</th>
                  <td className="whitespace-nowrap px-3 py-2 text-right font-black text-gray-700 sm:py-2.5">
                    {formatCurrencyCompact(totalProgrammedIncludingState)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-right font-black text-teal-900 sm:py-2.5">
                    {formatCurrencyCompact(totalExecutedIncludingState)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-right font-black text-gray-700 sm:py-2.5">
                    {numberFormatter.format(totalRegionalPopulation)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-right font-black text-teal-900 sm:py-2.5">
                    {perCapitaFormatter.format(totalRegionalPerCapita)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-right font-black text-teal-900 sm:py-2.5">
                    {totalExecutedIncludingState > 0 ? '100%' : '–'}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
