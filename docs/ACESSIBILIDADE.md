# Documentação do Componente de Acessibilidade

## 1. Visão geral

O componente de acessibilidade é uma barra fixa no topo do site que centraliza recursos de apoio à navegação, leitura e inclusão digital.

Ele é carregado por meio do arquivo `a11y.js` e injeta automaticamente:

- barra superior de acessibilidade;
- link de salto para o conteúdo principal;
- controles de aumento e redução de fonte;
- alto contraste;
- fonte legível;
- OpenDyslexic;
- aumento de espaçamento;
- destaque de links;
- redução de movimento;
- temas para daltonismo;
- integração com VLibras;
- persistência das preferências no navegador.

O componente melhora a experiência do usuário, mas não substitui a necessidade de HTML semântico, conteúdo bem estruturado e boas práticas de desenvolvimento acessível.

---

## 2. O componente `a11y.js`

### 2.1 Descrição breve

O `a11y.js` é um componente JavaScript autocontido. Ele deve ser importado no `head` da página e é responsável por injetar a interface de acessibilidade, os estilos necessários, o suporte ao VLibras e a lógica de persistência das preferências do usuário.

Exemplo de importação recomendado:

```html
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />

  <script src="/assets/js/a11y.js"></script>
</head>
```

---

### 2.2 Requisito obrigatório

O único requisito estrutural obrigatório para o funcionamento correto do componente é a existência de um conteúdo principal identificável.

Obrigatório:

```html
<main id="conteudo-principal" tabindex="-1">
  <h1>Título da página</h1>
</main>
```

Se o `id="conteudo-principal"` não existir, o script tenta aplicar esse identificador automaticamente ao primeiro elemento `<main>` encontrado. Mesmo assim, a recomendação técnica é declarar o `id` diretamente no HTML.

---

### 2.3 Estrutura recomendada da página

É recomendado que as páginas tenham `header`, `main` e `footer`, mas isso não é obrigatório para todas as páginas.

Recomendado:

```html
<header>
  <!-- identidade, navegação principal e busca -->
</header>

<main id="conteudo-principal" tabindex="-1">
  <!-- conteúdo principal da página -->
</main>

<footer>
  <!-- informações institucionais -->
</footer>
```

Obrigatório para o componente: somente o `<main id="conteudo-principal">` ou outro elemento equivalente com esse `id`.

---

### 2.4 Funcionalidades do componente

#### Link de salto

Adiciona um link “Pular para o conteúdo principal”, permitindo que usuários de teclado avancem diretamente para o conteúdo principal da página.

Requisito relacionado:

```html
<main id="conteudo-principal" tabindex="-1">...</main>
```

---

#### Aumentar fonte — `A+`

Aumenta gradualmente a escala global de fonte do documento por meio de variável CSS.

Comportamento técnico:

- altera o valor de `--a11y-font-scale`;
- limita o aumento dentro de uma faixa controlada;
- salva a preferência no `localStorage`.

---

#### Diminuir fonte — `A−`

Reduz gradualmente a escala global de fonte do documento.

Comportamento técnico:

- altera o valor de `--a11y-font-scale`;
- impede redução excessiva;
- salva a preferência no `localStorage`.

---

#### Contraste

Ativa um modo de alto contraste para melhorar a leitura e a distinção visual dos elementos.

Comportamento técnico:

- aplica a classe `a11y-high-contrast` no elemento `<html>`;
- força estilos prioritários em elementos da página;
- preserva a área do próprio componente e do VLibras;
- usa `MutationObserver` para manter o contraste em conteúdos inseridos dinamicamente.

---

#### VLibras

Carrega e inicializa o widget oficial do VLibras diretamente pelo script.

Comportamento técnico:

- injeta a estrutura HTML necessária do VLibras;
- carrega `https://vlibras.gov.br/app/vlibras-plugin.js`;
- inicializa `new window.VLibras.Widget(...)`;
- o botão `VLibras` aciona o botão interno do widget.

