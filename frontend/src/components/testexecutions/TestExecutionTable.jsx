import React from 'react';
import PropTypes from 'prop-types';

const STATUS_LABELS = {
  Passed: 'Aprovado',
  Failed: 'Reprovado',
  Blocked: 'Bloqueado',
  'Not Run': 'Não executado (registro legado)',
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
      return { ...base, backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success-text)' };
    case 'Failed':
      return { ...base, backgroundColor: 'var(--color-danger-border)', color: 'var(--color-danger-text)' };
    case 'Blocked':
      return { ...base, backgroundColor: 'var(--color-warning-bg)', color: 'var(--color-warning-text)' };
    case 'Not Run':
      return { ...base, backgroundColor: 'var(--color-surface-hover)', color: 'var(--color-text-secondary)' };
    default:
      return { ...base, backgroundColor: 'var(--color-surface-hover)', color: 'var(--color-text-secondary)' };
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
            <tr key={execution.id} style={{ backgroundColor: 'var(--color-surface)' }}>
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
                        borderColor: 'var(--color-danger)',
                        color: 'var(--color-danger)',
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