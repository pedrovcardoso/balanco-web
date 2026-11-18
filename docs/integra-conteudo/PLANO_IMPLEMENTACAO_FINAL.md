# Plano de Implementação Final: Balanço Cidadão, Jogos & Balanço na Prática

**Status:** Documento Diretor de Execução (Checklist e Conteúdo Completo)  
**Versão:** 1.0 (Novembro/2026)  
**Documentos Relacionados:**  
- `docs/INTEGRACAO_BALANCO_JOGOS.md` (Arquitetura das 16 fases e 4 mundos)
- `docs/LIVROS_LINGUAGEM_SIMPLES_OFICINA.md` (Diretrizes de redação, SEF + SEPLAG e Linguagem Simples)
- `docs/plan/mysql_schema.sql` (Estrutura de banco e dados das fases)

---

## 1. Visão Executiva do Plano

Este plano organiza todas as alterações necessárias para conectar harmoniosamente as **4 Trilhas do portal**:
1. **História de Minas Gerais (`/historia`)** → O contexto do povo e do território de 853 municípios.
2. **Entendendo o Balanço (`/balanco`)** → A teoria com linguagem simples, integrando o planejamento da SEPLAG e a contabilidade fiscal da SEF.
3. **O Balanço na Prática (`/dados`)** → A entrega real: dados do SIGPLAN, gráficos, mapas, notícias e análises.
4. **Jogue & Aprenda (`/jogos`)** → A consolidação gamificada através de 16 fases alinhadas aos livros.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               FLUXO GERAL DE EXECUÇÃO                                  │
├───────────────────────────────┬───────────────────────────────┬────────────────────────┤
│ ETAPA 1: BANCO DE DADOS       │ ETAPA 2: LIVROS DO BALANÇO    │ ETAPA 3: TELAS DE JOGO │
│ • Reestruturar 4 macroseções  │ • Atualizar textos didáticos  │ • Inserir mapa estático│
│ • Adicionar colunas tb_phase  │ • Deep linking por URL        │ • Link pré-jogo Intro  │
│ • Reordenar as 16 fases       │ • Banners dos Jogos e Prática │ • Link pós-erro Finish │
└───────────────────────────────┴───────────────────────────────┴────────────────────────┘
```

---

## 2. Checklist Geral de Tarefas

### [ ] Etapa 1: Banco de Dados (`mysql_schema.sql` & Migrações)
- [ ] **1.1** Atualizar os registros da tabela `tb_section` para os 4 Mundos pedagógicos.
- [ ] **1.2** Adicionar colunas de metadados em `tb_phase` (`balanco_book_id`, `balanco_section_slug`, `balanco_cue_text`).
- [ ] **1.3** Atualizar os cadastros de `tb_phase` (vincular book, slug, texto e reordenar fases 1 a 16).
- [ ] **1.4** Ajustar eventuais tags e enunciados de perguntas em `tb_question` para garantir consistência.

### [ ] Etapa 2: Componentes do Frontend — Balanço Didático (`site/src/features/balanco/`)
- [ ] **2.1** Criar componente `<QuizChallengeBanner />` para os chamamentos dos jogos.
- [ ] **2.2** Criar componente `<BalancoPraticaBanner />` para as pontes com a página de dados reais.
- [ ] **2.3** Atualizar `BalancoPage.jsx` para ler parâmetros de URL (`?book=...&section=...`) e fazer rolagem suave (`scrollIntoView`).
- [ ] **2.4** Atualizar `AdministracaoPublicaChapter.jsx` (Vol. 01):
  - Inserir Princípio da Escassez e Consentimento Democrático.
  - Alinhar as etapas do Ciclo Orçamentário com a Fase 4 do jogo.
  - Inserir banners da Fase 1, Fase 2, Fase 3, Fase 4 e chamada para O Balanço na Prática.
- [ ] **2.5** Atualizar `RelatoriosFiscaisChapter.jsx` (Vol. 02):
  - Inserir as 3 etapas da despesa (Empenho, Liquidação, Pagamento) em `#conceitos-fiscais`.
  - Inserir Ativo e Passivo em `#balanco-geral`.
  - Inserir box comparativo RREO vs. RGF em `#rgf`.
  - Inserir nota sobre Resultado Primário x Nominal em `#painel-indicadores`.
  - Inserir banners das Fases 5 a 12 e chamadas para O Balanço na Prática em `#despesas-funcao` e `#painel-indicadores`.
