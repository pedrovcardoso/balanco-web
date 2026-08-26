# Gamificação - Balanço Cidadão Web

## 1. Pontuação

Cada jogo terá uma atribuição de nota que vai de 0 a 100.
Qualquer nota acima de 60 pontos ele poderá passar para a próxima fase.
As notas também serão representadas por estrelas, que serão exibidas na página e utilizadas nas conquistas também.
nota >= 60: passou com 1 estrela
nota >= 80: 2 estrelas
nota >= 95: 3 estrelas

### 2. Medalhas e conquistas

#### 2.1 Medalhas de trilha

Ao concluir todas as fases de uma trilha, o usuário recebe a medalha normal da trilha.

Caso conclua todas as fases da trilha com 3 estrelas, recebe a medalha brilhante.

Estados da medalha:

- bloqueada: medalha cinza
- normal: medalha colorida
- brilhante: medalha com efeito especial

#### 2.2 Conquistas gerais

As conquistas terão níveis e serão liberadas conforme o progresso do usuário.

- Leia toda a história do Balanço Cidadão
- Leia todo o conteúdo do Balanço Cidadão
- Leia toda a página de créditos
- Gere o certificado final de participação
- Conquiste 25 estrelas
- Conquiste 35 estrelas
- Conquiste todas as 48 estrelas
- Conclua todas as trilhas
- Conquiste duas medalhas brilhantes
- Conquiste todas as trilhas com medalhas brilhantes

### 3. Desbloqueio das fases

A primeira fase de cada trilha inicia liberada.

As demais fases ficam bloqueadas até que o usuário conclua a fase imediatamente anterior da mesma trilha.

Estados visuais das fases:

- bloqueada: cinza com cadeado
- disponível: colorida sem estrelas
- concluída: colorida com quantidade de estrelas obtidas

O usuário poderá refazer fases já concluídas para melhorar sua pontuação e conquistar mais estrelas.

## 4. Jogos

### Caça-palavras

Uma sopa de letrinhas na tela com algumas palavras completas distribuídas.
Em baixo da sopa de letrinhas, a lista de palavras a serem encontradas.
Ao encontrar uma palavra, ele irá mostrar um toast ou mensagem rapida na tela exibindo o significado/descrição.
Ao pedir uma dica, ele destaca a primeira letra de uma palavra aleatória que ele ainda não descobriu.
Inicia com 100 pontos, mas a cada dica, ele perde 10 pontos.

### Cruzadinha

Aparecerá uma cruzadinha na tela, a pessoa irá ver o conceito e depois escrever a palavra ou termo correspondente.
Ao pedir uma dica para a palavra, ele revela algumas letras aleatorias.
Se pedir a segunda dica na mesma palavra, ele revela o restante.
Inicia com 100 pontos, mas a cada dica, ele perde 10 pontos.

### Liga conceitos

Terá duas colunas, uma com o conceito e outra com a explicação.
O usuário terá que ligar as duas colunas, relacionando o conceito com a definição dele.
A fase só é concluída quando todas as associações estiverem corretas.

100 pontos: acertou na 1ª tentativa
85 pontos: acertou na 2ª tentativa
70 pontos: acertou na 3ª tentativa
60 pontos: acertou na 4ª tentativa ou mais

### Ordem correta

O usuário terá uma lista de termos ou palavras e terá que colocar em qual ordem cada um acontece.
A fase só é concluída quando todas as ordens estiverem corretas.

100 pontos: acertou na 1ª tentativa
85 pontos: acertou na 2ª tentativa
70 pontos: acertou na 3ª tentativa
60 pontos: acertou na 4ª tentativa ou mais

### Swipe

Aparecerá uma frase rápida na tela, em baixo duas opções.
Ele poderá deslizar para a direita ou esquerda ou apertar os botões para escolher a opção.
Caso ele erre alguma resposta, aparecerá uma explicação da resposta correta com um botão de "ir para o próximo".
A pontuação será baseada no numero de acertos dividido pelo número de questões.

### Quiz

Aparecerá uma frase/pergunta e alternativas de múltipla escolha, somente uma está correta.
Caso ele erre alguma resposta, aparecerá uma explicação da resposta correta com um botão de "ir para o próximo".
A pontuação será baseada no numero de acertos dividido pelo número de questões.

### Simulador do orçamento

A pessoa receberá o saldo do orçamento de minas gerais e terá que distribuir entre as principais funções de despesa.
Vamos listar algumas regras específicas, como índices de saúde e educação e outros limites constitucionais.
Caso ele coloque um valor que desrespeite alguma regra, aparece uma mensagem em vermelho.
Ao final, terá uma tela comparando o que ele enviou para cada função, e quando Minas Gerais realmente realizou no ano.

## 5. Trilhas

### Trilha 1 - Administração Pública

Ensinar os fundamentos da administração pública, princípios constitucionais, poderes administrativos e ciclo orçamentário.

