import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const STATUS_OPTIONS = [
  { label: 'Aprovado', value: 'Passed' },
  { label: 'Reprovado', value: 'Failed' },
  { label: 'Bloqueado', value: 'Blocked' },
];

export const TestExecutionForm = ({ execution, testCases, onSave, onCancel, saving, error }) => {
  const [formData, setFormData] = useState({
    test_case_id: execution?.test_case_id || '',
    status: execution?.status || '',
    executed_by: execution?.executed_by || '',
    actual_result: execution?.actual_result || '',
    notes: execution?.notes || '',
  });
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    setFormData({
      test_case_id: execution?.test_case_id || '',
      status: execution?.status || '',
      executed_by: execution?.executed_by || '',
      actual_result: execution?.actual_result || '',
      notes: execution?.notes || '',
    });
    setFieldErrors({});
  }, [execution]);

  const validate = () => {
    const errors = {};

    if (!execution) {
      if (!formData.test_case_id) {
        errors.test_case_id = 'O caso de teste é obrigatório.';
      } else if (isNaN(Number(formData.test_case_id))) {
        errors.test_case_id = 'O caso de teste deve ser um número válido.';
      }
    }

    if (!formData.status) {
      errors.status = 'O status é obrigatório.';
    } else if (!STATUS_OPTIONS.some((s) => s.value === formData.status)) {
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
      status: formData.status,
      executed_by: formData.executed_by.trim() || null,
      actual_result: formData.actual_result.trim() || null,
      notes: formData.notes.trim() || null,
    };

    if (!execution) {
      payload.test_case_id = Number(formData.test_case_id);
    }

    onSave(payload);
  };

  const selectedTestCase = execution
    ? (testCases || []).find((tc) => tc.id === execution.test_case_id)
    : (testCases || []).find((tc) => tc.id === Number(formData.test_case_id || 0));

  const formatDateBrazilian = (isoString) => {
    if (!isoString) return '—';
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return '—';
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(date);
    } catch {
      return '—';
    }
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
          color: 'var(--color-text)',
          margin: 0,
        }}
      >
        {execution ? 'Editar Execução' : 'Nova Execução'}
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label
          htmlFor="execution-test-case"
          style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: 'var(--color-text)',
          }}
        >
          Caso de Teste <span style={{ color: 'var(--color-danger)' }}>*</span>
        </label>
        {execution ? (
          <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
            {selectedTestCase?.title || `Caso #${execution.test_case_id}`}
          </div>
        ) : (
          <>
            <select
              id="execution-test-case"
              name="test_case_id"
              value={formData.test_case_id}
              onChange={handleChange}
              disabled={saving}
              className="input"
            >
              <option value="">Selecione um caso de teste</option>
              {(testCases || []).map((tc) => (
                <option key={tc.id} value={tc.id}>
                  {tc.title}
                </option>
              ))}
            </select>
            {fieldErrors.test_case_id && (
              <span
                role="alert"
                aria-live="polite"
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--color-danger)',
                  marginTop: '0.125rem',
                }}
              >
                {fieldErrors.test_case_id}
              </span>
            )}
          </>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label
          htmlFor="execution-status"
          style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: 'var(--color-text)',
          }}
        >
          Status <span style={{ color: 'var(--color-danger)' }}>*</span>
        </label>
        <select
          id="execution-status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          disabled={saving}
          className="input"
        >
          <option value="">Selecione um status</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        {fieldErrors.status && (
          <span
            role="alert"
            aria-live="polite"
            style={{
              fontSize: '0.75rem',
              color: 'var(--color-danger)',
              marginTop: '0.125rem',
            }}
          >
            {fieldErrors.status}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label
          htmlFor="execution-executed-by"
          style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: 'var(--color-text)',
          }}
        >
          Executado por
        </label>
        <input
          id="execution-executed-by"
          name="executed_by"
          type="text"
          value={formData.executed_by}
          onChange={handleChange}
          placeholder="Nome de quem executou o teste"
          disabled={saving}
          className="input"
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label
          htmlFor="execution-actual-result"
          style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: 'var(--color-text)',
          }}
        >
          Resultado Real
        </label>
        <textarea
          id="execution-actual-result"
          name="actual_result"
          value={formData.actual_result}
          onChange={handleChange}
          placeholder="Resultado real obtido na execução"
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
          htmlFor="execution-notes"
          style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: 'var(--color-text)',
          }}
        >
          Notas
        </label>
        <textarea
          id="execution-notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Observações adicionais"
          rows={3}
          disabled={saving}
          className="input"
          style={{
            resize: 'vertical',
          }}
        />
      </div>

      {execution && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label
            htmlFor="execution-executed-at"
            style={{
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'var(--color-text)',
            }}
          >
            Data da Execução
          </label>
          <div
            id="execution-executed-at"
            style={{
              fontSize: '0.875rem',
              color: 'var(--color-text-secondary)',
              backgroundColor: 'var(--color-surface-hover)',
              padding: '0.5rem 0.75rem',
              borderRadius: '0.375rem',
            }}
          >
            {formatDateBrazilian(execution.executed_at)}
          </div>
        </div>
      )}

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
          {saving ? 'Salvando...' : execution ? 'Salvar alterações' : 'Criar execução'}
        </button>
      </div>
    </form>
  );
};

TestExecutionForm.propTypes = {
  execution: PropTypes.shape({
    id: PropTypes.number,
    test_case_id: PropTypes.number,
    status: PropTypes.string,
    executed_at: PropTypes.string,
    executed_by: PropTypes.string,
    actual_result: PropTypes.string,
    notes: PropTypes.string,
  }),
  testCases: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      title: PropTypes.string.isRequired,
    })
  ).isRequired,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  saving: PropTypes.bool,
  error: PropTypes.string,
};

TestExecutionForm.defaultProps = {
  execution: null,
  saving: false,
  error: null,
};

