# Integração StPageFlip

Arquivos prontos para substituir a página atual.

- `vendor/page-flip.browser.js`: StPageFlip 2.0.7 local.
- `index.html`: carrega a biblioteca antes de `script.js`.
- `script.js`: integração com navegação, progresso, transcrição, conclusão e restauração.
- `styles.css`: adaptação responsiva.

## Mapeamento das caixas

Os hotspots continuam usando `left`, `top`, `width` e `height` em porcentagem sobre a própria página. A imagem e a camada `.speech-layer` ocupam exatamente 100% da página, mantendo a correspondência do JSON.

## Observação

Mantenha estes arquivos no mesmo diretório da implementação original. As rotas de imagens, JSON e componentes continuam relativas à estrutura atual do projeto.

## Ajuste 2

- A prévia de virada ao passar o mouse pelos cantos foi desativada (`showPageCorners: false`).
- Clique simples na página não vira mais a folha (`disableFlipByClick: true`).
- A animação ocorre por pressão e arraste; os botões continuam funcionando.
- No mobile, a ordem dos controles foi fixada: Voltar à esquerda, Avançar à direita e Transcrição abaixo.
- O tempo da animação mobile foi reduzido para 420 ms.

## Ajuste 3

- A proporção do livro agora é obtida da dimensão natural da primeira imagem.
- A imagem usa `object-fit: cover`, eliminando faixas brancas residuais.
- O gesto mobile começa no `touchstart`; a folha acompanha o dedo durante o arraste.
- O arraste pode começar sobre as caixas mapeadas, sem alterar as coordenadas percentuais.
- A distância mínima do gesto foi reduzida para 18 px e funciona nos dois sentidos.
