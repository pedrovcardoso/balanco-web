# Banco de Dados MySQL — Balanço Web

**Banco**: `sc_balanco_web`  
**Prefixo de tabelas**: `tb_`  
**Engine**: InnoDB · Charset: `utf8mb4` · Collation: `utf8mb4_unicode_ci`

---

## Visão Geral

O banco é dividido em dois grupos:

- **Site** — dados dos usuários e seu progresso pelas seções do site
- **Jogos** — conteúdo estático dos jogos gerenciado pelo admin

---

## GRUPO 1 — Site (Usuários e Progresso)

### `tb_user` — Usuários (Gov.br)

Armazena apenas o mínimo necessário vindo da autenticação Gov.br.

| Coluna | Tipo | Restrições | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | INT UNSIGNED | PK, AUTO_INCREMENT | Chave interna |
| `cpf` | CHAR(11) | NOT NULL, UNIQUE | CPF (apenas dígitos) |
| `nome` | VARCHAR(150) | NOT NULL | Nome completo |
| `created_at` | DATETIME | NOT NULL, DEFAULT UTC_TIMESTAMP() | Primeiro acesso |

---

### `tb_trail_redemption` — Resgates de Trilhas

Registra cada ação de "Resgatar" nas seções do site. Uma linha por usuário por seção — sem duplicatas.

| Coluna | Tipo | Restrições | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | INT UNSIGNED | PK, AUTO_INCREMENT | Identificador |
| `user_id` | INT UNSIGNED | NOT NULL, FK → `tb_user` | Usuário |
| `item_key` | VARCHAR(50) | NOT NULL | Chave da seção resgatada |
| `redeemed_at` | DATETIME | NOT NULL, DEFAULT UTC_TIMESTAMP() | Data do resgate |
| UNIQUE | | `(user_id, item_key)` | Impede duplicatas |

**Valores de `item_key`:**

| item_key | Seção do site |
| :--- | :--- |
| `HISTORIA_HQ` | História em Quadrinhos |
| `LIVRO_1` | Entendendo o Balanço — Livro 1 |
| `LIVRO_2` | Entendendo o Balanço — Livro 2 |
| `LIVRO_3` | Entendendo o Balanço — Livro 3 |
| `BALANCO_DADOS` | Balanço em Dados |
| `SAIBA_MAIS` | Saiba Mais |

---

### `tb_game_progress` — Progresso nos Jogos

Melhor resultado do usuário por fase. Atualizada via UPSERT a cada tentativa — nunca insere duplicatas.

| Coluna | Tipo | Restrições | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | INT UNSIGNED | PK, AUTO_INCREMENT | Identificador |
| `user_id` | INT UNSIGNED | NOT NULL, FK → `tb_user` | Usuário |
| `phase_id` | INT UNSIGNED | NOT NULL, FK → `tb_phase` | Fase jogada |
| `best_score` | TINYINT UNSIGNED | NOT NULL, DEFAULT 0 | Maior pontuação (0–100) |
| `best_stars` | TINYINT UNSIGNED | NOT NULL, DEFAULT 0 | Estrelas da melhor tentativa (0–3) |
| `attempts` | SMALLINT UNSIGNED | NOT NULL, DEFAULT 1 | Total de tentativas |
| `completed_at` | DATETIME | NULL | Primeira aprovação (score ≥ 60) |
| `updated_at` | DATETIME | NOT NULL, DEFAULT UTC_TIMESTAMP() | Última tentativa |
| UNIQUE | | `(user_id, phase_id)` | Uma linha por (usuário × fase) |

**Regras de estrelas:**

| Score | Estrelas |
| :--- | :--- |
| < 60 | 0 — não passou |
| ≥ 60 | ⭐ 1 |
| ≥ 80 | ⭐⭐ 2 |
| ≥ 95 | ⭐⭐⭐ 3 |

---

### `tb_certificate` — Certificados Emitidos

| Coluna | Tipo | Restrições | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | INT UNSIGNED | PK, AUTO_INCREMENT | Identificador |
| `user_id` | INT UNSIGNED | NOT NULL, FK → `tb_user` | Usuário |
| `validation_code` | VARCHAR(16) | NOT NULL, UNIQUE | Código público de validação |
| `issued_at` | DATETIME | NOT NULL, DEFAULT UTC_TIMESTAMP() | Data de emissão |

