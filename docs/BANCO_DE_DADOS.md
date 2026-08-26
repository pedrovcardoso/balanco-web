# Documentação do Banco de Dados

## Visão geral

O banco de dados do projeto `Balanço Cidadão Web` foi definido para suportar a arquitetura de conteúdo, jogos e progresso dos usuários.

O esquema principal está organizado no schema `bc` e inclui tabelas para:

- usuários e sessões
- conteúdo editorial e trilhas
- definições de jogos, fases e perguntas
- progresso de usuário, tentativas, conquistas e certificados

O modelo foi desenvolvido para um banco SQL Server no Fabric e o arquivo de definição está em `src/components/schema.sql`.

## Estrutura geral

O schema `bc` contém tabelas de domínio claramente separadas:

- `app_user`, `user_session`: identificação e sessão de usuário
- `content_year`, `main_trail`, `content_page`, `reference_link`: conteúdo educacional e navegação
- `game_section`, `game_engine`, `game_phase`, `question_bank`, `phase_question`: definição dos jogos e fases
- `user_main_trail_progress`, `user_content_progress`, `user_phase_progress`, `game_attempt`, `section_medal_progress`: progresso e desempenho dos participantes
- `achievement_definition`, `user_achievement`, `certificate_issue`: conquistas, medalhas e emissão de certificado

Também existe a view `v_phase_catalog` para simplificar a consulta de fases ativas e seus metadados.

## Tabelas do schema `bc`

### bc.app_user

Registra os usuários do sistema.

| Coluna            | Tipo             | Descrição                                    |
| ----------------- | ---------------- | -------------------------------------------- |
| user_id           | UNIQUEIDENTIFIER | Identificador interno do usuário             |
| public_user_id    | UNIQUEIDENTIFIER | Identificador público do usuário             |
| external_provider | VARCHAR(40)      | Provedor de autenticação externa             |
| external_subject  | VARCHAR(200)     | Identificador do usuário no provedor externo |
| display_name      | VARCHAR(160)     | Nome exibido do usuário                      |
| email             | VARCHAR(254)     | Email do usuário                             |
| nickname          | VARCHAR(80)      | Apelido do usuário                           |
| accepted_lgpd_at  | DATETIME2(6)     | Data de aceite da LGPD                       |
| created_at        | DATETIME2(6)     | Data de criação                              |
| updated_at        | DATETIME2(6)     | Data da última atualização                   |
| is_active         | BIT              | Usuário ativo                                |

### bc.user_session

Armazena sessões de navegação para análise e persistência.

| Coluna            | Tipo             | Descrição                       |
| ----------------- | ---------------- | ------------------------------- |
| session_id        | UNIQUEIDENTIFIER | Identificador interno da sessão |
| public_session_id | UNIQUEIDENTIFIER | Identificador público da sessão |
| user_id           | UNIQUEIDENTIFIER | FK opcional para `app_user`     |
| user_agent        | VARCHAR(500)     | Agente de usuário do navegador  |
| ip_hash           | CHAR(64)         | Hash do endereço IP             |
| created_at        | DATETIME2(6)     | Data de criação da sessão       |
| last_seen_at      | DATETIME2(6)     | Último acesso registrado        |

### bc.content_year

Define anos de conteúdo, com metadados e links de origem.

| Coluna            | Tipo          | Descrição                        |
| ----------------- | ------------- | -------------------------------- |
| content_year_id   | INT           | Identificador do ano de conteúdo |
| fiscal_year       | INT           | Ano fiscal associado             |
| title             | VARCHAR(160)  | Título do conteúdo               |
| subtitle          | VARCHAR(240)  | Subtítulo ou resumo curto        |
| source_report_url | VARCHAR(1000) | URL da fonte do relatório        |
| is_current        | BIT           | Indica se é o ano corrente       |
| published_at      | DATETIME2(6)  | Data de publicação               |
| created_at        | DATETIME2(6)  | Data de criação                  |
| updated_at        | DATETIME2(6)  | Data da última atualização       |

### bc.main_trail

Registra trilhas principais do site.

