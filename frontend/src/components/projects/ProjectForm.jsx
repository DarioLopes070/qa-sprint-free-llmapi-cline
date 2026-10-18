import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * Formulário reutilizável de Projetos para criação e edição.
 *
 * Funciona em dois modos:
 *   - Criação: quando `project` não é fornecido, os campos iniciam vazios.
 *   - Edição: quando `project` é fornecido, os campos são preenchidos com seus dados.
 *
 * O componente não chama a API diretamente. Ao salvar, valida os campos
 * client-side e invoca o callback `onSave` com os dados validados.
 * O componente pai controla o resultado da operação (sucesso, erro, fechamento).
 *
 * @param {Object}   project   - Projeto em edição (opcional).
 * @param {Function} onSave    - Callback chamado com os dados validados ao salvar.
 * @param {Function} onCancel  - Callback chamado ao cancelar.
 * @param {boolean}  saving    - Indica se uma operação está em andamento.
 * @param {string}   error     - Erro de operação recebido do componente pai.
 */
export const ProjectForm = ({ project, onSave, onCancel, saving, error }) => {
  const MAX_NAME_LENGTH = 255;

  const [formData, setFormData] = useState({
    name: project?.name || '',
    description: project?.description || '',
  });
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    setFormData({
      name: project?.name || '',
      description: project?.description || '',
    });
    setFieldErrors({});
  }, [project]);

  const validate = () => {
    const errors = {};
    const trimmedName = formData.name.trim();

    if (!trimmedName) {
      errors.name = 'O nome do projeto é obrigatório.';
    } else if (formData.name.length > MAX_NAME_LENGTH) {
      errors.name = `O nome não pode exceder ${MAX_NAME_LENGTH} caracteres.`;
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
      name: formData.name.trim(),
      description: formData.description.trim() || null,
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
        {project ? 'Editar Projeto' : 'Novo Projeto'}
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label
          htmlFor="project-name"
          style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#1f2937',
          }}
        >
          Nome do projeto <span style={{ color: '#dc2626' }}>*</span>
        </label>
        <input
          id="project-name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          maxLength={MAX_NAME_LENGTH}
          placeholder="Digite o nome do projeto"
          disabled={saving}
          className="input"
          style={{
            borderColor: fieldErrors.name ? '#dc2626' : undefined,
          }}
        />
        {fieldErrors.name && (
          <span
            role="alert"
            aria-live="polite"
            style={{
              fontSize: '0.75rem',
              color: '#dc2626',
              marginTop: '0.125rem',
            }}
          >
            {fieldErrors.name}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label
          htmlFor="project-description"
          style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#1f2937',
          }}
        >
          Descrição
        </label>
        <textarea
          id="project-description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Descrição opcional do projeto"
          rows={3}
          disabled={saving}
          className="input"
          style={{
            resize: 'vertical',
          }}
        />
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
          {saving ? 'Salvando...' : project ? 'Salvar alterações' : 'Criar projeto'}
        </button>
      </div>
    </form>
  );
};

ProjectForm.propTypes = {
  project: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    description: PropTypes.string,
  }),
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  saving: PropTypes.bool,
  error: PropTypes.string,
};

ProjectForm.defaultProps = {
  project: null,
  saving: false,
  error: null,
};