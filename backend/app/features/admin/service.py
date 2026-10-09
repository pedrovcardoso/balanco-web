import json
from uuid import uuid4
async def save_section(db,s):
 if s.gameSectionId:await db.execute('UPDATE tb_section SET slug=%s,title=%s,description=%s,order_index=%s,is_active=%s WHERE id=%s',(s.slug,s.title,s.description,s.orderIndex,s.isActive,s.gameSectionId));return {'gameSectionId':s.gameSectionId}
 return {'gameSectionId':await db.execute('INSERT INTO tb_section(slug,title,description,order_index,is_active) VALUES(%s,%s,%s,%s,%s)',(s.slug,s.title,s.description,s.orderIndex,s.isActive))}
async def deactivate_section(db,id):await db.execute('UPDATE tb_section SET is_active=0 WHERE id=%s',(id,));return {'ok':True}
async def save_phase(db,p):
 vals=(p.gameSectionId,p.gameEngineId,p.title,p.description,p.orderIndex,p.passScore,p.maxScore,p.configJson,p.isActive)
 if p.gamePhaseId:await db.execute('UPDATE tb_phase SET section_id=%s,engine_id=%s,title=%s,description=%s,order_index=%s,pass_score=%s,max_score=%s,config_json=%s,is_active=%s WHERE id=%s',vals+(p.gamePhaseId,));return {'gamePhaseId':p.gamePhaseId}
 return {'gamePhaseId':await db.execute('INSERT INTO tb_phase(public_id,section_id,engine_id,title,description,order_index,pass_score,max_score,config_json,is_active) VALUES(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)',(str(uuid4()),)+vals)}
async def save_question(db,q):
 vals=(q.gameEngineId,q.prompt,q.simpleExplanation,q.correctAnswer,json.dumps(q.options,ensure_ascii=False) if q.options else None,json.dumps(q.metadata,ensure_ascii=False) if q.metadata else None)
 if q.questionId:await db.execute('UPDATE tb_question SET engine_id=%s,prompt=%s,simple_explanation=%s,correct_answer=%s,options_json=%s,metadata_json=%s WHERE id=%s',vals+(q.questionId,));return {'questionId':q.questionId}
 return {'questionId':await db.execute('INSERT INTO tb_question(engine_id,prompt,simple_explanation,correct_answer,options_json,metadata_json) VALUES(%s,%s,%s,%s,%s,%s)',vals)}
async def link(db,pid,b):return {'phaseQuestionId':await db.execute('INSERT INTO tb_phase_question(phase_id,question_id,order_index) VALUES(%s,%s,%s) ON DUPLICATE KEY UPDATE order_index=VALUES(order_index)',(pid,b.questionId,b.orderIndex))}
async def unlink(db,id):await db.execute('DELETE FROM tb_phase_question WHERE id=%s',(id,));return {'ok':True}
async def reusable(db,s,e,p):return await db.fetch_all('SELECT q.id questionId,q.prompt FROM tb_question q WHERE q.engine_id=%s AND q.is_active=1 AND NOT EXISTS(SELECT 1 FROM tb_phase_question x WHERE x.question_id=q.id AND x.phase_id=%s) LIMIT 100',(e,p))
async def move(*args,**kwargs):return {'moved':False}
