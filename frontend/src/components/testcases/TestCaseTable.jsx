import React from 'react';
import PropTypes from 'prop-types';

/**
 * Tabela de listagem de Casos de Teste.
 *
 * Apresenta os casos de teste recebidos por meio da prop `testCases` e dispara
 * callbacks de edição e exclusão. Não realiza chamadas HTTP nem modifica
 * os dados recebidos.
 *
 * Se `testCases` estiver vazio, retorna `null` (o componente pai é
 * responsável por exibir o EmptyState).
 *
 * @param {Array}   testCases - Lista de casos de teste (id, project_id, title, priority, created_at).
 * @param {Function} onEdit   - Callback chamado ao clicar em Editar.
 * @param {Function} onDelete - Callback chamado ao clicar em Excluir.
 */
export const TestCaseTable = ({ testCases, onEdit, onDelete }) => {
  if (!testCases || testCases.length === 0) {
    return null;
  }

  const formatDateBrazilian = (isoString) => {
    if (!isoString) {
      return '—';
    }
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) {
        return '—';
      }
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return '—';
    }
  };

  const RESULT_LABELS = {
    Passed: 'Aprovado',
    Failed: 'Reprovado',
    Blocked: 'Bloqueado',
  };

  const renderLastResult = (lastExecution) => {
    if (!lastExecution) {
      return (
        <span
          style={{
            display: 'inline-block',
            padding: '0.125rem 0.5rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 600,
            backgroundColor: 'var(--color-surface-hover)',
            color: 'var(--color-text-secondary)',
            border: '1px solid var(--color-border)',
          }}
        >
          Não executado
        </span>
      );
    }
    const label = RESULT_LABELS[lastExecution.status] || lastExecution.status;
    const style =
      lastExecution.status === 'Passed'
        ? { backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success-text)' }
        : lastExecution.status === 'Failed'
          ? { backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger-text)' }
          : { backgroundColor: 'var(--color-warning-bg)', color: 'var(--color-warning-text)' };
    return (
      <span
        style={{
          display: 'inline-block',
          padding: '0.125rem 0.5rem',
          borderRadius: '9999px',
          fontSize: '0.75rem',
          fontWeight: 600,
          border: '1px solid',
          ...style,
        }}
      >
        {label}
      </span>
    );
  };

  const priorityBadgeStyle = (priority) => {
    const base = {
      display: 'inline-block',
      padding: '0.125rem 0.5rem',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: 600,
    };
    switch (priority) {
      case 'Low':
        return { ...base, backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success-text)' };
      case 'Medium':
        return { ...base, backgroundColor: 'var(--color-warning-bg)', color: 'var(--color-warning-text)' };
      case 'High':
        return { ...base, backgroundColor: 'var(--color-danger-border)', color: 'var(--color-danger-text)' };
      default:
        return { ...base, backgroundColor: 'var(--color-surface-hover)', color: 'var(--color-text-secondary)' };
    }
  };

  const cellStyle = {
    padding: '0.75rem',
    borderBottom: '1px solid var(--color-border)',
    fontSize: '0.875rem',
    color: 'var(--color-text)',
    verticalAlign: 'top',
  };

  const headerStyle = {
    ...cellStyle,
    backgroundColor: 'var(--color-surface-hover)',
    fontWeight: 600,
    color: 'var(--color-text)',
    textAlign: 'left',
  };

  return (
    <div
      className="card"
      style={{
        overflowX: 'auto',
        maxWidth: '100%',
      }}
    >
      <table
        role="grid"
        aria-label="Lista de casos de teste"
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          minWidth: '640px',
        }}
      >
        <thead>
          <tr>
            <th scope="col" style={headerStyle}>
              ID
            </th>
            <th scope="col" style={headerStyle}>
              Título
            </th>
            <th scope="col" style={headerStyle}>
              Projeto
            </th>
            <th scope="col" style={headerStyle}>
              Prioridade
            </th>
            <th scope="col" style={headerStyle}>
              Data de criação
            </th>
            <th scope="col" style={headerStyle}>
              <div style={{ textAlign: 'center' }}>Último resultado</div>
            </th>
            <th scope="col" style={headerStyle}>
              <div style={{ textAlign: 'center' }}>Ações</div>
            </th>
          </tr>
        </thead>
        <tbody>
          {testCases.map((tc) => (
            <tr key={tc.id} style={{ backgroundColor: 'var(--color-surface)' }}>
              <td style={cellStyle}>{tc.id}</td>
              <td style={cellStyle}>{tc.title}</td>
              <td style={cellStyle}>{tc.project_id}</td>
              <td style={cellStyle}>
                <span style={priorityBadgeStyle(tc.priority)}>{tc.priority}</span>
              </td>
              <td style={cellStyle}>
                {formatDateBrazilian(tc.created_at)}
              </td>
              <td style={cellStyle}>
                <div style={{ textAlign: 'center' }}>
                  {renderLastResult(tc.last_execution)}
                </div>
              </td>
              <td style={cellStyle}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => onEdit(tc)}
                      aria-label={`Editar caso de teste ${tc.title}`}
                      className="btn btn-outline"
                      style={{
                        padding: '0.375rem 0.75rem',
                        fontSize: '0.875rem',
                      }}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(tc)}
                      aria-label={`Excluir caso de teste ${tc.title}`}
                      className="btn btn-outline"
                      style={{
                        padding: '0.375rem 0.75rem',
                        fontSize: '0.875rem',
                        color: 'var(--color-danger)',
                        borderColor: 'var(--color-danger)',
                      }}
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

TestCaseTable.propTypes = {
  testCases: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      project_id: PropTypes.number.isRequired,
      title: PropTypes.string.isRequired,
      priority: PropTypes.string,
      created_at: PropTypes.string,
      last_execution: PropTypes.shape({
        id: PropTypes.number.isRequired,
        status: PropTypes.string.isRequired,
        executed_at: PropTypes.string,
      }),
    })
  ).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};