---

#### Mais opções

Abre o painel de opções avançadas de acessibilidade.

Comportamento técnico:

- controla `aria-expanded`;
- usa `aria-controls` apontando para o painel;
- reposiciona o painel de forma responsiva;
- permite fechamento por clique externo ou tecla `Escape`.

---

Substitua por este trecho:

#### Tema para daltonismo

Aplica temas visuais globais para ajustar a percepção de cores da página.

Opções disponíveis:

- tema padrão;
- deuteranopia;
- protanopia;
- tritanopia;
- monocromático.

Comportamento técnico na página:

- ao selecionar uma opção, o script atualiza `state.theme`;
- o script aplica uma classe no elemento `<html>`;
- a classe segue o padrão `a11y-theme-{tipo}`;
- apenas um tema fica ativo por vez;
- ao voltar para `Tema padrão`, as classes de tema são removidas;
- a preferência é salva no `localStorage`.

Classes aplicadas:

```html
<html class="a11y-theme-deuteranopia"></html>
```

```html
<html class="a11y-theme-protanopia"></html>
```

```html
<html class="a11y-theme-tritanopia"></html>
```

```html
<html class="a11y-theme-achromatopsia"></html>
```

Funcionamento visual:

- deuteranopia, protanopia e tritanopia aplicam filtros SVG globais;
- monocromático aplica escala de cinza e ajuste de contraste via CSS;
- os filtros afetam visualmente a página inteira, incluindo textos, imagens, fundos e botões;
- esses temas não substituem boas práticas de contraste e uso de informação além da cor.

---

#### Fonte legível

Aplica uma família tipográfica mais simples e legível aos principais elementos textuais.

Comportamento técnico:

- aplica a classe `a11y-readable-font` ao `<html>`;
- força família tipográfica baseada em Arial, Verdana e Tahoma.

---

#### OpenDyslexic

Aplica a fonte OpenDyslexic para usuários que preferem esse padrão de leitura.

Comportamento técnico:

- carrega a fonte por `@font-face`;
- aplica a classe `a11y-open-dyslexic` ao `<html>`;
- força a fonte nos principais elementos textuais e controles.

---

#### Espaçamento

Aumenta espaçamento entre letras, palavras e linhas.

Comportamento técnico:

- aplica a classe `a11y-large-spacing`;
- ajusta `letter-spacing`, `word-spacing` e `line-height`;
- exige que o HTML e o CSS da página aceitem quebra de linha e redimensionamento sem corte de conteúdo.

---

#### Destacar links

Torna links mais evidentes visualmente.

Comportamento técnico:

- aplica a classe `a11y-underline-links`;
- força sublinhado, espessura e afastamento visual do sublinhado.

---

#### Reduzir movimento

Reduz animações, transições e comportamentos com movimento.

Comportamento técnico:

- aplica a classe `a11y-reduced-motion`;
- remove ou reduz animações e transições;
- complementa a preferência do sistema `prefers-reduced-motion`.

---

#### Limpar

Restaura todas as preferências para o estado padrão.

Comportamento técnico:

- redefine o estado interno para os valores padrão;
- atualiza classes aplicadas ao `<html>`;
- fecha menus abertos;
- salva o estado limpo no `localStorage`.

---

### 2.5 Persistência das preferências

O componente salva as preferências no `localStorage` do navegador usando a chave:

```js
bc_a11y_preferences;
```

Preferências persistidas:

- tamanho da fonte;
- contraste;
- fonte legível;
- OpenDyslexic;
- espaçamento;
- destaque de links;
- redução de movimento;
- tema visual para daltonismo.

---

## 3. Política de acessibilidade do site

A acessibilidade deve ser tratada como requisito estrutural do site, não como recurso opcional.

O site deve garantir que todas as pessoas consigam:

- perceber o conteúdo;
- navegar e operar funcionalidades;
- compreender informações e fluxos;
- utilizar a aplicação com tecnologias assistivas;
- acessar conteúdo em diferentes dispositivos, tamanhos de tela e níveis de zoom.

