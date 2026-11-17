from typing import Literal
from pydantic import BaseModel
class RedemptionIn(BaseModel): itemKey:Literal['HISTORIA_HQ','LIVRO_1','LIVRO_2','LIVRO_3','BALANCO_COMPLETO','BALANCO_DADOS','JOGOS_COMPLETOS','SAIBA_MAIS']
