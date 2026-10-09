"""
Script de Migração dos Dados do SIGPLAN (SQL Server -> MySQL)
-------------------------------------------------------------
Este script cria as tabelas do SIGPLAN no MySQL (`sc_balanco_web`) e migra os dados
das tabelas legadas do SQL Server (`dbo.sigplan_execucao_regionalizada_2026`,
`dbo.localizadores_todos_planejamento`, `dbo.programas_planejamento`, `dbo.acoes_planejamento`).

Uso:
  python backend/scripts/migrate_sigplan.py [--json-dump CAMINHO_DO_DUMP] [--create-tables-only]

Variáveis de Ambiente Opcionais para SQL Server Origem:
  SQLSERVER_HOST     (Padrão: localhost)
  SQLSERVER_PORT     (Padrão: 1433)
  SQLSERVER_DB       (Padrão: lh_Sigplan)
  SQLSERVER_USER     (Padrão: sa)
  SQLSERVER_PASSWORD (Padrão: senha)
"""

import argparse
import json
import os
import sys
import asyncio
import pymysql

# Adicionar raiz do backend ao path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.core.config import settings

CREATE_TABLES_SQL = """
-- 1. Tabela de Execução Regionalizada SIGPLAN
CREATE TABLE IF NOT EXISTS tb_sigplan_execucao (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  programa_cod VARCHAR(50) NOT NULL,
  acao_cod VARCHAR(50) NOT NULL,
  uo_cod VARCHAR(50) DEFAULT NULL,
  regiao VARCHAR(150) DEFAULT NULL,
  orcamentario_executado DECIMAL(18,2) NOT NULL DEFAULT 0.00,
  orcamentario_programado_ppag DECIMAL(18,2) NOT NULL DEFAULT 0.00,
  is_total TINYINT(1) NOT NULL DEFAULT 0,
  emitido_em VARCHAR(50) DEFAULT NULL,
  PRIMARY KEY (id),
  KEY idx_prog_acao (programa_cod, acao_cod),
  KEY idx_is_total (is_total),
  KEY idx_regiao (regiao)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Tabela de Localizadores Geográficos / Municípios
CREATE TABLE IF NOT EXISTS tb_sigplan_localizadores (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  municipio_ibge_cod VARCHAR(20) DEFAULT NULL,
  municipio VARCHAR(150) NOT NULL,
  regiao_geografica_cod VARCHAR(50) DEFAULT NULL,
  regiao_geografica_desc VARCHAR(150) DEFAULT NULL,
  is_deleted_localizador TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY idx_municipio_ibge (municipio_ibge_cod)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Tabela de Programas e ODS
CREATE TABLE IF NOT EXISTS tb_sigplan_programas (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  programa_cod VARCHAR(50) NOT NULL,
  ods_titulo VARCHAR(255) DEFAULT NULL,
  ods_subtitulo TEXT DEFAULT NULL,
  uo_programa_nome VARCHAR(255) DEFAULT NULL,
  is_deleted_programa TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY idx_prog_cod (programa_cod)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Tabela de Ações e Funções de Governo
CREATE TABLE IF NOT EXISTS tb_sigplan_acoes (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  programa_cod VARCHAR(50) NOT NULL,
  acao_cod VARCHAR(50) NOT NULL,
  uo_acao_cod VARCHAR(50) DEFAULT NULL,
  funcao_desc VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (id),
  KEY idx_prog_acao_uo (programa_cod, acao_cod, uo_acao_cod)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
"""


def connect_mysql():
    return pymysql.connect(
        host=settings.db_host,
        port=settings.db_port,
        user=settings.db_user,
        password=settings.db_password,
        database=settings.db_name,
        charset='utf8mb4',
        cursorclass=pymysql.cursors.DictCursor,
        autocommit=True,
    )


def create_schema(connection):
    print("[INFO] Criando/Verificando tabelas do SIGPLAN no MySQL...")
    with connection.cursor() as cursor:
        statements = [stmt.strip() for stmt in CREATE_TABLES_SQL.split(';') if stmt.strip()]
        for stmt in statements:
            cursor.execute(stmt)
    print("[OK] Tabelas criadas com sucesso no MySQL!")