- [ ] **2.6** Atualizar `ControleCidadaniaChapter.jsx` (Vol. 03):
  - Inserir o Tripé "CPF" (Conselhos, Planos e Fundos) em `#controle-social`.
  - Refinar conceito de Accountability e prazos da LAI (20+10 dias).
  - Inserir banners das Fases 13 a 16 e chamada final para dados abertos em `/dados`.

### [ ] Etapa 3: Componentes do Frontend — Jogos (`site/src/features/jogo/`)
- [ ] **3.1** Criar arquivo central de mapeamento `site/src/shared/constants/gameBalancoMap.js`.
- [ ] **3.2** Atualizar `GameIntro.jsx` com card: *"📖 Leitura recomendada antes de começar"*.
- [ ] **3.3** Atualizar `GameFinish.jsx` com card pedagógico: *"💡 Onde revisar no Balanço Cidadão"* (caso `score < 60` ou `stars < 2`).

### [ ] Etapa 4: Validação, Testes e QA
- [ ] **4.1** Testar deep links: clicar num link de jogo/revisão e verificar se o livro correto abre e rola até a seção.
- [ ] **4.2** Testar fluxo do Balanço: clicar num banner "Jogar desafio" e abrir a fase de jogo correta.
- [ ] **4.3** Testar responsividade e acessibilidade (leitor de tela, foco do teclado e contraste).

---

## 3. Detalhamento e Código Completo de Cada Etapa

---

### ETAPA 1: Scripts SQL para Banco de Dados

Arquivo: `docs/plan/mysql_schema.sql` (ou script de migração `migration_integracao_balanco.sql`):

