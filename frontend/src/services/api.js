/**
 * Cliente HTTP centralizado para comunicação com a API Flask.
 *
 * Utiliza fetch nativo, lê a URL base de variável de ambiente,
 * trata respostas com erro, JSON, 204 Sem Conteúdo e erros de rede.
 */
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const buildUrl = (path) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const normalizedBase = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
  return `${normalizedBase}${normalizedPath}`;
};

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

const handleResponse = async (response) => {
  const contentType = response.headers.get('content-type') || '';

  if (response.status === 204) {
    return null;
  }

  if (!contentType.includes('application/json')) {
    const text = await response.text();
    if (!response.ok) {
      throw new ApiError(text || `Erro HTTP ${response.status}`, response.status, text);
    }
    return text;
  }

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      data?.error || `Erro HTTP ${response.status}`,
      response.status,
      data
    );
  }

  return data;
};

const request = async (method, path, body = null, options = {}) => {
  const url = buildUrl(path);
  const headers = {};

  if (body !== null && body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body !== null && body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
      ...options,
    });

    return await handleResponse(response);
  } catch (error) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      throw new ApiError('Tempo limite da requisição excedido', 408, null);
    }

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError('Erro de rede ao contatar a API', 0, error.message);
  }
};

export const api = {
  get: (path, options) => request('GET', path, null, options),
  post: (path, body, options) => request('POST', path, body, options),
  put: (path, body, options) => request('PUT', path, body, options),
  delete: (path, options) => request('DELETE', path, null, options),
};

export { ApiError };