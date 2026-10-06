import api from '../../../lib/api.js';

export async function getConquistasData() {
  try {
    const [gameMapRes, progressRes, certRes, achievementsRes, trailProgressRes] = await Promise.allSettled([
      api.get('/games/map'),
      api.get('/games/progress'),
      api.get('/certificates/status'),
      api.get('/achievements'),
      api.get('/trails/progress'),
    ]);

    const gameMap = gameMapRes.status === 'fulfilled' ? gameMapRes.value.data : [];
    const progress = progressRes.status === 'fulfilled' ? progressRes.value.data : null;
    const certificate = certRes.status === 'fulfilled' ? certRes.value.data : null;
    const achievements = achievementsRes.status === 'fulfilled' ? achievementsRes.value.data : [];
    const trailProgress = trailProgressRes.status === 'fulfilled' ? trailProgressRes.value.data : [];

    return {
      gameMap: Array.isArray(gameMap) ? gameMap : [],
      progress: progress || null,
      certificate: certificate || null,
      achievements: Array.isArray(achievements) ? achievements : [],
      trailProgress: Array.isArray(trailProgress) ? trailProgress : [],
    };
  } catch (error) {
    console.warn('[conquistaService] Erro ao buscar dados de conquistas:', error);
    return {
      gameMap: [],
      progress: null,
      certificate: null,
      achievements: [],
      trailProgress: [],
    };
  }
}

export async function issueCertificate(participantName, fiscalYear = 2025) {
  const { data } = await api.post('/certificates/generate', {
    participantName,
    fiscalYear,
  });
  return data;
}

export async function verifyCertificate(code) {
  const { data } = await api.get(`/certificates/verify/${encodeURIComponent(code)}`);
  return data;
}

