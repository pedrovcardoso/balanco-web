export const ROUTES = Object.freeze({
  HOME: '/',
  HISTORIA: '/historia',
  BALANCO: '/balanco',
  DADOS: '/dados',
  BALANCO_NA_PRATICA: '/dados',
  SIMULADOR: '/simulador',
  JOGOS: '/jogos',
  CONQUISTAS: '/conquistas',
  CREDITOS: '/creditos',
  ADMIN: '/admin',
  ADMIN_HISTORIA: '/admin/historia',
  GAME: (phaseId) => `/jogos/${phaseId}`,
});
