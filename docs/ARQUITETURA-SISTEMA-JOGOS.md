# Arquitetura Geral do Sistema de Jogos

## Balanço Cidadão MG

**Status:** documentação-base para implementação  
**Escopo:** página unificada de jogos, motores ES Module, integração com API, acessibilidade, pontuação e finalização

---

## 1. Objetivo

O sistema utilizará uma única página para executar todas as fases de jogos. A página geral será responsável pelo ciclo externo da fase, enquanto módulos específicos implementarão o visual e as regras internas de cada modalidade.

A arquitetura deve permitir:

- reutilização da mesma estrutura de página;
- carregamento dinâmico do motor indicado pela API;
- separação entre interface geral, integração, acessibilidade e regras dos jogos;
- manutenção independente de cada modalidade;
- operação por teclado, mouse e toque;
- tutorial e regras de pontuação em todas as modalidades;
- persistência uniforme das tentativas;
- inclusão futura de novos motores.

---

## 2. Modalidades previstas

Motores atualmente previstos:

- `caca-palavras`;
- `cruzadinha`;
- `liga-conceitos`;
- `ordem-correta`;
- `swipe`;
- `quiz`;
- `wend`.

O antigo motor `simulador-orcamento` foi removido do escopo.

O motor `wend` ainda não possui regras funcionais, formato de dados ou sistema de pontuação definidos. Ele deve permanecer registrado como modalidade planejada, mas não poderá ser disponibilizado até possuir contrato funcional, requisitos de acessibilidade, tutorial e critérios de conclusão.

---

## 3. Estrutura de diretórios

Estrutura recomendada:

```text
src/pages/jogo/
├── index.html
├── script.js
├── core/
│   ├── app.js
│   ├── api-adapter.js
│   ├── engine-registry.js
│   ├── phase-loader.js
│   ├── phase-validator.js
│   ├── state-machine.js
│   ├── game-session.js
│   ├── score-manager.js
│   ├── timer-manager.js
│   └── errors.js
├── ui/
│   ├── loading-screen.js
│   ├── intro-screen.js
│   ├── tutorial-screen.js
│   ├── game-topbar.js
│   ├── feedback.js
│   ├── result-screen.js
│   ├── locked-screen.js
│   └── error-screen.js
├── accessibility/
│   ├── announcer.js
│   ├── focus-manager.js
│   ├── keyboard-manager.js
│   ├── motion-manager.js
│   ├── input-mode.js
│   └── accessibility-preferences.js
├── utils/
│   ├── dom.js
│   ├── json.js
│   ├── number.js
│   ├── timeout.js
│   └── shuffle.js
└── types/
    ├── caca-palavras.js
    ├── cruzadinha.js
    ├── liga-conceitos.js
    ├── ordem-correta.js
    ├── swipe.js
    ├── quiz.js
    └── wend.js
```

### 3.1. `index.html`

Contém somente a estrutura comum da página:

- pontos de montagem;
- regiões semânticas;
- região de anúncios;
- referências aos recursos compartilhados;
- carregamento do módulo principal.

Não deve conter elementos específicos de uma modalidade.

### 3.2. `script.js`

É o ponto de entrada ES Module. Inicializa a aplicação e delega as tarefas aos módulos de `core/`, `ui/` e `accessibility/`.

### 3.3. `core/`

Controla:

- carregamento e validação da fase;
- comunicação com a API;
- máquina de estados;
- sessão da partida;
- pontuação;
- tempo;
- carregamento e descarte dos motores;
- finalização e persistência.

### 3.4. `ui/`

Renderiza componentes compartilhados:

- loading;
- introdução;
- tutorial;
- topbar;
- feedback;
- tela de fase bloqueada;
- tela de erro;
- resultado final.

### 3.5. `accessibility/`

Centraliza:

- anúncios para tecnologias assistivas;
- gestão de foco;
- preferências de movimento;
- modos de entrada;
- comportamento global de teclado;
- preferências para fases com tempo.

### 3.6. `types/`

Cada arquivo contém apenas o motor de uma modalidade:

