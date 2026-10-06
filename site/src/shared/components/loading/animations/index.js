import LoadingMap from './LoadingMap.jsx';
import LoadingTrain from './LoadingTrain.jsx';
import LoadingCoffee from './LoadingCoffee.jsx';
import LoadingHistoric from './LoadingHistoric.jsx';
import LoadingCheese from './LoadingCheese.jsx';
import LoadingRiver from './LoadingRiver.jsx';
import LoadingPampulha from './LoadingPampulha.jsx';

export const LOADING_ANIMATIONS = {
  mapa: {
    id: 'mapa',
    title: 'Mapa de Minas Gerais',
    accent: '#1f8f46',
    defaultEta: 8,
    Component: LoadingMap,
  },
  'trem-serras': {
    id: 'trem-serras',
    title: 'Trem das Serras',
    accent: '#8b5a2b',
    defaultEta: 10,
    Component: LoadingTrain,
  },
  cafe: {
    id: 'cafe',
    title: 'Café de Minas',
    accent: '#7b4a25',
    defaultEta: 9,
    Component: LoadingCoffee,
  },
  historico: {
    id: 'historico',
    title: 'Cidades Históricas',
    accent: '#b57a3a',
    defaultEta: 8,
    Component: LoadingHistoric,
  },
  queijo: {
    id: 'queijo',
    title: 'Queijo Minas & Pão de Queijo',
    accent: '#d99a20',
    defaultEta: 7,
    Component: LoadingCheese,
  },
  'rio-sao-francisco': {
    id: 'rio-sao-francisco',
    title: 'Rio São Francisco (Velho Chico)',
    accent: '#2686a6',
    defaultEta: 9,
    Component: LoadingRiver,
  },
  pampulha: {
    id: 'pampulha',
    title: 'Igrejinha da Pampulha',
    accent: '#315b8a',
    defaultEta: 8,
    Component: LoadingPampulha,
  },
};

export const ANIMATION_KEYS = Object.keys(LOADING_ANIMATIONS);

export function getRandomAnimationKey() {
  const index = Math.floor(Math.random() * ANIMATION_KEYS.length);
  return ANIMATION_KEYS[index];
}

export {
  LoadingMap,
  LoadingTrain,
  LoadingCoffee,
  LoadingHistoric,
  LoadingCheese,
  LoadingRiver,
  LoadingPampulha,
};

