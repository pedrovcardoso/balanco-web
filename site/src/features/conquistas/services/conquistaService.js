import api from '../../../lib/api.js';

export async function getConquistasData() {
  const [achievementsResponse, certificateResponse] = await Promise.all([
    api.get('/achievements'),
    api.get('/certificates/status'),
  ]);

  const payload = achievementsResponse.data || {};
  const achievements = Array.isArray(payload)
    ? payload
    : Array.isArray(payload.items)
      ? payload.items
      : [];

  return {
    achievements,
    summary: payload.summary || {
      total: achievements.length,
      unlocked: achievements.filter((item) => item?.unlocked).length,
    },
    certificate: certificateResponse.data || null,
  };
}

export async function issueCertificate(participantName, fiscalYear = new Date().getFullYear()) {
  const { data } = await api.post('/certificates/generate', { participantName, fiscalYear });
  return data;
}

export async function verifyCertificate(code) {
  const { data } = await api.get(`/certificates/verify/${encodeURIComponent(code)}`);
  return data;
}
