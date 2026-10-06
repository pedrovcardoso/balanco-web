import secrets
from datetime import datetime,timezone
from uuid import uuid4
from app.utils.sql_helpers import sql_guid,sql_string,first
from app.utils.pdf_generator import generate_certificate
async def generate(db,uid,name,year):
 status=first(await db.execute_sql(f"DECLARE @u UNIQUEIDENTIFIER=(SELECT TOP 1 user_id FROM bc.app_user WHERE public_user_id={sql_guid(uid)});SELECT (SELECT COUNT(*) FROM bc.main_trail WHERE is_active=1) total,(SELECT COUNT(*) FROM bc.user_main_trail_progress WHERE user_id=@u AND status='completed') done;"))
 if not status or status['done']<status['total']: raise ValueError(f"Conclua todas as trilhas para gerar o certificado. ({status['done'] if status else 0}/{status['total'] if status else '?'} concluidas)")
 existing=first(await db.execute_sql(f"DECLARE @u UNIQUEIDENTIFIER=(SELECT TOP 1 user_id FROM bc.app_user WHERE public_user_id={sql_guid(uid)});SELECT TOP 1 CAST(public_certificate_id AS VARCHAR(36)) publicCertificateId,verification_code verificationCode,issued_at issuedAt FROM bc.certificate_issue WHERE user_id=@u AND revoked_at IS NULL ORDER BY issued_at DESC;"))
 if existing: return {'publicCertificateId':existing['publicCertificateId'],'verificationCode':existing['verificationCode'],'issuedAt':str(existing['issuedAt']),'pdfBase64':generate_certificate(name,year or datetime.now().year,existing['verificationCode'])}
 cid=str(uuid4()); code=secrets.token_hex(6).upper(); issued=datetime.now(timezone.utc).isoformat(); fy=year or datetime.now().year
 await db.execute_sql(f"DECLARE @u UNIQUEIDENTIFIER=(SELECT TOP 1 user_id FROM bc.app_user WHERE public_user_id={sql_guid(uid)});INSERT INTO bc.certificate_issue(public_certificate_id,user_id,participant_name,fiscal_year,verification_code,issued_at) VALUES({sql_guid(cid)},@u,{sql_string(name,160)},{fy},{sql_string(code,12)},SYSUTCDATETIME());")
 return {'publicCertificateId':cid,'verificationCode':code,'issuedAt':issued,'pdfBase64':generate_certificate(name,fy,code)}
async def status(db,uid): return first(await db.execute_sql(f"DECLARE @u UNIQUEIDENTIFIER=(SELECT TOP 1 user_id FROM bc.app_user WHERE public_user_id={sql_guid(uid)});SELECT COUNT(*) certificateCount,MAX(issued_at) lastIssuedAt FROM bc.certificate_issue WHERE user_id=@u AND revoked_at IS NULL;"))
async def verify(db,code): return first(await db.execute_sql(f"SELECT TOP 1 CAST(public_certificate_id AS VARCHAR(36)) publicCertificateId,participant_name participantName,fiscal_year fiscalYear,verification_code verificationCode,issued_at issuedAt,CAST(CASE WHEN revoked_at IS NULL THEN 1 ELSE 0 END AS BIT) isValid FROM bc.certificate_issue WHERE verification_code={sql_string(code.upper(),12)};"))
