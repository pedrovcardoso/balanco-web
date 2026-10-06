import api from '../../../lib/api';

export async function getGameMap(userId) {
  try {
    const response = await api.get('/games/map', { params: { userId } });
    return response.data;
  } catch (error) {
    console.warn('[jogoService] Erro ao buscar mapa de jogos da API:', error);
    return [];
  }
}

export async function getQuestionsForPhase(phaseId, options = {}) {
  try {
    const response = await api.get(`/games/phases/${phaseId}/questions`, { params: options });
    return response.data;
  } catch (error) {
    console.warn('[jogoService] Erro ao buscar questões da API:', error);
    return [];
  }
}

export async function registerGameAttempt(userId, phaseId, attemptData) {
  try {
    const response = await api.post(`/games/phases/${phaseId}/attempt`, {
      userId,
      ...attemptData,
    });
    return response.data;
  } catch (error) {
    console.warn('[jogoService] Erro ao registrar tentativa:', error);
    return null;
  }
}

export async function getNextPhaseForPhase(userId, phaseId) {
  try {
    const response = await api.get(`/games/phases/${phaseId}/next`, { params: { userId } });
    return response.data;
  } catch (error) {
    console.warn('[jogoService] Erro ao buscar próxima fase:', error);
    return null;
  }
}