- normalização específica dos dados;
- estado interno;
- renderização da área jogável;
- interações;
- validação das jogadas;
- cálculo do resultado bruto;
- limpeza de listeners e recursos.

---

## 4. URL da fase

Todas as modalidades utilizarão a mesma rota:

```text
/jogo/?phase=<publicPhaseId>
```

Exemplo:

```text
/jogo/?phase=a083a645-f86b-4c42-a2e9-5fe2df671e13
```

O identificador deve ser obtido por:

```js
const phaseId = new URLSearchParams(location.search).get("phase");
```

A ausência do parâmetro deverá produzir a tela geral de erro com ação para retornar ao mapa.

---

## 5. Responsabilidades da camada geral

A camada geral deve:

1. ler o identificador da fase;
2. aguardar a identificação do participante;
3. consultar o mapa de jogos;
4. localizar e normalizar a fase;
5. validar se a fase existe e está disponível;
6. buscar e normalizar as questões;
7. importar o motor correspondente;
8. validar o contrato do motor;
9. renderizar introdução, tutorial e regras de pontuação;
10. iniciar e controlar a sessão;
11. atualizar topbar e progresso;
12. receber o resultado do motor;
13. impedir conclusão duplicada;
14. persistir a tentativa;
15. buscar a próxima fase;
16. renderizar a tela final;
17. destruir o motor ao reiniciar ou sair.

A camada geral não deve conter regras internas de quiz, swipe, ordenação, associação, caça-palavras ou cruzadinha.

---

## 6. Responsabilidades de cada motor

O motor deve:

- interpretar seus dados normalizados;
- validar se existem dados suficientes;
- montar o conteúdo dentro do contêiner fornecido;
- implementar as interações da modalidade;
- permitir operação completa por teclado;
- permitir operação por mouse e toque quando aplicável;
- fornecer alternativa a gestos de arrastar;
- atualizar o HUD por meio do contexto;
- emitir feedback pelo serviço geral;
- calcular a pontuação conforme sua regra;
- concluir por meio de `context.complete()`;
- remover listeners, timers, animações e elementos temporários.

O motor não deve:

- acessar diretamente `window.BC_API`;
- consultar o mapa;
- buscar a próxima fase;
- registrar tentativas;
- calcular estrelas;
- renderizar loading, bloqueio ou tela final;
- alterar a URL;
- recarregar a página;
- inserir dados não tratados da API em `innerHTML`.

---

## 7. Estados da aplicação

```js
const APP_STATES = Object.freeze({
  LOADING: "loading",
  LOCKED: "locked",
  INTRO: "intro",
  TUTORIAL: "tutorial",
  PLAYING: "playing",
  PAUSED: "paused",
  FINISHING: "finishing",
  FINISHED: "finished",
  ERROR: "error",
});
```

### 7.1. `loading`

Usado durante identificação, validação, busca de dados e importação do motor.

### 7.2. `locked`

Usado quando a fase estiver bloqueada. O motor não deve ser importado nem inicializado.

### 7.3. `intro`

Apresenta título, objetivo, pontuação e acesso ao tutorial.

### 7.4. `tutorial`

Apresenta instruções de teclado, mouse, toque, pontuação e tempo.

### 7.5. `playing`

A partida está ativa e o motor recebe interações.

### 7.6. `paused`

Usado durante tutorial reaberto, preferências ou interrupções controladas. Cronômetros devem ser pausados.

### 7.7. `finishing`

Bloqueia novas interações enquanto o sistema normaliza, salva e busca a próxima fase.

### 7.8. `finished`

Exibe o resultado e as ações finais.

### 7.9. `error`

Exibe um erro recuperável, mensagem objetiva e ação de retorno.

---

## 8. Fluxo da aplicação

```text
Entrada em /jogo/?phase=...
        ↓
Validação do parâmetro
        ↓
Identificação do participante
        ↓
Consulta ao mapa
        ↓
Validação da fase e do bloqueio
        ↓
Busca e normalização das questões
        ↓
Importação e validação do motor
        ↓
Introdução e tutorial
        ↓
Configuração de acessibilidade e tempo
        ↓
Início da sessão
        ↓
Execução do motor
        ↓
Conclusão padronizada
        ↓
Normalização da pontuação
        ↓
Persistência + busca da próxima fase
        ↓
Tela final
```

