# Catálogo de dados — SIGPLAN/MG

## 1. Objetivo

Este documento descreve as tabelas do SIGPLAN carregadas no Lakehouse `lh_Sigplan`. O conjunto reúne dados cadastrais e metas do PPAG 2024–2027, localizadores territoriais, indicadores e a execução regionalizada por ação referente a 2026.

## 2. Convenções

- **Banco/Lakehouse:** `lh_Sigplan`.
- **Schema no SQL Analytics Endpoint:** `dbo`.
- Em notebooks Spark de Lakehouses sem schemas, as tabelas podem ser referenciadas somente pelo nome.
- Sufixos `ano0`, `ano1`, `ano2` e `ano3` correspondem, respectivamente, a **2024, 2025, 2026 e 2027**.
- Prefixo `is_` representa campo booleano.
- Sufixo `_cod` representa código; `_desc` e `_nome` representam descrição.
- Valores orçamentários estão em reais, salvo mudança na origem.

## 3. Visão geral

| Tabela                                      | Granularidade esperada       | Finalidade                                                       |
| ------------------------------------------- | ---------------------------- | ---------------------------------------------------------------- |
| `programas_planejamento`                    | Programa                     | Cadastro, estratégia e metas orçamentárias dos programas.        |
| `acoes_planejamento`                        | Ação                         | Cadastro, classificação e metas físicas/orçamentárias das ações. |
| `indicadores_planejamento`                  | Indicador de programa        | Indicadores, referências, previsões e regras de apuração.        |
| `localizadores_todos_planejamento`          | Ação e localizador/município | Regionalização planejada das ações e metas por território.       |
| `sigplan_execucao_regionalizada_2026`       | Programa, ação, UO e região  | Execução física e orçamentária regionalizada em 2026.            |
| `sigplan_execucao_regionalizada_2026_erros` | Ocorrência por programa      | Auditoria de falhas ou respostas sem dados durante a coleta.     |

---

## 4. `programas_planejamento`

**Origem:** `https://www.sigplan.mg.gov.br/BasesTxt/programas_planejamento.txt`

**Uso:** dimensão principal de programas do PPAG. Contém responsáveis, objetivos, diretrizes, estratégia e previsão orçamentária anual.

**Chave candidata:** `programa_cod`.

### Dicionário de colunas

| Coluna                          | Tipo      | Descrição                                          |
| ------------------------------- | --------- | -------------------------------------------------- |
| `programa_cod`                  | `INT`     | Código do programa.                                |
| `programa_desc`                 | `STRING`  | Nome do programa.                                  |
| `is_deleted_programa`           | `BOOLEAN` | Indica exclusão lógica do programa.                |
| `is_new_programa`               | `BOOLEAN` | Indica programa novo.                              |
| `area_tematica_cod`             | `STRING`  | Código da área temática.                           |
| `area_tematica_desc`            | `STRING`  | Descrição da área temática.                        |
| `objetivo_estrategico_cod`      | `INT`     | Código do objetivo estratégico.                    |
| `objetivo_estrategico_desc`     | `STRING`  | Descrição do objetivo estratégico.                 |
| `diretriz_estrategica_cod`      | `STRING`  | Código da diretriz estratégica.                    |
| `diretriz_estrategica_desc`     | `STRING`  | Descrição da diretriz estratégica.                 |
| `justificativa_is_new_programa` | `STRING`  | Justificativa de inclusão ou exclusão do programa. |
| `orgao_programa_cod`            | `INT`     | Código do órgão responsável pelo programa.         |
| `orgao_programa_nome`           | `STRING`  | Nome do órgão responsável pelo programa.           |
| `uo_programa_cod`               | `INT`     | Código da UO responsável pelo programa.            |
| `uo_programa_nome`              | `STRING`  | Nome da UO responsável pelo programa.              |
| `objetivo`                      | `STRING`  | Objetivo do programa.                              |
| `justificativa`                 | `STRING`  | Justificativa do programa.                         |
| `tipo_de_programa`              | `STRING`  | Tipo do programa.                                  |
| `horizonte_temporal`            | `STRING`  | Horizonte temporal.                                |
| `estrategia_de_implementacao`   | `STRING`  | Estratégia de implementação.                       |
| `ua_programa_nome`              | `STRING`  | Unidade administrativa responsável pelo programa.  |
| `vr_meta_orcamentaria_ano0`     | `DOUBLE`  | Previsão orçamentária de 2024.                     |
| `vr_meta_orcamentaria_ano1`     | `DOUBLE`  | Previsão orçamentária de 2025.                     |
| `vr_meta_orcamentaria_ano2`     | `DOUBLE`  | Previsão orçamentária de 2026.                     |
| `vr_meta_orcamentaria_ano3`     | `DOUBLE`  | Previsão orçamentária de 2027.                     |
| `is_programa_transposto`        | `BOOLEAN` | Indica programa transposto.                        |
| `causas`                        | `STRING`  | Causas associadas ao programa.                     |
| `ods_titulo`                    | `STRING`  | Título do Objetivo de Desenvolvimento Sustentável. |
| `ods_subtitulo`                 | `STRING`  | Subtítulo do ODS.                                  |

