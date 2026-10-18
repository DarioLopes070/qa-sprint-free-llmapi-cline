import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

/**
 * Diálogo de confirmação para exclusão de projetos.
 *
 * Não realiza chamadas HTTP. O componente pai controla o estado de exclusão,
 * o resultado da operação e o fechamento do diálogo.
 *
 * @param {Object}   project    - Projeto a ser excluído (null para não renderizar).
 * @param {Function} onConfirm  - Callback chamado com o projeto ao confirmar.
 * @param {Function} onCancel   - Callback chamado ao cancelar.
 * @param {boolean}  deleting   - Indica se a exclusão está em andamento.
 * @param {string}   error      - Mensagem de erro recebida do componente pai.
 */
export const DeleteConfirmDialog = ({ project, onConfirm, onCancel, deleting, error }) => {
  const dialogRef = useRef(null);
  const cancelButtonRef = useRef(null);
  const previousFocusRef = useRef(null);

  // Fecha o diálogo com Escape quando não estiver excluindo
  useEffect(() => {
    if (!project) {
      return;
    }

    // Salva o elemento com foco antes de abrir o diálogo
    previousFocusRef.current = document.activeElement;

    // Direciona o foco para o botão Cancelar ao abrir
    const handleFocus = () => {
      if (cancelButtonRef.current) {
        cancelButtonRef.current.focus();
      }
    };

    requestAnimationFrame(handleFocus);

    const handleKeydown = (event) => {
      if (event.key === 'Escape' && !deleting) {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleKeydown);

    return () => {
      document.removeEventListener('keydown', handleKeydown);

      // Restaura o foco ao elemento anterior ao fechar
      if (previousFocusRef.current && previousFocusRef.current.focus) {
        previousFocusRef.current.focus();
      }
    };
  }, [project, deleting, onCancel]);

  if (!project) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
      aria-describedby="delete-dialog-description"
      className="card"
      ref={dialogRef}
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1000,
        maxWidth: '90%',
        width: '440px',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      }}
    >
      <div style={{ padding: '1.5rem' }}>
        <h2
          id="delete-dialog-title"
          style={{
            fontSize: '1.125rem',
            fontWeight: 700,
            color: '#111827',
            margin: '0 0 0.5rem 0',
          }}
        >
          Excluir projeto?
        </h2>

        <p
          id="delete-dialog-description"
          style={{
            fontSize: '0.875rem',
            color: '#374151',
            margin: '0 0 1rem 0',
          }}
        >
          Tem certeza de que deseja excluir o projeto <strong>{project.name}</strong>?
        </p>

        <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0 0 1rem 0' }}>
          Esta ação é permanente e não pode ser desfeita.
        </p>

        <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0 0 1rem 0' }}>
          Test Cases e Bugs associados a este projeto também serão excluídos.
        </p>

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
              marginBottom: '1rem',
            }}
          >
            {error}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
          <button
            type="button"
            ref={cancelButtonRef}
            onClick={onCancel}
            disabled={deleting}
            className="btn btn-outline"
            style={{
              opacity: deleting ? 0.6 : 1,
            }}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => onConfirm(project)}
            disabled={deleting}
            className="btn btn-danger"
            style={{
              opacity: deleting ? 0.6 : 1,
            }}
          >
            {deleting ? 'Excluindo...' : 'Excluir projeto'}
          </button>
        </div>
      </div>
    </div>
  );
};

DeleteConfirmDialog.propTypes = {
  project: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
  }),
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  deleting: PropTypes.bool,
  error: PropTypes.string,
};

DeleteConfirmDialog.defaultProps = {
  project: null,
  deleting: false,
  error: null,
};