def fetch_from_sql_server():
    """Tenta conectar ao SQL Server do SIGPLAN via pyodbc ou pymssql."""
    host = os.getenv('SQLSERVER_HOST', 'localhost')
    port = os.getenv('SQLSERVER_PORT', '1433')
    database = os.getenv('SQLSERVER_DB', settings.sigplan_database)
    user = os.getenv('SQLSERVER_USER', 'sa')
    password = os.getenv('SQLSERVER_PASSWORD', '')

    print(f"[INFO] Tentando conectar ao SQL Server ({host}:{port}/{database})...")

    # Tenta usar pyodbc se disponível
    try:
        import pyodbc
        conn_str = f"DRIVER={{ODBC Driver 17 for SQL Server}};SERVER={host},{port};DATABASE={database};UID={user};PWD={password}"
        conn = pyodbc.connect(conn_str, timeout=5)
        print("[OK] Conectado ao SQL Server via pyodbc.")
        return conn, 'pyodbc'
    except Exception as e:
        print(f"[INFO] Conexão via pyodbc não disponível ({e}). Tentando pymssql...")

    # Tenta usar pymssql se disponível
    try:
        import pymssql
        conn = pymssql.connect(server=host, port=int(port), user=user, password=password, database=database, login_timeout=5)
        print("[OK] Conectado ao SQL Server via pymssql.")
        return conn, 'pymssql'
    except Exception as e:
        print(f"[AVISO] Não foi possível conectar ao SQL Server diretamente: {e}")
        return None, None


def migrate_from_sql_server(ss_conn, conn_type, mysql_conn):
    print("[INFO] Iniciando migração do SQL Server para o MySQL...")

    cursor_ss = ss_conn.cursor()
    cursor_ms = mysql_conn.cursor()

    # 1. Migrar Execução Regionalizada
    print("[INFO] Migrando sigplan_execucao_regionalizada_2026...")
    cursor_ss.execute("""
        SELECT programa_cod, acao_cod, uo_cod, regiao, 
               orcamentario_executado, orcamentario_programado_ppag, 
               is_total, emitido_em
        FROM dbo.sigplan_execucao_regionalizada_2026
    """)
    rows = cursor_ss.fetchall()
    cursor_ms.execute("TRUNCATE TABLE tb_sigplan_execucao")
    if rows:
        insert_sql = """
            INSERT INTO tb_sigplan_execucao 
            (programa_cod, acao_cod, uo_cod, regiao, orcamentario_executado, orcamentario_programado_ppag, is_total, emitido_em)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """
        data = [
            (
                str(r[0] or ''), str(r[1] or ''), str(r[2] or ''),
                str(r[3] or '').strip() if r[3] else None,
                float(r[4] or 0), float(r[5] or 0),
                int(r[6] or 0), str(r[7] or '') if r[7] else None
            )
            for r in rows
        ]
        cursor_ms.executemany(insert_sql, data)
    print(f"  └─ {len(rows)} registros inseridos em tb_sigplan_execucao.")

    # 2. Migrar Localizadores
    print("[INFO] Migrando localizadores_todos_planejamento...")
    cursor_ss.execute("""
        SELECT municipio_ibge_cod, municipio, regiao_geografica_cod, 
               regiao_geografica_desc, is_deleted_localizador
        FROM dbo.localizadores_todos_planejamento
    """)
    rows = cursor_ss.fetchall()
    cursor_ms.execute("TRUNCATE TABLE tb_sigplan_localizadores")
    if rows:
        insert_sql = """
            INSERT INTO tb_sigplan_localizadores
            (municipio_ibge_cod, municipio, regiao_geografica_cod, regiao_geografica_desc, is_deleted_localizador)
            VALUES (%s, %s, %s, %s, %s)
        """
        data = [
            (
                str(r[0] or '') if r[0] else None, str(r[1] or '').strip(),
                str(r[2] or '') if r[2] else None, str(r[3] or '').strip() if r[3] else None,
                int(r[4] or 0)
            )
            for r in rows
        ]
        cursor_ms.executemany(insert_sql, data)
    print(f"  └─ {len(rows)} registros inseridos em tb_sigplan_localizadores.")

    # 3. Migrar Programas
    print("[INFO] Migrando programas_planejamento...")
    cursor_ss.execute("""
        SELECT programa_cod, ods_titulo, ods_subtitulo, uo_programa_nome, is_deleted_programa
        FROM dbo.programas_planejamento
    """)
    rows = cursor_ss.fetchall()
    cursor_ms.execute("TRUNCATE TABLE tb_sigplan_programas")
    if rows:
        insert_sql = """
            INSERT INTO tb_sigplan_programas
            (programa_cod, ods_titulo, ods_subtitulo, uo_programa_nome, is_deleted_programa)
            VALUES (%s, %s, %s, %s, %s)
        """
        data = [
            (
                str(r[0] or ''), str(r[1] or '').strip() if r[1] else None,
                str(r[2] or '').strip() if r[2] else None, str(r[3] or '').strip() if r[3] else None,
                int(r[4] or 0)
            )
            for r in rows
        ]
        cursor_ms.executemany(insert_sql, data)
    print(f"  └─ {len(rows)} registros inseridos em tb_sigplan_programas.")

    # 4. Migrar Ações
    print("[INFO] Migrando acoes_planejamento...")
    cursor_ss.execute("""
        SELECT programa_cod, acao_cod, uo_acao_cod, funcao_desc
        FROM dbo.acoes_planejamento
    """)
    rows = cursor_ss.fetchall()
    cursor_ms.execute("TRUNCATE TABLE tb_sigplan_acoes")
    if rows:
        insert_sql = """
            INSERT INTO tb_sigplan_acoes
            (programa_cod, acao_cod, uo_acao_cod, funcao_desc)
            VALUES (%s, %s, %s, %s)
        """
        data = [
            (
                str(r[0] or ''), str(r[1] or ''), str(r[2] or ''),
                str(r[3] or '').strip() if r[3] else None
            )
            for r in rows
        ]
        cursor_ms.executemany(insert_sql, data)
    print(f"  └─ {len(rows)} registros inseridos em tb_sigplan_acoes.")

    print("[OK] Migração finalizada com sucesso!")


