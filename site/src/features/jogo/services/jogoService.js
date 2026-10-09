import api from '../../../lib/api';

function items(data) {
  if (Array.isArray(data)) return data;
  return data?.items ?? data?.questions ?? [];
}

function apiMessage(error, fallback) {
  return error?.response?.data?.detail || error?.response?.data?.message || error?.message || fallback;
}

export async function getGameMap() {
  const response = await api.get('/games/map');
  return items(response.data);
}

export async function getQuestionsForPhase(phaseId, options = {}) {
  if (!phaseId) throw new Error('Identificador da fase não informado.');
  try {
    const response = await api.get(`/games/phases/${encodeURIComponent(phaseId)}/questions`, {
      params: { limit: 50, random: false, ...options },
    });
    return items(response.data);
  } catch (error) {
    throw new Error(apiMessage(error, `Falha ao carregar os itens da fase ${phaseId}.`));
  }
}

export async function registerGameAttempt(phaseId, attemptData = {}) {
  if (!phaseId) return null;
  const details = attemptData.details || {};
  const response = await api.post(`/games/phases/${encodeURIComponent(phaseId)}/attempt`, {
    score: Math.max(0, Math.min(100, Number(attemptData.score || 0))),
    hintsUsed: Number(attemptData.hintsUsed ?? details.hintsUsed ?? 0),
    attemptsUsed: Number(details.attemptsUsed ?? attemptData.attemptsUsed ?? attemptData.attempts ?? 1),
    correctCount: details.correctCount ?? attemptData.correctCount ?? null,
    totalCount: details.totalCount ?? attemptData.totalCount ?? null,
    durationSeconds: attemptData.durationSeconds ?? attemptData.timeSeconds ?? null,
    answers: details.answers ?? attemptData.answers ?? null,
  });
  return response.data;
}

export async function getNextPhaseForPhase(phaseId) {
  if (!phaseId) return null;
  const response = await api.get(`/games/phases/${encodeURIComponent(phaseId)}/next`);
  return response.data;
}
