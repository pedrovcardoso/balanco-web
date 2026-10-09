"""Run both SIGPLAN ingestion flows against the configured MySQL database."""

from __future__ import annotations


def main() -> None:
    # Extração dos dados cadastrais e indicadores.
    from datetime import datetime, timezone
    from pathlib import Path
    import os
    import sys
    import time
    import unicodedata

    import pandas as pd
    import requests
    from requests.adapters import HTTPAdapter
    from urllib3.util.retry import Retry


    def locate_backend_root():
        for directory in Path(__file__).resolve().parents:
            for candidate in (directory, directory / "backend"):
                if (candidate / "app" / "core" / "config.py").is_file() and (
                    candidate / "scripts" / "sigplan_data" / "sigplan_local_db.py"
                ).is_file():
                    return candidate
        raise RuntimeError("Não foi possível localizar a pasta backend do projeto.")


    BACKEND_ROOT = locate_backend_root()
    sys.path.insert(0, str(BACKEND_ROOT))
    sys.path.insert(0, str(BACKEND_ROOT / "scripts" / "sigplan_data"))
    from sigplan_local_db import connect_mysql, fetch_rows, replace_table


    class BooleanType:
        pass


    class DoubleType:
        pass


    class FloatType:
        pass


    class IntegerType:
        pass


    class StringType:
        pass


    RAW_LOCAL_DIR = BACKEND_ROOT / "data" / "sigplan" / "raw"
    TABLE_NAMES = {
        "acoes_planejamento": "tb_sigplan_acoes",
        "indicadores_planejamento": "tb_sigplan_indicadores_planejamento",
        "localizadores_todos_planejamento": "tb_sigplan_localizadores",
        "programas_planejamento": "tb_sigplan_programas",
    }
    REQUEST_TIMEOUT = (30, 180)
    REPORT_WAIT_SECONDS = 2
    FAIL_ON_MISSING_COLUMNS = False

    RAW_LOCAL_DIR.mkdir(parents=True, exist_ok=True)
    print(f"Backend: {BACKEND_ROOT}")
    print(f"Diretório bruto: {RAW_LOCAL_DIR}")

    RESOURCES = {
        "acoes_planejamento": {
            "api_url": "https://www.sigplan.mg.gov.br/v4/Relatorios/base_acoes_planejamento.asp?tipo_saida=2&mostraSQL=N&periodo=undefined",
            "download_url": "https://www.sigplan.mg.gov.br/BasesTxt/acoes_planejamento.txt",
            "schema_mapping": {
                "Código do Programa": ("programa_cod", IntegerType()),
                "Nome do Programa": ("programa_desc", StringType()),
                "Código da Área Temática": ("area_tematica_cod", StringType()),
                "Área Temática": ("area_tematica_desc", StringType()),
                "Exclusão Lógica do Programa": ("is_deleted_programa", BooleanType()),
                "Programa Novo": ("is_new_programa", BooleanType()),
                "Justificativa de Inclusão ou Exclusão do Programa": ("justificativa_is_new_programa", StringType()),
                "Código da Unidade Orçamentária Responsável pelo Programa": ("uo_programa_cod", IntegerType()),
                "Unidade Orçamentária Responsável pelo Programa": ("uo_programa_nome", StringType()),
                "Código da Unidade Orçamentária Responsável pela Ação": ("uo_acao_cod", IntegerType()),
                "Unidade Orçamentária Responsável pela Ação": ("uo_acao_nome", StringType()),
                "Código da Função": ("funcao_cod", IntegerType()),
                "Função": ("funcao_desc", StringType()),
                "Código da Subfunção": ("subfuncao_cod", IntegerType()),
                "Subfunção": ("subfuncao_desc", StringType()),
                "Código do Tipo de Ação": ("identificador_tipo_acao_cod", IntegerType()),
                "Tipo de Ação": ("identificador_tipo_acao_desc", StringType()),
                "Código da Ação": ("acao_cod", IntegerType()),
                "Título da Ação": ("acao_desc", StringType()),
                "Código do Identificador de Ação Governamental (IAG)": ("iag_cod", IntegerType()),
                "Identificador de Ação Governamental (IAG)": ("iag_desc", StringType()),
                "Código do Projeto Estratégico": ("projeto_estrategico_cod", StringType()),
                "Projeto Estratégico": ("projeto_estrategico", StringType()),
                "Exclusão Lógica da Ação": ("is_deleted_acao", BooleanType()),
                "Nova Ação": ("is_new_acao", BooleanType()),
                "Justificativa de Inclusão ou Exclusão da Ação": ("justificativa_is_new_acao", StringType()),
                "Transferida para o SISOR": ("is_transferida_sisor", BooleanType()),
                "Unidade Administrativa Responsável pela Ação": ("ua_acao_nome", StringType()),
                "Base legal": ("base_legal", StringType()),
                "Finalidade da Ação": ("acao_finalidade", StringType()),
                "Descrição da Ação": ("acao_descricao", StringType()),
                "Código do Público-alvo": ("publico_alvo_cod", IntegerType()),
                "Público-Alvo": ("publico_alvo_desc", StringType()),
                "Código do Produto": ("produto_cod", IntegerType()),
                "Produto": ("produto_desc", StringType()),
                "Especificação do Produto": ("produto_especificacao", StringType()),
                "Código da Unidade de Medida do Produto": ("produto_unidade_medida_cod", IntegerType()),
                "Unidade de Medida do Produto": ("produto_unidade_medida_desc", StringType()),
                "Previsão Orçamentária 2024": ("vr_meta_orcamentaria_ano0", DoubleType()),
                "Previsão Orçamentária 2025": ("vr_meta_orcamentaria_ano1", DoubleType()),
                "Previsão Orçamentária 2026": ("vr_meta_orcamentaria_ano2", DoubleType()),
                "Previsão Orçamentária 2027": ("vr_meta_orcamentaria_ano3", DoubleType()),
                "Previsão Física 2024": ("vr_meta_fisica_ano0", IntegerType()),
                "Previsão Física 2025": ("vr_meta_fisica_ano1", IntegerType()),
                "Previsão Física 2026": ("vr_meta_fisica_ano2", IntegerType()),
                "Previsão Física 2027": ("vr_meta_fisica_ano3", IntegerType()),
                "Ação Transposta": ("is_acao_transposta", BooleanType()),
                "Setor de Governo": ("setor_governo", StringType()),
            },
        },
        "indicadores_planejamento": {
            "api_url": "https://www.sigplan.mg.gov.br/v4/Relatorios/base_indicadores_planejamento.asp?tipo_saida=2&mostraSQL=N&periodo=undefined",
            "download_url": "https://www.sigplan.mg.gov.br/BasesTxt/indicadores_planejamento.txt",
            "schema_mapping": {
                "Código do Programa": ("programa_cod", IntegerType()),
                "Nome do Programa": ("programa_nome", StringType()),
                "Exclusão Lógica do Programa": ("is_deleted_programa", BooleanType()),
                "Indicador": ("indicador", StringType()),
                "Exclusão Lógica do Indicador": ("is_deleted_indicador", BooleanType()),
                "Unidade de Medida": ("unidade_de_medida", StringType()),
                "Índice de Referência": ("indice_de_referencia", DoubleType()),
                "Em apuração? (Índice de Referência)": ("is_em_apuracao_indice_de_referencia", BooleanType()),
                "Data de Apuração": ("dt_apuracao", StringType()),
                "Previsão para 2024": ("previsao_para_ano0", DoubleType()),
                "Em apuração? (2024)": ("is_em_apuracao_ano0", BooleanType()),
                "Previsão para 2025": ("previsao_para_ano1", DoubleType()),
                "Em apuração? (2025)": ("is_em_apuracao_ano1", BooleanType()),
                "Previsão para 2026": ("previsao_para_ano2", DoubleType()),
                "Em apuração? (2026)": ("is_em_apuracao_ano2", BooleanType()),
                "Previsão para 2027": ("previsao_para_ano3", DoubleType()),
                "Em apuração? (2027)": ("is_em_apuracao_ano3", BooleanType()),
                "Fonte": ("fonte", StringType()),
                "Periodicidade": ("periodicidade", StringType()),
                "Base Geográfica": ("base_geografica", StringType()),
                "Fórmula de Cálculo": ("formula_de_calculo", StringType()),
                "Justificativa do Status em apuração da(s) Previsão(es) do(s) Índice(s)": ("justificativa_status_apuracao_previsoes", StringType()),
                "Justificativa do Status em apuração do Índice de Referência": ("justificativa_status_apuracao_indice_ref", StringType()),
                "Data Alteração": ("updated_at", StringType()),
                "Indicador Novo?": ("is_indicador_new", BooleanType()),
                "Polaridade": ("polaridade", StringType()),
            },
        },
        "localizadores_todos_planejamento": {
            "api_url": "https://www.sigplan.mg.gov.br/v4/Relatorios/base_localizadores_planejamento.asp?tipo_saida=2&mostraSQL=N&tipo_rel=5&periodo=undefined",
            "download_url": "https://www.sigplan.mg.gov.br/BasesTxt/localizadores_Todos_planejamento.txt",
            "schema_mapping": {
                "Código do Programa": ("programa_cod", IntegerType()),
                "Nome do Programa": ("programa_desc", StringType()),
                "Código da Área Temática": ("area_tematica_cod", StringType()),
                "Área Temática": ("area_tematica_desc", StringType()),
                "Exclusão Lógica do Programa": ("is_deleted_programa", BooleanType()),
                "Código da Ação": ("acao_cod", IntegerType()),
                "Título da Ação": ("acao_desc", StringType()),
                "Código do Identificador de Ação Governamental (IAG)": ("iag_cod", IntegerType()),
                "Identificador de Ação Governamental (IAG)": ("iag_desc", StringType()),
                "Código do Projeto Estratégico": ("projeto_estrategico_cod", StringType()),
                "Projeto Estratégico": ("projeto_estrategico_desc", StringType()),
                "Código da Função": ("funcao_cod", IntegerType()),
                "Função": ("funcao_desc", StringType()),
                "Código da Subfunção": ("subfuncao_cod", IntegerType()),
                "SubFunção": ("subfuncao_desc", StringType()),
                "Código da Unidade Orçamentária Responsável pela Ação": ("uo_acao_cod", IntegerType()),
                "Unidade Orçamentária Responsável pela Ação": ("uo_acao_nome", StringType()),
                "Exclusão Lógica da Ação": ("is_deleted_acao", BooleanType()),
                "Código do Localizador": ("localizador_cod", StringType()),
                "Exclusão Lógica do Localizador": ("is_deleted_localizador", BooleanType()),
                "Código da Região Geográfica Intermediária": ("regiao_geografica_cod", IntegerType()),
                "Região Geográfica Intermediária": ("regiao_geografica_desc", StringType()),
                "Código do Município IBGE": ("municipio_ibge_cod", IntegerType()),
                "Código do Município Sigplan": ("municipio_sigplan_cod", IntegerType()),
                "Município": ("municipio", StringType()),
                "Previsão Orçamentária 2024": ("vr_meta_orcamentaria_ano0", DoubleType()),
                "Previsão Física 2024": ("vr_meta_fisica_ano0", IntegerType()),
                "Previsão Orçamentária 2025": ("vr_meta_orcamentaria_ano1", DoubleType()),
                "Previsão Física 2025": ("vr_meta_fisica_ano1", IntegerType()),
                "Previsão Orçamentária 2026": ("vr_meta_orcamentaria_ano2", DoubleType()),
                "Previsão Física 2026": ("vr_meta_fisica_ano2", IntegerType()),
                "Previsão Orçamentária 2027": ("vr_meta_orcamentaria_ano3", DoubleType()),
                "Previsão Física 2027": ("vr_meta_fisica_ano3", IntegerType()),
            },
        },
        "programas_planejamento": {
            "api_url": "https://www.sigplan.mg.gov.br/v4/Relatorios/base_programas_planejamento.asp?tipo_saida=2&mostraSQL=N&periodo=undefined",
            "download_url": "https://www.sigplan.mg.gov.br/BasesTxt/programas_planejamento.txt",
            "schema_mapping": {
                "Código do Programa": ("programa_cod", IntegerType()),
                "Nome do Programa": ("programa_desc", StringType()),
                "Exclusão Lógica do Programa": ("is_deleted_programa", BooleanType()),
                "Programa Novo": ("is_new_programa", BooleanType()),
                "Código da Área Temática": ("area_tematica_cod", StringType()),
                "Área Temática": ("area_tematica_desc", StringType()),
                "Código do Objetivo Estratégico": ("objetivo_estrategico_cod", IntegerType()),
                "Objetivo Estratégico": ("objetivo_estrategico_desc", StringType()),
                "Código da Diretriz Estratégica": ("diretriz_estrategica_cod", StringType()),
                "Diretriz Estratégica": ("diretriz_estrategica_desc", StringType()),
                "Justificativa de Inclusão ou Exclusão do Programa": ("justificativa_is_new_programa", StringType()),
                "Código do Órgão Responsável pelo Programa": ("orgao_programa_cod", IntegerType()),
                "Órgão Responsável pelo Programa": ("orgao_programa_nome", StringType()),
                "Código da Unidade Orçamentária Responsável pelo Programa": ("uo_programa_cod", IntegerType()),
                "Unidade Orçamentária Responsável pelo Programa": ("uo_programa_nome", StringType()),
                "Objetivo": ("objetivo", StringType()),
                "Justificativa": ("justificativa", StringType()),
                "Tipo de Programa": ("tipo_de_programa", StringType()),
                "Horizonte Temporal": ("horizonte_temporal", StringType()),
                "Estratégia de Implementação": ("estrategia_de_implementacao", StringType()),
                "Unidade Administrativa Responsável pelo Programa": ("ua_programa_nome", StringType()),
                "Previsão Orçamentária 2024": ("vr_meta_orcamentaria_ano0", DoubleType()),
                "Previsão Orçamentária 2025": ("vr_meta_orcamentaria_ano1", DoubleType()),
                "Previsão Orçamentária 2026": ("vr_meta_orcamentaria_ano2", DoubleType()),
                "Previsão Orçamentária 2027": ("vr_meta_orcamentaria_ano3", DoubleType()),
                "Programa Transposto": ("is_programa_transposto", BooleanType()),
                "Causas": ("causas", StringType()),
                "Título do Objetivo de Desenvolvimento Sustentável": ("ods_titulo", StringType()),
                "Subtítulo do Objetivo de Desenvolvimento Sustentável": ("ods_subtitulo", StringType()),
            },
        },
    }

    def build_http_session() -> requests.Session:
        retry = Retry(
            total=3,
            connect=3,
            read=3,
            backoff_factor=2,
            status_forcelist=(429, 500, 502, 503, 504),
            allowed_methods=frozenset(["GET"]),
        )
        session = requests.Session()
        session.headers.update({"User-Agent": "Mozilla/5.0 SIGPLAN-Local-Pipeline/1.0"})
        session.mount("https://", HTTPAdapter(max_retries=retry))
        return session


    HTTP = build_http_session()


    def normalize_header(value: str) -> str:
        return unicodedata.normalize("NFC", value.replace("\ufeff", "").strip())


    def local_raw_path(name: str) -> Path:
        return RAW_LOCAL_DIR / f"{name}.txt"


    def parse_boolean(value):
        if pd.isna(value):
            return None
        normalized = str(value).strip().upper()
        if normalized in {"SIM", "TRUE", "1", "S", "EM APURAÇÃO"}:
            return True
        if normalized in {"NÃO", "NAO", "FALSE", "0", "N"}:
            return False
        return None


    def parse_decimal(value):
        if pd.isna(value):
            return None
        normalized = "".join(str(value).split())
        if "," in normalized:
            normalized = normalized.replace(".", "").replace(",", ".")
        return normalized or None


    def cast_column(column: pd.Series, data_type):
        clean = column.astype("string").str.strip()
        clean = clean.mask(clean == "", pd.NA)
        if isinstance(data_type, BooleanType):
            return clean.map(parse_boolean).astype("boolean")
        if isinstance(data_type, (DoubleType, FloatType, IntegerType)):
            numeric = pd.to_numeric(clean.map(parse_decimal), errors="coerce")
            if isinstance(data_type, IntegerType):
                numeric = numeric.map(
                    lambda value: pd.NA if pd.isna(value) else int(value)
                )
                return numeric.astype("Int64")
            return numeric.astype("Float64")
        return clean

    def trigger_and_download(name: str, config: dict) -> dict:
        print(f"[EXTRAÇÃO] {name}")

        trigger = HTTP.get(config["api_url"], timeout=REQUEST_TIMEOUT)
        trigger.raise_for_status()
        if "gerado com sucesso" not in trigger.text.lower():
            excerpt = trigger.text[:300].replace("\n", " ")
            raise RuntimeError(f"SIGPLAN não confirmou a geração. Resposta: {excerpt}")

        time.sleep(REPORT_WAIT_SECONDS)
        destination = local_raw_path(name)
        temporary = destination.with_suffix(".part")

        with HTTP.get(config["download_url"], stream=True, timeout=REQUEST_TIMEOUT) as response:
            response.raise_for_status()
            content_type = response.headers.get("Content-Type", "").lower()
            with open(temporary, "wb") as output:
                for chunk in response.iter_content(chunk_size=1024 * 1024):
                    if chunk:
                        output.write(chunk)

        size = temporary.stat().st_size
        if size == 0:
            temporary.unlink(missing_ok=True)
            raise RuntimeError("O arquivo baixado está vazio.")

        with open(temporary, "rb") as source:
            sample = source.read(4096)
        if b"|" not in sample:
            temporary.unlink(missing_ok=True)
            raise RuntimeError(
                f"Conteúdo não parece ser delimitado por '|'. Content-Type: {content_type}"
            )

        os.replace(temporary, destination)
        result = {"local_path": str(destination), "bytes": size}
        print(f"  OK: {size:,} bytes em {destination}")
        return result

    def read_raw_file(name: str) -> pd.DataFrame:
        dataframe = pd.read_csv(
            local_raw_path(name),
            header=0,
            sep="|",
            encoding="cp1252",
            dtype="string",
            keep_default_na=False,
            on_bad_lines="error",
        )
        normalized = [normalize_header(str(column)) for column in dataframe.columns]
        if len(normalized) != len(set(normalized)):
            raise ValueError("Há cabeçalhos duplicados após a normalização.")
        dataframe.columns = normalized
        return dataframe


    def transform_resource(dataframe: pd.DataFrame, mapping: dict, resource_name: str):
        expected = [normalize_header(column) for column in mapping]
        available = set(dataframe.columns)
        missing = [column for column in expected if column not in available]

        if missing and FAIL_ON_MISSING_COLUMNS:
            raise ValueError(f"Colunas ausentes em {resource_name}: {missing}")
        if missing:
            print(f"  AVISO: colunas ausentes: {missing}")

        transformed = {}
        for original, (target, data_type) in mapping.items():
            original = normalize_header(original)
            source = (
                dataframe[original]
                if original in available
                else pd.Series(pd.NA, index=dataframe.index, dtype="string")
            )
            transformed[target] = cast_column(source, data_type)

        result = pd.DataFrame(transformed, index=dataframe.index)
        result["_ingestion_utc"] = datetime.now(timezone.utc).replace(tzinfo=None)
        result["_source_file"] = f"{resource_name}.txt"
        return result


    def save_mysql(dataframe: pd.DataFrame, resource_name: str) -> int:
        table_name = TABLE_NAMES[resource_name]
        row_count = replace_table(dataframe, table_name)
        print(f"  OK: tabela {table_name} gravada com {row_count:,} linhas")
        return row_count

    print("Pandas:", pd.__version__)
    print("Backend:", BACKEND_ROOT)
    print("Diretório bruto existe:", RAW_LOCAL_DIR.is_dir())
    print("Diretório bruto gravável:", os.access(RAW_LOCAL_DIR, os.W_OK))

    connection = connect_mysql()
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT DATABASE() AS banco, 1 AS conexao_ok")
            print("MySQL:", cursor.fetchone())
    finally:
        connection.close()

    assert os.access(RAW_LOCAL_DIR, os.W_OK), "Sem permissão de escrita no diretório bruto."
    print("Diagnóstico concluído.")

    def run_pipeline(resource_names=None):
        selected = resource_names or list(RESOURCES.keys())
        invalid = [name for name in selected if name not in RESOURCES]
        if invalid:
            raise KeyError(f"Recursos inexistentes: {invalid}")

        results = []
        started = datetime.now(timezone.utc)

        for position, name in enumerate(selected, start=1):
            print(f"\n=== [{position}/{len(selected)}] {name} ===")
            try:
                config = RESOURCES[name]
                download = trigger_and_download(name, config)
                raw = read_raw_file(name)
                transformed = transform_resource(raw, config["schema_mapping"], name)
                rows = save_mysql(transformed, name)
                results.append((name, "SUCESSO", rows, download["bytes"], None))
            except Exception as exc:
                results.append((name, "ERRO", None, None, str(exc)))
                print(f"  ERRO: {type(exc).__name__}: {exc}")

        summary = pd.DataFrame(
            results,
            columns=["recurso", "status", "linhas", "bytes", "erro"],
        )
        print(summary.to_string(index=False))

        failures = [result for result in results if result[1] == "ERRO"]
        elapsed = (datetime.now(timezone.utc) - started).total_seconds()
        print(
            f"Tempo total: {elapsed:.1f}s | Sucessos: {len(results) - len(failures)} "
            f"| Erros: {len(failures)}"
        )
        if failures:
            raise RuntimeError(
                f"Pipeline finalizada com erro em: {[result[0] for result in failures]}"
            )
        return summary

    run_pipeline()

    for table_name in TABLE_NAMES.values():
        count = fetch_rows(f"SELECT COUNT(*) AS total FROM `{table_name}`")[0]["total"]
        print(f"{table_name}: {count:,} linhas")

    sample = fetch_rows("SELECT * FROM `tb_sigplan_acoes` LIMIT 5")
    print("\nAmostra de tb_sigplan_acoes:")
    print(pd.DataFrame(sample).to_string(index=False))

    # Coleta da execução regionalizada.
    from pathlib import Path
    from urllib.parse import urlencode
    from datetime import datetime
    from concurrent.futures import ThreadPoolExecutor, as_completed
    import threading
    import hashlib
    import html
    import random
    import re
    import sys
    import time

    import pandas as pd
    import requests
    from bs4 import BeautifulSoup
    from tqdm.auto import tqdm
    from requests.adapters import HTTPAdapter


    def locate_backend_root():
        for directory in Path(__file__).resolve().parents:
            for candidate in (directory, directory / "backend"):
                if (candidate / "app" / "core" / "config.py").is_file() and (
                    candidate / "scripts" / "sigplan_data" / "sigplan_local_db.py"
                ).is_file():
                    return candidate
        raise RuntimeError("Não foi possível localizar a pasta backend do projeto.")


    BACKEND_ROOT = locate_backend_root()
    sys.path.insert(0, str(BACKEND_ROOT))
    sys.path.insert(0, str(BACKEND_ROOT / "scripts" / "sigplan_data"))
    from sigplan_local_db import fetch_rows, replace_table

    ANO = 2026
    MES_BIMESTRE = 12
    BASE_URL = "https://www.sigplan.mg.gov.br/v3/RelatoriosPPAG5/RegionalizacaoAcao.asp"

    SOURCE_TABLE = "tb_sigplan_localizadores"
    TARGET_TABLE = "tb_sigplan_execucao"
    ERROR_TABLE = "tb_sigplan_execucao_erros"

    BASE_FILES = BACKEND_ROOT / "data" / "sigplan" / "regionalizacao_acao" / "ano=2026"
    RAW_DIR = BASE_FILES / "html"
    ERROS_DIR = BASE_FILES / "erros"
    for folder in (RAW_DIR, ERROS_DIR):
        folder.mkdir(parents=True, exist_ok=True)

    MAX_WORKERS = 10
    INTERVALO_MIN_SEG = 0.05
    INTERVALO_MAX_SEG = 0.20
    TIMEOUT_CONEXAO_SEG = 10
    TIMEOUT_LEITURA_SEG = 20
    MAX_TENTATIVAS = 5
    REPROCESSAR = False

    print("Origem:", SOURCE_TABLE)
    print("Destino:", TARGET_TABLE)
    print("Arquivos locais:", BASE_FILES)

    program_rows = fetch_rows(f"""
        SELECT DISTINCT CAST(programa_cod AS UNSIGNED) AS programa_cod
        FROM `{SOURCE_TABLE}`
        WHERE programa_cod IS NOT NULL
          AND COALESCE(is_deleted_programa, 0) = 0
          AND COALESCE(is_deleted_acao, 0) = 0
        ORDER BY programa_cod
    """)

    PROGRAMAS = [int(row["programa_cod"]) for row in program_rows]

    print(f"Quantidade de programas: {len(PROGRAMAS)}")
    print("Amostra:", PROGRAMAS[:20])

    if not PROGRAMAS:
        raise RuntimeError(f"Nenhum programa encontrado em {SOURCE_TABLE}")

    def criar_sessao():
        adapter = HTTPAdapter(
            max_retries=0,
            pool_connections=MAX_WORKERS,
            pool_maxsize=MAX_WORKERS,
        )
        session = requests.Session()
        session.mount("https://", adapter)
        session.mount("http://", adapter)
        session.headers.update({
            "User-Agent": "Mozilla/5.0 (compatible; SIGPLAN-Fabric/1.0)",
            "Accept": "text/html,application/xhtml+xml",
            "Accept-Language": "pt-BR,pt;q=0.9",
            "Connection": "keep-alive",
        })
        return session

    THREAD_LOCAL = threading.local()


    def obter_sessao():
        if not hasattr(THREAD_LOCAL, "session"):
            THREAD_LOCAL.session = criar_sessao()
        return THREAD_LOCAL.session


    def montar_url(programa):
        params = {
            "hPRGAno": ANO,
            "hPRGCod": f"{int(programa):04d}",
            "hTipo": "",
            "hACACodPPA": "",
            "MesBimestre": MES_BIMESTRE,
        }
        return f"{BASE_URL}?{urlencode(params)}"


    def baixar_html(programa):
        url = montar_url(programa)
        ultimo_erro = None

        for tentativa in range(1, MAX_TENTATIVAS + 1):
            try:
                resposta = obter_sessao().get(
                    url,
                    timeout=(TIMEOUT_CONEXAO_SEG, TIMEOUT_LEITURA_SEG),
                )
                resposta.raise_for_status()

                texto = resposta.content.decode("cp1252", errors="replace")
                if "EXECUÇÃO REGIONALIZADA" not in texto.upper():
                    raise ValueError("Resposta sem o título esperado do relatório")

                caminho = RAW_DIR / f"programa_{int(programa):04d}.html"
                caminho.write_text(texto, encoding="utf-8")
                return texto, url, tentativa

            except Exception as exc:
                ultimo_erro = exc
                if tentativa < MAX_TENTATIVAS:
                    time.sleep(tentativa)

        raise RuntimeError(
            f"Programa {int(programa):04d} falhou após {MAX_TENTATIVAS} tentativas: "
            f"{ultimo_erro!r}"
        )

    def limpar_texto(valor):
        if valor is None:
            return None
        valor = html.unescape(str(valor)).replace("\xa0", " ")
        valor = re.sub(r"\s+", " ", valor).strip()
        return valor or None


    def separar_codigo_descricao(valor):
        valor = limpar_texto(valor)
        if not valor:
            return None, None
        match = re.match(r"^(\d+)\s*-\s*(.*?)$", valor)
        return (match.group(1), match.group(2)) if match else (None, valor)


    def numero_br(valor):
        valor = limpar_texto(valor)
        if valor in (None, "", "-", "--"):
            return None
        valor = valor.replace("R$", "").replace("%", "").replace(" ", "")
        valor = valor.replace(".", "").replace(",", ".")
        try:
            return float(valor)
        except ValueError:
            return None


    def valor_apos_rotulo(tabela, rotulo):
        if tabela is None:
            return None
        alvo = limpar_texto(rotulo).lower()
        for tr in tabela.find_all("tr"):
            celulas = tr.find_all(["td", "th"], recursive=False)
            textos = [limpar_texto(c.get_text(" ", strip=True)) for c in celulas]
            for posicao, texto in enumerate(textos):
                if texto and alvo in texto.lower():
                    for seguinte in textos[posicao + 1:]:
                        if seguinte:
                            return seguinte
        return None


    def encontrar_tabela_seguinte(elemento, predicado, limite=8):
        atual = elemento
        for _ in range(limite):
            atual = atual.find_next("table")
            if atual is None:
                return None
            if predicado(atual):
                return atual
        return None

    def extrair_relatorio(html_texto, programa_solicitado, url):
        soup = BeautifulSoup(html_texto, "html.parser")
        texto_pagina = limpar_texto(soup.get_text(" ", strip=True)) or ""

        programa_valor = None
        for strong in soup.find_all(["strong", "b"]):
            if limpar_texto(strong.get_text(" ", strip=True)) == "Programa:":
                td = strong.find_parent("td")
                proximo = td.find_next_sibling("td") if td else None
                programa_valor = limpar_texto(proximo.get_text(" ", strip=True)) if proximo else None
                break

        programa_cod_html, programa_desc = separar_codigo_descricao(programa_valor)
        programa_cod = (programa_cod_html or str(programa_solicitado)).zfill(4)
        ano_match = re.search(r"Ano de Referência:\s*(\d{4})", texto_pagina, re.I)
        emitido_match = re.search(r"Emitido em:\s*(\d{1,2}/\d{1,2}/\d{4})", texto_pagina, re.I)
        emitido_em = None
        if emitido_match:
            emitido_em = datetime.strptime(emitido_match.group(1), "%d/%m/%Y")

        registros = []
        for tabela_acao in soup.find_all("table"):
            texto_acao = limpar_texto(tabela_acao.get_text(" ", strip=True)) or ""
            if not re.match(r"^Ação:\s*\d+\s*-", texto_acao, re.I):
                continue

            m_acao = re.search(r"Ação:\s*(\d+)\s*-\s*(.*?)(?=\s+IAG:|$)", texto_acao, re.I)
            m_iag = re.search(r"IAG:\s*(\d+)", texto_acao, re.I)
            if not m_acao:
                continue

            acao_cod = m_acao.group(1).zfill(4)
            acao_desc = limpar_texto(m_acao.group(2))
            iag_cod = int(m_iag.group(1)) if m_iag else None

            tabela_meta = tabela_acao.find_next("table")
            uo_valor = valor_apos_rotulo(tabela_meta, "Unidade Orçamentária Responsável:")
            ua_nome = valor_apos_rotulo(tabela_meta, "Unidade Administrativa Responsável:")
            publico_alvo = valor_apos_rotulo(tabela_meta, "Público Alvo:")
            produto = valor_apos_rotulo(tabela_meta, "Produto (unidade de medida):")
            uo_cod, uo_desc = separar_codigo_descricao(uo_valor)

            tabela_cabecalho = encontrar_tabela_seguinte(
                tabela_meta,
                lambda t: (
                    "Programado PPAG" in (limpar_texto(t.get_text(" ", strip=True)) or "")
                    and "Orçamentário" in (limpar_texto(t.get_text(" ", strip=True)) or "")
                ),
                limite=6,
            )
            tabela_valores = tabela_cabecalho.find_next("table") if tabela_cabecalho else None
            if tabela_valores is None:
                continue

            for tr in tabela_valores.find_all("tr"):
                celulas = tr.find_all("td", recursive=False)
                if len(celulas) != 9:
                    continue
                valores = [limpar_texto(c.get_text(" ", strip=True)) for c in celulas]
                regiao = valores[0]
                if not regiao or regiao.lower() == "regiões" or regiao.lower().startswith("fonte:"):
                    continue

                chave = "|".join([
                    str(int(ano_match.group(1)) if ano_match else ANO),
                    programa_cod,
                    acao_cod,
                    uo_cod or "",
                    regiao,
                ])

                registros.append({
                    "chave_relatorio": hashlib.sha256(chave.encode("utf-8")).hexdigest(),
                    "ano": int(ano_match.group(1)) if ano_match else ANO,
                    "mes_bimestre": MES_BIMESTRE,
                    "programa_cod": int(programa_cod),
                    "programa_desc": programa_desc,
                    "acao_cod": int(acao_cod),
                    "acao_desc": acao_desc,
                    "iag_cod": iag_cod,
                    "uo_cod": int(uo_cod) if uo_cod else None,
                    "uo_desc": uo_desc,
                    "ua_nome": ua_nome,
                    "publico_alvo": publico_alvo,
                    "produto_unidade_medida": produto,
                    "regiao": regiao,
                    "is_total": regiao.lower() == "total",
                    "fisico_programado_ppag": numero_br(valores[1]),
                    "fisico_executado": numero_br(valores[2]),
                    "fisico_execucao_pct": numero_br(valores[3]),
                    "fisico_analise_vertical_pct": numero_br(valores[4]),
                    "orcamentario_programado_ppag": numero_br(valores[5]),
                    "orcamentario_executado": numero_br(valores[6]),
                    "orcamentario_execucao_pct": numero_br(valores[7]),
                    "orcamentario_analise_vertical_pct": numero_br(valores[8]),
                    "emitido_em": emitido_em,
                    "url_origem": url,
                    "dt_carga": datetime.now(),
                })

        return pd.DataFrame(registros)

    def executar_programa(programa):
        html_path = RAW_DIR / f"programa_{int(programa):04d}.html"
        url = montar_url(programa)

        if html_path.exists() and not REPROCESSAR:
            html_texto = html_path.read_text(encoding="utf-8")
            origem = "cache"
            tentativas_usadas = 0
        else:
            html_texto, url, tentativas_usadas = baixar_html(programa)
            origem = "api"

        resultado = extrair_relatorio(html_texto, programa, url)
        time.sleep(random.uniform(INTERVALO_MIN_SEG, INTERVALO_MAX_SEG))
        return programa, resultado, origem, tentativas_usadas


    resultados = []
    erros = []
    sucessos = []

    with ThreadPoolExecutor(max_workers=MAX_WORKERS, thread_name_prefix="sigplan") as executor:
        futuros = {
            executor.submit(executar_programa, programa): programa
            for programa in PROGRAMAS
        }

        with tqdm(total=len(futuros), desc=f"Consultando programas ({MAX_WORKERS} simultâneos)") as progresso:
            for futuro in as_completed(futuros):
                programa = futuros[futuro]
                try:
                    _, resultado, origem, tentativas_usadas = futuro.result()

                    if not resultado.empty:
                        resultados.append(resultado)
                        sucessos.append({
                            "programa_cod": programa,
                            "origem": origem,
                            "tentativas_usadas": tentativas_usadas,
                            "quantidade_linhas": len(resultado),
                        })
                    else:
                        erros.append({
                            "programa_cod": programa,
                            "url": montar_url(programa),
                            "tipo": "SEM_DADOS",
                            "tentativas_realizadas": tentativas_usadas,
                            "erro": "Nenhuma linha regional encontrada no HTML",
                            "dt_carga": datetime.now(),
                        })
                except Exception as exc:
                    erros.append({
                        "programa_cod": programa,
                        "url": montar_url(programa),
                        "tipo": "ERRO_API_OU_PARSER",
                        "tentativas_realizadas": MAX_TENTATIVAS,
                        "erro": repr(exc),
                        "dt_carga": datetime.now(),
                    })
                finally:
                    progresso.update(1)

    if resultados:
        dados = pd.concat(resultados, ignore_index=True)
        dados = dados.drop_duplicates(subset=["chave_relatorio"], keep="last")
    else:
        dados = pd.DataFrame()

    df_erros = pd.DataFrame(erros)
    df_sucessos = pd.DataFrame(sucessos)

    print(f"Linhas extraídas com sucesso: {len(dados):,}")
    print(f"Programas com sucesso: {len(df_sucessos):,}")
    print(f"Programas com erro ou sem dados: {len(df_erros):,}")

    if not df_erros.empty:
        print("Programas que deram errado:")
        print(df_erros[[
            "programa_cod", "tipo", "tentativas_realizadas", "erro", "url"
        ]].sort_values("programa_cod").to_string(index=False))

    if not dados.empty:
        print(dados.head(20).to_string(index=False))

    RESULT_COLUMNS = [
        "chave_relatorio", "ano", "mes_bimestre", "programa_cod", "programa_desc",
        "acao_cod", "acao_desc", "iag_cod", "uo_cod", "uo_desc", "ua_nome",
        "publico_alvo", "produto_unidade_medida", "regiao", "is_total",
        "fisico_programado_ppag", "fisico_executado", "fisico_execucao_pct",
        "fisico_analise_vertical_pct", "orcamentario_programado_ppag",
        "orcamentario_executado", "orcamentario_execucao_pct",
        "orcamentario_analise_vertical_pct", "emitido_em", "url_origem", "dt_carga",
    ]

    if dados.empty:
        raise RuntimeError(
            "Nenhuma linha regional foi coletada; a tabela MySQL existente será preservada."
        )

    missing_columns = [column for column in RESULT_COLUMNS if column not in dados.columns]
    if missing_columns:
        raise ValueError(f"Colunas ausentes no resultado: {missing_columns}")

    df_resultado = dados[RESULT_COLUMNS].copy()

    COLUNAS_INTEIRAS = ["ano", "mes_bimestre", "programa_cod", "acao_cod", "iag_cod", "uo_cod"]
    COLUNAS_DOUBLE = [
        "fisico_programado_ppag", "fisico_executado", "fisico_execucao_pct",
        "fisico_analise_vertical_pct", "orcamentario_programado_ppag",
        "orcamentario_executado", "orcamentario_execucao_pct",
        "orcamentario_analise_vertical_pct",
    ]
    COLUNAS_TEXTO = [
        "chave_relatorio", "programa_desc", "acao_desc", "uo_desc", "ua_nome",
        "publico_alvo", "produto_unidade_medida", "regiao", "url_origem",
    ]

    for column in COLUNAS_INTEIRAS:
        df_resultado[column] = pd.to_numeric(df_resultado[column], errors="coerce").astype("Int64")
    for column in COLUNAS_DOUBLE:
        df_resultado[column] = pd.to_numeric(df_resultado[column], errors="coerce").astype("Float64")
    for column in COLUNAS_TEXTO:
        df_resultado[column] = df_resultado[column].astype("string")

    df_resultado["is_total"] = df_resultado["is_total"].astype("boolean")
    for column in ["emitido_em", "dt_carga"]:
        df_resultado[column] = pd.to_datetime(df_resultado[column], errors="coerce")

    duplicadas = int(df_resultado["chave_relatorio"].duplicated().sum())
    if duplicadas:
        raise RuntimeError(f"Foram encontradas {duplicadas} chaves duplicadas")

    print("Linhas prontas para MySQL:", len(df_resultado))
    print(df_resultado.head(20).to_string(index=False))

    rows_saved = replace_table(df_resultado, TARGET_TABLE)

    ERROR_COLUMNS = [
        "programa_cod", "url", "tipo", "tentativas_realizadas", "erro", "dt_carga"
    ]
    df_erros = pd.DataFrame(erros, columns=ERROR_COLUMNS)
    if not df_erros.empty:
        df_erros["programa_cod"] = pd.to_numeric(df_erros["programa_cod"], errors="coerce").astype("Int64")
        df_erros["tentativas_realizadas"] = pd.to_numeric(
            df_erros["tentativas_realizadas"], errors="coerce"
        ).astype("Int64")
        df_erros["dt_carga"] = pd.to_datetime(df_erros["dt_carga"], errors="coerce")
        for column in ["url", "tipo", "erro"]:
            df_erros[column] = df_erros[column].astype("string")

    replace_table(df_erros, ERROR_TABLE, allow_empty=True)

    arquivo_erros = ERROS_DIR / f"execucao_{datetime.now():%Y%m%d_%H%M%S}.csv"
    df_erros.to_csv(arquivo_erros, index=False, sep=";", encoding="utf-8-sig")

    print(f"Tabela gravada: {TARGET_TABLE}")
    print(f"Quantidade de linhas gravadas: {rows_saved:,}")
    print(f"Tabela de erros: {ERROR_TABLE} ({len(df_erros):,} registros)")
    print(f"Log CSV: {arquivo_erros}")

    if not df_erros.empty:
        print("PROGRAMAS COM FALHA:")
        for item in df_erros.sort_values("programa_cod").to_dict("records"):
            print(
                f"- {int(item['programa_cod']):04d} | {item['tipo']} | "
                f"tentativas={item['tentativas_realizadas']} | {item['erro']}"
            )
    else:
        print("Nenhum programa apresentou falha.")

    validacao = fetch_rows(f"""
        SELECT
            ano,
            COUNT(*) AS quantidade_linhas,
            COUNT(DISTINCT programa_cod) AS quantidade_programas,
            COUNT(DISTINCT CONCAT(programa_cod, '-', acao_cod)) AS quantidade_acoes,
            SUM(CASE WHEN is_total = 0 THEN orcamentario_programado_ppag ELSE 0 END) AS orcamentario_programado_regional,
            SUM(CASE WHEN is_total = 0 THEN orcamentario_executado ELSE 0 END) AS orcamentario_executado_regional,
            MAX(dt_carga) AS ultima_carga
        FROM `{TARGET_TABLE}`
        GROUP BY ano
    """)
    print(pd.DataFrame(validacao).to_string(index=False))

    error_count = fetch_rows(f"SELECT COUNT(*) AS total FROM `{ERROR_TABLE}`")[0]["total"]
    print(f"\nErros gravados: {error_count}")


if __name__ == "__main__":
    main()