A política de acessibilidade deve adotar como referência técnica:

- WCAG 2.2, organizada nos princípios perceptível, operável, compreensível e robusto;
- eMAG, como referência nacional para acessibilidade em portais e serviços digitais brasileiros.

Referências:

- WCAG 2 Overview: https://www.w3.org/WAI/standards-guidelines/wcag/
- Modelo de Acessibilidade em Governo Eletrônico - eMAG: https://www.gov.br/governodigital/pt-br/acessibilidade-e-usuario/acessibilidade-digital/modelo-de-acessibilidade

---

## 4. Princípios obrigatórios

### 4.1 Perceptível

O conteúdo deve estar disponível em formatos que possam ser percebidos por diferentes usuários e tecnologias assistivas.

Orientações:

- Use texto alternativo em imagens informativas.
- Use `alt=""` em imagens decorativas.
- Não transmita informação apenas por cor.
- Garanta contraste adequado entre texto e fundo.
- Mantenha o layout funcional com zoom e aumento de fonte.
- Forneça legendas para vídeos quando aplicável.
- Evite texto dentro de imagem quando o conteúdo puder ser HTML.

Exemplo de imagem informativa:

```html
<img
  src="grafico-arrecadacao.png"
  alt="Gráfico de arrecadação por mês em 2026"
/>
```

Exemplo de imagem decorativa:

```html
<img src="ornamento.svg" alt="" />
```

---

### 4.2 Operável

Todas as funcionalidades devem ser utilizáveis por teclado.

Orientações:

- Todo botão, link, campo e componente interativo deve receber foco via `Tab`.
- A ordem de foco deve seguir a ordem visual e lógica da página.
- O foco visual deve permanecer visível.
- Não dependa apenas de `hover`.
- Menus, modais e selects personalizados devem funcionar com teclado.
- O usuário deve conseguir fechar menus e painéis com `Escape`.

Exemplo correto:

```html
<button type="button" aria-expanded="false" aria-controls="menu-opcoes">
  Opções
</button>
```

Evite:

```html
<div onclick="abrirMenu()">Opções</div>
```

Preferência técnica: use elementos nativos sempre que possível.

---

### 4.3 Compreensível

A interface deve ser previsível, consistente e fácil de entender.

Orientações:

- Use linguagem direta.
- Mantenha nomes de botões consistentes.
- Campos de formulário devem ter `label` associado.
- Mensagens de erro devem indicar o problema e a ação necessária.
- Não altere contexto inesperadamente ao focar ou selecionar um item.
- Não esconda informações essenciais apenas em tooltip.

Exemplo de campo com rótulo:

```html
<label for="email">E-mail institucional</label>
<input id="email" name="email" type="email" autocomplete="email" />
```

Exemplo de erro acessível:

```html
<label for="cpf">CPF</label>
<input id="cpf" name="cpf" aria-describedby="erro-cpf" aria-invalid="true" />

<p id="erro-cpf">CPF inválido. Informe 11 números.</p>
```

---

### 4.4 Robusto

O HTML deve ser semanticamente correto para funcionar bem com navegadores, leitores de tela e outras tecnologias assistivas.

Orientações:

- Use HTML semântico.
- Mantenha hierarquia correta de títulos.
- Não duplique valores de `id`.
- Use ARIA apenas quando necessário.
- Não use ARIA para substituir elementos HTML nativos.
- Atualize estados dinâmicos, como `aria-expanded`, `aria-selected`, `aria-current` e `aria-invalid`.

Exemplo de navegação:

```html
<nav aria-label="Menu principal">
  <ul>
    <li><a href="/inicio">Início</a></li>
    <li><a href="/servicos">Serviços</a></li>
    <li><a href="/contato">Contato</a></li>
  </ul>
</nav>
```

---

## 5. Orientações para HTML acessível

### 5.1 Estrutura base da página

