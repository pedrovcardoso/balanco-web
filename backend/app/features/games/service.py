import json
from fastapi import HTTPException

def parse(row):
    if not row:
        return row
    result = dict(row)
    for key in ("configJson", "optionsJson", "metadataJson"):
        if result.get(key) and isinstance(result[key], str):
            try:
                result[key] = json.loads(result[key])
            except (TypeError, ValueError, json.JSONDecodeError):
                pass
    return result

async def game_map(db, uid):
    rows = await db.fetch_all(
        "SELECT s.id AS gameSectionId, s.slug AS sectionSlug, s.title AS sectionTitle, s.order_index AS sectionOrder, "
        "p.id AS gamePhaseId, p.public_id AS publicPhaseId, p.slug, p.title AS phaseTitle, p.description, p.order_index AS phaseOrder, "
        "e.slug AS engineSlug, e.title AS engineTitle, p.pass_score AS passScore, p.max_score AS maxScore, "
        "p.config_json AS configJson, COALESCE(g.best_score, 0) AS bestScore, COALESCE(g.best_stars, 0) AS bestStars, "
        "COALESCE(g.attempts, 0) AS attemptsCount, "
        "CASE WHEN g.completed_at IS NOT NULL THEN 'completed' WHEN p.order_index = 1 THEN 'available' ELSE 'locked' END AS status "
        "FROM tb_section s JOIN tb_phase p ON p.section_id=s.id AND p.is_active=1 "
        "JOIN tb_engine e ON e.id=p.engine_id "
        "LEFT JOIN tb_game_progress g ON g.phase_id=p.id AND g.user_id=%s "
        "WHERE s.is_active=1 ORDER BY s.order_index,p.order_index",
        (int(uid) if uid else 0,),
    )
    return [parse(row) for row in rows]

async def progress(db, uid):
    return await db.fetch_one(
        "SELECT COUNT(*) AS totalPhases, SUM(g.completed_at IS NOT NULL) AS completedPhases, "
        "COALESCE(SUM(g.best_stars),0) AS totalStars FROM tb_phase p "
        "LEFT JOIN tb_game_progress g ON g.phase_id=p.id AND g.user_id=%s WHERE p.is_active=1",
        (int(uid) if uid else 0,),
    )

async def questions(db, pid, limit, random):
    numeric_id = int(pid) if str(pid).isdigit() else 0
    phase = await db.fetch_one(
        "SELECT p.id, p.public_id, e.slug AS engineSlug FROM tb_phase p "
        "JOIN tb_engine e ON e.id=p.engine_id "
        "WHERE (p.public_id=%s OR p.id=%s) AND p.is_active=1",
        (pid, numeric_id),
    )
    if not phase:
        raise HTTPException(status_code=404, detail="Fase não encontrada ou inativa.")

    order_sql = "RAND()" if random and phase["engineSlug"] not in ("ordem-correta",) else "pq.order_index, q.id"
    rows = await db.fetch_all(
        f"SELECT q.id AS questionId, q.public_id AS publicQuestionId, q.prompt, "
        f"q.simple_explanation AS simpleExplanation, q.correct_answer AS correctAnswer, "
        f"q.options_json AS optionsJson, q.metadata_json AS metadataJson, "
        f"pq.order_index AS phaseQuestionOrder, e.slug AS engineSlug "
        f"FROM tb_phase_question pq "
        f"JOIN tb_question q ON q.id=pq.question_id AND q.is_active=1 "
        f"JOIN tb_engine e ON e.id=q.engine_id "
        f"WHERE pq.phase_id=%s ORDER BY {order_sql} LIMIT %s",
        (phase["id"], limit),
    )
    return {
        "phaseId": phase["public_id"] or str(phase["id"]),
        "engineSlug": phase["engineSlug"],
        "count": len(rows),
        "items": [parse(row) for row in rows],
    }

async def next_phase(db, uid, pid):
    numeric_id = int(pid) if str(pid).isdigit() else 0
    phase = await db.fetch_one(
        "SELECT id,section_id,order_index FROM tb_phase WHERE (public_id=%s OR id=%s) AND is_active=1",
        (pid, numeric_id),
    )
    if not phase:
        return None
    next_item = await db.fetch_one(
        "SELECT public_id,id FROM tb_phase WHERE is_active=1 AND "
        "((section_id=%s AND order_index>%s) OR section_id>%s) "
        "ORDER BY section_id,order_index LIMIT 1",
        (phase["section_id"], phase["order_index"], phase["section_id"]),
    )
    if not next_item:
        return None
    return {"nextPhaseId": next_item["public_id"] or str(next_item["id"]), "publicPhaseId": next_item["public_id"], "id": next_item["id"]}

async def attempt(db, uid, pid, body):
    numeric_id = int(pid) if str(pid).isdigit() else 0
    phase = await db.fetch_one(
        "SELECT id,pass_score FROM tb_phase WHERE (public_id=%s OR id=%s) AND is_active=1",
        (pid, numeric_id),
    )
    if not phase:
        raise HTTPException(status_code=404, detail="Fase não encontrada.")
    stars = 3 if body.score >= 95 else 2 if body.score >= 80 else 1 if body.score >= phase["pass_score"] else 0
    passed = body.score >= phase["pass_score"]
    if uid:
        await db.execute(
            "INSERT INTO tb_game_progress(user_id,phase_id,best_score,best_stars,attempts,completed_at) "
            "VALUES(%s,%s,%s,%s,1,IF(%s,UTC_TIMESTAMP(),NULL)) ON DUPLICATE KEY UPDATE "
            "best_score=GREATEST(best_score,VALUES(best_score)),best_stars=GREATEST(best_stars,VALUES(best_stars)),"
            "attempts=attempts+1,completed_at=IFNULL(completed_at,IF(%s,UTC_TIMESTAMP(),NULL))",
            (int(uid), phase["id"], body.score, stars, passed, passed),
        )
    return {"score": body.score, "stars": stars, "passed": passed}
