import { ROUTES } from './routes.js';

export const TRAIL_KEYS = Object.freeze({
  HISTORIA: 'HISTORIA',
  BALANCO: 'BALANCO',
  DADOS: 'DADOS',
  JOGOS: 'JOGOS',
  CREDITOS: 'CREDITOS',
});

export const TRAIL_SLUGS = Object.freeze({
  HISTORIA: 'historia-hq',
  BALANCO: 'conteudo-balanco',
  DADOS: 'balanco-na-pratica',
  JOGOS: 'jogos',
  CREDITOS: 'creditos-saiba-mais',
});

export const READER_SLUGS = Object.freeze({
  HISTORIA: 'historia',
});

export const MAIN_TRAILS = Object.freeze([
  Object.freeze({
    key: TRAIL_KEYS.HISTORIA,
    slug: TRAIL_SLUGS.HISTORIA,
    itemKey: 'HISTORIA_HQ',
    readerSlug: READER_SLUGS.HISTORIA,
    route: ROUTES.HISTORIA,
    title: 'Minas Gerais',
    description: 'Diversidade, cultura e riqueza do estado',
    order: 1,
    theme: 'orange',
    requiresAuth: false,
    savesProgress: true,
    icon: 'mountain',
  }),

  Object.freeze({
    key: TRAIL_KEYS.BALANCO,
    slug: TRAIL_SLUGS.BALANCO,
    itemKey: 'LIVRO_1',
    readerSlug: null,
    route: ROUTES.BALANCO,
    title: 'Entendendo o Balanço',
    description: 'Balanço e administração pública',
    order: 2,
    theme: 'blue',
    requiresAuth: false,
    savesProgress: true,
    icon: 'book',
  }),

  Object.freeze({
    key: TRAIL_KEYS.DADOS,
    slug: TRAIL_SLUGS.DADOS,
    itemKey: 'BALANCO_DADOS',
    readerSlug: null,
    route: ROUTES.DADOS,
    title: 'O Balanço na Prática',
    description: 'Visualizações e notícias do ano',
    order: 3,
    theme: 'teal',
    requiresAuth: false,
    savesProgress: true,
    icon: 'chart',
  }),

  Object.freeze({
    key: TRAIL_KEYS.JOGOS,
    slug: TRAIL_SLUGS.JOGOS,
    itemKey: null,
    readerSlug: null,
    route: ROUTES.JOGOS,
    title: 'Jogue & Aprenda',
    description: 'Quiz, desafios e recompensas!',
    order: 4,
    theme: 'purple',
    requiresAuth: true,
    savesProgress: true,
    icon: 'game',
  }),

  Object.freeze({
    key: TRAIL_KEYS.CREDITOS,
    slug: TRAIL_SLUGS.CREDITOS,
    itemKey: 'SAIBA_MAIS',
    readerSlug: null,
    route: ROUTES.CREDITOS,
    title: 'Saiba Mais',
    description: 'Mais informações, créditos e referências',
    order: 5,
    theme: 'green',
    requiresAuth: false,
    savesProgress: true,
    icon: 'info',
  }),
]);

export const TRAILS_BY_KEY = Object.freeze(
  Object.fromEntries(
    MAIN_TRAILS.map((trail) => [trail.key, trail]),
  ),
);

export const TRAILS_BY_SLUG = Object.freeze(
  Object.fromEntries(
    MAIN_TRAILS.map((trail) => [trail.slug, trail]),
  ),
);