---

## 9. Registro de motores

O carregamento deve usar um registro fechado. O valor da API nunca deve ser interpolado diretamente em um caminho de importação.

```js
export const ENGINE_LOADERS = Object.freeze({
  "caca-palavras": () => import("../types/caca-palavras.js"),
  cruzadinha: () => import("../types/cruzadinha.js"),
  "liga-conceitos": () => import("../types/liga-conceitos.js"),
  "ordem-correta": () => import("../types/ordem-correta.js"),
  swipe: () => import("../types/swipe.js"),
  quiz: () => import("../types/quiz.js"),
  wend: () => import("../types/wend.js"),
});
```

Enquanto o `wend` não estiver definido, seu loader pode retornar um motor informativo indisponível para produção, ou o registro pode permanecer desabilitado por feature flag.

---

## 10. Contrato dos motores

Cada módulo deverá exportar `createGame`:

```js
export function createGame(context) {
  return {
    getMetadata,
    getTutorial,
    getAccessibility,
    mount,
    start,
    pause,
    resume,
    reset,
    destroy,
  };
}
```

Métodos obrigatórios:

- `getMetadata()`;
- `getTutorial()`;
- `getAccessibility()`;
- `mount()`;
- `start()`;
- `destroy()`.

Métodos recomendados:

- `pause()`;
- `resume()`;
- `reset()`.

### 10.1. Metadados

```js
function getMetadata() {
  return {
    type: "ordem-correta",
    title: "Ordem correta",
    icon: "fa-solid fa-layer-group",
    hasTimer: false,
  };
}
```

### 10.2. Tutorial

```js
function getTutorial() {
  return {
    title: "Como jogar",
    objective: "Organize os itens na sequência correta.",
    steps: [],
    inputMethods: [],
    scoring: {
      initialScore: 100,
      description: "A pontuação depende da quantidade de conferências.",
    },
  };
}
```

### 10.3. Declaração de acessibilidade

```js
function getAccessibility() {
  return {
    keyboard: {
      supported: true,
      instructions: [],
    },
    pointer: {
      supported: true,
      usesDrag: true,
      dragAlternative: true,
    },
    timed: false,
  };
}
```

---

## 11. Contexto fornecido ao motor

```js
const context = {
  container,
  phase,
  questions,
  config,
  signal,
  hud,
  feedback,
  timer,
  preferences,
  complete,
};
```

Estrutura esperada:

```js
{
  container: HTMLElement,
  phase: {
    publicPhaseId: string,
    phaseSlug: string,
    phaseTitle: string,
    phaseDescription: string,
    engineSlug: string,
    questionCount: number | null,
    passScore: number,
    maxScore: number,
    config: object
  },
  questions: [],
  config: {},
  signal: AbortSignal,
  hud: {
    setScore(value),
    setProgress(current, total),
    setMetric(label, value),
    announce(message)
  },
  feedback: {
    success(data),
    error(data),
    info(data),
    clear()
  },
  timer: {
    start(),
    pause(),
    resume(),
    disable(),
    getRemainingSeconds(),
    subscribe(callback)
  },
  preferences: {},
  complete(result)
}
```

---

## 12. Resultado padronizado

Todos os motores deverão finalizar por meio de:

```js
context.complete({
  score: 85,
  attemptsUsed: 2,
  hintsUsed: 0,
  correctCount: 8,
  totalCount: 10,
  answers: [],
  metrics: {},
});
```

Campos:

- `score`: pontuação bruta entre 0 e 100;
- `attemptsUsed`: tentativas internas da partida;
- `hintsUsed`: quantidade de dicas usadas;
- `correctCount`: respostas corretas;
- `totalCount`: total avaliado;
- `answers`: resumo serializável das respostas;
- `metrics`: informações adicionais de interface ou análise local.

`answers` não pode conter elementos DOM, funções, referências circulares, dados pessoais ou objetos excessivamente grandes.

---

## 13. Topbar e HUD

