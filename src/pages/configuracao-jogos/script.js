(() => {
  "use strict";

  const LEVEL_POSITIONS = [
    { x: 615, y: 86 },
    { x: 470, y: 189 },
    { x: 290, y: 295 },
    { x: 165, y: 426 },
    { x: 315, y: 549 },
    { x: 540, y: 664 },
    { x: 625, y: 800 },
    { x: 430, y: 914 },
    { x: 205, y: 1025 },
    { x: 125, y: 1160 },
    { x: 300, y: 1283 },
    { x: 535, y: 1394 },
    { x: 625, y: 1521 },
    { x: 450, y: 1624 },
    { x: 265, y: 1689 },
    { x: 160, y: 1788 },
  ];

  const SECTION_COLORS = [
    "linear-gradient(135deg,#f59e0b,#c2410c)",
    "linear-gradient(135deg,#38bdf8,#1d4ed8)",
    "linear-gradient(135deg,#ec4899,#7e22ce)",
    "linear-gradient(135deg,#34d399,#047857)",
  ];

  const ENGINE_ICONS = {
    "caca-palavras": "fa-magnifying-glass",
    cruzadinha: "fa-table-cells",
    "liga-conceitos": "fa-link",
    flow: "fa-link",
    "ordem-correta": "fa-arrow-down-1-9",
    ordem: "fa-route",
    quiz: "fa-circle-question",
    swipe: "fa-hand-pointer",
    "verdadeiro-falso": "fa-check-double",
    vf: "fa-check-double",
    "simulador-orcamento": "fa-calculator",
  };

  const ENGINE_HINTS = {
    "caca-palavras":
      "Caça-palavras: cada questão é uma palavra a ser encontrada. Preencha a 'Palavra-chave' e a 'Dica/Enunciado'.",
    cruzadinha:
      "Cruzadinha: cada questão é um termo da cruzadinha. Preencha 'Palavra-chave' (resposta) e 'Pergunta/Enunciado' (definição).",
    quiz: "Quiz: preencha o enunciado e as alternativas (A, B, C, D…). Marque a correta.",
    "verdadeiro-falso":
      "Verdadeiro/Falso: preencha a afirmação e selecione se ela é Verdadeira ou Falsa.",
    vf: "Verdadeiro/Falso: preencha a afirmação e selecione se ela é Verdadeira ou Falsa.",
    "ordem-correta":
      "Ordem Correta: cada questão é um item a ser ordenado pelo jogador.",
    ordem: "Ordem Correta: cada questão é um item a ser ordenado pelo jogador.",
    "liga-conceitos":
      "Liga Conceitos: cada questão é um par conceito↔definição a ser combinado.",
    flow: "Flow: cada questão é um par conceito↔definição a ser combinado.",
    swipe:
      "Swipe: use o prompt como afirmação e o 'correct_answer' como categoria correta (esq./dir.).",
  };

  const ENGINE_NO_QUESTIONS = ["simulador-orcamento"];
  const ENGINES_USE_ALL_QUESTIONS = [
    "caca-palavras",
    "cruzadinha",
    "liga-conceitos",
    "flow",
    "ordem-correta",
    "ordem",
  ];

  let sections = []; // bc.game_section
  let engines = []; // bc.game_engine
  let phases = []; // bc.v_phase_catalog (todas)
  let selectedPhaseId = null; // game_phase_id da fase aberta
  let selectedPhaseData = null; // objeto completo da fase selecionada
  let questions = []; // questões vinculadas à fase selecionada
  let editingQuestionId = null; // null = nova, number = edição
  let confirmCallback = null;
  let confirmSecondaryCallback = null;
  let confirmBusyLabel = "Processando...";
  let filterSection = "all";
  let dirty = false;
  let questionsLocked = false;
  let acceptedEngineId = "";
  let questionsLoaded = false;
  let globalScore = loadGlobalScore();

  const $ = (id) => document.getElementById(id);
  const q = (sel) => document.querySelector(sel);

  function sqlS(v, max = 4000) {
    if (v === null || v === undefined) return "NULL";
    return "'" + String(v).slice(0, max).replace(/'/g, "''") + "'";
  }
  function sqlI(v, fallback = 0) {
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? n : fallback;
  }
  function parseJson(v, fallback = {}) {
    if (!v) return fallback;
    if (typeof v === "object") return v;
    try {
      return JSON.parse(v);
    } catch {
      return fallback;
    }
  }

  let statusTimer = null;
  function showStatus(msg, type = "ok", duration = 3000) {
    if (type !== "err") return;
    const bar = $("statusBar");
    const icon = $("statusIcon");
    const text = $("statusText");
    bar.className = `visible ${type}`;
    icon.className =
      type === "ok"
        ? "fa-solid fa-circle-check"
        : type === "err"
          ? "fa-solid fa-circle-xmark"
          : type === "saving"
            ? "fa-solid fa-cloud-arrow-up fa-spin"
            : "fa-solid fa-circle-info";
    text.textContent = msg;
    clearTimeout(statusTimer);
    if (duration)
      statusTimer = setTimeout(() => {
        bar.className = "";
      }, duration);
  }

  function engineIcon(slug) {
    return ENGINE_ICONS[String(slug || "").trim()] || "fa-gamepad";
  }

  function sectionColor(orderIndex) {
    return SECTION_COLORS[
      (Number(orderIndex || 1) - 1) % SECTION_COLORS.length
    ];
  }

  function esc(v) {
    return String(v ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  }

  async function loadAll() {
    const spinner = $("leftSpinner");
    if (spinner) spinner.hidden = false;
    $("sectionsTimeline").innerHTML = "";
    $("sectionsTimeline").classList.add("is-loading");
    if (spinner) $("sectionsTimeline").appendChild(spinner);

    try {
      const [secResult, engResult, phaseResult] = await Promise.all([
        BC_API.requestSql(`
          SELECT game_section_id AS gameSectionId, slug, title, description,
                 order_index AS orderIndex, is_active AS isActive
          FROM bc.game_section
          ORDER BY order_index;`),
        BC_API.requestSql(`
          SELECT game_engine_id AS gameEngineId, slug, title, description,
                 scoring_mode AS scoringMode, is_active AS isActive
          FROM bc.game_engine
          WHERE is_active = 1
          ORDER BY title;`),
        BC_API.requestSql(`
          SELECT gs.game_section_id AS gameSectionId, gs.slug AS sectionSlug,
                 gs.title AS sectionTitle, gs.order_index AS sectionOrder,
                 gp.game_phase_id AS gamePhaseId, CAST(gp.public_phase_id AS VARCHAR(36)) AS publicPhaseId,
                 gp.slug AS phaseSlug, gp.title AS phaseTitle, gp.description AS phaseDescription,
                 gp.order_index AS phaseOrder, ge.game_engine_id AS gameEngineId,
                 ge.slug AS engineSlug, ge.title AS engineTitle,
                 gp.question_count AS questionCount, gp.pass_score AS passScore,
                 gp.max_score AS maxScore, gp.config_json AS configJson, gp.is_active AS isActive
          FROM bc.game_phase gp
          JOIN bc.game_section gs ON gs.game_section_id=gp.game_section_id
          JOIN bc.game_engine ge ON ge.game_engine_id=gp.game_engine_id
          ORDER BY gs.order_index,gp.order_index,gp.game_phase_id;`),
      ]);
      sections = [...secResult.rows].sort(
        (a, b) => Number(a.orderIndex) - Number(b.orderIndex),
      );
      engines = engResult.rows;
      phases = phaseResult.rows;

      renderSectionFilter();
      renderTimeline();
      populateSelects();
      if (spinner) spinner.hidden = true;
    } catch (err) {
      showStatus("Erro ao carregar dados do banco: " + err.message, "err", 0);
      if (spinner)
        spinner.textContent =
          "Falha ao conectar ao banco. Verifique o FLOW_URL em api.js.";
    }
  }

  function renderSectionFilter() {}

  function renderTimeline() {
    const container = $("sectionsTimeline");
    container.classList.remove("is-loading");
    container.innerHTML = "";
    if ($("sectionsTotal")) $("sectionsTotal").textContent = sections.length;
    if ($("phasesTotal")) $("phasesTotal").textContent = phases.length;

    const filteredSections =
      filterSection === "all"
        ? sections
        : sections.filter((s) => String(s.gameSectionId) === filterSection);

    if (!filteredSections.length) {
      container.innerHTML = `<div class="questions-empty"><i class="fa-solid fa-inbox"></i><p>Nenhuma seção encontrada.</p></div>`;
      return;
    }

    let globalOffset = 0;
    const globalOffsetBySection = {};
    sections.forEach((sec) => {
      globalOffsetBySection[sec.gameSectionId] = globalOffset;
      const count = phases.filter(
        (p) => p.gameSectionId === sec.gameSectionId,
      ).length;
      globalOffset += count;
    });

    filteredSections.forEach((sec, secIdx) => {
      const color = sectionColor(sec.orderIndex);
      const secPhases = phases.filter(
        (p) => p.gameSectionId === sec.gameSectionId,
      );
      const isOpen = true;

      const block = document.createElement("div");
      block.className = `section-block${isOpen ? " open" : ""}${sec.isActive ? "" : " inactive"}`;
      block.dataset.sectionId = sec.gameSectionId;

      block.innerHTML = `
        <div class="section-header" role="button" tabindex="0"
             aria-expanded="${isOpen}" aria-controls="phases-${sec.gameSectionId}">
          <div class="section-badge" style="background:${color}">
            <i class="fa-solid fa-layer-group" aria-hidden="true"></i>
          </div>
          <div class="section-info">
            <strong>${esc(sec.title)}</strong>
            <small>${secPhases.length} fase${secPhases.length !== 1 ? "s" : ""} · Ordem ${sec.orderIndex}${sec.isActive ? "" : " · DESATIVADA"}</small>
          </div>
          <div class="section-crud">
            <div class="section-order-control" title="Alterar ordem da seção"><button class="section-up" type="button" aria-label="Mover seção para cima"><i class="fa-solid fa-chevron-left"></i></button><span>${sec.orderIndex}</span><button class="section-down" type="button" aria-label="Mover seção para baixo"><i class="fa-solid fa-chevron-right"></i></button></div>
            <button class="icon-btn sm section-edit" title="Editar seção"><i class="fa-solid fa-pen"></i></button>
            ${sec.isActive ? "" : '<span class="inactive-badge"><i class="fa-solid fa-eye-slash"></i> Oculta</span>'}
          </div><i class="fa-solid fa-chevron-right section-chevron" aria-hidden="true"></i>
        </div>
        <div class="phase-list" id="phases-${sec.gameSectionId}" role="list">
          ${
            secPhases.length === 0
              ? `<div style="padding:.75rem 1rem;color:#a0896a;font-size:.78rem;font-weight:800;">Nenhuma fase nesta seção ainda.</div>`
              : secPhases
                  .map((phase, phIdx) =>
                    renderPhaseCard(
                      phase,
                      color,
                      globalOffsetBySection[sec.gameSectionId] + phIdx,
                    ),
                  )
                  .join("")
          }
          <button class="add-phase-btn" data-section="${sec.gameSectionId}"
                  aria-label="Adicionar fase na seção ${esc(sec.title)}">
            <i class="fa-solid fa-plus" aria-hidden="true"></i> Adicionar fase nesta seção
          </button>
        </div>`;

      const header = block.querySelector(".section-header");
      header.addEventListener("click", () => block.classList.toggle("open"));
      header.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          block.classList.toggle("open");
        }
      });

      block.querySelectorAll(".phase-card").forEach((card) => {
        card.addEventListener("click", (e) => {
          if (e.target.closest(".phase-actions")) return;
          selectPhase(Number(card.dataset.phaseId));
        });
      });

      block.querySelectorAll(".btn-move-up").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          movePhase(Number(btn.dataset.phaseId), -1);
        });
      });

      block.querySelectorAll(".btn-move-down").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          movePhase(Number(btn.dataset.phaseId), 1);
        });
      });
      block
        .querySelector(".add-phase-btn")
        .addEventListener("click", () => newPhase(sec.gameSectionId));
      block.querySelector(".section-edit").addEventListener("click", (e) => {
        e.stopPropagation();
        openSectionModal(sec);
      });
      block.querySelector(".section-up").addEventListener("click", (e) => {
        e.stopPropagation();
        moveSection(sec.gameSectionId, -1);
      });
      block.querySelector(".section-down").addEventListener("click", (e) => {
        e.stopPropagation();
        moveSection(sec.gameSectionId, 1);
      });
      container.appendChild(block);
    });
  }

  function renderPhaseCard(phase, sectionColor, globalIndex) {
    const isSelected = phase.gamePhaseId === selectedPhaseId;
    const isActive = phase.isActive === true || phase.isActive === 1;
    const icon = engineIcon(phase.engineSlug);
    const pos = LEVEL_POSITIONS[globalIndex] || { x: 0, y: 0 };

    return `
      <div class="phase-card${isSelected ? " selected" : ""}${!isActive ? " inactive" : ""}"
           data-phase-id="${phase.gamePhaseId}" role="listitem">
        <span class="phase-drag-handle" aria-hidden="true"><i class="fa-solid fa-grip-vertical"></i></span>
        <div class="phase-icon" style="background:${sectionColor}">
          <i class="fa-solid ${esc(icon)}" aria-hidden="true"></i>
        </div>
        <div class="phase-info">
          <strong>${esc(phase.phaseTitle || phase.engineTitle || "Sem título")}</strong>
          <small>${esc(phase.engineTitle || phase.engineSlug || "—")} · pos. ${globalIndex + 1}</small>
        </div>
        ${isActive ? "" : '<span class="inactive-badge"><i class="fa-solid fa-eye-slash"></i> Oculta</span>'}
        <div class="phase-actions">
          <button class="icon-btn move sm btn-move-up" data-phase-id="${phase.gamePhaseId}"
                  title="Mover para cima" aria-label="Mover fase para cima">
            <i class="fa-solid fa-chevron-up" aria-hidden="true"></i>
          </button>
          <button class="icon-btn move sm btn-move-down" data-phase-id="${phase.gamePhaseId}"
                  title="Mover para baixo" aria-label="Mover fase para baixo">
            <i class="fa-solid fa-chevron-down" aria-hidden="true"></i>
          </button>
        </div>
      </div>`;
  }

  function populateSelects() {
    const sectionSel = $("fieldSection");
    const engineSel = $("fieldEngine");

    sectionSel.innerHTML = `<option value="">— Selecione uma seção —</option>`;
    sections.forEach((sec) => {
      sectionSel.insertAdjacentHTML(
        "beforeend",
        `<option value="${sec.gameSectionId}">${esc(sec.title)}${sec.isActive ? "" : " (oculta)"}</option>`,
      );
    });

    engineSel.innerHTML = `<option value="">— Selecione o motor —</option>`;
    engines.forEach((eng) => {
      engineSel.insertAdjacentHTML(
        "beforeend",
        `<option value="${eng.gameEngineId}" data-slug="${esc(eng.slug)}">${esc(eng.title)}</option>`,
      );
    });
  }

  function setQuestionsLocked(locked) {
    questionsLocked = !!locked;
    const tab = $("tabQuestions");
    tab.disabled = questionsLocked;
    tab.setAttribute("aria-disabled", String(questionsLocked));
    if (questionsLocked && tab.classList.contains("active")) switchTab("info");
  }
  function updatePhaseFieldsByEngine(slug) {
    const all = ENGINES_USE_ALL_QUESTIONS.includes(slug);
    const countField = $("fieldQuestionCount");
    countField.disabled = all;
    countField.placeholder = all
      ? "Todas as questões"
      : ["quiz", "swipe"].includes(slug)
        ? "Ex: 10 questões por partida"
        : "(automático)";
    if (all) countField.value = "";
    $("swipeCategoriesField").hidden = slug !== "swipe";
  }
  function currentEngineSlug() {
    return (
      $("fieldEngine").selectedOptions[0]?.dataset.slug ||
      selectedPhaseData?.engineSlug ||
      "quiz"
    );
  }

  function selectPhase(phaseId) {
    if (dirty) {
      confirmAction(
        "Alterações não salvas",
        "Existem alterações que ainda não foram salvas. Deseja descartá-las e abrir outra fase?",
        async () => {
          dirty = false;
          selectPhase(phaseId);
        },
        "Descartar alterações",
        null,
        "",
        "Abrindo...",
        "Continuar editando",
      );
      return;
    }
    dirty = false;
    selectedPhaseId = phaseId;
    selectedPhaseData = phases.find((p) => p.gamePhaseId === phaseId) || null;
    renderTimeline();
    openEditor(selectedPhaseData);
  }

  function openEditor(phase) {
    $("editorEmpty").hidden = true;
    $("editorCard").hidden = false;
    $("editorPanel").classList.add("open");
    $("editorPanel").setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");

    if (!phase) return;

    const isActive = phase.isActive === true || phase.isActive === 1;
    const engineSlug = phase.engineSlug || "";
    const sectionColor_ = sectionColor(phase.sectionOrder || 1);
    const icon = engineIcon(engineSlug);

    $("editorCardIcon").style.background = sectionColor_;
    $("editorCardIcon").innerHTML =
      `<i class="fa-solid ${esc(icon)}" aria-hidden="true"></i>`;
    $("editorCardName").textContent = phase.phaseTitle || "Fase sem título";
    $("editorCardSection").textContent =
      phase.sectionTitle || "Seção não definida";

    $("fieldTitle").value = phase.phaseTitle || "";
    $("fieldDescription").value = phase.phaseDescription || "";
    $("fieldIsActive").checked = isActive;
    $("phaseActiveToggle").checked = isActive;
    $("phaseStatusText").textContent = isActive ? "Ativa" : "Inativa";

    $("fieldSection").value = phase.gameSectionId || "";

    const engOpt = [...$("fieldEngine").options].find(
      (o) => o.dataset.slug === engineSlug,
    );
    $("fieldEngine").value = engOpt ? engOpt.value : "";
    acceptedEngineId = $("fieldEngine").value;
    setQuestionsLocked(false);

    const config = parseJson(phase.configJson, {});
    $("fieldSwipeLeft").value = config.swipeCategories?.left || "";
    $("fieldSwipeRight").value = config.swipeCategories?.right || "";
    $("fieldPassScore").value = globalScore.pass;
    $("fieldMaxScore").value = 100;
    $("fieldQuestionCount").value = phase.questionCount || "";
    $("fieldStarOne").value = globalScore.one;
    $("fieldStarTwo").value = globalScore.two;
    $("fieldStarThree").value = globalScore.three;

    const configClean = { ...config };
    delete configClean.stars;
    $("fieldConfigJson").value = Object.keys(configClean).length
      ? JSON.stringify(configClean, null, 2)
      : '{"unlock":"previous_phase_required"}';

    let globalIdx = 0;
    sections.forEach((sec) => {
      const secPhases = phases.filter(
        (p) => p.gameSectionId === sec.gameSectionId,
      );
      if (sec.gameSectionId === phase.gameSectionId) {
        const idx = secPhases.findIndex(
          (p) => p.gamePhaseId === phase.gamePhaseId,
        );
        globalIdx += Math.max(0, idx);
      } else if (Number(sec.orderIndex) < Number(phase.sectionOrder)) {
        globalIdx += secPhases.length;
      }
    });
    const mapPos = LEVEL_POSITIONS[globalIdx] || { x: 0, y: 0 };
    $("fieldMapGlobalIndex").value = globalIdx;
    $("fieldMapX").value = mapPos.x;
    $("fieldMapY").value = mapPos.y;

    updateEngineHint(engineSlug);
    updatePhaseFieldsByEngine(engineSlug);

    loadQuestions(phase.gamePhaseId, phase.publicPhaseId);

    switchTab("info");
  }

  function switchTab(tabId) {
    if (tabId === "questions" && questionsLocked) return;
    document.querySelectorAll(".editor-tab").forEach((btn) => {
      const isActive = btn.dataset.tab === tabId;
      btn.classList.toggle("active", isActive);
      btn.setAttribute("aria-selected", isActive);
    });
    document.querySelectorAll(".tab-panel").forEach((panel) => {
      panel.classList.toggle(
        "active",
        panel.id === `panel${tabId.charAt(0).toUpperCase() + tabId.slice(1)}`,
      );
    });
  }

  document.querySelectorAll(".editor-tab").forEach((btn) => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab));
  });

  function updateEngineHint(slug) {
    const hint = ENGINE_HINTS[slug] || null;
    const el = $("questionsEngineHint");
    const text = $("questionsEngineHintText");
    if (hint) {
      el.hidden = false;
      text.textContent = hint;
    } else {
      el.hidden = true;
    }
  }

  $("fieldEngine").addEventListener("change", () => {
    const requested = $("fieldEngine").value;
    const slug = $("fieldEngine").selectedOptions[0]?.dataset.slug || "";
    if (
      !selectedPhaseId ||
      !acceptedEngineId ||
      requested === acceptedEngineId
    ) {
      acceptedEngineId = requested;
      updateEngineHint(slug);
      updatePhaseFieldsByEngine(slug);
      return;
    }
    const previous = acceptedEngineId;
    $("fieldEngine").value = previous;
    confirmAction(
      "Alterar motor do jogo",
      "Ao alterar o motor, todas as perguntas configuradas para esta fase serão removidas ao salvar a fase.",
      async () => {
        $("fieldEngine").value = requested;
        acceptedEngineId = requested;
        questions = [];
        questionsLoaded = true;
        renderQuestions();
        updateEngineHint(slug);
        updatePhaseFieldsByEngine(slug);
        setQuestionsLocked(true);
        dirty = true;
      },
      "Alterar motor",
      null,
      "",
      "Alterando...",
    );
  });

  function ensureQuestionStateNodes() {
    const list = $("questionsList");
    if (!list) return null;

    let spinner = $("questionsSpinner");
    if (!spinner) {
      spinner = document.createElement("div");
      spinner.id = "questionsSpinner";
      spinner.className = "spinner";
      spinner.textContent = "Carregando questões...";
    }

    let empty = $("questionsEmpty");
    if (!empty) {
      empty = document.createElement("div");
      empty.id = "questionsEmpty";
      empty.className = "questions-empty";
      empty.innerHTML = `<i class="fa-solid fa-database" aria-hidden="true"></i>
        <p>Nenhuma questão vinculada a esta fase ainda.</p>
        <button class="btn sm primary" id="btnAddQuestionEmpty" type="button">
          <i class="fa-solid fa-plus"></i> Adicionar primeira questão
        </button>`;
      empty
        .querySelector("#btnAddQuestionEmpty")
        .addEventListener("click", () => openQuestionModal());
    }
    return { list, spinner, empty };
  }

  async function loadQuestions(phaseId, publicPhaseId) {
    questions = [];
    questionsLoaded = false;
    const state = ensureQuestionStateNodes();
    if (!state) return;
    const { list, spinner, empty } = state;

    spinner.hidden = false;
    empty.hidden = true;
    list.replaceChildren(spinner, empty);
    updateQuestionsCount(null);

    try {
      const result = await BC_API.requestSql(`
        SELECT
          pq.phase_question_id AS phaseQuestionId,
          pq.question_id       AS questionId,
          pq.order_index       AS orderIndex,
          pq.weight,
          pq.is_required       AS isRequired,
          qb.prompt,
          qb.simple_explanation AS simpleExplanation,
          qb.correct_answer     AS correctAnswer,
          qb.options_json       AS optionsJson,
          qb.metadata_json      AS metadataJson,
          qb.difficulty,
          qb.tags,
          ge.slug AS engineSlug
        FROM bc.phase_question pq
        JOIN bc.question_bank qb ON qb.question_id = pq.question_id
        JOIN bc.game_phase gp    ON gp.game_phase_id = pq.game_phase_id
        JOIN bc.game_engine ge   ON ge.game_engine_id = gp.game_engine_id
        WHERE pq.game_phase_id = ${sqlI(phaseId)}
          AND qb.is_active = 1
        ORDER BY pq.order_index, pq.phase_question_id;`);

      questions = result.rows || [];
      questionsLoaded = true;
      spinner.hidden = true;
      renderQuestions();
    } catch (err) {
      spinner.hidden = true;
      empty.hidden = false;
      showStatus("Erro ao carregar questões: " + err.message, "err");
    }
  }

  function updateQuestionsCount(count) {
    [$("questionsCountBadge"), $("questionsCountLabel")].forEach((el) => {
      const loading = count === null;
      el.classList.toggle("is-loading", loading);
      el.textContent = loading ? "" : String(count);
      el.setAttribute(
        "aria-label",
        loading ? "Carregando perguntas" : `${count} perguntas`,
      );
    });
  }

  function renderQuestions() {
    const state = ensureQuestionStateNodes();
    if (!state) return;
    const { list, spinner, empty } = state;

    spinner.hidden = true;
    empty.hidden = true;
    list.replaceChildren(spinner, empty);
    updateQuestionsCount(questions.length);

    if (!questions.length) {
      empty.hidden = false;
      return;
    }

    questions.forEach((q, idx) => {
      const card = document.createElement("div");
      card.className = "question-card";
      card.dataset.questionId = q.questionId;

      const preview = esc((q.prompt || "Sem enunciado").slice(0, 80));
      card.innerHTML = `
        <div class="question-card-header" aria-label="Questão ${idx + 1}: ${preview}">
          <span class="question-num">${idx + 1}</span>
          <span class="question-prompt-preview">${preview}</span>
          <div class="question-actions">
            <button class="icon-btn sm btn-q-up" title="Mover questão para cima"><i class="fa-solid fa-chevron-up"></i></button><button class="icon-btn sm btn-q-down" title="Mover questão para baixo"><i class="fa-solid fa-chevron-down"></i></button><button class="icon-btn sm btn-edit-q" data-qid="${q.questionId}"
                    title="Editar questão" aria-label="Editar questão ${idx + 1}">
              <i class="fa-solid fa-pen" aria-hidden="true"></i>
            </button>
            <button class="icon-btn sm danger btn-remove-q" data-pqid="${q.phaseQuestionId}"
                    title="Excluir pergunta" aria-label="Excluir pergunta ${idx + 1}">
              <i class="fa-solid fa-trash" aria-hidden="true"></i>
            </button>
          </div>
        </div>`;
      card.querySelector(".btn-q-up").addEventListener("click", async (e) => {
        e.stopPropagation();
        const at = questions.indexOf(q);
        if (at > 0) {
          [questions[at - 1], questions[at]] = [
            questions[at],
            questions[at - 1],
          ];
          dirty = true;
          renderQuestions();
        }
      });
      card.querySelector(".btn-q-down").addEventListener("click", async (e) => {
        e.stopPropagation();
        const at = questions.indexOf(q);
        if (at >= 0 && at < questions.length - 1) {
          [questions[at], questions[at + 1]] = [
            questions[at + 1],
            questions[at],
          ];
          dirty = true;
          renderQuestions();
        }
      });

      card.querySelector(".btn-edit-q").addEventListener("click", (e) => {
        e.stopPropagation();
        editQuestion(q);
      });

      card.querySelector(".btn-remove-q").addEventListener("click", (e) => {
        e.stopPropagation();
        confirmAction(
          "Excluir pergunta",
          "A pergunta será excluída desta fase.",
          async () => deleteQuestion(q.questionId),
        );
      });

      list.appendChild(card);
    });
  }

  function getTypeLabel(engSlug) {
    const map = {
      "caca-palavras": "Caça-Palavras",
      cruzadinha: "Cruzadinha",
      quiz: "Quiz",
      "verdadeiro-falso": "Verd./Falso",
      vf: "Verd./Falso",
      "ordem-correta": "Ordenação",
      ordem: "Ordenação",
      "liga-conceitos": "Liga Conceitos",
      flow: "Flow",
      swipe: "Swipe",
    };
    return map[engSlug] || "Questão";
  }

  function renderQuestionBody(q, engSlug, meta) {
    const lines = [];
    if (q.prompt)
      lines.push(
        `<div class="field"><label>Enunciado</label><p style="font-size:.82rem;font-weight:700;color:var(--ink);padding:.4rem 0">${esc(q.prompt)}</p></div>`,
      );
    if (q.simpleExplanation)
      lines.push(
        `<div class="field"><label>Explicação</label><p style="font-size:.78rem;font-weight:700;color:var(--ink-mid);padding:.4rem 0">${esc(q.simpleExplanation)}</p></div>`,
      );
    if (q.correctAnswer)
      lines.push(
        `<div class="field"><label>Resposta Correta</label><p style="font-size:.82rem;font-weight:800;color:var(--green);padding:.4rem 0">${esc(q.correctAnswer)}</p></div>`,
      );
    const opts = parseJson(q.optionsJson, []);
    if (opts.length) {
      lines.push(
        `<div class="field"><label>Alternativas</label><ol style="padding-left:1.2rem;margin:.3rem 0">${opts.map((o) => `<li style="font-size:.78rem;font-weight:700;color:var(--ink);margin:.15rem 0">${esc(String(o))}</li>`).join("")}</ol></div>`,
      );
    }
    if (q.tags)
      lines.push(
        `<div class="field"><label>Tags</label><p style="font-size:.72rem;font-weight:700;color:#a0896a;padding:.2rem 0">${esc(q.tags)}</p></div>`,
      );
    return lines.length
      ? `<div class="form-grid" style="gap:.5rem">${lines.join("")}</div>`
      : "<p style='font-size:.78rem;color:#a0896a;font-weight:800;'>Sem detalhes adicionais.</p>";
  }

  function newPhase(sectionId = null) {
    if (dirty) {
      confirmAction(
        "Alterações não salvas",
        "Existem alterações que ainda não foram salvas. Deseja descartá-las e criar outra fase?",
        async () => {
          dirty = false;
          newPhase(sectionId);
        },
        "Descartar alterações",
        null,
        "",
        "Abrindo...",
        "Continuar editando",
      );
      return;
    }
    dirty = false;
    selectedPhaseId = null;
    selectedPhaseData = null;

    $("fieldTitle").value = "";
    $("fieldDescription").value = "";
    $("fieldIsActive").checked = true;
    $("phaseActiveToggle").checked = true;
    $("phaseStatusText").textContent = "Ativa";
    $("fieldSection").value = sectionId || "";
    $("fieldEngine").value = "";
    acceptedEngineId = "";
    setQuestionsLocked(true);
    updatePhaseFieldsByEngine("");
    $("fieldSwipeLeft").value = "";
    $("fieldSwipeRight").value = "";
    $("fieldPassScore").value = 60;
    $("fieldMaxScore").value = 100;
    $("fieldQuestionCount").value = "";
    $("fieldStarOne").value = 60;
    $("fieldStarTwo").value = 80;
    $("fieldStarThree").value = 95;
    $("fieldConfigJson").value = '{"unlock":"previous_phase_required"}';
    $("fieldMapGlobalIndex").value = "";
    $("fieldMapX").value = "";
    $("fieldMapY").value = "";

    $("editorCardIcon").style.background = "#8b6914";
    $("editorCardIcon").innerHTML =
      `<i class="fa-solid fa-plus" aria-hidden="true"></i>`;
    $("editorCardName").textContent = "Nova Fase";
    $("editorCardSection").textContent = "Preencha os campos abaixo";

    questions = [];
    questionsLoaded = true;
    renderQuestions();
    updateEngineHint("");

    $("editorEmpty").hidden = true;
    $("editorCard").hidden = false;
    $("editorPanel").classList.add("open");
    $("editorPanel").setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    switchTab("info");
    dirty = false;
    updateAutoSaveStatus("pendente");
    $("fieldTitle").focus();
    renderTimeline();
  }

  async function savePhase(options = {}) {
    const silent = options.silent === true;
    const title = $("fieldTitle").value.trim();
    const sectionId = sqlI($("fieldSection").value, 0);
    const engineId = sqlI($("fieldEngine").value, 0);

    if (!title) {
      if (!silent) {
        showStatus("Preencha o título da fase.", "err");
        $("fieldTitle").focus();
      }
      return;
    }
    if (!sectionId) {
      if (!silent) {
        showStatus("Selecione a seção temática.", "err");
        $("fieldSection").focus();
      }
      return;
    }
    if (!engineId) {
      if (!silent) {
        showStatus("Selecione o tipo de jogo.", "err");
        $("fieldEngine").focus();
      }
      return;
    }

    const slug = uniquePhaseSlug(title, sectionId, selectedPhaseId);
    const description = $("fieldDescription").value.trim();
    const sectionPhases = phases.filter(
      (p) => Number(p.gameSectionId) === sectionId,
    );
    const orderIndex = selectedPhaseId
      ? sqlI(selectedPhaseData?.phaseOrder, 1)
      : sectionPhases.length
        ? Math.max(...sectionPhases.map((p) => sqlI(p.phaseOrder, 0))) + 1
        : 1;
    const isActive = $("fieldIsActive").checked ? 1 : 0;
    const passScore = globalScore.pass;
    const maxScore = sqlI($("fieldMaxScore").value, 100);
    const engineSlug = currentEngineSlug();
    const qCount = $("fieldQuestionCount").value.trim();
    const questionCount = ENGINES_USE_ALL_QUESTIONS.includes(engineSlug)
      ? "NULL"
      : qCount
        ? sqlI(qCount, 0)
        : "NULL";

    let extraConfig = {};
    try {
      extraConfig = JSON.parse($("fieldConfigJson").value || "{}");
    } catch {
      showStatus("Config JSON inválido.", "err");
      $("fieldConfigJson").focus();
      return;
    }
    if (engineSlug === "swipe") {
      const left = $("fieldSwipeLeft").value.trim(),
        right = $("fieldSwipeRight").value.trim();
      if (!left || !right) {
        showStatus("Informe as duas categorias de destino do Swipe.", "err");
        return;
      }
      extraConfig.swipeCategories = { left, right };
    } else delete extraConfig.swipeCategories;
    const configObj = {
      ...extraConfig,
      stars: {
        one: globalScore.one,
        two: globalScore.two,
        three: globalScore.three,
      },
    };
    const configJson = JSON.stringify(configObj);

    const duplicate = phases.find(
      (p) =>
        p.gamePhaseId !== selectedPhaseId &&
        Number(p.gameSectionId) === sectionId &&
        Number(p.phaseOrder) === orderIndex,
    );
    if (duplicate) {
      showStatus("Ordem já utilizada nesta seção.", "err");
      return;
    }
    if (!silent) showStatus("Salvando...", "saving", 0);

    try {
      const result = await BC_API.saveGamePhase({
        gamePhaseId: selectedPhaseId || null,
        gameSectionId: sectionId,
        gameEngineId: engineId,
        slug,
        title,
        description,
        orderIndex,
        questionCount: questionCount === "NULL" ? null : questionCount,
        passScore,
        maxScore,
        configJson,
        isActive: !!isActive,
      });
      const savedId =
        selectedPhaseId || Number(result?.rows?.[0]?.newGamePhaseId || 0);
      if (!silent)
        showStatus(
          selectedPhaseId
            ? "Fase atualizada com sucesso!"
            : "Fase criada com sucesso!",
          "ok",
        );
      dirty = false;
      if (silent) {
        if (!selectedPhaseId && savedId) selectedPhaseId = savedId;
        selectedPhaseData = {
          ...(selectedPhaseData || {}),
          gamePhaseId: selectedPhaseId || savedId,
          gameSectionId: sectionId,
          gameEngineId: engineId,
          phaseSlug: slug,
          phaseTitle: title,
          phaseDescription: description,
          phaseOrder: orderIndex,
          questionCount: questionCount === "NULL" ? null : questionCount,
          isActive: !!isActive,
          configJson,
          engineSlug:
            $("fieldEngine").selectedOptions[0]?.dataset.slug ||
            selectedPhaseData?.engineSlug,
        };
        updateAutoSaveStatus("salvo");
        return savedId;
      } else {
        await loadAll();
        const saved =
          phases.find((p) => Number(p.gamePhaseId) === Number(savedId)) ||
          phases.find(
            (p) =>
              p.phaseSlug === slug && Number(p.gameSectionId) === sectionId,
          );
        if (saved) selectPhase(saved.gamePhaseId);
      }
    } catch (err) {
      showStatus("Erro ao salvar: " + err.message, "err", 0);
      updateAutoSaveStatus("erro");
    }
  }

  function slugify(str) {
    return String(str || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 100);
  }

  function uniquePhaseSlug(title, sectionId, currentId = null) {
    const base = slugify(title) || "fase";
    let candidate = base;
    let suffix = 2;
    while (
      phases.some(
        (p) =>
          Number(p.gameSectionId) === Number(sectionId) &&
          Number(p.gamePhaseId) !== Number(currentId) &&
          p.phaseSlug === candidate,
      )
    ) {
      candidate = `${base}-${suffix++}`;
    }
    return candidate;
  }

  function uniqueSectionSlug(title, currentId = null) {
    const base = slugify(title) || "secao";
    let candidate = base;
    let suffix = 2;
    while (
      sections.some(
        (s) =>
          Number(s.gameSectionId) !== Number(currentId) && s.slug === candidate,
      )
    ) {
      candidate = `${base}-${suffix++}`;
    }
    return candidate;
  }

  $("phaseActiveToggle").addEventListener("change", () => {
    const toggle = $("phaseActiveToggle");
    $("fieldIsActive").checked = toggle.checked;
    $("phaseStatusText").textContent = toggle.checked ? "Ativa" : "Oculta";
    scheduleAutoSave();
  });

  $("btnDeletePhase").addEventListener("click", () => {
    if (!selectedPhaseId) return;
    confirmAction(
      "Excluir fase",
      `Excluir permanentemente a fase "${selectedPhaseData?.phaseTitle || ""}"? As perguntas continuarão no banco, mas serão desvinculadas.`,
      async () => {
        showStatus("Excluindo fase...", "saving", 0);
        await BC_API.requestSql(
          `BEGIN TRAN; DELETE FROM bc.phase_question WHERE game_phase_id=${sqlI(selectedPhaseId)}; DELETE FROM bc.game_phase WHERE game_phase_id=${sqlI(selectedPhaseId)}; COMMIT;`,
        );
        selectedPhaseId = null;
        selectedPhaseData = null;
        dirty = false;
        closeEditorModal();
        await loadAll();
        showStatus("Fase excluída.", "ok");
      },
    );
  });

  async function movePhase(phaseId, direction) {
    const phase = phases.find((p) => p.gamePhaseId === phaseId);
    if (!phase) return;
    const siblings = phases
      .filter((p) => p.gameSectionId === phase.gameSectionId)
      .sort((a, b) => Number(a.phaseOrder) - Number(b.phaseOrder));
    const idx = siblings.findIndex((p) => p.gamePhaseId === phaseId),
      swapIdx = idx + direction;
    if (swapIdx < 0 || swapIdx >= siblings.length) return;
    const swapWith = siblings[swapIdx],
      block = document.querySelector(
        `.section-block[data-section-id="${phase.gameSectionId}"]`,
      );
    block?.classList.add("is-reordering-phase");
    try {
      await BC_API.requestSql(
        `UPDATE bc.game_phase SET order_index=CASE WHEN game_phase_id=${phaseId} THEN ${sqlI(swapWith.phaseOrder)} WHEN game_phase_id=${swapWith.gamePhaseId} THEN ${sqlI(phase.phaseOrder)} ELSE order_index END WHERE game_phase_id IN (${phaseId},${swapWith.gamePhaseId});`,
      );
      await loadAll();
    } catch (err) {
      showStatus("Erro ao reordenar: " + err.message, "err");
    } finally {
      block?.classList.remove("is-reordering-phase");
    }
  }

  function openQuestionModal(questionData = null) {
    if (!selectedPhaseId) {
      showStatus("Salve a fase antes de criar perguntas.", "err");
      return;
    }
    editingQuestionId = questionData ? questionData.questionId : null;
    const engSlug = (selectedPhaseData?.engineSlug || "quiz").toLowerCase();
    const templates = {
      quiz: [
        "Pergunta de múltipla escolha",
        "Digite a pergunta, as alternativas e marque a correta.",
      ],
      swipe: [
        "Item de classificação",
        "Digite o item e configure duas categorias.",
      ],
      "verdadeiro-falso": [
        "Afirmação verdadeira ou falsa",
        "Digite a afirmação e informe se ela é verdadeira.",
      ],
      vf: [
        "Afirmação verdadeira ou falsa",
        "Digite a afirmação e informe se ela é verdadeira.",
      ],
      "caca-palavras": [
        "Palavra do caça-palavras",
        "Digite a dica e a palavra que deve ser encontrada.",
      ],
      cruzadinha: [
        "Termo da cruzadinha",
        "Digite a definição e a palavra correta.",
      ],
      "ordem-correta": [
        "Item de ordenação",
        "Digite o item que fará parte da sequência.",
      ],
      ordem: [
        "Item de ordenação",
        "Digite o item que fará parte da sequência.",
      ],
      "liga-conceitos": [
        "Conceito e definição",
        "Digite o conceito e a definição correspondente.",
      ],
      flow: [
        "Conceito e definição",
        "Digite o conceito e a definição correspondente.",
      ],
    };
    const info = templates[engSlug] || ["Nova pergunta", "Preencha os dados."];
    $("questionModalTitle").textContent = questionData
      ? `Editar: ${info[0]}`
      : info[0];
    $("qPromptLabel").textContent = ["caca-palavras", "cruzadinha"].includes(
      engSlug,
    )
      ? "Dica / definição *"
      : engSlug === "swipe"
        ? "Item para classificar *"
        : "Pergunta / afirmação *";
    $("qPrompt").value = questionData?.prompt || "";
    $("qSwipePrompt").value = questionData?.prompt || "";
    $("qExplanation").value = questionData?.simpleExplanation || "";
    $("qWord").value = "";
    $("qIsTrue").checked = true;
    $("qOrderText").value = "";
    $("qConcept").value = "";
    $("qConceptMatch").value = "";
    const meta = parseJson(questionData?.metadataJson, {}),
      opts = parseJson(questionData?.optionsJson, []);
    if (["caca-palavras", "cruzadinha"].includes(engSlug))
      $("qWord").value = (
        meta.word ||
        questionData?.correctAnswer ||
        ""
      ).toUpperCase();
    else if (["verdadeiro-falso", "vf"].includes(engSlug))
      $("qIsTrue").checked =
        String(
          questionData?.correctAnswer || meta.answer || "true",
        ).toLowerCase() !== "false";
    else if (["ordem-correta", "ordem"].includes(engSlug))
      $("qOrderText").value = meta.text || questionData?.correctAnswer || "";
    else if (["liga-conceitos", "flow"].includes(engSlug)) {
      $("qConcept").value = meta.concept || questionData?.correctAnswer || "";
      $("qConceptMatch").value =
        meta.definition || questionData?.simpleExplanation || "";
    }
    renderOptionsList(
      engSlug === "swipe"
        ? [$("fieldSwipeLeft").value, $("fieldSwipeRight").value]
        : opts,
      questionData?.correctAnswer,
    );
    $("btnAddOption").hidden = engSlug === "swipe";
    if (engSlug === "swipe")
      $("qOptionsList")
        .querySelectorAll(".q-option-input,[data-remove-opt]")
        .forEach((el) => (el.disabled = true));
    $("qOptionsSection").hidden = !["quiz", "swipe"].includes(engSlug);
    $("qOptionsSection").classList.toggle("swipe-options", engSlug === "swipe");
    $("qWordSection").hidden = !["caca-palavras", "cruzadinha"].includes(
      engSlug,
    );
    $("qVFSection").hidden = !["verdadeiro-falso", "vf"].includes(engSlug);
    $("qOrderSection").hidden = !["ordem-correta", "ordem"].includes(engSlug);
    $("qConceptSection").hidden = !["liga-conceitos", "flow"].includes(engSlug);
    $("qDefinitionSection").hidden = !["liga-conceitos", "flow"].includes(
      engSlug,
    );
    $("qSwipePromptSection").hidden = engSlug !== "swipe";
    $("qPromptSection").hidden = [
      "swipe",
      "liga-conceitos",
      "flow",
      "ordem-correta",
      "ordem",
    ].includes(engSlug);
    $("qExplanationSection").hidden = [
      "caca-palavras",
      "cruzadinha",
      "liga-conceitos",
      "flow",
      "ordem-correta",
      "ordem",
    ].includes(engSlug);
    if (engSlug === "caca-palavras") {
      $("qPromptHeading").textContent = "Conceito ou descrição";
      $("qPromptLabel").textContent = "Conceito ou descrição *";
      $("questionModalForm").insertBefore(
        $("qWordSection"),
        $("qPromptSection"),
      );
    } else
      $("questionModalForm").insertBefore(
        $("qPromptSection"),
        $("qOptionsSection"),
      );
    const presentation = {
      quiz: {
        label: "QUIZ",
        icon: "fa-circle-question",
        heading: "Pergunta",
        help: "Digite uma pergunta direta e depois cadastre as alternativas.",
        placeholder: "Ex: Qual instrumento define as metas para quatro anos?",
        options: "Alternativas da pergunta",
      },
      swipe: {
        label: "CLASSIFICAÇÃO",
        icon: "fa-hand-pointer",
        heading: "Item para classificar",
        help: "Digite o item que o jogador deverá arrastar para uma das categorias.",
        placeholder: "Ex: Construção de uma nova escola",
        options: "Categorias de destino",
      },
      "verdadeiro-falso": {
        label: "VERDADEIRO OU FALSO",
        icon: "fa-check-double",
        heading: "Afirmação",
        help: "Escreva uma afirmação completa e defina se ela é verdadeira ou falsa.",
        placeholder: "Ex: O PPA possui vigência de quatro anos.",
      },
      vf: {
        label: "VERDADEIRO OU FALSO",
        icon: "fa-check-double",
        heading: "Afirmação",
        help: "Escreva uma afirmação completa e defina se ela é verdadeira ou falsa.",
        placeholder: "Ex: O PPA possui vigência de quatro anos.",
      },
      "caca-palavras": {
        label: "CAÇA-PALAVRAS",
        icon: "fa-magnifying-glass",
        heading: "Dica",
        help: "Digite uma dica curta que ajude o jogador a encontrar a palavra.",
        placeholder:
          "Ex: Instrumento de planejamento com vigência de quatro anos.",
      },
      cruzadinha: {
        label: "CRUZADINHA",
        icon: "fa-table-cells",
        heading: "Definição",
        help: "Digite a definição que será exibida como pista da cruzadinha.",
        placeholder: "Ex: Plano que estabelece diretrizes para quatro anos.",
      },
      "ordem-correta": {
        label: "ORDEM CORRETA",
        icon: "fa-arrow-down-1-9",
        heading: "Orientação da sequência",
        help: "Descreva o que o jogador deverá organizar. Depois informe este item da sequência.",
        placeholder: "Ex: Organize as etapas do ciclo orçamentário.",
      },
      ordem: {
        label: "ORDEM CORRETA",
        icon: "fa-route",
        heading: "Orientação da sequência",
        help: "Descreva o que o jogador deverá organizar. Depois informe este item da sequência.",
        placeholder: "Ex: Organize as etapas do ciclo orçamentário.",
      },
      "liga-conceitos": {
        label: "LIGA CONCEITOS",
        icon: "fa-link",
        heading: "Orientação",
        help: "Digite uma orientação curta e cadastre abaixo o par correspondente.",
        placeholder: "Ex: Ligue cada instrumento à sua definição.",
      },
      flow: {
        label: "FLOW",
        icon: "fa-link",
        heading: "Conceito e definição",
        help: "Cadastre o conceito e sua definição correspondente.",
        placeholder: "",
      },
    };
    const view = presentation[engSlug] || {
      label: "PERGUNTA",
      icon: "fa-circle-question",
      heading: "Enunciado",
      help: "Digite o conteúdo apresentado ao jogador.",
      placeholder: "Digite o enunciado...",
    };
    $("questionEngineLabel").textContent = view.label;
    $("questionEngineIcon").innerHTML = `<i class="fa-solid ${view.icon}"></i>`;
    $("qPromptHeading").textContent = view.heading;
    $("qPromptHelp").textContent = view.help;
    $("qPrompt").placeholder = view.placeholder;
    $("qOptionsHeading").textContent = view.options || "Alternativas";
    document
      .querySelectorAll(".truth-option")
      .forEach((btn) =>
        btn.classList.toggle(
          "active",
          String(btn.dataset.value) === String($("qIsTrue").checked),
        ),
      );
    $("questionModal").classList.add("open");
    (engSlug === "swipe"
      ? $("qSwipePrompt")
      : ["liga-conceitos", "flow"].includes(engSlug)
        ? $("qConcept")
        : $("qPrompt")
    ).focus();
  }

  function renderOptionsList(opts, correctAnswer) {
    const list = $("qOptionsList");
    list.innerHTML = "";
    const safeOpts = Array.isArray(opts) && opts.length ? opts : ["", ""];
    safeOpts.forEach((opt, idx) => {
      const isCorrect =
        String(correctAnswer) === String(idx) ||
        String(correctAnswer) === String(opt);
      list.insertAdjacentHTML(
        "beforeend",
        `
        <div class="option-row">
          <input type="radio" name="qCorrect" value="${idx}" ${isCorrect ? "checked" : ""} aria-label="Marcar alternativa ${idx + 1} como correta">
          <div class="field" style="flex:1;margin:0">
            <input type="text" class="q-option-input" data-idx="${idx}" value="${esc(String(opt))}" placeholder="Alternativa ${idx + 1}">
          </div>
          <button class="icon-btn sm danger" data-remove-opt="${idx}" title="Remover alternativa" type="button">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>`,
      );
    });
    list.querySelectorAll("[data-remove-opt]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = Number(btn.dataset.removeOpt);
        const current = getOptionsFromForm();
        current.splice(idx, 1);
        renderOptionsList(current, null);
      });
    });
  }

  function getOptionsFromForm() {
    return [...$("qOptionsList").querySelectorAll(".q-option-input")].map(
      (i) => i.value,
    );
  }

  $("btnAddOption").addEventListener("click", () => {
    const current = getOptionsFromForm();
    current.push("");
    renderOptionsList(current, null);
  });

  document.querySelectorAll(".truth-option").forEach((btn) =>
    btn.addEventListener("click", () => {
      $("qIsTrue").checked = btn.dataset.value === "true";
      document
        .querySelectorAll(".truth-option")
        .forEach((item) => item.classList.toggle("active", item === btn));
    }),
  );

  $("btnQuestionModalClose").addEventListener("click", () =>
    $("questionModal").classList.remove("open"),
  );

  $("questionModal").addEventListener("click", (e) => {
    if (e.target === $("questionModal"))
      $("questionModal").classList.remove("open");
  });

  $("btnAddQuestion").addEventListener("click", () => openQuestionModal());
  $("btnAddQuestionEmpty").addEventListener("click", () => openQuestionModal());

  $("btnQuestionSave").addEventListener("click", async () => {
    const btn = $("btnQuestionSave");
    if (btn.disabled) return;
    btn.disabled = true;
    btn.innerHTML =
      '<i class="fa-solid fa-circle-notch fa-spin"></i> Salvando...';
    try {
      await saveQuestion();
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Salvar';
    }
  });

  async function saveQuestion() {
    const engSlug = currentEngineSlug();
    let prompt = $("qPrompt").value.trim(),
      explanation = $("qExplanation").value.trim();
    let correctAnswer = null,
      optionsJson = null,
      metadataJson = null;
    if (engSlug === "quiz") {
      const opts = getOptionsFromForm().map((v) => v.trim()),
        correct = $("qOptionsList").querySelector(
          "input[name=qCorrect]:checked",
        );
      if (opts.length < 2 || opts.some((v) => !v) || !correct) {
        showStatus("Preencha as alternativas e marque a correta.", "err");
        return;
      }
      const i = Number(correct.value);
      optionsJson = JSON.stringify(opts);
      correctAnswer = String(i);
      metadataJson = JSON.stringify({ options: opts, answer: i });
    } else if (engSlug === "swipe") {
      prompt = $("qSwipePrompt").value.trim();
      if (!prompt) {
        showStatus("Informe o item para classificar.", "err");
        return;
      }
      const cats = [
          $("fieldSwipeLeft").value.trim(),
          $("fieldSwipeRight").value.trim(),
        ],
        correct = $("qOptionsList").querySelector(
          "input[name=qCorrect]:checked",
        );
      if (cats.some((v) => !v) || !correct) {
        showStatus("Selecione uma das categorias configuradas na fase.", "err");
        return;
      }
      correctAnswer = cats[Number(correct.value)];
      optionsJson = JSON.stringify(cats);
      metadataJson = JSON.stringify({
        options: cats,
        answer: correctAnswer,
        category: correctAnswer,
      });
    } else if (["caca-palavras", "cruzadinha"].includes(engSlug)) {
      const word = $("qWord")
        .value.trim()
        .toUpperCase()
        .replace(/[^A-ZÁÀÂÃÉÊÍÓÔÕÚÇ]/g, "");
      if (!word || !prompt) {
        showStatus("Informe a resposta e o conceito/definição.", "err");
        return;
      }
      correctAnswer = word;
      explanation = "";
      metadataJson = JSON.stringify({ word, label: prompt });
    } else if (["verdadeiro-falso", "vf"].includes(engSlug)) {
      if (!prompt) {
        showStatus("Informe a afirmação.", "err");
        return;
      }
      const v = $("qIsTrue").checked;
      correctAnswer = v ? "true" : "false";
      metadataJson = JSON.stringify({ answer: correctAnswer });
    } else if (["ordem-correta", "ordem"].includes(engSlug)) {
      const text = $("qOrderText").value.trim();
      if (!text) {
        showStatus("Informe o texto do item.", "err");
        return;
      }
      prompt = text;
      explanation = "";
      correctAnswer = text;
      metadataJson = JSON.stringify({ text });
    } else if (["liga-conceitos", "flow"].includes(engSlug)) {
      const concept = $("qConcept").value.trim(),
        definition = $("qConceptMatch").value.trim();
      if (!concept || !definition) {
        showStatus("Informe o conceito e a definição.", "err");
        return;
      }
      prompt = concept;
      explanation = definition;
      correctAnswer = concept;
      metadataJson = JSON.stringify({ concept, definition });
    } else if (!prompt) {
      showStatus("Preencha o campo obrigatório.", "err");
      return;
    }
    const payload = {
      questionId: editingQuestionId || `tmp_${Date.now()}`,
      phaseQuestionId: editingQuestionId
        ? questions.find(
            (x) => String(x.questionId) === String(editingQuestionId),
          )?.phaseQuestionId
        : null,
      prompt,
      simpleExplanation: explanation,
      correctAnswer,
      optionsJson,
      metadataJson,
      difficulty: 2,
      tags: "",
      engineSlug: engSlug,
      _isNew: !editingQuestionId,
    };
    if (editingQuestionId) {
      const i = questions.findIndex(
        (x) => String(x.questionId) === String(editingQuestionId),
      );
      if (i >= 0) questions[i] = { ...questions[i], ...payload };
    } else questions.push(payload);
    dirty = true;
    renderQuestions();
    $("questionModal").classList.remove("open");
    showStatus("Pergunta guardada. Salve a fase para enviar ao banco.", "ok");
  }

  function editQuestion(q) {
    openQuestionModal(q);
  }

  async function deleteQuestion(questionId) {
    questions = questions.filter(
      (q) => String(q.questionId) !== String(questionId),
    );
    dirty = true;
    renderQuestions();
    showStatus(
      "Pergunta removida. A alteração será enviada ao salvar a fase.",
      "ok",
    );
  }

  async function unlinkQuestion(phaseQuestionId) {
    showStatus("Desvinculando...", "saving", 0);
    try {
      await BC_API.requestSql(`
        DELETE FROM bc.phase_question
        WHERE phase_question_id = ${sqlI(phaseQuestionId)};`);
      showStatus("Questão desvinculada.", "ok");
      await loadQuestions(selectedPhaseId, selectedPhaseData?.publicPhaseId);
    } catch (err) {
      showStatus("Erro ao desvincular: " + err.message, "err");
    }
  }

  function confirmAction(
    title,
    message,
    onConfirm,
    okLabel = "Confirmar",
    onSecondary = null,
    secondaryLabel = "",
    busyLabel = "Excluindo...",
    cancelLabel = "Cancelar",
  ) {
    $("confirmTitle").textContent = title;
    $("confirmMessage").textContent = message;
    confirmCallback = onConfirm;
    confirmSecondaryCallback = onSecondary;
    confirmBusyLabel = busyLabel;
    $("btnConfirmOk").textContent = okLabel;
    $("btnConfirmOk").disabled = false;
    $("btnConfirmCancel").textContent = cancelLabel;
    let secondary = $("btnConfirmSecondary");
    if (!secondary) {
      secondary = document.createElement("button");
      secondary.id = "btnConfirmSecondary";
      secondary.className = "btn ghost";
      $("btnConfirmOk").before(secondary);
      secondary.addEventListener("click", async () => {
        $("confirmModal").classList.remove("open");
        const fn = confirmSecondaryCallback;
        confirmSecondaryCallback = null;
        confirmCallback = null;
        if (fn)
          try {
            await fn();
          } catch (err) {
            showStatus("Erro: " + err.message, "err");
          }
      });
    }
    secondary.hidden = !onSecondary;
    secondary.textContent = secondaryLabel;
    $("confirmModal").classList.add("open");
  }

  $("btnConfirmOk").addEventListener("click", async () => {
    const btn = $("btnConfirmOk");
    const originalLabel = btn.textContent;
    if (typeof confirmCallback !== "function") return;
    btn.disabled = true;
    btn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> ${esc(confirmBusyLabel)}`;
    try {
      await confirmCallback();
      $("confirmModal").classList.remove("open");
      confirmCallback = null;
    } catch (err) {
      showStatus("Erro: " + err.message, "err", 0);
    } finally {
      btn.disabled = false;
      btn.textContent = originalLabel;
    }
  });
  $("btnConfirmCancel").addEventListener("click", () => {
    $("confirmModal").classList.remove("open");
    confirmCallback = null;
  });
  $("confirmModal").addEventListener("click", (e) => {
    if (e.target === $("confirmModal")) {
      $("confirmModal").classList.remove("open");
      confirmCallback = null;
    }
  });

  async function persistQuestions(phaseId) {
    const sectionId = sqlI($("fieldSection").value),
      engineId = sqlI($("fieldEngine").value);
    const existingIds = questions
      .filter((q) => !q._isNew && Number(q.questionId))
      .map((q) => Number(q.questionId));
    const statements = [
      `BEGIN TRY BEGIN TRAN; DELETE FROM bc.phase_question WHERE game_phase_id=${sqlI(phaseId)};`,
    ];
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i],
        isNew = q._isNew || !Number(q.questionId);
      if (isNew) {
        statements.push(
          `DECLARE @qid${i} BIGINT=(SELECT COALESCE(MAX(question_id),0)+1 FROM bc.question_bank); INSERT INTO bc.question_bank(question_id,public_question_id,game_section_id,game_engine_id,content_year_id,difficulty,prompt,simple_explanation,correct_answer,options_json,metadata_json,tags,is_active,created_at,updated_at) VALUES(@qid${i},NEWID(),${sectionId},${engineId},NULL,${sqlI(q.difficulty, 2)},${sqlS(q.prompt)},${sqlS(q.simpleExplanation)},${sqlS(q.correctAnswer, 400)},${sqlS(q.optionsJson)},${sqlS(q.metadataJson)},${sqlS(q.tags, 500)},1,SYSUTCDATETIME(),SYSUTCDATETIME()); DECLARE @pqid${i} BIGINT=(SELECT COALESCE(MAX(phase_question_id),0)+1 FROM bc.phase_question); INSERT INTO bc.phase_question(phase_question_id,game_phase_id,question_id,order_index,weight,is_required) VALUES(@pqid${i},${sqlI(phaseId)},@qid${i},${i + 1},1.0,0);`,
        );
      } else
        statements.push(
          `UPDATE bc.question_bank SET game_section_id=${sectionId},game_engine_id=${engineId},prompt=${sqlS(q.prompt)},simple_explanation=${sqlS(q.simpleExplanation)},correct_answer=${sqlS(q.correctAnswer, 400)},options_json=${sqlS(q.optionsJson)},metadata_json=${sqlS(q.metadataJson)},difficulty=${sqlI(q.difficulty, 2)},tags=${sqlS(q.tags, 500)},is_active=1,updated_at=SYSUTCDATETIME() WHERE question_id=${sqlI(q.questionId)}; DECLARE @pqid${i} BIGINT=(SELECT COALESCE(MAX(phase_question_id),0)+1 FROM bc.phase_question); INSERT INTO bc.phase_question(phase_question_id,game_phase_id,question_id,order_index,weight,is_required) VALUES(@pqid${i},${sqlI(phaseId)},${sqlI(q.questionId)},${i + 1},1.0,0);`,
        );
    }
    statements.push(
      `COMMIT; END TRY BEGIN CATCH IF @@TRANCOUNT>0 ROLLBACK; THROW; END CATCH;`,
    );
    await BC_API.requestSql(statements.join("\n"));
  }

  function closeEditorModal() {
    $("editorPanel").classList.remove("open");
    $("editorPanel").setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    document
      .querySelectorAll(".phase-card.selected")
      .forEach((card) => card.classList.remove("selected"));
  }
  async function requestCloseEditor() {
    if (autoSaving) {
      showStatus("Aguarde o salvamento atual.", "saving", 1800);
      return;
    }
    if (!dirty) {
      closeEditorModal();
      return;
    }
    confirmAction(
      "Alterações não salvas",
      "Existem alterações que ainda não foram salvas. Deseja fechar o modal e descartá-las?",
      async () => {
        dirty = false;
        closeEditorModal();
      },
      "Fechar sem salvar",
      null,
      "",
      "Fechando...",
      "Continuar editando",
    );
  }
  $("btnSavePhase").addEventListener("click", async () => {
    const btn = $("btnSavePhase");
    if (autoSaving) return;
    autoSaving = true;
    btn.disabled = true;
    btn.innerHTML =
      '<i class="fa-solid fa-circle-notch fa-spin"></i> Salvando...';
    try {
      const savedId = await savePhase({ silent: true });
      if (!savedId) return;
      await persistQuestions(savedId);
      dirty = false;
      closeEditorModal();
      selectedPhaseId = null;
      selectedPhaseData = null;
      await loadAll();
      showStatus("Fase e perguntas salvas com sucesso!", "ok");
    } catch (e) {
      showStatus("Erro ao salvar fase: " + e.message, "err", 0);
      dirty = true;
    } finally {
      autoSaving = false;
      btn.disabled = false;
      btn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Salvar';
    }
  });
  $("btnCloseEditor").addEventListener("click", requestCloseEditor);
  $("editorPanel").addEventListener("click", (e) => {
    if (e.target === $("editorPanel")) requestCloseEditor();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if ($("globalScoreModal").classList.contains("open"))
        return closeGlobalScore();
      if ($("sectionModal").classList.contains("open"))
        return closeSectionModal();
      if ($("questionModal").classList.contains("open"))
        return $("questionModal").classList.remove("open");
      if ($("confirmModal").classList.contains("open"))
        return $("confirmModal").classList.remove("open");
      if ($("editorPanel").classList.contains("open")) requestCloseEditor();
    }
  });

  let autoSaveTimer = null;
  let autoSaving = false;
  function updateAutoSaveStatus() {}
  function scheduleAutoSave() {
    dirty = true;
    updateAutoSaveStatus("pendente");
  }

  function loadGlobalScore() {
    try {
      return (
        JSON.parse(localStorage.getItem("bc_admin_global_score") || "null") || {
          pass: 60,
          one: 60,
          two: 80,
          three: 95,
        }
      );
    } catch {
      return { pass: 60, one: 60, two: 80, three: 95 };
    }
  }
  function updateGlobalSummary() {}
  function openGlobalScore() {
    $("globalPass").value = globalScore.pass;
    $("globalStar1").value = globalScore.one;
    $("globalStar2").value = globalScore.two;
    $("globalStar3").value = globalScore.three;
    $("globalScoreModal").classList.add("open");
    $("globalScoreModal").setAttribute("aria-hidden", "false");
    document.body.classList.add("dialog-open");
    requestAnimationFrame(() => $("globalPass").focus());
  }
  function closeGlobalScore() {
    $("globalScoreModal").classList.remove("open");
    $("globalScoreModal").setAttribute("aria-hidden", "true");
    document.body.classList.remove("dialog-open");
  }
  async function applyGlobalScore() {
    const btn = $("btnGlobalApply");
    const g = {
      pass: +$("globalPass").value,
      one: +$("globalStar1").value,
      two: +$("globalStar2").value,
      three: +$("globalStar3").value,
    };
    if (
      Object.values(g).some((v) => !Number.isFinite(v) || v < 0 || v > 100) ||
      !(g.one <= g.two && g.two <= g.three)
    ) {
      showStatus(
        "Valores inválidos. Use 0–100 e estrelas em ordem crescente.",
        "err",
      );
      return;
    }
    btn.disabled = true;
    btn.innerHTML =
      '<i class="fa-solid fa-circle-notch fa-spin"></i> Aplicando...';
    try {
      for (const p of phases) {
        const cfg = parseJson(p.configJson, {});
        await BC_API.saveGamePhase({
          gamePhaseId: p.gamePhaseId,
          gameSectionId: p.gameSectionId,
          gameEngineId: p.gameEngineId,
          slug: p.phaseSlug,
          title: p.phaseTitle,
          description: p.phaseDescription,
          orderIndex: p.phaseOrder,
          questionCount: p.questionCount,
          passScore: g.pass,
          maxScore: p.maxScore || 100,
          configJson: JSON.stringify({
            ...cfg,
            stars: { one: g.one, two: g.two, three: g.three },
          }),
          isActive: !!p.isActive,
        });
      }
      globalScore = g;
      localStorage.setItem("bc_admin_global_score", JSON.stringify(g));
      updateGlobalSummary();
      closeGlobalScore();
      showStatus("Pontuação global aplicada.");
      await loadAll();
    } catch (e) {
      showStatus(e.message, "err", 4500);
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<i class="fa-solid fa-check"></i> Aplicar pontuação';
    }
  }
  function openSectionModal(sec = null) {
    $("sectionModalTitle").textContent = sec ? "Editar seção" : "Nova seção";
    $("sectionId").value = sec?.gameSectionId || "";
    $("sectionTitle").value = sec?.title || "";
    $("sectionDescription").value = sec?.description || "";
    $("sectionIsActive").checked = sec ? !!sec.isActive : true;
    $("btnDeleteSection").hidden = !sec;
    $("sectionModal").classList.add("open");
    $("sectionModal").setAttribute("aria-hidden", "false");
    document.body.classList.add("dialog-open");
    requestAnimationFrame(() => $("sectionTitle").focus());
  }
  function closeSectionModal() {
    $("sectionModal").classList.remove("open");
    $("sectionModal").setAttribute("aria-hidden", "true");
    document.body.classList.remove("dialog-open");
  }
  async function saveSection() {
    const btn = $("btnSectionSave"),
      id = +$("sectionId").value || 0,
      title = $("sectionTitle").value.trim();
    if (!title) {
      showStatus("Informe o título da seção.", "err");
      $("sectionTitle").focus();
      return;
    }
    const slug = uniqueSectionSlug(title, id);
    const current = sections.find((s) => Number(s.gameSectionId) === id);
    const order = current
      ? Number(current.orderIndex)
      : sections.length
        ? Math.max(...sections.map((s) => Number(s.orderIndex) || 0)) + 1
        : 1;
    btn.disabled = true;
    btn.innerHTML =
      '<i class="fa-solid fa-circle-notch fa-spin"></i> Salvando...';
    try {
      await BC_API.adminSaveSection({
        gameSectionId: id || null,
        title,
        slug,
        description: $("sectionDescription").value.trim(),
        orderIndex: order,
        isActive: $("sectionIsActive").checked,
      });
      await loadAll();
      closeSectionModal();
      showStatus("Seção salva.", "ok");
    } catch (e) {
      showStatus("Erro ao salvar seção: " + e.message, "err", 4500);
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Salvar seção';
    }
  }
  async function moveSection(id, d) {
    const board = $("sectionsTimeline");
    if (board.classList.contains("is-reordering")) return;
    board.classList.add("is-reordering");
    try {
      await BC_API.adminMoveSection(id, d);
      await loadAll();
      showStatus("Ordem das seções atualizada.", "ok");
    } catch (e) {
      showStatus("Erro ao reordenar: " + e.message, "err");
    } finally {
      board.classList.remove("is-reordering");
    }
  }

  $("btnNewSection").addEventListener("click", () => openSectionModal());
  $("btnSectionClose").addEventListener("click", closeSectionModal);
  $("btnDeleteSection").addEventListener("click", () => {
    const id = +$("sectionId").value || 0,
      sec = sections.find((s) => Number(s.gameSectionId) === id);
    if (!id || !sec) return;
    const count = phases.filter((p) => Number(p.gameSectionId) === id).length;
    confirmAction(
      "Excluir seção",
      `Excluir permanentemente a seção "${sec.title}"? Todas as ${count} fase(s) e suas questões também serão excluídas.`,
      async () => {
        await BC_API.requestSql(`
        BEGIN TRY
          BEGIN TRAN;
          DELETE pq
          FROM bc.phase_question pq
          JOIN bc.game_phase gp ON gp.game_phase_id = pq.game_phase_id
          WHERE gp.game_section_id = ${sqlI(id)};
          DELETE FROM bc.question_bank WHERE game_section_id = ${sqlI(id)};
          DELETE FROM bc.game_phase WHERE game_section_id = ${sqlI(id)};
          DELETE FROM bc.game_section WHERE game_section_id = ${sqlI(id)};
          COMMIT;
        END TRY
        BEGIN CATCH
          IF @@TRANCOUNT > 0 ROLLBACK;
          THROW;
        END CATCH;
      `);
        await loadAll();
        closeSectionModal();
        showStatus("Seção, fases e questões excluídas.", "ok");
      },
      "Excluir",
      null,
      "",
      "Excluindo...",
    );
  });
  $("sectionModal").addEventListener("click", (e) => {
    if (e.target === $("sectionModal")) closeSectionModal();
  });
  $("btnSectionSave").addEventListener("click", saveSection);
  $("btnGlobalScore").addEventListener("click", openGlobalScore);
  $("btnGlobalClose").addEventListener("click", closeGlobalScore);
  $("btnGlobalCancel").addEventListener("click", closeGlobalScore);
  $("btnGlobalApply").addEventListener("click", applyGlobalScore);
  $("globalScoreModal").addEventListener("click", (e) => {
    if (e.target === $("globalScoreModal")) closeGlobalScore();
  });

  document
    .querySelectorAll(
      "#editorCard input,#editorCard textarea,#editorCard select",
    )
    .forEach((el) => {
      el.addEventListener("input", scheduleAutoSave);
      el.addEventListener("change", scheduleAutoSave);
    });

  updateGlobalSummary();
  loadAll();
})();