def import_from_json(json_file, mysql_conn):
    """Importa os dados de um arquivo JSON caso o SQL Server não esteja acessível."""
    print(f"[INFO] Importando dados do arquivo JSON: {json_file}...")
    if not os.path.exists(json_file):
        print(f"[ERRO] Arquivo {json_file} não encontrado.")
        return

    with open(json_file, 'r', encoding='utf-8') as f:
        data = json.load(f)

    cursor_ms = mysql_conn.cursor()

    for table, records in data.items():
        if not records:
            continue
        print(f"[INFO] Importando {len(records)} registros para {table}...")
        cursor_ms.execute(f"TRUNCATE TABLE {table}")
        cols = list(records[0].keys())
        placeholders = ", ".join(["%s"] * len(cols))
        col_names = ", ".join(cols)
        sql = f"INSERT INTO {table} ({col_names}) VALUES ({placeholders})"
        vals = [[r.get(c) for c in cols] for r in records]
        cursor_ms.executemany(sql, vals)
        print(f"  └─ Sucesso para {table}.")


def seed_sample_data(mysql_conn):
    """Insere dados iniciais de exemplo/modelo para a estrutura do SIGPLAN no MySQL."""
    print("[INFO] Inserindo dados de exemplo para o SIGPLAN no MySQL...")
    cursor = mysql_conn.cursor()

    # 1. Execução
    cursor.execute("TRUNCATE TABLE tb_sigplan_execucao")
    exec_data = [
        ("001", "101", "SEF", "Central", 1500000.00, 2000000.00, 0, "2026-03-01"),
        ("001", "102", "SEF", "Sul de Minas", 800000.00, 1000000.00, 0, "2026-03-01"),
        ("001", "000", "SEF", "TOTAL", 2300000.00, 3000000.00, 1, "2026-03-01"),
        ("002", "201", "SEE", "Metropolitana", 4500000.00, 5000000.00, 0, "2026-03-01"),
        ("002", "000", "SEE", "TOTAL", 4500000.00, 5000000.00, 1, "2026-03-01"),
    ]
    cursor.executemany("""
        INSERT INTO tb_sigplan_execucao 
        (programa_cod, acao_cod, uo_cod, regiao, orcamentario_executado, orcamentario_programado_ppag, is_total, emitido_em)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    """, exec_data)

    # 2. Localizadores
    cursor.execute("TRUNCATE TABLE tb_sigplan_localizadores")
    loc_data = [
        ("3106200", "Belo Horizonte", "REG01", "Central", 0),
        ("3170208", "Uberlândia", "REG02", "Triângulo Mineiro", 0),
        ("3136702", "Juiz de Fora", "REG03", "Zona da Mata", 0),
        ("3143302", "Montes Claros", "REG04", "Norte de Minas", 0),
    ]
    cursor.executemany("""
        INSERT INTO tb_sigplan_localizadores
        (municipio_ibge_cod, municipio, regiao_geografica_cod, regiao_geografica_desc, is_deleted_localizador)
        VALUES (%s, %s, %s, %s, %s)
    """, loc_data)

    # 3. Programas
    cursor.execute("TRUNCATE TABLE tb_sigplan_programas")
    prog_data = [
        ("001", "ODS 8 - Trabalho Decente e Crescimento Econômico", "Gestão Fiscal Transparente", "Secretaria de Estado de Fazenda", 0),
        ("002", "ODS 4 - Educação de Qualidade", "Melhoria da Infraestrutura Escolar", "Secretaria de Estado de Educação", 0),
    ]
    cursor.executemany("""
        INSERT INTO tb_sigplan_programas
        (programa_cod, ods_titulo, ods_subtitulo, uo_programa_nome, is_deleted_programa)
        VALUES (%s, %s, %s, %s, %s)
    """, prog_data)

    # 4. Ações
    cursor.execute("TRUNCATE TABLE tb_sigplan_acoes")
    acoes_data = [
        ("001", "101", "SEF", "Administração Geral"),
        ("001", "102", "SEF", "Gestão Fiscal e Tributária"),
        ("002", "201", "SEE", "Educação Básica"),
    ]
    cursor.executemany("""
        INSERT INTO tb_sigplan_acoes
        (programa_cod, acao_cod, uo_acao_cod, funcao_desc)
        VALUES (%s, %s, %s, %s)
    """, acoes_data)

    print("[OK] Carga de dados de exemplo efetuada com sucesso no MySQL!")


