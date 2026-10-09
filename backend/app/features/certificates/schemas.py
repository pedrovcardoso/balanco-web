
from pydantic import BaseModel,Field
class CertificateRequest(BaseModel): participantName:str=Field(min_length=3,max_length=160); fiscalYear:int|None=Field(default=None,ge=2000,le=2100)
class CertificateOut(BaseModel): publicCertificateId:str; verificationCode:str; issuedAt:str|None=None; pdfBase64:str
class VerifyOut(BaseModel): publicCertificateId:str|None=None; participantName:str|None=None; fiscalYear:int|None=None; verificationCode:str; issuedAt:str|None=None; isValid:bool=False

