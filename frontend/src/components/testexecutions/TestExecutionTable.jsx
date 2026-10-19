import React from 'react';
import PropTypes from 'prop-types';

const STATUS_LABELS = {
  Passed: 'Aprovado',
  Failed: 'Reprovado',
  Blocked: 'Bloqueado',
  'Not Run': 'Não executado',
};

const STATUS_BADGE_STYLE = (status) => {
  const base = {
    display: 'inline-block',
    padding: '0.125rem 0.5rem',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: 600,
  };

  switch (status) {
    case 'Passed':
      return { ...base, backgroundColor: '#ecfdf5', color: '#059669' };
    case 'Failed':
      return { ...base, backgroundColor: '#fef2f2', color: '#b91c1c' };
    case 'Blocked':
      return { ...base, backgroundColor: '#fefce8', color: '#854d0e' };
    case 'Not Run':
      return { ...base, backgroundColor: '#f3f4f6', color: '#6b7280' };
    default:
      return { ...base, backgroundColor: '#f3f4f6', color: '#6b7280' };
  }
};

const formatDateTimeBrazilian = (isoString) => {
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

export const TestExecutionTable = ({ executions, testCases, onEdit, onDelete }) => {
  if (!executions || executions.length === 0) return null;

  const testCaseMap = new Map();
  (testCases || []).forEach((tc) => testCaseMap.set(tc.id, tc.title));

  const sorted = [...executions].sort((a, b) => {
    const dateA = new Date(a.executed_at).getTime();
    const dateB = new Date(b.executed_at).getTime();
    return dateB - dateA;
  });

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
    <div className="card" style={{ overflowX: 'auto', maxWidth: '100%' }}>
      <table
        role="grid"
        aria-label="Lista de execuções de teste"
        style={{ width: '100%', borderCollapse: 'collapse', minWidth: '640px' }}
      >
        <thead>
          <tr>
            <th scope="col" style={headerStyle}>ID</th>
            <th scope="col" style={headerStyle}>Caso de Teste</th>
            <th scope="col" style={headerStyle}>Status</th>
            <th scope="col" style={headerStyle}>Executado em</th>
            <th scope="col" style={headerStyle}>Executado por</th>
            <th scope="col" style={headerStyle}>Resultado Real</th>
            <th scope="col" style={headerStyle}>Notas</th>
            <th scope="col" style={headerStyle}>
              <div style={{ textAlign: 'center' }}>Ações</div>
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((execution) => (
            <tr key={execution.id} style={{ backgroundColor: '#ffffff' }}>
              <td style={cellStyle}>{execution.id}</td>
              <td style={cellStyle}>
                {testCaseMap.get(execution.test_case_id) || `Caso #${execution.test_case_id}`}
              </td>
              <td style={cellStyle}>
                <span style={STATUS_BADGE_STYLE(execution.status)}>
                  {STATUS_LABELS[execution.status] || execution.status}
                </span>
              </td>
              <td style={cellStyle}>{formatDateTimeBrazilian(execution.executed_at)}</td>
              <td style={cellStyle}>{execution.executed_by || '—'}</td>
              <td style={cellStyle}>{execution.actual_result || '—'}</td>
              <td style={cellStyle}>{execution.notes || '—'}</td>
              <td style={cellStyle}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => onEdit(execution)}
                      className="btn btn-outline"
                      aria-label="Editar execução"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(execution)}
                      className="btn btn-outline"
                      aria-label="Excluir execução"
                      style={{
                        borderColor: '#b91c1c',
                        color: '#b91c1c',
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

TestExecutionTable.propTypes = {
  executions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      test_case_id: PropTypes.number.isRequired,
      status: PropTypes.string.isRequired,
      executed_at: PropTypes.string,
      executed_by: PropTypes.string,
      actual_result: PropTypes.string,
      notes: PropTypes.string,
    })
  ).isRequired,
  testCases: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      title: PropTypes.string.isRequired,
    })
  ),
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
};

TestExecutionTable.defaultProps = {
  testCases: [],
  onEdit: null,
  onDelete: null,
};