O motor não deve acessar IDs globais diretamente.

```js
context.hud.setScore(85);
context.hud.setProgress(4, 10);
context.hud.setMetric("Tentativas", 2);
context.hud.announce("A ordem ainda não está correta.");
```

A métrica secundária pode variar:

- caça-palavras: palavras encontradas;
- cruzadinha: termos resolvidos;
- liga conceitos: associações concluídas ou tentativas;
- ordem correta: tentativas;
- swipe: questão atual;
- quiz: questão atual;
- wend: a definir.

---

## 14. Integração com a API

Inicialmente, a API existente continuará exposta por `window.BC_API`. O `api-adapter.js` deve encapsular esse objeto para que os demais módulos não dependam diretamente de variável global.

Funções necessárias:

```js
BC_API.requireUser();
BC_API.getGameMap(publicUserId);
BC_API.getQuestionsForPhase(publicPhaseId, options);
BC_API.registerGameAttempt(publicUserId, publicPhaseId, attempt);
BC_API.getNextPhaseForPhase(publicUserId, publicPhaseId);
```

O adaptador será responsável por:

- validar a disponibilidade da API;
- aplicar timeout;
- normalizar erros;
- expor respostas previsíveis;
- evitar chamadas diretas pelos motores.

---

## 15. Normalização dos dados

### 15.1. JSON

```js
export function parseJson(value, fallback) {
  if (value == null || value === "") return fallback;
  if (typeof value === "object") return value;

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}
```

### 15.2. Fase

```js
export function normalizePhase(row) {
  return {
    ...row,
    config: parseJson(row.configJson, {}),
    questionCount:
      row.questionCount == null ? null : Number(row.questionCount),
    passScore: Number(row.passScore ?? 60),
    maxScore: Number(row.maxScore ?? 100),
  };
}
```

### 15.3. Questão

```js
export function normalizeQuestion(row) {
  return {
    questionId: row.questionId,
    publicQuestionId: row.publicQuestionId,
    prompt: String(row.prompt ?? ""),
    simpleExplanation: String(row.simpleExplanation ?? ""),
    correctAnswer: row.correctAnswer,
    options: parseJson(row.optionsJson, []),
    metadata: parseJson(row.metadataJson, {}),
    difficulty: Number(row.difficulty ?? 1),
    tags: String(row.tags ?? ""),
  };
}
```

---

## 16. Pontuação e estrelas

### 16.1. Normalização

```js
export function clampScore(value) {
  const score = Number(value);
  if (!Number.isFinite(score)) return 0;
  return Math.max(0, Math.min(100, Math.round(score)));
}
```

### 16.2. Estrelas

```js
export function starsFromScore(score) {
  if (score >= 95) return 3;
  if (score >= 80) return 2;
  if (score >= 60) return 1;
  return 0;
}
```

Faixas:

- 0 a 59: não aprovado e nenhuma estrela;
- 60 a 79: aprovado e uma estrela;
- 80 a 94: aprovado e duas estrelas;
- 95 a 100: aprovado e três estrelas.

### 16.3. Regras conhecidas por motor

#### Caça-palavras

```js
score = 100 - hintsUsed * 10;
```

#### Cruzadinha

```js
score = 100 - hintsUsed * 10;
```

#### Liga conceitos

```js
score = attempts <= 1 ? 100
  : attempts === 2 ? 85
  : attempts === 3 ? 70
  : 60;
```

A implementação visual do Flow usava penalidade de 10 pontos por erro. Antes da implementação definitiva do motor `liga-conceitos`, deverá ser escolhida uma única regra oficial, alinhada ao conteúdo cadastrado e apresentada no tutorial.

#### Ordem correta

```js
score = attempts <= 1 ? 100
  : attempts === 2 ? 85
  : attempts === 3 ? 70
  : 60;
```

#### Swipe

```js
score = Math.round((correctCount / totalCount) * 100);
```

#### Quiz

```js
score = Math.round((correctCount / totalCount) * 100);
```

#### Wend

Regra ainda não definida.

---

## 17. Tutorial obrigatório

Toda modalidade deverá apresentar:

