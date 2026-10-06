from pydantic import BaseModel,Field
class AttemptIn(BaseModel): score:int=Field(ge=0,le=100); hintsUsed:int=Field(default=0,ge=0,le=99); attemptsUsed:int|None=Field(default=None,ge=1,le=999); correctCount:int|None=Field(default=None,ge=0); totalCount:int|None=Field(default=None,ge=0); durationSeconds:int|None=Field(default=None,ge=0,le=86400); answers:list|dict|None=None
class AttemptOut(BaseModel): attemptId:str; publicAttemptId:str; score:int; stars:int; passed:bool; currentStatus:str