---

## 5. `acoes_planejamento`

**Origem:** `https://www.sigplan.mg.gov.br/BasesTxt/acoes_planejamento.txt`

**Uso:** dimensão de ações do PPAG, incluindo classificação funcional, responsáveis, produto, público-alvo e metas anuais.

**Chave candidata:** combinação de `uo_acao_cod`, `programa_cod` e `acao_cod`. A unicidade deve ser validada antes de uso como chave primária.

### Dicionário de colunas

| Coluna                          | Tipo      | Descrição                                          |
| ------------------------------- | --------- | -------------------------------------------------- |
| `programa_cod`                  | `INT`     | Código do programa no PPAG.                        |
| `programa_desc`                 | `STRING`  | Nome do programa.                                  |
| `area_tematica_cod`             | `STRING`  | Código da área temática.                           |
| `area_tematica_desc`            | `STRING`  | Descrição da área temática.                        |
| `is_deleted_programa`           | `BOOLEAN` | Indica exclusão lógica do programa.                |
| `is_new_programa`               | `BOOLEAN` | Indica programa novo.                              |
| `justificativa_is_new_programa` | `STRING`  | Justificativa de inclusão ou exclusão do programa. |
| `uo_programa_cod`               | `INT`     | Código da UO responsável pelo programa.            |
| `uo_programa_nome`              | `STRING`  | Nome da UO responsável pelo programa.              |
| `uo_acao_cod`                   | `INT`     | Código da UO responsável pela ação.                |
| `uo_acao_nome`                  | `STRING`  | Nome da UO responsável pela ação.                  |
| `funcao_cod`                    | `INT`     | Código da função orçamentária.                     |
| `funcao_desc`                   | `STRING`  | Descrição da função orçamentária.                  |
| `subfuncao_cod`                 | `INT`     | Código da subfunção orçamentária.                  |
| `subfuncao_desc`                | `STRING`  | Descrição da subfunção orçamentária.               |
| `identificador_tipo_acao_cod`   | `INT`     | Código do tipo de ação.                            |
| `identificador_tipo_acao_desc`  | `STRING`  | Descrição do tipo de ação.                         |
| `acao_cod`                      | `INT`     | Código da ação no PPAG.                            |
| `acao_desc`                     | `STRING`  | Título da ação.                                    |
| `iag_cod`                       | `INT`     | Código do Identificador de Ação Governamental.     |
| `iag_desc`                      | `STRING`  | Descrição do IAG.                                  |
| `projeto_estrategico_cod`       | `STRING`  | Código do projeto estratégico.                     |
| `projeto_estrategico`           | `STRING`  | Descrição do projeto estratégico.                  |
| `is_deleted_acao`               | `BOOLEAN` | Indica exclusão lógica da ação.                    |
| `is_new_acao`                   | `BOOLEAN` | Indica ação nova.                                  |
| `justificativa_is_new_acao`     | `STRING`  | Justificativa de inclusão ou exclusão da ação.     |
| `is_transferida_sisor`          | `BOOLEAN` | Indica transferência da ação para o SISOR.         |
| `ua_acao_nome`                  | `STRING`  | Unidade administrativa responsável pela ação.      |
| `base_legal`                    | `STRING`  | Base legal da ação.                                |
| `acao_finalidade`               | `STRING`  | Finalidade da ação.                                |
| `acao_descricao`                | `STRING`  | Descrição detalhada da ação.                       |
| `publico_alvo_cod`              | `INT`     | Código do público-alvo.                            |
| `publico_alvo_desc`             | `STRING`  | Descrição do público-alvo.                         |
| `produto_cod`                   | `INT`     | Código do produto.                                 |
| `produto_desc`                  | `STRING`  | Descrição do produto.                              |
| `produto_especificacao`         | `STRING`  | Especificação do produto.                          |
| `produto_unidade_medida_cod`    | `INT`     | Código da unidade de medida do produto.            |
| `produto_unidade_medida_desc`   | `STRING`  | Descrição da unidade de medida do produto.         |
| `vr_meta_orcamentaria_ano0`     | `DOUBLE`  | Previsão orçamentária de 2024.                     |
| `vr_meta_orcamentaria_ano1`     | `DOUBLE`  | Previsão orçamentária de 2025.                     |
| `vr_meta_orcamentaria_ano2`     | `DOUBLE`  | Previsão orçamentária de 2026.                     |
| `vr_meta_orcamentaria_ano3`     | `DOUBLE`  | Previsão orçamentária de 2027.                     |
| `vr_meta_fisica_ano0`           | `INT`     | Previsão física de 2024.                           |
| `vr_meta_fisica_ano1`           | `INT`     | Previsão física de 2025.                           |
| `vr_meta_fisica_ano2`           | `INT`     | Previsão física de 2026.                           |
| `vr_meta_fisica_ano3`           | `INT`     | Previsão física de 2027.                           |
| `is_acao_transposta`            | `BOOLEAN` | Indica ação transposta.                            |
| `setor_governo`                 | `STRING`  | Setor de governo associado à ação.                 |