- objetivo;
- sequência básica de ações;
- instruções para mouse e toque;
- instruções para teclado;
- alternativa ao arraste, quando existir;
- funcionamento da pontuação;
- uso de dicas e penalidades;
- informação sobre tempo;
- opção de jogar sem tempo, quando aplicável.

O tutorial deverá:

- estar disponível antes do início;
- poder ser reaberto durante a partida;
- permitir fechamento sem perda de progresso;
- pausar o cronômetro;
- manter o foco em seu diálogo;
- devolver o foco ao controle que o abriu;
- não depender de uma animação para ser compreendido;
- respeitar redução de movimento.

---

## 18. Requisitos de acessibilidade

A implementação deverá seguir os requisitos aplicáveis de acessibilidade adotados pelo projeto, considerando WCAG e normas ABNT pertinentes.

Requisitos mínimos:

- HTML semântico;
- idioma `pt-BR`;
- uso completo por teclado;
- uso por mouse e toque quando aplicável;
- alternativa para arrastar, deslizar ou desenhar;
- foco visível;
- ordem de foco previsível;
- alvos interativos adequados;
- mensagens anunciadas por região viva;
- erros identificados por texto e não apenas por cor;
- acertos identificados por texto, ícone e estado;
- suporte a ampliação e reflow;
- suporte a orientação vertical e horizontal;
- respeito a `prefers-reduced-motion`;
- compatibilidade com cores forçadas;
- ausência de armadilhas de teclado;
- recuperação de foco após re-renderização;
- linguagem objetiva;
- nenhuma funcionalidade dependente apenas de precisão motora.

### 18.1. Região de anúncios

```html
<div
  id="game-live-region"
  class="sr-only"
  aria-live="polite"
  aria-atomic="true"
></div>
```

### 18.2. Teclado

Padrões gerais:

- `Tab`: avançar entre controles;
- `Shift + Tab`: voltar;
- `Enter` ou `Espaço`: ativar ou selecionar;
- `Escape`: cancelar a ação atual ou fechar diálogo;
- setas: navegação interna de componentes compostos.

Atalhos globais não devem capturar teclas quando o foco estiver em campos de formulário, conteúdo editável ou controles de acessibilidade.

### 18.3. Não depender apenas de cor

Todo estado deve combinar pelo menos dois meios de identificação, como:

- texto;
- ícone;
- padrão de linha;
- forma;
- rótulo acessível;
- cor.

Exemplos:

- erro: cor + símbolo `×` + texto;
- acerto: cor + símbolo `✓` + texto;
- seleção: contorno + `aria-pressed` + texto anunciado;
- associação incorreta: linha tracejada + símbolo + mensagem.

### 18.4. Movimento reduzido

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

Confetes, pulsos, shakes e animações contínuas devem ser desativados ou reduzidos. O conteúdo não pode depender da animação.

---

## 19. Fases com tempo

Toda fase temporizada deverá permitir, antes do início:

```text
Jogar com tempo
Jogar sem limite de tempo
```

O modo sem tempo:

- não reduz pontuação;
- não impede estrelas;
- não impede progresso;
- não altera as questões;
- não pode ser apresentado como modo inferior.

Durante a partida deverá existir, quando tecnicamente aplicável, a ação “Remover limite de tempo”. Ao utilizá-la:

- o cronômetro para;
- a partida continua;
- nenhuma penalidade é aplicada;
- a mudança é anunciada;
- a preferência pode ser salva.

Os motores não devem criar cronômetros próprios. Devem utilizar `context.timer`.

---

## 20. Interações complexas

### 20.1. Drag-and-drop

Arrastar pode ser oferecido como conveniência, mas nunca como único modo.

Alternativas possíveis:

- selecionar item e selecionar destino;
- botões “Mover para cima” e “Mover para baixo”;
- lista ordenável por controles;
- seleção e confirmação;
- teclado com setas, quando apropriado.

### 20.2. Ordem correta

Deve permitir:

- arrastar cards;
- selecionar um card e movê-lo por botões;
- operação integral por teclado;
- remoção ou reposicionamento sem gesto preciso;
- feedback textual após conferir.

