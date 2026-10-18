/**
 * Camada de serviço para Projetos.
 *
 * Reutiliza o cliente HTTP centralizado (api.js) para consumir os endpoints
 * do CRUD de Projetos da API Flask. Todas as funções preservam os erros HTTP
 * (lançando ApiError) para que os componentes React possam tratá-los.
 *
 * Endpoints utilizados:
 *   GET    /api/projects/      → listar todos os projetos
 *   GET    /api/projects/:id   → consultar um projeto por ID
 *   POST   /api/projects/      → criar um novo projeto
 *   PUT    /api/projects/:id   → atualizar um projeto existente
 *   DELETE /api/projects/:id   → excluir um projeto
 */

import { api } from './api.js';

const PROJECTS_PATH = '/projects';

/**
 * Lista todos os projetos cadastrados.
 *
 * @returns {Promise<Array>} Array de objetos de projeto com campos id, name, description, created_at.
 * @throws {ApiError} Se a requisição falhar.
 */
export async function listProjects() {
  return api.get(`${PROJECTS_PATH}/`);
}

/**
 * Consulta um projeto específico pelo ID.
 *
 * @param {number|string} id - Identificador do projeto.
 * @returns {Promise<Object>} Objeto do projeto com campos id, name, description, created_at.
 * @throws {ApiError} Se o projeto não existir (404) ou a requisição falhar.
 */
export async function getProject(id) {
  return api.get(`${PROJECTS_PATH}/${id}`);
}

/**
 * Cria um novo projeto.
 *
 * @param {Object} data - Dados do projeto.
 * @param {string} data.name - Nome do projeto (obrigatório, max 255 caracteres).
 * @param {string} [data.description] - Descrição opcional do projeto.
 * @returns {Promise<Object>} Objeto do projeto criado com id, name, description, created_at.
 * @throws {ApiError} Se a validação falhar (400) ou a requisição falhar.
 */
export async function createProject(data) {
  return api.post(`${PROJECTS_PATH}/`, data);
}

/**
 * Atualiza um projeto existente (suporte a atualização parcial).
 *
 * @param {number|string} id - Identificador do projeto.
 * @param {Object} data - Campos a serem atualizados.
 * @param {string} [data.name] - Novo nome do projeto.
 * @param {string} [data.description] - Nova descrição do projeto.
 * @returns {Promise<Object>} Objeto do projeto atualizado com id, name, description, created_at.
 * @throws {ApiError} Se o projeto não existir (404), a validação falhar (400) ou a requisição falhar.
 */
export async function updateProject(id, data) {
  return api.put(`${PROJECTS_PATH}/${id}`, data);
}

/**
 * Exclui um projeto pelo ID.
 *
 * @param {number|string} id - Identificador do projeto.
 * @returns {Promise<null>} Resolve com null quando a exclusão é bem-sucedida (204 No Content).
 * @throws {ApiError} Se o projeto não existir (404) ou a requisição falhar.
 */
export async function deleteProject(id) {
  return api.delete(`${PROJECTS_PATH}/${id}`);
}