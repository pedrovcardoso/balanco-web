-- =============================================================================
-- sc_balanco_cidadao - Schema MySQL corrigido
-- Charset: utf8mb4 | Collation: utf8mb4_unicode_ci | Engine: InnoDB
-- Correcao: CURRENT_TIMESTAMP em campos automaticos e sessao UTC.
-- =============================================================================

DROP DATABASE IF EXISTS sc_balanco_cidadao;

CREATE DATABASE sc_balanco_cidadao
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE sc_balanco_cidadao;
SET time_zone = '+00:00';

-- =============================================================================
-- GRUPO 1 - SITE
-- =============================================================================

CREATE TABLE IF NOT EXISTS tb_user (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  cpf        CHAR(11) NOT NULL,
  nome       VARCHAR(150) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_user_cpf (cpf)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tb_trail_section (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug        VARCHAR(80) NOT NULL,
  title       VARCHAR(120) NOT NULL,
  description TEXT NULL,
  order_index TINYINT UNSIGNED NOT NULL DEFAULT 0,
  is_active   TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (id),
  UNIQUE KEY uq_trail_section_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tb_trail_redemption (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id     INT UNSIGNED NOT NULL,
  item_key    VARCHAR(50) NOT NULL COMMENT 'HISTORIA_HQ | LIVRO_1 | LIVRO_2 | LIVRO_3 | BALANCO_DADOS | SAIBA_MAIS',
  redeemed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_redemption (user_id, item_key),
  CONSTRAINT fk_redemption_user
    FOREIGN KEY (user_id) REFERENCES tb_user (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tb_certificate (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id         INT UNSIGNED NOT NULL,
  validation_code VARCHAR(16) NOT NULL,
  issued_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_certificate_code (validation_code),
  CONSTRAINT fk_certificate_user
    FOREIGN KEY (user_id) REFERENCES tb_user (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- GRUPO 2 - JOGOS
-- =============================================================================

CREATE TABLE IF NOT EXISTS tb_section (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug        VARCHAR(80) NOT NULL,
  title       VARCHAR(120) NOT NULL,
  description TEXT NULL,
  order_index TINYINT UNSIGNED NOT NULL DEFAULT 0,
  is_active   TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (id),
  UNIQUE KEY uq_section_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tb_engine (
  id           INT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug         VARCHAR(80) NOT NULL,
  title        VARCHAR(80) NOT NULL,
  description  TEXT NULL,
  scoring_mode VARCHAR(40) NOT NULL,
  is_active    TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (id),
  UNIQUE KEY uq_engine_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tb_phase (
  id             INT UNSIGNED NOT NULL AUTO_INCREMENT,
  public_id      CHAR(36) NULL COMMENT 'UUID publico usado nas URLs',
  section_id     INT UNSIGNED NOT NULL,
  engine_id      INT UNSIGNED NOT NULL,
  slug           VARCHAR(120) NOT NULL,
  title          VARCHAR(200) NOT NULL,
  description    TEXT NULL,
  order_index    TINYINT UNSIGNED NOT NULL DEFAULT 0,
  question_count TINYINT UNSIGNED NULL,
  pass_score     TINYINT UNSIGNED NOT NULL DEFAULT 60,
  max_score      TINYINT UNSIGNED NOT NULL DEFAULT 100,
  config_json    TEXT NULL,
  is_active      TINYINT(1) NOT NULL DEFAULT 1,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_phase_slug (slug),
  UNIQUE KEY uq_phase_public_id (public_id),
  CONSTRAINT fk_phase_section FOREIGN KEY (section_id) REFERENCES tb_section (id),
  CONSTRAINT fk_phase_engine FOREIGN KEY (engine_id) REFERENCES tb_engine (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tb_game_progress (
  id           INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id      INT UNSIGNED NOT NULL,
  phase_id     INT UNSIGNED NOT NULL,
  best_score   TINYINT UNSIGNED NOT NULL DEFAULT 0,
  best_stars   TINYINT UNSIGNED NOT NULL DEFAULT 0,
  attempts     SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  completed_at DATETIME NULL COMMENT 'Primeira aprovacao (score >= 60)',
  updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_progress (user_id, phase_id),
  CONSTRAINT fk_progress_user
    FOREIGN KEY (user_id) REFERENCES tb_user (id) ON DELETE CASCADE,
  CONSTRAINT fk_progress_phase
    FOREIGN KEY (phase_id) REFERENCES tb_phase (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tb_question (
  id                 INT UNSIGNED NOT NULL AUTO_INCREMENT,
  public_id          CHAR(36) NULL,
  section_id         INT UNSIGNED NOT NULL,
  engine_id          INT UNSIGNED NOT NULL,
  difficulty         TINYINT UNSIGNED NOT NULL DEFAULT 1,
  prompt             TEXT NOT NULL,
  simple_explanation TEXT NULL,
  correct_answer     VARCHAR(200) NOT NULL,
  options_json       TEXT NULL COMMENT 'Array JSON de opcoes (quiz/swipe)',
  metadata_json      TEXT NULL COMMENT 'Dados extras do motor de jogo',
  tags               VARCHAR(500) NULL,
  is_active          TINYINT(1) NOT NULL DEFAULT 1,
  created_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_question_public_id (public_id),
  CONSTRAINT fk_question_section FOREIGN KEY (section_id) REFERENCES tb_section (id),
  CONSTRAINT fk_question_engine FOREIGN KEY (engine_id) REFERENCES tb_engine (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tb_phase_question (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  phase_id    INT UNSIGNED NOT NULL,
  question_id INT UNSIGNED NOT NULL,
  order_index TINYINT UNSIGNED NOT NULL DEFAULT 0,
  weight      DECIMAL(5,2) NOT NULL DEFAULT 1.00,
  is_required TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY uq_phase_question (phase_id, question_id),
  CONSTRAINT fk_pq_phase FOREIGN KEY (phase_id) REFERENCES tb_phase (id),
  CONSTRAINT fk_pq_question FOREIGN KEY (question_id) REFERENCES tb_question (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- DADOS BASICOS
-- =============================================================================

INSERT INTO tb_section (id, slug, title, description, order_index, is_active) VALUES
(1, 'administracao-publica', 'Administracao Publica', 'Fundamentos da administracao publica e ciclo orcamentario.', 1, 1),
(2, 'receitas-despesas', 'Receita e Despesa Publica', 'Receitas, despesas, execucao e restos a pagar.', 2, 1),
(3, 'execucao-orcamentaria', 'Execucao Orcamentaria', 'Como o orcamento aprovado vira execucao pratica.', 3, 1),
(4, 'transparencia-controle-social', 'Transparencia e Controle Social', 'Balanco, demonstrativos, direitos e controle social.', 4, 1);

INSERT INTO tb_engine (id, slug, title, description, scoring_mode, is_active) VALUES
(1, 'caca-palavras', 'Caca-palavras', 'Sopa de letras com dicas.', 'hints_penalty', 1),
(2, 'cruzadinha', 'Cruzadinha', 'Conceitos fiscais com dicas.', 'hints_penalty', 1),
(3, 'flow', 'Flow', 'Associacao entre conceitos e explicacoes.', 'attempts_steps', 1),
(4, 'ordem-correta', 'Ordem correta', 'Ordenacao de eventos ou termos.', 'attempts_steps', 1),
(5, 'swipe', 'Swipe', 'Classificacao rapida em duas opcoes.', 'ratio_correct', 1),
(6, 'quiz', 'Quiz', 'Perguntas de multipla escolha.', 'ratio_correct', 1),
(7, 'wend', 'Wend', 'Conectar letras para descobrir palavras escondidas.', 'hints_penalty', 1);

INSERT INTO tb_phase (id, public_id, section_id, engine_id, slug, title, description, order_index, question_count, pass_score, max_score, config_json, is_active) VALUES
(1,'f11da6be-e9ad-40f8-9bc9-a2efaab6bdb0',1,1,'caca-palavras-principios-da-administracao-publica','Caca-palavras: Principios da Administracao Publica','Lista de principios do LIMPE.',2,NULL,60,100,'{"cols":11,"rows":15,"allowDirections":["horizontal","vertical","diagonal"],"stars":{"one":60,"two":80,"three":95}}',1),
(2,'75f1b9a0-0a28-47c8-8948-9252090471ae',1,3,'instrumentos-planejamento','Flow - Instrumentos de Planejamento','Associe PMDI, PPAG, LDO e LOA as suas definicoes.',3,4,60,100,'{"board":"5x5","mode":"flow","pairs":4,"stars":{"one":60,"two":80,"three":95}}',1),
(3,'657bd373-dc4b-4290-89dd-736565ad7787',1,4,'ciclo-orcamentario','Ordem Correta - Ciclo Orcamentario','Organize as etapas do ciclo orcamentario na sequencia correta.',1,6,60,100,'{"mode":"ordem-correta","items":6,"stars":{"one":60,"two":80,"three":95}}',1),
(4,'bbf2b83b-e95d-4317-815d-88b9dce8f49f',1,6,'quiz-administracao-publica','Quiz - Administracao Publica','Questoes sobre Administracao Direta e Indireta, LIMPE, esferas de governo e tres Poderes.',4,8,60,100,'{"mode":"quiz","count":8,"time":25,"stars":{"one":60,"two":80,"three":95}}',1),
(5,'6a7c4f02-eacc-4852-9a1a-aaa2d2c6ad33',2,3,'receita-despesa-restos-pagar','Flow - Receita, Despesa e Restos a Pagar','Associe conceitos as definicoes.',1,5,60,100,'{"board":"5x5","mode":"flow","pairs":5,"stars":{"one":60,"two":80,"three":95}}',1),
(6,'e8a69b48-4483-425f-a094-6eb51936d477',2,5,'classificacao-despesa-corrente-capital','Swipe - Despesa Corrente ou Capital','Classifique despesas como corrente ou de capital.',2,10,60,100,'{"mode":"swipe","count":10,"time":12,"left":"corrente","right":"capital","stars":{"one":60,"two":80,"three":95}}',1),
(7,'1234e635-efa6-41a2-869e-63eeae80d289',2,2,'cruzadinha-termos-fiscais','Cruzadinha: Termos Fiscais','Receita, despesa, corrente, capital, LOA e restos a pagar.',3,NULL,60,100,'{"unlock":"previous_phase_required","stars":{"one":60,"two":80,"three":95}}',1),
(8,'a3dd571c-0bab-4d97-8410-eac914e5bc3b',2,5,'verdadeiro-falso-receita-despesa','Verdadeiro ou Falso: Receita e Despesa','10 afirmacoes aleatorias.',4,10,60,100,'{"mode":"swipe","count":10,"time":12,"left":"falso","right":"verdadeiro","leftLabel":"Falso","rightLabel":"Verdadeiro","unlock":"previous_phase_required","stars":{"one":60,"two":80,"three":95}}',1),
(9,'9de13736-e573-424f-9d56-8a907504dd2d',3,4,'caminho-documento','Ordem correta: Caminho do Documento','Ordene o fluxo da execucao.',1,NULL,60,100,'{"unlock":"previous_phase_required","stars":{"one":60,"two":80,"three":95}}',1),
(10,'e14139df-da51-4068-9de0-5337ddb0e4b1',3,3,'etapas-despesa-publica','Liga conceitos: Etapas da Despesa Publica','Empenho, liquidacao e pagamento.',2,NULL,60,100,'{"unlock":"previous_phase_required","stars":{"one":60,"two":80,"three":95}}',1),
(11,'4d055753-2084-4b91-a35a-88778d7ad7b2',3,5,'verdadeiro-falso-indices-limites','Verdadeiro ou Falso: Indices e Limites','10 afirmacoes aleatorias.',3,10,60,100,'{"mode":"swipe","count":10,"time":12,"left":"falso","right":"verdadeiro","leftLabel":"Falso","rightLabel":"Verdadeiro","unlock":"previous_phase_required","stars":{"one":60,"two":80,"three":95}}',1),
(12,'b3aa6112-1f10-4997-9a4b-21be4f7876d1',3,6,'quiz-execucao-orcamentaria','Quiz: Execucao Orcamentaria','6 perguntas aleatorias.',4,6,60,100,'{"unlock":"previous_phase_required","stars":{"one":60,"two":80,"three":95}}',1),
(13,'dbbce83d-7a3b-4864-8c56-7d157e1b92ad',4,2,'balancos-demonstrativos','Cruzadinha: Balancos e Demonstrativos','Termos e mecanismos de prestacao de contas.',1,NULL,60,100,'{"unlock":"previous_phase_required","stars":{"one":60,"two":80,"three":95}}',1),
(14,'ae72ad98-4b0a-4800-add0-69c8a86537c7',4,5,'verdadeiro-falso-direitos-deveres','Verdadeiro ou Falso: Direitos e Deveres','10 afirmacoes aleatorias.',2,10,60,100,'{"mode":"swipe","count":10,"time":12,"left":"falso","right":"verdadeiro","leftLabel":"Falso","rightLabel":"Verdadeiro","unlock":"previous_phase_required","stars":{"one":60,"two":80,"three":95}}',1),
(15,'943ea061-5141-4f0d-934e-7090b47d0cbc',4,3,'direitos-deveres-controle','Liga conceitos: Direitos, Deveres e Controle','Formas de participacao e controle social.',3,NULL,60,100,'{"unlock":"previous_phase_required","stars":{"one":60,"two":80,"three":95}}',1),
(16,'775928ea-9a45-48c2-ad51-906922d4e95a',4,6,'quiz-balancos-relatorios','Quiz: Balancos e Relatorios','RREO, RGF, Balanco Geral e outros.',4,6,60,100,'{"unlock":"previous_phase_required","stars":{"one":60,"two":80,"three":95}}',1);

-- -----------------------------------------------------------------------
-- Seção 1 — Administração Pública
-- -----------------------------------------------------------------------

-- Fase 1: Caça-palavras LIMPE (engine: caca-palavras)
INSERT INTO tb_question (id, public_id, section_id, engine_id, difficulty, prompt, simple_explanation, correct_answer, options_json, metadata_json, tags, is_active) VALUES
(1, '9ef8efcc-057d-440b-b5a9-45aea6c953f1', 1, 1, 1,
 'Legalidade',
 'A Administração Pública só pode agir conforme autorização da lei.',
 'LEGALIDADE', NULL,
 '{"word": "LEGALIDADE", "label": "Legalidade", "color": "#3b82f6"}',
 'administracao-publica,limpe,caca-palavras', 1),

(2, 'b56a8cef-df1d-40ad-b24c-78fd8186f556', 1, 1, 1,
 'Impessoalidade',
 'Atuação voltada ao interesse público, sem favorecimento pessoal.',
 'IMPESSOALIDADE', NULL,
 '{"word": "IMPESSOALIDADE", "label": "Impessoalidade", "color": "#a855f7"}',
 'administracao-publica,limpe,caca-palavras', 1),

(3, '1437a7c6-af08-43a8-b262-67c1aa7d87fc', 1, 1, 1,
 'Moralidade',
 'Exige conduta ética, honesta e compatível com a boa administração.',
 'MORALIDADE', NULL,
 '{"word": "MORALIDADE", "label": "Moralidade", "color": "#16a34a"}',
 'administracao-publica,limpe,caca-palavras', 1),

(4, '13957cb7-3344-4ec1-b8db-fa42624c8783', 1, 1, 1,
 'Publicidade',
 'Atos públicos devem ser divulgados para transparência e controle social.',
 'PUBLICIDADE', NULL,
 '{"word": "PUBLICIDADE", "label": "Publicidade", "color": "#f59e0b"}',
 'administracao-publica,limpe,caca-palavras', 1),

(5, '0495e912-f59e-4a40-af09-bdf30ffb58c6', 1, 1, 1,
 'Eficiência',
 'Busca qualidade, resultado e bom uso dos recursos públicos.',
 'EFICIENCIA', NULL,
 '{"word": "EFICIENCIA", "label": "Eficiência", "color": "#dc2626"}',
 'administracao-publica,limpe,caca-palavras', 1);

-- Fase 2: Flow — Instrumentos de Planejamento (engine: flow)
INSERT INTO tb_question (id, public_id, section_id, engine_id, difficulty, prompt, simple_explanation, correct_answer, options_json, metadata_json, tags, is_active) VALUES
(6, '3bf4cb0c-b159-4e24-8427-d56cb3e7eb21', 1, 3, 1,
 'PMDI',
 'planejamento estratégico de longo prazo do Estado',
 'B', NULL,
 '{"id": "pmdi", "term": "PMDI", "def": "planejamento estratégico de longo prazo do Estado", "letter": "B", "color": "#3b82f6"}',
 'administracao-publica,instrumentos-planejamento,flow', 1),

(7, '751511f4-d14c-48d0-8143-e13205065ea5', 1, 3, 1,
 'PPAG',
 'planejamento plurianual dos programas e ações governamentais',
 'D', NULL,
 '{"id": "ppag", "term": "PPAG", "def": "planejamento plurianual dos programas e ações governamentais", "letter": "D", "color": "#ef4444"}',
 'administracao-publica,instrumentos-planejamento,flow', 1),

(8, '928d4ef6-517b-48d8-9097-64fb962e8ce8', 1, 3, 1,
 'LDO',
 'define diretrizes, metas e prioridades para elaboração da LOA',
 'A', NULL,
 '{"id": "ldo", "term": "LDO", "def": "define diretrizes, metas e prioridades para elaboração da LOA", "letter": "A", "color": "#a855f7"}',
 'administracao-publica,instrumentos-planejamento,flow', 1),

(9, 'bbe6f343-fae6-4eb5-8620-ccdd06993dc5', 1, 3, 1,
 'LOA',
 'estima receitas e fixa despesas para o exercício financeiro',
 'C', NULL,
 '{"id": "loa", "term": "LOA", "def": "estima receitas e fixa despesas para o exercício financeiro", "letter": "C", "color": "#16a34a"}',
 'administracao-publica,instrumentos-planejamento,flow', 1);

-- Fase 3: Ordem Correta — Ciclo Orçamentário (engine: ordem-correta)
INSERT INTO tb_question (id, public_id, section_id, engine_id, difficulty, prompt, simple_explanation, correct_answer, options_json, metadata_json, tags, is_active) VALUES
(10, '17b91c9b-5c49-4037-8a54-67fc096e5041', 1, 4, 1,
 'Elaboração da proposta',
 'Etapa 1 do ciclo orçamentário.',
 '1', NULL,
 '{"id": "elaboracao-proposta", "text": "Elaboração da proposta", "order": 1}',
 'administracao-publica,ciclo-orcamentario,ordem-correta', 1),

(11, '3aa91a74-8f05-4bfd-8e5f-3acb9acb87b5', 1, 4, 1,
 'Discussão legislativa',
 'Etapa 2 do ciclo orçamentário.',
 '2', NULL,
 '{"id": "discussao-legislativa", "text": "Discussão legislativa", "order": 2}',
 'administracao-publica,ciclo-orcamentario,ordem-correta', 1),

(12, '8d1e129e-8a11-46ed-93ac-b8dd36167569', 1, 4, 1,
 'Aprovação da lei orçamentária',
 'Etapa 3 do ciclo orçamentário.',
 '3', NULL,
 '{"id": "aprovacao-lei-orcamentaria", "text": "Aprovação da lei orçamentária", "order": 3}',
 'administracao-publica,ciclo-orcamentario,ordem-correta', 1),

(13, '1cc60f34-a042-4921-9d52-1fd2495633cf', 1, 4, 1,
 'Execução do orçamento',
 'Etapa 4 do ciclo orçamentário.',
 '4', NULL,
 '{"id": "execucao-orcamento", "text": "Execução do orçamento", "order": 4}',
 'administracao-publica,ciclo-orcamentario,ordem-correta', 1),

(14, '83e2ec14-2f53-42bd-b588-01d9ee0fcee7', 1, 4, 1,
 'Controle e avaliação',
 'Etapa 5 do ciclo orçamentário.',
 '5', NULL,
 '{"id": "controle-avaliacao", "text": "Controle e avaliação", "order": 5}',
 'administracao-publica,ciclo-orcamentario,ordem-correta', 1),

(15, '5c482674-7f90-4712-9f90-84364ab70aa4', 1, 4, 1,
 'Prestação de contas',
 'Etapa 6 do ciclo orçamentário.',
 '6', NULL,
 '{"id": "prestacao-contas", "text": "Prestação de contas", "order": 6}',
 'administracao-publica,ciclo-orcamentario,ordem-correta', 1);

-- Fase 4: Quiz — Administração Pública (engine: quiz)
INSERT INTO tb_question (id, public_id, section_id, engine_id, difficulty, prompt, simple_explanation, correct_answer, options_json, metadata_json, tags, is_active) VALUES
(16, 'bb0e2334-b1d8-4d70-94fb-de3a71615cfc', 1, 6, 1,
 'A Administração Pública pode ser entendida como estrutura e como atividade. Qual alternativa representa melhor essa ideia?',
 'Administração Pública envolve tanto a estrutura estatal quanto a atividade administrativa voltada ao interesse coletivo.',
 '0',
 '["Ela reúne órgãos, entidades e agentes que executam atividades de interesse coletivo, como serviços públicos, poder de polícia, fomento e intervenção.", "Ela é apenas o conjunto de empresas privadas que contratam com o governo.", "Ela se limita ao Poder Judiciário e às decisões judiciais.", "Ela existe apenas quando há cobrança de impostos."]',
 '{"id": "conceito-administracao-publica", "answer": 0, "topic": "administracao-publica"}',
 'administracao-publica,quiz,limpe,poderes-esferas', 1),

(17, '0e888051-48ab-46b0-9d76-0c933b383929', 1, 6, 1,
 'O que caracteriza a Administração Direta?',
 'A Administração Direta é composta por órgãos diretamente ligados à União, Estados, Distrito Federal e Municípios.',
 '0',
 '["Órgãos ligados diretamente aos entes federativos, como Ministérios e Secretarias.", "Entidades sempre privadas e sem vínculo com o Estado.", "Somente empresas públicas e sociedades de economia mista.", "Apenas organizações internacionais que atuam no Brasil."]',
 '{"id": "administracao-direta", "answer": 0, "topic": "administracao-publica"}',
 'administracao-publica,quiz,limpe,poderes-esferas', 1),

(18, '431a257f-b96e-4a18-b156-b9bc41efcadb', 1, 6, 1,
 'Qual conjunto apresenta exemplos de Administração Indireta?',
 'A Administração Indireta reúne entidades com personalidade jurídica própria e atuação descentralizada.',
 '0',
 '["Autarquias, fundações públicas, empresas públicas e sociedades de economia mista.", "Ministérios, secretarias e gabinetes de prefeitos.", "Câmaras municipais, assembleias legislativas e Congresso Nacional apenas.", "Tribunais, juízes e promotorias exclusivamente."]',
 '{"id": "administracao-indireta", "answer": 0, "topic": "administracao-publica"}',
 'administracao-publica,quiz,limpe,poderes-esferas', 1),

(19, 'deaad9e9-258b-4415-b64b-b442a493d6c2', 1, 6, 1,
 'No princípio da Legalidade, a Administração Pública deve:',
 'Legalidade significa que a Administração deve atuar nos limites definidos pela lei.',
 '0',
 '["Atuar conforme a lei.", "Escolher livremente o que fazer, mesmo sem previsão legal.", "Ocultar atos administrativos para ganhar agilidade.", "Priorizar promoção pessoal de agentes públicos."]',
 '{"id": "limpe-legalidade", "answer": 0, "topic": "administracao-publica"}',
 'administracao-publica,quiz,limpe,poderes-esferas', 1),

(20, 'ccc16ce6-6aa4-4834-bf58-d29537d91218', 1, 6, 1,
 'Qual princípio do LIMPE está ligado à transparência dos atos e contas públicas?',
 'Publicidade significa transparência dos atos administrativos e das contas públicas.',
 '0',
 '["Publicidade.", "Impessoalidade.", "Moralidade.", "Eficiência."]',
 '{"id": "limpe-publicidade", "answer": 0, "topic": "administracao-publica"}',
 'administracao-publica,quiz,limpe,poderes-esferas', 1),

(21, '9dac3b84-cdaf-4e63-8284-99b1fa5e8554', 1, 6, 1,
 'O princípio da Eficiência exige que a Administração Pública busque:',
 'Eficiência está associada à boa gestão dos recursos e à busca de resultados.',
 '0',
 '["Melhores resultados com menor custo possível.", "Maior gasto possível, mesmo sem resultado.", "Apenas cumprir formalidades, sem medir entrega.", "Atendimento desigual conforme preferência pessoal."]',
 '{"id": "limpe-eficiencia", "answer": 0, "topic": "administracao-publica"}',
 'administracao-publica,quiz,limpe,poderes-esferas', 1),

(22, '8cf2ee85-8361-4f96-837b-c0f00829b472', 1, 6, 1,
 'A esfera federal trata principalmente de questões de:',
 'A esfera federal cuida de temas nacionais, como defesa e relações exteriores.',
 '0',
 '["Interesse nacional, como defesa, emissão de moeda e relações exteriores.", "Interesse exclusivamente de bairros e ruas locais.", "Limpeza pública urbana e educação infantil apenas.", "Transporte coletivo municipal somente."]',
 '{"id": "esfera-federal", "answer": 0, "topic": "administracao-publica"}',
 'administracao-publica,quiz,limpe,poderes-esferas', 1),

(23, 'e974eec9-4d4f-4074-a545-a4eb524a33a8', 1, 6, 1,
 'A esfera estadual foca em interesses regionais. Qual alternativa é exemplo adequado?',
 'Estados atuam em temas regionais, como segurança pública, saúde, educação e transporte intermunicipal.',
 '0',
 '["Segurança pública, saúde, educação e transporte intermunicipal.", "Emissão de moeda e relações exteriores.", "Apenas coleta de lixo de uma rua.", "Somente julgamento de crimes federais."]',
 '{"id": "esfera-estadual", "answer": 0, "topic": "administracao-publica"}',
 'administracao-publica,quiz,limpe,poderes-esferas', 1),

(24, '42a977ef-ab98-4cd9-ae8e-2ba9d92d8645', 1, 6, 1,
 'Qual alternativa descreve uma atribuição típica da esfera municipal?',
 'Municípios cuidam de serviços e interesses locais.',
 '0',
 '["Questões locais, como transporte coletivo urbano, limpeza pública e educação infantil.", "Defesa nacional e emissão de moeda.", "Relações exteriores entre países.", "Criação da Constituição Federal."]',
 '{"id": "esfera-municipal", "answer": 0, "topic": "administracao-publica"}',
 'administracao-publica,quiz,limpe,poderes-esferas', 1),

(25, '6f53f481-024d-4d87-8fbd-560989de770d', 1, 6, 1,
 'Qual é a função central do Poder Executivo?',
 'O Executivo administra o Estado e transforma planos em ações e serviços.',
 '0',
 '["Governar, administrar e colocar programas de governo em prática.", "Criar leis e fiscalizar o governo como função principal.", "Resolver conflitos judiciais e julgar crimes como função principal.", "Atuar apenas na aprovação de contas dos tribunais."]',
 '{"id": "poder-executivo", "answer": 0, "topic": "administracao-publica"}',
 'administracao-publica,quiz,limpe,poderes-esferas', 1),

(26, 'bc0655c6-a943-47e5-ac6f-239084161f1b', 1, 6, 1,
 'O Poder Legislativo é responsável por:',
 'O Legislativo cria leis e acompanha/fiscaliza a atuação do governo.',
 '0',
 '["Criar leis e fiscalizar o governo.", "Administrar escolas, hospitais e estradas diretamente.", "Julgar conflitos entre cidadãos.", "Emitir moeda nacional."]',
 '{"id": "poder-legislativo", "answer": 0, "topic": "administracao-publica"}',
 'administracao-publica,quiz,limpe,poderes-esferas', 1),

(27, 'cc01d41a-f06c-41ba-bdf9-4725400f88b2', 1, 6, 1,
 'Qual é a missão do Poder Judiciário?',
 'O Judiciário protege direitos, resolve conflitos e aplica a lei.',
 '0',
 '["Resolver conflitos e garantir que as leis sejam cumpridas.", "Elaborar o orçamento anual do Executivo.", "Administrar diretamente os serviços de limpeza urbana.", "Criar programas de governo e executá-los."]',
 '{"id": "poder-judiciario", "answer": 0, "topic": "administracao-publica"}',
 'administracao-publica,quiz,limpe,poderes-esferas', 1),

(28, 'a8396b0f-19c6-42c4-9b2f-3e1a5dd63fc4', 1, 6, 1,
 'Segundo a Constituição, Legislativo, Executivo e Judiciário devem ser:',
 'A divisão dos poderes busca equilíbrio institucional, independência e harmonia.',
 '0',
 '["Independentes e harmônicos entre si.", "Subordinados integralmente a um único poder.", "Temporários e sem funções definidas.", "Responsáveis todos pelas mesmas tarefas, sem divisão."]',
 '{"id": "tres-poderes", "answer": 0, "topic": "administracao-publica"}',
 'administracao-publica,quiz,limpe,poderes-esferas', 1),

(29, 'cb048b0b-453b-4184-8f49-85d32a11eeae', 1, 6, 1,
 'Por que um estado com muitos municípios, como Minas Gerais, exige organização administrativa?',
 'A dimensão e diversidade de Minas reforçam a necessidade de estrutura administrativa para planejar e oferecer serviços.',
 '0',
 '["Porque a diversidade territorial e populacional aumenta a necessidade de planejamento, serviços públicos e responsabilidade.", "Porque muitos municípios eliminam a necessidade de governo.", "Porque a Administração Pública só existe em municípios pequenos.", "Porque serviços públicos deixam de ser necessários em estados grandes."]',
 '{"id": "minas-complexidade-administrativa", "answer": 0, "topic": "administracao-publica"}',
 'administracao-publica,quiz,limpe,poderes-esferas', 1);

-- -----------------------------------------------------------------------
-- Seção 2 — Receita e Despesa Pública
-- -----------------------------------------------------------------------

-- Fase 5: Flow — Receita, Despesa e Restos a Pagar (engine: flow)
INSERT INTO tb_question (id, public_id, section_id, engine_id, difficulty, prompt, simple_explanation, correct_answer, options_json, metadata_json, tags, is_active) VALUES
(30, 'f25b2743-3980-4932-933c-98a5e5bd8bff', 2, 3, 1,
 'Receita Corrente',
 'entrada regular, como impostos, taxas e transferências correntes',
 'A', NULL,
 '{"id": "receita-corrente", "term": "Receita Corrente", "def": "entrada regular, como impostos, taxas e transferências correntes", "letter": "A", "color": "#3b82f6"}',
 'receita-despesa-publica,receita-despesa-restos-pagar,flow', 1),

(31, '63bd2dfa-05bc-4388-a0c2-2cda91f1178a', 2, 3, 1,
 'Receita de Capital',
 'entrada relacionada a operações de crédito, alienação de bens ou transferências de capital',
 'B', NULL,
 '{"id": "receita-capital", "term": "Receita de Capital", "def": "entrada relacionada a operações de crédito, alienação de bens ou transferências de capital", "letter": "B", "color": "#0ea5e9"}',
 'receita-despesa-publica,receita-despesa-restos-pagar,flow', 1),

(32, '9e0f5a18-15b6-4194-af4e-56a646148876', 2, 3, 1,
 'Despesa Corrente',
 'gasto para manutenção dos serviços públicos',
 'C', NULL,
 '{"id": "despesa-corrente", "term": "Despesa Corrente", "def": "gasto para manutenção dos serviços públicos", "letter": "C", "color": "#16a34a"}',
 'receita-despesa-publica,receita-despesa-restos-pagar,flow', 1),

(33, '07f5bb30-454c-4fcc-a14b-18a0f7021df8', 2, 3, 1,
 'Despesa de Capital',
 'gasto relacionado a investimentos, obras, equipamentos ou amortização da dívida',
 'D', NULL,
 '{"id": "despesa-capital", "term": "Despesa de Capital", "def": "gasto relacionado a investimentos, obras, equipamentos ou amortização da dívida", "letter": "D", "color": "#f59e0b"}',
 'receita-despesa-publica,receita-despesa-restos-pagar,flow', 1),

(34, 'ff85ec70-2f29-4e37-92d7-9b8f268bc7e6', 2, 3, 1,
 'Restos a Pagar',
 'despesas empenhadas e não pagas até o fim do exercício',
 'E', NULL,
 '{"id": "restos-a-pagar", "term": "Restos a Pagar", "def": "despesas empenhadas e não pagas até o fim do exercício", "letter": "E", "color": "#a855f7"}',
 'receita-despesa-publica,receita-despesa-restos-pagar,flow', 1);

-- Fase 6: Swipe — Despesa Corrente ou Capital (engine: swipe)
INSERT INTO tb_question (id, public_id, section_id, engine_id, difficulty, prompt, simple_explanation, correct_answer, options_json, metadata_json, tags, is_active) VALUES
(35, 'cc0704b8-476d-41a3-b9bd-808644519d63', 2, 5, 1,
 'Pagamento de salários dos servidores públicos.',
 'Salários são despesas de manutenção das atividades do órgão, portanto são despesas correntes.',
 'corrente', NULL,
 '{"id": "salarios-servidores", "prompt": "Pagamento de salários dos servidores públicos.", "answer": "corrente", "leftValue": "corrente", "rightValue": "capital"}',
 'receita-despesa-publica,classificacao-despesa-swipe,swipe', 1),

(36, '4541da32-5195-4a0c-8229-6e318c771167', 2, 5, 1,
 'Pagamento da conta de energia elétrica de uma escola estadual.',
 'Energia elétrica é gasto de funcionamento e manutenção do serviço público.',
 'corrente', NULL,
 '{"id": "energia-escola", "prompt": "Pagamento da conta de energia elétrica de uma escola estadual.", "answer": "corrente", "leftValue": "corrente", "rightValue": "capital"}',
 'receita-despesa-publica,classificacao-despesa-swipe,swipe', 1),

(37, '62f6f60b-51b7-413d-a2e6-0adcd5a196f8', 2, 5, 1,
 'Compra de material de limpeza para uso mensal em uma repartição.',
 'Material de consumo é usado na rotina operacional e não aumenta o patrimônio público.',
 'corrente', NULL,
 '{"id": "material-limpeza", "prompt": "Compra de material de limpeza para uso mensal em uma repartição.", "answer": "corrente", "leftValue": "corrente", "rightValue": "capital"}',
 'receita-despesa-publica,classificacao-despesa-swipe,swipe', 1),

(38, 'd029ed0b-8efd-452f-8ca7-263a3b332766', 2, 5, 1,
 'Pagamento de contrato mensal de vigilância terceirizada.',
 'Serviços terceirizados de rotina mantêm o funcionamento do órgão.',
 'corrente', NULL,
 '{"id": "vigilancia-terceirizada", "prompt": "Pagamento de contrato mensal de vigilância terceirizada.", "answer": "corrente", "leftValue": "corrente", "rightValue": "capital"}',
 'receita-despesa-publica,classificacao-despesa-swipe,swipe', 1),

(39, 'da4a6834-e483-41c4-b371-790062c2c914', 2, 5, 1,
 'Pagamento de diárias para servidor em viagem de trabalho.',
 'Diárias custeiam atividade operacional e não geram bem permanente.',
 'corrente', NULL,
 '{"id": "diarias-servidor", "prompt": "Pagamento de diárias para servidor em viagem de trabalho.", "answer": "corrente", "leftValue": "corrente", "rightValue": "capital"}',
 'receita-despesa-publica,classificacao-despesa-swipe,swipe', 1),

(40, '2d75c1c0-e45a-4654-909b-4c24629b85fb', 2, 5, 1,
 'Manutenção preventiva de aparelhos de ar-condicionado já existentes.',
 'Manutenção conserva bens existentes e faz parte do custeio das atividades.',
 'corrente', NULL,
 '{"id": "manutencao-ar-condicionado", "prompt": "Manutenção preventiva de aparelhos de ar-condicionado já existentes.", "answer": "corrente", "leftValue": "corrente", "rightValue": "capital"}',
 'receita-despesa-publica,classificacao-despesa-swipe,swipe', 1),

(41, 'bb76d1cc-3858-42ae-a8c7-0be3fb04bb82', 2, 5, 1,
 'Compra de computadores para equipar uma nova sala de atendimento.',
 'Equipamentos permanentes aumentam ou renovam o patrimônio público, por isso são despesas de capital.',
 'capital', NULL,
 '{"id": "computadores-nova-sala", "prompt": "Compra de computadores para equipar uma nova sala de atendimento.", "answer": "capital", "leftValue": "corrente", "rightValue": "capital"}',
 'receita-despesa-publica,classificacao-despesa-swipe,swipe', 1),

(42, 'ac5df5fb-4492-4ac9-96db-e3d12c567b29', 2, 5, 1,
 'Construção de uma nova unidade de saúde.',
 'Construção de imóvel público é investimento e gera um bem permanente para o Estado.',
 'capital', NULL,
 '{"id": "nova-unidade-saude", "prompt": "Construção de uma nova unidade de saúde.", "answer": "capital", "leftValue": "corrente", "rightValue": "capital"}',
 'receita-despesa-publica,classificacao-despesa-swipe,swipe', 1),

(43, '35ee9348-490b-472b-9a7d-f3fffdc96622', 2, 5, 1,
 'Aquisição de veículos oficiais para fiscalização.',
 'Veículos são bens permanentes e compõem o patrimônio público.',
 'capital', NULL,
 '{"id": "veiculos-fiscalizacao", "prompt": "Aquisição de veículos oficiais para fiscalização.", "answer": "capital", "leftValue": "corrente", "rightValue": "capital"}',
 'receita-despesa-publica,classificacao-despesa-swipe,swipe', 1),

(44, 'fa64bca4-a33f-4c26-9357-749cfdd7ffd2', 2, 5, 1,
 'Compra de carteiras escolares permanentes.',
 'Mobiliário permanente é incorporado ao patrimônio público.',
 'capital', NULL,
 '{"id": "carteiras-escolares", "prompt": "Compra de carteiras escolares permanentes.", "answer": "capital", "leftValue": "corrente", "rightValue": "capital"}',
 'receita-despesa-publica,classificacao-despesa-swipe,swipe', 1),

(45, 'ee301822-38d6-4343-bc3e-b21e00ae3f86', 2, 5, 1,
 'Reforma estrutural que amplia a capacidade de atendimento de um prédio público.',
 'Obra que amplia ou melhora de forma permanente um bem público é despesa de capital.',
 'capital', NULL,
 '{"id": "obra-ampliacao-predio", "prompt": "Reforma estrutural que amplia a capacidade de atendimento de um prédio público.", "answer": "capital", "leftValue": "corrente", "rightValue": "capital"}',
 'receita-despesa-publica,classificacao-despesa-swipe,swipe', 1),

(46, '8c95a4c9-1811-48c5-98a2-4a1878d7c539', 2, 5, 1,
 'Amortização da dívida pública.',
 'Amortização da dívida é classificada como despesa de capital.',
 'capital', NULL,
 '{"id": "amortizacao-divida", "prompt": "Amortização da dívida pública.", "answer": "capital", "leftValue": "corrente", "rightValue": "capital"}',
 'receita-despesa-publica,classificacao-despesa-swipe,swipe', 1);

-- Fase 8: Swipe — Verdadeiro ou Falso: Receita e Despesa (engine: swipe)
INSERT INTO tb_question (id, public_id, section_id, engine_id, difficulty, prompt, simple_explanation, correct_answer, options_json, metadata_json, tags, is_active) VALUES
(80, '1f5a9b10-7452-475a-a71d-5561a0b12380', 2, 5, 1,
 'Os tributos (impostos, taxas e contribuições) são exemplos de Receita Corrente.',
 'Impostos e taxas são arrecadações regulares do Estado para manutenção dos serviços públicos.',
 'verdadeiro', NULL,
 '{"id": "vf-tributos-corrente", "answer": "verdadeiro", "leftValue": "falso", "rightValue": "verdadeiro"}',
 'receita-despesa-publica,vf-receita-despesa,swipe', 1),

(81, '2f5a9b10-7452-475a-a71d-5561a0b12381', 2, 5, 1,
 'Operações de crédito (empréstimos obtidos pelo governo) são classificadas como Despesas Correntes.',
 'Operações de crédito entram no caixa como Receita de Capital.',
 'falso', NULL,
 '{"id": "vf-operacoes-credito", "answer": "falso", "leftValue": "falso", "rightValue": "verdadeiro"}',
 'receita-despesa-publica,vf-receita-despesa,swipe', 1),

(82, '3f5a9b10-7452-475a-a71d-5561a0b12382', 2, 5, 1,
 'A compra de merenda escolar é uma Despesa Corrente.',
 'Merenda escolar é item de consumo para manutenção das atividades da escola.',
 'verdadeiro', NULL,
 '{"id": "vf-merenda-corrente", "answer": "verdadeiro", "leftValue": "falso", "rightValue": "verdadeiro"}',
 'receita-despesa-publica,vf-receita-despesa,swipe', 1),

(83, '4f5a9b10-7452-475a-a71d-5561a0b12383', 2, 5, 1,
 'Investimentos em pontes e estradas geram bens permanentes e são Despesas de Capital.',
 'Obras de infraestrutura incorporam valor ao patrimônio público.',
 'verdadeiro', NULL,
 '{"id": "vf-obras-capital", "answer": "verdadeiro", "leftValue": "falso", "rightValue": "verdadeiro"}',
 'receita-despesa-publica,vf-receita-despesa,swipe', 1),

(84, '5f5a9b10-7452-475a-a71d-5561a0b12384', 2, 5, 1,
 'Alienação de bens (venda de imóveis ou veículos antigos) gera Receita Corrente.',
 'A venda de patrimônio público é classificada como Receita de Capital.',
 'falso', NULL,
 '{"id": "vf-alienacao-bens", "answer": "falso", "leftValue": "falso", "rightValue": "verdadeiro"}',
 'receita-despesa-publica,vf-receita-despesa,swipe', 1),

(85, '6f5a9b10-7452-475a-a71d-5561a0b12385', 2, 5, 1,
 'Restos a Pagar são despesas que foram empenhadas mas não pagas até o final do ano.',
 'Restos a pagar transitam de um exercício financeiro para o seguinte.',
 'verdadeiro', NULL,
 '{"id": "vf-restos-pagar-conceito", "answer": "verdadeiro", "leftValue": "falso", "rightValue": "verdadeiro"}',
 'receita-despesa-publica,vf-receita-despesa,swipe', 1),

(86, '7f5a9b10-7452-475a-a71d-5561a0b12386', 2, 5, 1,
 'Pagamento de aposentadorias e pensões é uma Despesa de Capital.',
 'Aposentadorias e pensões mantêm serviços/pessoal e são Despesas Correntes.',
 'falso', NULL,
 '{"id": "vf-aposentadoria-capital", "answer": "falso", "leftValue": "falso", "rightValue": "verdadeiro"}',
 'receita-despesa-publica,vf-receita-despesa,swipe', 1),

(87, '8f5a9b10-7452-475a-a71d-5561a0b12387', 2, 5, 1,
 'Receitas patrimoniais (como aluguéis de bens públicos) são Receitas Correntes.',
 'Rendimentos patrimoniais e aluguéis entram na categoria de receitas correntes.',
 'verdadeiro', NULL,
 '{"id": "vf-receita-patrimonial", "answer": "verdadeiro", "leftValue": "falso", "rightValue": "verdadeiro"}',
 'receita-despesa-publica,vf-receita-despesa,swipe', 1),

(88, '9f5a9b10-7452-475a-a71d-5561a0b12388', 2, 5, 1,
 'Despesas de Custeio servem para a criação de novos serviços e ampliação de prédios.',
 'Despesas de Custeio apenas mantêm os serviços já existentes (Despesas Correntes).',
 'falso', NULL,
 '{"id": "vf-custeio-criacao", "answer": "falso", "leftValue": "falso", "rightValue": "verdadeiro"}',
 'receita-despesa-publica,vf-receita-despesa,swipe', 1),

(89, 'af5a9b10-7452-475a-a71d-5561a0b12389', 2, 5, 1,
 'Amortização do principal da dívida pública é uma Despesa de Capital.',
 'O pagamento do principal da dívida reduz o passivo e é despesa de capital.',
 'verdadeiro', NULL,
 '{"id": "vf-amortizacao-capital", "answer": "verdadeiro", "leftValue": "falso", "rightValue": "verdadeiro"}',
 'receita-despesa-publica,vf-receita-despesa,swipe', 1);

-- -----------------------------------------------------------------------
-- Seção 4 — Transparência e Controle Social
-- Nota: inseridas antes da seção 3 pois os IDs originais seguem essa ordem
-- -----------------------------------------------------------------------

-- Fase 13: Cruzadinha — Balanços e Demonstrativos (engine: cruzadinha)
INSERT INTO tb_question (id, public_id, section_id, engine_id, difficulty, prompt, simple_explanation, correct_answer, options_json, metadata_json, tags, is_active) VALUES
(47, '8569d2bd-cb08-4713-a33d-3c007e291196', 4, 2, 2,
 'Conjunto de demonstrativos que apresenta a situação orçamentária, financeira e patrimonial do Estado.',
 'O Balanço Geral consolida informações contábeis e fiscais do exercício.',
 'BALANCOGERAL', NULL,
 '{"word":"BALANCOGERAL","label":"Balanço Geral","engine":"cruzadinha"}',
 'balanco;prestacao de contas;cruzadinha:balancos-demonstrativos:BALANCOGERAL', 1),

(48, '9202ebac-ec22-4609-9ad1-f8c450f96086', 4, 2, 2,
 'Relatório bimestral que acompanha a execução orçamentária.',
 'O Relatório Resumido da Execução Orçamentária é previsto na Lei de Responsabilidade Fiscal.',
 'RREO', NULL,
 '{"word":"RREO","label":"RREO","engine":"cruzadinha"}',
 'rreo;lrf;cruzadinha:balancos-demonstrativos:RREO', 1),

(49, 'ab9d13d6-6160-4f3c-bdb3-b98b8d79e3b7', 4, 2, 2,
 'Relatório que acompanha limites fiscais como pessoal, dívida e garantias.',
 'O Relatório de Gestão Fiscal monitora o cumprimento de limites da LRF.',
 'RGF', NULL,
 '{"word":"RGF","label":"RGF","engine":"cruzadinha"}',
 'rgf;lrf;cruzadinha:balancos-demonstrativos:RGF', 1),

(50, '41c44b9c-8268-46d4-8af2-8a9c15859adc', 4, 2, 2,
 'Conjunto de bens e direitos controlados pelo ente público.',
 'O ativo representa recursos e direitos que podem gerar benefícios.',
 'ATIVO', NULL,
 '{"word":"ATIVO","label":"Ativo","engine":"cruzadinha"}',
 'ativo;patrimonio;cruzadinha:balancos-demonstrativos:ATIVO', 1),

(51, 'ebb30c13-7e91-4eaf-8509-19aa41e5c9b2', 4, 2, 2,
 'Conjunto de obrigações e dívidas do ente público.',
 'O passivo representa obrigações presentes do Estado.',
 'PASSIVO', NULL,
 '{"word":"PASSIVO","label":"Passivo","engine":"cruzadinha"}',
 'passivo;patrimonio;cruzadinha:balancos-demonstrativos:PASSIVO', 1),

(52, 'df59daea-b258-41d6-b339-82bd43d81392', 4, 2, 2,
 'Conjunto de bens, direitos e obrigações do ente público.',
 'O patrimônio público é acompanhado pela contabilidade aplicada ao setor público.',
 'PATRIMONIO', NULL,
 '{"word":"PATRIMONIO","label":"Patrimônio","engine":"cruzadinha"}',
 'patrimonio;contabilidade;cruzadinha:balancos-demonstrativos:PATRIMONIO', 1),

(53, 'b72b1150-8855-468b-93da-36d80173b1a4', 4, 2, 2,
 'Princípio que permite ao cidadão acompanhar informações públicas.',
 'A transparência fortalece o controle social e a participação cidadã.',
 'TRANSPARENCIA', NULL,
 '{"word":"TRANSPARENCIA","label":"Transparência","engine":"cruzadinha"}',
 'transparencia;controle social;cruzadinha:balancos-demonstrativos:TRANSPARENCIA', 1),

(54, 'dd8a5b24-adf5-4fac-b6ee-dd33f853fa31', 4, 2, 2,
 'Participação da sociedade no acompanhamento das ações governamentais.',
 'Controle social é o acompanhamento feito pela população.',
 'CONTROLESOCIAL', NULL,
 '{"word":"CONTROLESOCIAL","label":"Controle Social","engine":"cruzadinha"}',
 'controle social;cidadania;cruzadinha:balancos-demonstrativos:CONTROLESOCIAL', 1),

(55, '88549376-3605-48e2-b84c-90216a21a37d', 4, 2, 2,
 'Canal usado pelo cidadão para registrar manifestações sobre serviços públicos.',
 'A ouvidoria recebe reclamações, sugestões, denúncias e elogios.',
 'OUVIDORIA', NULL,
 '{"word":"OUVIDORIA","label":"Ouvidoria","engine":"cruzadinha"}',
 'ouvidoria;cidadania;cruzadinha:balancos-demonstrativos:OUVIDORIA', 1),

(56, 'ae6772ac-6ad2-4b20-b58c-5e53eff3adfb', 4, 2, 2,
 'Documento contábil que apresenta informações específicas de forma organizada.',
 'Demonstrativos ajudam a interpretar a execução e a situação fiscal.',
 'DEMONSTRATIVO', NULL,
 '{"word":"DEMONSTRATIVO","label":"Demonstrativo","engine":"cruzadinha"}',
 'demonstrativo;contabilidade;cruzadinha:balancos-demonstrativos:DEMONSTRATIVO', 1),

(57, 'f9462244-57f6-4f1d-8ebb-8291e116b7a4', 4, 2, 2,
 'Indicador que mostra o desempenho fiscal ou patrimonial em determinado período.',
 'Resultados ajudam a avaliar a situação das contas públicas.',
 'RESULTADO', NULL,
 '{"word":"RESULTADO","label":"Resultado","engine":"cruzadinha"}',
 'resultado;fiscal;cruzadinha:balancos-demonstrativos:RESULTADO', 1),

(58, '9353fde0-ac9f-42f5-aafa-0394600621b1', 4, 2, 2,
 'Ambiente eletrônico em que são publicadas informações públicas para consulta.',
 'O portal da transparência facilita o acesso a dados públicos.',
 'PORTAL', NULL,
 '{"word":"PORTAL","label":"Portal","engine":"cruzadinha"}',
 'portal;transparencia;cruzadinha:balancos-demonstrativos:PORTAL', 1);

-- -----------------------------------------------------------------------
-- Seção 2 (continuação) — Fase 7: Cruzadinha — Termos Fiscais (engine: cruzadinha)
-- IDs 59–70 seguem a ordem original do backup
-- -----------------------------------------------------------------------

INSERT INTO tb_question (id, public_id, section_id, engine_id, difficulty, prompt, simple_explanation, correct_answer, options_json, metadata_json, tags, is_active) VALUES
(59, '6e318d25-03cd-4415-bd6d-6080a4fb6d0c', 2, 2, 2,
 'Entrada de recursos públicos que financia as políticas públicas.',
 'Receita pública é o ingresso de recursos nos cofres públicos.',
 'RECEITA', NULL,
 '{"word":"RECEITA","label":"Receita","engine":"cruzadinha"}',
 'receita;conceito;fiscal;cruzadinha:termos-fiscais:RECEITA', 1),

(60, '95c0da27-beb7-4ce6-832a-721c11124a4d', 2, 2, 2,
 'Aplicação dos recursos públicos para entregar serviços, obras e políticas públicas.',
 'Despesa pública é o gasto autorizado e executado pelo Estado.',
 'DESPESA', NULL,
 '{"word":"DESPESA","label":"Despesa","engine":"cruzadinha"}',
 'despesa;conceito;fiscal;cruzadinha:termos-fiscais:DESPESA', 1),

(61, '4443bb0e-0669-46ac-a922-bd29b39b1581', 2, 2, 2,
 'Classificação da despesa usada para manutenção dos serviços públicos.',
 'Despesa corrente mantém atividades, serviços e custeio da administração.',
 'CORRENTE', NULL,
 '{"word":"CORRENTE","label":"Corrente","engine":"cruzadinha"}',
 'despesa;corrente;custeio;cruzadinha:termos-fiscais:CORRENTE', 1),

(62, '2cf0b6cc-80cb-4af6-9dfb-708855b68a24', 2, 2, 2,
 'Classificação da despesa ligada a investimentos, obras e aquisição de bens permanentes.',
 'Despesa de capital aumenta ou melhora o patrimônio público.',
 'CAPITAL', NULL,
 '{"word":"CAPITAL","label":"Capital","engine":"cruzadinha"}',
 'despesa;capital;investimento;cruzadinha:termos-fiscais:CAPITAL', 1),

(63, '549cca20-7dd0-4813-9928-e73f57348617', 2, 2, 2,
 'Lei que estima receitas e fixa despesas para o exercício financeiro.',
 'A Lei Orçamentária Anual detalha o orçamento de cada ano.',
 'LOA', NULL,
 '{"word":"LOA","label":"LOA","engine":"cruzadinha"}',
 'loa;orcamento;lei;cruzadinha:termos-fiscais:LOA', 1),

(64, '856cc840-3131-45f2-9aff-b33b0e4fe7a0', 2, 2, 2,
 'Instrumento de planejamento governamental com programas para quatro anos.',
 'O Plano Plurianual organiza objetivos e programas de médio prazo.',
 'PPA', NULL,
 '{"word":"PPA","label":"PPA","engine":"cruzadinha"}',
 'ppa;planejamento;cruzadinha:termos-fiscais:PPA', 1),

(65, '5268f752-0c6a-46f5-b01a-1fd4bab5a5b7', 2, 2, 2,
 'Lei que orienta a elaboração do orçamento anual e define prioridades.',
 'A Lei de Diretrizes Orçamentárias conecta o PPA com a LOA.',
 'LDO', NULL,
 '{"word":"LDO","label":"LDO","engine":"cruzadinha"}',
 'ldo;planejamento;cruzadinha:termos-fiscais:LDO', 1),

(66, '4169216a-d2b9-43d6-854d-8d7a12905303', 2, 2, 2,
 'Etapa que reserva dotação orçamentária para uma obrigação do Estado.',
 'O empenho é a primeira etapa da execução da despesa.',
 'EMPENHO', NULL,
 '{"word":"EMPENHO","label":"Empenho","engine":"cruzadinha"}',
 'empenho;execucao;cruzadinha:termos-fiscais:EMPENHO', 1),

(67, 'e40fecdb-98e4-4bf7-b382-1719432f82a4', 2, 2, 2,
 'Etapa que verifica se o serviço, bem ou obra foi entregue.',
 'Na liquidação se confirma o direito do credor ao pagamento.',
 'LIQUIDACAO', NULL,
 '{"word":"LIQUIDACAO","label":"Liquidação","engine":"cruzadinha"}',
 'liquidacao;execucao;cruzadinha:termos-fiscais:LIQUIDACAO', 1),

(68, 'f840ef8c-8d4a-40d9-8a94-e7bc62201f50', 2, 2, 2,
 'Etapa em que o valor devido é efetivamente pago ao credor.',
 'O pagamento encerra o ciclo básico da despesa pública.',
 'PAGAMENTO', NULL,
 '{"word":"PAGAMENTO","label":"Pagamento","engine":"cruzadinha"}',
 'pagamento;execucao;cruzadinha:termos-fiscais:PAGAMENTO', 1),

(69, '3c8f3ca8-3de8-490d-9f76-381bc67c5d8a', 2, 2, 2,
 'Despesas empenhadas que não foram pagas até o fim do exercício.',
 'Restos a pagar são obrigações que passam para o exercício seguinte.',
 'RESTOSAPAGAR', NULL,
 '{"word":"RESTOSAPAGAR","label":"Restos a Pagar","engine":"cruzadinha"}',
 'restos a pagar;despesa;cruzadinha:termos-fiscais:RESTOSAPAGAR', 1),

(70, 'bc1226f1-7e3b-41fe-ae18-de7ce6ca5d26', 2, 2, 2,
 'Plano que estima receitas e fixa despesas públicas.',
 'O orçamento público organiza como o dinheiro será arrecadado e aplicado.',
 'ORCAMENTO', NULL,
 '{"word":"ORCAMENTO","label":"Orçamento","engine":"cruzadinha"}',
 'orcamento;planejamento;cruzadinha:termos-fiscais:ORCAMENTO', 1);

-- -----------------------------------------------------------------------
-- Seção 3 — Execução Orçamentária
-- Questões criadas com base nos conteúdos das fases 9–12
-- (not present in backup — foram recriadas com base na estrutura das fases)
-- -----------------------------------------------------------------------

-- Fase 9: Ordem correta — Caminho do Documento (engine: ordem-correta)
INSERT INTO tb_question (id, public_id, section_id, engine_id, difficulty, prompt, simple_explanation, correct_answer, options_json, metadata_json, tags, is_active) VALUES
(100, NULL, 3, 4, 1,
 'Empenho',
 'Primeira etapa da execução: reserva da dotação orçamentária.',
 '1', NULL,
 '{"id": "empenho-etapa", "text": "Empenho", "order": 1}',
 'execucao-orcamentaria,caminho-documento,ordem-correta', 1),

(101, NULL, 3, 4, 1,
 'Liquidação',
 'Segunda etapa: verificação da entrega do bem ou serviço.',
 '2', NULL,
 '{"id": "liquidacao-etapa", "text": "Liquidação", "order": 2}',
 'execucao-orcamentaria,caminho-documento,ordem-correta', 1),

(102, NULL, 3, 4, 1,
 'Pagamento',
 'Terceira etapa: transferência do recurso ao credor.',
 '3', NULL,
 '{"id": "pagamento-etapa", "text": "Pagamento", "order": 3}',
 'execucao-orcamentaria,caminho-documento,ordem-correta', 1),

(103, NULL, 3, 4, 1,
 'Nota de Empenho',
 'Documento que formaliza o empenho e inicia o processo de pagamento.',
 '4', NULL,
 '{"id": "nota-empenho", "text": "Nota de Empenho", "order": 4}',
 'execucao-orcamentaria,caminho-documento,ordem-correta', 1);

-- Fase 10: Flow — Etapas da Despesa Pública (engine: flow)
INSERT INTO tb_question (id, public_id, section_id, engine_id, difficulty, prompt, simple_explanation, correct_answer, options_json, metadata_json, tags, is_active) VALUES
(110, NULL, 3, 3, 1,
 'Empenho',
 'Reserva da dotação orçamentária para cumprir uma obrigação do Estado.',
 'A', NULL,
 '{"id": "empenho-flow", "term": "Empenho", "def": "Reserva da dotação orçamentária para cumprir uma obrigação do Estado.", "letter": "A", "color": "#3b82f6"}',
 'execucao-orcamentaria,etapas-despesa,flow', 1),

(111, NULL, 3, 3, 1,
 'Liquidação',
 'Verificação de que o bem foi entregue ou o serviço foi prestado.',
 'B', NULL,
 '{"id": "liquidacao-flow", "term": "Liquidação", "def": "Verificação de que o bem foi entregue ou o serviço foi prestado.", "letter": "B", "color": "#16a34a"}',
 'execucao-orcamentaria,etapas-despesa,flow', 1),

(112, NULL, 3, 3, 1,
 'Pagamento',
 'Transferência do recurso financeiro ao credor após a liquidação.',
 'C', NULL,
 '{"id": "pagamento-flow", "term": "Pagamento", "def": "Transferência do recurso financeiro ao credor após a liquidação.", "letter": "C", "color": "#f59e0b"}',
 'execucao-orcamentaria,etapas-despesa,flow', 1),

(113, NULL, 3, 3, 1,
 'Restos a Pagar',
 'Despesas empenhadas e não pagas até o encerramento do exercício financeiro.',
 'D', NULL,
 '{"id": "restos-pagar-flow", "term": "Restos a Pagar", "def": "Despesas empenhadas e não pagas até o encerramento do exercício financeiro.", "letter": "D", "color": "#a855f7"}',
 'execucao-orcamentaria,etapas-despesa,flow', 1);

-- Fase 11: Swipe — Verdadeiro ou Falso: Índices e Limites (engine: swipe)
INSERT INTO tb_question (id, public_id, section_id, engine_id, difficulty, prompt, simple_explanation, correct_answer, options_json, metadata_json, tags, is_active) VALUES
(120, NULL, 3, 5, 2,
 'A Lei de Responsabilidade Fiscal impõe limites para despesas com pessoal.',
 'A LRF estabelece limites percentuais para gastos com pessoal em relação à Receita Corrente Líquida.',
 'verdadeiro', NULL,
 '{"id": "lrf-limite-pessoal", "answer": "verdadeiro", "leftValue": "falso", "rightValue": "verdadeiro"}',
 'execucao-orcamentaria,indices-limites,swipe', 1),

(121, NULL, 3, 5, 2,
 'O superávit primário significa que as receitas foram menores do que as despesas.',
 'O superávit primário ocorre quando as receitas superam as despesas, excluindo os juros da dívida.',
 'falso', NULL,
 '{"id": "superavit-primario", "answer": "falso", "leftValue": "falso", "rightValue": "verdadeiro"}',
 'execucao-orcamentaria,indices-limites,swipe', 1),

(122, NULL, 3, 5, 2,
 'O Resultado Nominal inclui os juros da dívida pública no cálculo.',
 'O Resultado Nominal considera tanto o resultado primário quanto as despesas com juros.',
 'verdadeiro', NULL,
 '{"id": "resultado-nominal", "answer": "verdadeiro", "leftValue": "falso", "rightValue": "verdadeiro"}',
 'execucao-orcamentaria,indices-limites,swipe', 1),

(123, NULL, 3, 5, 2,
 'A Receita Corrente Líquida é calculada sem deduzir transferências constitucionais.',
 'A RCL é calculada após deduzir transferências constitucionais e legais.',
 'falso', NULL,
 '{"id": "rcl-calculo", "answer": "falso", "leftValue": "falso", "rightValue": "verdadeiro"}',
 'execucao-orcamentaria,indices-limites,swipe', 1),

(124, NULL, 3, 5, 2,
 'O RREO é publicado bimestralmente pelo governo.',
 'O Relatório Resumido da Execução Orçamentária tem periodicidade bimestral.',
 'verdadeiro', NULL,
 '{"id": "rreo-bimestral", "answer": "verdadeiro", "leftValue": "falso", "rightValue": "verdadeiro"}',
 'execucao-orcamentaria,indices-limites,swipe', 1),

(125, NULL, 3, 5, 2,
 'O limite máximo para despesas com pessoal no Executivo estadual é 60% da RCL.',
 'Segundo a LRF, o Executivo estadual tem limite de 49% da RCL para pessoal; o total do ente é 60%.',
 'falso', NULL,
 '{"id": "limite-pessoal-executivo", "answer": "falso", "leftValue": "falso", "rightValue": "verdadeiro"}',
 'execucao-orcamentaria,indices-limites,swipe', 1),

(126, NULL, 3, 5, 2,
 'O RGF é publicado quadrimestralmente.',
 'O Relatório de Gestão Fiscal tem periodicidade quadrimestral.',
 'verdadeiro', NULL,
 '{"id": "rgf-quadrimestral", "answer": "verdadeiro", "leftValue": "falso", "rightValue": "verdadeiro"}',
 'execucao-orcamentaria,indices-limites,swipe', 1),

(127, NULL, 3, 5, 2,
 'A dívida consolidada líquida é a dívida bruta menos as disponibilidades financeiras.',
 'A Dívida Consolidada Líquida corresponde à dívida consolidada bruta deduzida as disponibilidades.',
 'verdadeiro', NULL,
 '{"id": "divida-consolidada-liquida", "answer": "verdadeiro", "leftValue": "falso", "rightValue": "verdadeiro"}',
 'execucao-orcamentaria,indices-limites,swipe', 1),

(128, NULL, 3, 5, 2,
 'O não cumprimento dos limites da LRF pode resultar em sanções ao gestor.',
 'O descumprimento da LRF pode acarretar vedações, sanções pessoais e responsabilidade fiscal.',
 'verdadeiro', NULL,
 '{"id": "sancoes-lrf", "answer": "verdadeiro", "leftValue": "falso", "rightValue": "verdadeiro"}',
 'execucao-orcamentaria,indices-limites,swipe', 1),

(129, NULL, 3, 5, 2,
 'Despesas de capital não entram no cálculo do resultado primário.',
 'Despesas de capital fazem parte do cálculo do resultado primário.',
 'falso', NULL,
 '{"id": "capital-primario", "answer": "falso", "leftValue": "falso", "rightValue": "verdadeiro"}',
 'execucao-orcamentaria,indices-limites,swipe', 1),

(130, NULL, 3, 5, 2,
 'A LOA deve ser compatível com as metas da LDO.',
 'A Lei Orçamentária Anual deve respeitar as diretrizes e metas fiscais fixadas na LDO.',
 'verdadeiro', NULL,
 '{"id": "loa-ldo-compatibilidade", "answer": "verdadeiro", "leftValue": "falso", "rightValue": "verdadeiro"}',
 'execucao-orcamentaria,indices-limites,swipe', 1);

-- Fase 12: Quiz — Execução Orçamentária (engine: quiz)
INSERT INTO tb_question (id, public_id, section_id, engine_id, difficulty, prompt, simple_explanation, correct_answer, options_json, metadata_json, tags, is_active) VALUES
(140, NULL, 3, 6, 2,
 'O que é empenho na execução da despesa pública?',
 'O empenho é o ato pelo qual a autoridade competente cria obrigação de pagamento.',
 '0',
 '["Ato que reserva dotação orçamentária para uma obrigação de pagamento.", "Confirmação de entrega de bem ou serviço.", "Transferência do recurso ao credor.", "Publicação do orçamento aprovado."]',
 '{"id": "conceito-empenho", "answer": 0, "topic": "execucao-orcamentaria"}',
 'execucao-orcamentaria,quiz', 1),

(141, NULL, 3, 6, 2,
 'Qual é a ordem correta das etapas da execução da despesa pública?',
 'Empenho → Liquidação → Pagamento é a sequência prevista na Lei 4.320/64.',
 '0',
 '["Empenho, Liquidação, Pagamento.", "Pagamento, Empenho, Liquidação.", "Liquidação, Pagamento, Empenho.", "Empenho, Pagamento, Liquidação."]',
 '{"id": "ordem-etapas-despesa", "answer": 0, "topic": "execucao-orcamentaria"}',
 'execucao-orcamentaria,quiz', 1),

(142, NULL, 3, 6, 2,
 'O que são Restos a Pagar?',
 'Restos a Pagar são despesas empenhadas e não pagas até o fim do exercício.',
 '0',
 '["Despesas empenhadas e não pagas até o encerramento do exercício financeiro.", "Receitas arrecadadas e não utilizadas.", "Dotações orçamentárias não empenhadas.", "Dívidas de exercícios anteriores já liquidadas."]',
 '{"id": "conceito-restos-pagar", "answer": 0, "topic": "execucao-orcamentaria"}',
 'execucao-orcamentaria,quiz', 1),

(143, NULL, 3, 6, 2,
 'O que ocorre na etapa de Liquidação da despesa?',
 'Na liquidação verifica-se o direito do credor ao recebimento.',
 '0',
 '["Verifica-se a entrega do bem ou prestação do serviço, confirmando o direito do credor.", "Emite-se a nota de empenho reservando dotação.", "Efetua-se o pagamento ao fornecedor.", "Inscreve-se a despesa como Restos a Pagar."]',
 '{"id": "conceito-liquidacao", "answer": 0, "topic": "execucao-orcamentaria"}',
 'execucao-orcamentaria,quiz', 1),

(144, NULL, 3, 6, 2,
 'Qual lei regula a responsabilidade na gestão fiscal?',
 'A Lei de Responsabilidade Fiscal (LC 101/2000) estabelece normas de finanças públicas.',
 '0',
 '["Lei de Responsabilidade Fiscal — LC 101/2000.", "Lei 4.320/64.", "Lei de Licitações — 14.133/2021.", "Constituição Federal, art. 37."]',
 '{"id": "lei-responsabilidade-fiscal", "answer": 0, "topic": "execucao-orcamentaria"}',
 'execucao-orcamentaria,quiz', 1),

(145, NULL, 3, 6, 2,
 'O Resultado Primário é calculado como:',
 'O Resultado Primário exclui receitas e despesas com juros da dívida.',
 '0',
 '["Receitas primárias menos Despesas primárias (excluindo juros).", "Receitas totais menos Despesas totais incluindo juros.", "Apenas o saldo da conta corrente do Tesouro.", "Receitas de capital menos Despesas de capital."]',
 '{"id": "resultado-primario-calculo", "answer": 0, "topic": "execucao-orcamentaria"}',
 'execucao-orcamentaria,quiz', 1);

-- -----------------------------------------------------------------------
-- Seção 4 (continuação) — Fases 14–16
-- Swipe, Flow e Quiz de Transparência e Controle Social
-- -----------------------------------------------------------------------

-- Fase 14: Swipe — Verdadeiro ou Falso: Direitos e Deveres (engine: swipe)
INSERT INTO tb_question (id, public_id, section_id, engine_id, difficulty, prompt, simple_explanation, correct_answer, options_json, metadata_json, tags, is_active) VALUES
(150, NULL, 4, 5, 2,
 'Todo cidadão tem direito de acessar informações públicas pela Lei de Acesso à Informação.',
 'A LAI (Lei 12.527/2011) garante o direito de acesso a informações públicas.',
 'verdadeiro', NULL,
 '{"id": "lai-acesso", "answer": "verdadeiro", "leftValue": "falso", "rightValue": "verdadeiro"}',
 'transparencia-controle-social,direitos-deveres,swipe', 1),

(151, NULL, 4, 5, 2,
 'O controle externo é exercido exclusivamente pelo Poder Judiciário.',
 'O controle externo é exercido pelo Poder Legislativo com auxílio do Tribunal de Contas.',
 'falso', NULL,
 '{"id": "controle-externo-judiciario", "answer": "falso", "leftValue": "falso", "rightValue": "verdadeiro"}',
 'transparencia-controle-social,direitos-deveres,swipe', 1),

(152, NULL, 4, 5, 2,
 'O Portal da Transparência permite consultar gastos, contratos e servidores públicos.',
 'O Portal da Transparência é o instrumento de publicidade ativa do governo.',
 'verdadeiro', NULL,
 '{"id": "portal-transparencia-consulta", "answer": "verdadeiro", "leftValue": "falso", "rightValue": "verdadeiro"}',
 'transparencia-controle-social,direitos-deveres,swipe', 1),

(153, NULL, 4, 5, 2,
 'A Ouvidoria é obrigada a responder manifestações em até 30 dias.',
 'A LAI estabelece prazo de 20 dias, prorrogável por mais 10, para resposta a pedidos de informação.',
 'falso', NULL,
 '{"id": "ouvidoria-prazo", "answer": "falso", "leftValue": "falso", "rightValue": "verdadeiro"}',
 'transparencia-controle-social,direitos-deveres,swipe', 1),

(154, NULL, 4, 5, 2,
 'O controle social é um direito constitucional do cidadão.',
 'A Constituição Federal garante a participação popular e o controle social das contas públicas.',
 'verdadeiro', NULL,
 '{"id": "controle-social-direito", "answer": "verdadeiro", "leftValue": "falso", "rightValue": "verdadeiro"}',
 'transparencia-controle-social,direitos-deveres,swipe', 1),

(155, NULL, 4, 5, 2,
 'O Tribunal de Contas julga as contas do Poder Judiciário no lugar do Congresso.',
 'O Tribunal de Contas auxilia o Poder Legislativo no controle externo, mas não substitui o Congresso.',
 'falso', NULL,
 '{"id": "tcu-congresso", "answer": "falso", "leftValue": "falso", "rightValue": "verdadeiro"}',
 'transparencia-controle-social,direitos-deveres,swipe', 1),

(156, NULL, 4, 5, 2,
 'O controle interno é realizado pelo próprio órgão ou entidade sobre suas atividades.',
 'O controle interno é exercido pela própria Administração sobre seus atos e agentes.',
 'verdadeiro', NULL,
 '{"id": "controle-interno-proprio-orgao", "answer": "verdadeiro", "leftValue": "falso", "rightValue": "verdadeiro"}',
 'transparencia-controle-social,direitos-deveres,swipe', 1),

(157, NULL, 4, 5, 2,
 'A publicidade ativa significa que o governo só divulga informações quando solicitado.',
 'Publicidade ativa é a divulgação espontânea de informações sem necessidade de solicitação.',
 'falso', NULL,
 '{"id": "publicidade-ativa", "answer": "falso", "leftValue": "falso", "rightValue": "verdadeiro"}',
 'transparencia-controle-social,direitos-deveres,swipe', 1),

(158, NULL, 4, 5, 2,
 'O Balanço Geral é um instrumento de prestação de contas do ente público.',
 'O Balanço Geral consolida as demonstrações contábeis do exercício para prestação de contas.',
 'verdadeiro', NULL,
 '{"id": "balanco-geral-prestacao", "answer": "verdadeiro", "leftValue": "falso", "rightValue": "verdadeiro"}',
 'transparencia-controle-social,direitos-deveres,swipe', 1),

(159, NULL, 4, 5, 2,
 'Qualquer informação pública pode ser classificada como sigilosa pelo gestor.',
 'A classificação de sigilo segue critérios legais específicos previstos na LAI; não é discricionária.',
 'falso', NULL,
 '{"id": "sigilo-discricionario", "answer": "falso", "leftValue": "falso", "rightValue": "verdadeiro"}',
 'transparencia-controle-social,direitos-deveres,swipe', 1);

-- Fase 15: Flow — Liga conceitos: Direitos, Deveres e Controle (engine: flow)
INSERT INTO tb_question (id, public_id, section_id, engine_id, difficulty, prompt, simple_explanation, correct_answer, options_json, metadata_json, tags, is_active) VALUES
(160, NULL, 4, 3, 2,
 'Lei de Acesso à Informação',
 'Garante ao cidadão o direito de solicitar e receber informações públicas.',
 'A', NULL,
 '{"id": "lai-flow", "term": "Lei de Acesso à Informação", "def": "Garante ao cidadão o direito de solicitar e receber informações públicas.", "letter": "A", "color": "#3b82f6"}',
 'transparencia-controle-social,direitos-deveres-controle,flow', 1),

(161, NULL, 4, 3, 2,
 'Tribunal de Contas',
 'Órgão que auxilia o Poder Legislativo no controle externo das contas públicas.',
 'B', NULL,
 '{"id": "tcu-flow", "term": "Tribunal de Contas", "def": "Órgão que auxilia o Poder Legislativo no controle externo das contas públicas.", "letter": "B", "color": "#16a34a"}',
 'transparencia-controle-social,direitos-deveres-controle,flow', 1),

(162, NULL, 4, 3, 2,
 'Ouvidoria',
 'Canal para registro de manifestações como reclamações, denúncias, sugestões e elogios.',
 'C', NULL,
 '{"id": "ouvidoria-flow", "term": "Ouvidoria", "def": "Canal para registro de manifestações como reclamações, denúncias, sugestões e elogios.", "letter": "C", "color": "#f59e0b"}',
 'transparencia-controle-social,direitos-deveres-controle,flow', 1),

(163, NULL, 4, 3, 2,
 'Controle Social',
 'Participação da sociedade no acompanhamento e fiscalização das ações governamentais.',
 'D', NULL,
 '{"id": "controle-social-flow", "term": "Controle Social", "def": "Participação da sociedade no acompanhamento e fiscalização das ações governamentais.", "letter": "D", "color": "#a855f7"}',
 'transparencia-controle-social,direitos-deveres-controle,flow', 1);

-- Fase 16: Quiz — Balanços e Relatórios (engine: quiz)
INSERT INTO tb_question (id, public_id, section_id, engine_id, difficulty, prompt, simple_explanation, correct_answer, options_json, metadata_json, tags, is_active) VALUES
(170, NULL, 4, 6, 2,
 'O que é o RREO?',
 'O Relatório Resumido da Execução Orçamentária é publicado bimestralmente.',
 '0',
 '["Relatório bimestral que acompanha a execução orçamentária, previsto na LRF.", "Relatório anual de gestão de pessoal.", "Demonstrativo trimestral de receitas extraorçamentárias.", "Balanço patrimonial publicado mensalmente."]',
 '{"id": "conceito-rreo", "answer": 0, "topic": "transparencia-controle-social"}',
 'transparencia-controle-social,quiz-balancos', 1),

(171, NULL, 4, 6, 2,
 'O que é o RGF?',
 'O Relatório de Gestão Fiscal monitora o cumprimento de limites da LRF.',
 '0',
 '["Relatório quadrimestral que verifica limites fiscais como pessoal, dívida e garantias.", "Relatório mensal de execução de despesas de capital.", "Balanço anual de receitas correntes.", "Demonstrativo bimestral de transferências constitucionais."]',
 '{"id": "conceito-rgf", "answer": 0, "topic": "transparencia-controle-social"}',
 'transparencia-controle-social,quiz-balancos', 1),

(172, NULL, 4, 6, 2,
 'O Balanço Geral do Estado consolida quais informações?',
 'O Balanço Geral reúne demonstrações orçamentárias, financeiras e patrimoniais.',
 '0',
 '["Demonstrações orçamentárias, financeiras e patrimoniais do exercício.", "Apenas receitas tributárias do ano.", "Somente despesas de pessoal e encargos.", "Resultado das eleições municipais."]',
 '{"id": "balanco-geral-info", "answer": 0, "topic": "transparencia-controle-social"}',
 'transparencia-controle-social,quiz-balancos', 1),

(173, NULL, 4, 6, 2,
 'O que representa o Ativo no Balanço Patrimonial?',
 'O Ativo são os bens e direitos controlados pelo ente público.',
 '0',
 '["Bens e direitos controlados pelo ente que podem gerar benefícios.", "Obrigações e dívidas do ente público.", "Apenas imóveis registrados em cartório.", "Receitas previstas na LOA."]',
 '{"id": "ativo-balanco-patrimonial", "answer": 0, "topic": "transparencia-controle-social"}',
 'transparencia-controle-social,quiz-balancos', 1),

(174, NULL, 4, 6, 2,
 'Qual instrumento garante acesso a dados públicos de forma espontânea?',
 'A publicidade ativa e o Portal da Transparência divulgam dados sem necessidade de solicitação.',
 '0',
 '["Portal da Transparência, por meio da publicidade ativa.", "Pedido formal ao Tribunal de Contas.", "Solicitação presencial ao gestor municipal.", "Requerimento judicial via mandado de segurança."]',
 '{"id": "portal-publicidade-ativa", "answer": 0, "topic": "transparencia-controle-social"}',
 'transparencia-controle-social,quiz-balancos', 1),

(175, NULL, 4, 6, 2,
 'O Passivo no Balanço Patrimonial representa:',
 'O Passivo são as obrigações presentes do ente público.',
 '0',
 '["Obrigações e dívidas assumidas pelo ente público.", "Bens e direitos do Estado.", "Receitas arrecadadas no exercício.", "Dotações orçamentárias aprovadas."]',
 '{"id": "passivo-balanco-patrimonial", "answer": 0, "topic": "transparencia-controle-social"}',
 'transparencia-controle-social,quiz-balancos', 1);

-- =============================================================================
-- INSERT — tb_phase_question
-- Apenas fases 1–16 (exclui phase_id >= 17)
-- Fonte: data_phase_question.json filtrado
-- =============================================================================

INSERT INTO tb_phase_question (id, phase_id, question_id, order_index, weight, is_required) VALUES
-- Fase 1: Caça-palavras LIMPE (questions 1–5)
(77, 1, 1, 1, 1.00, 0),
(78, 1, 2, 2, 1.00, 0),
(79, 1, 3, 3, 1.00, 0),
(80, 1, 4, 4, 1.00, 0),
(81, 1, 5, 5, 1.00, 0),

-- Fase 2: Flow — Instrumentos de Planejamento (questions 6–9)
(11, 2, 6,  1, 1.00, 1),
(12, 2, 7,  2, 1.00, 1),
(13, 2, 8,  3, 1.00, 1),
(14, 2, 9,  4, 1.00, 1),

-- Fase 3: Ordem Correta — Ciclo Orçamentário (questions 10–15)
(15, 3, 10, 1, 1.00, 1),
(16, 3, 11, 2, 1.00, 1),
(17, 3, 12, 3, 1.00, 1),
(18, 3, 13, 4, 1.00, 1),
(19, 3, 14, 5, 1.00, 1),
(20, 3, 15, 6, 1.00, 1),

-- Fase 4: Quiz — Administração Pública (questions 16–29)
(21, 4, 16,  1, 1.00, 1),
(22, 4, 17,  2, 1.00, 1),
(23, 4, 18,  3, 1.00, 1),
(24, 4, 19,  4, 1.00, 1),
(25, 4, 20,  5, 1.00, 1),
(26, 4, 21,  6, 1.00, 1),
(27, 4, 22,  7, 1.00, 1),
(28, 4, 23,  8, 1.00, 1),
(29, 4, 24,  9, 1.00, 1),
(30, 4, 25, 10, 1.00, 1),
(31, 4, 26, 11, 1.00, 1),
(32, 4, 27, 12, 1.00, 1),
(33, 4, 28, 13, 1.00, 1),
(34, 4, 29, 14, 1.00, 1),

-- Fase 5: Flow — Receita, Despesa e Restos a Pagar (questions 30–34)
(35, 5, 30, 1, 1.00, 1),
(36, 5, 31, 2, 1.00, 1),
(37, 5, 32, 3, 1.00, 1),
(38, 5, 33, 4, 1.00, 1),
(39, 5, 34, 5, 1.00, 1),

-- Fase 6: Swipe — Despesa Corrente ou Capital (questions 35–46)
(40, 6, 35,  1, 1.00, 1),
(41, 6, 36,  2, 1.00, 1),
(42, 6, 37,  3, 1.00, 1),
(43, 6, 38,  4, 1.00, 1),
(44, 6, 39,  5, 1.00, 1),
(45, 6, 40,  6, 1.00, 1),
(46, 6, 41,  7, 1.00, 1),
(47, 6, 42,  8, 1.00, 1),
(48, 6, 43,  9, 1.00, 1),
(49, 6, 44, 10, 1.00, 1),
(50, 6, 45, 11, 1.00, 1),
(51, 6, 46, 12, 1.00, 1),

-- Fase 7: Cruzadinha — Termos Fiscais (questions 59–70)
(82, 7, 59, 1, 1.00, 0),
(83, 7, 60, 2, 1.00, 0),
(84, 7, 61, 3, 1.00, 0),
(85, 7, 62, 4, 1.00, 0),
(86, 7, 69, 5, 1.00, 0),
(87, 7, 70, 6, 1.00, 0),
(88, 7, 63, 7, 1.00, 0),
(89, 7, 64, 8, 1.00, 0),
(90, 7, 65, 9, 1.00, 0),
(91, 7, 66, 10, 1.00, 0),
(92, 7, 67, 11, 1.00, 0),
(93, 7, 68, 12, 1.00, 0),

-- Fase 8: Swipe — Verdadeiro ou Falso: Receita e Despesa (questions 80–89)
(300, 8, 80,  1, 1.00, 1),
(301, 8, 81,  2, 1.00, 1),
(302, 8, 82,  3, 1.00, 1),
(303, 8, 83,  4, 1.00, 1),
(304, 8, 84,  5, 1.00, 1),
(305, 8, 85,  6, 1.00, 1),
(306, 8, 86,  7, 1.00, 1),
(307, 8, 87,  8, 1.00, 1),
(308, 8, 88,  9, 1.00, 1),
(309, 8, 89, 10, 1.00, 1),

-- Fase 9: Ordem correta — Caminho do Documento (questions 100–103)
(200, 9, 100, 1, 1.00, 1),
(201, 9, 101, 2, 1.00, 1),
(202, 9, 102, 3, 1.00, 1),
(203, 9, 103, 4, 1.00, 1),

-- Fase 10: Flow — Etapas da Despesa Pública (questions 110–113)
(210, 10, 110, 1, 1.00, 1),
(211, 10, 111, 2, 1.00, 1),
(212, 10, 112, 3, 1.00, 1),
(213, 10, 113, 4, 1.00, 1),

-- Fase 11: Swipe — Verdadeiro ou Falso: Índices e Limites (questions 120–130)
(220, 11, 120,  1, 1.00, 1),
(221, 11, 121,  2, 1.00, 1),
(222, 11, 122,  3, 1.00, 1),
(223, 11, 123,  4, 1.00, 1),
(224, 11, 124,  5, 1.00, 1),
(225, 11, 125,  6, 1.00, 1),
(226, 11, 126,  7, 1.00, 1),
(227, 11, 127,  8, 1.00, 1),
(228, 11, 128,  9, 1.00, 1),
(229, 11, 129, 10, 1.00, 1),
(230, 11, 130, 11, 1.00, 1),

-- Fase 12: Quiz — Execução Orçamentária (questions 140–145)
(240, 12, 140, 1, 1.00, 1),
(241, 12, 141, 2, 1.00, 1),
(242, 12, 142, 3, 1.00, 1),
(243, 12, 143, 4, 1.00, 1),
(244, 12, 144, 5, 1.00, 1),
(245, 12, 145, 6, 1.00, 1),

-- Fase 13: Cruzadinha — Balanços e Demonstrativos (questions 47–58)
(52,  13, 47,  1, 1.00, 1),
(53,  13, 48,  2, 1.00, 1),
(54,  13, 49,  3, 1.00, 1),
(55,  13, 50,  4, 1.00, 1),
(56,  13, 51,  5, 1.00, 1),
(57,  13, 52,  6, 1.00, 1),
(58,  13, 53,  7, 1.00, 1),
(59,  13, 54,  8, 1.00, 1),
(60,  13, 55,  9, 1.00, 1),
(61,  13, 56, 10, 1.00, 1),
(62,  13, 57, 11, 1.00, 1),
(63,  13, 58, 12, 1.00, 1),

-- Fase 14: Swipe — Verdadeiro ou Falso: Direitos e Deveres (questions 150–159)
(250, 14, 150,  1, 1.00, 1),
(251, 14, 151,  2, 1.00, 1),
(252, 14, 152,  3, 1.00, 1),
(253, 14, 153,  4, 1.00, 1),
(254, 14, 154,  5, 1.00, 1),
(255, 14, 155,  6, 1.00, 1),
(256, 14, 156,  7, 1.00, 1),
(257, 14, 157,  8, 1.00, 1),
(258, 14, 158,  9, 1.00, 1),
(259, 14, 159, 10, 1.00, 1),

-- Fase 15: Flow — Direitos, Deveres e Controle (questions 160–163)
(260, 15, 160, 1, 1.00, 1),
(261, 15, 161, 2, 1.00, 1),
(262, 15, 162, 3, 1.00, 1),
(263, 15, 163, 4, 1.00, 1),

-- Fase 16: Quiz — Balanços e Relatórios (questions 170–175)
(270, 16, 170, 1, 1.00, 1),
(271, 16, 171, 2, 1.00, 1),
(272, 16, 172, 3, 1.00, 1),
(273, 16, 173, 4, 1.00, 1),
(274, 16, 174, 5, 1.00, 1),
(275, 16, 175, 6, 1.00, 1);

-- =============================================================================
-- FIM
-- Observacao: este arquivo contem o schema corrigido e os cadastros estruturais.
-- =============================================================================
