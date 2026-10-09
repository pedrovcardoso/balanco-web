import api from '../../../lib/api.js';

export async function getTrailProgress() {
  const { data } = await api.get('/trails/progress');
  return Array.isArray(data) ? data : [];
}

export async function redeemTrailItem(itemKey = 'SAIBA_MAIS') {
  const { data } = await api.post('/trails/redeem', { itemKey });
  return data;
}