```sql
-- 1.1 Atualizar os 4 Mundos (Macroseções)
UPDATE tb_section 
SET title = 'Administração Pública e Planejamento',
    description = 'Fundamentos da administração pública, esferas, poderes e instrumentos de planejamento (Capítulo 1).'
WHERE id = 1;

UPDATE tb_section 
SET title = 'Receitas, Despesas e Execução',
    description = 'Entrada e saída de recursos, despesas correntes e de capital, e estágios de execução da despesa (Capítulo 2 · Parte 1).'
WHERE id = 2;

UPDATE tb_section 
SET title = 'Balanços, RGF e Indicadores de MG',
    description = 'Balanço Geral, demonstrativos fiscais da LRF e índices constitucionais de Minas Gerais (Capítulo 2 · Parte 2).'
WHERE id = 3;

UPDATE tb_section 
SET title = 'Controle Social e Cidadania',
    description = 'Controle interno e externo, transparência pública, LAI, Ouvidoria e participação social (Capítulo 3).'
WHERE id = 4;

-- 1.2 Adicionar colunas de integração em tb_phase
ALTER TABLE tb_phase
  ADD COLUMN IF NOT EXISTS balanco_book_id VARCHAR(40) NULL COMMENT 'chapter-1 | chapter-2 | chapter-3',
  ADD COLUMN IF NOT EXISTS balanco_section_slug VARCHAR(80) NULL COMMENT 'Anchor ID no BalancoPage',
  ADD COLUMN IF NOT EXISTS balanco_cue_text VARCHAR(255) NULL COMMENT 'Instrução didática pré-jogo';

-- 1.3 Atualizar os metadados das 16 Fases
-- MUNDO 1 (Capítulo 1)
UPDATE tb_phase SET
  section_id = 1, order_index = 1,
  balanco_book_id = 'chapter-1', balanco_section_slug = 'administracao-publica',
  balanco_cue_text = 'Revise os 5 princípios constitucionais do art. 37 (LIMPE) no Balanço Cidadão.'
WHERE id = 1;

UPDATE tb_phase SET
  section_id = 1, order_index = 2,
  balanco_book_id = 'chapter-1', balanco_section_slug = 'esferas-poderes',
  balanco_cue_text = 'Relembre as atribuições das Esferas de Governo e dos Três Poderes do Estado.'
WHERE id = 4; -- Quiz de Adm Pública / Esferas e Poderes

UPDATE tb_phase SET
  section_id = 1, order_index = 3,
  balanco_book_id = 'chapter-1', balanco_section_slug = 'ciclo-orcamentario',
  balanco_cue_text = 'Confira as funções do PMDI, PPAG, LDO e LOA no ciclo de planejamento.'
WHERE id = 2; -- Flow Instrumentos de Planejamento

UPDATE tb_phase SET
  section_id = 1, order_index = 4,
  balanco_book_id = 'chapter-1', balanco_section_slug = 'ciclo-orcamentario',
  balanco_cue_text = 'Veja as etapas do ciclo orçamentário: elaboração, aprovação, execução e controle.'
WHERE id = 3; -- Ordem Correta Ciclo Orçamentário

-- MUNDO 2 (Capítulo 2 · Parte 1)
UPDATE tb_phase SET
  section_id = 2, order_index = 1,
  balanco_book_id = 'chapter-2', balanco_section_slug = 'receitas-despesas',
  balanco_cue_text = 'Entenda como o Estado arrecada recursos e a diferença entre receita e despesa.'
WHERE id = 5; -- Flow Receita vs Despesa

UPDATE tb_phase SET
  section_id = 2, order_index = 2,
  balanco_book_id = 'chapter-2', balanco_section_slug = 'receitas-despesas',
  balanco_cue_text = 'Classifique despesas do cotidiano em despesas de manutenção (corrente) ou investimento (capital).'
WHERE id = 6; -- Swipe Corrente vs Capital

UPDATE tb_phase SET
  section_id = 2, order_index = 3,
  balanco_book_id = 'chapter-2', balanco_section_slug = 'conceitos-fiscais',
  balanco_cue_text = 'Relembre a sequência da despesa na Lei 4.320/64: Empenho, Liquidação e Pagamento.'
WHERE id = 9; -- Ordem Correta Caminho do Documento

UPDATE tb_phase SET
  section_id = 2, order_index = 4,
  balanco_book_id = 'chapter-2', balanco_section_slug = 'conceitos-fiscais',
  balanco_cue_text = 'Revise o conceito de Restos a Pagar e finanças públicas no Balanço.'
WHERE id = 8; -- Swipe Restos a Pagar e Receita/Despesa

-- MUNDO 3 (Capítulo 2 · Parte 2)
UPDATE tb_phase SET
  section_id = 3, order_index = 1,
  balanco_book_id = 'chapter-2', balanco_section_slug = 'balanco-geral',
  balanco_cue_text = 'Relembre a estrutura do Balanço Geral: Ativo, Passivo e Patrimônio Público.'
WHERE id = 13; -- Cruzadinha Balanços e Demonstrativos

UPDATE tb_phase SET
  section_id = 3, order_index = 2,
  balanco_book_id = 'chapter-2', balanco_section_slug = 'rgf',
  balanco_cue_text = 'Consulte o papel dos dois relatórios da LRF: o RREO (bimestral) e o RGF (quadrimestral).'
WHERE id = 10; -- Flow Relatórios Fiscais da LRF

UPDATE tb_phase SET
  section_id = 3, order_index = 3,
  balanco_book_id = 'chapter-2', balanco_section_slug = 'indices-constitucionais',
  balanco_cue_text = 'Confira os índices constitucionais de Minas Gerais em 2025: Saúde, Educação e FUNDEB.'
WHERE id = 11; -- Swipe Índices Constitucionais e Limites

UPDATE tb_phase SET
  section_id = 3, order_index = 4,
  balanco_book_id = 'chapter-2', balanco_section_slug = 'painel-indicadores',
  balanco_cue_text = 'Revise a Dívida Consolidada Líquida, limites de pessoal e superávit de Minas Gerais.'
WHERE id = 12; -- Quiz Execução Orçamentária e Indicadores

-- MUNDO 4 (Capítulo 3)
UPDATE tb_phase SET
  section_id = 4, order_index = 1,
  balanco_book_id = 'chapter-3', balanco_section_slug = 'controle-accountability',
  balanco_cue_text = 'Diferencie a atuação do Controle Interno do Controle Externo exercido com o TCE-MG.'
WHERE id = 15; -- Flow Controle Interno x Externo

UPDATE tb_phase SET
  section_id = 4, order_index = 2,
  balanco_book_id = 'chapter-3', balanco_section_slug = 'controle-social',
  balanco_cue_text = 'Estude as regras da Lei de Acesso à Informação (LAI), transparência ativa e prazos.'
WHERE id = 14; -- Swipe Transparência e LAI

UPDATE tb_phase SET
  section_id = 4, order_index = 3,
  balanco_book_id = 'chapter-3', balanco_section_slug = 'direitos-deveres',
  balanco_cue_text = 'Relembre os canais de Ouvidoria, accountability e participação nos Conselhos Públicos.'
WHERE id = 7; -- Cruzadinha de Cidadania e Termos Fiscais

UPDATE tb_phase SET
  section_id = 4, order_index = 4,
  balanco_book_id = 'chapter-3', balanco_section_slug = 'controle-social',
  balanco_cue_text = 'Consolide seus conhecimentos sobre fiscalização cidadã e ferramentas de controle social.'
WHERE id = 16; -- Quiz Cidadão Consciente e Participativo
```

