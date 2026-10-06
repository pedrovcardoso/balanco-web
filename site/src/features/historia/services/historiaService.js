import { getToken } from '../../../lib/auth.js';

const API_URL = (
  import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'
).replace(/\/$/, '');

const READ_TIMEOUT = 30000;
const WRITE_TIMEOUT = 120000;

async function request(path, options = {}) {
  const controller = new AbortController();
  const timeout = window.setTimeout(
    () => controller.abort(),
    options.timeout || READ_TIMEOUT,
  );

  const token = getToken();
  const url = `${API_URL}${path}`;

  const headers = {
    Accept: 'application/json',
    ...options.headers,
  };

  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      method: options.method || 'GET',
      headers,
      body:
        options.body === undefined
          ? undefined
          : JSON.stringify(options.body),
      signal: controller.signal,
      credentials: 'include',
      cache: 'no-store',
    });

    const responseText = await response.text();
    let responseData = null;

    if (responseText) {
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = responseText;
      }
    }

    if (!response.ok) {
      const message =
        responseData?.detail ||
        responseData?.message ||
        responseData?.error ||
        `HTTP ${response.status}`;

      const error = new Error(String(message));
      error.status = response.status;
      error.data = responseData;
      throw error;
    }

    return responseData;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error(
        `Tempo limite excedido ao acessar ${url}.`,
      );
    } 

    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
}

export async function getReadingProgress(slug, totalPages) {
  const params = new URLSearchParams({
    total_pages: String(totalPages),
  });

  return request(
    `/trails/reading/${encodeURIComponent(slug)}?${params.toString()}`,
  );
}

export async function saveReadingProgress(payload) {
  return request('/trails/reading', {
    method: 'POST',
    body: payload,
    timeout: WRITE_TIMEOUT,
  });
}

export async function completeTrail(slug) {
  return request(
    `/trails/${encodeURIComponent(slug)}/complete`,
    {
      method: 'POST',
      timeout: WRITE_TIMEOUT,
    },
  );
}
