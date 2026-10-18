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
        return { ...base, backgroundColor: '#ecfdf5', color: '#059669' };
      case 'Medium':
        return { ...base, backgroundColor: '#fefce8', color: '#854d0e' };
      case 'High':
        return { ...base, backgroundColor: '#fef2f2', color: '#b91c1c' };
      default:
        return { ...base, backgroundColor: '#f3f4f6', color: '#6b7280' };
    }
  };

  const cellStyle = {
    padding: '0.75rem',
    borderBottom: '1px solid #e5e7eb',
    fontSize: '0.875rem',
    color: '#1f2937',
    verticalAlign: 'top',
  };

  const headerStyle = {
    ...cellStyle,
    backgroundColor: '#f9fafb',
    fontWeight: 600,
    color: '#374151',
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
              <div style={{ textAlign: 'center' }}>Ações</div>
            </th>
          </tr>
        </thead>
        <tbody>
          {testCases.map((tc) => (
            <tr key={tc.id} style={{ backgroundColor: '#ffffff' }}>
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
                        color: '#dc2626',
                        borderColor: '#dc2626',
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
    })
  ).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};