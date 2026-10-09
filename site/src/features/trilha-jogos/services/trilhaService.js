import api from '../../../lib/api.js';

/**
 * Busca a estrutura do mapa de jogos (seções, motores e fases).
 */
export async function getGameMap() {
  try {
    const response = await api.get('/games/map');
    return Array.isArray(response.data) ? response.data : response.data?.items || [];
  } catch (error) {
    console.error('[trilhaService] Erro ao buscar mapa de jogos:', error);
    throw error;
  }
}

/**
 * Busca o progresso atual do usuário logado no mapa de jogos.
 */
export async function getUserProgress() {
  try {
    const response = await api.get('/games/progress');
    return Array.isArray(response.data) ? response.data : response.data?.items || [];
  } catch (error) {
    if (error?.response?.status === 401) {
      return [];
    }
    console.error('[trilhaService] Erro ao buscar progresso do usuário:', error);
    return [];
  }
}

