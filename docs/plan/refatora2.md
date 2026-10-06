# Refatoração v2 — Arquitetura Feature-Based

> **De:** MPA Vanilla JS + Tailwind CDN + SQL inline no browser via Power Automate
> **Para:** SPA React (Vite + Tailwind v4 + React Icons) + Backend FastAPI com Power Automate server-side
>
> Sem TypeScript · Login opcional (visitante por padrão) · Futuro: gov.br via Keycloak

---

## 1. Stack Técnica

| Camada         | Tecnologia                                   | Justificativa                                          |
| -------------- | -------------------------------------------- | ------------------------------------------------------ |
| Build          | **Vite 6**                                   | HMR instantâneo, ESM nativo, tree-shaking              |
| UI             | **React 19** (JSX, sem TypeScript)           | Componentização, hooks, ecossistema                    |
| Estilos        | **Tailwind CSS v4** + `@tailwindcss/vite`    | Purge real em build, design tokens via CSS vars         |
| Ícones         | **react-icons** (fa, md, ri, etc.)           | Substitui Iconify CDN; tree-shakeable por ícone         |
| Roteamento     | **React Router v7** (lazy loading)           | SPA client-side, code-splitting por feature             |
| HTTP           | **axios**                                    | Interceptors, instância configurada com baseURL         |
| Gráficos       | **ECharts for React** (ou recharts)          | Substitui echarts CDN; wrapper React                    |
| PDF (client)   | **html2pdf.js** (mantido em public/)         | Geração de certificado no client como fallback          |
| Flip Book      | **react-pageflip** (ou raw StPageFlip)       | Substitui page-flip CDN para HQ                         |
| Acessibilidade | VLibras (script externo mantido)             | Widget governamental obrigatório                        |
| Backend        | **Python 3.12 + FastAPI**                    | API REST, validação Pydantic, async nativo              |
| DB Proxy       | **Power Automate** (chamado pelo FastAPI)     | Mantém o fluxo existente — chamadas `httpx` server-side |
| ORM (futuro)   | **SQLAlchemy 2 + pyodbc (ODBC 18)**          | Acesso direto ao Fabric quando disponível               |
| Auth (futuro)  | **Keycloak** → gov.br                        | OIDC; token JWT validado pelo FastAPI                   |

---

## 2. Decisões Arquiteturais

### 2.1 Feature-Based Architecture

Cada feature (domínio de negócio) contém **tudo** que precisa: componentes, hooks, serviços, constantes.
Nenhuma feature importa de outra feature — apenas de `shared/`.

```
src/features/<feature>/
├── components/         # Componentes exclusivos da feature
├── hooks/              # Hooks exclusivos da feature
├── services/           # Chamadas API da feature (usa lib/api.js)
├── constants/          # Constantes exclusivas
├── utils/              # Helpers exclusivos
└── <Feature>Page.jsx   # Página-raiz (registrada no router)
```

### 2.2 Shared = Infraestrutura Reutilizável

```
src/shared/             # SÓ código usado por 2+ features
├── components/         # Componentes genéricos (Button, Modal, Card...)
├── hooks/              # Hooks genéricos (useFocusTrap, useReducedMotion...)
├── contexts/           # React Contexts globais
├── utils/              # Funções puras utilitárias
└── constants/          # Constantes globais
```

### 2.3 Power Automate no Backend

O Power Automate **não é removido**. Ele continua sendo o proxy de execução SQL para o Microsoft Fabric.
A diferença é que agora quem chama o Flow é o **FastAPI (server-side)**, e não mais o browser.

```
Browser  →  FastAPI endpoint  →  Power Automate Flow  →  MS Fabric SQL
                                    (httpx POST)
```

Isso elimina SQL no frontend e centraliza validação, rate-limiting e segurança no backend.

### 2.4 Autenticação — Visitante por Padrão

- **Ao abrir a página, o usuário entra como Visitante** (sem modal bloqueante).
- Visitante pode navegar livremente: ler HQ, ver balanço, explorar dados.
- Para **salvar progresso, jogar e gerar certificado**, é necessário se identificar.
- O login é voluntário, disparado por ação do usuário (botão no header).
- **MVP atual:** login por CPF + nome (como hoje, mas via FastAPI).
- **Futuro:** login via gov.br usando Keycloak como Identity Broker (OIDC).

---

## 3. Estrutura Completa — Frontend (`site/`)

> **Todo arquivo listado abaixo será criado.** Arquivos marcados com `★` são críticos.

