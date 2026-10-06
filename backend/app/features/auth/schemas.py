from pydantic import BaseModel, Field, field_validator
class LoginRequest(BaseModel):
    cpf:str=Field(min_length=11,max_length=14)
    name:str=Field(min_length=3,max_length=160)
    @field_validator('cpf')
    @classmethod
    def validate_cpf(cls,v):
        digits=''.join(filter(str.isdigit,v))
        if len(digits)!=11: raise ValueError('CPF deve conter 11 dígitos.')
        return digits
class GuestRequest(BaseModel): display_name:str='Visitante'
class UserResponse(BaseModel): userId:str|None=None; publicUserId:str; displayName:str; cpfMasked:str|None=None; isGuest:bool=False
class TokenResponse(BaseModel): token:str; tokenType:str='bearer'; user:UserResponse
