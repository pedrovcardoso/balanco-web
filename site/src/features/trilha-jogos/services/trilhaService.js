import api from '../../../lib/api.js';

export async function getGameMap() {
  try {
    const response = await api.get('/games/map');
    return response.data;
  } catch (error) {
    console.error('[trilhaService] Erro ao buscar mapa de jogos:', error);
    throw error;
  }
}

export async function getUserProgress() {
  try {
    const response = await api.get('/games/progress');
    return response.data;
  } catch (error) {
    console.error('[trilhaService] Erro ao buscar progresso do usuário:', error);
    throw error;
  }
}
