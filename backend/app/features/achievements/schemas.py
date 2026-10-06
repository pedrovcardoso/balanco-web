from pydantic import BaseModel
class AchievementOut(BaseModel): achievementId:int; slug:str; title:str; description:str|None=None; achievementGroup:str|None=None; targetValue:int|None=None; iconName:str|None=None; currentValue:int=0; isUnlocked:bool=False; unlockedAt:str|None=None
