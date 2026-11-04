/**
 * Camada de serviço para Casos de Teste.
 *
 * Reutiliza o cliente HTTP centralizado (api.js) para consumir os endpoints
 * do CRUD de Casos de Teste da API Flask. Todas as funções preservam os erros
 * HTTP (lançando ApiError) para que os componentes React possam tratá-los.
 *
 * Endpoints utilizados:
 *   GET    /api/testcases/      → listar todos os casos (opcional ?project_id=)
 *   GET    /api/testcases/:id   → consultar um caso por ID
 *   POST   /api/testcases/      → criar um novo caso de teste
 *   PUT    /api/testcases/:id   → atualizar um caso existente
 *   DELETE /api/testcases/:id   → excluir um caso de teste
 */

import { api } from './api.js';

const TEST_CASES_PATH = '/testcases';

/**
 * Lista todos os casos de teste cadastrados.
 *
 * @param {number|string} [projectId] - Se informado, filtra casos pelo projeto.
 * @returns {Promise<Array>} Array de objetos de caso de teste com campos id, project_id, title, description, steps, expected_result, priority, created_at e last_execution (resultado da execucao mais recente valida ou null).
 * @throws {ApiError} Se a requisição falhar.
 */
export async function listTestCases(projectId) {
  const path = projectId !== undefined && projectId !== null
    ? `${TEST_CASES_PATH}/?project_id=${projectId}`
    : `${TEST_CASES_PATH}/`;
  return api.get(path);
}

/**
 * Consulta um caso de teste específico pelo ID.
 *
 * @param {number|string} id - Identificador do caso de teste.
 * @returns {Promise<Object>} Objeto do caso de teste.
 * @throws {ApiError} Se o caso não existir (404) ou a requisição falhar.
 */
export async function getTestCase(id) {
  return api.get(`${TEST_CASES_PATH}/${id}`);
}

/**
 * Cria um novo caso de teste.
 *
 * @param {Object} data - Dados do caso de teste.
 * @param {number} data.project_id - ID do projeto (obrigatório, deve existir).
 * @param {string} data.title - Título do caso (obrigatório, max 255 caracteres).
 * @param {string} [data.description] - Descrição opcional.
 * @param {string} [data.steps] - Passos para executar o teste.
 * @param {string} [data.expected_result] - Resultado esperado.
 * @param {string} [data.priority] - Prioridade: 'Low', 'Medium' ou 'High' (default 'Medium').
 * @returns {Promise<Object>} Objeto do caso criado com id, project_id, title, description, steps, expected_result, priority, created_at.
 * @throws {ApiError} Se a validação falhar (400) ou a requisição falhar.
 */
export async function createTestCase(data) {
  return api.post(`${TEST_CASES_PATH}/`, data);
}

/**
 * Atualiza um caso de teste existente (suporte a atualização parcial).
 *
 * @param {number|string} id - Identificador do caso de teste.
 * @param {Object} data - Campos a serem atualizados.
 * @returns {Promise<Object>} Objeto do caso atualizado.
 * @throws {ApiError} Se o caso não existir (404), a validação falhar (400) ou a requisição falhar.
 */
export async function updateTestCase(id, data) {
  return api.put(`${TEST_CASES_PATH}/${id}`, data);
}

/**
 * Exclui um caso de teste pelo ID.
 *
 * @param {number|string} id - Identificador do caso de teste.
 * @returns {Promise<null>} Resolve com null quando a exclusão é bem-sucedida (204 No Content).
 * @throws {ApiError} Se o caso não existir (404) ou a requisição falhar.
 */
export async function deleteTestCase(id) {
  return api.delete(`${TEST_CASES_PATH}/${id}`);
}