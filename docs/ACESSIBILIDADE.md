# Documentação de Acessibilidade — Balanço Cidadão

## 1. Visão geral

O sistema de acessibilidade do portal Balanço Cidadão é implementado como um **painel lateral deslizante (drawer)** que centraliza todos os recursos de personalização de navegação, leitura e inclusão digital.

O painel é ativado pelo botão **"Acessibilidade"** no cabeçalho (ou pelo atalho `Alt + 2`) e mantém as preferências do usuário entre sessões via `localStorage`.

---

## 2. Arquitetura

### 2.1 Arquivos principais

| Arquivo | Responsabilidade |
|---------|-----------------|
| [`AccessibilityContext.jsx`](../site/src/shared/contexts/AccessibilityContext.jsx) | Estado global, persistência e aplicação de atributos no `<html>` |
| [`AccessibilityDrawer.jsx`](../site/src/shared/components/a11y/AccessibilityDrawer.jsx) | Interface do painel de acessibilidade |
| [`ReadingGuide.jsx`](../site/src/shared/components/a11y/ReadingGuide.jsx) | Régua de leitura e guia de linha |
| [`SVGFilters.jsx`](../site/src/shared/components/a11y/SVGFilters.jsx) | Filtros SVG para simulação de daltonismo |
| [`themes.css`](../site/src/styles/themes.css) | Overrides CSS por tema, fonte, modo leitura e efeitos visuais |
| [`fonts.css`](../site/src/styles/fonts.css) | Declarações `@font-face` das fontes locais |
| [`Header.jsx`](../site/src/shared/components/layout/Header.jsx) | Botão de abertura do drawer no cabeçalho |

### 2.2 Persistência

As preferências são salvas no `localStorage` sob a chave:

```js
bc_a11y_preferences_v2
```

Preferências persistidas: escala de fonte, tipografia, espaçamento entre linhas, espaçamento entre letras, tema de cor, filtro de daltonismo, inverter cores, escala de cinza, destacar links, cursor grande, ocultar imagens, reduzir animações, régua de leitura, guia de leitura e modo leitura.

---

## 3. Painel de Acessibilidade (Drawer)

O painel é organizado em **4 abas**:

### Aba 1 — Navegação

Recursos de assistência à leitura e navegação:

| Recurso | Descrição |
|---------|-----------|
| **Leitor de Voz (TTS)** | Sintetizador de fala que lê o texto selecionado ou o conteúdo principal da página |
| **Destacar Links e Botões** | Adiciona sublinhado e fundo amarelo de contraste em todos os elementos clicáveis |
| **Régua de Leitura** | Faixa transparente de 68px que acompanha o mouse, com escurecimento e leve blur ao redor |
| **Guia de Linha de Leitura** | Linha horizontal de 280px que segue o cursor do mouse verticalmente |
| **Modo Leitura Limpo** | Remove backgrounds e elementos decorativos do `#main-content`, deixando apenas hierarquia tipográfica |
| **Cursor Grande** | Aumenta o tamanho do ponteiro do mouse |
| **Ocultar Imagens** | Esconde imagens e SVGs decorativos para focar na leitura de texto |
| **Reduzir Animações** | Desativa transições e efeitos de movimento |

### Aba 2 — Texto

| Recurso | Controles |
|---------|-----------|
| **Tamanho do Texto** | Slider de 80% a 150% em passos de 5% |
| **Espaçamento entre Linhas** | 5 níveis: Normal → Confortável (1.3x) → Amplo (1.6x) → Expandido (1.9x) → Extremo (2.2x) |
| **Espaçamento entre Letras** | 5 níveis: Normal → +0.04em → +0.08em → +0.12em → +0.16em |
| **Tipografia** | Seleção de fonte: Padrão (Nunito), Atkinson Hyperlegible, Lexend, OpenDyslexic |

> [!NOTE]
> Os cartões de tipografia exibem uma prévia do texto escrita na própria fonte do cartão. A fonte selecionada **não** sobrepõe as prévias das outras fontes no painel.

### Aba 3 — Cores

**Temas de cor da interface:**

| Tema | Descrição |
|------|-----------|
| Padrão | Claro institucional original (fundo branco, header vermelho SEF) |
| Modo Escuro | Fundo `#0f172a`, textos claros |
| Alto Contraste Escuro | Fundo preto, textos brancos e amarelos |
| Alto Contraste Claro | Fundo branco, textos e bordas pretos |
| Sépia / Conforto | Tons quentes amarelados |

**Filtros para daltonismo (SVG):**

| Filtro | Tipo de deficiência |
|--------|---------------------|
| Protanopia | Dificuldade de percepção do vermelho |
| Deuteranopia | Dificuldade de percepção do verde |
| Tritanopia | Dificuldade de percepção do azul |
| Acromatopsia | Visão monocromática (escala de cinza pura) |

> [!NOTE]
> Os filtros de daltonismo são **opcionais e alternáveis**: clicar novamente no filtro ativo o desativa. Não há seleção obrigatória.

**Modificações de cor:**
- **Inverter Cores** — aplica `invert(1) hue-rotate(180deg)` no `<html>`
- **Monocromático** — aplica `grayscale(100%)` no `<html>`

### Aba 4 — Atalhos

- **VLibras** — instrução para usar o widget flutuante disponível no **lado esquerdo da tela**
- **Atalhos de teclado** — referência rápida de navegação por teclado

---

## 4. Atalhos de Teclado

| Atalho | Ação |
|--------|------|
| `Alt + 1` | Ir para o Conteúdo Principal |
| `Alt + 2` | Abrir/fechar Painel de Acessibilidade |
| `Alt + 3` | Ativar VLibras |
| `Esc` | Fechar menus e janelas modais |
| `Tab` | Avançar entre elementos focáveis |
| `Shift + Tab` | Voltar entre elementos focáveis |

