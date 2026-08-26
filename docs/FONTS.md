# Fontes do projeto (consolidadas)

Este projeto usa fontes locais consolidadas em [public/fonts](../public/fonts) com arquivo central de carregamento em [public/fonts/fonts.css](../public/fonts/fonts.css).

Objetivo:
- uso simples nas paginas
- compatibilidade ampla
- todos os conjuntos com pelo menos `woff2`

## Estrutura final

- [public/fonts/fonts.css](../public/fonts/fonts.css) (arquivo unico para importar)
- [public/fonts/opendyslexic](../public/fonts/opendyslexic)
- [public/fonts/fredoka](../public/fonts/fredoka)
- [public/fonts/fredoka-one](../public/fonts/fredoka-one)
- [public/fonts/caveat-brush](../public/fonts/caveat-brush)
- [public/fonts/nunito](../public/fonts/nunito)
- [public/fonts/nunito-sans](../public/fonts/nunito-sans)

## Como usar nas paginas

Adicione no `<head>` da pagina:

```html
<link rel="stylesheet" href="/public/fonts/fonts.css">
```

Se seu servidor nao usa caminho absoluto a partir da raiz, ajuste para relativo.
Exemplo comum:

```html
<link rel="stylesheet" href="../../public/fonts/fonts.css">
```

Depois, use as familias normalmente no CSS:

```css
h1, h2 {
	font-family: "Fredoka", sans-serif;
}

.texto {
	font-family: "Nunito", sans-serif;
}

.acessivel {
	font-family: "OpenDyslexic", Arial, sans-serif;
}
```

Tambem estao disponiveis variaveis CSS no `:root` de [public/fonts/fonts.css](../public/fonts/fonts.css):
- `--font-accessibility`
- `--font-title-rounded`
- `--font-title-handwritten`
- `--font-text`

## Fontes e links de download

### OpenDyslexic

Origem:
- https://opendyslexic.org/
- https://fontsource.org/fonts/opendyslexic

Downloads usados:
- https://cdn.jsdelivr.net/npm/@fontsource/opendyslexic/files/opendyslexic-latin-400-normal.woff2
- https://cdn.jsdelivr.net/npm/@fontsource/opendyslexic/files/opendyslexic-latin-400-normal.woff
- https://cdn.jsdelivr.net/npm/@fontsource/opendyslexic/files/opendyslexic-latin-700-normal.woff2
- https://cdn.jsdelivr.net/npm/@fontsource/opendyslexic/files/opendyslexic-latin-700-normal.woff
- https://cdn.jsdelivr.net/npm/@fontsource/opendyslexic/files/opendyslexic-latin-400-italic.woff2
- https://cdn.jsdelivr.net/npm/@fontsource/opendyslexic/files/opendyslexic-latin-400-italic.woff

### Fredoka

Origem:
- https://fonts.google.com/specimen/Fredoka

Downloads usados:
- https://cdn.jsdelivr.net/npm/@fontsource/fredoka/files/fredoka-latin-400-normal.woff2
- https://cdn.jsdelivr.net/npm/@fontsource/fredoka/files/fredoka-latin-400-normal.woff
- https://raw.githubusercontent.com/google/fonts/main/ofl/fredoka/Fredoka%5Bwdth%2Cwght%5D.ttf

### Fredoka One

Origem:
- https://fontsource.org/fonts/fredoka-one

Downloads usados:
- https://cdn.jsdelivr.net/npm/@fontsource/fredoka-one/files/fredoka-one-latin-400-normal.woff2
- https://cdn.jsdelivr.net/npm/@fontsource/fredoka-one/files/fredoka-one-latin-400-normal.woff

### Caveat Brush

Origem:
- https://fonts.google.com/specimen/Caveat+Brush?preview.script=Latn

Downloads usados:
- https://cdn.jsdelivr.net/npm/@fontsource/caveat-brush/files/caveat-brush-latin-400-normal.woff2
- https://cdn.jsdelivr.net/npm/@fontsource/caveat-brush/files/caveat-brush-latin-400-normal.woff
- https://raw.githubusercontent.com/google/fonts/main/ofl/caveatbrush/CaveatBrush-Regular.ttf

### Nunito

Origem:
- https://fonts.google.com/specimen/Nunito

Downloads usados:
- https://cdn.jsdelivr.net/npm/@fontsource/nunito/files/nunito-latin-400-normal.woff2
- https://cdn.jsdelivr.net/npm/@fontsource/nunito/files/nunito-latin-400-normal.woff
- https://raw.githubusercontent.com/google/fonts/main/ofl/nunito/Nunito%5Bwght%5D.ttf
- https://raw.githubusercontent.com/google/fonts/main/ofl/nunito/Nunito-Italic%5Bwght%5D.ttf

### Nunito Sans

Origem:
- https://fonts.google.com/specimen/Nunito+Sans

Downloads usados:
- https://cdn.jsdelivr.net/npm/@fontsource/nunito-sans/files/nunito-sans-latin-400-normal.woff2
- https://cdn.jsdelivr.net/npm/@fontsource/nunito-sans/files/nunito-sans-latin-400-normal.woff
- https://raw.githubusercontent.com/google/fonts/main/ofl/nunitosans/NunitoSans%5BYTLC%2Copsz%2Cwdth%2Cwght%5D.ttf
- https://raw.githubusercontent.com/google/fonts/main/ofl/nunitosans/NunitoSans-Italic%5BYTLC%2Copsz%2Cwdth%2Cwght%5D.ttf

## Compatibilidade recomendada

- `woff2` como formato principal (mais eficiente e amplamente suportado)
- `woff` como fallback para navegadores mais antigos
- `ttf/otf` mantidos como arquivo fonte adicional

O arquivo [public/fonts/fonts.css](../public/fonts/fonts.css) ja esta configurado com `font-display: swap` para melhorar carregamento percebido.