---

## 6. `indicadores_planejamento`

**Origem:** `https://www.sigplan.mg.gov.br/BasesTxt/indicadores_planejamento.txt`

**Uso:** indicadores vinculados aos programas, com índice de referência, previsões, fonte, periodicidade, base geográfica e fórmula.

**Chave candidata:** `programa_cod` mais `indicador`. Pode haver alterações ou versões do mesmo indicador.

### Dicionário de colunas

| Coluna                                     | Tipo      | Descrição                                          |
| ------------------------------------------ | --------- | -------------------------------------------------- |
| `programa_cod`                             | `INT`     | Código do programa.                                |
| `programa_nome`                            | `STRING`  | Nome do programa.                                  |
| `is_deleted_programa`                      | `BOOLEAN` | Indica exclusão lógica do programa.                |
| `indicador`                                | `STRING`  | Nome ou descrição do indicador.                    |
| `is_deleted_indicador`                     | `BOOLEAN` | Indica exclusão lógica do indicador.               |
| `unidade_de_medida`                        | `STRING`  | Unidade de medida do indicador.                    |
| `indice_de_referencia`                     | `DOUBLE`  | Índice de referência.                              |
| `is_em_apuracao_indice_de_referencia`      | `BOOLEAN` | Indica índice de referência em apuração.           |
| `dt_apuracao`                              | `STRING`  | Data de apuração informada na origem.              |
| `previsao_para_ano0`                       | `DOUBLE`  | Previsão do indicador para 2024.                   |
| `is_em_apuracao_ano0`                      | `BOOLEAN` | Indica previsão de 2024 em apuração.               |
| `previsao_para_ano1`                       | `DOUBLE`  | Previsão do indicador para 2025.                   |
| `is_em_apuracao_ano1`                      | `BOOLEAN` | Indica previsão de 2025 em apuração.               |
| `previsao_para_ano2`                       | `DOUBLE`  | Previsão do indicador para 2026.                   |
| `is_em_apuracao_ano2`                      | `BOOLEAN` | Indica previsão de 2026 em apuração.               |
| `previsao_para_ano3`                       | `DOUBLE`  | Previsão do indicador para 2027.                   |
| `is_em_apuracao_ano3`                      | `BOOLEAN` | Indica previsão de 2027 em apuração.               |
| `fonte`                                    | `STRING`  | Fonte do indicador.                                |
| `periodicidade`                            | `STRING`  | Periodicidade de apuração.                         |
| `base_geografica`                          | `STRING`  | Base geográfica do indicador.                      |
| `formula_de_calculo`                       | `STRING`  | Fórmula de cálculo.                                |
| `justificativa_status_apuracao_previsoes`  | `STRING`  | Justificativa do status de apuração das previsões. |
| `justificativa_status_apuracao_indice_ref` | `STRING`  | Justificativa do status do índice de referência.   |
| `updated_at`                               | `STRING`  | Data de alteração informada na origem.             |
| `is_indicador_new`                         | `BOOLEAN` | Indica indicador novo.                             |
| `polaridade`                               | `STRING`  | Polaridade do indicador.                           |