| Coluna        | Tipo         | Descrição               |
| ------------- | ------------ | ----------------------- |
| main_trail_id | INT          | Identificador da trilha |
| slug          | VARCHAR(80)  | Texto de URL da trilha  |
| title         | VARCHAR(160) | Título da trilha        |
| description   | VARCHAR(800) | Descrição resumida      |
| order_index   | INT          | Ordem de exibição       |
| unlock_policy | VARCHAR(40)  | Política de desbloqueio |
| icon_name     | VARCHAR(80)  | Ícone associado         |
| is_active     | BIT          | Indicador de ativo      |

### bc.content_page

Contém páginas de conteúdo e textos do site.

| Coluna           | Tipo         | Descrição                        |
| ---------------- | ------------ | -------------------------------- |
| content_page_id  | BIGINT       | Identificador da página          |
| content_year_id  | INT          | Ano de conteúdo associado        |
| main_trail_id    | INT          | Trilho principal associado       |
| slug             | VARCHAR(120) | Texto de URL da página           |
| title            | VARCHAR(180) | Título da página                 |
| summary          | VARCHAR(800) | Resumo curto                     |
| body_markdown    | VARCHAR(MAX) | Corpo em Markdown                |
| body_json        | VARCHAR(MAX) | Corpo em JSON                    |
| order_index      | INT          | Ordem de exibição                |
| min_read_seconds | INT          | Tempo mínimo de leitura estimado |
| is_required      | BIT          | Se a página é obrigatória        |
| is_active        | BIT          | Indicador de ativo               |
| created_at       | DATETIME2(6) | Data de criação                  |
| updated_at       | DATETIME2(6) | Data da última atualização       |

### bc.reference_link

Registra links de referência e fontes externas.

| Coluna            | Tipo          | Descrição             |
| ----------------- | ------------- | --------------------- |
| reference_link_id | BIGINT        | Identificador do link |
| title             | VARCHAR(240)  | Título do link        |
| description       | VARCHAR(900)  | Descrição do link     |
| url               | VARCHAR(1000) | URL externa           |
| link_type         | VARCHAR(40)   | Tipo de link          |
| order_index       | INT           | Ordem de exibição     |
| is_active         | BIT           | Indicador de ativo    |
| created_at        | DATETIME2(6)  | Data de criação       |

### bc.game_section

Define seções temáticas dos jogos.

| Coluna          | Tipo         | Descrição              |
| --------------- | ------------ | ---------------------- |
| game_section_id | INT          | Identificador da seção |
| slug            | VARCHAR(80)  | Texto de URL da seção  |
| title           | VARCHAR(160) | Título da seção        |
| description     | VARCHAR(900) | Descrição temática     |
| order_index     | INT          | Ordem de exibição      |
| is_active       | BIT          | Indicador de ativo     |

### bc.game_engine

Registra os tipos de jogo e regras de pontuação.

| Coluna         | Tipo         | Descrição                      |
| -------------- | ------------ | ------------------------------ |
| game_engine_id | INT          | Identificador do motor de jogo |
| slug           | VARCHAR(60)  | Texto de URL do motor          |
| title          | VARCHAR(120) | Nome do motor de jogo          |
| description    | VARCHAR(800) | Descrição do modo de jogo      |
| scoring_mode   | VARCHAR(60)  | Modo de pontuação              |
| is_active      | BIT          | Indicador de ativo             |

### bc.game_phase

Representa cada fase do jogo.

| Coluna          | Tipo             | Descrição                       |
| --------------- | ---------------- | ------------------------------- |
| game_phase_id   | INT              | Identificador da fase           |
| public_phase_id | UNIQUEIDENTIFIER | Identificador público           |
| game_section_id | INT              | Seção do jogo                   |
| game_engine_id  | INT              | Motor de jogo associado         |
| slug            | VARCHAR(100)     | Texto de URL da fase            |
| title           | VARCHAR(180)     | Título da fase                  |
| description     | VARCHAR(900)     | Descrição da fase               |
| order_index     | INT              | Ordem da fase                   |
| question_count  | INT              | Quantidade de perguntas         |
| pass_score      | INT              | Pontuação mínima para aprovação |
| max_score       | INT              | Pontuação máxima                |
| config_json     | VARCHAR(MAX)     | Configurações adicionais        |
| is_active       | BIT              | Indicador de ativo              |
| created_at      | DATETIME2(6)     | Data de criação                 |

