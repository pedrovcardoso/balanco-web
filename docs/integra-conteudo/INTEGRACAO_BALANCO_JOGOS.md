# Plano de Integração e Alinhamento Pedagógico: Balanço Cidadão & Trilha de Jogos

**Status:** Especificação Técnica, Curricular e Arquitetural Aprimorada  
**Referência:** `site/src/features/balanco/BalancoPage.jsx` & `docs/plan/mysql_schema.sql`  
**Data:** Novembro/2026 (Revisão 2.0)  

---

## 1. Visão Geral e Nova Arquitetura de Macro-Seções

Para que o aprendizado seja progressivo, intuitivo e sem rupturas pedagógicas, a **Trilha de Jogos (16 fases)** deve seguir rigorosamente a mesma sequência temática dos **3 Cadernos (Livros) do Balanço Cidadão**.

Dessa forma, os 4 mundos/macro-seções da trilha de jogos (`tb_section`) alinham-se aos livros didáticos:

```
┌────────────────────────────────────────────────────────────────────────┐
│ LIVRO DIDÁTICO DO BALANÇO                  TRILHA DE JOGOS             │
├──────────────────────────────────────────┬─────────────────────────────┤
│ Vol. 01 · Administração Pública          │ Mundo 1 · Adm. Pública &    │
│ (Conceitos, Esferas, Poderes, Ciclo)     │           Ciclo Orçamentário│
├──────────────────────────────────────────┼─────────────────────────────┤
│ Vol. 02 · Relatórios Fiscais             │ Mundo 2 · Receitas, Despesas│
│   Parte 1: Dinâmica Orçamentária         │           e Execução        │
│   Parte 2: Demonstrativos & Indicadores  │ Mundo 3 · Balanços, RGF e   │
│                                          │           Indicadores MG    │
├──────────────────────────────────────────┼─────────────────────────────┤
│ Vol. 03 · Controle, Cidadania e Account. │ Mundo 4 · Controle Social,  │
│ (Controle Interno/Externo, LAI, Ouvidoria│           Transparência     │
│  e Cidadania Ativa)                      │           e Cidadania       │
└──────────────────────────────────────────┴─────────────────────────────┘
```

---

## 2. Diagnóstico das Duplicidades da Estrutura Anterior

Na estrutura original do banco de dados, ocorriam as seguintes redundâncias e inversões:
1. **Inversão na Seção 1:** O ciclo orçamentário (`order_index: 1`) vinha antes dos princípios do LIMPE (`order_index: 2`), contrariando a ordem do livro onde o cidadão primeiro aprende os princípios e depois o orçamento.
2. **Duplicidade Crônica de Fases na Seção 2 e 3:** O conceito de *Empenho, Liquidação, Pagamento e Restos a Pagar* era repetido de forma redundante em 5 fases distintas (Fase 5, Fase 7, Fase 9, Fase 10 e Fase 12), gerando cansaço e pouco ganho educativo.
3. **Deslocamento Indevido do Balanço Geral:** A Cruzadinha de *Balanços e Demonstrativos* (Ativo, Passivo, Balanço Geral, RREO, RGF) estava colocada na Seção 4 (Controle Social), quando esses relatórios pertencem ao Capítulo 2 (Relatórios Fiscais).
4. **Desaproveitamento dos Dados Reais de MG:** Quase nenhuma fase testava os índices de Saúde (12%), Educação (25%), FUNDEB (70%), FAPEMIG (1%) ou as fórmulas do RGF (`DL = DB - DNC`, `DCL = DC - D`), que são o coração do Volume 2 do Balanço.

---

## 3. Matriz Reestruturada: 4 Macro-Seções e 16 Fases Alinhadas

Com a nova distribuição, cada macro-seção possui exatamente 4 fases sequenciais com motores diversificados (*Caça-palavras, Flow, Ordem Correta, Swipe, Cruzadinha e Quiz*), sem repetição inútil de conceitos:

### 🏛️ Mundo 1 — Administração Pública e Planejamento (Capítulo 1)
*Alinhado a: Vol. 01 do Balanço (`#administracao-publica`, `#esferas-poderes`, `#poderes-estado`, `#recurso-publico`, `#ciclo-orcamentario`)*

