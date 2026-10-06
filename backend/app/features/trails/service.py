from app.utils.sql_helpers import first, sql_guid, sql_string


async def get_trail_progress(db, public_user_id: str) -> list[dict]:
    sql = f"""
DECLARE @user_id UNIQUEIDENTIFIER = (
    SELECT TOP 1 user_id
    FROM bc.app_user
    WHERE public_user_id = {sql_guid(public_user_id)}
      AND is_active = 1
);

SELECT
    mt.main_trail_id AS mainTrailId,
    mt.slug,
    mt.title,
    mt.description,
    mt.order_index AS orderIndex,
    COALESCE(
        progress.status,
        CASE WHEN mt.order_index = 1 THEN 'available' ELSE 'locked' END
    ) AS status,
    COALESCE(progress.progress_percent, 0) AS progressPercent,
    progress.completed_at AS completedAt
FROM bc.main_trail AS mt
LEFT JOIN bc.user_main_trail_progress AS progress
    ON progress.main_trail_id = mt.main_trail_id
   AND progress.user_id = @user_id
WHERE mt.is_active = 1
ORDER BY mt.order_index;
"""
    return await db.execute_sql(sql)


async def get_reading(
    db,
    public_user_id: str,
    trail_slug: str,
    total_pages: int,
) -> dict | None:
    sql = f"""
DECLARE @user_id UNIQUEIDENTIFIER = (
    SELECT TOP 1 user_id
    FROM bc.app_user
    WHERE public_user_id = {sql_guid(public_user_id)}
      AND is_active = 1
);

DECLARE @main_trail_id INT = (
    SELECT TOP 1 main_trail_id
    FROM bc.main_trail
    WHERE slug = {sql_string(trail_slug, 80)}
      AND is_active = 1
);

SELECT
    COALESCE(
        (
            SELECT TOP 1 content_page.order_index
            FROM bc.user_content_progress AS reading_progress
            INNER JOIN bc.content_page AS content_page
                ON content_page.content_page_id = reading_progress.content_page_id
            WHERE reading_progress.user_id = @user_id
              AND content_page.main_trail_id = @main_trail_id
            ORDER BY reading_progress.updated_at DESC
        ),
        1
    ) AS lastPageNumber,
    (
        SELECT COUNT(*)
        FROM bc.user_content_progress AS reading_progress
        INNER JOIN bc.content_page AS content_page
            ON content_page.content_page_id = reading_progress.content_page_id
        WHERE reading_progress.user_id = @user_id
          AND content_page.main_trail_id = @main_trail_id
          AND reading_progress.status = 'completed'
    ) AS completedPages,
    {int(total_pages)} AS totalPages,
    COALESCE(
        (
            SELECT SUM(reading_progress.read_seconds)
            FROM bc.user_content_progress AS reading_progress
            INNER JOIN bc.content_page AS content_page
                ON content_page.content_page_id = reading_progress.content_page_id
            WHERE reading_progress.user_id = @user_id
              AND content_page.main_trail_id = @main_trail_id
        ),
        0
    ) AS readSeconds,
    CAST(
        CASE
            WHEN EXISTS (
                SELECT 1
                FROM bc.user_main_trail_progress
                WHERE user_id = @user_id
                  AND main_trail_id = @main_trail_id
                  AND status = 'completed'
            ) THEN 1
            ELSE 0
        END
        AS BIT
    ) AS isCompleted;
"""
    return first(await db.execute_sql(sql))