---

### ETAPA 2: Novos Componentes e Atualizações no Balanço

#### 2.1 Novo Componente: `site/src/features/balanco/components/QuizChallengeBanner.jsx`

```jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';

export default function QuizChallengeBanner({
  phaseId,
  phaseTitle,
  engineName,
  icon = 'fa6-solid:gamepad',
  description = 'Teste o que você acabou de aprender sobre esse tema e ganhe pontos na trilha!',
}) {
  return (
    <aside className="my-7 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#fff9ea] via-[#fcf3dc] to-[#f7e6c0] border-2 border-[#b58338]/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
      <div className="flex items-start gap-3.5 text-left w-full sm:w-auto">
        <div className="size-11 rounded-xl bg-[#8b5e3c] text-white grid place-items-center shrink-0 text-xl shadow-xs mt-0.5">
          <Icon icon={icon} />
        </div>
        <div>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-[#733f17] bg-[#f5dfb0] px-2 py-0.5 rounded-md mb-1">
            <Icon icon="fa6-solid:award" className="text-[#8b5e3c]" />
            Desafio Interativo · {engineName}
          </span>
          <h4 className="text-sm sm:text-base font-black text-[#422206] m-0 leading-tight">
            {phaseTitle}
          </h4>
          <p className="text-xs text-[#6b3e1b] font-bold mt-1 mb-0 leading-snug">
            {description}
          </p>
        </div>
      </div>
      <Link
        to={`/jogos/${phaseId}`}
        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#8b5e3c] to-[#6b4223] hover:brightness-110 active:scale-95 text-white text-xs font-black no-underline shadow-md transition-all shrink-0 w-full sm:w-auto cursor-pointer"
      >
        <Icon icon="fa6-solid:play" />
        <span>Jogar fase agora</span>
      </Link>
    </aside>
  );
}
```

#### 2.2 Novo Componente: `site/src/features/balanco/components/BalancoPraticaBanner.jsx`

```jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { ROUTES } from '../../../shared/constants/routes.js';

export default function BalancoPraticaBanner({
  title = 'Veja esses números na prática em Minas Gerais!',
  description = 'Descubra como os recursos públicos chegam ao seu município por meio de mapas interativos, notícias do ano e dados do SIGPLAN.',
  buttonText = 'Explorar O Balanço na Prática',
}) {
  return (
    <aside className="my-8 p-5 rounded-2xl bg-gradient-to-r from-[#eef9f6] via-[#e2f3ee] to-[#d4ece5] border-2 border-[#158066]/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
      <div className="flex items-start gap-3.5 text-left w-full sm:w-auto">
        <div className="size-12 rounded-xl bg-[#0f6b55] text-white grid place-items-center shrink-0 text-2xl shadow-xs mt-0.5">
          <Icon icon="solar:chart-2-bold-duotone" />
        </div>
        <div>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-[#0b4d3d] bg-[#c3e6dc] px-2.5 py-0.5 rounded-md mb-1">
            <Icon icon="fa6-solid:map-location-dot" />
            Trilha 3 · Entrega Real do Estado
          </span>
          <h4 className="text-sm sm:text-base font-black text-[#07362a] m-0 leading-tight">
            {title}
          </h4>
          <p className="text-xs text-[#0f5443] font-bold mt-1 mb-0 leading-snug max-w-xl">
            {description}
          </p>
        </div>
      </div>
      <Link
        to={ROUTES.DADOS}
        className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#0f6b55] hover:bg-[#0b5342] active:scale-95 text-white text-xs font-black no-underline shadow-md transition-all shrink-0 w-full sm:w-auto cursor-pointer"
      >
        <Icon icon="solar:eye-bold-duotone" className="text-base" />
        <span>{buttonText}</span>
      </Link>
    </aside>
  );
}
```

#### 2.3 Atualização no `BalancoPage.jsx` (Deep Linking de Livro e Seção)

Adicionar `useSearchParams` para capturar `?book=chapter-X&section=secao-slug`:

```jsx
import { useSearchParams } from 'react-router-dom';

// Dentro do componente BalancoPage:
const [searchParams] = useSearchParams();

useEffect(() => {
  const paramBook = searchParams.get('book');
  const paramSection = searchParams.get('section');

  if (paramBook && ['chapter-1', 'chapter-2', 'chapter-3'].includes(paramBook)) {
    setSelectedBook(paramBook);
    if (paramSection) {
      setTimeout(() => {
        const el = document.getElementById(paramSection);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 350);
    }
  }
}, [searchParams]);
```

---

### ETAPA 3: Integração nas Telas dos Jogos

#### 3.1 Arquivo Central: `site/src/shared/constants/gameBalancoMap.js`

