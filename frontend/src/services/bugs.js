/**
 * Camada de serviço para Bugs.
 *
 * Reutiliza o cliente HTTP centralizado (api.js) para consumir os endpoints
 * do CRUD de Bugs da API Flask. Todas as funcoes preservam os erros HTTP
 * (lancando ApiError) para que os componentes React possam trata-los.
 *
 * Endpoints utilizados:
 *   GET    /api/bugs/      -> listar bugs (com filtros opcionais)
 *   POST   /api/bugs/      -> criar um novo bug
 *   PUT    /api/bugs/:id   -> atualizar um bug existente
 *   DELETE /api/bugs/:id   -> excluir um bug (responde 204 Sem Conteúdo)
 */

import { api } from './api.js';

const BUGS_PATH = '/bugs';

/**
 * Lista todos os bugs cadastrados, com filtros opcionais.
 *
 * @param {Object} [params] - Parametros de filtro opcionais.
 * @param {number|string} [params.project_id] - Filtrar por projeto.
 * @param {number|string} [params.test_case_id] - Filtrar por caso de teste.
 * @param {string} [params.severity] - Filtrar por severidade.
 * @param {string} [params.status] - Filtrar por status.
 * @returns {Promise<Array>} Array de objetos de bug com campos id, project_id, test_case_id,
 *   title, description, severity, status, created_at, resolved_at.
 * @throws {ApiError} Se a requisicao falhar.
 */
export async function listBugs(params = {}) {
  const searchParams = new URLSearchParams();

  if (params.project_id !== undefined && params.project_id !== null && params.project_id !== '') {
    searchParams.append('project_id', String(params.project_id));
  }
  if (params.test_case_id !== undefined && params.test_case_id !== null && params.test_case_id !== '') {
    searchParams.append('test_case_id', String(params.test_case_id));
  }
  if (params.severity) {
    searchParams.append('severity', params.severity);
  }
  if (params.status) {
    searchParams.append('status', params.status);
  }

  const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
  return api.get(`${BUGS_PATH}/${query}`);
}

/**
 * Cria um novo bug.
 *
 * @param {Object} data - Dados do bug.
 * @param {number} data.project_id - ID do projeto (obrigatorio).
 * @param {string} data.title - Titulo do bug (obrigatorio, max 255 caracteres).
 * @param {number} [data.test_case_id] - ID do caso de teste associado (opcional).
 * @param {string} [data.description] - Descricao opcional.
 * @param {string} [data.severity] - Severidade: 'Low', 'Medium', 'High' ou 'Critical' (default 'Medium').
 * @param {string} [data.status] - Status: 'Open', 'In Progress', 'Resolved' ou 'Closed' (default 'Open').
 * @returns {Promise<Object>} Objeto do bug criado.
 * @throws {ApiError} Se a validacao falhar (400) ou a requisicao falhar.
 */
export async function createBug(data) {
  return api.post(`${BUGS_PATH}/`, data);
}

/**
 * Atualiza um bug existente (suporte a atualizacao parcial).
 *
 * @param {number|string} id - Identificador do bug.
 * @param {Object} data - Campos a serem atualizados.
 * @param {number} [data.test_case_id] - Novo ID do caso de teste.
 * @param {string} [data.title] - Novo titulo do bug.
 * @param {string} [data.description] - Nova descricao.
 * @param {string} [data.severity] - Nova severidade.
 * @param {string} [data.status] - Novo status.
 * @returns {Promise<Object>} Objeto do bug atualizado.
 * @throws {ApiError} Se o bug nao existir (404), a validacao falhar (400) ou a requisicao falhar.
 */
export async function updateBug(id, data) {
  return api.put(`${BUGS_PATH}/${id}`, data);
}

/**
 * Exclui um bug pelo ID.
 *
 * @param {number|string} id - Identificador do bug.
 * @returns {Promise<null>} Resolve com null quando a API responde 204 Sem Conteúdo.
 * @throws {ApiError} Se o bug não existir (404) ou a requisição falhar.
 *
 * Nota: o endpoint de exclusão retorna HTTP 204 sem corpo. O cliente HTTP
 * (api.delete) já trata o status 204 retornando null, sem tentar interpretar
 * um corpo JSON inexistente.
 */
export async function deleteBug(id) {
  return api.delete(`${BUGS_PATH}/${id}`);
}