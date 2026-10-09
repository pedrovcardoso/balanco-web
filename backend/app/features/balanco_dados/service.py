from app.core.config import settings

async def resumo(db):
    try:
        row = await db.fetch_one(
            "SELECT COUNT(DISTINCT programa_cod) AS quantidadeProgramas, "
            "COUNT(DISTINCT CONCAT(programa_cod, '-', acao_cod)) AS quantidadeAcoes, "
            "COALESCE(SUM(CASE WHEN is_total = 1 THEN orcamentario_executado ELSE 0 END), 0) AS valorExecutado, "
            "MAX(emitido_em) AS dataReferencia "
            "FROM tb_sigplan_execucao"
        )
        if not row:
            return {"quantidadeProgramas": 0, "quantidadeAcoes": 0, "valorExecutado": 0.0, "dataReferencia": None}
        return {
            "quantidadeProgramas": int(row.get("quantidadeProgramas") or 0),
            "quantidadeAcoes": int(row.get("quantidadeAcoes") or 0),
            "valorExecutado": float(row.get("valorExecutado") or 0.0),
            "dataReferencia": str(row["dataReferencia"]) if row.get("dataReferencia") else None,
        }
    except Exception as err:
        print(f"[balanco_dados] Erro ao buscar resumo no MySQL: {err}")
        return {"quantidadeProgramas": 0, "quantidadeAcoes": 0, "valorExecutado": 0.0, "dataReferencia": None}

async def regioes(db):
    try:
        rows = await db.fetch_all(
            "SELECT TRIM(regiao) AS regiao, "
            "COALESCE(SUM(orcamentario_executado), 0) AS valorExecutado, "
            "COALESCE(SUM(orcamentario_programado_ppag), 0) AS valorProgramado, "
            "COUNT(DISTINCT CONCAT(programa_cod, '-', acao_cod)) AS quantidadeAcoes "
            "FROM tb_sigplan_execucao "
            "WHERE is_total = 0 AND NULLIF(TRIM(regiao), '') IS NOT NULL "
            "GROUP BY TRIM(regiao) "
            "ORDER BY valorExecutado DESC"
        )
        return [
            {
                "regiao": r["regiao"],
                "valorExecutado": float(r["valorExecutado"] or 0),
                "valorProgramado": float(r["valorProgramado"] or 0),
                "quantidadeAcoes": int(r["quantidadeAcoes"] or 0),
            }
            for r in rows
        ]
    except Exception as err:
        print(f"[balanco_dados] Erro ao buscar regiões no MySQL: {err}")
        return []

async def municipios(db):
    try:
        rows = await db.fetch_all(
            "SELECT DISTINCT municipio_ibge_cod AS municipioIbgeCod, municipio, "
            "regiao_geografica_cod AS regiaoCod, TRIM(regiao_geografica_desc) AS regiao "
            "FROM tb_sigplan_localizadores "
            "WHERE municipio_ibge_cod IS NOT NULL AND regiao_geografica_desc IS NOT NULL AND is_deleted_localizador = 0"
        )
        return rows
    except Exception as err:
        print(f"[balanco_dados] Erro ao buscar municípios no MySQL: {err}")
        return []

async def ods(db):
    try:
        rows = await db.fetch_all(
            "WITH e AS ("
            "  SELECT programa_cod, SUM(orcamentario_executado) AS valor "
            "  FROM tb_sigplan_execucao WHERE is_total = 1 GROUP BY programa_cod"
            "), "
            "o AS ("
            "  SELECT DISTINCT programa_cod, TRIM(ods_titulo) AS titulo, NULLIF(TRIM(ods_subtitulo), '') AS subtitulo "
            "  FROM tb_sigplan_programas WHERE NULLIF(TRIM(ods_titulo), '') IS NOT NULL"
            "), "
            "q AS ("
            "  SELECT programa_cod, COUNT(*) AS qtd FROM o GROUP BY programa_cod"
            ") "
            "SELECT o.titulo AS odsTitulo, MAX(o.subtitulo) AS odsSubtitulo, "
            "COALESCE(SUM(e.valor / NULLIF(q.qtd, 0)), 0) AS valorExecutado, "
            "COUNT(DISTINCT e.programa_cod) AS quantidadeProgramas "
            "FROM e JOIN o ON o.programa_cod = e.programa_cod "
            "JOIN q ON q.programa_cod = e.programa_cod "
            "GROUP BY o.titulo ORDER BY valorExecutado DESC"
        )
        return [
            {
                "odsTitulo": r["odsTitulo"],
                "odsSubtitulo": r.get("odsSubtitulo"),
                "valorExecutado": float(r["valorExecutado"] or 0),
                "quantidadeProgramas": int(r["quantidadeProgramas"] or 0),
            }
            for r in rows
        ]
    except Exception as err:
        print(f"[balanco_dados] Erro ao buscar ODS no MySQL: {err}")
        return []

