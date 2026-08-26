(function () {
  "use strict";

  const FLOW_URL =
    "https://default4c86fd71d0164231a16057311d68b9.51.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/27735248f4214dc598a2ac676f616bef/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=ztyowqkR-WWTvIf8Io1ddOuQmZ0OS_6fzE45f18HGfw";

  const WAREHOUSE =
    "oh6ymtaw2ayufilak4yr22fzke-utm5vftfudbu5lurkrb4tdrxma.datawarehouse.fabric.microsoft.com";

  const DATABASE = "lh_Sigplan";


  const IBGE_POPULATION_URL =
    "https://servicodados.ibge.gov.br/api/v3/agregados/6579/periodos/2025/variaveis/9324?localidades=N6[N3[31]]";

  async function getPopulacaoMunicipios() {
    const response = await fetch(IBGE_POPULATION_URL, { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`A API de população do IBGE retornou HTTP ${response.status}.`);
    const payload = await response.json();
    const resultados = payload?.[0]?.resultados?.[0]?.series || [];
    return resultados.map((item) => ({
      municipioIbgeCod: String(item?.localidade?.id || "").replace(/\D/g, ""),
      municipio: item?.localidade?.nome || "",
      populacao: Number(Object.values(item?.serie || {})[0]) || 0,
    })).filter((item) => item.municipioIbgeCod && item.populacao > 0);
  }
  function parseRows(payload) {
    return Array.isArray(payload)
      ? payload
      : payload?.rows ||
          payload?.ResultSets?.Table1 ||
          payload?.body?.ResultSets?.Table1 ||
          [];
  }

  function normalizeErrorMessage(payload, status) {
    return (
      payload?.error ||
      payload?.message ||
      payload?.body?.error ||
      payload?.body?.message ||
      `Erro HTTP ${status}`
    );
  }

  async function requestSql(sql) {
    const response = await fetch(FLOW_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ warehouse: WAREHOUSE, database: DATABASE, sql }),
    });

    const text = await response.text();
    let payload;

    try {
      payload = text ? JSON.parse(text) : {};
    } catch {
      payload = { ok: false, error: text || "Resposta inválida." };
    }

    if (!response.ok || payload.ok === false) {
      throw new Error(normalizeErrorMessage(payload, response.status));
    }

    return { ok: true, rows: parseRows(payload), raw: payload };
  }

  async function getResumo() {
    const sql = `
SELECT
  COUNT(DISTINCT programa_cod) AS quantidadeProgramas,
  COUNT(DISTINCT CONCAT(programa_cod, '-', acao_cod)) AS quantidadeAcoes,
  SUM(CASE WHEN is_total = 1 THEN orcamentario_executado ELSE 0 END) AS valorExecutado,
  MAX(emitido_em) AS dataReferencia
FROM dbo.sigplan_execucao_regionalizada_2026;`;

    return (await requestSql(sql)).rows[0] || null;
  }

  async function getExecucaoPorRegiao() {
    const sql = `
SELECT
  LTRIM(RTRIM(regiao)) AS regiao,
  SUM(orcamentario_executado) AS valorExecutado,
  SUM(orcamentario_programado_ppag) AS valorProgramado,
  COUNT(DISTINCT CONCAT(programa_cod, '-', acao_cod)) AS quantidadeAcoes
FROM dbo.sigplan_execucao_regionalizada_2026
WHERE is_total = 0
  AND regiao IS NOT NULL
  AND LTRIM(RTRIM(regiao)) <> ''
GROUP BY LTRIM(RTRIM(regiao))
ORDER BY valorExecutado DESC;`;

    return (await requestSql(sql)).rows;
  }

  async function getMunicipiosPorRegiao() {
    const sql = `
SELECT DISTINCT
  municipio_ibge_cod AS municipioIbgeCod,
  municipio,
  regiao_geografica_cod AS regiaoCod,
  LTRIM(RTRIM(regiao_geografica_desc)) AS regiao
FROM dbo.localizadores_todos_planejamento
WHERE municipio_ibge_cod IS NOT NULL
  AND regiao_geografica_desc IS NOT NULL
  AND is_deleted_localizador = 0;`;

    return (await requestSql(sql)).rows;
  }

  async function getExecucaoPorOds() {
    const sql = `
WITH execucao_programa AS (
  SELECT
    programa_cod,
    SUM(orcamentario_executado) AS valor_executado
  FROM dbo.sigplan_execucao_regionalizada_2026
  WHERE is_total = 1
  GROUP BY programa_cod
),
programa_ods AS (
  SELECT DISTINCT
    programa_cod,
    LTRIM(RTRIM(ods_titulo)) AS ods_titulo,
    NULLIF(LTRIM(RTRIM(ods_subtitulo)), '') AS ods_subtitulo
  FROM dbo.programas_planejamento
  WHERE ods_titulo IS NOT NULL
    AND LTRIM(RTRIM(ods_titulo)) <> ''
),
quantidade_ods AS (
  SELECT programa_cod, COUNT(*) AS quantidade_ods
  FROM programa_ods
  GROUP BY programa_cod
),
rateio AS (
  SELECT
    po.ods_titulo,
    po.ods_subtitulo,
    ep.programa_cod,
    qo.quantidade_ods,
    ep.valor_executado / NULLIF(qo.quantidade_ods, 0) AS valor_rateado
  FROM execucao_programa ep
  INNER JOIN programa_ods po ON po.programa_cod = ep.programa_cod
  INNER JOIN quantidade_ods qo ON qo.programa_cod = ep.programa_cod
)
SELECT
  ods_titulo AS odsTitulo,
  MAX(ods_subtitulo) AS odsSubtitulo,
  SUM(valor_rateado) AS valorExecutado,
  COUNT(DISTINCT programa_cod) AS quantidadeProgramas,
  MAX(quantidade_ods) AS maiorQuantidadeOdsPrograma
FROM rateio
GROUP BY ods_titulo
ORDER BY valorExecutado DESC;`;

    return (await requestSql(sql)).rows;
  }

  async function getDadosBalanco() {
    const [resumo, regioes, municipios, ods, populacao] = await Promise.all([
      getResumo(),
      getExecucaoPorRegiao(),
      getMunicipiosPorRegiao(),
      getExecucaoPorOds(),
      getPopulacaoMunicipios(),
    ]);

    return { resumo, regioes, municipios, ods, populacao };
  }

  window.SIGPLAN_SERVICE = {
    requestSql,
    getResumo,
    getExecucaoPorRegiao,
    getMunicipiosPorRegiao,
    getExecucaoPorOds,
    getPopulacaoMunicipios,
    getDadosBalanco,
  };
})();