```
site/
├── .env                                 # VITE_API_URL=http://localhost:8000/api
├── .env.production                      # VITE_API_URL=https://api.balanco.mg.gov.br/api
├── index.html                        ★  # Entry point Vite (<div id="root">)
├── package.json                      ★
├── vite.config.js                    ★
├── tailwind.config.js                ★  # Design tokens (cores MG, breakpoints)
├── postcss.config.js
├── .eslintrc.cjs                        # ESLint config (sem TS)
├── .prettierrc
│
├── public/
│   ├── favicon.ico
│   ├── robots.txt
│   ├── manifest.json                    # PWA manifest (futuro)
│   ├── pdf/                             # PDFs estáticos para download
│   ├── json/
│   │   ├── historia.json                # Dados das páginas da HQ
│   │   ├── noticias.json                # Notícias estáticas
│   │   └── execucaoOrcamentariaMG2025.json
│   └── images/
│       ├── logo-govmg.png
│       ├── logo-sef.png
│       ├── logo-tesouro.png
│       ├── logo-sccg.png
│       ├── balanco-cidadao-capa-2024.png
│       ├── balanco-cidadao-capa-2025.png
│       ├── historia/                    # 1.png a 36.png (páginas da HQ)
│       ├── balanco/                     # Imagens do conteúdo didático
│       ├── ods/                         # Ícones ODS
│       └── certificado_base.png         # Template do certificado
│
└── src/
    ├── main.jsx                      ★  # ReactDOM.createRoot, Providers, VLibras init
    ├── App.jsx                       ★  # <BrowserRouter> + <AppRoutes> + <MainLayout>
    │
    │── assets/
    │   └── fonts/
    │       ├── nunito/                  # Nunito (corpo)
    │       │   ├── Nunito-wght.ttf
    │       │   ├── nunito-latin-400-normal.woff2
    │       │   └── nunito-latin-400-normal.woff
    │       ├── fredoka/                 # Fredoka (títulos)
    │       │   ├── Fredoka-wdth-wght.ttf
    │       │   ├── fredoka-latin-400-normal.woff2
    │       │   └── fredoka-latin-400-normal.woff
    │       ├── caveat-brush/            # Caveat Brush (decorativa)
    │       │   ├── CaveatBrush-Regular.ttf
    │       │   ├── caveat-brush-latin-400-normal.woff2
    │       │   └── caveat-brush-latin-400-normal.woff
    │       └── opendyslexic/            # OpenDyslexic (a11y)
    │           ├── OpenDyslexic-Regular.otf
    │           ├── OpenDyslexic-Bold.otf
    │           ├── opendyslexic-latin-400-normal.woff2
    │           └── opendyslexic-latin-700-normal.woff2
    │
    ├── styles/
    │   ├── global.css                ★  # @import "tailwindcss"; @font-face; CSS a11y
    │   ├── themes.css                   # Variáveis CSS para temas (daltonismo, contraste)
    │   └── animations.css               # Keyframes (reveal, fadeRise, confetti)
    │
    ├── lib/                          ★  # Infraestrutura de baixo nível
    │   ├── api.js                    ★  # Instância axios (baseURL, interceptors, token)
    │   ├── auth.js                   ★  # getToken, setToken, clearToken, isAuthenticated
    │   └── a11yUtils.js                 # generateId(), announceToSR(), focusElement()
    │
    ├── shared/                       ★  # Código reutilizado por 2+ features
    │   ├── constants/
    │   │   ├── routes.js             ★  # Enum de todas as rotas (ROUTES.HOME, ROUTES.JOGOS...)
    │   │   ├── gameEngines.js           # Mapa slug→componente dos 7 engines
    │   │   └── stars.js                 # calculateStars(), STAR_THRESHOLDS
    │   │
    │   ├── contexts/
    │   │   ├── AuthContext.jsx       ★  # { user, isGuest, login, logout, identify }
    │   │   ├── AccessibilityContext.jsx ★ # { fontScale, highContrast, theme, toggle... }
    │   │   └── GameProgressContext.jsx  # { trailProgress, phaseProgress, refresh }
    │   │
    │   ├── hooks/
    │   │   ├── useAuth.js            ★  # useContext(AuthContext) shortcut
    │   │   ├── useAccessibility.js      # useContext(AccessibilityContext) shortcut
    │   │   ├── useGameProgress.js       # useContext(GameProgressContext) shortcut
    │   │   ├── useFocusTrap.js          # Prende TAB dentro de modais (WCAG 2.1)
    │   │   ├── useReducedMotion.js      # Detecta prefers-reduced-motion
    │   │   ├── useLocalStorage.js       # Leitura/escrita tipada em localStorage
    │   │   └── useClickOutside.js       # Fecha dropdowns/menus ao clicar fora
    │   │
    │   ├── components/
    │   │   ├── a11y/
    │   │   │   ├── A11yToolbar.jsx   ★  # Barra de acessibilidade (A+, A-, Contraste, Fonte...)
    │   │   │   ├── A11yMorePanel.jsx    # Painel expandido (OpenDyslexic, espaçamento, tema)
    │   │   │   ├── SkipLink.jsx      ★  # "Pular para o conteúdo principal"
    │   │   │   ├── ScreenReaderOnly.jsx # Wrapper sr-only
    │   │   │   ├── VLibrasWidget.jsx    # Carrega script VLibras e exibe widget
    │   │   │   └── ThemePicker.jsx      # Seletor de tema (daltonismo, acromático)
    │   │   │
    │   │   ├── ui/
    │   │   │   ├── Button.jsx        ★  # Botão com focus-visible, aria-label, variantes
    │   │   │   ├── IconButton.jsx       # Botão circular para ícones
    │   │   │   ├── Modal.jsx         ★  # Dialog com ESC, Focus Trap, overlay
    │   │   │   ├── Card.jsx             # Card base (usado em trail, news, etc.)
    │   │   │   ├── Accordion.jsx        # Accordion acessível (aria-expanded)
    │   │   │   ├── LoadingSpinner.jsx   # Spinner com aria-live="polite"
    │   │   │   ├── LoadingSkeleton.jsx  # Placeholder skeleton
    │   │   │   ├── ProgressBar.jsx      # Barra de progresso acessível
    │   │   │   ├── StarRating.jsx       # Exibe 1-3 estrelas (com aria-label)
    │   │   │   ├── StatusSeal.jsx       # Selo de status (check/x/lock/spinner)
    │   │   │   ├── Tooltip.jsx          # Tooltip posicional (hover/focus)
    │   │   │   └── ErrorBoundary.jsx ★  # Catch de erros React com fallback UI
    │   │   │
    │   │   └── layout/
    │   │       ├── MainLayout.jsx    ★  # <SkipLink> + <Header> + <main> + <Footer> + <VLibras>
    │   │       ├── Header.jsx        ★  # Barra institucional (logos, a11y toolbar, perfil)
    │   │       ├── Footer.jsx        ★  # Footer institucional (logos, links, redes sociais)
    │   │       ├── ProfileMenu.jsx      # Dropdown do perfil (login/logout/excluir dados)
    │   │       ├── BackToTop.jsx        # Botão "voltar ao topo"
    │   │       └── AnimatedBackground.jsx # Panorama Canvas (céu, nuvens, pássaros)
    │   │
    │   └── utils/
    │       ├── formatters.js            # maskCpf(), formatCurrency(), formatDate()
    │       ├── validators.js            # isValidCpf(), isValidGuid()
    │       └── scoring.js               # calculateStars(), clampScore(), starsFromScore()
    │
    ├── routes/
    │   └── AppRoutes.jsx             ★  # React Router config com lazy() por feature
    │
    └── features/                     ★  # DOMÍNIOS DE NEGÓCIO

        ├── home/                        # ══════ PÁGINA 1: MAPA DA TRILHA ══════
        │   ├── components/
        │   │   ├── TreasureMap.jsx   ★  # Mapa SVG interativo (Tab + Enter nos pontos)
        │   │   ├── TrailCard.jsx        # Card de cada trilha com StatusSeal
        │   │   ├── MissionBox.jsx       # Caixa de missão do dia
        │   │   └── TrophyEnd.jsx        # Troféu final (link para conquistas)
        │   ├── hooks/
        │   │   └── useTrailProgress.js  # Busca e sincroniza progresso das trilhas
        │   ├── services/
        │   │   └── homeService.js       # getMainTrailProgress()
        │   └── HomePage.jsx          ★

        ├── historia/                    # ══════ PÁGINA 2: HQ (HISTÓRIA) ══════
        │   ├── components/
        │   │   ├── FlipBook.jsx      ★  # Leitor de HQ com page-flip
        │   │   ├── ComicPage.jsx        # Página individual da HQ (img + altText)
        │   │   └── ReadingProgress.jsx  # Barra de progresso de leitura
        │   ├── hooks/
        │   │   └── useReadingProgress.js # Save/load progresso de leitura
        │   ├── services/
        │   │   └── historiaService.js   # getReadingProgress(), saveReadingProgress()
        │   └── HistoriaPage.jsx      ★

        ├── balanco/                     # ══════ PÁGINA 3: ENTENDENDO O BALANÇO ══════
        │   ├── components/
        │   │   ├── DidacticSection.jsx  # Seção de conteúdo com ícone e texto
        │   │   ├── ContentAccordion.jsx # Accordion acessível para tópicos
        │   │   ├── Glossary.jsx         # Glossário de termos fiscais
        │   │   ├── ImageGallery.jsx     # Galeria de imagens culturais de MG
        │   │   └── ReadingTracker.jsx   # Marca trilha como lida ao final
        │   ├── services/
        │   │   └── balancoService.js    # markTrailCompleted()
        │   └── BalancoPage.jsx       ★

        ├── balanco-dados/               # ══════ PÁGINA 4: DADOS & DASHBOARD ══════
        │   ├── components/
        │   │   ├── ChartWithTable.jsx ★ # Gráfico ECharts + <table> sr-only
        │   │   ├── MapaRegional.jsx     # Mapa de MG por região (SVG ou GeoJSON)
        │   │   ├── OdsChart.jsx         # Gráfico de execução por ODS
        │   │   ├── ResumoCards.jsx      # Cards resumo (programas, ações, executado)
        │   │   ├── NewsCard.jsx         # Card de notícia (h2→h3 hierarquia)
        │   │   └── DataFilter.jsx       # Filtros de ano/região
        │   ├── hooks/
        │   │   └── useDadosBalanco.js   # Busca e cacheia dados SIGPLAN
        │   ├── services/
        │   │   └── dadosService.js      # getDadosBalanco(), getExecucaoPorRegiao()...
        │   └── DadosPage.jsx         ★

        ├── simulador/                   # ══════ PÁGINA 5: SIMULADOR DO ORÇAMENTO ══════
        │   ├── components/
        │   │   ├── BudgetSlider.jsx     # Slider de alocação por área
        │   │   ├── BudgetSummary.jsx    # Resumo da distribuição
        │   │   └── SimuladorResult.jsx  # Comparação com orçamento real
        │   ├── services/
        │   │   └── simuladorService.js  # getDadosReais()
        │   └── SimuladorPage.jsx     ★

        ├── trilha-jogos/                # ══════ PÁGINA 6: MAPA DOS JOGOS ══════
        │   ├── components/
        │   │   ├── GameMap.jsx       ★  # Mapa de fases (SVG, navegável por teclado)
        │   │   ├── SectionCard.jsx      # Card de seção temática com medalha
        │   │   ├── PhaseNode.jsx        # Nó de fase (locked/available/completed)
        │   │   └── ProgressSummary.jsx  # Resumo: fases, estrelas, medalhas
        │   ├── hooks/
        │   │   └── useGameMap.js        # Busca e organiza dados do mapa
        │   ├── services/
        │   │   └── trilhaService.js     # getGameMap(), getUserProgress()
        │   └── TrilhaJogosPage.jsx   ★

        ├── jogo/                        # ══════ PÁGINA 7: MOTOR DE JOGOS ══════
        │   ├── components/
        │   │   ├── GameShell.jsx     ★  # Container: carrega fase, engine, GameFinish
        │   │   ├── GameFinish.jsx    ★  # Tela de resultado (score, estrelas, confetti)
        │   │   ├── ConfettiCanvas.jsx   # Canvas de confetti (prefers-reduced-motion)
        │   │   └── QuestionFeedback.jsx # Feedback visual de acerto/erro
        │   ├── engines/              ★  # UM componente React por tipo de jogo
        │   │   ├── QuizEngine.jsx    ★  # Quiz de múltipla escolha
        │   │   ├── SwipeEngine.jsx      # Verdadeiro/Falso (swipe cards)
        │   │   ├── WordSearchEngine.jsx # Caça-palavras
        │   │   ├── CrosswordEngine.jsx  # Cruzadinha
        │   │   ├── MatchEngine.jsx      # Liga conceitos (drag-and-drop)
        │   │   ├── SortEngine.jsx       # Ordem correta (reordenar)
        │   │   └── index.js          ★  # Mapa: { 'quiz': QuizEngine, 'swipe': SwipeEngine... }
        │   ├── hooks/
        │   │   ├── useGamePhase.js      # Carrega dados da fase (perguntas, config)
        │   │   └── useGameTimer.js      # Cronômetro da partida
        │   ├── services/
        │   │   └── jogoService.js       # getQuestions(), registerAttempt(), getNextPhase()
        │   └── JogoPage.jsx          ★

        ├── conquistas/                  # ══════ PÁGINA 8: CONQUISTAS & CERTIFICADO ══════
        │   ├── components/
        │   │   ├── BadgeList.jsx        # Lista de badges/achievements
        │   │   ├── BadgeCard.jsx        # Card individual de achievement
        │   │   ├── CertificateForm.jsx ★ # Formulário com <label> explícito (eMAG)
        │   │   └── CertificatePreview.jsx # Preview do certificado gerado
        │   ├── services/
        │   │   └── conquistaService.js  # getAchievements(), issueCertificate(), verify()
        │   └── ConquistasPage.jsx    ★

        ├── creditos/                    # ══════ PÁGINA 9: CRÉDITOS & SAIBA MAIS ══════
        │   ├── components/
        │   │   ├── DocumentLink.jsx     # Link PDF (avisa nova aba + peso)
        │   │   ├── TeamSection.jsx      # Seção de equipe
        │   │   └── ReferenceList.jsx    # Lista de referências
        │   ├── services/
        │   │   └── creditosService.js   # markTrailCompleted()
        │   └── CreditosPage.jsx      ★

        ├── auth/                        # ══════ AUTENTICAÇÃO ══════
        │   ├── components/
        │   │   ├── LoginModal.jsx    ★  # Modal de identificação (CPF + Nome)
        │   │   ├── GuestBanner.jsx      # Banner sutil "Identifique-se para salvar"
        │   │   └── DeleteAccountModal.jsx # Modal de exclusão de dados (LGPD)
        │   ├── services/
        │   │   └── authService.js    ★  # login(), loginAsGuest(), logout(), deleteAccount()
        │   └── hooks/
        │       └── useRequireAuth.js    # Redireciona para login se ação exige auth

        ├── admin/                       # ══════ ADMINISTRAÇÃO ══════
        │   ├── components/
        │   │   ├── SectionManager.jsx   # CRUD de seções de jogos
        │   │   ├── PhaseEditor.jsx      # CRUD de fases
        │   │   ├── QuestionEditor.jsx   # CRUD de questões
        │   │   ├── QuestionLinker.jsx   # Vincular/desvincular questões a fases
        │   │   ├── ReusableQuestionPicker.jsx # Busca questões reaproveitáveis
        │   │   └── HistoriaConfig.jsx   # Configuração da história/HQ
        │   ├── services/
        │   │   └── adminService.js   ★  # saveSection(), savePhase(), saveQuestion()...
        │   └── AdminPage.jsx         ★

        └── not-found/                   # ══════ 404 ══════
            └── NotFoundPage.jsx
```