**Critério para emissão do certificado:**
- 6 resgates presentes em `tb_trail_redemption` (todos os `item_key`)
- Todas as fases ativas (`is_active = 1`) com `best_score >= 60` em `tb_game_progress`

---

## GRUPO 2 — Jogos (Conteúdo Estático)

> Tabelas gerenciadas pelo admin. Não são alteradas pelo progresso dos usuários.

### `tb_section` — Seções do Mapa

Capítulos temáticos que agrupam as fases no mapa visual.

| Coluna | Tipo | Restrições | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | INT UNSIGNED | PK, AUTO_INCREMENT | Identificador |
| `slug` | VARCHAR(80) | NOT NULL, UNIQUE | Slug único |
| `title` | VARCHAR(120) | NOT NULL | Título exibido |
| `description` | VARCHAR(500) | NULL | Descrição da seção |
| `order_index` | TINYINT UNSIGNED | NOT NULL | Ordem de exibição no mapa |
| `is_active` | TINYINT(1) | NOT NULL, DEFAULT 1 | Visível ou não |

**Seções de produção**: 4 seções ativas (Administração Pública, Receita e Despesa, Execução Orçamentária, Transparência e Controle).

---

### `tb_engine` — Motores de Jogo

Define a mecânica de cada tipo de jogo. Referenciada pelas fases e questões.

| Coluna | Tipo | Restrições | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | INT UNSIGNED | PK, AUTO_INCREMENT | Identificador |
| `slug` | VARCHAR(50) | NOT NULL, UNIQUE | Slug do engine |
| `title` | VARCHAR(80) | NOT NULL | Nome exibido |
| `scoring_mode` | VARCHAR(30) | NOT NULL | `ratio_correct` · `hints_penalty` · `attempts_steps` |

**Engines disponíveis**: `quiz`, `swipe`, `flow`, `caca-palavras`, `cruzadinha`, `ordem-correta`, `wend`.

---

### `tb_phase` — Fases (Níveis do Mapa)

Cada fase é um jogo individual com engine, configuração e questões associadas.

| Coluna | Tipo | Restrições | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | INT UNSIGNED | PK, AUTO_INCREMENT | Identificador interno |
| `public_id` | CHAR(36) | NOT NULL, UNIQUE | UUID exposto na API e na URL `/jogos/{id}` |
| `section_id` | INT UNSIGNED | NOT NULL, FK → `tb_section` | Seção à qual pertence |
| `engine_id` | INT UNSIGNED | NOT NULL, FK → `tb_engine` | Engine que processa o jogo |
| `title` | VARCHAR(150) | NOT NULL | Título da fase |
| `description` | VARCHAR(500) | NULL | Descrição exibida no modal |
| `order_index` | TINYINT UNSIGNED | NOT NULL | Ordem dentro da seção |
| `pass_score` | TINYINT UNSIGNED | NOT NULL, DEFAULT 60 | Pontuação mínima para passar |
| `max_score` | TINYINT UNSIGNED | NOT NULL, DEFAULT 100 | Pontuação máxima |
| `config_json` | TEXT | NULL | Parâmetros do engine (`stars`, `count`, `pairs`, `board`, `left`/`right`, etc.) |
| `is_active` | TINYINT(1) | NOT NULL, DEFAULT 1 | Disponível ou não |

**16 fases ativas de produção** nas seções 1–4:

| Seção | Título da Fase | Engine |
| :--- | :--- | :--- |
| Administração Pública | Ordem Correta · Ciclo Orçamentário | ordem-correta |
| Administração Pública | Caça-Palavras: Princípios da Administração | caca-palavras |
| Administração Pública | Flow · Instrumentos de Planejamento | flow |
| Administração Pública | Quiz · Administração Pública | quiz |
| Receita e Despesa | Flow · Receita, Despesa e Restos a Pagar | flow |
| Receita e Despesa | Swipe · Despesa Corrente ou Capital | swipe |
| Receita e Despesa | Cruzadinha: Termos Fiscais | cruzadinha |
| Receita e Despesa | Verdadeiro ou Falso: Receita e Despesa | swipe |
| Execução Orçamentária | Ordem Correta: Caminho do Documento | ordem-correta |
| Execução Orçamentária | Liga Conceitos: Etapas da Despesa Pública | flow |
| Execução Orçamentária | Verdadeiro ou Falso: Índices e Limites | swipe |
| Execução Orçamentária | Quiz: Execução Orçamentária | quiz |
| Transparência e Controle | Cruzadinha: Balanços e Demonstrativos | cruzadinha |
| Transparência e Controle | Verdadeiro ou Falso: Direitos e Deveres | swipe |
| Transparência e Controle | Liga Conceitos: Direitos, Deveres e Controle | flow |
| Transparência e Controle | Quiz: Balanços e Relatórios | quiz |

