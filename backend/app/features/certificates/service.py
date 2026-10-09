import secrets
from datetime import datetime, timezone
from app.utils.pdf_generator import generate_certificate

async def eligibility(db, uid):
    user_id = int(uid)
    row = await db.fetch_one(
        "SELECT "
        "(SELECT COUNT(*) FROM tb_trail_redemption WHERE user_id=%s) AS redemptions, "
        "(SELECT COUNT(*) FROM tb_phase WHERE is_active=1) AS totalPhases, "
        "(SELECT COUNT(*) FROM tb_game_progress g "
        " JOIN tb_phase p ON p.id=g.phase_id "
        " WHERE g.user_id=%s AND p.is_active=1 AND g.best_score>=p.pass_score) AS completedPhases, "
        "(SELECT COUNT(*) FROM tb_certificate WHERE user_id=%s) AS certificateCount",
        (user_id, user_id, user_id),
    ) or {}

    redemptions = int(row.get('redemptions') or 0)
    total_phases = int(row.get('totalPhases') or 0)
    completed_phases = int(row.get('completedPhases') or 0)
    required_redemptions = 6

    return {
        'redemptions': redemptions,
        'requiredRedemptions': required_redemptions,
        'totalPhases': total_phases,
        'completedPhases': completed_phases,
        'remainingPhases': max(0, total_phases - completed_phases),
        'remainingRedemptions': max(0, required_redemptions - redemptions),
        'certificateCount': int(row.get('certificateCount') or 0),
        'eligible': (
            total_phases > 0
            and completed_phases >= total_phases
            and redemptions >= required_redemptions
        ),
    }

async def generate(db, uid, name, year):
    status = await eligibility(db, uid)
    if not status['eligible']:
        raise ValueError(
            f"Requisitos pendentes: {status['remainingPhases']} fase(s) e "
            f"{status['remainingRedemptions']} item(ns) da trilha."
        )

    existing = await db.fetch_one(
        "SELECT validation_code AS verificationCode, issued_at AS issuedAt "
        "FROM tb_certificate WHERE user_id=%s ORDER BY issued_at DESC LIMIT 1",
        (int(uid),),
    )
    if not existing:
        code = secrets.token_hex(8).upper()
        await db.execute(
            "INSERT INTO tb_certificate(user_id,validation_code) VALUES(%s,%s)",
            (int(uid), code),
        )
        existing = {
            'verificationCode': code,
            'issuedAt': datetime.now(timezone.utc).isoformat(),
        }

    return {
        **existing,
        'publicCertificateId': str(existing['verificationCode']),
        'pdfBase64': generate_certificate(
            name,
            year or datetime.now().year,
            existing['verificationCode'],
        ),
    }

async def status(db, uid):
    return await eligibility(db, uid)

async def verify(db, code):
    row = await db.fetch_one(
        "SELECT validation_code AS verificationCode, issued_at AS issuedAt, "
        "u.nome AS participantName FROM tb_certificate c "
        "JOIN tb_user u ON u.id=c.user_id WHERE validation_code=%s",
        (code.upper(),),
    )
    return {**row, 'isValid': True} if row else None