### 20.3. Liga conceitos/Flow

Deve possuir dois modos equivalentes:

1. traçar caminho por mouse ou toque;
2. selecionar conceito e definição, confirmando a associação.

No modo de seleção, o sistema pode gerar o caminho visual automaticamente. Se o desenho do caminho fizer parte da avaliação, a grade deverá permitir navegação por setas, identificação de linha e coluna, desfazer e cancelar.

### 20.4. Swipe

O gesto de deslizar deve possuir botões equivalentes, com rótulos claros. A modalidade deve ser totalmente jogável sem gesto.

---

## 21. Preferências de acessibilidade

Estrutura sugerida:

```js
{
  reducedMotion: false,
  timedGamesEnabled: false,
  interactionMode: "auto",
  soundEnabled: false,
  vibrationEnabled: false,
  highContrast: false
}
```

Valores possíveis para `interactionMode`:

- `auto`;
- `pointer`;
- `keyboard`;
- `selection`.

O usuário escolhe a forma de interação, sem precisar declarar condição pessoal.

---

## 22. Tela final

A tela final será geral e aproveitará os conceitos do `gameFinish.js` anterior:

- normalização da pontuação;
- cálculo de estrelas;
- salvamento e busca da próxima fase em paralelo;
- timeout;
- tempo mínimo de exibição do estado de salvamento;
- mensagem de falha ao persistir;
- foco no resultado;
- respeito a movimento reduzido;
- botões para próxima fase, mapa e reinício;
- confete opcional.

Mudanças obrigatórias:

- remoção de `ENGINE_PATHS`;
- próxima fase apontando para a mesma página `/jogo/?phase=...`;
- conversão para ES Module;
- separação entre renderização e persistência;
- limpeza explícita de animações e canvas;
- texto correto para aprovação conforme `passScore` da fase;
- ocultar “Próxima fase” quando o resultado não liberar avanço;
- não depender apenas das estrelas visuais;
- preservar detalhes do erro para console e mensagem simples para o usuário.

### 22.1. Persistência e próxima fase

```js
const [saveResult, nextResult] = await Promise.allSettled([
  saveAttempt(),
  getNextPhase(),
]);
```

### 22.2. URL da próxima fase

```js
function createPhaseUrl(nextPhase) {
  if (!nextPhase?.publicPhaseId) return "";

  const url = new URL("./", location.href);
  url.searchParams.set("phase", nextPhase.publicPhaseId);
  return url.toString();
}
```

---

## 23. Registro da tentativa

```js
await api.registerGameAttempt(
  user.publicUserId,
  phase.publicPhaseId,
  {
    score,
    stars,
    hintsUsed,
    attemptsUsed,
    correctCount,
    totalCount,
    durationSeconds,
    answers,
  }
);
```

A camada geral deve garantir:

- valores normalizados;
- conclusão única;
- duração calculada pela sessão;
- resultado serializável;
- erro tratado sem bloquear as ações finais;
- registro apenas após conclusão válida do motor.

---

## 24. Proteção contra conclusão duplicada

```js
let completionPromise = null;

function completeGame(result) {
  if (completionPromise) return completionPromise;
  completionPromise = finalizeGame(result);
  return completionPromise;
}
```

O motor também deve manter um estado local `finished` para bloquear novas ações.

---

## 25. Reinício e ciclo de vida

Fluxo recomendado:

```text
Destruir motor atual
      ↓
Abortar listeners vinculados ao signal
      ↓
Cancelar timers e animações
      ↓
Limpar contêiner e UI final
      ↓
Criar nova sessão
      ↓
Criar nova instância do motor
      ↓
Renderizar introdução
```

Na primeira versão, `location.reload()` pode ser usado como fallback. A meta é permitir reinício sem recarregar a página após todos os motores implementarem `destroy()` corretamente.

---

## 26. Segurança e integridade

- Preferir `textContent` para dados da API.
- Escapar conteúdo antes de usar `innerHTML`.
- Nunca executar conteúdo vindo de JSON.
- Validar campos obrigatórios de cada modalidade.
- Limitar a quantidade e o tamanho dos dados persistidos.
- Usar registro fechado para importação dos motores.
- Não inserir dados pessoais em `answers`.
- Não confiar apenas no cliente para regras críticas de progresso.