---

## 7. `localizadores_todos_planejamento`

**Origem:** `https://www.sigplan.mg.gov.br/BasesTxt/localizadores_Todos_planejamento.txt`

**Uso:** regionalização planejada das ações, ligando programa, ação, UO, localizador, região geográfica e município.

**Chave candidata:** combinação de `uo_acao_cod`, `programa_cod`, `acao_cod`, `localizador_cod` e `municipio_ibge_cod`.

**Atenção:** as colunas `vr_meta_orcamentaria_ano*` representam **previsão**, não liquidação nem execução individualizada.

### Dicionário de colunas

| Coluna                      | Tipo      | Descrição                                  |
| --------------------------- | --------- | ------------------------------------------ |
| `programa_cod`              | `INT`     | Código do programa.                        |
| `programa_desc`             | `STRING`  | Nome do programa.                          |
| `area_tematica_cod`         | `STRING`  | Código da área temática.                   |
| `area_tematica_desc`        | `STRING`  | Descrição da área temática.                |
| `is_deleted_programa`       | `BOOLEAN` | Indica exclusão lógica do programa.        |
| `acao_cod`                  | `INT`     | Código da ação.                            |
| `acao_desc`                 | `STRING`  | Título da ação.                            |
| `iag_cod`                   | `INT`     | Código do IAG.                             |
| `iag_desc`                  | `STRING`  | Descrição do IAG.                          |
| `projeto_estrategico_cod`   | `STRING`  | Código do projeto estratégico.             |
| `projeto_estrategico_desc`  | `STRING`  | Descrição do projeto estratégico.          |
| `funcao_cod`                | `INT`     | Código da função.                          |
| `funcao_desc`               | `STRING`  | Descrição da função.                       |
| `subfuncao_cod`             | `INT`     | Código da subfunção.                       |
| `subfuncao_desc`            | `STRING`  | Descrição da subfunção.                    |
| `uo_acao_cod`               | `INT`     | Código da UO responsável pela ação.        |
| `uo_acao_nome`              | `STRING`  | Nome da UO responsável pela ação.          |
| `is_deleted_acao`           | `BOOLEAN` | Indica exclusão lógica da ação.            |
| `localizador_cod`           | `STRING`  | Código do localizador da ação.             |
| `is_deleted_localizador`    | `BOOLEAN` | Indica exclusão lógica do localizador.     |
| `regiao_geografica_cod`     | `INT`     | Código da região geográfica intermediária. |
| `regiao_geografica_desc`    | `STRING`  | Nome da região geográfica intermediária.   |
| `municipio_ibge_cod`        | `INT`     | Código IBGE do município.                  |
| `municipio_sigplan_cod`     | `INT`     | Código do município no SIGPLAN.            |
| `municipio`                 | `STRING`  | Nome do município.                         |
| `vr_meta_orcamentaria_ano0` | `DOUBLE`  | Previsão orçamentária de 2024.             |
| `vr_meta_fisica_ano0`       | `INT`     | Previsão física de 2024.                   |
| `vr_meta_orcamentaria_ano1` | `DOUBLE`  | Previsão orçamentária de 2025.             |
| `vr_meta_fisica_ano1`       | `INT`     | Previsão física de 2025.                   |
| `vr_meta_orcamentaria_ano2` | `DOUBLE`  | Previsão orçamentária de 2026.             |
| `vr_meta_fisica_ano2`       | `INT`     | Previsão física de 2026.                   |
| `vr_meta_orcamentaria_ano3` | `DOUBLE`  | Previsão orçamentária de 2027.             |
| `vr_meta_fisica_ano3`       | `INT`     | Previsão física de 2027.                   |

---

## 8. `sigplan_execucao_regionalizada_2026`

**Origem:** relatório HTML `RegionalizacaoAcao.asp`, consultado individualmente por programa.

