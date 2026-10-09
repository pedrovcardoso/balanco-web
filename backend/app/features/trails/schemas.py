from typing import Literal
from pydantic import BaseModel
class RedemptionIn(BaseModel): itemKey:Literal['HISTORIA_HQ','LIVRO_1','LIVRO_2','LIVRO_3','BALANCO_DADOS','SAIBA_MAIS']
