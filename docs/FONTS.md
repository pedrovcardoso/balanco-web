# Fontes do projeto

Este projeto usa fontes locais consolidadas em `site/src/assets/fonts/` com arquivo central de carregamento em [`site/src/styles/fonts.css`](../site/src/styles/fonts.css).

## Objetivos

- Auto-hospedagem local das fontes (sem dependência de CDN externo em produção)
- Compatibilidade ampla com `woff2` como formato principal
- Suporte a fontes de acessibilidade selecionáveis pelo painel de acessibilidade

---

## Estrutura de arquivos

```
site/src/
├── assets/fonts/
│   ├── atkinson-hyperlegible/     ← Atkinson Hyperlegible (acessibilidade)
│   ├── caveat-brush/              ← Caligrafia decorativa
│   ├── fredoka/                   ← Títulos arredondados
│   ├── fredoka-one/               ← Títulos arredondados (peso único)
│   ├── lexend/                    ← Fonte de leitura rápida (acessibilidade)
│   ├── nunito/                    ← Fonte padrão do portal
│   ├── nunito-sans/               ← Variante sem serifa
│   └── opendyslexic/              ← Fonte para dislexia (acessibilidade)
└── styles/
    └── fonts.css                  ← Arquivo central com @font-face + variáveis CSS
```

---

## Como funciona

O arquivo [`fonts.css`](../site/src/styles/fonts.css) é importado no bundle principal e declara todos os `@font-face`. As variáveis CSS ficam disponíveis globalmente:

```css
:root {
  --font-nunito: "Nunito", "Nunito Sans", system-ui, sans-serif;
  --font-fredoka: "Fredoka", "Fredoka One", "Nunito", sans-serif;
  --font-caveat: "Caveat Brush", "Fredoka", cursive;
}
```

E via `@theme` para Tailwind CSS v4:

```css
@theme {
  --font-sans: "Nunito", system-ui, sans-serif;
  --font-display: "Fredoka", "Nunito", sans-serif;
}
```

---

## Fontes do projeto

### Nunito *(fonte padrão do portal)*

Usada em `body`, `button`, `input`, `select`, `textarea` — é a tipografia base do portal.

- Origem: https://fonts.google.com/specimen/Nunito
- Arquivos: `Nunito-wght.ttf` (variável), `nunito-latin-400-normal.woff2`, `.woff`
- Itálico: `Nunito-Italic-wght.ttf`
- Pesos: 200–1000 (variável)
- `font-display: swap`

---

### Fredoka *(títulos e headings)*

Aplicada em `h1`–`h6`, `.font-display`, `.font-fredoka`.

- Origem: https://fonts.google.com/specimen/Fredoka
- Arquivos: `Fredoka-wdth-wght.ttf` (variável), `fredoka-latin-400-normal.woff2`, `.woff`
- Pesos: 300–700 (variável)
- `font-display: swap`

---

### Fredoka One

Variante de peso único da Fredoka.

- Origem: https://fontsource.org/fonts/fredoka-one
- Arquivos: `fredoka-one-latin-400-normal.woff2`, `.woff`
- Peso: 400
- `font-display: swap`

---

### Caveat Brush *(títulos manuscritos)*

Fonte caligrafia decorativa, usada em elementos especiais de destaque.

- Origem: https://fonts.google.com/specimen/Caveat+Brush
- Arquivos: `CaveatBrush-Regular.ttf`, `caveat-brush-latin-400-normal.woff2`, `.woff`
- Peso: 400
- `font-display: swap`

---

### Nunito Sans

Variante de Nunito sem serifa arredondada — usada em contextos técnicos.

- Origem: https://fonts.google.com/specimen/Nunito+Sans
- Arquivos: `NunitoSans-YTLC-opsz-wdth-wght.ttf`, `nunito-sans-latin-400-normal.woff2`, `.woff`
- `font-display: swap`

---

## Fontes de acessibilidade

Estas fontes são selecionáveis pelo usuário via **painel de acessibilidade** (aba "Texto"). A seleção é aplicada globalmente por meio do atributo `data-font` no `<html>` e regras em [`themes.css`](../site/src/styles/themes.css).

---

### Padrão *(Nunito)*

Seleção padrão do portal. Não altera o `data-font`.

---

### Atkinson Hyperlegible

Desenvolvida pela Braille Institute para máxima distinção entre caracteres semelhantes (ex: `b/d`, `p/q`, `l/I/1`).

- Seleção no painel: "Atkinson Hyperlegible"
- Atributo aplicado: `html[data-font="atkinson"]`
- Origem: https://brailleinstitute.org/freefont
- Arquivos locais:
  - `site/src/assets/fonts/atkinson-hyperlegible/AtkinsonHyperlegibleRegular102.ttf`
  - `site/src/assets/fonts/atkinson-hyperlegible/AtkinsonHyperlegibleBold102.ttf`
  - `site/src/assets/fonts/atkinson-hyperlegible/AtkinsonHyperlegibleItalic102.ttf`
  - `site/src/assets/fonts/atkinson-hyperlegible/AtkinsonHyperlegibleBoldItalic102.ttf`

> [!NOTE]
> A regra CSS usa `:not([role="dialog"] *)` para preservar as prévias de fontes no painel de acessibilidade.

---

### Lexend

Projetada para melhorar a velocidade e o conforto de leitura, com espaçamento otimizado entre letras.

- Seleção no painel: "Lexend"
- Atributo aplicado: `html[data-font="lexend"]`
- Origem: https://fonts.google.com/specimen/Lexend
- Arquivos locais:
  - `site/src/assets/fonts/lexend/Lexend-VariableFont_wght.ttf` (variável, pesos 100–900)
  - `site/src/assets/fonts/lexend/Lexend-Regular.ttf` (fallback)

---

### OpenDyslexic

Desenvolvida com base mais pesada para reduzir a troca ou rotação mental de letras, amplamente utilizada por pessoas com dislexia.

- Seleção no painel: "OpenDyslexic"
- Atributo aplicado: `html[data-font="opendyslexic"]`
- Origem: https://opendyslexic.org/
- Arquivos locais:
  - `site/src/assets/fonts/opendyslexic/opendyslexic-latin-400-normal.woff2`, `.woff`
  - `site/src/assets/fonts/opendyslexic/opendyslexic-latin-700-normal.woff2`, `.woff`
  - `site/src/assets/fonts/opendyslexic/opendyslexic-latin-400-italic.woff2`, `.woff`

---

## Como a troca de fonte funciona

A troca é controlada pelo `AccessibilityContext` → `data-font` no `<html>`:

```js
// AccessibilityContext.jsx
document.documentElement.setAttribute('data-font', font); // 'atkinson' | 'lexend' | 'opendyslexic' | 'default'
```

O CSS em `themes.css` aplica a fonte globalmente, excluindo o drawer:

```css
html[data-font='atkinson'] body *:not([role="dialog"] *) {
  font-family: 'Atkinson Hyperlegible', Nunito, sans-serif !important;
}
```

---

## Compatibilidade

| Formato | Suporte | Prioridade |
|---------|---------|------------|
| `woff2` | Todos os navegadores modernos | Principal |
| `woff`  | IE 11+ | Fallback |
| `ttf`/`otf` | Fontes variáveis e fonte adicional | Complementar |

Todas as fontes usam `font-display: swap` para exibir a fonte de sistema enquanto a fonte local carrega.