### Total de arquivos a criar no frontend: ~120 arquivos

---

## 4. Estrutura Completa — Backend (`backend/`)

```
backend/
├── .env                              ★  # FLOW_URL, FABRIC_WAREHOUSE, FABRIC_DATABASE, SECRET_KEY
├── .env.example                         # Template sem segredos
├── requirements.txt                  ★
├── pyproject.toml                       # Metadata do projeto
├── Dockerfile                           # Container para deploy
├── .dockerignore
│
└── app/
    ├── __init__.py
    ├── main.py                       ★  # FastAPI(), routers, CORS, lifespan
    │
    ├── core/                         ★  # INFRAESTRUTURA CENTRAL
    │   ├── __init__.py
    │   ├── config.py                 ★  # BaseSettings (Pydantic) — variáveis de ambiente
    │   ├── power_automate.py         ★  # Cliente httpx para chamar o Flow (SQL proxy)
    │   ├── security.py                  # Hash CPF, JWT futuro, get_current_user dependency
    │   ├── dependencies.py              # Depends: get_db_client, get_optional_user
    │   └── exceptions.py               # HTTPException customizadas (UserNotFound, etc.)
    │
    ├── features/                     ★  # DOMÍNIOS (espelho do frontend)
    │   ├── __init__.py
    │   │
    │   ├── auth/                        # ── Autenticação ──
    │   │   ├── __init__.py
    │   │   ├── router.py             ★  # POST /api/auth/login
    │   │   │                            # POST /api/auth/guest
    │   │   │                            # POST /api/auth/logout
    │   │   │                            # DELETE /api/auth/account
    │   │   ├── schemas.py               # LoginRequest, GuestRequest, UserResponse, TokenResponse
    │   │   └── service.py            ★  # create_or_get_user(), delete_user_data()
    │   │
    │   ├── trails/                      # ── Trilhas e Leitura ──
    │   │   ├── __init__.py
    │   │   ├── router.py             ★  # GET  /api/trails/progress
    │   │   │                            # GET  /api/trails/reading/{slug}
    │   │   │                            # POST /api/trails/reading
    │   │   │                            # POST /api/trails/{slug}/complete
    │   │   ├── schemas.py               # TrailProgress, ReadingProgressIn, ReadingProgressOut
    │   │   └── service.py            ★  # get_trail_progress(), save_reading(), complete_trail()
    │   │
    │   ├── balanco_dados/               # ── Dashboard (SIGPLAN) ──
    │   │   ├── __init__.py
    │   │   ├── router.py             ★  # GET /api/dados/resumo
    │   │   │                            # GET /api/dados/regioes
    │   │   │                            # GET /api/dados/municipios
    │   │   │                            # GET /api/dados/ods
    │   │   │                            # GET /api/dados/populacao
    │   │   ├── schemas.py               # ResumoResponse, RegiaoResponse, OdsResponse...
    │   │   └── service.py            ★  # Queries via power_automate + IBGE API
    │   │
    │   ├── games/                       # ── Jogos ──
    │   │   ├── __init__.py
    │   │   ├── router.py             ★  # GET  /api/games/map
    │   │   │                            # GET  /api/games/progress
    │   │   │                            # GET  /api/games/phases/{id}/questions
    │   │   │                            # GET  /api/games/phases/{id}/next
    │   │   │                            # POST /api/games/phases/{id}/attempt
    │   │   ├── schemas.py               # GameMapItem, QuestionOut, AttemptIn, AttemptOut
    │   │   └── service.py            ★  # Validação de score server-side
    │   │
    │   ├── achievements/                # ── Conquistas ──
    │   │   ├── __init__.py
    │   │   ├── router.py                # GET /api/achievements
    │   │   ├── schemas.py               # AchievementOut
    │   │   └── service.py
    │   │
    │   ├── certificates/                # ── Certificados ──
    │   │   ├── __init__.py
    │   │   ├── router.py             ★  # POST /api/certificates/generate
    │   │   │                            # GET  /api/certificates/status
    │   │   │                            # GET  /api/certificates/verify/{code}
    │   │   ├── schemas.py               # CertificateRequest, CertificateOut, VerifyOut
    │   │   ├── service.py            ★  # Geração de PDF com ReportLab
    │   │   └── templates/
    │   │       └── certificado_base.png # Template visual do certificado
    │   │
    │   └── admin/                       # ── Administração ──
    │       ├── __init__.py
    │       ├── router.py             ★  # POST   /api/admin/sections
    │       │                            # DELETE  /api/admin/sections/{id}
    │       │                            # PATCH   /api/admin/sections/{id}/order
    │       │                            # POST    /api/admin/phases
    │       │                            # POST    /api/admin/questions
    │       │                            # POST    /api/admin/phases/{id}/questions
    │       │                            # DELETE  /api/admin/phase-questions/{id}
    │       │                            # PATCH   /api/admin/phase-questions/{id}/order
    │       │                            # GET     /api/admin/questions/reusable
    │       ├── schemas.py               # SectionIn, PhaseIn, QuestionIn...
    │       └── service.py            ★
    │
    └── utils/
        ├── __init__.py
        ├── sql_helpers.py               # sql_string(), sql_guid(), clamp_int(), parse_rows()
        └── pdf_generator.py             # Funções auxiliares para manipulação de PDF/Fontes
```

