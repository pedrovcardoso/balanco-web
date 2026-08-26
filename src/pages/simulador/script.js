(() => {
  "use strict";
  let data,
    allocations = {};
  const brl = (v) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(v);
  const short = (v) =>
    v >= 1e9
      ? `R$ ${(v / 1e9).toFixed(2).replace(".", ",")} bi`
      : v >= 1e6
        ? `R$ ${(v / 1e6).toFixed(1).replace(".", ",")} mi`
        : brl(v);
  const esc = (s) =>
    String(s).replace(
      /[&<>"]/g,
      (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
    );
  const visual = (c) => ({
    cor: c.apresentacao?.cor || "#2d6a4f",
    icone: c.apresentacao?.icone || "solar:box-bold-duotone",
  });
  async function load() {
    try {
      const r = await fetch(
        "../../../public/json/execucaoOrcamentariaMG2025.json",
      );
      if (!r.ok) throw Error(r.status);
      data = await r.json();
      data.categorias.forEach((c) => (allocations[c.id] = 0));
      document.querySelector("#heroTotal").textContent = short(
        data.total_liquidado_2025,
      );
      render();
      update();
    } catch (e) {
      document.querySelector("#categoriesGrid").innerHTML =
        '<p role="alert">Não foi possível carregar os dados. Tente novamente.</p>';
      console.error(e);
    }
  }
  function render() {
    const container = document.querySelector("#categoriesGrid");
    if (!container) return;
    container.innerHTML = data.categorias
      .map((c) => {
        const v = visual(c);
        return `<article class="cat-card" id="card-${c.id}" style="--cat-color:${v.cor}"><details class="real-tooltip"><summary aria-label="Consultar execução real de ${esc(c.nome)}"><iconify-icon icon="fa6-solid:circle-info" aria-hidden="true"></iconify-icon></summary><div><strong>Executado em 2025</strong><span>${short(c.valor_liquidado_2025)}</span><small>${c.percentual_total.toFixed(2).replace(".", ",")}% do total</small></div></details>
  <div class="cat-header"><div class="cat-icon"><iconify-icon icon="${esc(v.icone)}" aria-hidden="true"></iconify-icon></div><div class="cat-title"><h3>${esc(c.nome)}</h3><p>${esc(c.descricao)}</p></div></div>
  <div class="dual-allocation" role="group" aria-label="Alocação para ${esc(c.nome)}">
   <label class="compact-field" for="percent-${c.id}"><span>Percentual</span><span class="compact-input"><input inputmode="decimal" type="text" id="percent-${c.id}" data-id="${c.id}" data-kind="percent" value="0" aria-label="Percentual para ${esc(c.nome)}"><b>%</b></span></label>
   <label class="compact-field value-field" for="value-${c.id}"><span>Valor</span><span class="compact-input"><b>R$</b><input inputmode="decimal" type="text" id="value-${c.id}" data-id="${c.id}" data-kind="value" value="0" aria-label="Valor em reais para ${esc(c.nome)}"></span></label>
  </div>
  <input class="cat-slider" type="range" min="0" max="40" step="0.1" value="0" data-id="${c.id}" data-kind="slider" aria-label="Percentual para ${esc(c.nome)}">
 </article>`;
      })
      .join("");
    container.addEventListener("input", inputChange);
    container.addEventListener("blur", normalizeInput, true);
    enableHoverTooltips(container);
  }

  function enableHoverTooltips(container) {
    const close = (d) => {
      d.open = false;
    };
    container.addEventListener("pointerover", (e) => {
      const d = e.target.closest(".real-tooltip");
      if (d) d.open = true;
    });
    container.addEventListener("pointerout", (e) => {
      const d = e.target.closest(".real-tooltip");
      if (d && !d.contains(e.relatedTarget)) close(d);
    });
    container.addEventListener("focusin", (e) => {
      const d = e.target.closest(".real-tooltip");
      if (d) d.open = true;
    });
    container.addEventListener("focusout", (e) => {
      const d = e.target.closest(".real-tooltip");
      if (d && !d.contains(e.relatedTarget)) close(d);
    });
    container.addEventListener("click", (e) => {
      const summary = e.target.closest(".real-tooltip summary");
      if (summary) e.preventDefault();
    });
  }
  function number(s) {
    return (
      Number(
        String(s)
          .replace(/\s/g, "")
          .replace(/\./g, "")
          .replace(",", ".")
          .replace(/[^0-9.-]/g, ""),
      ) || 0
    );
  }
  function pct(v) {
    return (v / data.total_liquidado_2025) * 100;
  }
  function inputChange(e) {
    const el = e.target,
      id = el.dataset.id,
      kind = el.dataset.kind;
    if (!id || !kind) return;
    if (kind === "slider" || kind === "percent")
      allocations[id] =
        (data.total_liquidado_2025 *
          (kind === "slider" ? Number(el.value) : number(el.value))) /
        100;
    else if (kind === "value") allocations[id] = number(el.value);
    allocations[id] = Math.max(0, allocations[id]);
    syncCard(id, kind);
    update();
  }
  function normalizeInput(e) {
    const el = e.target,
      id = el.dataset.id,
      kind = el.dataset.kind;
    if (!id) return;
    if (kind === "percent")
      el.value = pct(allocations[id]).toFixed(1).replace(".", ",");
    if (kind === "value")
      el.value = Math.round(allocations[id]).toLocaleString("pt-BR");
  }
  function syncCard(id, source) {
    const card = document.querySelector(`#card-${id}`);
    if (!card) return;
    const slider = card.querySelector('[data-kind="slider"]'),
      percentInput = card.querySelector('[data-kind="percent"]'),
      valueInput = card.querySelector('[data-kind="value"]'),
      p = pct(allocations[id]);
    if (source !== "slider" && slider) slider.value = Math.min(p, 40);
    if (source !== "percent" && percentInput)
      percentInput.value = p.toFixed(1).replace(".", ",");
    if (source !== "value" && valueInput)
      valueInput.value = Math.round(allocations[id]).toLocaleString("pt-BR");
  }
  function update() {
    const total = data.total_liquidado_2025,
      used = Object.values(allocations).reduce((a, b) => a + b, 0),
      left = total - used,
      pc = (used / total) * 100;
    document.querySelector("#totalBudgetLabel").textContent = short(total);
    document.querySelector("#allocatedBudgetLabel").textContent = short(used);
    document.querySelector("#remainingBudgetLabel").textContent = short(
      Math.abs(left),
    );
    document.querySelector("#balanceTitle").textContent =
      left >= 0 ? "Ainda disponível" : "Acima do total";
    document.querySelector("#budgetPercentText").textContent =
      `${pc.toFixed(1).replace(".", ",")}% alocado`;
    const fill = document.querySelector("#budgetProgressFill");
    fill.style.width = `${Math.min(pc, 100)}%`;
    fill.className =
      "budget-progress-fill " +
      (pc > 100.01 ? "bg-danger" : pc > 95 ? "bg-normal" : "bg-warning");
    const bar = fill.parentElement;
    bar.setAttribute("aria-valuenow", String(Math.min(Math.round(pc), 100)));
    const ok = Math.abs(left) <= total * 0.001;
    const compareBtn = document.querySelector("#compareBtn");
    if (compareBtn) compareBtn.disabled = false;
    const status = document.querySelector("#budgetStatusText");
    if (status) {
      status.textContent = ok
        ? "Você distribuiu praticamente todo o orçamento."
        : left > 0
          ? `Você deixou ${short(left)} sem destinação.`
          : `Sua proposta ultrapassou o total em ${short(-left)}.`;
    }
  }
  function level(diff) {
    if (diff < -0.25) return "muito_subestimado";
    if (diff < -0.08) return "subestimado";
    if (diff <= 0.08) return "proximo";
    if (diff <= 0.25) return "superestimado";
    return "muito_superestimado";
  }
  const labels = {
    muito_subestimado: "Muito abaixo",
    subestimado: "Abaixo",
    proximo: "Próximo",
    superestimado: "Acima",
    muito_superestimado: "Muito acima",
  };
  function evaluateGeneralAlerts() {
    const total = data.total_liquidado_2025,
      used = Object.values(allocations).reduce((a, b) => a + b, 0),
      balance = total - used,
      alerts = data.alertas_gerais?.alertas || [],
      active = [];
    alerts.forEach((a) => {
      let context = "";
      if (a.gatilho === "total_acima" && balance < -total * 0.001)
        context = `A proposta excedeu o total em ${short(Math.abs(balance))}, ou ${Math.abs(
          (balance / total) * 100,
        )
          .toFixed(1)
          .replace(".", ",")}%.`;
      if (
        a.gatilho === "sobra_percentual" &&
        (balance / total) * 100 > a.limite_percentual
      )
        context = `Ficaram ${short(balance)} sem destinação, equivalentes a ${((balance / total) * 100).toFixed(1).replace(".", ",")}% do total.`;
      if (a.gatilho === "categoria_minima") {
        const base = a.base_calculo?.valor_realizado_2025 || total,
          p = ((allocations[a.categoria_id] || 0) / base) * 100,
          threshold = a.percentual_referencia + a.margem_alerta_pontos;
        if (p < threshold)
          context = `A alocação equivale a ${p.toFixed(1).replace(".", ",")}% da base legal de referência (${short(base)}).`;
      }
      if (a.gatilho === "categoria_concentrada") {
        const top = Object.entries(allocations).sort((x, y) => y[1] - x[1])[0],
          p = top ? (top[1] / total) * 100 : 0;
        if (p > a.limite_percentual) {
          const c = data.categorias.find((x) => x.id === top[0]);
          context = `${c?.nome || "Uma categoria"} recebeu ${p.toFixed(1).replace(".", ",")}% do total.`;
        }
      }
      if (context) active.push({ ...a, context });
    });
    return active;
  }
  function renderGeneralAlerts(alerts) {
    const grid = document.querySelector("#generalAlertsGrid"),
      section = grid?.closest(".legal-section");
    if (!grid) return;
    if (!alerts.length) {
      if (section) section.hidden = true;
      return;
    }
    if (section) section.hidden = false;
    grid.innerHTML = alerts
      .map((a) => {
        const kind = a.classificacao_visual || "observacao",
          icon =
            kind === "fora_limite"
              ? "fa-circle-xmark"
              : kind === "alerta"
                ? "fa-triangle-exclamation"
                : "fa-circle-info";
        return `<article class="general-alert status-${kind}"><div class="alert-icon"><iconify-icon icon="fa6-solid:${icon.replace(/^fa-/, "")}" aria-hidden="true"></iconify-icon></div><div class="alert-copy"><span class="alert-status">${esc(a.rotulo_visual || "Observação")}</span><h3>${esc(a.titulo)}</h3><p><strong>${esc(a.context)}</strong> ${esc(a.resumo)}</p><details class="alert-details"><summary><iconify-icon icon="fa6-solid:chevron-right" class="alert-chevron" aria-hidden="true"></iconify-icon><span>Entenda este alerta</span></summary><div class="alert-details-content"><p>${esc(a.descricao)}</p><div class="alert-legal-note"><iconify-icon icon="fa6-solid:scale-balanced" aria-hidden="true"></iconify-icon><small>${esc(a.base_legal)}</small></div>${a.resultado_oficial_2025 ? `<small class="official-result">Resultado oficial de 2025: ${String(a.resultado_oficial_2025.percentual_aplicado).replace(".", ",")}%.</small>` : ""}</div></details></div></article>`;
      })
      .join("");
    setupAlertDetailsTransitions(grid);
  }
  function setupAlertDetailsTransitions(root) {
    root.querySelectorAll(".alert-details").forEach((details) => {
      const content = details.querySelector(".alert-details-content");
      if (!content) return;
      details.addEventListener("toggle", () => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
          return;
        content.animate(
          details.open
            ? [
                { opacity: 0, transform: "translateY(-6px)" },
                { opacity: 1, transform: "translateY(0)" },
              ]
            : [{ opacity: 1 }, { opacity: 0 }],
          { duration: 220, easing: "cubic-bezier(.2,.8,.2,1)" },
        );
      });
    });
  }
  function compare(skipTransition = false) {
    const stage1 = document.querySelector("#stage1");
    if (
      !skipTransition &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      stage1
        .animate(
          [
            { opacity: 1, transform: "scale(1)", filter: "blur(0)" },
            { opacity: 0, transform: "scale(.985)", filter: "blur(5px)" },
          ],
          { duration: 280, easing: "cubic-bezier(.4,0,1,1)", fill: "forwards" },
        )
        .finished.then(() => compare(true));
      return;
    }
    const total = data.total_liquidado_2025;
    const stage2 = document.querySelector("#stage2");
    stage1.hidden = true;
    stage1.getAnimations().forEach((a) => a.cancel());
    stage2.hidden = false;
    stage2.classList.remove("stage-enter-active");
    document.querySelector("#step1Indicator").classList.remove("is-active");
    document.querySelector("#step2Indicator").classList.add("is-active");
    let close = 0;
    const generalAlerts = evaluateGeneralAlerts();
    renderGeneralAlerts(generalAlerts);
    document.querySelector("#comparisonGrid").innerHTML = data.categorias
      .map((c, index) => {
        const u = allocations[c.id],
          real = c.valor_liquidado_2025,
          d = real ? u / real - 1 : u ? 1 : 0,
          lv = level(d),
          max = Math.max(u, real, 1);
        if (lv === "proximo") close++;
        const userWidth = Math.max((u / max) * 100, u ? 2 : 0),
          realWidth = Math.max((real / max) * 100, real ? 2 : 0);
        const delta = u - real,
          deltaText = `${delta >= 0 ? "+" : "−"}${short(Math.abs(delta)).replace("R$ ", "R$ ")}`;
        return `<article class="comparison-row level-${lv}">
   <header class="comparison-row-head"><div class="comparison-index" aria-hidden="true">${index + 1}</div><div class="cat-icon" style="--cat-color:${visual(c).cor}"><iconify-icon icon="${esc(visual(c).icone)}" aria-hidden="true"></iconify-icon></div><div class="comparison-title"><h3>${esc(c.nome)}</h3><span class="level-badge">${labels[lv]}</span></div>
   <div class="benchmark" aria-label="Sua proposta ${short(u)}; execução real ${short(real)}">
    <div class="benchmark-line"><div class="benchmark-label"><span>Sua proposta</span><strong>${short(u)} <small>(${pct(u).toFixed(2).replace(".", ",")}%)</small></strong></div><div class="benchmark-track"><span class="benchmark-bar user-bar" style="width:${userWidth}%;--cat-color:${visual(c).cor}"></span></div></div>
    <div class="benchmark-line"><div class="benchmark-label"><span>Executado em 2025</span><strong>${short(real)} <small>(${c.percentual_total.toFixed(2).replace(".", ",")}%)</small></strong></div><div class="benchmark-track"><span class="benchmark-bar real-bar" style="width:${realWidth}%"></span></div></div>
   </div>
   <div class="delta-chip ${delta >= 0 ? "positive" : "negative"}"><small>Diferença</small><strong>${deltaText}</strong><span>${d >= 0 ? "+" : ""}${(d * 100).toFixed(1).replace(".", ",")}%</span></div></header>
   <div class="impact-block"><div class="impact-icon" aria-hidden="true"><iconify-icon icon="fa6-solid:lightbulb"></iconify-icon></div><div><strong>O que essa diferença poderia representar?</strong><p>${esc(c.mensagens_comparacao[lv])}</p></div></div>
   <details class="functions-detail"><summary><span class="summary-chevron" aria-hidden="true">›</span><span>Ver composição e valores executados</span></summary><ul>${c.funcoes.map((f) => `<li><span>${esc(f.nome)}</span><strong>${short(f.valor_liquidado_2025)}</strong></li>`).join("")}</ul></details>
  </article>`;
      })
      .join("");
    const allocated = Object.values(allocations).reduce((a, b) => a + b, 0),
      balance = total - allocated,
      allocatedPct = (allocated / total) * 100;
    const highAlerts = generalAlerts.filter(
        (a) => a.classificacao_visual === "fora_limite",
      ),
      mediumAlerts = generalAlerts.filter(
        (a) => a.classificacao_visual === "alerta",
      ),
      noteAlerts = generalAlerts.filter(
        (a) => a.classificacao_visual === "observacao",
      );
    let tone = "balanced",
      title = "Sua proposta está financeiramente equilibrada",
      lead = `Você distribuiu ${allocatedPct.toFixed(1).replace(".", ",")}% do total disponível e ficou próximo da execução real em ${close} das ${data.categorias.length} categorias.`;
    let consequence =
      "O resultado mantém o total sob controle e permite comparar as prioridades definidas com a execução de 2025.";
    if (balance > total * 0.001) {
      tone = "surplus";
      title =
        "Sua proposta preserva uma reserva, mas deixa políticas sem recursos";
      lead = `Você distribuiu ${allocatedPct.toFixed(1).replace(".", ",")}% do orçamento e deixou ${short(balance)} sem destinação.`;
      consequence =
        "A reserva pode absorver emergências, frustração de receitas e despesas inesperadas. Ao mesmo tempo, representa recursos que não financiarão serviços, investimentos ou redução de obrigações neste momento.";
    }
    if (balance < -total * 0.001) {
      tone = "deficit";
      title =
        "Sua proposta amplia serviços, mas não cabe no orçamento disponível";
      lead = `Você comprometeu ${allocatedPct.toFixed(1).replace(".", ",")}% do orçamento, ultrapassando o total em ${short(Math.abs(balance))}.`;
      consequence =
        "Para executar essa proposta, o Estado teria de elevar receitas, usar reservas, contratar financiamento ou cortar despesas durante o exercício. Isso pode gerar juros, dívida e interrupção posterior de políticas.";
    }
    let legalHeadline = "A proposta não ativou alertas adicionais.";
    if (highAlerts.length) {
      tone = "danger";
      legalHeadline = `Atenção prioritária: ${highAlerts.map((a) => a.titulo).join("; ")}.`;
    } else if (mediumAlerts.length) {
      tone = tone === "balanced" || tone === "surplus" ? "warning" : tone;
      legalHeadline = `Ponto de atenção: ${mediumAlerts.map((a) => a.titulo).join("; ")}.`;
    } else if (noteAlerts.length) {
      legalHeadline = `Observação: ${noteAlerts.map((a) => a.titulo).join("; ")}.`;
    }
    const s = document.querySelector("#resultSummary");
    s.innerHTML = `<span class="global-summary ${tone}"><span class="summary-icon" aria-hidden="true"><iconify-icon icon="fa6-solid:${(tone === "danger" || tone === "deficit" ? "fa-triangle-exclamation" : tone === "warning" || tone === "surplus" ? "fa-circle-exclamation" : "fa-circle-check").replace(/^fa-/, "")}"></iconify-icon></span><span class="summary-content"><span class="summary-eyebrow">Resumo da sua proposta</span><strong>${esc(title)}</strong><span class="summary-lead">${esc(lead)}</span><span>${esc(consequence)}</span><b>${esc(legalHeadline)}</b></span></span>`;
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        stage2.classList.add("stage-enter-active");
        if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches)
          stage2.animate(
            [
              { opacity: 0, transform: "scale(1.012)", filter: "blur(6px)" },
              { opacity: 1, transform: "scale(1)", filter: "blur(0)" },
            ],
            { duration: 480, easing: "cubic-bezier(.16,1,.3,1)" },
          );
      }),
    );
    s.focus();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function edit() {
    const stage2 = document.querySelector("#stage2");
    stage2.classList.remove("stage-enter-active");
    stage2.hidden = true;
    document.querySelector("#stage1").hidden = false;
    document.querySelector("#step2Indicator").classList.remove("is-active");
    document.querySelector("#step1Indicator").classList.add("is-active");
    document.querySelector("#cat-section-title").focus();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function applyStartMode(useReal) {
    if (!data) return;
    data.categorias.forEach((c) => {
      allocations[c.id] = useReal ? c.valor_liquidado_2025 : 0;
      syncCard(c.id);
    });
    update();
  }
  function init() {
    const welcomeScreen = document.querySelector("#welcomeScreen");
    const simulatorFlow = document.querySelector("#simulatorFlow");
    const startBtn = document.querySelector("#startBtn");
    const resetBtn = document.querySelector("#resetBtn");
    const compareBtn = document.querySelector("#compareBtn");
    const restartButtons = document.querySelectorAll(".restart-simulation-btn");
    const backToHeroBtn = document.querySelector("#backToHeroBtn");
    let selectedStartMode = "zero";
    const reducedMotion = () =>
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const syncModeButtons = (mode) => {
      selectedStartMode = mode;
      document.querySelectorAll("[data-start-mode]").forEach((btn) => {
        const active = btn.dataset.startMode === mode;
        btn.classList.toggle("is-active", active);
        btn.setAttribute("aria-pressed", String(active));
      });
    };
    const animateOut = (element, done, duration = 260) => {
      if (!element || reducedMotion()) {
        done();
        return;
      }
      element
        .animate(
          [
            { opacity: 1, transform: "scale(1)", filter: "blur(0)" },
            { opacity: 0, transform: "scale(.985)", filter: "blur(5px)" },
          ],
          { duration, easing: "cubic-bezier(.4,0,1,1)", fill: "forwards" },
        )
        .finished.then(done);
    };
    const animateIn = (element, duration = 460) => {
      if (!element || reducedMotion()) return;
      element.animate(
        [
          { opacity: 0, transform: "scale(1.015)", filter: "blur(6px)" },
          { opacity: 1, transform: "scale(1)", filter: "blur(0)" },
        ],
        { duration, easing: "cubic-bezier(.16,1,.3,1)" },
      );
    };
    const showHero = () =>
      animateOut(simulatorFlow, () => {
        document
          .querySelector("#stage2")
          ?.classList.remove("stage-enter-active");
        document.querySelector("#stage2").hidden = true;
        document.querySelector("#stage1").hidden = false;
        document
          .querySelector("#step2Indicator")
          ?.classList.remove("is-active");
        document.querySelector("#step1Indicator")?.classList.add("is-active");
        simulatorFlow.classList.remove("is-visible");
        simulatorFlow.hidden = true;
        simulatorFlow.getAnimations().forEach((a) => a.cancel());
        welcomeScreen.hidden = false;
        animateIn(welcomeScreen);
        document.querySelector("#welcomeTitle")?.focus();
        window.scrollTo({
          top: 0,
          behavior: reducedMotion() ? "auto" : "smooth",
        });
      });
    const startSimulation = () =>
      animateOut(
        welcomeScreen,
        () => {
          applyStartMode(selectedStartMode === "real");
          welcomeScreen.hidden = true;
          welcomeScreen.getAnimations().forEach((a) => a.cancel());
          simulatorFlow.hidden = false;
          simulatorFlow.classList.add("is-visible");
          animateIn(simulatorFlow, 240);
          document
            .querySelector("#step1Indicator")
            ?.setAttribute("aria-current", "step");
          document.querySelector("#cat-section-title")?.focus();
          window.scrollTo({
            top: 0,
            behavior: reducedMotion() ? "auto" : "smooth",
          });
        },
        150,
      );
    document.querySelectorAll("[data-start-mode]").forEach((btn) =>
      btn.addEventListener("click", () => {
        syncModeButtons(btn.dataset.startMode);
        if (!document.querySelector("#stage1")?.hidden)
          applyStartMode(btn.dataset.startMode === "real");
      }),
    );
    if (startBtn) startBtn.addEventListener("click", startSimulation);
    if (backToHeroBtn) backToHeroBtn.addEventListener("click", showHero);
    restartButtons.forEach((btn) => btn.addEventListener("click", showHero));
    if (resetBtn)
      resetBtn.addEventListener("click", () =>
        applyStartMode(selectedStartMode === "real"),
      );
    if (compareBtn) compareBtn.addEventListener("click", compare);
    const grid = document.querySelector("#categoriesGrid");
    if (!grid) {
      console.error("Simulador: elemento #categoriesGrid não encontrado.");
      return;
    }
    syncModeButtons("zero");
    load();
  }
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", init);
  else init();
})();
