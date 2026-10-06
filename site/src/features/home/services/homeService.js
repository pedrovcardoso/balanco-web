import api from '../../../lib/api.js';

export async function getMainTrailProgress() {
  const { data } = await api.get('/trails/progress');
  return Array.isArray(data) ? data : [];
}
