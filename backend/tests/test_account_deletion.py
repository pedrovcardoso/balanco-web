import unittest
from typing import Annotated

from fastapi import Depends, FastAPI
from fastapi.testclient import TestClient

from app.core.dependencies import get_current_user, get_db, get_optional_user
from app.core.security import create_access_token
from app.features.auth.router import router


class FakeDatabase:
    def __init__(self):
        self.users = {'42', '43'}

    async def fetch_one(self, query, params):
        return {'id': int(params[0])} if params[0] in self.users else None

    async def execute(self, query, params):
        user_id = str(params[0])
        if user_id not in self.users:
            return 0
        self.users.remove(user_id)
        return 1


class AccountDeletionTests(unittest.TestCase):
    def setUp(self):
        self.db = FakeDatabase()
        app = FastAPI()
        app.dependency_overrides[get_db] = lambda: self.db
        app.include_router(router, prefix='/api')

        @app.get('/protected')
        async def protected(user: Annotated[dict, Depends(get_current_user)]):
            return {'user': user['sub']}

        @app.get('/optional')
        async def optional(user: Annotated[dict | None, Depends(get_optional_user)]):
            return {'user': user['sub'] if user else None}

        self.client = TestClient(app)
        self.token = create_access_token('42', 'Pessoa')
        self.headers = {'Authorization': f'Bearer {self.token}'}

    def test_deletion_revokes_all_tokens_for_user(self):
        other_token = create_access_token('42', 'Pessoa')
        another_user = create_access_token('43', 'Outra pessoa')
        self.assertEqual(self.client.get('/protected', headers=self.headers).status_code, 200)
        response = self.client.delete('/api/auth/account', headers=self.headers)
        self.assertEqual(response.json(), {'ok': True})
        self.assertEqual(self.client.get('/protected', headers=self.headers).status_code, 401)
        self.assertEqual(
            self.client.get('/optional', headers={'Authorization': f'Bearer {other_token}'}).status_code,
            401,
        )
        self.assertEqual(
            self.client.get('/protected', headers={'Authorization': f'Bearer {another_user}'}).status_code,
            200,
        )

    def test_guest_and_anonymous_requests_still_work(self):
        guest = create_access_token('guest-id', 'Visitante', is_guest=True)
        self.assertEqual(self.client.get('/optional').json(), {'user': None})
        self.assertEqual(
            self.client.get('/optional', headers={'Authorization': f'Bearer {guest}'}).json(),
            {'user': 'guest-id'},
        )
        self.assertEqual(
            self.client.get('/protected', headers={'Authorization': f'Bearer {guest}'}).status_code,
            403,
        )


if __name__ == '__main__':
    unittest.main()
