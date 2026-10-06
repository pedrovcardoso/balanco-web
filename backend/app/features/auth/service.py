from app.core.security import create_access_token
from app.utils.sql_helpers import sql_string, sql_guid, first
async def create_or_get_user(db, cpf, name):
    sql=f"""DECLARE @cpf VARCHAR(11)={sql_string(cpf,11)}; DECLARE @name VARCHAR(160)={sql_string(name.strip(),160)};
DECLARE @hash CHAR(64)=CONVERT(CHAR(64),HASHBYTES('SHA2_256',@cpf),2),@uid UNIQUEIDENTIFIER,@public UNIQUEIDENTIFIER;
SELECT TOP 1 @uid=user_id,@public=public_user_id FROM bc.app_user WHERE external_provider='mvp-cpf' AND external_subject=@hash AND is_active=1;
IF @uid IS NULL BEGIN SET @uid=NEWID();SET @public=NEWID(); INSERT INTO bc.app_user(user_id,public_user_id,external_provider,external_subject,display_name,nickname,accepted_lgpd_at,created_at,updated_at,is_active) VALUES(@uid,@public,'mvp-cpf',@hash,@name,CONCAT('***.',SUBSTRING(@cpf,4,3),'.',SUBSTRING(@cpf,7,3),'-**'),SYSUTCDATETIME(),SYSUTCDATETIME(),SYSUTCDATETIME(),1); END ELSE UPDATE bc.app_user SET display_name=@name,updated_at=SYSUTCDATETIME() WHERE user_id=@uid;
IF NOT EXISTS(SELECT 1 FROM bc.user_main_trail_progress WHERE user_id=@uid) INSERT INTO bc.user_main_trail_progress(user_id,main_trail_id,status,progress_percent,completed_at,updated_at) SELECT @uid,main_trail_id,CASE WHEN order_index=1 THEN 'available' ELSE 'locked' END,0,NULL,SYSUTCDATETIME() FROM bc.main_trail WHERE is_active=1;
SELECT CAST(user_id AS VARCHAR(36)) userId,CAST(public_user_id AS VARCHAR(36)) publicUserId,display_name displayName,nickname cpfMasked FROM bc.app_user WHERE user_id=@uid;"""
    return first(await db.execute_sql(sql))
async def get_user(db, public_id):
    return first(await db.execute_sql(f"SELECT TOP 1 CAST(user_id AS VARCHAR(36)) userId,CAST(public_user_id AS VARCHAR(36)) publicUserId,display_name displayName,nickname cpfMasked FROM bc.app_user WHERE public_user_id={sql_guid(public_id)} AND is_active=1;"))
async def delete_user_data(db, public_id):
    q=sql_guid(public_id)
    return first(await db.execute_sql(f"""DECLARE @u UNIQUEIDENTIFIER=(SELECT TOP 1 user_id FROM bc.app_user WHERE public_user_id={q});
IF @u IS NOT NULL BEGIN DELETE FROM bc.user_achievement WHERE user_id=@u;DELETE FROM bc.section_medal_progress WHERE user_id=@u;DELETE FROM bc.game_attempt WHERE user_id=@u;DELETE FROM bc.user_phase_progress WHERE user_id=@u;DELETE FROM bc.user_content_progress WHERE user_id=@u;DELETE FROM bc.user_main_trail_progress WHERE user_id=@u;DELETE FROM bc.certificate_issue WHERE user_id=@u;DELETE FROM bc.user_session WHERE user_id=@u;DELETE FROM bc.app_user WHERE user_id=@u;END;SELECT 1 ok;"""))
def token_for(user): return create_access_token(user['publicUserId'],user['displayName'])