| Fase Nova | Motor | Título da Fase | Foco Pedagógico & Mecânica | Seção no Livro |
| :---: | :--- | :--- | :--- | :--- |
| **Fase 1** | Caça-palavras | **Princípios do LIMPE** | Encontrar os 5 pilares do art. 37 (Legalidade, Impessoalidade, Moralidade, Publicidade, Eficiência). | `#administracao-publica` |
| **Fase 2** | Swipe | **Esferas e Três Poderes** | Classificar atribuições rápidas: Executivo x Legislativo x Judiciário e Federal x Estadual x Municipal. | `#esferas-poderes`<br>`#poderes-estado` |
| **Fase 3** | Flow | **Instrumentos de Planejamento** | Associar PMDI, PPAG/PPA, LDO e LOA às suas respectivas finalidades e prazos. | `#ciclo-orcamentario` |
| **Fase 4** | Ordem Correta | **O Ciclo Orçamentário** | Ordenar a sequência cronológica: Elaboração → Discussão e Aprovação → Execução → Controle → Prestação de Contas. | `#ciclo-orcamentario` |

---

### 💰 Mundo 2 — Receita, Despesa e Execução Orçamentária (Capítulo 2 · Parte 1)
*Alinhado a: Vol. 02 do Balanço (`#receitas-despesas`, `#conceitos-fiscais` e etapas da despesa)*

| Fase Nova | Motor | Título da Fase | Foco Pedagógico & Mecânica | Seção no Livro |
| :---: | :--- | :--- | :--- | :--- |
| **Fase 5** | Flow | **Receita vs. Despesa** | Associar conceitos de arrecadação, custeio, investimento, receita corrente e receita de capital. | `#receitas-despesas` |
| **Fase 6** | Swipe | **Despesa Corrente ou de Capital?** | Classificação ágil de gastos do cotidiano estadual (salários, merenda, energia x novos hospitais, pontes, viaturas). | `#receitas-despesas` |
| **Fase 7** | Ordem Correta | **Caminho da Execução da Despesa** | Sequência lógica da Lei 4.320/64: Dotação LOA → Empenho (Nota de Empenho) → Liquidação (Atesto) → Pagamento. | `#conceitos-fiscais` |
| **Fase 8** | Swipe | **Restos a Pagar e Finanças Públicas** | Verdadeiro ou Falso sobre despesas empenhadas e não pagas, processadas x não processadas e caixa. | `#conceitos-fiscais` |

---

### 📊 Mundo 3 — Balanços, RGF e Indicadores de Minas (Capítulo 2 · Parte 2)
*Alinhado a: Vol. 02 do Balanço (`#balanco-geral`, `#rgf`, `#rgf-pessoal`, `#rgf-divida`, `#rgf-caixa`, `#indices-constitucionais`, `#painel-indicadores`)*

| Fase Nova | Motor | Título da Fase | Foco Pedagógico & Mecânica | Seção no Livro |
| :---: | :--- | :--- | :--- | :--- |
| **Fase 9** | Cruzadinha | **Balanço Geral e Contabilidade** | Resolver termos patrimoniais e fiscais: Balanço Geral, Ativo, Passivo, Patrimônio Líquido, Superávit. | `#balanco-geral` |
| **Fase 10** | Flow | **RREO e RGF: Os Relatórios Fiscais** | Associar periodicidades e papéis: RREO (bimestral · execução orçamentária) e RGF (quadrimestral · limites). | `#rgf` |
| **Fase 11** | Swipe | **Índices Constitucionais e Limites LRF** | V ou F com números reais de MG 2025: Saúde (12%), Educação (25%), FUNDEB (70%), Limite de Pessoal (49%). | `#indices-constitucionais`<br>`#painel-indicadores` |
| **Fase 12** | Quiz | **Mestre dos Relatórios Fiscais** | Questões desafiadoras sobre DCL (dívida menos caixa), despesa líquida de pessoal e superávit de MG. | `#painel-indicadores` |

---

### 🛡️ Mundo 4 — Controle Social, Transparência e Cidadania (Capítulo 3)
*Alinhado a: Vol. 03 do Balanço (`#controle-accountability`, `#direitos-deveres`, `#controle-social`)*

| Fase Nova | Motor | Título da Fase | Foco Pedagógico & Mecânica | Seção no Livro |
| :---: | :--- | :--- | :--- | :--- |
| **Fase 13** | Flow | **Controle Interno vs. Controle Externo** | Diferenciar a atuação preventiva dos órgãos do Executivo da fiscalização do Legislativo auxiliado pelo TCE-MG. | `#controle-accountability` |
| **Fase 14** | Swipe | **Transparência e Lei de Acesso (LAI)** | V ou F: Publicidade ativa x passiva, Portal da Transparência, prazos de resposta (20+10 dias) e limites do sigilo. | `#controle-social` |
| **Fase 15** | Cruzadinha | **Cidadania e Controle Social** | Termos essenciais: Ouvidoria, Accountability, Denúncia, Conselhos de Políticas Públicas, Dados Abertos. | `#direitos-deveres`<br>`#controle-social` |
| **Fase 16** | Quiz | **Cidadão Consciente e Participativo** | Desafio final: etapas para exercer o controle social, canais de manifestação e deveres da sociedade. | `#controle-social` |

