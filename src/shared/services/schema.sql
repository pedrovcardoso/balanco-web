/* v4: Fabric Warehouse compatibility patch. */

CREATE SCHEMA bc;
GO

CREATE TABLE bc.app_user (
    user_id UNIQUEIDENTIFIER NOT NULL,
    public_user_id UNIQUEIDENTIFIER NOT NULL,
    external_provider VARCHAR(40) NULL,
    external_subject VARCHAR(200) NULL,
    display_name VARCHAR(160) NULL,
    email VARCHAR(254) NULL,
    nickname VARCHAR(80) NULL,
    accepted_lgpd_at DATETIME2(6) NULL,
    created_at DATETIME2(6) NOT NULL,
    updated_at DATETIME2(6) NOT NULL,
    is_active BIT NOT NULL
);
GO
CREATE TABLE bc.user_session (
    session_id UNIQUEIDENTIFIER NOT NULL,
    public_session_id UNIQUEIDENTIFIER NOT NULL,
    user_id UNIQUEIDENTIFIER NULL,
    user_agent VARCHAR(500) NULL,
    ip_hash CHAR(64) NULL,
    created_at DATETIME2(6) NOT NULL,
    last_seen_at DATETIME2(6) NOT NULL
);
GO
CREATE TABLE bc.content_year (
    content_year_id INT NOT NULL,
    fiscal_year INT NOT NULL,
    title VARCHAR(160) NOT NULL,
    subtitle VARCHAR(240) NULL,
    source_report_url VARCHAR(1000) NULL,
    is_current BIT NOT NULL,
    published_at DATETIME2(6) NULL,
    created_at DATETIME2(6) NOT NULL
);
GO
CREATE TABLE bc.main_trail (
    main_trail_id INT NOT NULL,
    slug VARCHAR(80) NOT NULL,
    title VARCHAR(160) NOT NULL,
    description VARCHAR(800) NULL,
    order_index INT NOT NULL,
    unlock_policy VARCHAR(40) NOT NULL,
    icon_name VARCHAR(80) NULL,
    is_active BIT NOT NULL
);
GO
CREATE TABLE bc.content_page (
    content_page_id BIGINT NOT NULL,
    content_year_id INT NULL,
    main_trail_id INT NOT NULL,
    slug VARCHAR(120) NOT NULL,
    title VARCHAR(180) NOT NULL,
    summary VARCHAR(800) NULL,
    body_markdown VARCHAR(MAX) NULL,
    body_json VARCHAR(MAX) NULL,
    order_index INT NOT NULL,
    min_read_seconds INT NOT NULL,
    is_required BIT NOT NULL,
    is_active BIT NOT NULL,
    created_at DATETIME2(6) NOT NULL,
    updated_at DATETIME2(6) NOT NULL
);
GO
CREATE TABLE bc.reference_link (
    reference_link_id BIGINT NOT NULL,
    title VARCHAR(240) NOT NULL,
    description VARCHAR(900) NULL,
    url VARCHAR(1000) NOT NULL,
    link_type VARCHAR(40) NOT NULL,
    order_index INT NOT NULL,
    is_active BIT NOT NULL,
    created_at DATETIME2(6) NOT NULL
);
GO
CREATE TABLE bc.game_section (
    game_section_id INT NOT NULL,
    slug VARCHAR(80) NOT NULL,
    title VARCHAR(160) NOT NULL,
    description VARCHAR(900) NULL,
    order_index INT NOT NULL,
    is_active BIT NOT NULL
);
GO
CREATE TABLE bc.game_engine (
    game_engine_id INT NOT NULL,
    slug VARCHAR(60) NOT NULL,
    title VARCHAR(120) NOT NULL,
    description VARCHAR(800) NULL,
    scoring_mode VARCHAR(60) NOT NULL,
    is_active BIT NOT NULL
);
GO
CREATE TABLE bc.game_phase (
    game_phase_id INT NOT NULL,
    public_phase_id UNIQUEIDENTIFIER NOT NULL,
    game_section_id INT NOT NULL,
    game_engine_id INT NOT NULL,
    slug VARCHAR(100) NOT NULL,
    title VARCHAR(180) NOT NULL,
    description VARCHAR(900) NULL,
    order_index INT NOT NULL,
    question_count INT NULL,
    pass_score INT NOT NULL,
    max_score INT NOT NULL,
    config_json VARCHAR(MAX) NULL,
    is_active BIT NOT NULL,
    created_at DATETIME2(6) NOT NULL
);
GO
CREATE TABLE bc.question_bank (
    question_id BIGINT NOT NULL,
    public_question_id UNIQUEIDENTIFIER NOT NULL,
    game_section_id INT NOT NULL,
    game_engine_id INT NOT NULL,
    content_year_id INT NULL,
    difficulty SMALLINT NOT NULL,
    prompt VARCHAR(MAX) NOT NULL,
    simple_explanation VARCHAR(MAX) NULL,
    correct_answer VARCHAR(400) NULL,
    options_json VARCHAR(MAX) NULL,
    metadata_json VARCHAR(MAX) NULL,
    tags VARCHAR(500) NULL,
    is_active BIT NOT NULL,
    created_at DATETIME2(6) NOT NULL,
    updated_at DATETIME2(6) NOT NULL
);
GO
CREATE TABLE bc.phase_question (
    phase_question_id BIGINT NOT NULL,
    game_phase_id INT NOT NULL,
    question_id BIGINT NOT NULL,
    order_index INT NULL,
    weight DECIMAL(6,2) NOT NULL,
    is_required BIT NOT NULL
);
GO
CREATE TABLE bc.user_main_trail_progress (
    user_id UNIQUEIDENTIFIER NOT NULL,
    main_trail_id INT NOT NULL,
    status VARCHAR(20) NOT NULL,
    progress_percent DECIMAL(5,2) NOT NULL,
    completed_at DATETIME2(6) NULL,
    updated_at DATETIME2(6) NOT NULL
);
GO
CREATE TABLE bc.user_content_progress (
    user_id UNIQUEIDENTIFIER NOT NULL,
    content_page_id BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL,
    read_seconds INT NOT NULL,
    completed_at DATETIME2(6) NULL,
    updated_at DATETIME2(6) NOT NULL
);
GO
CREATE TABLE bc.user_phase_progress (
    user_id UNIQUEIDENTIFIER NOT NULL,
    game_phase_id INT NOT NULL,
    status VARCHAR(20) NOT NULL,
    best_score INT NOT NULL,
    best_stars SMALLINT NOT NULL,
    attempts_count INT NOT NULL,
    first_completed_at DATETIME2(6) NULL,
    last_played_at DATETIME2(6) NULL,
    updated_at DATETIME2(6) NOT NULL
);
GO
CREATE TABLE bc.game_attempt (
    attempt_id UNIQUEIDENTIFIER NOT NULL,
    public_attempt_id UNIQUEIDENTIFIER NOT NULL,
    user_id UNIQUEIDENTIFIER NOT NULL,
    game_phase_id INT NOT NULL,
    score INT NOT NULL,
    stars SMALLINT NOT NULL,
    passed BIT NOT NULL,
    hints_used INT NOT NULL,
    attempts_used INT NULL,
    correct_count INT NULL,
    total_count INT NULL,
    duration_seconds INT NULL,
    answers_json VARCHAR(MAX) NULL,
    created_at DATETIME2(6) NOT NULL
);
GO
CREATE TABLE bc.section_medal_progress (
    user_id UNIQUEIDENTIFIER NOT NULL,
    game_section_id INT NOT NULL,
    medal_state VARCHAR(20) NOT NULL,
    completed_phases INT NOT NULL,
    total_stars INT NOT NULL,
    awarded_at DATETIME2(6) NULL,
    updated_at DATETIME2(6) NOT NULL
);
GO
CREATE TABLE bc.achievement_definition (
    achievement_id INT NOT NULL,
    slug VARCHAR(100) NOT NULL,
    title VARCHAR(160) NOT NULL,
    description VARCHAR(900) NULL,
    achievement_group VARCHAR(60) NOT NULL,
    target_value INT NULL,
    icon_name VARCHAR(80) NULL,
    order_index INT NOT NULL,
    is_active BIT NOT NULL
);
GO
CREATE TABLE bc.user_achievement (
    user_id UNIQUEIDENTIFIER NOT NULL,
    achievement_id INT NOT NULL,
    current_value INT NOT NULL,
    is_unlocked BIT NOT NULL,
    unlocked_at DATETIME2(6) NULL,
    updated_at DATETIME2(6) NOT NULL
);
GO
CREATE TABLE bc.certificate_issue (
    certificate_id UNIQUEIDENTIFIER NOT NULL,
    public_certificate_id UNIQUEIDENTIFIER NOT NULL,
    user_id UNIQUEIDENTIFIER NOT NULL,
    participant_name VARCHAR(160) NOT NULL,
    fiscal_year INT NULL,
    verification_code CHAR(12) NOT NULL,
    certificate_hash CHAR(64) NOT NULL,
    issued_at DATETIME2(6) NOT NULL,
    revoked_at DATETIME2(6) NULL,
    metadata_json VARCHAR(MAX) NULL
);
GO
CREATE VIEW bc.v_phase_catalog AS
SELECT gs.game_section_id, gs.slug AS section_slug, gs.title AS section_title, gs.order_index AS section_order,
       gp.game_phase_id, gp.public_phase_id, gp.slug AS phase_slug, gp.title AS phase_title,
       gp.description AS phase_description, gp.order_index AS phase_order,
       ge.slug AS engine_slug, ge.title AS engine_title, gp.question_count, gp.pass_score, gp.max_score, gp.config_json