---

## 27. Tratamento de erros

Códigos previstos:

```text
PHASE_ID_MISSING
USER_UNAVAILABLE
PHASE_NOT_FOUND
PHASE_LOCKED
QUESTIONS_EMPTY
QUESTIONS_INVALID
ENGINE_NOT_REGISTERED
ENGINE_UNAVAILABLE
ENGINE_INVALID_EXPORT
ENGINE_MOUNT_FAILED
ATTEMPT_SAVE_FAILED
API_TIMEOUT
```

A interface deve mostrar mensagem objetiva e ação possível. Detalhes técnicos devem permanecer no console.

```js
export class GameError extends Error {
  constructor(message, code, details = null) {
    super(message);
    this.name = "GameError";
    this.code = code;
    this.details = details;
  }
}
```

---

## 28. Timeout

```js
export function withTimeout(promise, milliseconds, label) {
  return Promise.race([
    Promise.resolve(promise),
    new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`${label} excedeu ${milliseconds}ms`));
      }, milliseconds);
    }),
  ]);
}
```

Deve ser aplicado principalmente a:

- identificação do usuário;
- consulta ao mapa;
- busca das questões;
- registro da tentativa;
- busca da próxima fase.

---

## 29. Tailwind CSS

O Tailwind será carregado localmente a partir de `public/vendor/`. O caminho exato dependerá do artefato disponível no projeto.

Tailwind deve ser usado para:

- estrutura;
- espaçamento;
- tipografia;
- responsividade;
- estados simples;
- foco;
- cores e visibilidade.

CSS complementar é permitido para:

- drag-and-drop;
- elementos fantasma;
- grades de jogos;
- caminhos SVG;
- caça-palavras;
- cruzadinhas;
- animações específicas;
- confetes;
- propriedades calculadas em tempo de execução.

Não utilizar CDN em produção.

---

## 30. Validação do contrato do motor

```js
export function validateEngine(engine) {
  const required = [
    "getMetadata",
    "getTutorial",
    "getAccessibility",
    "mount",
    "start",
    "destroy",
  ];

  const missing = required.filter(
    method => typeof engine?.[method] !== "function"
  );

  if (missing.length) {
    throw new Error(
      `Motor inválido. Métodos ausentes: ${missing.join(", ")}`
    );
  }

  const accessibility = engine.getAccessibility();

  if (!accessibility?.keyboard?.supported) {
    throw new Error("O motor não declara suporte completo a teclado.");
  }

  if (
    accessibility?.pointer?.usesDrag &&
    !accessibility?.pointer?.dragAlternative
  ) {
    throw new Error("O motor usa arraste sem alternativa equivalente.");
  }
}
```

A validação automática não substitui testes manuais.

---

## 31. Critérios de aceite por motor

```text
[ ] Exporta createGame()
[ ] Implementa os métodos obrigatórios
[ ] Não acessa BC_API diretamente
[ ] Não registra a tentativa diretamente
[ ] Não renderiza a tela final
[ ] Não manipula URL ou navegação
[ ] Usa apenas o contêiner fornecido
[ ] Atualiza HUD pelo contexto
[ ] Finaliza por context.complete()
[ ] Impede conclusão duplicada
[ ] Remove listeners, timers e animações
[ ] Valida os dados recebidos
[ ] Retorna resultado serializável
[ ] Possui tutorial antes da partida
[ ] Tutorial explica objetivo e pontuação
[ ] Tutorial explica teclado, mouse e toque
[ ] Tutorial pode ser reaberto
[ ] Toda ação funciona sem mouse
[ ] Toda ação funciona sem arrastar
[ ] Estados não dependem apenas de cor
[ ] Erros e acertos possuem texto e ícone
[ ] Foco permanece visível e previsível
[ ] Mensagens são anunciadas
[ ] Respeita movimento reduzido
[ ] Funciona com ampliação e reflow
[ ] Funciona em orientação vertical e horizontal
[ ] Se houver tempo, oferece modo sem tempo
[ ] Remover o tempo não gera penalidade
[ ] Funciona em dispositivos móveis
```