---

## 4. O que precisamos incluir e ajustar no Balanço

> **Documento Complementar de Redação:** Consulte [docs/LIVROS_LINGUAGEM_SIMPLES_OFICINA.md](file:///c:/Users/Morador de Palafita/OneDrive/Documentos/sef/balanco-web/docs/LIVROS_LINGUAGEM_SIMPLES_OFICINA.md) para o guia detalhado de aplicação de **Linguagem Simples** e conceitos da disciplina *Oficina de Orçamento Público* (UFMG — Prof. Paulo Diniz).

Para que os jogadores tenham 100% de subsídio teórico durante a leitura, precisamos realizar pequenos acréscimos cirúrgicos nos 3 capítulos de `site/src/features/balanco/chapters`:

### 4.1 No Capítulo 1 (`AdministracaoPublicaChapter.jsx`)
- **Ajuste na Seção `#ciclo-orcamentario`:**  
  Uniformizar as etapas com a Fase 4 do jogo. Destacar visualmente no texto que a fase legislativa compreende tanto a *discussão/emendas* quanto a *votação e aprovação da LOA*.

### 4.2 No Capítulo 2 (`RelatoriosFiscaisChapter.jsx`)
- **Inclusão na Seção `#conceitos-fiscais` — Etapas da Despesa:**  
  Inserir um infográfico simples em 3 passos:
  1. **Empenho:** Reserva do dinheiro no orçamento (gera a Nota de Empenho);
  2. **Liquidação:** Conferência de que a obra foi feita ou o produto foi entregue (atesto na nota fiscal);
  3. **Pagamento:** Transferência financeira definitiva para o fornecedor.
- **Inclusão na Seção `#balanco-geral` — Noções de Patrimônio:**  
  Adicionar que o Balanço Geral também acompanha o patrimônio do Estado:
  - **Ativo:** Bens (escolas, hospitais, veículos) e direitos (impostos a receber);
  - **Passivo:** Dívidas fundadas, precatórios e obrigações a pagar.
- **Inclusão na Seção `#rgf` — O RREO e os Dois Relatórios da LRF:**  
  Adicionar um box comparativo:
  - **RREO (Bimestral):** Monitora se a arrecadação e os gastos estão no ritmo previsto da LOA.
  - **RGF (Quadrimestral):** Monitora se os limites máximos de gastos com pessoal e dívida estão sendo respeitados.
- **Inclusão na Seção `#painel-indicadores` — Resultado Primário x Nominal:**  
  Explicar brevemente que o *Resultado Primário* avalia a gestão sem considerar os juros da dívida, enquanto o *Resultado Nominal* inclui os juros pagos.

### 4.3 No Capítulo 3 (`ControleCidadaniaChapter.jsx`)
- **Ajuste na Seção `#controle-social` — Prazos da LAI:**  
  Mencionar expressamente que o cidadão tem direito a resposta rápida da Ouvidoria e dos pedidos de informação (prazo de até 20 dias, prorrogável por mais 10 mediante justificativa).

---

## 5. Implementação Prática da Integração Bidirecional

### 5.1 No Sentido Jogo → Balanço

#### A) Tela de Entrada do Jogo (`GameIntro.jsx`)
Antes do botão *"Começar missão"*, exibir um card destacando o que ler antes:

```jsx
{/* Bloco de Estudo Pré-Jogo */}
<div className="rounded-2xl bg-[#fdf6e3] border border-amber-800/25 p-3.5 my-3 text-left flex items-start gap-3 shadow-xs">
  <div className="size-9 rounded-xl bg-amber-800/10 text-amber-800 grid place-items-center shrink-0 text-lg">
    <Icon icon="solar:book-bookmark-bold-duotone" />
  </div>
  <div className="flex-1">
    <span className="text-[11px] font-black uppercase tracking-wider text-amber-800 block">
      Leitura recomendada
    </span>
    <p className="text-xs text-amber-950 font-bold leading-snug my-1">
      {studyInfo.cueText}
    </p>
    <Link
      to={`/balanco?book=${studyInfo.bookId}&section=${studyInfo.sectionId}`}
      className="inline-flex items-center gap-1.5 text-xs font-black text-amber-900 hover:text-amber-950 underline mt-1"
    >
      <span>Abrir "{studyInfo.sectionTitle}" no Balanço</span>
      <Icon icon="fa6-solid:arrow-up-right-from-square" className="text-[10px]" />
    </Link>
  </div>
</div>
```

#### B) Tela de Fim do Jogo (`GameFinish.jsx`)
Se a pontuação for `< 60` (reprovação) ou `stars < 2`, exibir o botão de reforço pedagógico:

```jsx
{/* Recuperação Pedagógica */}
{(!passed || stars < 2) && (
  <div className="rounded-2xl bg-amber-50/90 border-2 border-amber-800/20 p-4 my-3 text-left">
    <div className="flex items-center gap-2 text-amber-900 font-black text-xs mb-1">
      <Icon icon="solar:lightbulb-bolt-bold-duotone" className="text-amber-700 text-lg" />
      <span>Onde revisar esse conteúdo?</span>
    </div>
    <p className="text-xs text-amber-950 font-bold leading-relaxed mb-2.5">
      Ficou com dúvida? Dê uma olhada rápida na seção <strong>{studyInfo.sectionTitle}</strong> do Balanço Cidadão para mandar bem na próxima tentativa!
    </p>
    <Link
      to={`/balanco?book=${studyInfo.bookId}&section=${studyInfo.sectionId}`}
      className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-black text-xs no-underline shadow-xs transition"
    >
      <Icon icon="fa6-solid:book-open" />
      <span>Revisar no {studyInfo.bookTitle}</span>
    </Link>
  </div>
)}
```

---

### 5.2 No Sentido Balanço → Jogo ("Teste seus conhecimentos")

Nos três capítulos do Balanço, posicionam-se cards de desafio ao final dos tópicos chaves.

#### Componente Reutilizável: `<QuizChallengeBanner />`
```jsx
export function QuizChallengeBanner({ phaseId, phaseTitle, engineName, icon = "fa6-solid:gamepad", description }) {
  return (
    <aside className="my-7 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-50/90 via-orange-50/60 to-amber-100/70 border-2 border-amber-800/25 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
      <div className="flex items-start gap-3.5 text-left w-full sm:w-auto">
        <div className="size-11 rounded-xl bg-amber-800 text-amber-50 grid place-items-center shrink-0 text-xl shadow-xs mt-0.5">
          <Icon icon={icon} />
        </div>
        <div>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded-md mb-1">
            <Icon icon="fa6-solid:award" className="text-amber-700" />
            Teste seus conhecimentos · {engineName}
          </span>
          <h4 className="text-sm sm:text-base font-black text-amber-950 m-0 leading-tight">
            {phaseTitle}
          </h4>
          {description && (
            <p className="text-xs text-amber-900/80 font-bold mt-1 mb-0 leading-snug">
              {description}
            </p>
          )}
        </div>
      </div>
      <Link
        to={`/jogos/${phaseId}`}
        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-800 hover:to-amber-900 active:scale-95 text-white text-xs font-black no-underline shadow-md transition-all shrink-0 w-full sm:w-auto cursor-pointer"
      >
        <Icon icon="fa6-solid:play" />
        <span>Jogar desafio</span>
      </Link>
    </aside>
  );
}
```

#### Pontos de Inserção nos Capítulos:
1. **Capítulo 1 (Administração Pública):**
   - Ao final de `#administracao-publica`: Banner para a **Fase 1 (Caça-palavras do LIMPE)**.
   - Ao final de `#poderes-estado`: Banner para a **Fase 2 (Swipe: Esferas e Três Poderes)**.
   - Ao final de `#recurso-publico` (após o caso do PTE/MG): **Chamada para O Balanço na Prática (`/dados`)** — convite para ver como o transporte escolar e os recursos chegam aos 853 municípios.
   - No meio de `#ciclo-orcamentario` (após instrumentos): Banner para a **Fase 3 (Flow: Instrumentos PMDI/PPAG/LDO/LOA)**.
   - Ao final de `#ciclo-orcamentario`: Banner para a **Fase 4 (Ordem Correta: Etapas do Ciclo Orçamentário)**.

2. **Capítulo 2 (Relatórios Fiscais):**
   - Ao final de `#receitas-despesas`: Banners para a **Fase 5 (Flow: Receita x Despesa)** e **Fase 6 (Swipe: Despesa Corrente vs. Capital)**.
   - Ao final de `#conceitos-fiscais`: Banners para a **Fase 7 (Ordem Correta: Fases da Despesa)** e **Fase 8 (Swipe: Restos a Pagar)**.
   - Ao final de `#balanco-geral`: Banner para a **Fase 9 (Cruzadinha: Balanço Geral e Patrimônio)**.
   - Ao final de `#rgf`: Banner para a **Fase 10 (Flow: RREO vs. RGF)**.
   - Ao final de `#despesas-funcao`: **Chamada para O Balanço na Prática (`/dados`)** — convite para navegar nos gráficos de execução por Unidade Orçamentária e ODS.
   - Ao final de `#indices-constitucionais`: Banner para a **Fase 11 (Swipe: Índices Constitucionais de MG)**.
   - Ao final de `#painel-indicadores`: Banner para a **Fase 12 (Quiz: Mestre dos Relatórios Fiscais)** e **Chamada para O Balanço na Prática (`/dados`)** para acompanhar as notícias e análises de impacto real.

3. **Capítulo 3 (Controle e Cidadania):**
   - Ao final de `#controle-accountability`: Banner para a **Fase 13 (Flow: Controle Interno vs. Externo)**.
   - Ao final de `#direitos-deveres`: Banner para a **Fase 14 (Swipe: LAI e Transparência)**.
   - Ao final de `#controle-social`: Banners para a **Fase 15 (Cruzadinha: Cidadania e Ouvidoria)** e **Fase 16 (Quiz Final: Cidadão Consciente)**, além de convite para consultar os dados abertos do Estado em **O Balanço na Prática (`/dados`)**.

---

## 6. A Jornada Completa: Integração das 4 Trilhas do Portal

O site organiza-se em 4 trilhas complementares que formam uma jornada completa de cidadania:

```
[Trilha 1: História de MG] ────► [Trilha 2: O Balanço] ────► [Trilha 3: Na Prática] ────► [Trilha 4: Jogos]
     (/historia)                       (/balanco)                      (/dados)                    (/jogos)
  Raízes, território,              Conceitos fiscais,              Dados do SIGPLAN,           Fixação gamificada,
  cultura e diversidade            planejamento (SEPLAG)           notícias, análises          desafios e medalhas
  dos 853 municípios               e contabilidade (SEF)           e entregas reais            de aprendizado
```

Com os chamamentos recíprocos entre o Balanço (Trilha 2) e o Balanço na Prática (Trilha 3), o cidadão compreende a teoria, visualiza a entrega real do Estado no seu território e consolida o conhecimento nos jogos interativos.

---

## 7. Alterações Propostas no Banco de Dados (`mysql_schema.sql`)

### 7.1 Atualização de `tb_section` (Os 4 Mundos alinhados aos Livros)
```sql
UPDATE tb_section 
SET title = 'Administração Pública e Planejamento',
    description = 'Fundamentos da administração, três poderes e instrumentos orçamentários (Capítulo 1).'
WHERE id = 1;

UPDATE tb_section 
SET title = 'Receitas, Despesas e Execução',
    description = 'Entrada e saída de recursos, classificação de despesas e estágios de pagamento (Capítulo 2 · Parte 1).'
WHERE id = 2;

UPDATE tb_section 
SET title = 'Balanços, RGF e Indicadores de MG',
    description = 'Balanço geral, relatórios fiscais da LRF e índices constitucionais de Minas Gerais (Capítulo 2 · Parte 2).'
WHERE id = 3;

UPDATE tb_section 
SET title = 'Controle Social e Cidadania',
    description = 'Mecanismos de fiscalização, transparência ativa, LAI e participação cidadã (Capítulo 3).'
WHERE id = 4;
```

### 7.2 Adição de Metadados Didáticos em `tb_phase`
```sql
ALTER TABLE tb_phase
  ADD COLUMN balanco_book_id VARCHAR(40) NULL COMMENT 'chapter-1 | chapter-2 | chapter-3',
  ADD COLUMN balanco_section_slug VARCHAR(80) NULL COMMENT 'Anchor ID no leitor do balanco',
  ADD COLUMN balanco_cue_text VARCHAR(255) NULL COMMENT 'Texto curto de instrucao pré-jogo';
```

---

## 8. Próximos Passos de Execução

1. **Revisão e Aprovação da Matriz:** Validar a nova distribuição das 16 fases entre os 4 mundos.
2. **Atualização Textual do Balanço:** Implementar os 4 pequenos acréscimos conceituais nos componentes de capítulo (Etapas da Despesa, RREO, Ativo/Passivo e Prazos LAI).
3. **Deep Linking no React:** Habilitar suporte a `?book=...&section=...` no `BalancoPage.jsx`.
4. **Inserção dos Banners:** Adicionar o `<QuizChallengeBanner />` nas seções correspondentes dos capítulos.
5. **Atualização do `GameIntro` e `GameFinish`:** Integrar os cards de leitura prévia e revisão pós-erro.
