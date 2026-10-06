/**
 * Formata um número como moeda brasileira de forma compacta.
 * Ex: 82500000000 → "R$ 82,5 bilhões"
 */
export function formatCurrencyCompact(value) {
  if (value == null || isNaN(value)) return '–';
  const n = Number(value);
  if (n >= 1e12) return `R$ ${(n / 1e12).toFixed(1).replace('.', ',')} trilhões`;
  if (n >= 1e9) return `R$ ${(n / 1e9).toFixed(1).replace('.', ',')} bilhões`;
  if (n >= 1e6) return `R$ ${(n / 1e6).toFixed(1).replace('.', ',')} milhões`;
  if (n >= 1e3) return `R$ ${(n / 1e3).toFixed(1).replace('.', ',')} mil`;
  return `R$ ${n.toFixed(2).replace('.', ',')}`;
}

/**
 * Formata um número inteiro com separador de milhar.
 * Ex: 1234 → "1.234"
 */
export function formatNumber(value) {
  if (value == null || isNaN(value)) return '–';
  return Number(value).toLocaleString('pt-BR');
}

/**
 * Calcula o percentual de execução (executado / programado * 100).
 * Retorna null se programado for zero.
 */
export function calcPercent(executado, programado) {
  if (!programado) return null;
  return Math.round((executado / programado) * 100);
}