---

## 32. Testes obrigatórios

### 32.1. Fluxo geral

- parâmetro ausente;
- fase inexistente;
- fase bloqueada;
- fase disponível;
- API lenta;
- API indisponível;
- questão malformada;
- dados insuficientes;
- motor não registrado;
- motor indisponível;
- clique duplo na conclusão;
- erro ao salvar;
- ausência de próxima fase;
- jogar novamente.

### 32.2. Acessibilidade

- navegação somente por teclado;
- operação somente por mouse;
- operação por toque;
- zoom e reflow;
- leitor de tela;
- ordem de foco;
- foco após re-renderização;
- movimento reduzido;
- cores forçadas;
- contraste;
- modo sem tempo;
- tutorial reaberto;
- alternativa a arraste e swipe.

### 32.3. Responsividade

- celular em orientação vertical;
- celular em orientação horizontal;
- tablet;
- desktop;
- altura reduzida de viewport;
- barra global de acessibilidade ativa.

---

## 33. Ordem de implementação

1. Criar a estrutura geral de diretórios.
2. Criar o `index.html` sem elementos específicos de motor.
3. Implementar `api-adapter.js`.
4. Implementar máquina de estados e sessão.
5. Implementar loading, bloqueio e erro.
6. Implementar tutorial e introdução.
7. Implementar topbar, feedback e anunciador.
8. Implementar pontuação, tempo e preferências.
9. Converter a finalização anterior para `result-screen.js`.
10. Criar registro e validação de motores.
11. Migrar `ordem-correta` como primeiro motor.
12. Migrar `liga-conceitos` com alternativa de seleção.
13. Implementar `quiz` e `swipe`.
14. Implementar `caca-palavras` e `cruzadinha`.
15. Definir as regras do `wend` antes de implementá-lo.
16. Executar testes funcionais e de acessibilidade.

---

## 34. Decisões consolidadas

1. Haverá uma única página para todas as fases.
2. A fase será identificada por `?phase=<publicPhaseId>`.
3. A implementação será dividida em vários módulos.
4. Cada modalidade será um ES Module em `types/`.
5. O motor será carregado por registro fechado.
6. O shell controlará loading, introdução, tutorial, topbar e resultado.
7. O motor controlará somente o conteúdo e as regras internas.
8. Todos os motores seguirão o mesmo contrato.
9. A API será acessada somente pela camada geral.
10. `window.BC_API` será encapsulado por um adaptador.
11. O motor calculará a pontuação bruta.
12. A camada geral normalizará pontuação, estrelas e persistência.
13. Todo jogo terá tutorial e regras de pontuação.
14. Todo jogo funcionará integralmente por teclado.
15. Gestos de arrastar e deslizar terão alternativas equivalentes.
16. Nenhum estado dependerá apenas de cor.
17. Fases com tempo permitirão jogar sem tempo e sem penalidade.
18. Preferências de acessibilidade poderão ser mantidas entre fases.
19. A finalização anterior será convertida em módulo geral.
20. `ENGINE_PATHS` não será mais necessário.
21. O simulador foi removido.
22. O `wend` permanece planejado, mas sem regras definidas.
23. Acessibilidade faz parte do contrato e dos critérios de aceite.
24. Cada motor deverá limpar completamente seus recursos em `destroy()`.
25. A conclusão será protegida contra execução duplicada.

---

## 35. Pendências antes da implementação completa

- verificar o artefato Tailwind disponível em `public/vendor/`;
- confirmar os caminhos reais de `api.js`, acessibilidade, fontes e background;
- definir uma regra única de pontuação para `liga-conceitos`;
- definir o formato oficial de dados de cada motor;
- definir regras, objetivo, dados e pontuação do `wend`;
- decidir se o reinício inicial usará reload ou recriação de instância;
- definir quais preferências serão persistidas em `localStorage`;
- revisar textos do tutorial de cada modalidade;
- montar casos de teste de teclado e leitor de tela.