É recomendado que páginas completas tenham uma estrutura clara com `header`, `main` e `footer`.

```html
<header>
  <!-- identidade, navegação principal e busca -->
</header>

<main id="conteudo-principal" tabindex="-1">
  <!-- conteúdo principal da página -->
</main>

<footer>
  <!-- informações institucionais -->
</footer>
```

Entretanto, nem todas as páginas precisam ter `header` e `footer`. O obrigatório para o componente e para o link de salto é existir um conteúdo principal identificado.

Obrigatório:

```html
<main id="conteudo-principal" tabindex="-1">
  <h1>Título da página</h1>
</main>
```

---

### 5.2 Hierarquia de títulos

Use títulos em ordem lógica.

Correto:

```html
<h1>Relatório de Gestão</h1>

<h2>Resumo executivo</h2>

<h2>Indicadores</h2>

<h3>Arrecadação</h3>
```

Evite pular níveis sem necessidade:

```html
<h1>Relatório</h1>
<h4>Indicadores</h4>
```

---

### 5.3 Links

Links devem indicar destino ou ação de forma clara.

Correto:

```html
<a href="/relatorios/2026">Acessar relatório de 2026</a>
```

Evite:

```html
<a href="/relatorios/2026">Clique aqui</a>
```

Se o link abrir nova aba, informe no texto ou em texto auxiliar:

```html
<a href="https://www.gov.br" target="_blank" rel="noopener noreferrer">
  Acessar portal gov.br, abre em nova aba
</a>
```

---

### 5.4 Botões

Use `<button>` para ações executadas na própria página.

```html
<button type="button">Abrir filtros</button>
```

Use `<a>` para navegação.

```html
<a href="/servicos"> Ver serviços disponíveis </a>
```

Não use `div` ou `span` como botão, exceto em casos tecnicamente inevitáveis.

---

### 5.5 Formulários

Todo campo deve ter rótulo associado.

```html
<label for="nome">Nome completo</label>
<input id="nome" name="nome" type="text" autocomplete="name" />
```

Campos obrigatórios devem informar a obrigatoriedade.

```html
<label for="email">E-mail obrigatório</label>
<input id="email" name="email" type="email" required autocomplete="email" />
```

Agrupe opções relacionadas com `fieldset` e `legend`.

```html
<fieldset>
  <legend>Tipo de atendimento</legend>

  <label>
    <input type="radio" name="tipo" value="presencial" />
    Presencial
  </label>

  <label>
    <input type="radio" name="tipo" value="online" />
    Online
  </label>
</fieldset>
```

---

### 5.6 Imagens e ícones

Imagem informativa:

```html
<img src="organograma.png" alt="Organograma da unidade administrativa" />
```

Imagem decorativa:

```html
<img src="linha-decorativa.svg" alt="" />
```

Ícone dentro de botão:

```html
<button type="button" aria-label="Abrir menu">
  <svg aria-hidden="true" focusable="false">...</svg>
</button>
```

---

### 5.7 Componentes dinâmicos

Menus expansivos devem controlar estado com `aria-expanded`.

```html
<button type="button" aria-expanded="false" aria-controls="menu-servicos">
  Serviços
</button>

<div id="menu-servicos" hidden>
  <a href="/servico-1">Serviço 1</a>
  <a href="/servico-2">Serviço 2</a>
</div>
```

Quando abrir:

```html
<button type="button" aria-expanded="true" aria-controls="menu-servicos">
  Serviços
</button>

<div id="menu-servicos">...</div>
```

---

### 5.8 Tabelas

Use tabelas apenas para dados tabulares.

```html
<table>
  <caption>
    Execução orçamentária por trimestre
  </caption>
  <thead>
    <tr>
      <th scope="col">Trimestre</th>
      <th scope="col">Valor previsto</th>
      <th scope="col">Valor executado</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">1º trimestre</th>
      <td>R$ 100.000</td>
      <td>R$ 92.000</td>
    </tr>
  </tbody>
</table>
```

