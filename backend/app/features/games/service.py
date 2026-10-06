from app.utils.sql_helpers import sql_guid,sql_json,first

async def game_map(db,uid): return await db.execute_sql(f"""DECLARE @u UNIQUEIDENTIFIER=(SELECT TOP 1 user_id FROM bc.app_user WHERE public_user_id={sql_guid(uid)});
SELECT
  v.game_section_id AS gameSectionId,
  v.section_slug AS sectionSlug,
  v.section_title AS sectionTitle,
  v.section_order AS sectionOrder,
  v.game_phase_id AS gamePhaseId,
  CAST(v.public_phase_id AS VARCHAR(36)) AS publicPhaseId,
  v.phase_slug AS phaseSlug,
  v.phase_title AS phaseTitle,
  v.phase_order AS phaseOrder,
  v.engine_slug AS engineSlug,
  v.engine_title AS engineTitle,
  v.question_count AS questionCount,
  v.pass_score AS passScore,
  v.max_score AS maxScore,
  v.config_json AS configJson,
  COALESCE(p.status, CASE WHEN v.phase_order=1 THEN 'available' ELSE 'locked' END) AS status,
  COALESCE(p.best_score, 0) AS bestScore,
  COALESCE(p.best_stars, 0) AS bestStars,
  COALESCE(p.attempts_count, 0) AS attemptsCount,
  COALESCE(smp.medal_state, 'locked') AS medalState
FROM bc.v_phase_catalog v
LEFT JOIN bc.user_phase_progress p ON p.user_id=@u AND p.game_phase_id=v.game_phase_id
LEFT JOIN bc.section_medal_progress smp ON smp.user_id=@u AND smp.game_section_id=v.game_section_id
ORDER BY v.section_order, v.phase_order;""")

async def progress(db,uid): return first(await db.execute_sql(f"""DECLARE @u UNIQUEIDENTIFIER=(SELECT TOP 1 user_id FROM bc.app_user WHERE public_user_id={sql_guid(uid)});
SELECT
  (SELECT COUNT(*) FROM bc.game_phase WHERE is_active=1) AS totalPhases,
  (SELECT COUNT(*) FROM bc.user_phase_progress WHERE user_id=@u AND status='completed') AS completedPhases,
  (SELECT COALESCE(SUM(best_stars),0) FROM bc.user_phase_progress WHERE user_id=@u) AS totalStars;"""))

async def questions(db,pid,limit,random): return await db.execute_sql(f"""SELECT TOP ({limit})
  qb.question_id AS questionId,
  CAST(qb.public_question_id AS VARCHAR(36)) AS publicQuestionId,
  qb.prompt,
  qb.simple_explanation AS simpleExplanation,
  qb.options_json AS optionsJson,
  qb.metadata_json AS metadataJson,
  qb.difficulty,
  qb.tags
FROM bc.game_phase gp
JOIN bc.phase_question pq ON pq.game_phase_id=gp.game_phase_id
JOIN bc.question_bank qb ON qb.question_id=pq.question_id
WHERE gp.public_phase_id={sql_guid(pid)} AND qb.is_active=1
{'ORDER BY NEWID()' if random else 'ORDER BY pq.order_index, qb.question_id'};""")

async def next_phase(db,uid,pid): return first(await db.execute_sql(f"""DECLARE @u UNIQUEIDENTIFIER=(SELECT TOP 1 user_id FROM bc.app_user WHERE public_user_id={sql_guid(uid)}),@s INT,@o INT;
SELECT @s=section_order, @o=phase_order FROM bc.v_phase_catalog WHERE public_phase_id={sql_guid(pid)};
SELECT TOP 1
  v.game_section_id AS gameSectionId,
  v.section_slug AS sectionSlug,
  v.section_title AS sectionTitle,
  v.section_order AS sectionOrder,
  v.game_phase_id AS gamePhaseId,
  CAST(v.public_phase_id AS VARCHAR(36)) AS publicPhaseId,
  v.phase_slug AS phaseSlug,
  v.phase_title AS phaseTitle,
  v.phase_order AS phaseOrder,
  v.engine_slug AS engineSlug,
  v.engine_title AS engineTitle,
  COALESCE(p.status, CASE WHEN v.phase_order=1 THEN 'available' ELSE 'locked' END) AS status
FROM bc.v_phase_catalog v
LEFT JOIN bc.user_phase_progress p ON p.user_id=@u AND p.game_phase_id=v.game_phase_id
WHERE (v.section_order=@s AND v.phase_order>@o) OR v.section_order>@s
ORDER BY v.section_order, v.phase_order;"""))

async def attempt(db,uid,pid,b):
 stars=3 if b.score>=95 else 2 if b.score>=80 else 1 if b.score>=60 else 0; passed=1 if b.score>=60 else 0
 sql=f"""DECLARE @u UNIQUEIDENTIFIER=(SELECT TOP 1 user_id FROM bc.app_user WHERE public_user_id={sql_guid(uid)}),@p INT=(SELECT TOP 1 game_phase_id FROM bc.game_phase WHERE public_phase_id={sql_guid(pid)} AND is_active=1),@a UNIQUEIDENTIFIER=NEWID(),@pa UNIQUEIDENTIFIER=NEWID();IF @u IS NULL THROW 51000,'Usuário não encontrado.',1;IF @p IS NULL THROW 51001,'Fase não encontrada.',1;INSERT INTO bc.game_attempt VALUES(@a,@pa,@u,@p,{b.score},{stars},{passed},{b.hintsUsed},{'NULL' if b.attemptsUsed is None else b.attemptsUsed},{'NULL' if b.correctCount is None else b.correctCount},{'NULL' if b.totalCount is None else b.totalCount},{'NULL' if b.durationSeconds is None else b.durationSeconds},{sql_json(b.answers)},SYSUTCDATETIME());MERGE bc.user_phase_progress x USING(SELECT @u user_id,@p game_phase_id)s ON x.user_id=s.user_id AND x.game_phase_id=s.game_phase_id WHEN MATCHED THEN UPDATE SET status=CASE WHEN {passed}=1 THEN 'completed' ELSE x.status END,best_score=CASE WHEN {b.score}>x.best_score THEN {b.score} ELSE x.best_score END,best_stars=CASE WHEN {stars}>x.best_stars THEN {stars} ELSE x.best_stars END,attempts_count=x.attempts_count+1,last_played_at=SYSUTCDATETIME(),updated_at=SYSUTCDATETIME() WHEN NOT MATCHED THEN INSERT VALUES(@u,@p,CASE WHEN {passed}=1 THEN 'completed' ELSE 'available' END,{b.score},{stars},1,CASE WHEN {passed}=1 THEN SYSUTCDATETIME() ELSE NULL END,SYSUTCDATETIME(),SYSUTCDATETIME());SELECT CAST(@a AS VARCHAR(36)) AS attemptId,CAST(@pa AS VARCHAR(36)) AS publicAttemptId,{b.score} AS score,{stars} AS stars,CAST({passed} AS BIT) AS passed,(SELECT status FROM bc.user_phase_progress WHERE user_id=@u AND game_phase_id=@p) AS currentStatus;"""
 return first(await db.execute_sql(sql))
