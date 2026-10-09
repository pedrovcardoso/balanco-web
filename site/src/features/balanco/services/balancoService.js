import api from '../../../lib/api.js';

export const TRAIL_ITEM_KEYS = Object.freeze({
  HISTORIA_HQ: 'HISTORIA_HQ',
  LIVRO_1: 'LIVRO_1',
  LIVRO_2: 'LIVRO_2',
  LIVRO_3: 'LIVRO_3',
  BALANCO_DADOS: 'BALANCO_DADOS',
  SAIBA_MAIS: 'SAIBA_MAIS',
});

export const ALLOWED_ITEM_KEYS = Object.values(TRAIL_ITEM_KEYS);

/**
 * Obtém o progresso de leitura/resgate da trilha do usuário.
 * Retorna todos os itens resgatados e a situação do item solicitado (padrão LIVRO_1).
 */
export async function getReadingProgress(targetItemKey = TRAIL_ITEM_KEYS.LIVRO_1) {
  try {
    const { data } = await api.get('/trails/progress');
    const items = Array.isArray(data) ? data : [];
    const redeemedMap = {};
    items.forEach((item) => {
      if (item.itemKey) {
        redeemedMap[item.itemKey] = Boolean(item.redeemed);
      }
    });
    const targetItem = items.find((i) => i.itemKey === targetItemKey);
    return {
      items,
      redeemedMap,
      isCompleted: Boolean(targetItem && targetItem.redeemed),
      redeemedAt: targetItem?.redeemedAt || null,
    };
  } catch (error) {
    if (error?.response?.status === 401) {
      return { items: [], redeemedMap: {}, isCompleted: false, redeemedAt: null };
    }
    console.error('[balancoService] Erro ao obter progresso de trilhas:', error);
    throw error;
  }
}

/**
 * Resgata um item da trilha de leitura conforme a especificação OpenAPI.
 */
export async function redeemTrailItem(itemKey = TRAIL_ITEM_KEYS.LIVRO_1) {
  if (!ALLOWED_ITEM_KEYS.includes(itemKey)) {
    throw new Error(`ItemKey inválido '${itemKey}'. Valores aceitos: ${ALLOWED_ITEM_KEYS.join(', ')}`);
  }
  try {
    const { data } = await api.post('/trails/redeem', { itemKey });
    return data;
  } catch (error) {
    const status = error?.response?.status;
    if (status === 401) {
      const err = new Error('Autenticação necessária para resgatar este item.');
      err.status = 401;
      throw err;
    }
    if (status === 404) {
      const err = new Error('Usuário ou recurso não encontrado.');
      err.status = 404;
      throw err;
    }
    console.error('[balancoService] Erro ao resgatar item da trilha:', error);
    throw error;
  }
}