**URL-base:** `https://www.sigplan.mg.gov.br/v3/RelatoriosPPAG5/RegionalizacaoAcao.asp`

**Uso:** execução física e orçamentária regionalizada por ação para 2026.

**Chave técnica:** `chave_relatorio`.

**Granularidade:** uma linha por ano, programa, ação, UO e região, incluindo uma linha adicional de total por ação quando fornecida pelo relatório.

### Regra contra dupla contagem

A linha `is_total = true` consolida as regiões da mesma ação. Para somar o detalhamento regional, use:

```sql
SELECT *
FROM [lh_Sigplan].[dbo].[sigplan_execucao_regionalizada_2026]
WHERE is_total = 0;
```

Para analisar somente os totais das ações, use `is_total = 1`.

### Dicionário de colunas

| Coluna                              | Tipo        | Descrição                                                  |
| ----------------------------------- | ----------- | ---------------------------------------------------------- |
| `chave_relatorio`                   | `STRING`    | SHA-256 da chave técnica ano, programa, ação, UO e região. |
| `ano`                               | `INT`       | Ano de referência do relatório.                            |
| `mes_bimestre`                      | `INT`       | Mês-limite solicitado ao relatório.                        |
| `programa_cod`                      | `INT`       | Código do programa.                                        |
| `programa_desc`                     | `STRING`    | Nome do programa.                                          |
| `acao_cod`                          | `INT`       | Código da ação.                                            |
| `acao_desc`                         | `STRING`    | Título da ação.                                            |
| `iag_cod`                           | `INT`       | Código do IAG.                                             |
| `uo_cod`                            | `INT`       | Código da UO responsável pela ação.                        |
| `uo_desc`                           | `STRING`    | Nome da UO responsável pela ação.                          |
| `ua_nome`                           | `STRING`    | Unidade administrativa responsável.                        |
| `publico_alvo`                      | `STRING`    | Público-alvo da ação.                                      |
| `produto_unidade_medida`            | `STRING`    | Produto e unidade de medida.                               |
| `regiao`                            | `STRING`    | Região ou categoria territorial exibida no relatório.      |
| `is_total`                          | `BOOLEAN`   | Identifica a linha Total da ação.                          |
| `fisico_programado_ppag`            | `DOUBLE`    | Meta física programada no PPAG.                            |
| `fisico_executado`                  | `DOUBLE`    | Meta física executada no período.                          |
| `fisico_execucao_pct`               | `DOUBLE`    | Percentual de execução física.                             |
| `fisico_analise_vertical_pct`       | `DOUBLE`    | Participação vertical da execução física.                  |
| `orcamentario_programado_ppag`      | `DOUBLE`    | Valor orçamentário programado no PPAG.                     |
| `orcamentario_executado`            | `DOUBLE`    | Valor orçamentário executado no período.                   |
| `orcamentario_execucao_pct`         | `DOUBLE`    | Percentual de execução orçamentária.                       |
| `orcamentario_analise_vertical_pct` | `DOUBLE`    | Participação vertical da execução orçamentária.            |
| `emitido_em`                        | `TIMESTAMP` | Data de emissão do relatório SIGPLAN.                      |
| `url_origem`                        | `STRING`    | URL consultada para obtenção do relatório.                 |
| `dt_carga`                          | `TIMESTAMP` | Data e hora da carga no Lakehouse.                         |

---

## 9. `sigplan_execucao_regionalizada_2026_erros`

**Uso:** auditoria da coleta. Registra programas que falharam após as tentativas configuradas ou cujo HTML não produziu linhas regionais.

**Observação:** a ausência de um programa nesta tabela não garante, isoladamente, completude; deve-se comparar os programas da tabela de origem com os programas carregados.

### Dicionário de colunas

| Coluna                  | Tipo        | Descrição                                                             |
| ----------------------- | ----------- | --------------------------------------------------------------------- |
| `programa_cod`          | `BIGINT`    | Código do programa cuja coleta falhou ou não retornou linhas.         |
| `url`                   | `STRING`    | URL consultada.                                                       |
| `tipo`                  | `STRING`    | Classificação da ocorrência: erro de API/parser ou ausência de dados. |
| `tentativas_realizadas` | `BIGINT`    | Quantidade de tentativas realizadas.                                  |
| `erro`                  | `STRING`    | Mensagem técnica da ocorrência.                                       |
| `dt_carga`              | `TIMESTAMP` | Data e hora do registro da ocorrência.                                |

