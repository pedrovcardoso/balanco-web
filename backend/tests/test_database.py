import asyncio
import unittest
from unittest.mock import AsyncMock, MagicMock, patch

from app.core.database import Database


class DatabaseTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.db = Database()
        self.pool = MagicMock()
        self.connection = MagicMock()
        self.cursor = MagicMock()
        self.connection.begin = AsyncMock()
        self.connection.commit = AsyncMock()
        self.connection.rollback = AsyncMock()
        self.connection.cursor.return_value.__aenter__.return_value = self.cursor
        self.pool.acquire.return_value.__aenter__.return_value = self.connection
        self.db.pool = self.pool

    async def test_pool_uses_autocommit_for_reads(self):
        self.db.fetch_one = AsyncMock(return_value={'ok': 1})
        with patch('app.core.database.aiomysql.create_pool', new_callable=AsyncMock) as create_pool:
            create_pool.return_value = self.pool
            await self.db.connect()
        self.assertTrue(create_pool.await_args.kwargs['autocommit'])

    async def test_transaction_begins_and_commits(self):
        async with self.db.transaction() as cursor:
            self.assertIs(cursor, self.cursor)
        self.connection.begin.assert_awaited_once()
        self.connection.commit.assert_awaited_once()
        self.connection.rollback.assert_not_awaited()

    async def test_transaction_rolls_back_on_error_and_cancellation(self):
        for error in (ValueError('failure'), asyncio.CancelledError()):
            with self.subTest(error=type(error).__name__):
                self.connection.reset_mock()
                with self.assertRaises(type(error)):
                    async with self.db.transaction():
                        raise error
                self.connection.begin.assert_awaited_once()
                self.connection.rollback.assert_awaited_once()
                self.connection.commit.assert_not_awaited()
