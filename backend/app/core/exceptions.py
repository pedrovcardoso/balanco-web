from fastapi import HTTPException, status
class FlowConfigurationError(RuntimeError): pass
class FlowExecutionError(RuntimeError): pass
class UserNotFound(HTTPException):
    def __init__(self): super().__init__(status.HTTP_404_NOT_FOUND, 'Usuário não encontrado.')
class Forbidden(HTTPException):
    def __init__(self, detail='Acesso negado.'): super().__init__(status.HTTP_403_FORBIDDEN, detail)
