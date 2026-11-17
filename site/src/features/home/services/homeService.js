import api from '../../../lib/api.js';

export async function getMainTrailProgress() {
  const { data } = await api.get('/trails/progress');
  if (!Array.isArray(data)) {
    throw new Error('Resposta inválida ao consultar o progresso das trilhas.');
  }
  return data;
}