### Total de arquivos a criar no backend: ~45 arquivos

---

## 5. Mapeamento de Rotas (MPA → SPA)

| Página MPA atual                     | Rota SPA React          | Feature           | Lazy Load |
| ------------------------------------ | ----------------------- | ----------------- | --------- |
| `src/pages/home/`                    | `/`                     | `home`            | Não       |
| `src/pages/historia/`               | `/historia`             | `historia`        | Sim       |
| `src/pages/balanco/`                | `/balanco`              | `balanco`         | Sim       |
| `src/pages/balanco_dados/`          | `/dados`                | `balanco-dados`   | Sim       |
| `src/pages/simulador/`             | `/simulador`            | `simulador`       | Sim       |
| `src/pages/trilha-jogos/`          | `/jogos`                | `trilha-jogos`    | Sim       |
| `src/pages/jogo/?phase=...`        | `/jogos/:phaseId`       | `jogo`            | Sim       |
| `src/pages/conquistas/`            | `/conquistas`           | `conquistas`      | Sim       |
| `src/pages/creditos/`              | `/creditos`             | `creditos`        | Sim       |
| `src/pages/configuracao-jogos/`    | `/admin`                | `admin`           | Sim       |
| `src/pages/configuracao-historia/` | `/admin/historia`       | `admin`           | Sim       |
| `src/pages/not-found/`             | `*`                     | `not-found`       | Sim       |

