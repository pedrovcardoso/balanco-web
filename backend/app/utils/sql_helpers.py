import json, re
GUID_RE=re.compile(r'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$', re.I)
def sql_string(value, max_length=4000):
    if value is None: return 'NULL'
    return "'"+str(value)[:max_length].replace("'", "''")+"'"
def sql_guid(value):
    if not value or str(value).lower() in ('none', 'null', ''): return 'NULL'
    if not GUID_RE.fullmatch(str(value)): raise ValueError('GUID inválido.')
    return sql_string(value,36)
def sql_json(value): return 'NULL' if value is None else sql_string(json.dumps(value,ensure_ascii=False),200000)
def clamp_int(value, minimum, maximum, fallback=None):
    try: number=int(value)
    except (TypeError,ValueError): number=minimum if fallback is None else fallback
    return max(minimum,min(maximum,number))
def first(rows): return rows[0] if rows else None