### bc.question_bank

Armazena questões reutilizáveis para jogos e quizzes.

| Coluna             | Tipo             | Descrição                   |
| ------------------ | ---------------- | --------------------------- |
| question_id        | BIGINT           | Identificador da questão    |
| public_question_id | UNIQUEIDENTIFIER | Identificador público       |
| game_section_id    | INT              | Seção temática associada    |
| game_engine_id     | INT              | Motor de jogo associado     |
| content_year_id    | INT              | Ano de conteúdo associado   |
| difficulty         | SMALLINT         | Grau de dificuldade         |
| prompt             | VARCHAR(MAX)     | Texto da pergunta           |
| simple_explanation | VARCHAR(MAX)     | Explicação ou feedback      |
| correct_answer     | VARCHAR(400)     | Resposta correta            |
| options_json       | VARCHAR(MAX)     | Alternativas em JSON        |
| metadata_json      | VARCHAR(MAX)     | Metadados adicionais        |
| tags               | VARCHAR(500)     | Etiquetas ou palavras-chave |
| is_active          | BIT              | Indicador de ativo          |
| created_at         | DATETIME2(6)     | Data de criação             |
| updated_at         | DATETIME2(6)     | Data da última atualização  |

### bc.phase_question

Relaciona perguntas às fases dos jogos.

| Coluna            | Tipo         | Descrição                         |
| ----------------- | ------------ | --------------------------------- |
| phase_question_id | BIGINT       | Identificador da associação       |
| game_phase_id     | INT          | Fase associada                    |
| question_id       | BIGINT       | Questão associada                 |
| order_index       | INT          | Posição da questão na fase        |
| weight            | DECIMAL(6,2) | Peso da questão                   |
| is_required       | BIT          | Indica se a questão é obrigatória |

### bc.user_main_trail_progress

Registra progresso dos usuários nas trilhas principais.

| Coluna           | Tipo             | Descrição                  |
| ---------------- | ---------------- | -------------------------- |
| user_id          | UNIQUEIDENTIFIER | Identificador do usuário   |
| main_trail_id    | INT              | Trilho associado           |
| status           | VARCHAR(20)      | Status da trilha           |
| progress_percent | DECIMAL(5,2)     | Percentual de conclusão    |
| completed_at     | DATETIME2(6)     | Data de conclusão          |
| updated_at       | DATETIME2(6)     | Data da última atualização |

### bc.user_content_progress

Armazena o progresso do usuário em páginas de conteúdo.

| Coluna          | Tipo             | Descrição                  |
| --------------- | ---------------- | -------------------------- |
| user_id         | UNIQUEIDENTIFIER | Identificador do usuário   |
| content_page_id | BIGINT           | Página de conteúdo         |
| status          | VARCHAR(20)      | Status de leitura          |
| read_seconds    | INT              | Tempo gasto em segundos    |
| completed_at    | DATETIME2(6)     | Data de conclusão          |
| updated_at      | DATETIME2(6)     | Data da última atualização |

### bc.user_phase_progress

Registra o progresso do usuário em fases de jogos.

| Coluna             | Tipo             | Descrição                     |
| ------------------ | ---------------- | ----------------------------- |
| user_id            | UNIQUEIDENTIFIER | Identificador do usuário      |
| game_phase_id      | INT              | Fase de jogo                  |
| status             | VARCHAR(20)      | Status da fase                |
| best_score         | INT              | Melhor pontuação obtida       |
| best_stars         | SMALLINT         | Melhor quantidade de estrelas |
| attempts_count     | INT              | Quantidade de tentativas      |
| first_completed_at | DATETIME2(6)     | Primeira conclusão            |
| last_played_at     | DATETIME2(6)     | Último acesso                 |
| updated_at         | DATETIME2(6)     | Data de atualização           |

### bc.game_attempt

Registra todas as tentativas dos usuários nas fases.

