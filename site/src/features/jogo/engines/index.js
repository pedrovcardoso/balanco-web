import { QuizEngine } from './QuizEngine';
import { SwipeEngine } from './SwipeEngine';
import { WordSearchEngine } from './WordSearchEngine';
import { CrosswordEngine } from './CrosswordEngine';
import { MatchEngine } from './MatchEngine';
import { SortEngine } from './SortEngine';

export const ENGINE_REGISTRY = {
  'quiz': {
    slug: 'quiz',
    name: 'Quiz de Múltipla Escolha',
    component: QuizEngine,
    instructions: [
      { text: 'Escolha uma alternativa por questão.' },
      { text: 'Você tem um tempo estipulado para responder.' },
      { text: 'A nota vai de 0 a 100.' }
    ]
  },
  'swipe': {
    slug: 'swipe',
    name: 'Verdadeiro ou Falso',
    component: SwipeEngine,
    instructions: [
      { text: 'Arraste para a esquerda ou para a direita para classificar.' },
      { text: 'Ou use os botões Corrente e Capital.' },
      { text: 'Responda antes do tempo esgotar.' }
    ]
  },
  'caca-palavras': {
    slug: 'caca-palavras',
    name: 'Caça-Palavras',
    component: WordSearchEngine,
    instructions: [
      { text: 'Toque e arraste da primeira até a última letra.' },
      { text: 'A lista de termos fica acima do tabuleiro.' },
      { text: 'Você pode solicitar dicas durante a partida.' }
    ]
  },
  'cruzadinha': {
    slug: 'cruzadinha',
    name: 'Palavras Cruzadas',
    component: CrosswordEngine,
    instructions: [
      { text: 'Leia as dicas fornecidas para cada termo.' },
      { text: 'Preencha as letras nas células correspondentes.' },
      { text: 'Clique em conferir para validar suas respostas.' }
    ]
  },
  'flow': {
    slug: 'flow',
    name: 'Ligar Conceitos (Match)',
    component: MatchEngine,
    instructions: [
      { text: 'Selecione um conceito da coluna da esquerda.' },
      { text: 'Associe-o com a definição da coluna da direita.' },
      { text: 'Erros reduzem sua nota final.' }
    ]
  },
  'ordem-correta': {
    slug: 'ordem-correta',
    name: 'Ordem Correta',
    component: SortEngine,
    instructions: [
      { text: 'Pegue os cards da sua mão e aloque nos espaços numerados.' },
      { text: 'Use as setas para ajustar a ordem das etapas.' },
      { text: 'Clique em conferir para validar a ordem.' }
    ]
  }
};
