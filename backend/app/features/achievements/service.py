from datetime import date, datetime
from app.features.trails.service import MAIN_TRAIL_KEYS

TRAIL_DEFINITIONS = [
    ('HISTORIA_HQ', 'História em Quadrinhos', 'book-open', 'red', 'bronze'),
    ('LIVRO_1', 'Livro 1', 'book', 'blue', 'bronze'),
    ('LIVRO_2', 'Livro 2', 'book', 'purple', 'silver'),
    ('LIVRO_3', 'Livro 3', 'book', 'green', 'gold'),
    ('BALANCO_COMPLETO', 'Entendendo o Balanço', 'book', 'blue', 'gold'),
    ('BALANCO_DADOS', 'Balanço em Dados', 'chart-column', 'blue', 'silver'),
    ('JOGOS_COMPLETOS', 'Jogos', 'gamepad', 'purple', 'gold'),
    ('SAIBA_MAIS', 'Saiba Mais', 'graduation-cap', 'gold', 'gold'),
]

LEGACY_GAME_TRAILS = [
    ('administracao-publica', 'Administração Pública', 'landmark', 'red'),
    ('receita-e-despesa-publica', 'Receita e Despesa Pública', 'coins', 'blue'),
    ('execucao-orcamentaria', 'Execução Orçamentária', 'chart-line', 'purple'),
    ('transparencia-e-controle-social', 'Transparência e Controle Social', 'magnifying-glass-chart', 'green'),
]

SECTION_VISUALS = [
    ('landmark', 'red'),
    ('coins', 'blue'),
    ('chart-line', 'purple'),
    ('magnifying-glass-chart', 'green'),
]


def serialize_date(value):
    if isinstance(value, (date, datetime)):
        return value.isoformat()
    return str(value) if value else None


def medal(*, key, title, medal_type, icon, ribbon, coin, unlocked, description, meta,
          current=None, target=None, awarded_at=None):
    return {
        'key': key,
        'title': title,
        'shortName': title,
        'type': medal_type,
        'icon': icon,
        'ribbon': ribbon,
        'coin': coin if unlocked else 'locked',
        'unlocked': bool(unlocked),
        'description': description,
        'meta': meta,
        'current': current,
        'target': target,
        'awardedAt': serialize_date(awarded_at),
    }


