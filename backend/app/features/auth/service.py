from app.core.security import create_access_token


async def create_or_get_user(db, cpf: str, name: str) -> dict:
    nome_clean = name.strip()[:150]
    async with db.transaction() as cur:
        await cur.execute(
            'SELECT id, cpf, nome FROM tb_user WHERE cpf=%s FOR UPDATE', (cpf,)
        )
        u = await cur.fetchone()
        if u:
            if u['nome'] != nome_clean:
                await cur.execute(
                    'UPDATE tb_user SET nome=%s WHERE id=%s',
                    (nome_clean, u['id']),
                )
                u['nome'] = nome_clean
        else:
            await cur.execute(
                'INSERT INTO tb_user (cpf, nome) VALUES (%s, %s)',
                (cpf, nome_clean),
            )
            u = {'id': cur.lastrowid, 'nome': nome_clean}

    user_id_str = str(u['id'])
    cpf_masked = f'***.{cpf[3:6]}.{cpf[6:9]}-**' if len(cpf) == 11 else None
    return {
        'userId': user_id_str,
        'publicUserId': user_id_str,
        'displayName': u['nome'],
        'cpfMasked': cpf_masked,
    }


async def delete_user_data(db, uid: str) -> dict:
    return {'ok': bool(await db.execute('DELETE FROM tb_user WHERE id=%s', (int(uid),)))}


def token_for(user_data: dict) -> str:
    return create_access_token(user_data['userId'], user_data['displayName'])