async def funcoes(db):
    try:
        rows = await db.fetch_all(
            "SELECT COALESCE(a.funcao_desc, 'Não informado') AS funcao, "
            "COALESCE(SUM(e.orcamentario_executado), 0) AS valorExecutado, "
            "COALESCE(SUM(e.orcamentario_programado_ppag), 0) AS valorProgramado "
            "FROM tb_sigplan_execucao e "
            "LEFT JOIN tb_sigplan_acoes a ON a.programa_cod = e.programa_cod AND a.acao_cod = e.acao_cod AND a.uo_acao_cod = e.uo_cod "
            "WHERE e.is_total = 1 "
            "GROUP BY COALESCE(a.funcao_desc, 'Não informado') "
            "ORDER BY valorExecutado DESC"
        )
        return [
            {
                "funcao": r["funcao"],
                "valorExecutado": float(r["valorExecutado"] or 0),
                "valorProgramado": float(r["valorProgramado"] or 0),
            }
            for r in rows
        ]
    except Exception as err:
        print(f"[balanco_dados] Erro ao buscar funções no MySQL: {err}")
        return []

async def uos(db):
    try:
        rows = await db.fetch_all(
            "WITH execucao_programa AS ("
            "  SELECT programa_cod, SUM(orcamentario_executado) AS valorExecutado "
            "  FROM tb_sigplan_execucao WHERE is_total = 1 GROUP BY programa_cod"
            "), "
            "programa_uo AS ("
            "  SELECT programa_cod, MAX(COALESCE(uo_programa_nome, 'Não informado')) AS uo "
            "  FROM tb_sigplan_programas WHERE is_deleted_programa = 0 GROUP BY programa_cod"
            ") "
            "SELECT pu.uo AS uo, COALESCE(SUM(ep.valorExecutado), 0) AS valorExecutado, "
            "COUNT(DISTINCT ep.programa_cod) AS quantidadeProgramas "
            "FROM execucao_programa ep "
            "LEFT JOIN programa_uo pu ON pu.programa_cod = ep.programa_cod "
            "GROUP BY pu.uo ORDER BY valorExecutado DESC"
        )
        return [
            {
                "uo": r["uo"],
                "valorExecutado": float(r["valorExecutado"] or 0),
                "quantidadeProgramas": int(r["quantidadeProgramas"] or 0),
            }
            for r in rows
        ]
    except Exception as err:
        print(f"[balanco_dados] Erro ao buscar UOs no MySQL: {err}")
        return []

async def populacao(client):
    try:
        r = await client.get(settings.ibge_population_url, headers={'Accept': 'application/json'})
        r.raise_for_status()
        p = r.json()
        series = ((p[0].get('resultados') or [{}])[0].get('series') or []) if p else []
        return [
            {
                'municipioIbgeCod': ''.join(filter(str.isdigit, str(x.get('localidade', {}).get('id', '')))),
                'municipio': x.get('localidade', {}).get('nome', ''),
                'populacao': int(next(iter((x.get('serie') or {'x': 0}).values()), 0) or 0),
            }
            for x in series
        ]
    except Exception as err:
        print(f"[balanco_dados] Erro ao consultar IBGE: {err}")
        return []
