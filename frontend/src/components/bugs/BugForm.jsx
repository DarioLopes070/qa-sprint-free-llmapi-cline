import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const SEVERITY_OPTIONS = [
  { label: 'Baixa', value: 'Low' },
  { label: 'Média', value: 'Medium' },
  { label: 'Alta', value: 'High' },
  { label: 'Crítica', value: 'Critical' },
];

const STATUS_OPTIONS = [
  { label: 'Aberto', value: 'Open' },
  { label: 'Em Andamento', value: 'In Progress' },
  { label: 'Resolvido', value: 'Resolved' },
  { label: 'Fechado', value: 'Closed' },
];

export const BugForm = ({
  bug,
  projects,
  testCases,
  onSave,
  onCancel,
  saving,
  error,
}) => {
  const isCreating = !bug;

  const [formData, setFormData] = useState({
    project_id: isCreating ? '' : bug?.project_id || '',
    test_case_id: isCreating ? '' : bug?.test_case_id || '',
    title: isCreating ? '' : bug?.title || '',
    description: isCreating ? '' : bug?.description || '',
    severity: isCreating ? 'Medium' : bug?.severity || 'Medium',
    status: isCreating ? 'Open' : bug?.status || 'Open',
  });
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    setFormData({
      project_id: isCreating ? '' : bug?.project_id || '',
      test_case_id: isCreating ? '' : bug?.test_case_id || '',
      title: isCreating ? '' : bug?.title || '',
      description: isCreating ? '' : bug?.description || '',
      severity: isCreating ? 'Medium' : bug?.severity || 'Medium',
      status: isCreating ? 'Open' : bug?.status || 'Open',
    });
    setFieldErrors({});
  }, [bug, isCreating]);

  const validate = () => {
    const errors = {};

    if (!formData.project_id) {
      errors.project_id = 'O projeto é obrigatório.';
    }

    if (!formData.title || !formData.title.trim()) {
      errors.title = 'O título é obrigatório.';
    } else if (formData.title.trim().length > 255) {
      errors.title = 'O título não pode exceder 255 caracteres.';
    }

    if (formData.test_case_id) {
      const testCase = (testCases || []).find(
        (tc) => tc.id === Number(formData.test_case_id)
      );
      if (!testCase) {
        errors.test_case_id = 'O caso de teste selecionado não é válido.';
      } else if (Number(testCase.project_id) !== Number(formData.project_id)) {
        errors.test_case_id = 'O caso de teste não pertence ao projeto selecionado.';
      }
    }

    if (
      formData.severity &&
      !SEVERITY_OPTIONS.some((s) => s.value === formData.severity)
    ) {
      errors.severity = 'Severidade inválida.';
    }

    if (
      formData.status &&
      !STATUS_OPTIONS.some((s) => s.value === formData.status)
    ) {
      errors.status = 'Status inválido.';
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

    if (name === 'project_id') {
      const newProjectId = value;
      const currentTestCaseId = formData.test_case_id;
      if (currentTestCaseId) {
        const testCaseBelongs = (testCases || []).some(
          (tc) => tc.id === Number(currentTestCaseId) && tc.project_id === newProjectId
        );
        if (!testCaseBelongs) {
          setFormData((prev) => ({ ...prev, test_case_id: '' }));
        }
      }
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

    const payload = {
      project_id: Number(formData.project_id),
      title: formData.title.trim(),
      description: formData.description.trim() || null,
      severity: formData.severity,
      status: formData.status,
    };

    if (formData.test_case_id) {
      payload.test_case_id = Number(formData.test_case_id);
    }

    if (!isCreating) {
      delete payload.project_id;
    }

    onSave(payload);
  };

  const filteredTestCases = isCreating || !formData.project_id
    ? (testCases || []).filter(
        (tc) => !formData.project_id || tc.project_id === Number(formData.project_id)
      )
    : (testCases || []).filter(
        (tc) => tc.project_id === Number(formData.project_id)
      );

  const selectedProject = (projects || []).find(
    (p) => p.id === Number(formData.project_id || 0)
  );

  const selectedTestCase = formData.test_case_id
    ? (testCases || []).find((tc) => tc.id === Number(formData.test_case_id))
    : null;

  return (
    <form
      onSubmit={handleSubmit}
      className="card"
      style={{
        width: '100%',
        maxWidth: '600px',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        backgroundColor: 'var(--color-surface)',
        borderRadius: '0.5rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      }}
    >
      <h2
        style={{
          fontSize: '1.25rem',
          fontWeight: 600,
          color: 'var(--color-text)',
          margin: 0,
        }}
      >
        {isCreating ? 'Novo Bug' : 'Editar Bug'}
      </h2>

      {error && (
        <div
          role="alert"
          aria-live="assertive"
          style={{
            backgroundColor: 'var(--color-danger-bg)',
            border: '1px solid var(--color-danger-border)',
            color: 'var(--color-danger-text)',
            padding: '0.75rem',
            borderRadius: '0.375rem',
            fontSize: '0.875rem',
          }}
        >
          {error}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label
          htmlFor="bug-project"
          style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: 'var(--color-text)',
          }}
        >
          Projeto
        </label>
        <select
          id="bug-project"
          name="project_id"
          value={formData.project_id}
          onChange={handleChange}
          disabled={saving || !isCreating}
          className="input"
          style={{
            padding: '0.5rem 0.75rem',
            border: '1px solid var(--color-border)',
            borderRadius: '0.375rem',
            fontSize: '0.875rem',
            backgroundColor: !isCreating ? 'var(--color-surface-hover)' : 'var(--color-surface)',
            cursor: !isCreating ? 'not-allowed' : 'pointer',
            width: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          <option value="">Selecione um projeto</option>
          {(projects || []).map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
        {fieldErrors.project_id && (
          <span style={{ fontSize: '0.75rem', color: 'var(--color-danger)' }}>
            {fieldErrors.project_id}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label
          htmlFor="bug-test-case"
          style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: 'var(--color-text)',
          }}
        >
          Caso de Teste
        </label>
        <select
          id="bug-test-case"
          name="test_case_id"
          value={formData.test_case_id}
          onChange={handleChange}
          disabled={saving || !formData.project_id}
          className="input"
          style={{
            padding: '0.5rem 0.75rem',
            border: '1px solid var(--color-border)',
            borderRadius: '0.375rem',
            fontSize: '0.875rem',
            backgroundColor: !formData.project_id ? 'var(--color-surface-hover)' : 'var(--color-surface)',
            cursor: !formData.project_id ? 'not-allowed' : 'pointer',
            width: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          <option value="">Nenhum (opcional)</option>
          {filteredTestCases.map((tc) => (
            <option key={tc.id} value={tc.id}>
              {tc.title}
            </option>
          ))}
        </select>
        {fieldErrors.test_case_id && (
          <span style={{ fontSize: '0.75rem', color: 'var(--color-danger)' }}>
            {fieldErrors.test_case_id}
          </span>
        )}
        <div style={{ minHeight: '1.25rem' }}>
          {!formData.project_id && (
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
              Selecione um projeto primeiro para ver os casos de teste disponíveis.
            </span>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label
          htmlFor="bug-title"
          style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: 'var(--color-text)',
          }}
        >
          Título
        </label>
        <input
          id="bug-title"
          name="title"
          type="text"
          value={formData.title}
          onChange={handleChange}
          placeholder="Título do bug"
          maxLength="255"
          disabled={saving}
          className="input"
          style={{
            padding: '0.5rem 0.75rem',
            border: '1px solid var(--color-border)',
            borderRadius: '0.375rem',
            fontSize: '0.875rem',
          }}
        />
        {fieldErrors.title && (
          <span style={{ fontSize: '0.75rem', color: 'var(--color-danger)' }}>
            {fieldErrors.title}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label
          htmlFor="bug-description"
          style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: 'var(--color-text)',
          }}
        >
          Descrição
        </label>
        <textarea
          id="bug-description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Descrição detalhada do bug"
          rows={3}
          disabled={saving}
          className="input"
          style={{
            padding: '0.5rem 0.75rem',
            border: '1px solid var(--color-border)',
            borderRadius: '0.375rem',
            fontSize: '0.875rem',
            resize: 'vertical',
          }}
        />
        {fieldErrors.description && (
          <span style={{ fontSize: '0.75rem', color: 'var(--color-danger)' }}>
            {fieldErrors.description}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label
          htmlFor="bug-severity"
          style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: 'var(--color-text)',
          }}
        >
          Severidade
        </label>
        <select
          id="bug-severity"
          name="severity"
          value={formData.severity}
          onChange={handleChange}
          disabled={saving}
          className="input"
          style={{
            padding: '0.5rem 0.75rem',
            border: '1px solid var(--color-border)',
            borderRadius: '0.375rem',
            fontSize: '0.875rem',
          }}
        >
          {SEVERITY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {fieldErrors.severity && (
          <span style={{ fontSize: '0.75rem', color: 'var(--color-danger)' }}>
            {fieldErrors.severity}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label
          htmlFor="bug-status"
          style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: 'var(--color-text)',
          }}
        >
          Status
        </label>
        <select
          id="bug-status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          disabled={saving}
          className="input"
          style={{
            padding: '0.5rem 0.75rem',
            border: '1px solid var(--color-border)',
            borderRadius: '0.375rem',
            fontSize: '0.875rem',
          }}
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {fieldErrors.status && (
          <span style={{ fontSize: '0.75rem', color: 'var(--color-danger)' }}>
            {fieldErrors.status}
          </span>
        )}
      </div>

      {isCreating && (
        <div style={{ minHeight: '2rem' }}>
          {selectedProject && selectedTestCase && (
            <span
              style={{
                fontSize: '0.75rem',
                color: 'var(--color-text-secondary)',
                backgroundColor: 'var(--color-surface-hover)',
                padding: '0.5rem 0.75rem',
                borderRadius: '0.375rem',
              }}
            >
              Caso de teste pertence ao projeto: {selectedProject.name}
            </span>
          )}
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
          {saving ? 'Salvando...' : isCreating ? 'Criar bug' : 'Salvar alterações'}
        </button>
      </div>
    </form>
  );
};

BugForm.propTypes = {
  bug: PropTypes.shape({
    id: PropTypes.number,
    project_id: PropTypes.number,
    test_case_id: PropTypes.number,
    title: PropTypes.string,
    description: PropTypes.string,
    severity: PropTypes.string,
    status: PropTypes.string,
  }),
  projects: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
    })
  ),
  testCases: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      title: PropTypes.string.isRequired,
      project_id: PropTypes.number.isRequired,
    })
  ),
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  saving: PropTypes.bool,
  error: PropTypes.string,
};

BugForm.defaultProps = {
  bug: null,
  projects: [],
  testCases: [],
  saving: false,
  error: null,
};