def main():
    parser = argparse.ArgumentParser(description="Script de Migração dos Dados do SIGPLAN para MySQL")
    parser.add_argument("--json-dump", help="Caminho para arquivo JSON de dump dos dados")
    parser.add_argument("--seed-sample", action="store_true", help="Inserir dados de exemplo no MySQL")
    parser.add_argument("--create-tables-only", action="store_true", help="Apenas criar a estrutura das tabelas no MySQL")
    args = parser.parse_args()

    try:
        mysql_conn = connect_mysql()
    except Exception as e:
        print(f"[ERRO] Não foi possível conectar ao MySQL local ({e}).")
        sys.exit(1)

    create_schema(mysql_conn)

    if args.create_tables_only:
        print("Done.")
        sys.exit(0)

    if args.seed_sample:
        seed_sample_data(mysql_conn)
        sys.exit(0)

    if args.json_dump:
        import_from_json(args.json_dump, mysql_conn)
    else:
        ss_conn, conn_type = fetch_from_sql_server()
        if ss_conn:
            migrate_from_sql_server(ss_conn, conn_type, mysql_conn)
        else:
            print("[AVISO] SQL Server indisponível e nenhum --json-dump ou --seed-sample foi fornecido.")
            print("Executando carga de dados de exemplo por padrão...")
            seed_sample_data(mysql_conn)


if __name__ == "__main__":
    main()