Não use tabela para layout.

---

### 5.9 Conteúdo oculto

Para texto visualmente oculto, mas disponível a leitores de tela, use classe utilitária.

```html
<span class="sr-only">Abre em nova aba</span>
```

Para conteúdo realmente indisponível, use `hidden`.

```html
<div hidden>Conteúdo fechado</div>
```

---

### 5.10 Movimento e animações

Animações não devem ser obrigatórias para compreender o conteúdo.

Orientações:

- Evite animações fortes, piscantes ou contínuas.
- Respeite preferências de redução de movimento.
- Não use conteúdo piscante de alta intensidade.
- Forneça alternativa estática quando necessário.

O componente possui a opção `Reduzir movimento`, que aplica uma classe global para reduzir animações e transições.

---

## 6. Integração do componente

### 6.1 Instalação

Importe o script no `head` da página:

```html
<head>
  <script src="/assets/js/a11y.js"></script>
</head>
```

O componente injeta automaticamente a interface e os recursos necessários.

---

### 6.2 Requisito mínimo no HTML

Toda página deve conter um `<main>` ou um elemento com `id="conteudo-principal"`.

Recomendado:

```html
<main id="conteudo-principal" tabindex="-1">
  <h1>Página inicial</h1>
</main>
```

---

### 6.3 VLibras

O próprio `a11y.js` injeta a estrutura do VLibras e carrega o script oficial:

```js
https://vlibras.gov.br/app/vlibras-plugin.js
```

Não é necessário adicionar manualmente o HTML do VLibras na página.

Observação técnica: o VLibras deve ser validado em ambiente HTTP ou HTTPS. Testes em `about:blank` podem falhar por restrições de contexto e carregamento de recursos externos.

---

## 7. O que o componente não substitui

O componente não corrige automaticamente HTML mal estruturado.

Ele não substitui:

- uso correto de `label`;
- textos alternativos em imagens;
- ordem lógica de títulos;
- contraste adequado no design original;
- navegação por teclado dos componentes do site;
- mensagens de erro acessíveis;
- semântica correta de botões, links, listas e tabelas.

A acessibilidade deve ser implementada no HTML, CSS e JavaScript de toda a aplicação.

---

## 8. Checklist para desenvolvimento

Antes de publicar uma página, valide:

- [ ] Existe um `<main>` ou elemento com `id="conteudo-principal"`.
- [ ] A página possui um único `<h1>` quando aplicável ao tipo de página.
- [ ] Os títulos seguem ordem lógica.
- [ ] Todos os campos possuem `<label>`.
- [ ] Botões usam `<button>`.
- [ ] Links possuem texto descritivo.
- [ ] Imagens informativas possuem `alt`.
- [ ] Imagens decorativas usam `alt=""`.
- [ ] A página funciona por teclado.
- [ ] O foco visual é visível.
- [ ] Menus usam `aria-expanded`.
- [ ] Abas usam `aria-selected`, quando aplicável.
- [ ] Erros de formulário usam `aria-invalid` e texto de apoio.
- [ ] O conteúdo não depende apenas de cor.
- [ ] O layout não quebra com zoom ou aumento de fonte.
- [ ] Animações não são essenciais para entendimento.
- [ ] O site funciona com leitor de tela.
- [ ] O `a11y.js` é importado no `head`.
- [ ] O `a11y.js` é carregado apenas uma vez.

---

## 9. Critério de aceite

Uma página é considerada adequada para publicação quando:

1. O conteúdo principal é navegável por teclado.
2. Existe um `main` ou elemento equivalente com `id="conteudo-principal"`.
3. A estrutura semântica do HTML está correta para o tipo de página.
4. Os controles interativos possuem nome, função e estado acessíveis.
5. As preferências do componente funcionam sem quebrar o layout.
6. O VLibras carrega corretamente em ambiente HTTP ou HTTPS.
7. O site mantém aderência a WCAG como referência técnica e ao eMAG como referência para o contexto brasileiro.
