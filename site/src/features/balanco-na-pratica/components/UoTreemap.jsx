import { useState, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { Icon } from '@iconify/react';
import { formatCurrencyCompact } from '../utils/formatters.js';
import { useWindowWidth } from '../hooks/useWindowWidth.js';

// Paleta institucional (idêntica ao legado)
const TREEMAP_COLORS = ['#064b69', '#2d6a4f', '#8f1e23', '#f3833a', '#4c8da8', '#7b5b3a'];

/**
 * Treemap / Barras de Execução por Unidade Orçamentária (UO).
 * Permite alternar entre Treemap (visão proporcional) e Barras (ranking).
 */
export default function UoTreemap({ uos }) {
  const windowWidth = useWindowWidth();
  const isMobile = windowWidth < 640;

  const [mode, setMode] = useState('treemap'); // 'treemap' | 'bars'

  const filtered = useMemo(
    () => (uos || []).filter((x) => Number(x.valorExecutado) > 0),
    [uos]
  );

  const treemapOption = useMemo(() => ({
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      formatter: ({ name, value }) => `
        <div style="font-weight:800;margin-bottom:4px;font-size:${isMobile ? '12px' : '13px'}">${name}</div>
        <div style="font-size:${isMobile ? '11px' : '12px'}">💰 <b>${formatCurrencyCompact(value)}</b></div>
      `,
      backgroundColor: '#1e293b',
      borderColor: '#334155',
      textStyle: { color: '#f8fafc', fontSize: isMobile ? 11 : 12 },
      extraCssText: 'border-radius:10px;padding:8px 12px;z-index:99',
    },
    series: [{
      name: 'Valor executado',
      type: 'treemap',
      roam: false,
      nodeClick: false,
      left: 0, right: 0, top: 0, bottom: 0,
      breadcrumb: { show: false },
      visibleMin: 1,
      label: {
        show: true,
        formatter: (p) => `${p.name}\n${formatCurrencyCompact(p.value)}`,
        fontSize: isMobile ? 10 : 11,
        fontWeight: 'bold',
        lineHeight: isMobile ? 13 : 15,
        color: '#fff',
      },
      upperLabel: { show: false },
      itemStyle: { borderColor: '#fff', borderWidth: 1, gapWidth: 1 },
      levels: [{
        itemStyle: { borderWidth: 1, gapWidth: 1 },
        color: TREEMAP_COLORS,
        colorMappingBy: 'index',
      }],
      data: filtered.map((x) => ({ name: x.uo || 'Não informado', value: Number(x.valorExecutado) })),
    }],
  }), [filtered, isMobile]);

  const barsOption = useMemo(() => {
    const sorted = [...filtered]
      .sort((a, b) => b.valorExecutado - a.valorExecutado)
      .slice(0, 15)
      .reverse();
    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params) => `
          <div style="font-weight:800;margin-bottom:4px;font-size:${isMobile ? '12px' : '13px'}">${params[0].name}</div>
          <div style="font-size:${isMobile ? '11px' : '12px'}">💰 <b>${formatCurrencyCompact(params[0].value)}</b></div>
        `,
        backgroundColor: '#1e293b',
        borderColor: '#334155',
        textStyle: { color: '#f8fafc', fontSize: isMobile ? 11 : 12 },
        extraCssText: 'border-radius:10px;padding:8px 12px;z-index:99',
      },
      grid: { left: '1%', right: isMobile ? '18%' : '15%', bottom: '1%', top: 10, containLabel: true },
      xAxis: {
        type: 'value',
        axisLabel: { formatter: (v) => formatCurrencyCompact(v), fontSize: isMobile ? 9 : 10, color: '#6b7280' },
        splitLine: { lineStyle: { color: '#e5e7eb', type: 'dashed' } },
      },
      yAxis: {
        type: 'category',
        data: sorted.map((x) => x.uo || 'Não informado'),
        axisLabel: { fontSize: isMobile ? 9 : 10, color: '#374151', fontWeight: 'bold', width: isMobile ? 110 : 160, overflow: 'truncate', lineHeight: isMobile ? 11 : 13 },
        axisTick: { show: false },
        axisLine: { lineStyle: { color: '#e5e7eb' } },
      },
      series: [{
        name: 'Executado',
        type: 'bar',
        barWidth: isMobile ? 10 : 13,
        itemStyle: { color: '#2d6a4f', borderRadius: [0, 7, 7, 0] },
        label: {
          show: true,
          position: 'right',
          formatter: ({ value }) => formatCurrencyCompact(value),
          fontSize: isMobile ? 8 : 9,
          color: '#2d6a4f',
          fontWeight: 'bold',
        },
        data: sorted.map((x) => Number(x.valorExecutado)),
      }],
    };
  }, [filtered, isMobile]);

  if (!filtered.length) return (
    <p className="py-12 text-center text-sm font-bold text-gray-500">Nenhum dado de UO encontrado.</p>
  );

  const chartHeight = mode === 'treemap'
    ? (isMobile ? '360px' : '480px')
    : (isMobile ? '400px' : '520px');

  return (
    <div className="w-full max-w-full overflow-hidden">
      {/* Seletor de modo */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-xs font-black text-gray-500 uppercase tracking-wider">Visualização:</span>
        {[
          { id: 'treemap', label: 'Treemap', icon: 'fa6-solid:chart-treemap' },
          { id: 'bars', label: 'Barras', icon: 'fa6-solid:chart-bar' },
        ].map((opt) => {
          const active = mode === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setMode(opt.id)}
              aria-pressed={active}
              className={`flex items-center gap-1.5 rounded-full border-2 px-3 py-1 text-xs font-black transition-all cursor-pointer
                ${active
                  ? 'border-teal-700 bg-teal-700 text-white shadow'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-teal-300 hover:text-teal-700'
                }`}
            >
              <Icon icon={opt.icon} aria-hidden="true" />
              {opt.label}
            </button>
          );
        })}
      </div>

      <ReactECharts
        key={mode}
        option={mode === 'treemap' ? treemapOption : barsOption}
        style={{ height: chartHeight, width: '100%' }}
        opts={{ renderer: 'canvas' }}
        aria-label={`Gráfico ${mode === 'treemap' ? 'treemap' : 'de barras'}: Execução por Unidade Orçamentária`}
      />
    </div>
  );
}

