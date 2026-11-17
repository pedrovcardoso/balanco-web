from fastapi import HTTPException

BOOK_KEYS = ('LIVRO_1', 'LIVRO_2', 'LIVRO_3')
MAIN_TRAIL_KEYS = ('HISTORIA_HQ', 'BALANCO_COMPLETO', 'BALANCO_DADOS', 'JOGOS_COMPLETOS', 'SAIBA_MAIS')
KEYS = ('HISTORIA_HQ', *BOOK_KEYS, 'BALANCO_COMPLETO', 'BALANCO_DADOS', 'JOGOS_COMPLETOS', 'SAIBA_MAIS')


async def get_trail_progress(db, uid):
    rows = await db.fetch_all(
        'SELECT item_key, redeemed_at FROM tb_trail_redemption WHERE user_id=%s',
        (int(uid),),
    )
    redemptions = {row['item_key']: row['redeemed_at'] for row in rows}
    return [
        {'itemKey': key, 'redeemed': key in redemptions, 'redeemedAt': redemptions.get(key)}
        for key in KEYS
    ]


async def redeem(db, uid, key):
    user_id = int(uid)
    if key == 'BALANCO_COMPLETO':
        row = await db.fetch_one(
            'SELECT COUNT(*) AS completed FROM tb_trail_redemption '
            'WHERE user_id=%s AND item_key IN (%s,%s,%s)',
            (user_id, *BOOK_KEYS),
        )
        if row['completed'] != len(BOOK_KEYS):
            raise HTTPException(status_code=409, detail='Conclua os três cadernos antes de resgatar a medalha.')
    elif key == 'JOGOS_COMPLETOS':
        row = await db.fetch_one(
            'SELECT COUNT(*) AS total, '
            'SUM(CASE WHEN g.best_stars >= 1 THEN 1 ELSE 0 END) AS completed '
            'FROM tb_phase p JOIN tb_section s ON s.id=p.section_id AND s.is_active=1 '
            'LEFT JOIN tb_game_progress g ON g.phase_id=p.id AND g.user_id=%s '
            'WHERE p.is_active=1',
            (user_id,),
        )
        if not row['total'] or row['completed'] != row['total']:
            raise HTTPException(status_code=409, detail='Conquiste ao menos uma estrela em cada fase antes de resgatar a medalha.')

    await db.execute(
        'INSERT INTO tb_trail_redemption(user_id,item_key) VALUES(%s,%s) '
        'ON DUPLICATE KEY UPDATE redeemed_at=redeemed_at',
        (user_id, key),
    )
    return {'itemKey': key, 'redeemed': True}
