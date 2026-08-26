(function () {
  "use strict";
  const MUNICIPIOS_GEOJSON =
    "https://servicodados.ibge.gov.br/api/v3/malhas/estados/MG?formato=application/vnd.geo%2Bjson&resolucao=2&intrarregiao=municipio";
  const money = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    notation: "compact",
    maximumFractionDigits: 2,
  });
  const number = new Intl.NumberFormat("pt-BR");
  const perCapita = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 2 });
  const metricValue = (r) => mapMode === "percapita" ? numeric(r?.valorPerCapita) : numeric(r?.valorExecutado);
  const metricFormat = (v) => mapMode === "percapita" ? `${perCapita.format(numeric(v))} per capta` : money.format(numeric(v));
  const legendMetricFormat = (v) => mapMode === "percapita" ? perCapita.format(numeric(v)) : money.format(numeric(v));
  const numeric = (v) => Number(String(v ?? 0).replace(",", ".")) || 0;
  const normalize = (v) =>
    String(v || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(
        /regiao geografica intermediaria de|regiao intermediaria de/gi,
        "",
      )
      .trim()
      .toLowerCase();
  let rankingRows = [],
    rankingOpen = false,
    mapMode = "total",
    geographyRows = [],
    stateRow = null,
    mapChart = null,
    regionGeoJson = null,
    functionsOpen = false,
    uosOpen = false,
    uoMode = "treemap",
    cachedFunctions = [],
    cachedUos = [];
  const charts = [];
  const ODS = {
    1: ["Erradicação da pobreza", "#E5243B"],
    2: ["Fome zero", "#DDA63A"],
    3: ["Saúde e bem-estar", "#4C9F38"],
    4: ["Educação", "#C5192D"],
    5: ["Igualdade de gênero", "#FF3A21"],
    6: ["Água e saneamento", "#26BDE2"],
    7: ["Energia limpa", "#FCC30B"],
    8: ["Trabalho decente", "#A21942"],
    9: ["Indústria e inovação", "#FD6925"],
    10: ["Menos desigualdades", "#DD1367"],
    11: ["Cidades sustentáveis", "#FD9D24"],
    12: ["Consumo responsável", "#BF8B2E"],
    13: ["Ação climática", "#3F7E44"],
    14: ["Vida na água", "#0A97D9"],
    15: ["Vida terrestre", "#56C02B"],
    16: ["Paz e justiça", "#00689D"],
    17: ["Parcerias", "#19486A"],
  };
  const odsImageUrl = (n) => `../../../public/images/ods/SDG-${n}.svg`;
  const odsImageFallbackUrl = (n) => `/public/images/ods/SDG-${n}.svg`;
  function hideLoader() {
    const el = document.getElementById("pageLoader");
    if (!el) return;
    el.classList.add("is-hidden");
    setTimeout(() => el.remove(), 340);
  }
  function setStatus(text, state = "") {
    const el = document.getElementById("statusMessage");
    if (!el) return;
    el.className = `status-message ${state}`.trim();
    el.innerHTML = `<iconify-icon icon="fa6-solid:${state === "error" ? "triangle-exclamation" : "circle-notch"}" aria-hidden="true"></iconify-icon>${text}`;
  }
  function renderSummary(r) {
    document.getElementById("totalExecutado").textContent = money.format(
      numeric(r?.valorExecutado),
    );
    document.getElementById("totalProgramas").textContent = number.format(
      numeric(r?.quantidadeProgramas),
    );
    document.getElementById("totalAcoes").textContent = number.format(
      numeric(r?.quantidadeAcoes),
    );
  }
  function renderRankingList() {
    const limit = rankingOpen ? rankingRows.length : 6;
    document.getElementById("regionRanking").innerHTML = rankingRows
      .slice(0, limit)
      .map((r) => {
        const label = String(r.regiao || "Não informado").replace(
          /Região (Geográfica )?Intermediária de /i,
          "",
        );
        const max = metricValue(rankingRows[0]) || 1,
          pct = Math.max(2, (metricValue(r) / max) * 100);
        return `<li class="grid grid-cols-[25px_1fr] items-start gap-x-2 border-b border-dashed border-[#8f1e2338] py-2"><div class="min-w-0"><span class="block overflow-hidden text-ellipsis whitespace-nowrap text-xs font-black" title="${label}">${label}</span><strong class="block text-xs text-[#5d2b0a]">${metricFormat(metricValue(r))}</strong></div><i class="col-start-2 block h-[7px] overflow-hidden rounded-full bg-[#eadbc0]" aria-hidden="true"><b class="block h-full rounded-[inherit] bg-gradient-to-r from-[#8f1e23] to-[#f3833a]" style="width:${pct}%"></b></i></li>`;
      })
      .join("");
    const b = document.getElementById("toggleRanking");
    if (!b) return;
    b.hidden = rankingRows.length <= 6;
    b.textContent = rankingOpen ? "Ver top 6" : "Ver todos";
    b.setAttribute("aria-expanded", String(rankingOpen));
  }
  function renderRanking(rows) {
    rankingRows = (rows || []).filter(
      (r) => !normalize(r.regiao).includes("estadual"),
    ).sort((a, b) => metricValue(b) - metricValue(a));
    rankingOpen = false;
    renderRankingList();
  }
  function renderStateBudget(rows) {
    const row = (rows || []).find((r) =>
      normalize(r.regiao).includes("estadual"),
    );
    const card = document.getElementById("stateBudgetCard");
    if (card) card.classList.toggle("hidden", mapMode === "percapita");
    const el = document.getElementById("stateBudgetValue");
    if (el) el.textContent = metricFormat(metricValue(row));
    const caption = document.getElementById("stateBudgetCaption");
    if (caption) caption.textContent = mapMode === "percapita" ? "Execução per capta" : "Valor executado";
  }
  function getFeatureCode(feature) {
    const p = feature.properties || {};
    return String(
      p.codarea ||
        p.codArea ||
        p.CD_MUN ||
        p.codigo ||
        p.id ||
        feature.id ||
        "",
    ).replace(/\D/g, "");
  }
  async function buildRegionGeoJson(municipios) {
    const response = await fetch(MUNICIPIOS_GEOJSON, {
      headers: { Accept: "application/vnd.geo+json" },
    });
    if (!response.ok)
      throw new Error(`A malha do IBGE retornou HTTP ${response.status}.`);
    const municipal = await response.json();
    const regionByMunicipio = new Map(
      municipios.map((m) => [
        String(m.municipioIbgeCod).replace(/\D/g, ""),
        String(m.regiao || ""),
      ]),
    );
    const usable = [];
    for (const feature of municipal.features || []) {
      const code = getFeatureCode(feature);
      const region = regionByMunicipio.get(code);
      if (region && feature.geometry) {
        feature.properties = { ...(feature.properties || {}), regiao: region };
        usable.push(feature);
      }
    }
    if (!usable.length)
      throw new Error(
        "A malha foi carregada, mas os códigos municipais não coincidiram com o SIGPLAN.",
      );
    if (!window.turf?.dissolve)
      throw new Error("O componente geográfico Turf não foi carregado.");
    return window.turf.dissolve(
      { type: "FeatureCollection", features: usable },
      { propertyName: "regiao" },
    );
  }

  function renderMapLegend(max) {
    const el = document.getElementById("mapLegend");
    if (!el) return;
    const colors = ["#e9fbff", "#9ee2f7", "#41a8cf", "#12526f"];
    const limits = [0, max * 0.25, max * 0.5, max * 0.75, max];
    el.innerHTML = colors
      .map(
        (color, i) =>
          `<span class="flex min-w-0 items-center gap-1"><i class="h-[9px] w-6 shrink-0 rounded-full border border-[#064b6929]" style="background:${color}"></i><b class="whitespace-nowrap leading-tight">${legendMetricFormat(limits[i])}–${legendMetricFormat(limits[i + 1])}</b></span>`,
      )
      .join("");
  }

  async function renderMap(regioes, municipios) {
    const geo = regionGeoJson || await buildRegionGeoJson(municipios);
    regionGeoJson = geo;
    const values = new Map(
      regioes.map((r) => [normalize(r.regiao), metricValue(r)]),
    );
    geo.features.forEach((f) => {
      const name = f.properties.regiao;
      f.properties.name = name;
      f.properties.valorExecutado = values.get(normalize(name)) || 0;
    });
    echarts.registerMap("MG-regioes", geo);
    const data = geo.features.map((f) => ({
      name: f.properties.name,
      value: f.properties.valorExecutado,
    }));
    const maxValue = Math.max(...data.map((d) => d.value), 1);
    renderMapLegend(maxValue);
    if (mapChart) mapChart.dispose();
    const chart = echarts.init(document.getElementById("mapaMg"));
    mapChart = chart;
    chart.setOption({
      tooltip: {
        backgroundColor: "#1f2a2a",
        borderWidth: 0,
        textStyle: { color: "#fff" },
        formatter: (p) =>
          `<strong>${p.name}</strong><br>${metricFormat(p.value || 0)}`,
      },
      visualMap: {
        show: false,
        min: 0,
        max: maxValue,
        inRange: { color: ["#e9fbff", "#9ee2f7", "#41a8cf", "#12526f"] },
      },
      series: [
        {
          type: "map",
          map: "MG-regioes",
          roam: true,
          scaleLimit: { min: 1, max: 5 },
          selectedMode: false,
          aspectScale: 1,
          layoutCenter: ["50%", "47%"],
          layoutSize: "96%",
          label: {
            show: true,
            color: "#102f38",
            fontSize: 12,
            fontWeight: 900,
            lineHeight: 14,
            textBorderColor: "rgba(255,255,255,.95)",
            textBorderWidth: 4,
            formatter: (p) => {
              const label = String(p.name).replace(/Região (Geográfica )?Intermediária de /i, "");
              const words = label.split(/\s+/);
              if (words.length < 2) return label;
              const cut = Math.ceil(words.length / 2);
              return `${words.slice(0, cut).join(" ")}\n${words.slice(cut).join(" ")}`;
            },
          },
          itemStyle: {
            borderColor: "#ffffff",
            borderWidth: 3.5,
            shadowColor: "rgba(6,75,105,.32)",
            shadowBlur: 11,
          },
          emphasis: {
            label: { color: "#fff" },
            itemStyle: {
              areaColor: "#f3833a",
              borderColor: "#fff",
              borderWidth: 4,
            },
          },
          data,
        },
      ],
    });
    charts.push(chart);
    window.addEventListener("resize", () => chart.resize());
  }
  function odsNumber(title) {
    const m = String(title || "").match(/(?:ODS\s*)?(\d{1,2})/i);
    return m ? Number(m[1]) : null;
  }
  function renderOds(rows, order = "ods") {
    const data = new Map();
    rows.forEach((r) => {
      const n = odsNumber(r.odsTitulo);
      if (n && ODS[n])
        data.set(n, {
          value: numeric(r.valorExecutado),
          programas: numeric(r.quantidadeProgramas),
          description: String(r.odsSubtitulo || "Descrição não informada."),
        });
    });
    const max = Math.max(...[...data.values()].map((x) => x.value), 1);
    const chart = document.getElementById("odsChart");
    const orderedOds = Object.entries(ODS).sort(([a], [b]) => order === "execucao"
      ? numeric(data.get(Number(b))?.value) - numeric(data.get(Number(a))?.value)
      : Number(a) - Number(b));
    chart.innerHTML = orderedOds
      .map(([key, meta]) => {
        const n = Number(key),
          d = data.get(n) || {
            value: 0,
            programas: 0,
            description: "Descrição não informada.",
          },
          pct = (d.value / max) * 100;
        const description = d.description
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;");
        return `<article class="ods-card relative grid cursor-help grid-cols-[58px_1fr] items-center gap-2 rounded-xl border-2 border-[#064b69] bg-white p-2 shadow-[5px_5px_0_rgba(245,168,0,.58)]" role="listitem" tabindex="0" style="--ods:${meta[1]}" data-tooltip="${description}" aria-label="ODS ${n}: ${meta[0]}. ${description}"><img class="size-[58px] rounded-[11px] object-cover" style="background:${meta[1]}" src="${odsImageUrl(n)}" alt="Imagem do ODS ${n}: ${meta[0]}" loading="lazy" onerror="this.onerror=null;this.src='${odsImageFallbackUrl(n)}';"><div><strong class="block text-[.78rem] leading-tight text-[#173d2c]">${meta[0]}</strong><span class="block text-[.73rem] font-black text-[#5d2b0a]">${money.format(d.value)}</span><i class="my-1 block h-[7px] overflow-hidden rounded-full bg-[#e8dcc0]" aria-hidden="true"><b class="block h-full min-w-[2px]" style="width:${pct}%;background:${meta[1]}"></b></i><small class="block text-[.65rem] font-black text-[#66746d]">${number.format(d.programas)} programa(s)</small></div></article>`;
      })
      .join("");
    chart.addEventListener("click", (event) => {
      const card = event.target.closest(".ods-card");
      chart.querySelectorAll(".ods-card.is-tooltip-open").forEach((el) => {
        if (el !== card) el.classList.remove("is-tooltip-open");
      });
      if (card) card.classList.toggle("is-tooltip-open");
    });
    document.addEventListener("click", (event) => {
      if (!event.target.closest(".ods-card"))
        chart
          .querySelectorAll(".ods-card.is-tooltip-open")
          .forEach((el) => el.classList.remove("is-tooltip-open"));
    });
  }
  const axisText = { color: "#53665c", fontFamily: "Nunito", fontWeight: 800 };
  function makeChart(id, option) {
    const el = document.getElementById(id);
    if (!el) return;
    const existing = echarts.getInstanceByDom(el);
    if (existing) existing.dispose();
    const c = echarts.init(el);
    c.setOption(option);
    charts.push(c);
    if (window.ResizeObserver) {
      const observer = new ResizeObserver(() => c.resize());
      observer.observe(el);
    }
    return c;
  }
  function renderExtraCharts(regioes, anos, funcoes, uos) {
    const common = {
      animationDuration: 550,
      grid: { left: 16, right: 16, top: 30, bottom: 16, containLabel: true },
      tooltip: {
        trigger: "axis",
        backgroundColor: "#1f2a2a",
        borderWidth: 0,
        textStyle: { color: "#fff" },
      },
    };
    cachedFunctions = funcoes || cachedFunctions;
    cachedUos = uos || cachedUos;
    const isMobile = window.matchMedia("(max-width: 620px)").matches;
    const fnSource = functionsOpen ? cachedFunctions : cachedFunctions.slice(0, 10);
    const fn = fnSource.slice().reverse();
    const fnEl = document.getElementById("functionBulletChart");
    if (fnEl) fnEl.style.height = `${Math.max(430, fn.length * (isMobile ? 52 : 46) + 80)}px`;
    const fnButton = document.getElementById("toggleFunctions");
    if (fnButton) {
      fnButton.hidden = cachedFunctions.length <= 10;
      fnButton.textContent = functionsOpen ? "Ver primeiros" : "Ver todas";
      fnButton.setAttribute("aria-expanded", String(functionsOpen));
    }
    makeChart("functionBulletChart", {
      ...common,
      grid: { left: 12, right: 18, top: 14, bottom: 10, containLabel: true },
      xAxis: {
        type: "value",
        axisLabel: { ...axisText, formatter: (v) => money.format(v) },
        splitLine: { lineStyle: { color: "#e8dcc0", type: "dashed" } },
      },
      yAxis: {
        type: "category",
        data: fn.map((x) => x.funcao || "Não informado"),
        axisLabel: {
          ...axisText,
          width: isMobile ? 165 : 280,
          overflow: "break",
          lineHeight: isMobile ? 13 : 15,
          fontSize: isMobile ? 10 : 12,
        },
      },
      series: [
        {
          name: "Programado",
          type: "bar",
          barWidth: 18,
          itemStyle: { color: "#9fb8ad", borderRadius: 8 },
          data: fn.map((x) => numeric(x.valorProgramado)),
        },
        {
          name: "Executado",
          type: "bar",
          barWidth: 8,
          barGap: "-72%",
          itemStyle: { color: "#2d6a4f", borderRadius: 8 },
          data: fn.map((x) => numeric(x.valorExecutado)),
        },
      ],
    });
    const allUos = cachedUos.filter((x) => numeric(x.valorExecutado) > 0);
    const uo = uoMode === "bars" && !uosOpen ? allUos.slice(0, 10) : allUos;
    const uoButton = document.getElementById("toggleUos");
    if (uoButton) {
      uoButton.classList.toggle("hidden", uoMode !== "bars" || allUos.length <= 10);
      uoButton.textContent = uosOpen ? "Ver primeiros" : "Ver todas";
      uoButton.setAttribute("aria-expanded", String(uosOpen));
    }
    const uoEl = document.getElementById("uoTreemapChart");
    if (uoEl) {
      uoEl.style.height = uoMode === "bars"
        ? `${Math.max(isMobile ? 520 : 640, uo.length * (isMobile ? 38 : 34) + 100)}px`
        : isMobile ? "max(500px, 68vh)" : "clamp(620px, 72vh, 820px)";
    }
    const commonTooltip = {
      trigger: "item", backgroundColor: "#1f2a2a", borderWidth: 0,
      textStyle: { color: "#fff" },
      formatter: (p) => `<strong>${p.name}</strong><br>${money.format(p.value)}`,
    };
    const option = uoMode === "bars" ? {
      animationDuration: 550,
      grid: { left: 12, right: 18, top: 14, bottom: 10, containLabel: true },
      tooltip: { ...commonTooltip, trigger: "axis" },
      xAxis: { type: "value", axisLabel: { ...axisText, formatter: (v) => money.format(v) }, splitLine: { lineStyle: { color: "#e8dcc0", type: "dashed" } } },
      yAxis: {
        type: "category",
        data: uo.slice().reverse().map((x) => x.uo || "Não informado"),
        axisLabel: { ...axisText, width: isMobile ? 150 : 320, overflow: "break", lineHeight: isMobile ? 13 : 15, fontSize: isMobile ? 10 : 12 },
      },
      series: [{ name: "Executado", type: "bar", barWidth: 13, itemStyle: { color: "#2d6a4f", borderRadius: 7 }, data: uo.slice().reverse().map((x) => numeric(x.valorExecutado)) }],
    } : {
      animationDuration: 650,
      tooltip: commonTooltip,
      series: [{
        name: "Valor executado", type: "treemap", roam: false, nodeClick: false,
        left: 0, right: 0, top: 0, bottom: 0,
        breadcrumb: { show: false }, visibleMin: 1,
        label: { show: true, formatter: (p) => `${p.name}\n${money.format(p.value)}`, fontFamily: "Nunito", fontWeight: 900, lineHeight: 15 },
        upperLabel: { show: false },
        itemStyle: { borderColor: "#fff", borderWidth: 1, gapWidth: 1 },
        levels: [{ itemStyle: { borderWidth: 1, gapWidth: 1 }, color: ["#064b69", "#2d6a4f", "#8f1e23", "#f3833a", "#4c8da8", "#7b5b3a"], colorMappingBy: "index" }],
        data: uo.map((x) => ({ name: x.uo || "Não informado", value: numeric(x.valorExecutado) })),
      }],
    };
    makeChart("uoTreemapChart", option);
  }
  async function getExtraData() {
    const functionsSql = `SELECT COALESCE(a.funcao_desc, 'Não informado') AS funcao, SUM(e.orcamentario_executado) AS valorExecutado, SUM(e.orcamentario_programado_ppag) AS valorProgramado FROM dbo.sigplan_execucao_regionalizada_2026 e LEFT JOIN dbo.acoes_planejamento a ON a.programa_cod=e.programa_cod AND a.acao_cod=e.acao_cod AND a.uo_acao_cod=e.uo_cod WHERE e.is_total=1 GROUP BY COALESCE(a.funcao_desc, 'Não informado') ORDER BY valorExecutado DESC;`;
    const uoSql = `WITH execucao_programa AS (SELECT programa_cod, SUM(orcamentario_executado) AS valorExecutado FROM dbo.sigplan_execucao_regionalizada_2026 WHERE is_total=1 GROUP BY programa_cod), programa_uo AS (SELECT programa_cod, MAX(COALESCE(uo_programa_nome, 'Não informado')) AS uo FROM dbo.programas_planejamento WHERE is_deleted_programa=0 GROUP BY programa_cod) SELECT pu.uo, SUM(ep.valorExecutado) AS valorExecutado, COUNT(DISTINCT ep.programa_cod) AS quantidadeProgramas FROM execucao_programa ep LEFT JOIN programa_uo pu ON pu.programa_cod=ep.programa_cod GROUP BY pu.uo ORDER BY valorExecutado DESC;`;
    const [functions, uos] = await Promise.all([
      window.SIGPLAN_SERVICE.requestSql(functionsSql),
      window.SIGPLAN_SERVICE.requestSql(uoSql),
    ]);
    return { functions: functions.rows, uos: uos.rows };
  }


  const NEWS_URL = "../../../public/json/noticias.json";
  const monthOrder = ["janeiro","fevereiro","marco","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"];
  const monthIndex = (value) => {
    const raw = normalize(value).replace(/\s+de\s+\d{4}$/i, "").trim();
    const numericMonth = Number(raw.replace(/\D/g, ""));
    if (numericMonth >= 1 && numericMonth <= 12) return numericMonth - 1;
    const index = monthOrder.indexOf(raw);
    return index < 0 ? 99 : index;
  };
  const escapeHtml = (value) => String(value || "").replace(/[&<>"']/g, (char) => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;" })[char]);
  function extractUrl(value) {
    const text = String(value || "");
    const href = text.match(/href=["']([^"']+)/i)?.[1];
    const raw = href || text.match(/https?:\/\/[^\s"'<>]+/i)?.[0] || "";
    return raw.replace(/&quot;.*$/i, "").replace(/[",]+$/g, "");
  }
  function renderTimeline(items) {
    const root = document.getElementById("newsTimeline");
    if (!root) return;
    const rows = (Array.isArray(items) ? items : [])
      .map((item, originalIndex) => ({ item, originalIndex }))
      .sort((a, b) => monthIndex(a.item.mes) - monthIndex(b.item.mes) || a.originalIndex - b.originalIndex)
      .map(({ item }) => item);
    if (!rows.length) {
      root.innerHTML = '<p class="rounded-xl border-2 border-[#8f1e23] bg-[#fff8df] p-4 font-black text-[#8f1e23]">Nenhuma ação cadastrada.</p>';
      return;
    }
    root.innerHTML = rows.map((item,index) => {
      const link = extractUrl(item.link), image = extractUrl(item.img);
      const media = image
        ? `<img class="timeline-card-image" src="${escapeHtml(image)}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'timeline-card-image'}))">`
        : '<div class="timeline-card-image grid place-items-center" aria-hidden="true"><iconify-icon class="text-[2.4rem] text-[#064b69]" icon="fa6-solid:map-location-dot"></iconify-icon></div>';
      const action = link ? `<a class="timeline-action" href="${escapeHtml(link)}" target="_blank" rel="noopener noreferrer">Ver notícia <iconify-icon icon="fa6-solid:arrow-up-right-from-square"></iconify-icon></a>` : "";
      return `<article class="timeline-item" data-index="${index}"><div class="timeline-card"><div class="timeline-marker" aria-hidden="true">${String(index+1).padStart(2,"0")}</div><div class="timeline-panel"><div class="timeline-summary"><div class="min-w-0"><div class="timeline-kicker"><span class="timeline-month">${escapeHtml(item.mes || "Período")}</span><span class="timeline-axis">${escapeHtml(item.eixo || "Ação")}</span></div><h3 class="timeline-title">${escapeHtml(item.titulo)}</h3></div><span class="timeline-toggle" aria-hidden="true"><iconify-icon icon="fa6-solid:chevron-down"></iconify-icon></span></div><div class="timeline-details"><div class="timeline-details-inner"><div class="timeline-details-layout"><div class="timeline-media">${media}</div><div class="timeline-copy"><p class="timeline-description">${escapeHtml(item.descricao)}</p>${action}</div></div></div></div></div></div></article>`;
    }).join("");
    const cards = [...root.querySelectorAll(".timeline-item")];
    const summaries = cards.map((card) => card.querySelector(".timeline-summary"));
    let activeIndex = 0;
    let raf = 0;
    let scrollingToCard = false;
    const setActive = (nextIndex) => {
      if (nextIndex === activeIndex) return;
      activeIndex = nextIndex;
      cards.forEach((card, index) => card.classList.toggle("is-active", index === activeIndex));
    };
    cards[0]?.classList.add("is-active");
    const update = () => {
      raf = 0;
      const rootRect = root.getBoundingClientRect();
      const focusY = innerHeight * .5;
      let candidate = activeIndex;
      let candidateDistance = Infinity;
      summaries.forEach((summary, index) => {
        const rect = summary.getBoundingClientRect();
        const distance = Math.abs(rect.top + rect.height / 2 - focusY);
        if (distance < candidateDistance) {
          candidateDistance = distance;
          candidate = index;
        }
      });
      const activeRect = summaries[activeIndex]?.getBoundingClientRect();
      const activeDistance = activeRect ? Math.abs(activeRect.top + activeRect.height / 2 - focusY) : Infinity;
      if (!scrollingToCard && candidate !== activeIndex && candidateDistance + 52 < activeDistance) setActive(candidate);
      const progress = Math.max(0, Math.min(1, (focusY - rootRect.top) / Math.max(rootRect.height, 1)));
      root.style.setProperty("--timeline-progress", `${progress * 100}%`);
    };
    const requestUpdate = () => { if (!raf) raf = requestAnimationFrame(update); };
    addEventListener("scroll", requestUpdate, { passive:true });
    addEventListener("resize", requestUpdate, { passive:true });
    root.addEventListener("click", (event) => {
      if (event.target.closest("a")) return;
      const card = event.target.closest(".timeline-item");
      if (!card) return;
      const nextIndex = cards.indexOf(card);
      setActive(nextIndex);
      scrollingToCard = true;
      card.scrollIntoView({ behavior:"smooth", block:"center" });
      window.setTimeout(() => { scrollingToCard = false; requestUpdate(); }, 650);
    });
    update();
  }
  async function loadTimeline() {
    try {
      const response = await fetch(NEWS_URL, { headers:{ Accept:"application/json" } });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      renderTimeline(await response.json());
    } catch (error) {
      console.error("Falha ao carregar notícias:", error);
      const root=document.getElementById("newsTimeline");
      if (root) root.innerHTML='<p class="rounded-xl border-2 border-[#8f1e23] bg-[#fff8df] p-4 font-black text-[#8f1e23]">Não foi possível carregar a linha do tempo.</p>';
    }
  }

  async function init() {
    document.getElementById("toggleRanking")?.addEventListener("click", () => {
      rankingOpen = !rankingOpen;
      renderRankingList();
    });
    try {
      loadTimeline();
      if (!window.SIGPLAN_SERVICE)
        throw new Error("O serviço SIGPLAN não foi carregado.");
      const data = await window.SIGPLAN_SERVICE.getDadosBalanco();
      renderSummary(data.resumo);
      const municipalityKey = (value) => String(value || "").replace(/\D/g, "").padStart(7, "0");
      const populationByMunicipio = new Map((data.populacao || []).map((p) => [municipalityKey(p.municipioIbgeCod), numeric(p.populacao)]));
      const populationByRegion = new Map();
      (data.municipios || []).forEach((m) => {
        const key = normalize(m.regiao);
        populationByRegion.set(key, (populationByRegion.get(key) || 0) + (populationByMunicipio.get(municipalityKey(m.municipioIbgeCod)) || 0));
      });
      const statePopulation = [...populationByMunicipio.values()].reduce((sum, value) => sum + value, 0);
      geographyRows = (data.regioes || []).map((r) => {
        const isState = normalize(r.regiao).includes("estadual");
        const populacao = isState ? statePopulation : (populationByRegion.get(normalize(r.regiao)) || 0);
        return { ...r, populacao, valorPerCapita: populacao ? numeric(r.valorExecutado) / populacao : 0 };
      });
      stateRow = geographyRows.find((r) => normalize(r.regiao).includes("estadual"));
      renderRanking(geographyRows);
      renderStateBudget(geographyRows);
      let odsOrder = "ods";
      renderOds(data.ods, odsOrder);
      const odsButton = document.getElementById("odsOrderButton");
      const odsMenu = document.getElementById("odsOrderMenu");
      odsButton?.addEventListener("click", () => {
        const open = odsMenu?.classList.toggle("hidden") === false;
        odsButton.setAttribute("aria-expanded", String(open));
      });
      document.querySelectorAll(".ods-order-option").forEach((option) => option.addEventListener("click", () => {
        odsOrder = option.dataset.value;
        document.getElementById("odsOrderLabel").textContent = option.textContent.trim();
        odsMenu?.classList.add("hidden");
        odsButton?.setAttribute("aria-expanded", "false");
        renderOds(data.ods, odsOrder);
      }));
      document.addEventListener("click", (event) => {
        if (!event.target.closest("#odsOrderButton") && !event.target.closest("#odsOrderMenu")) {
          odsMenu?.classList.add("hidden");
          odsButton?.setAttribute("aria-expanded", "false");
        }
      });
      const extra = await getExtraData();
      renderExtraCharts(data.regioes, extra.years, extra.functions, extra.uos);
      document.getElementById("toggleFunctions")?.addEventListener("click", () => { functionsOpen = !functionsOpen; renderExtraCharts([], [], cachedFunctions, cachedUos); });
      const setUoMode = (mode) => {
        uoMode = mode;
        if (mode !== "bars") uosOpen = false;
        [["uoModeTreemap", "treemap"], ["uoModeBars", "bars"]].forEach(([id, value]) => {
          const button = document.getElementById(id), active = value === mode;
          button?.setAttribute("aria-pressed", String(active));
          button?.classList.toggle("bg-[#064b69]", active); button?.classList.toggle("text-white", active); button?.classList.toggle("text-[#064b69]", !active);
        });
        renderExtraCharts([], [], cachedFunctions, cachedUos);
      };
      document.getElementById("toggleUos")?.addEventListener("click", () => { uosOpen = !uosOpen; renderExtraCharts([], [], cachedFunctions, cachedUos); });
      document.getElementById("uoModeTreemap")?.addEventListener("click", () => setUoMode("treemap"));
      document.getElementById("uoModeBars")?.addEventListener("click", () => setUoMode("bars"));
      await renderMap(geographyRows, data.municipios);
      const setMapMode = async (mode) => {
        mapMode = mode;
        ["Total", "PerCapita"].forEach((name) => {
          const button = document.getElementById(`mapMode${name}`);
          const active = (name === "Total" && mode === "total") || (name === "PerCapita" && mode === "percapita");
          button?.setAttribute("aria-pressed", String(active));
          button?.classList.toggle("bg-[#064b69]", active);
          button?.classList.toggle("text-white", active);
          button?.classList.toggle("text-[#064b69]", !active);
        });
        renderRanking(geographyRows);
        renderStateBudget(geographyRows);
        await renderMap(geographyRows, data.municipios);
      };
      document.getElementById("mapModeTotal")?.addEventListener("click", () => setMapMode("total"));
      document.getElementById("mapModePerCapita")?.addEventListener("click", () => setMapMode("percapita"));
      setStatus("Dados carregados.", "success");
    } catch (error) {
      console.error(error);
      setStatus(
        error.message || "Não foi possível carregar os dados.",
        "error",
      );
    } finally {
      hideLoader();
    }
  }
  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", init, { once: true })
    : init();
})();
