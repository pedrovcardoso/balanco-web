from pydantic import BaseModel
class ResumoResponse(BaseModel): quantidadeProgramas:int=0; quantidadeAcoes:int=0; valorExecutado:float=0; dataReferencia:str|None=None
class RegiaoResponse(BaseModel): regiao:str; valorExecutado:float=0; valorProgramado:float=0; quantidadeAcoes:int=0
class OdsResponse(BaseModel): odsTitulo:str; odsSubtitulo:str|None=None; valorExecutado:float=0; quantidadeProgramas:int=0
class PopulacaoResponse(BaseModel): municipioIbgeCod:str; municipio:str; populacao:int