---

## 10. Relacionamentos recomendados

### Programa

```text
programas_planejamento.programa_cod
    1 ─── N acoes_planejamento.programa_cod
    1 ─── N indicadores_planejamento.programa_cod
    1 ─── N localizadores_todos_planejamento.programa_cod
    1 ─── N sigplan_execucao_regionalizada_2026.programa_cod
```

### Ação de planejamento e execução

Relacionamento recomendado:

```text
programa_cod + acao_cod + uo_acao_cod/uo_cod
```

Não relacione somente por `acao_cod`, pois o código pode não ser suficiente para garantir unicidade em todas as situações.

### Localização

`localizadores_todos_planejamento` contém município e código IBGE. A tabela de execução contém o texto de `regiao` apresentado pelo relatório. Não há, necessariamente, correspondência direta entre `regiao` e `municipio_ibge_cod`.

---

## 11. Consultas de validação

### Quantidade de registros por tabela

```sql
SELECT 'programas_planejamento' AS tabela, COUNT(*) AS quantidade FROM [lh_Sigplan].[dbo].[programas_planejamento]
UNION ALL
SELECT 'acoes_planejamento', COUNT(*) FROM [lh_Sigplan].[dbo].[acoes_planejamento]
UNION ALL
SELECT 'indicadores_planejamento', COUNT(*) FROM [lh_Sigplan].[dbo].[indicadores_planejamento]
UNION ALL
SELECT 'localizadores_todos_planejamento', COUNT(*) FROM [lh_Sigplan].[dbo].[localizadores_todos_planejamento]
UNION ALL
SELECT 'sigplan_execucao_regionalizada_2026', COUNT(*) FROM [lh_Sigplan].[dbo].[sigplan_execucao_regionalizada_2026];
```

### Programas esperados que não aparecem na execução

```sql
SELECT DISTINCT l.programa_cod
FROM [lh_Sigplan].[dbo].[localizadores_todos_planejamento] AS l
LEFT JOIN [lh_Sigplan].[dbo].[sigplan_execucao_regionalizada_2026] AS e
    ON e.programa_cod = l.programa_cod
WHERE e.programa_cod IS NULL
ORDER BY l.programa_cod;
```

### Falhas da coleta

```sql
SELECT *
FROM [lh_Sigplan].[dbo].[sigplan_execucao_regionalizada_2026_erros]
ORDER BY programa_cod;
```

### Comparação entre meta planejada e execução

```sql
SELECT
    e.programa_cod,
    e.acao_cod,
    e.uo_cod,
    e.regiao,
    e.orcamentario_programado_ppag,
    e.orcamentario_executado,
    e.orcamentario_execucao_pct
FROM [lh_Sigplan].[dbo].[sigplan_execucao_regionalizada_2026] AS e
WHERE e.is_total = 0
ORDER BY e.orcamentario_executado DESC;
```

---

## 12. Regras de qualidade e uso

1. Excluir registros com `is_deleted_programa = true`, `is_deleted_acao = true` ou `is_deleted_localizador = true` quando a análise exigir somente estruturas vigentes.
2. Não somar simultaneamente as linhas regionais e as linhas com `is_total = true`.
3. Preservar códigos com zeros à esquerda na apresentação, mesmo que armazenados como inteiros.
4. Validar duplicidades nas chaves candidatas antes de construir dimensões ou relacionamentos.
5. Tratar valores nulos como “não informado”; não convertê-los automaticamente em zero.
6. Diferenciar previsão do PPAG, execução regionalizada e liquidação contábil. São conceitos e granularidades distintas.
7. Usar `municipio_ibge_cod` como chave preferencial para integração com bases municipais externas.
8. Registrar data da carga, parâmetros de consulta e falhas para garantir rastreabilidade.

## 13. Limitações

- A regionalização do SIGPLAN pode representar município, região ou categoria estadual.
- O valor executado é consolidado por ação e região; não corresponde necessariamente a um documento individual de liquidação.
- A base de localizadores contém regionalização planejada e não permite, sozinha, atribuir cada liquidação a um município.
- Códigos e descrições podem mudar entre exercícios; análises históricas devem incluir o ano na chave lógica.