---

## 6. Migração da Camada de API

### 6.1 `api.js` (875 linhas) → FastAPI endpoints

O SQL inline do `window.BC_API` será movido para `app/features/*/service.py`.
O frontend chamará endpoints REST via axios.

| `window.BC_API.*` (atual)               | Endpoint FastAPI                              | Método |
| ---------------------------------------- | --------------------------------------------- | ------ |
| `requestSql(sql)`                        | ❌ **Removido** — nunca expor SQL bruto       | —      |
| `getMainTrailProgress(userId)`           | `/api/trails/progress`                        | GET    |
| `getReadingProgress(userId, opts)`       | `/api/trails/reading/{slug}`                  | GET    |
| `saveReadingProgress(userId, opts)`      | `/api/trails/reading`                         | POST   |
| `markMainTrailCompleted(userId, slug)`   | `/api/trails/{slug}/complete`                 | POST   |
| `completeMainTrail(userId, slug)`        | `/api/trails/{slug}/complete`                 | POST   |
| `getGameMap(userId)`                     | `/api/games/map`                              | GET    |
| `getNextPhaseForPhase(userId, id)`       | `/api/games/phases/{id}/next`                 | GET    |
| `getQuestionsForPhase(id, opts)`         | `/api/games/phases/{id}/questions`            | GET    |
| `registerGameAttempt(userId, id, data)`  | `/api/games/phases/{id}/attempt`              | POST   |
| `getUserProgress(userId)`                | `/api/games/progress`                         | GET    |
| `getAchievements(userId)`                | `/api/achievements`                           | GET    |
| `issueCertificate(userId, name, yr)`     | `/api/certificates/generate`                  | POST   |
| `getCertificateStatus(userId)`           | `/api/certificates/status`                    | GET    |
| `verifyCertificate(code)`                | `/api/certificates/verify/{code}`             | GET    |
| `saveGamePhase(phase)`                   | `/api/admin/phases`                           | POST   |
| `saveQuestion(q)`                        | `/api/admin/questions`                        | POST   |
| `linkQuestionToPhase(p, q, o)`           | `/api/admin/phases/{id}/questions`            | POST   |
| `unlinkQuestionFromPhase(id)`            | `/api/admin/phase-questions/{id}`             | DELETE |
| `adminSaveSection(s)`                    | `/api/admin/sections`                         | POST   |
| `adminDeactivateSection(id)`             | `/api/admin/sections/{id}`                    | DELETE |
| `adminMoveSection(id, dir)`              | `/api/admin/sections/{id}/order`              | PATCH  |
| `adminMovePhaseQuestion(id, dir)`        | `/api/admin/phase-questions/{id}/order`       | PATCH  |
| `adminListReusableQuestions(...)`         | `/api/admin/questions/reusable`               | GET    |

