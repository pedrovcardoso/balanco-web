from pydantic import BaseModel,Field
class TrailProgress(BaseModel): mainTrailId:int; slug:str; title:str; description:str|None=None; orderIndex:int; status:str; progressPercent:float=0; completedAt:str|None=None
class ReadingProgressIn(BaseModel): trailSlug:str=Field(max_length=80); readerSlug:str|None=None; title:str='Leitura'; pageNumber:int=Field(ge=1,le=9999); totalPages:int=Field(ge=1,le=9999); readSeconds:int=Field(default=0,ge=0,le=864000); completed:bool=False
class ReadingProgressOut(BaseModel): pageNumber:int|None=None; lastPageNumber:int|None=None; totalPages:int=1; completedPages:int|None=None; progressPercent:float|None=None; readSeconds:int|None=None; isCompleted:bool=False
class CompleteOut(BaseModel): slug:str; status:str; progressPercent:float