FROM bc.game_section gs
JOIN bc.game_phase gp ON gp.game_section_id = gs.game_section_id
JOIN bc.game_engine ge ON ge.game_engine_id = gp.game_engine_id
WHERE gs.is_active = 1 AND gp.is_active = 1 AND ge.is_active = 1;
GO

INSERT INTO bc.main_trail VALUES
(1,'historia-hq','Historia em quadrinhos','Introducao ludica sobre o Balanco Cidadao e identificacao.',1,'always_available','book-open',1),
(2,'conteudo-balanco','Conteudo do Balanco','Conteudo principal em linguagem simples, com dados resumidos.',2,'previous_required','chart-bar',1),
(3,'jogos','Jogos da Trilha do Tesouro','Mapa com 16 fases em quatro secoes tematicas.',3,'previous_required','map',1),
(4,'creditos-saiba-mais','Creditos e saiba mais','Links, referencias e creditos.',4,'previous_required','sparkles',1);
GO
INSERT INTO bc.game_engine VALUES
(1,'caca-palavras','Caca-palavras','Sopa de letras com dicas.','hints_penalty',1),
(2,'cruzadinha','Cruzadinha','Conceitos fiscais com dicas.','hints_penalty',1),
(3,'liga-conceitos','Liga conceitos','Associacao entre conceitos e explicacoes.','attempts_steps',1),
(4,'ordem-correta','Ordem correta','Ordenacao de eventos ou termos.','attempts_steps',1),
(5,'swipe','Swipe','Classificacao rapida em duas opcoes.','ratio_correct',1),
(6,'quiz','Quiz','Perguntas de multipla escolha.','ratio_correct',1),
(7,'simulador-orcamento','Simulador do orcamento','Distribuicao simulada do orcamento.','simulator_rules',1);
GO
INSERT INTO bc.game_section VALUES
(1,'administracao-publica','Administracao Publica','Fundamentos da administracao publica e ciclo orcamentario.',1,1),
(2,'receitas-despesas','Receitas e Despesas','Origem dos recursos e organizacao das despesas.',2,1),
(3,'execucao-orcamentaria','Execucao Orcamentaria','Como o orcamento aprovado vira execucao pratica.',3,1),
(4,'transparencia-controle-social','Transparencia e Controle Social','Balanco, demonstrativos, direitos e controle social.',4,1);
GO
INSERT INTO bc.game_phase VALUES
(1,NEWID(),1,1,'principios-administracao-publica','Caca-palavras: Principios da Administracao Publica','Lista de principios do LIMPE.',1,NULL,60,100,'{"unlock":"previous_phase_required","stars":{"one":60,"two":80,"three":95}}',1,SYSUTCDATETIME()),
(2,NEWID(),1,3,'instrumentos-planejamento','Liga conceitos: Instrumentos de Planejamento','PPA, LDO e LOA em linguagem simples.',2,NULL,60,100,'{"unlock":"previous_phase_required","stars":{"one":60,"two":80,"three":95}}',1,SYSUTCDATETIME()),
(3,NEWID(),1,4,'ciclo-orcamentario','Ordem correta: Ciclo Orcamentario','Ordene as etapas do ciclo orcamentario.',3,NULL,60,100,'{"unlock":"previous_phase_required","stars":{"one":60,"two":80,"three":95}}',1,SYSUTCDATETIME()),
(4,NEWID(),1,6,'quiz-administracao-publica','Quiz: Administracao Publica','6 perguntas aleatorias do banco.',4,6,60,100,'{"unlock":"previous_phase_required","stars":{"one":60,"two":80,"three":95}}',1,SYSUTCDATETIME()),
(5,NEWID(),2,3,'receita-despesa-restos','Liga conceitos: Receita, Despesa e Restos a Pagar','Conceitos essenciais.',1,NULL,60,100,'{"unlock":"previous_phase_required","stars":{"one":60,"two":80,"three":95}}',1,SYSUTCDATETIME()),
(6,NEWID(),2,5,'despesa-corrente-capital','Swipe: Despesa Corrente ou Capital','Classifique 10 itens.',2,10,60,100,'{"unlock":"previous_phase_required","stars":{"one":60,"two":80,"three":95}}',1,SYSUTCDATETIME()),
(7,NEWID(),2,2,'termos-fiscais','Cruzadinha: Termos Fiscais','Receita, despesa, corrente, capital, LOA e restos a pagar.',3,NULL,60,100,'{"unlock":"previous_phase_required","stars":{"one":60,"two":80,"three":95}}',1,SYSUTCDATETIME()),
(8,NEWID(),2,5,'verdadeiro-falso-receita-despesa','Verdadeiro ou Falso: Receita e Despesa','10 afirmacoes aleatorias.',4,10,60,100,'{"unlock":"previous_phase_required","stars":{"one":60,"two":80,"three":95}}',1,SYSUTCDATETIME()),
(9,NEWID(),3,4,'caminho-documento','Ordem correta: Caminho do Documento','Ordene o fluxo da execucao.',1,NULL,60,100,'{"unlock":"previous_phase_required","stars":{"one":60,"two":80,"three":95}}',1,SYSUTCDATETIME()),
(10,NEWID(),3,3,'etapas-despesa-publica','Liga conceitos: Etapas da Despesa Publica','Empenho, liquidacao e pagamento.',2,NULL,60,100,'{"unlock":"previous_phase_required","stars":{"one":60,"two":80,"three":95}}',1,SYSUTCDATETIME()),
(11,NEWID(),3,5,'verdadeiro-falso-indices-limites','Verdadeiro ou Falso: Indices e Limites','10 afirmacoes aleatorias.',3,10,60,100,'{"unlock":"previous_phase_required","stars":{"one":60,"two":80,"three":95}}',1,SYSUTCDATETIME()),
(12,NEWID(),3,6,'quiz-execucao-orcamentaria','Quiz: Execucao Orcamentaria','6 perguntas aleatorias.',4,6,60,100,'{"unlock":"previous_phase_required","stars":{"one":60,"two":80,"three":95}}',1,SYSUTCDATETIME()),
(13,NEWID(),4,2,'balancos-demonstrativos','Cruzadinha: Balancos e Demonstrativos','Termos e mecanismos de prestacao de contas.',1,NULL,60,100,'{"unlock":"previous_phase_required","stars":{"one":60,"two":80,"three":95}}',1,SYSUTCDATETIME()),
(14,NEWID(),4,5,'verdadeiro-falso-direitos-deveres','Verdadeiro ou Falso: Direitos e Deveres','10 afirmacoes aleatorias.',2,10,60,100,'{"unlock":"previous_phase_required","stars":{"one":60,"two":80,"three":95}}',1,SYSUTCDATETIME()),
(15,NEWID(),4,3,'direitos-deveres-controle','Liga conceitos: Direitos, Deveres e Controle','Formas de participacao e controle social.',3,NULL,60,100,'{"unlock":"previous_phase_required","stars":{"one":60,"two":80,"three":95}}',1,SYSUTCDATETIME()),
(16,NEWID(),4,6,'quiz-balancos-relatorios','Quiz: Balancos e Relatorios','RREO, RGF, Balanco Geral e outros.',4,6,60,100,'{"unlock":"previous_phase_required","stars":{"one":60,"two":80,"three":95}}',1,SYSUTCDATETIME());
GO
INSERT INTO bc.achievement_definition VALUES
(1,'leu-historia','Leu toda a historia','Leia toda a historia do Balanco Cidadao.','leitura',1,'book-open',1,1),
(2,'leu-conteudo','Leu todo o conteudo','Leia todo o conteudo do Balanco Cidadao.','leitura',1,'scroll-text',2,1),
(3,'leu-creditos','Visitou creditos e saiba mais','Leia a pagina de creditos e saiba mais.','leitura',1,'info',3,1),
(4,'certificado-final','Certificado final','Gere o certificado final de participacao.','certificado',1,'certificate',4,1),
(5,'estrelas-25','25 estrelas','Conquiste 25 estrelas.','estrelas',25,'star',5,1),
(6,'estrelas-35','35 estrelas','Conquiste 35 estrelas.','estrelas',35,'stars',6,1),
(7,'estrelas-48','Todas as 48 estrelas','Conquiste todas as 48 estrelas.','estrelas',48,'sparkles',7,1),
(8,'todas-trilhas','Todas as trilhas','Conclua todas as trilhas.','trilhas',4,'map',8,1),
(9,'duas-medalhas-brilhantes','Duas medalhas brilhantes','Conquiste duas medalhas brilhantes.','medalhas',2,'medal',9,1),
(10,'todas-medalhas-brilhantes','Todas as medalhas brilhantes','Conquiste todas as medalhas brilhantes.','medalhas',4,'trophy',10,1);
GO