```javascript
export const GAME_BALANCO_MAP = Object.freeze({
  1: {
    bookId: 'chapter-1',
    bookTitle: 'Vol. 01 · Administração Pública',
    sectionId: 'administracao-publica',
    sectionTitle: 'Princípios da Administração Pública (LIMPE)',
    cueText: 'Revise os 5 princípios constitucionais do art. 37 (LIMPE) no Balanço Cidadão.',
  },
  2: {
    bookId: 'chapter-1',
    bookTitle: 'Vol. 01 · Administração Pública',
    sectionId: 'ciclo-orcamentario',
    sectionTitle: 'Instrumentos de Planejamento (PMDI, PPAG, LDO, LOA)',
    cueText: 'Releia o papel do PMDI, PPAG, LDO e LOA no ciclo de planejamento.',
  },
  3: {
    bookId: 'chapter-1',
    bookTitle: 'Vol. 01 · Administração Pública',
    sectionId: 'ciclo-orcamentario',
    sectionTitle: 'Etapas do Ciclo Orçamentário',
    cueText: 'Confira as etapas do ciclo: elaboração, discussão, aprovação, execução e controle.',
  },
  4: {
    bookId: 'chapter-1',
    bookTitle: 'Vol. 01 · Administração Pública',
    sectionId: 'esferas-poderes',
    sectionTitle: 'Esferas e Três Poderes do Estado',
    cueText: 'Relembre as atribuições do Executivo, Legislativo, Judiciário e das 3 esferas.',
  },
  5: {
    bookId: 'chapter-2',
    bookTitle: 'Vol. 02 · Relatórios Fiscais',
    sectionId: 'receitas-despesas',
    sectionTitle: 'Arrecadação e Despesa Pública',
    cueText: 'Entenda como o Estado arrecada recursos e a diferença entre receita e despesa.',
  },
  6: {
    bookId: 'chapter-2',
    bookTitle: 'Vol. 02 · Relatórios Fiscais',
    sectionId: 'receitas-despesas',
    sectionTitle: 'Despesa Corrente ou de Capital?',
    cueText: 'Veja exemplos práticos de despesas de custeio diário e investimentos públicos.',
  },
  7: {
    bookId: 'chapter-3',
    bookTitle: 'Vol. 03 · Controle e Cidadania',
    sectionId: 'direitos-deveres',
    sectionTitle: 'Direitos, Deveres e Glossário Cidadão',
    cueText: 'Consulte os termos essenciais de cidadania, ouvidoria e deveres republicanos.',
  },
  8: {
    bookId: 'chapter-2',
    bookTitle: 'Vol. 02 · Relatórios Fiscais',
    sectionId: 'conceitos-fiscais',
    sectionTitle: 'Restos a Pagar e Finanças Públicas',
    cueText: 'Revise o que são Restos a Pagar e como o Estado honra compromissos empenhados.',
  },
  9: {
    bookId: 'chapter-2',
    bookTitle: 'Vol. 02 · Relatórios Fiscais',
    sectionId: 'conceitos-fiscais',
    sectionTitle: 'O Caminho da Despesa: Empenho, Liquidação e Pagamento',
    cueText: 'Relembre o caminho legal da despesa: Empenho → Liquidação → Pagamento.',
  },
  10: {
    bookId: 'chapter-2',
    bookTitle: 'Vol. 02 · Relatórios Fiscais',
    sectionId: 'rgf',
    sectionTitle: 'Os Relatórios da LRF: RREO e RGF',
    cueText: 'Entenda o papel do RREO (bimestral · execução) e do RGF (quadrimestral · limites).',
  },
  11: {
    bookId: 'chapter-2',
    bookTitle: 'Vol. 02 · Relatórios Fiscais',
    sectionId: 'indices-constitucionais',
    sectionTitle: 'Índices Constitucionais de Minas Gerais',
    cueText: 'Confira as aplicações reais de 2025: Saúde (12%), Educação (25%) e FUNDEB (70%).',
  },
  12: {
    bookId: 'chapter-2',
    bookTitle: 'Vol. 02 · Relatórios Fiscais',
    sectionId: 'painel-indicadores',
    sectionTitle: 'Painel de Indicadores e Limites da LRF',
    cueText: 'Revise os dados de DCL, gastos de pessoal e o superávit orçamentário do Estado.',
  },
  13: {
    bookId: 'chapter-2',
    bookTitle: 'Vol. 02 · Relatórios Fiscais',
    sectionId: 'balanco-geral',
    sectionTitle: 'Balanço Geral, Ativo e Passivo',
    cueText: 'Relembre como o Balanço Geral consolida o patrimônio, os bens e as dívidas públicas.',
  },
  14: {
    bookId: 'chapter-3',
    bookTitle: 'Vol. 03 · Controle e Cidadania',
    sectionId: 'controle-social',
    sectionTitle: 'Transparência Pública e LAI',
    cueText: 'Revise os prazos da Lei de Acesso à Informação (20+10 dias) e publicidade ativa.',
  },
  15: {
    bookId: 'chapter-3',
    bookTitle: 'Vol. 03 · Controle e Cidadania',
    sectionId: 'controle-accountability',
    sectionTitle: 'Controle Interno vs. Controle Externo',
    cueText: 'Diferencie a prevenção pelo Executivo da fiscalização do Legislativo com o TCE-MG.',
  },
  16: {
    bookId: 'chapter-3',
    bookTitle: 'Vol. 03 · Controle e Cidadania',
    sectionId: 'controle-social',
    sectionTitle: 'Ferramentas de Controle Social',
    cueText: 'Consolide suas estratégias de fiscalização cidadã e canais de Ouvidoria.',
  },
});
```