#### Jogo 1 - Caça-palavras: Princípios da Administração Pública

Motor do jogo: Caça-palavras

Lista de princípios do LIMPE

#### Jogo 2 - Liga os conceitos- Instrumentos de Planejamento

Motor do jogo: Liga conceitos

    PMDI → planejamento estratégico de longo prazo do Estado
    PPAG → planejamento plurianual dos programas e ações governamentais
    LDO → define diretrizes, metas e prioridades para elaboração da LOA
    LOA → estima receitas e fixa despesas para o exercício financeiro

#### Jogo 3 - Ordem Correta: Ciclo Orçamentário

Motor do jogo: Ordem correta

    Elaboração da proposta
    Discussão legislativa
    Aprovação da lei orçamentária
    Execução do orçamento
    Controle e avaliação
    Prestação de contas

#### Jogo 4 - Quiz: Administração Pública

Motor do jogo: Quiz

6 perguntas aleatórias do banco de dados.

### Trilha 2 - Receita e Despesa Pública

Ensinar de onde vêm os recursos públicos, como são classificados e como as despesas são organizadas.

#### Jogo 1 - Liga os Conceitos: Receita, Despesa e Restos a Pagar

Motor do jogo: Liga conceitos

    Receita Corrente → entrada regular, como impostos, taxas e transferências correntes
    Receita de Capital → entrada relacionada a operações de crédito, alienação de bens ou transferências de capital
    Despesa Corrente → gasto para manutenção dos serviços públicos
    Despesa de Capital → gasto relacionado a investimentos, obras, equipamentos ou amortização da dívida
    Restos a Pagar → despesas empenhadas e não pagas até o fim do exercício

#### Jogo 2 - Classificação da despesa: Swipe Corrente ou Capital

Motor do jogo: Swipe

Esquerda se for despesa corrente e direita se despesa de capital.
Exibir 10 itens para classificar.

#### Jogo 3 - Cruzadinha: Termos Fiscais

Motor do jogo: Cruzadinha

Receita, despesa, corrente, capital, LOA, Restos a Pagar

#### Jogo 4 - Verdadeiro ou Falso: Receita e Despesa

Motor do jogo: Swipe

Direita verdadeiro, esquerda falso.
10 afirmações aleatórias do banco de questões.

### Trilha 3 - Execução Orçamentária

Ensinar como o orçamento aprovado vira execução prática: planejamento, empenho, liquidação, pagamento, prestação de contas, limites e índices.

#### Jogo 1 - Ordem correta: Caminho do Documento

Motor do jogo: Ordem correta

    Nota de compra
    Empenho
    Entrega conferida
    Liquidação
    Pagamento
    Prestação de contas

#### Jogo 2 - Liga os conceitos: Etapas da Despesa Pública

Motor do jogo: Liga conceitos

    Empenho
    Liquidação
    Pagamento

#### Jogo 3 - Verdadeiro ou Falso: Índices e Limites

Motor do jogo: Swipe

Direita verdadeiro, esquerda falso.
10 afirmações aleatórias do banco de questões.

#### Jogo 4 - Quiz: Execução Orçamentária

Motor do jogo: Quiz

6 perguntas aleatórias do banco de dados.

### Trilha 4 - Transparência e Controle Social

Ensinar o cidadão a entender o Balanço, demonstrativos, direitos, deveres, transparência ativa e controle social.

#### Jogo 1 - Cruzadinha - Balanços e demonstrativos

Motor do jogo: Cruzadinha

    1. Documento que apresenta informações das contas públicas.
    Resposta: Balanço
    2. Ação de informar à sociedade como os recursos foram usados.
    Resposta: Prestação de Contas
    3. Forma de disponibilizar informações públicas sem que o cidadão precise solicitar.
    Resposta: Transparência Ativa
    4. Participação da sociedade no acompanhamento da administração pública.
    Resposta: Controle Social
    5. Canal usado para manifestação do cidadão.
    Resposta: Ouvidoria

#### Jogo 2 - Verdadeiro ou falso - Direitos e Deveres

Motor do jogo: Swipe

Direita verdadeiro, esquerda falso.
10 afirmações aleatórias do banco de questões.

#### Jogo 3 - Liga os Conceitos: Direitos, Deveres e Controle

Motor do jogo: Liga conceitos

    Direito à informação → possibilidade de acessar dados públicos
    Transparência ativa → divulgação espontânea de informações pelo governo
    Controle social → acompanhamento da gestão pública pela sociedade
    Ouvidoria → canal para reclamações, denúncias, sugestões e elogios
    Prestação de contas → apresentação dos resultados da gestão pública
    Balanço Cidadão → versão simplificada e didática das contas públicas

#### Jogo 4 - Quiz: Balanços e relatórios

Motor do jogo: Quiz

Apresenta o conceito e ele deve selecionar a qual mecanismo ou relatório está se referindo
RREO, RGF, Balanço Geral, Balanço Social, portal da transparência, ouvidoria