### 6.2 `authService.js` (214 linhas) → FastAPI auth

| `window.BC_AUTH.*` (atual)              | Endpoint FastAPI                              | Método |
| ---------------------------------------- | --------------------------------------------- | ------ |
| `createOrGetUser(cpf, nome)`             | `/api/auth/login`                             | POST   |
| `getUserByPublicId(id)`                  | (interno, usado pelo token)                   | —      |
| `deleteUserData(id)`                     | `/api/auth/account`                           | DELETE |
| `login(cpf, nome)`                       | `/api/auth/login`                             | POST   |
| `logout()`                               | `/api/auth/logout`                            | POST   |
| Visitante (CPF aleatório)                | `/api/auth/guest`                             | POST   |

### 6.3 `sigplanService.js` (183 linhas) → FastAPI dados

| `window.SIGPLAN_SERVICE.*`               | Endpoint FastAPI                              | Método |
| ---------------------------------------- | --------------------------------------------- | ------ |
| `getResumo()`                            | `/api/dados/resumo`                           | GET    |
| `getExecucaoPorRegiao()`                | `/api/dados/regioes`                          | GET    |
| `getMunicipiosPorRegiao()`              | `/api/dados/municipios`                       | GET    |
| `getExecucaoPorOds()`                   | `/api/dados/ods`                              | GET    |
| `getPopulacaoMunicipios()`              | `/api/dados/populacao`                        | GET    |

### 6.4 Instância Axios (novo `lib/api.js`)

