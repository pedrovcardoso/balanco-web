from pydantic import BaseModel,Field
class SectionIn(BaseModel): gameSectionId:int|None=None; slug:str=Field(max_length=100); title:str=Field(max_length=180); description:str=''; orderIndex:int=1; isActive:bool=True
class PhaseIn(BaseModel): gamePhaseId:int|None=None; gameEngineId:int; slug:str; title:str; description:str=''; orderIndex:int=1; questionCount:int|None=None; passScore:int=60; maxScore:int=100; configJson:str='{}'; isActive:bool=True
class QuestionIn(BaseModel): questionId:int|None=None; gameEngineId:int; prompt:str; simpleExplanation:str=''; correctAnswer:str=''; options:list|None=None; metadata:dict|None=None; tags:str=''; difficulty:int=2
class QuestionLinkIn(BaseModel): questionId:int; orderIndex:int=1
class MoveIn(BaseModel): direction:int=Field(ge=-1,le=1)