---

### `tb_question` — Banco de Questões

Armazena o conteúdo de cada questão. O formato varia por engine via `options_json` e `metadata_json`.

| Coluna | Tipo | Restrições | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | INT UNSIGNED | PK, AUTO_INCREMENT | Identificador |
| `engine_id` | INT UNSIGNED | NOT NULL, FK → `tb_engine` | Engine para o qual foi criada |
| `prompt` | TEXT | NOT NULL | Enunciado, dica ou palavra-chave |
| `simple_explanation` | TEXT | NULL | Explicação exibida após responder |
| `correct_answer` | VARCHAR(500) | NOT NULL | Resposta correta |
| `options_json` | TEXT | NULL | Opções de resposta em JSON (quiz/swipe) |
| `metadata_json` | TEXT | NULL | Dados extras do engine (`word`, `label`, `color`, etc.) |
| `is_active` | TINYINT(1) | NOT NULL, DEFAULT 1 | Disponível ou não |

---

### `tb_phase_question` — Vínculo Fase ↔ Questão

Tabela N:M que define quais questões pertencem a cada fase e sua ordem.

| Coluna | Tipo | Restrições | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | INT UNSIGNED | PK, AUTO_INCREMENT | Identificador |
| `phase_id` | INT UNSIGNED | NOT NULL, FK → `tb_phase` | Fase |
| `question_id` | INT UNSIGNED | NOT NULL, FK → `tb_question` | Questão |
| `order_index` | SMALLINT UNSIGNED | NOT NULL, DEFAULT 0 | Ordem quando `random=false` |
| UNIQUE | | `(phase_id, question_id)` | Sem questão duplicada na mesma fase |

---

## Diagrama

```
SITE (progresso dos usuários)
──────────────────────────────────────────────────────
tb_user (cpf + nome)
  │
  ├──► tb_trail_redemption    item_key: HISTORIA_HQ | LIVRO_1..3 | BALANCO_DADOS | SAIBA_MAIS
  │
  ├──► tb_game_progress ─────► tb_phase
  │    best_score, best_stars,
  │    attempts, completed_at
  │
  └──► tb_certificate
       validation_code, issued_at

JOGOS (conteúdo estático)
──────────────────────────────────────────────────────
tb_section ──┐
tb_engine  ──┴──► tb_phase ──► tb_phase_question ──► tb_question
               (config_json)
```

---

## schema.sql