| Coluna            | Tipo             | Descrição                  |
| ----------------- | ---------------- | -------------------------- |
| attempt_id        | UNIQUEIDENTIFIER | Identificador da tentativa |
| public_attempt_id | UNIQUEIDENTIFIER | Identificador público      |
| user_id           | UNIQUEIDENTIFIER | Identificador do usuário   |
| game_phase_id     | INT              | Fase de jogo               |
| score             | INT              | Pontuação obtida           |
| stars             | SMALLINT         | Número de estrelas         |
| passed            | BIT              | Indicador de aprovação     |
| hints_used        | INT              | Dicas utilizadas           |
| attempts_used     | INT              | Tentativas usadas          |
| correct_count     | INT              | Perguntas corretas         |
| total_count       | INT              | Total de perguntas         |
| duration_seconds  | INT              | Duração em segundos        |
| answers_json      | VARCHAR(MAX)     | Respostas registradas      |
| created_at        | DATETIME2(6)     | Data da tentativa          |

### bc.section_medal_progress

Controla o estado das medalhas por seção.

| Coluna           | Tipo             | Descrição                |
| ---------------- | ---------------- | ------------------------ |
| user_id          | UNIQUEIDENTIFIER | Identificador do usuário |
| game_section_id  | INT              | Seção do jogo            |
| medal_state      | VARCHAR(20)      | Estado da medalha        |
| completed_phases | INT              | Fases concluídas         |
| total_stars      | INT              | Estrelas acumuladas      |
| awarded_at       | DATETIME2(6)     | Data de concessão        |
| updated_at       | DATETIME2(6)     | Data de atualização      |

### bc.achievement_definition

Define as conquistas disponíveis no sistema.

| Coluna            | Tipo         | Descrição                  |
| ----------------- | ------------ | -------------------------- |
| achievement_id    | INT          | Identificador da conquista |
| slug              | VARCHAR(100) | Texto de URL da conquista  |
| title             | VARCHAR(160) | Título da conquista        |
| description       | VARCHAR(900) | Descrição da conquista     |
| achievement_group | VARCHAR(60)  | Grupo de conquista         |
| target_value      | INT          | Valor-alvo da conquista    |
| icon_name         | VARCHAR(80)  | Ícone associado            |
| order_index       | INT          | Ordem de exibição          |
| is_active         | BIT          | Indicador de ativo         |

### bc.user_achievement

Registra conquistas dos usuários.

| Coluna         | Tipo             | Descrição                           |
| -------------- | ---------------- | ----------------------------------- |
| user_id        | UNIQUEIDENTIFIER | Identificador do usuário            |
| achievement_id | INT              | Conquista associada                 |
| current_value  | INT              | Valor atual da conquista            |
| is_unlocked    | BIT              | Indicador de conquista desbloqueada |
| unlocked_at    | DATETIME2(6)     | Data de desbloqueio                 |
| updated_at     | DATETIME2(6)     | Data da última atualização          |

### bc.certificate_issue

Registra certificados emitidos para os usuários.

| Coluna                | Tipo             | Descrição                    |
| --------------------- | ---------------- | ---------------------------- |
| certificate_id        | UNIQUEIDENTIFIER | Identificador do certificado |
| public_certificate_id | UNIQUEIDENTIFIER | Identificador público        |
| user_id               | UNIQUEIDENTIFIER | Identificador do usuário     |
| participant_name      | VARCHAR(160)     | Nome do participante         |
| fiscal_year           | INT              | Ano fiscal associado         |
| verification_code     | CHAR(12)         | Código de verificação        |
| certificate_hash      | CHAR(64)         | Hash de verificação          |
| issued_at             | DATETIME2(6)     | Data de emissão              |
| revoked_at            | DATETIME2(6)     | Data de revogação            |
| metadata_json         | VARCHAR(MAX)     | Metadados adicionais         |

## View de catálogo de fases

### bc.v_phase_catalog

View de consulta para fases ativas e seus metadados.

- Seleciona seções, fases e motor de jogo ativos
- Inclui `question_count`, `pass_score`, `max_score` e `config_json`

## Observações

- O esquema usa tipos compatíveis com SQL Server.
- A view `v_phase_catalog` facilita a construção de catálogos de fases sem precisar fazer joins manuais em todas as consultas.
- O arquivo de origem para o esquema completo é `src/components/schema.sql`.