#### 3.2 Atualização no `GameIntro.jsx` (Dica de Leitura Pré-Jogo)

Inserir o card de recomendação antes do botão "Começar missão":

```jsx
import { GAME_BALANCO_MAP } from '../../../shared/constants/gameBalancoMap.js';

// No componente GameIntro:
const studyLink = GAME_BALANCO_MAP[phase?.id] || GAME_BALANCO_MAP[phase?.orderIndex];

// No JSX (dentro do card):
{studyLink && (
  <div className="rounded-2xl bg-[#fdf6e3]/95 border border-amber-800/20 p-3 my-2 text-left flex items-start gap-2.5 shadow-2xs">
    <Icon icon="solar:book-bookmark-bold-duotone" className="text-amber-800 text-lg shrink-0 mt-0.5" />
    <div className="flex-1">
      <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 block">
        Leitura Prévia Recomendada
      </span>
      <p className="text-xs text-amber-950 font-bold leading-tight my-1">
        {studyLink.cueText}
      </p>
      <Link
        to={`/balanco?book=${studyLink.bookId}&section=${studyLink.sectionId}`}
        className="inline-flex items-center gap-1 text-[11px] font-black text-amber-900 hover:text-amber-950 underline"
      >
        <span>Abrir "{studyLink.sectionTitle}" no Balanço</span>
        <Icon icon="fa6-solid:arrow-up-right-from-square" className="text-[9px]" />
      </Link>
    </div>
  </div>
)}
```

#### 3.3 Atualização no `GameFinish.jsx` (Card de Reforço Pós-Erro)

Na tela de resultado, se `passed === false` ou `stars < 2`:

```jsx
import { GAME_BALANCO_MAP } from '../../../shared/constants/gameBalancoMap.js';

// No componente GameFinish:
const studyLink = GAME_BALANCO_MAP[result?.phaseId];

// No JSX (logo acima dos botões de ação):
{studyLink && (!passed || stars < 2) && (
  <div className="rounded-2xl bg-amber-50/95 border-2 border-amber-800/25 p-3.5 my-2.5 text-left shadow-2xs">
    <div className="flex items-center gap-2 text-amber-900 font-black text-xs mb-1">
      <Icon icon="solar:lightbulb-bolt-bold-duotone" className="text-amber-700 text-base" />
      <span>Onde revisar esse conteúdo?</span>
    </div>
    <p className="text-xs text-amber-950 font-bold leading-snug mb-2">
      Revise a seção <strong>{studyLink.sectionTitle}</strong> no Caderno do Balanço Cidadão para mandar bem na próxima tentativa!
    </p>
    <Link
      to={`/balanco?book=${studyLink.bookId}&section=${studyLink.sectionId}`}
      className="flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-black text-xs no-underline shadow-xs transition"
    >
      <Icon icon="fa6-solid:book-open" />
      <span>Revisar no {studyLink.bookTitle}</span>
    </Link>
  </div>
)}
```

---

## 4. Ordem Recomendada de Implementação

1. **Sprint 1 — Banco e Metadados:** Rodar a migração SQL (`tb_section`, colunas de `tb_phase` e mapeamento das 16 fases).
2. **Sprint 2 — Componentes Base & Deep Linking:** Implementar `gameBalancoMap.js`, `QuizChallengeBanner.jsx`, `BalancoPraticaBanner.jsx` e o suporte a query params no `BalancoPage.jsx`.
3. **Sprint 3 — Conteúdo dos Capítulos:** Aplicar a revisão de texto em linguagem simples nos três capítulos do Balanço e inserir os banners estratégicos.
4. **Sprint 4 — Telas dos Jogos:** Atualizar `GameIntro.jsx` e `GameFinish.jsx` com os cartões de direcionamento.
5. **Sprint 5 — Homologação & QA:** Testar o ciclo completo do usuário em desktop e mobile.
