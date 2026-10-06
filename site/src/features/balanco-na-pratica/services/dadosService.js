import api from '../../../lib/api.js';

function extractData(response) {
  const payload = response?.data;

  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.rows)) return payload.rows;

  return payload;
}

export async function getResumoBalanco() {
  const response = await api.get('/dados/resumo');
  return extractData(response);
}

export async function getExecucaoRegioes() {
  const response = await api.get('/dados/regioes');
  return extractData(response) || [];
}

export async function getMunicipios() {
  const response = await api.get('/dados/municipios');
  return extractData(response) || [];
}


export async function getPopulacao() {
  const response = await api.get('/dados/populacao');
  return extractData(response) || [];
}

export async function getExecucaoOds() {
  const response = await api.get('/dados/ods');
  return extractData(response) || [];
}

export async function getFuncoes() {
  const response = await api.get('/dados/funcoes');
  return extractData(response) || [];
}

export async function getUos() {
  const response = await api.get('/dados/uos');
  return extractData(response) || [];
}
