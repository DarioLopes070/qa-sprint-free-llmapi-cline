/**
 * Camada de serviço para Execuções de Teste.
 *
 * Reutiliza o cliente HTTP centralizado (api.js) para consumir os endpoints
 * do CRUD de Execuções de Teste da API Flask. Todas as funções preservam os
 * erros HTTP (lançando ApiError) para que os componentes React possam
 * tratá-los.
 *
 * Endpoints utilizados:
 *   GET    /api/executions/      → listar execuções (opcional ?test_case_id=)
 *   GET    /api/executions/:id   → consultar uma execução por ID
 *   POST   /api/executions/      → criar uma nova execução
 *   PUT    /api/executions/:id   → atualizar uma execução existente
 *   DELETE /api/executions/:id   → excluir uma execução
 */

import { api } from './api.js';

const EXECUTIONS_PATH = '/executions';

/**
 * Lista todas as execuções de teste cadastradas.
 *
 * @param {number|string} [testCaseId] - Se informado, filtra execuções pelo caso de teste.
 * @returns {Promise<Array>} Array de objetos de execução com campos id, test_case_id, status, executed_at, executed_by, actual_result, notes.
 * @throws {ApiError} Se a requisição falhar.
 */
export async function listExecutions(testCaseId) {
  const path = testCaseId !== undefined && testCaseId !== null
    ? `${EXECUTIONS_PATH}/?test_case_id=${testCaseId}`
    : `${EXECUTIONS_PATH}/`;
  return api.get(path);
}

/**
 * Consulta uma execução de teste específica pelo ID.
 *
 * @param {number|string} id - Identificador da execução.
 * @returns {Promise<Object>} Objeto da execução.
 * @throws {ApiError} Se a execução não existir (404) ou a requisição falhar.
 */
export async function getExecution(id) {
  return api.get(`${EXECUTIONS_PATH}/${id}`);
}

/**
 * Cria uma nova execução de teste.
 *
 * @param {Object} data - Dados da execução.
 * @param {number} data.test_case_id - ID do caso de teste (obrigatório, deve existir).
 * @param {string} data.status - Status da execução (obrigatório: 'Passed', 'Failed', 'Blocked' ou 'Not Run').
 * @param {string} [data.executed_by] - Nome de quem executou o teste.
 * @param {string} [data.actual_result] - Resultado real obtido na execução.
 * @param {string} [data.notes] - Observações adicionais.
 * @returns {Promise<Object>} Objeto da execução criada com id e executed_at.
 * @throws {ApiError} Se a validação falhar (400) ou a requisição falhar.
 */
export async function createExecution(data) {
  return api.post(`${EXECUTIONS_PATH}/`, data);
}

/**
 * Atualiza uma execução de teste existente (suporte a atualização parcial).
 *
 * @param {number|string} id - Identificador da execução.
 * @param {Object} data - Campos a serem atualizados.
 * @param {string} [data.status] - Novo status da execução.
 * @param {string} [data.executed_by] - Novo nome de quem executou o teste.
 * @param {string} [data.actual_result] - Novo resultado real.
 * @param {string} [data.notes] - Novas observações.
 * @returns {Promise<Object>} Objeto da execução atualizada.
 * @throws {ApiError} Se a execução não existir (404), a validação falhar (400) ou a requisição falhar.
 */
export async function updateExecution(id, data) {
  return api.put(`${EXECUTIONS_PATH}/${id}`, data);
}

/**
 * Exclui uma execução de teste pelo ID.
 *
 * @param {number|string} id - Identificador da execução.
 * @returns {Promise<null>} Resolve com null quando a exclusão é bem-sucedida (204 No Content).
 * @throws {ApiError} Se a execução não existir (404) ou a requisição falhar.
 */
export async function deleteExecution(id) {
  return api.delete(`${EXECUTIONS_PATH}/${id}`);
}