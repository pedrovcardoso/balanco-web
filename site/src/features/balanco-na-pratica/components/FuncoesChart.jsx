import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { formatCurrencyCompact, calcPercent } from '../utils/formatters.js';
import { useWindowWidth } from '../hooks/useWindowWidth.js';

/**
 * Bullet chart horizontal — Execução por Função Orçamentária.
 * Barra larga = Programado | barra estreita sobreposta = Executado (idêntico ao legado).
 */
export default function FuncoesChart({ funcoes }) {
  const windowWidth = useWindowWidth();
  const isMobile = windowWidth < 640;

  const option = useMemo(() => {
    if (!funcoes?.length) return {};

    // Ordena por executado decrescente e limita os top 15 mais relevantes
    const sorted = [...funcoes]
      .sort((a, b) => b.valorExecutado - a.valorExecutado)
      .slice(0, 15)
      .reverse(); // ECharts horizontal: inverte para mostrar maior no topo

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter(params) {
          const exec = params.find((p) => p.seriesName === 'Executado');
          const prog = params.find((p) => p.seriesName === 'Programado');
          const pct = calcPercent(exec?.value, prog?.value);
          return `
            <div style="font-weight:800;margin-bottom:4px;font-size:${isMobile ? '12px' : '13px'}">${exec?.name}</div>
            <div style="font-size:${isMobile ? '11px' : '12px'}">✅ Executado: <b>${formatCurrencyCompact(exec?.value)}</b></div>
            <div style="font-size:${isMobile ? '11px' : '12px'}">📋 Programado: <b>${formatCurrencyCompact(prog?.value)}</b></div>
            ${pct != null ? `<div style="font-size:${isMobile ? '11px' : '12px'}">📊 Execução: <b>${pct}%</b></div>` : ''}
          `;
        },
        backgroundColor: '#1e293b',
        borderColor: '#334155',
        textStyle: { color: '#f8fafc', fontSize: isMobile ? 11 : 12 },
        extraCssText: 'border-radius:10px;padding:8px 12px;z-index:99',
      },
      legend: {
        top: 0,
        right: 0,
        data: ['Programado', 'Executado'],
        textStyle: { fontSize: isMobile ? 10 : 11, fontWeight: 'bold', color: '#374151' },
        icon: 'roundRect',
        itemWidth: isMobile ? 10 : 12,
        itemHeight: isMobile ? 6 : 8,
      },
      grid: { left: '1%', right: isMobile ? '18%' : '15%', bottom: '1%', top: 32, containLabel: true },
      xAxis: {
        type: 'value',
        axisLabel: {
          formatter: (v) => formatCurrencyCompact(v),
          fontSize: isMobile ? 9 : 10,
          color: '#6b7280',
        },
        splitLine: { lineStyle: { color: '#e5e7eb', type: 'dashed' } },
      },
      yAxis: {
        type: 'category',
        data: sorted.map((x) => x.funcao),
        axisLabel: {
          fontSize: isMobile ? 9 : 10,
          color: '#374151',
          fontWeight: 'bold',
          width: isMobile ? 100 : 140,
          overflow: 'truncate',
          lineHeight: isMobile ? 12 : 14,
        },
        axisTick: { show: false },
        axisLine: { lineStyle: { color: '#e5e7eb' } },
      },
      series: [
        {
          name: 'Programado',
          type: 'bar',
          barWidth: isMobile ? 14 : 18,
          itemStyle: { color: '#9fb8ad', borderRadius: [0, 6, 6, 0] },
          data: sorted.map((x) => x.valorProgramado),
        },
        {
          name: 'Executado',
          type: 'bar',
          barWidth: isMobile ? 6 : 8,
          barGap: '-72%',
          itemStyle: { color: '#2d6a4f', borderRadius: [0, 6, 6, 0] },
          label: {
            show: true,
            position: 'right',
            formatter: ({ value }) => formatCurrencyCompact(value),
            fontSize: isMobile ? 8 : 9,
            color: '#2d6a4f',
            fontWeight: 'bold',
          },
          data: sorted.map((x) => x.valorExecutado),
        },
      ],
    };
  }, [funcoes, isMobile]);

  if (!funcoes?.length) return (
    <p className="py-12 text-center text-sm font-bold text-gray-500">Nenhum dado de função encontrado.</p>
  );

  return (
    <div className="w-full max-w-full overflow-hidden">
      <ReactECharts
        option={option}
        style={{ height: isMobile ? '380px' : '480px', width: '100%' }}
        opts={{ renderer: 'canvas' }}
        aria-label="Bullet chart: Execução por Função Orçamentária"
      />
    </div>
  );
}