async def save_reading(db, public_user_id: str, body) -> dict | None:
    page_number = int(body.pageNumber)
    total_pages = int(body.totalPages)
    read_seconds = int(body.readSeconds)
    completed = 1 if body.completed or page_number >= total_pages else 0
    progress_percent = round(
        min(100, page_number / max(1, total_pages) * 100),
        2,
    )

    reader_slug = (body.readerSlug or body.trailSlug)[:100]
    page_slug = f"{reader_slug}-p-{page_number:04d}"[:120]
    page_title = f"{body.title} - Página {page_number}"[:180]

    sql = f"""
DECLARE @user_id UNIQUEIDENTIFIER = (
    SELECT TOP 1 user_id
    FROM bc.app_user
    WHERE public_user_id = {sql_guid(public_user_id)}
      AND is_active = 1
);

DECLARE @main_trail_id INT = (
    SELECT TOP 1 main_trail_id
    FROM bc.main_trail
    WHERE slug = {sql_string(body.trailSlug, 80)}
      AND is_active = 1
);

IF @user_id IS NULL
BEGIN
    THROW 51000, 'Usuário não encontrado.', 1;
END;

IF @main_trail_id IS NULL
BEGIN
    THROW 51002, 'Trilha não encontrada.', 1;
END;

DECLARE @content_page_id BIGINT = (
    SELECT TOP 1 content_page_id
    FROM bc.content_page
    WHERE main_trail_id = @main_trail_id
      AND slug = {sql_string(page_slug, 120)}
);

IF @content_page_id IS NULL
BEGIN
    SELECT @content_page_id = COALESCE(MAX(content_page_id), 0) + 1
    FROM bc.content_page;

    INSERT INTO bc.content_page (
        content_page_id,
        content_year_id,
        main_trail_id,
        slug,
        title,
        summary,
        body_markdown,
        body_json,
        order_index,
        min_read_seconds,
        is_required,
        is_active,
        created_at,
        updated_at
    )
    VALUES (
        @content_page_id,
        NULL,
        @main_trail_id,
        {sql_string(page_slug, 120)},
        {sql_string(page_title, 180)},
        {sql_string('Página da história em quadrinhos.', 800)},
        NULL,
        NULL,
        {page_number},
        0,
        1,
        1,
        SYSUTCDATETIME(),
        SYSUTCDATETIME()
    );
END;

IF EXISTS (
    SELECT 1
    FROM bc.user_content_progress
    WHERE user_id = @user_id
      AND content_page_id = @content_page_id
)
BEGIN
    UPDATE bc.user_content_progress
    SET
        status = CASE
            WHEN {completed} = 1 THEN 'completed'
            ELSE 'in_progress'
        END,
        read_seconds = CASE
            WHEN {read_seconds} > COALESCE(read_seconds, 0)
                THEN {read_seconds}
            ELSE COALESCE(read_seconds, 0)
        END,
        completed_at = CASE
            WHEN {completed} = 1
                THEN COALESCE(completed_at, SYSUTCDATETIME())
            ELSE completed_at
        END,
        updated_at = SYSUTCDATETIME()
    WHERE user_id = @user_id
      AND content_page_id = @content_page_id;
END
ELSE
BEGIN
    INSERT INTO bc.user_content_progress (
        user_id,
        content_page_id,
        status,
        read_seconds,
        completed_at,
        updated_at
    )
    VALUES (
        @user_id,
        @content_page_id,
        CASE WHEN {completed} = 1 THEN 'completed' ELSE 'in_progress' END,
        {read_seconds},
        CASE WHEN {completed} = 1 THEN SYSUTCDATETIME() ELSE NULL END,
        SYSUTCDATETIME()
    );
END;

IF EXISTS (
    SELECT 1
    FROM bc.user_main_trail_progress
    WHERE user_id = @user_id
      AND main_trail_id = @main_trail_id
)
BEGIN
    UPDATE bc.user_main_trail_progress
    SET
        status = CASE
            WHEN {completed} = 1 THEN 'completed'
            WHEN status = 'completed' THEN 'completed'
            ELSE 'in_progress'
        END,
        progress_percent = CASE
            WHEN {progress_percent} > COALESCE(progress_percent, 0)
                THEN {progress_percent}
            ELSE COALESCE(progress_percent, 0)
        END,
        completed_at = CASE
            WHEN {completed} = 1
                THEN COALESCE(completed_at, SYSUTCDATETIME())
            ELSE completed_at
        END,
        updated_at = SYSUTCDATETIME()
    WHERE user_id = @user_id
      AND main_trail_id = @main_trail_id;
END
ELSE
BEGIN
    INSERT INTO bc.user_main_trail_progress (
        user_id,
        main_trail_id,
        status,
        progress_percent,
        completed_at,
        updated_at
    )
    VALUES (
        @user_id,
        @main_trail_id,
        CASE WHEN {completed} = 1 THEN 'completed' ELSE 'in_progress' END,
        {progress_percent},
        CASE WHEN {completed} = 1 THEN SYSUTCDATETIME() ELSE NULL END,
        SYSUTCDATETIME()
    );
END;

SELECT
    {page_number} AS pageNumber,
    {total_pages} AS totalPages,
    CAST({progress_percent} AS DECIMAL(5, 2)) AS progressPercent,
    CAST({completed} AS BIT) AS isCompleted;
"""
    return first(await db.execute_sql(sql))


async def complete_trail(
    db,
    public_user_id: str,
    trail_slug: str,
) -> dict | None:
    sql = f"""
DECLARE @user_id UNIQUEIDENTIFIER = (
    SELECT TOP 1 user_id
    FROM bc.app_user
    WHERE public_user_id = {sql_guid(public_user_id)}
      AND is_active = 1
);

DECLARE @main_trail_id INT = (
    SELECT TOP 1 main_trail_id
    FROM bc.main_trail
    WHERE slug = {sql_string(trail_slug, 80)}
      AND is_active = 1
);

IF @user_id IS NULL
BEGIN
    THROW 51000, 'Usuário não encontrado.', 1;
END;

IF @main_trail_id IS NULL
BEGIN
    THROW 51002, 'Trilha não encontrada.', 1;
END;

IF EXISTS (
    SELECT 1
    FROM bc.user_main_trail_progress
    WHERE user_id = @user_id
      AND main_trail_id = @main_trail_id
)
BEGIN
    UPDATE bc.user_main_trail_progress
    SET
        status = 'completed',
        progress_percent = 100.00,
        completed_at = COALESCE(completed_at, SYSUTCDATETIME()),
        updated_at = SYSUTCDATETIME()
    WHERE user_id = @user_id
      AND main_trail_id = @main_trail_id;
END
ELSE
BEGIN
    INSERT INTO bc.user_main_trail_progress (
        user_id,
        main_trail_id,
        status,
        progress_percent,
        completed_at,
        updated_at
    )
    VALUES (
        @user_id,
        @main_trail_id,
        'completed',
        100.00,
        SYSUTCDATETIME(),
        SYSUTCDATETIME()
    );
END;

SELECT
    {sql_string(trail_slug, 80)} AS slug,
    'completed' AS status,
    CAST(100.00 AS DECIMAL(5, 2)) AS progressPercent;
"""
    return first(await db.execute_sql(sql))
