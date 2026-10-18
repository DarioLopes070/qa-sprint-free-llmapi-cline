import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * Formulário reutilizável de Casos de Teste para Criação e Edição.
 *
 * Funciona em dois modos:
 *   - Criação: quando `testCase` não é fornecido, os campos iniciam vazios.
 *   - Edição: quando `testCase` é fornecido, os campos são preenchidos com seus dados.
 *
 * O componente não chama a API diretamente. Ao salvar, valida os campos
 * client-side e invoca o callback `onSave` com os dados validados.
 * O componente pai controla o resultado da operação (sucesso, erro, fechamento).
 *
 * @param {Object}   testCase - Caso de teste em edição (opcional).
 * @param {Array}    projects - Lista de projetos para o select de projeto (obrigatório).
 * @param {Function} onSave   - Callback chamado com os dados validados ao salvar.
 * @param {Function} onCancel - Callback chamado ao cancelar.
 * @param {boolean}  saving   - Indica se uma operação está em andamento.
 * @param {string}   error    - Erro de operação recebido do componente pai.
 */
const MAX_TITLE_LENGTH = 255;
const PRIORITIES = ['Low', 'Medium', 'High'];

export const TestCaseForm = ({ testCase, projects, onSave, onCancel, saving, error }) => {
  const [formData, setFormData] = useState({
    project_id: testCase?.project_id || '',
    title: testCase?.title || '',
    description: testCase?.description || '',
    steps: testCase?.steps || '',
    expected_result: testCase?.expected_result || '',
    priority: testCase?.priority || 'Medium',
  });
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    setFormData({
      project_id: testCase?.project_id || '',
      title: testCase?.title || '',
      description: testCase?.description || '',
      steps: testCase?.steps || '',
      expected_result: testCase?.expected_result || '',
      priority: testCase?.priority || 'Medium',
    });
    setFieldErrors({});
  }, [testCase]);

  const validate = () => {
    const errors = {};
    const trimmedTitle = formData.title.trim();

    if (!formData.project_id) {
      errors.project_id = 'O projeto é obrigatório.';
    } else if (isNaN(Number(formData.project_id))) {
      errors.project_id = 'O projeto deve ser um número válido.';
    }

    if (!trimmedTitle) {
      errors.title = 'O título é obrigatório.';
    } else if (formData.title.length > MAX_TITLE_LENGTH) {
      errors.title = `O título não pode exceder ${MAX_TITLE_LENGTH} caracteres.`;
    }

    if (formData.priority && !PRIORITIES.includes(formData.priority)) {
      errors.priority = 'Prioridade inválida.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (saving) {
      return;
    }

    if (!validate()) {
      return;
    }

    onSave({
      project_id: Number(formData.project_id),
      title: formData.title.trim(),
      description: formData.description.trim() || null,
      steps: formData.steps.trim() || null,
      expected_result: formData.expected_result.trim() || null,
      priority: formData.priority || 'Medium',
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        maxWidth: '600px',
      }}
    >
      <h2
        style={{
          fontSize: '1.25rem',
          fontWeight: 700,
          color: '#111827',
          margin: 0,
        }}
      >
        {testCase ? 'Editar Caso de Teste' : 'Novo Caso de Teste'}
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label
          htmlFor="testcase-project"
          style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#1f2937',
          }}
        >
          Projeto <span style={{ color: '#dc2626' }}>*</span>
        </label>
        <select
          id="testcase-project"
          name="project_id"
          value={formData.project_id}
          onChange={handleChange}
          disabled={saving}
          className="input"
          style={{
            borderColor: fieldErrors.project_id ? '#dc2626' : undefined,
          }}
        >
          <option value="">Selecione um projeto</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        {fieldErrors.project_id && (
          <span
            role="alert"
            aria-live="polite"
            style={{
              fontSize: '0.75rem',
              color: '#dc2626',
              marginTop: '0.125rem',
            }}
          >
            {fieldErrors.project_id}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label
          htmlFor="testcase-title"
          style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#1f2937',
          }}
        >
          Título <span style={{ color: '#dc2626' }}>*</span>
        </label>
        <input
          id="testcase-title"
          name="title"
          type="text"
          value={formData.title}
          onChange={handleChange}
          maxLength={MAX_TITLE_LENGTH}
          placeholder="Ex.: Validar login com credenciais válidas"
          disabled={saving}
          className="input"
          style={{
            borderColor: fieldErrors.title ? '#dc2626' : undefined,
          }}
        />
        {fieldErrors.title && (
          <span
            role="alert"
            aria-live="polite"
            style={{
              fontSize: '0.75rem',
              color: '#dc2626',
              marginTop: '0.125rem',
            }}
          >
            {fieldErrors.title}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label
          htmlFor="testcase-description"
          style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#1f2937',
          }}
        >
          Descrição
        </label>
        <textarea
          id="testcase-description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Descreva o objetivo deste caso de teste"
          rows={3}
          disabled={saving}
          className="input"
          style={{
            resize: 'vertical',
          }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label
          htmlFor="testcase-steps"
          style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#1f2937',
          }}
        >
          Passos
        </label>
        <textarea
          id="testcase-steps"
          name="steps"
          value={formData.steps}
          onChange={handleChange}
          placeholder="Informe as etapas de execução do teste"
          rows={4}
          disabled={saving}
          className="input"
          style={{
            resize: 'vertical',
          }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label
          htmlFor="testcase-expected"
          style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#1f2937',
          }}
        >
          Resultado Esperado
        </label>
        <textarea
          id="testcase-expected"
          name="expected_result"
          value={formData.expected_result}
          onChange={handleChange}
          placeholder="Descreva o comportamento esperado"
          rows={3}
          disabled={saving}
          className="input"
          style={{
            resize: 'vertical',
          }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label
          htmlFor="testcase-priority"
          style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#1f2937',
          }}
        >
          Prioridade
        </label>
        <select
          id="testcase-priority"
          name="priority"
          value={formData.priority}
          onChange={handleChange}
          disabled={saving}
          className="input"
        >
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        {fieldErrors.priority && (
          <span
            role="alert"
            aria-live="polite"
            style={{
              fontSize: '0.75rem',
              color: '#dc2626',
              marginTop: '0.125rem',
            }}
          >
            {fieldErrors.priority}
          </span>
        )}
      </div>

      {error && (
        <div
          role="alert"
          aria-live="assertive"
          style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            padding: '0.75rem',
            borderRadius: '0.375rem',
            fontSize: '0.875rem',
          }}
        >
          {error}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="btn btn-outline"
          style={{
            opacity: saving ? 0.6 : 1,
          }}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={saving}
          className="btn btn-primary"
          style={{
            opacity: saving ? 0.6 : 1,
          }}
        >
          {saving ? 'Salvando...' : testCase ? 'Salvar alterações' : 'Criar caso de teste'}
        </button>
      </div>
    </form>
  );
};

TestCaseForm.propTypes = {
  testCase: PropTypes.shape({
    id: PropTypes.number,
    project_id: PropTypes.number,
    title: PropTypes.string,
    description: PropTypes.string,
    steps: PropTypes.string,
    expected_result: PropTypes.string,
    priority: PropTypes.string,
  }),
  projects: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  saving: PropTypes.bool,
  error: PropTypes.string,
};

TestCaseForm.defaultProps = {
  testCase: null,
  saving: false,
  error: null,
};