```js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Interceptor: anexa token se autenticado
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('bc_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Interceptor: logout automático em 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('bc_token');
      window.dispatchEvent(new CustomEvent('bc:session-expired'));
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

## 7. Migração dos Componentes Shared

| Arquivo Vanilla JS atual                | Componente React novo                                     |
| ---------------------------------------- | --------------------------------------------------------- |
| `shared/layout/header.js` (194 linhas)  | `shared/components/layout/Header.jsx` + `ProfileMenu.jsx` |
| `shared/layout/footer.js` (296 linhas)  | `shared/components/layout/Footer.jsx`                     |
| `shared/layout/background.js` (718 linhas) | `shared/components/layout/AnimatedBackground.jsx`      |
| `shared/accessibility/a11y.js` (2175 linhas) | `AccessibilityContext.jsx` + `A11yToolbar.jsx` + `A11yMorePanel.jsx` + `ThemePicker.jsx` + `SkipLink.jsx` |
| `shared/accessibility/acessibility.js`  | (Conteúdo mesclado no a11y acima)                         |
| `shared/components/gameFinish.js` (234 linhas) | `features/jogo/components/GameFinish.jsx` + `ConfettiCanvas.jsx` |
| `shared/services/api.js` (875 linhas)   | `lib/api.js` (axios) + todos os `services/*.js` por feature |
| `shared/services/authService.js` (214 linhas) | `features/auth/services/authService.js` + `AuthContext.jsx` |
| `shared/services/sigplanService.js` (183 linhas) | `features/balanco-dados/services/dadosService.js` |
| `shared/styles/fonts.css`               | `styles/global.css` (@font-face integrado)                |

---

## 8. Migração dos 7 Engines de Jogo

| Engine slug     | Arquivo Vanilla atual                  | Componente React novo                      |
| --------------- | -------------------------------------- | ------------------------------------------ |
| `quiz`          | `pages/jogo/types/quiz.js`             | `features/jogo/engines/QuizEngine.jsx`     |
| `swipe`         | `pages/jogo/types/swipe.js`            | `features/jogo/engines/SwipeEngine.jsx`    |
| `caca-palavras` | `pages/jogo/types/caca-palavras.js`    | `features/jogo/engines/WordSearchEngine.jsx` |
| `cruzadinha`    | `pages/jogo/types/cruzadinha.js`       | `features/jogo/engines/CrosswordEngine.jsx` |
| `flow`          | `pages/jogo/types/flow.js`             | `features/jogo/engines/MatchEngine.jsx`    |
| `ordem-correta` | `pages/jogo/types/ordem-correta.js`    | `features/jogo/engines/SortEngine.jsx`     |
| `simulador`     | `pages/simulador/`                     | `features/simulador/`                      |

O `GameShell.jsx` resolverá o engine dinamicamente:
```js
import { ENGINES } from './engines';

function GameShell({ phase }) {
  const Engine = ENGINES[phase.engineSlug];
  if (!Engine) return <p>Motor de jogo não encontrado.</p>;
  return <Engine phase={phase} />;
}
```

---

## 9. Schema do Banco (Referência)

O schema `bc.*` no Microsoft Fabric permanece **inalterado**. 18 tabelas + 1 view:

| Tabela                           | Responsabilidade                    |
| -------------------------------- | ----------------------------------- |
| `bc.app_user`                    | Usuários (CPF hash, display_name)   |
| `bc.user_session`                | Sessões (futuro)                    |
| `bc.content_year`                | Ano fiscal do conteúdo              |
| `bc.main_trail`                  | 4 trilhas principais                |
| `bc.content_page`                | Páginas de conteúdo (leitura)       |
| `bc.reference_link`              | Links de referência                 |
| `bc.game_section`                | 4 seções de jogos                   |
| `bc.game_engine`                 | 7 tipos de motor de jogo            |
| `bc.game_phase`                  | 16 fases de jogo                    |
| `bc.question_bank`               | Banco de questões                   |
| `bc.phase_question`              | N:N fase ↔ questão                  |
| `bc.user_main_trail_progress`    | Progresso do usuário nas trilhas    |
| `bc.user_content_progress`       | Progresso de leitura                |
| `bc.user_phase_progress`         | Progresso nas fases de jogo         |
| `bc.game_attempt`                | Registro de cada tentativa          |
| `bc.section_medal_progress`      | Medalhas por seção                  |
| `bc.achievement_definition`      | 10 conquistas definidas             |
| `bc.user_achievement`            | Conquistas do usuário               |
| `bc.certificate_issue`           | Certificados emitidos               |
| `bc.v_phase_catalog` (view)      | Catálogo completo de fases          |

---

## 10. core/power_automate.py — Cliente do Flow

```python
import httpx
from app.core.config import settings

async def execute_sql(sql: str, database: str | None = None) -> list[dict]:
    """Envia SQL para o Power Automate Flow e retorna as linhas."""
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            settings.FLOW_URL,
            json={
                "warehouse": settings.FABRIC_WAREHOUSE,
                "database": database or settings.FABRIC_DATABASE,
                "sql": sql,
            },
        )
        response.raise_for_status()
        payload = response.json()

    # Normaliza o formato de resposta do Flow
    if isinstance(payload, list):
        return payload
    return (
        payload.get("rows")
        or payload.get("ResultSets", {}).get("Table1")
        or payload.get("body", {}).get("ResultSets", {}).get("Table1")
        or []
    )
```

---

## 11. Fluxo de Autenticação

```
┌─────────────────────────────────────────────────────────┐
│                    VISITANTE (padrão)                    │
│                                                         │
│  Abre o site → entra como visitante automaticamente     │
│  Pode: navegar, ler HQ, ver dados, explorar             │
│  Não pode: salvar progresso, jogar, certificar          │
│                                                         │
│  ┌──────────────────────────────────┐                   │
│  │ Clica "Identificar-se" no header │                   │
│  └──────────┬───────────────────────┘                   │
│             ▼                                           │
│  ┌──────────────────────────────────┐                   │
│  │      MVP: CPF + Nome             │                   │
│  │      Futuro: gov.br (Keycloak)   │                   │
│  └──────────┬───────────────────────┘                   │
│             ▼                                           │
│  POST /api/auth/login                                   │
│  → FastAPI valida, chama Power Automate                 │
│  → Cria/busca usuário no bc.app_user                    │
│  → Retorna { publicUserId, displayName, token }         │
│  → Frontend salva token em localStorage                 │
│  → AuthContext atualiza, UI reflete                     │
└─────────────────────────────────────────────────────────┘
```

---

## 12. Passos de Execução

### Fase 1 — Scaffold do Frontend
1. `npm create vite@latest site -- --template react`
2. `npm install react-router-dom axios react-icons echarts echarts-for-react`
3. `npm install -D tailwindcss @tailwindcss/vite`
4. Configurar `vite.config.js`, `tailwind.config.js`, `postcss.config.js`
5. Criar `global.css` com `@import "tailwindcss"` + `@font-face`
6. Criar `main.jsx` + `App.jsx` + `AppRoutes.jsx`
7. Criar `lib/api.js` + `lib/auth.js` + `lib/a11yUtils.js`
8. Criar contexts: `AuthContext`, `AccessibilityContext`, `GameProgressContext`
9. Criar hooks shared: `useAuth`, `useAccessibility`, `useFocusTrap`...
10. Criar componentes layout: `MainLayout`, `Header`, `Footer`
11. Criar componentes a11y: `A11yToolbar`, `SkipLink`, `VLibrasWidget`
12. Criar componentes ui: `Button`, `Modal`, `Card`, `StarRating`...

### Fase 2 — Scaffold do Backend
1. `python -m venv .venv`
2. `pip install fastapi uvicorn httpx pydantic pydantic-settings python-jose reportlab`
3. Criar `app/main.py` com CORS (localhost:5173)
4. Criar `app/core/config.py` (BaseSettings)
5. Criar `app/core/power_automate.py` (cliente httpx → Flow)
6. Criar `app/core/security.py` (hash CPF, JWT)
7. Implementar `features/auth/` (login, guest, logout, delete)
8. Implementar `features/trails/` (progress, reading, complete)
9. Implementar `features/games/` (map, questions, attempt, next)
10. Implementar `features/balanco_dados/` (resumo, regiões, ODS, população)
11. Implementar `features/achievements/` + `features/certificates/`
12. Implementar `features/admin/` (CRUD seções, fases, questões)
13. Testar: `uvicorn app.main:app --reload`

### Fase 3 — Migração Página a Página
1. **Home** → `HomePage.jsx` + `TreasureMap.jsx` (migra `script.js` 145 linhas)
2. **História** → `HistoriaPage.jsx` + `FlipBook.jsx` (migra HQ 36 páginas)
3. **Balanço** → `BalancoPage.jsx` + `ContentAccordion.jsx` (migra conteúdo didático)
4. **Dados** → `DadosPage.jsx` + `ChartWithTable.jsx` + `MapaRegional.jsx`
5. **Simulador** → `SimuladorPage.jsx` + `BudgetSlider.jsx`
6. **Trilha** → `TrilhaJogosPage.jsx` + `GameMap.jsx` + `SectionCard.jsx`
7. **Jogo** → `JogoPage.jsx` + `GameShell.jsx` + 6 engines
8. **Conquistas** → `ConquistasPage.jsx` + `CertificateForm.jsx`
9. **Créditos** → `CreditosPage.jsx` + `DocumentLink.jsx`
10. **Admin** → `AdminPage.jsx` + editores
11. **Auth** → `LoginModal.jsx` + `DeleteAccountModal.jsx`
12. **404** → `NotFoundPage.jsx`

### Fase 4 — Testes e Verificação
1. Acessibilidade: axe-core, navegação por teclado, VLibras
2. Responsividade: mobile-first (320px → 1440px)
3. Build de produção: `npm run build` → `dist/`
4. Performance: Lighthouse score ≥ 90

---

## 13. Dependências

### Frontend (`package.json`)
```json
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^7.0.0",
    "react-icons": "^5.4.0",
    "axios": "^1.7.0",
    "echarts": "^5.6.0",
    "echarts-for-react": "^3.0.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.4.0",
    "tailwindcss": "^4.0.0",
    "@tailwindcss/vite": "^4.0.0",
    "vite": "^6.0.0",
    "eslint": "^9.0.0",
    "prettier": "^3.4.0"
  }
}
```

### Backend (`requirements.txt`)
```
fastapi>=0.115.0
uvicorn[standard]>=0.34.0
httpx>=0.28.0
pydantic>=2.10.0
pydantic-settings>=2.7.0
python-jose[cryptography]>=3.3.0
reportlab>=4.2.0
python-multipart>=0.0.18
```

---

## 14. Vendored / CDN — O que muda

| Vendor atual (em `public/vendor/`)     | Destino na refatoração                            |
| -------------------------------------- | ------------------------------------------------- |
| `tailwindcss/tailwind.min.js` (CDN)    | ❌ Removido → `npm install tailwindcss` (build)   |
| `iconify/iconify-icon.min.js`          | ❌ Removido → `npm install react-icons`           |
| `echarts/echarts.min.js`               | ❌ Removido → `npm install echarts`               |
| `html2pdf/html2pdf.bundle.min.js`      | ✅ Mantido em `public/vendor/` (uso pontual)      |
| `stpageflip/page-flip.browser.js`      | ❌ Removido → importar como ESM ou usar wrapper   |
| `turf/turf.min.js`                     | Avaliar: se usado, `npm install @turf/turf`       |