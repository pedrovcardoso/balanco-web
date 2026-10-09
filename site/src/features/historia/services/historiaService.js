import api from '../../../lib/api.js';

export async function getReadingProgress() {
  const { data } = await api.get('/trails/progress');
  const items = Array.isArray(data) ? data : [];
  const historiaItem = items.find((i) => i.itemKey === 'HISTORIA_HQ');
  return {
    isCompleted: Boolean(historiaItem && historiaItem.redeemed),
    redeemedAt: historiaItem?.redeemedAt || null,
  };
}

export async function redeemTrailItem(itemKey = 'HISTORIA_HQ') {
  const { data } = await api.post('/trails/redeem', { itemKey });
  return data;
}


