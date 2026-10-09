from __future__ import annotations

from datetime import datetime, timezone
import re

import pandas as pd
import pymysql

from app.core.config import settings


_IDENTIFIER = re.compile(r"^[a-z_][a-z0-9_]*$")


def connect_mysql():
    return pymysql.connect(
        host=settings.db_host,
        port=settings.db_port,
        user=settings.db_user,
        password=settings.db_password,
        database=settings.db_name,
        charset="utf8mb4",
        cursorclass=pymysql.cursors.DictCursor,
        autocommit=False,
    )


def fetch_rows(query: str, parameters: tuple = ()) -> list[dict]:
    connection = connect_mysql()
    try:
        with connection.cursor() as cursor:
            cursor.execute(query, parameters)
            return list(cursor.fetchall())
    finally:
        connection.close()


def _identifier(value: str, *, table: bool = False) -> str:
    if not _IDENTIFIER.fullmatch(value) or (table and not value.startswith("tb_sigplan_")):
        raise ValueError(f"Identificador SQL inválido: {value!r}")
    return f"`{value}`"


def _mysql_type(series: pd.Series) -> str:
    if pd.api.types.is_bool_dtype(series.dtype):
        return "TINYINT(1)"
    if pd.api.types.is_integer_dtype(series.dtype):
        return "BIGINT"
    if pd.api.types.is_float_dtype(series.dtype):
        return "DOUBLE"
    if pd.api.types.is_datetime64_any_dtype(series.dtype):
        return "DATETIME"

    for value in series:
        if pd.isna(value):
            continue
        if isinstance(value, bool):
            return "TINYINT(1)"
        if isinstance(value, int):
            return "BIGINT"
        if isinstance(value, float):
            return "DOUBLE"
        if isinstance(value, (datetime, pd.Timestamp)):
            return "DATETIME"
        break
    return "LONGTEXT"


def _mysql_value(value):
    if pd.isna(value):
        return None
    if isinstance(value, pd.Timestamp):
        value = value.to_pydatetime()
    if isinstance(value, datetime) and value.tzinfo is not None:
        value = value.astimezone(timezone.utc).replace(tzinfo=None)
    if hasattr(value, "item"):
        value = value.item()
    return value


def replace_table(
    dataframe: pd.DataFrame,
    table_name: str,
    *,
    allow_empty: bool = False,
    batch_size: int = 1000,
) -> int:
    if dataframe.empty and not allow_empty:
        raise ValueError(f"A extração não retornou linhas para {table_name}.")
    if dataframe.columns.empty:
        raise ValueError(f"O DataFrame de {table_name} não possui colunas.")

    quoted_table = _identifier(table_name, table=True)
    columns = list(dataframe.columns)
    quoted_columns = [_identifier(str(column)) for column in columns]
    if len(columns) != len(set(columns)):
        raise ValueError(f"Há colunas duplicadas em {table_name}.")

    definitions = ", ".join(
        f"{quoted} {_mysql_type(dataframe[column])} NULL"
        for column, quoted in zip(columns, quoted_columns)
    )
    placeholders = ", ".join(["%s"] * len(columns))
    insert_sql = (
        f"INSERT INTO {quoted_table} ({', '.join(quoted_columns)}) "
        f"VALUES ({placeholders})"
    )

    connection = connect_mysql()
    try:
        with connection.cursor() as cursor:
            cursor.execute(
                f"CREATE TABLE IF NOT EXISTS {quoted_table} "
                f"({definitions}) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
            )
            cursor.execute(f"SHOW COLUMNS FROM {quoted_table}")
            existing_columns = {row["Field"] for row in cursor.fetchall()}
            for column, quoted in zip(columns, quoted_columns):
                if column not in existing_columns:
                    cursor.execute(
                        f"ALTER TABLE {quoted_table} ADD COLUMN "
                        f"{quoted} {_mysql_type(dataframe[column])} NULL"
                    )

            cursor.execute(f"DELETE FROM {quoted_table}")
            for start in range(0, len(dataframe), batch_size):
                batch = dataframe.iloc[start : start + batch_size]
                rows = [
                    tuple(_mysql_value(value) for value in row)
                    for row in batch.itertuples(index=False, name=None)
                ]
                if rows:
                    cursor.executemany(insert_sql, rows)
        connection.commit()
        return len(dataframe)
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()