```sql
-- ============================================================
--  sc_balanco_web — Schema completo MySQL
--  Convenções: prefixo tb_, InnoDB, utf8mb4
-- ============================================================

CREATE DATABASE IF NOT EXISTS sc_balanco_web
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE sc_balanco_web;

-- ------------------------------------------------------------
--  GRUPO 1 — SITE
-- ------------------------------------------------------------

CREATE TABLE tb_user (
  id         INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  cpf        CHAR(11)        NOT NULL,
  nome       VARCHAR(150)    NOT NULL,
  created_at DATETIME        NOT NULL DEFAULT (UTC_TIMESTAMP()),
  PRIMARY KEY (id),
  UNIQUE KEY uq_user_cpf (cpf)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------

CREATE TABLE tb_trail_redemption (
  id          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  user_id     INT UNSIGNED  NOT NULL,
  item_key    VARCHAR(50)   NOT NULL
                              COMMENT 'HISTORIA_HQ | LIVRO_1 | LIVRO_2 | LIVRO_3 | BALANCO_DADOS | SAIBA_MAIS',
  redeemed_at DATETIME      NOT NULL DEFAULT (UTC_TIMESTAMP()),
  PRIMARY KEY (id),
  UNIQUE KEY uq_redemption (user_id, item_key),
  CONSTRAINT fk_redemption_user
    FOREIGN KEY (user_id) REFERENCES tb_user (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------

CREATE TABLE tb_section (
  id          INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  slug        VARCHAR(80)      NOT NULL,
  title       VARCHAR(120)     NOT NULL,
  description VARCHAR(500)     NULL,
  order_index TINYINT UNSIGNED NOT NULL DEFAULT 0,
  is_active   TINYINT(1)       NOT NULL DEFAULT 1,
  PRIMARY KEY (id),
  UNIQUE KEY uq_section_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------

CREATE TABLE tb_engine (
  id           INT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug         VARCHAR(50)  NOT NULL,
  title        VARCHAR(80)  NOT NULL,
  scoring_mode VARCHAR(30)  NOT NULL
                              COMMENT 'ratio_correct | hints_penalty | attempts_steps',
  PRIMARY KEY (id),
  UNIQUE KEY uq_engine_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------

CREATE TABLE tb_phase (
  id          INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  public_id   CHAR(36)         NOT NULL,
  section_id  INT UNSIGNED     NOT NULL,
  engine_id   INT UNSIGNED     NOT NULL,
  title       VARCHAR(150)     NOT NULL,
  description VARCHAR(500)     NULL,
  order_index TINYINT UNSIGNED NOT NULL DEFAULT 0,
  pass_score  TINYINT UNSIGNED NOT NULL DEFAULT 60,
  max_score   TINYINT UNSIGNED NOT NULL DEFAULT 100,
  config_json TEXT             NULL
                              COMMENT 'Parâmetros do engine: stars, count, pairs, board, left/right, etc.',
  is_active   TINYINT(1)       NOT NULL DEFAULT 1,
  PRIMARY KEY (id),
  UNIQUE KEY uq_phase_public_id (public_id),
  CONSTRAINT fk_phase_section
    FOREIGN KEY (section_id) REFERENCES tb_section (id),
  CONSTRAINT fk_phase_engine
    FOREIGN KEY (engine_id) REFERENCES tb_engine (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------

CREATE TABLE tb_question (
  id                 INT UNSIGNED NOT NULL AUTO_INCREMENT,
  engine_id          INT UNSIGNED NOT NULL,
  prompt             TEXT         NOT NULL,
  simple_explanation TEXT         NULL,
  correct_answer     VARCHAR(500) NOT NULL,
  options_json       TEXT         NULL COMMENT 'Opções de resposta em JSON (quiz/swipe)',
  metadata_json      TEXT         NULL COMMENT 'Dados extras do engine: word, label, color, etc.',
  is_active          TINYINT(1)   NOT NULL DEFAULT 1,
  PRIMARY KEY (id),
  CONSTRAINT fk_question_engine
    FOREIGN KEY (engine_id) REFERENCES tb_engine (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------

CREATE TABLE tb_phase_question (
  id          INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  phase_id    INT UNSIGNED    NOT NULL,
  question_id INT UNSIGNED    NOT NULL,
  order_index SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY uq_phase_question (phase_id, question_id),
  CONSTRAINT fk_pq_phase
    FOREIGN KEY (phase_id) REFERENCES tb_phase (id) ON DELETE CASCADE,
  CONSTRAINT fk_pq_question
    FOREIGN KEY (question_id) REFERENCES tb_question (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------

CREATE TABLE tb_game_progress (
  id           INT UNSIGNED      NOT NULL AUTO_INCREMENT,
  user_id      INT UNSIGNED      NOT NULL,
  phase_id     INT UNSIGNED      NOT NULL,
  best_score   TINYINT UNSIGNED  NOT NULL DEFAULT 0,
  best_stars   TINYINT UNSIGNED  NOT NULL DEFAULT 0,
  attempts     SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  completed_at DATETIME          NULL     COMMENT 'Primeira aprovação (score >= 60)',
  updated_at   DATETIME          NOT NULL DEFAULT (UTC_TIMESTAMP())
                                          ON UPDATE UTC_TIMESTAMP(),
  PRIMARY KEY (id),
  UNIQUE KEY uq_progress (user_id, phase_id),
  CONSTRAINT fk_progress_user
    FOREIGN KEY (user_id) REFERENCES tb_user (id) ON DELETE CASCADE,
  CONSTRAINT fk_progress_phase
    FOREIGN KEY (phase_id) REFERENCES tb_phase (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------

CREATE TABLE tb_certificate (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id         INT UNSIGNED NOT NULL,
  validation_code VARCHAR(16)  NOT NULL,
  issued_at       DATETIME     NOT NULL DEFAULT (UTC_TIMESTAMP()),
  PRIMARY KEY (id),
  UNIQUE KEY uq_certificate_code (validation_code),
  CONSTRAINT fk_certificate_user
    FOREIGN KEY (user_id) REFERENCES tb_user (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```