async def get_achievements(db, uid):
    user_id = int(uid)

    sections = await db.fetch_all(
        "SELECT s.id AS sectionId, s.slug, s.title, s.order_index AS sectionOrder, "
        "COUNT(p.id) AS totalPhases, "
        "SUM(CASE WHEN g.completed_at IS NOT NULL THEN 1 ELSE 0 END) AS completedPhases, "
        "COALESCE(SUM(g.best_stars), 0) AS stars, "
        "MAX(g.completed_at) AS completedAt "
        "FROM tb_section s "
        "JOIN tb_phase p ON p.section_id=s.id AND p.is_active=1 "
        "LEFT JOIN tb_game_progress g ON g.phase_id=p.id AND g.user_id=%s "
        "WHERE s.is_active=1 "
        "GROUP BY s.id, s.slug, s.title, s.order_index "
        "ORDER BY s.order_index",
        (user_id,),
    )

    redemptions = await db.fetch_all(
        "SELECT item_key AS itemKey, redeemed_at AS redeemedAt "
        "FROM tb_trail_redemption WHERE user_id=%s",
        (user_id,),
    )
    redemption_map = {row['itemKey']: row for row in redemptions}
    main_trails_completed = sum(key in redemption_map for key in MAIN_TRAIL_KEYS)

    certificate = await db.fetch_one(
        "SELECT validation_code AS verificationCode, issued_at AS issuedAt "
        "FROM tb_certificate WHERE user_id=%s ORDER BY issued_at DESC LIMIT 1",
        (user_id,),
    )

    medals = []
    total_stars = 0
    possible_stars = 0
    completed_sections = 0
    brilliant_count = 0

    def normalize(value):
        import unicodedata
        text = unicodedata.normalize('NFD', str(value or '').lower())
        return ''.join(char for char in text if unicodedata.category(char) != 'Mn')

    section_by_slug = {str(row.get('slug') or ''): row for row in sections}
    section_by_title = {normalize(row.get('title')): row for row in sections}
    used_section_ids = set()

    ordered_sections = []
    for legacy_slug, legacy_title, legacy_icon, legacy_ribbon in LEGACY_GAME_TRAILS:
        row = section_by_slug.get(legacy_slug) or section_by_title.get(normalize(legacy_title))
        ordered_sections.append((row, legacy_slug, legacy_title, legacy_icon, legacy_ribbon))
        if row:
            used_section_ids.add(row['sectionId'])

    for index, row in enumerate(sections):
        if row['sectionId'] in used_section_ids:
            continue
        icon, ribbon = SECTION_VISUALS[index % len(SECTION_VISUALS)]
        ordered_sections.append((row, row.get('slug') or str(row['sectionId']), row['title'], icon, ribbon))

    for row, fallback_slug, fallback_title, icon, ribbon in ordered_sections:
        total = int(row.get('totalPhases') or 0) if row else 0
        completed = int(row.get('completedPhases') or 0) if row else 0
        stars = int(row.get('stars') or 0) if row else 0
        maximum = total * 3
        unlocked = total > 0 and completed >= total
        brilliant = unlocked and maximum > 0 and stars >= maximum
        coin = 'gold' if brilliant else 'silver' if unlocked and stars >= maximum * .5 else 'bronze'
        title = row.get('title') if row else fallback_title
        slug = row.get('slug') if row else fallback_slug

        total_stars += stars
        possible_stars += maximum
        completed_sections += int(unlocked)
        brilliant_count += int(brilliant)

        medals.append(medal(
            key=f"game-section-{slug}",
            title=title,
            medal_type='Trilha de jogos',
            icon=icon,
            ribbon=ribbon,
            coin=coin,
            unlocked=unlocked,
            description=(
                f"Concedida por concluir todas as {total} fases da trilha {title}."
                if unlocked else
                f"Bloqueada. Conclua todas as fases da trilha {title}."
            ),
            meta=(
                f"{stars} de {maximum} estrelas" if unlocked else
                f"{completed}/{total} fases concluídas" if total > 0 else
                "Trilha ainda não cadastrada ou sem fases ativas"
            ),
            current=completed,
            target=total,
            awarded_at=row.get('completedAt') if row and unlocked else None,
        ))

    total_game_trails = len(ordered_sections)
    for item_key, title, icon, ribbon, coin in TRAIL_DEFINITIONS:
        redemption = redemption_map.get(item_key)
        unlocked = redemption is not None
        medals.append(medal(
            key=f"main-trail-{item_key.lower()}",
            title=title,
            medal_type='Trilha principal',
            icon=icon,
            ribbon=ribbon,
            coin=coin,
            unlocked=unlocked,
            description=(
                f"Concedida por concluir a etapa {title} da trilha principal."
                if unlocked else
                f"Bloqueada. Conclua a etapa {title} da trilha principal."
            ),
            meta='Etapa concluída' if unlocked else 'Etapa ainda não concluída',
            current=1 if unlocked else 0,
            target=1,
            awarded_at=redemption.get('redeemedAt') if redemption else None,
        ))

    def add_progress(key, title, icon, ribbon, coin, current, target, description, unlocked_meta=None):
        unlocked = target > 0 and current >= target
        medals.append(medal(
            key=key,
            title=title,
            medal_type='Conquista',
            icon=icon,
            ribbon=ribbon,
            coin=coin,
            unlocked=unlocked,
            description=description,
            meta=unlocked_meta if unlocked and unlocked_meta else f"Bloqueada · {current}/{target}",
            current=current,
            target=target,
        ))

    # Conquistas existentes na codebase anterior. Mantidas com as mesmas chaves,
    # nomes, metas, ícones, cores e condições de desbloqueio.
    add_progress(
        'stars-25',
        'Colecionador 25 Estrelas',
        'star',
        'gold',
        'gold',
        total_stars,
        25,
        'Liberada ao conquistar pelo menos 25 estrelas nos jogos.',
        f'{total_stars} estrelas conquistadas',
    )
    add_progress(
        'stars-35',
        'Colecionador 35 Estrelas',
        'star',
        'purple',
        'gold',
        total_stars,
        35,
        'Liberada ao conquistar pelo menos 35 estrelas nos jogos.',
        f'{total_stars} estrelas conquistadas',
    )
    add_progress(
        'all-trails',
        'Todas as Trilhas',
        'route',
        'green',
        'gold',
        completed_sections,
        total_game_trails,
        'Liberada ao concluir todas as trilhas educativas da jornada.',
        f'{completed_sections} de {total_game_trails} trilhas concluídas',
    )
    add_progress(
        'two-brilliant',
        'Duas Medalhas Brilhantes',
        'medal',
        'gold',
        'gold',
        brilliant_count,
        2,
        'Liberada ao conquistar duas medalhas brilhantes nas trilhas.',
        f'{brilliant_count} medalha(s) brilhante(s)',
    )

    medals.append(medal(
        key='certificate',
        title='Certificado Final',
        medal_type='Conquista',
        icon='file-signature',
        ribbon='blue',
        coin='silver',
        unlocked=bool(certificate),
        description='Liberada quando existe certificado emitido no banco de dados.',
        meta='Certificado emitido' if certificate else 'Nenhum certificado emitido',
        current=1 if certificate else 0,
        target=1,
        awarded_at=certificate.get('issuedAt') if certificate else None,
    ))

    add_progress(
        'legend',
        f'Lenda Fiscal {possible_stars} Estrelas',
        'crown',
        'gold',
        'gold',
        total_stars,
        possible_stars,
        'Liberada ao conquistar todas as estrelas disponíveis nas fases cadastradas.',
        f'{total_stars} de {possible_stars} estrelas',
    )

    # Nova conquista agregada, sem substituir nenhuma conquista anterior.
    add_progress(
        'all-main-trails',
        'Jornada Principal Completa',
        'road',
        'blue',
        'gold',
        main_trails_completed,
        len(MAIN_TRAIL_KEYS),
        'Liberada ao concluir todas as etapas da trilha principal.',
        f'{main_trails_completed} de {len(MAIN_TRAIL_KEYS)} etapas concluídas',
    )

    unlocked_count = sum(1 for item in medals if item['unlocked'])
    return {
        'items': medals,
        'summary': {
            'total': len(medals),
            'unlocked': unlocked_count,
            'locked': len(medals) - unlocked_count,
            'stars': total_stars,
            'possibleStars': possible_stars,
            'completedGameTrails': completed_sections,
            'totalGameTrails': total_game_trails,
            'completedMainTrails': main_trails_completed,
            'totalMainTrails': len(MAIN_TRAIL_KEYS),
        },
    }
