# Balanço Cidadão Web

Balanço Cidadão Web é um site educativo em desenvolvimento para apoiar o programa de educação fiscal de Minas Gerais. O projeto busca apresentar o conteúdo do Balanço Geral do Estado em linguagem simples, com recursos de acessibilidade e uma experiência gamificada.

## Objetivo

- Tornar o Balanço Cidadão mais acessível e compreensível ao público geral.
- Oferecer uma navegação mobile-first e responsiva.
- Combinar conteúdos educativos, jogos interativos e certificação de conclusão.

## Visão geral do produto

O site será estruturado em quatro trilhas principais:

1. História em quadrinhos lúdica sobre o que é o balanço e sua identificação.
2. Conteúdo simplificado sobre o Balanço Geral, com explicações e dados resumidos.
3. Trilha de jogos com um mapa de 16 fases organizadas em quatro seções temáticas:
   - Administração Pública
   - Receitas e Despesas
   - Execução Orçamentária
   - Transparência e Controle Social
4. Página de créditos e saiba mais, com referências e informações adicionais.

O projeto também terá páginas de conquistas e um certificado final, liberado somente após a conclusão de todas as quatro trilhas.

## Arquitetura do MVP

- Tecnologias: HTML, Tailwind CSS e JavaScript Vanilla.
- Estrutura: páginas construídas em arquivos HTML únicos, com CSS e scripts integrados.
- Componentes: utilizados apenas para elementos repetidos, como recursos de acessibilidade, rodapé e fundo.

## Acessibilidade

- O projeto inclui uma camada de acessibilidade implementada em `src/components/a11y.js`.
- Recursos previstos: navegação por teclado, alto contraste, tipografia legível e compatibilidade com leitores de tela.

## Integração de dados

- O banco de dados será SQL Server no Fabric, com integração para armazenar dados de usuários, conteúdo, jogos e progresso.
- Para o MVP, o acesso aos dados também será feito via Power Automate Cloud.

## Documentação do banco de dados

A documentação do esquema de banco está disponível em:

- `docs/BANCO_DE_DADOS.md`

O esquema completo de banco de dados também está em `src/components/schema.sql`.

## Futuro

- Autenticação via gov.br para emissão segura de certificados.