---

## 5. Como os atributos são aplicados

O `AccessibilityContext` aplica atributos diretamente no elemento `<html>`:

```js
// Fonte
document.documentElement.setAttribute('data-font', 'atkinson');

// Tema de cor
document.documentElement.setAttribute('data-theme', 'dark');

// Filtro de daltonismo
document.documentElement.setAttribute('data-color-blindness', 'protanopia');

// Modo leitura
document.documentElement.setAttribute('data-reading-mode', 'true');

// Efeitos
document.documentElement.setAttribute('data-invert-colors', 'true');
document.documentElement.setAttribute('data-grayscale', 'true');
document.documentElement.setAttribute('data-highlight-links', 'true');
document.documentElement.setAttribute('data-large-cursor', 'true');
document.documentElement.setAttribute('data-hide-images', 'true');
document.documentElement.setAttribute('data-reduce-motion', 'true');

// Espaçamento
document.documentElement.setAttribute('data-line-spacing', 'wide');
document.documentElement.setAttribute('data-letter-spacing', 'expanded');

// Escala de fonte via variável CSS
document.documentElement.style.setProperty('--font-scale', '1.25');
```

O CSS em [`themes.css`](../site/src/styles/themes.css) captura esses atributos e aplica os overrides correspondentes.

---

## 6. Modo Leitura

O **Modo Leitura Limpo** é ativado por `html[data-reading-mode='true']` e afeta **apenas o `#main-content`**:

- Remove `background`, `border`, `box-shadow` de todas as `div`s, `section`s e `article`s dentro do `#main-content`
- Oculta `img`, `svg` decorativos e `canvas`
- Remove pseudo-elementos decorativos (`::before`, `::after`)
- Aplica hierarquia tipográfica clara:
  - `h1`: 2.25rem, peso 800
  - `h2`: 1.75rem
  - `h3`: 1.35rem
  - `p`, `li`: cor `#334155`, espaçamento de 1.2em
- **Não afeta** o header, rodapé, barra lateral ou o drawer de acessibilidade

---

## 7. Filtros SVG para Daltonismo

Os filtros são definidos em [`SVGFilters.jsx`](../site/src/shared/components/a11y/SVGFilters.jsx) usando `<feColorMatrix>` e montados no `MainLayout`. Quando um filtro é selecionado, o `<html>` recebe o atributo `data-color-blindness` e o CSS aplica:

```css
html[data-color-blindness='protanopia'] {
  filter: url('#bc-filter-protanopia') !important;
}
```

---

## 8. VLibras

O widget do VLibras é carregado globalmente na aplicação. O painel de acessibilidade **não aciona diretamente** o VLibras — instrui o usuário a clicar no widget flutuante presente no lado esquerdo da tela.

---

## 9. Política de acessibilidade

A acessibilidade é tratada como requisito estrutural, não recurso opcional. O portal adota como referência técnica:

- **WCAG 2.2** — organizada nos princípios: Perceptível, Operável, Compreensível e Robusto
- **eMAG** — referência nacional para portais e serviços digitais brasileiros

Referências:
- WCAG 2 Overview: https://www.w3.org/WAI/standards-guidelines/wcag/
- eMAG: https://www.gov.br/governodigital/pt-br/acessibilidade-e-usuario/acessibilidade-digital/modelo-de-acessibilidade

---

## 10. Princípios obrigatórios

### Perceptível
- Texto alternativo em imagens informativas; `alt=""` em imagens decorativas
- Contraste adequado entre texto e fundo
- Conteúdo não dependente apenas de cor
- Layout funcional com zoom e aumento de fonte

### Operável
- Todo elemento interativo é acessível por teclado (`Tab`)
- Foco visual sempre visível
- Menus e modais fecháveis com `Escape`
- `aria-expanded` em menus expansivos

### Compreensível
- Campos de formulário com `<label>` associado
- Mensagens de erro com `aria-invalid` e texto descritivo
- Botões com nomes consistentes e descritivos

### Robusto
- HTML semântico correto
- Hierarquia lógica de títulos (`h1` → `h6`)
- Estados dinâmicos atualizados: `aria-expanded`, `aria-selected`, `aria-current`
- ARIA apenas quando elementos nativos HTML não atendem

---

## 11. Checklist de publicação

- [ ] Existe `<main id="main-content" tabindex="-1">` ou equivalente
- [ ] A página possui um único `<h1>`
- [ ] Títulos seguem ordem lógica
- [ ] Todos os campos possuem `<label>` associado
- [ ] Botões usam `<button>` nativo
- [ ] Links possuem texto descritivo (sem "Clique aqui")
- [ ] Imagens informativas possuem `alt`
- [ ] Imagens decorativas usam `alt=""`
- [ ] A página funciona inteiramente por teclado
- [ ] Foco visual é sempre visível
- [ ] Menus usam `aria-expanded`
- [ ] Erros de formulário usam `aria-invalid` e texto de apoio
- [ ] Conteúdo não depende apenas de cor
- [ ] Layout não quebra com zoom ou aumento de fonte
- [ ] Animações não são essenciais para entendimento do conteúdo

---

## 12. O que o painel de acessibilidade não substitui

O painel melhora a experiência, mas não corrige automaticamente HTML mal estruturado. Ele não substitui:

- Uso correto de `<label>` em formulários
- Textos alternativos em imagens
- Hierarquia correta de títulos
- Contraste adequado no design original
- Navegação por teclado dos componentes do site
- Mensagens de erro acessíveis
- Semântica correta de botões, links, listas e tabelas

A acessibilidade deve ser implementada em todo o HTML, CSS e JavaScript da aplicação.
