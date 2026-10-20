import React from 'react';
import PropTypes from 'prop-types';

const SEVERITY_LABELS = {
  Low: 'Baixa',
  Medium: 'Media',
  High: 'Alta',
  Critical: 'Critica',
};

const STATUS_LABELS = {
  Open: 'Aberto',
  'In Progress': 'Em Andamento',
  Resolved: 'Resolvido',
  Closed: 'Fechado',
};

const SEVERITY_BADGE_STYLE = (severity) => {
  const base = {
    display: 'inline-block',
    padding: '0.125rem 0.5rem',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: 600,
  };

  switch (severity) {
    case 'Low':
      return { ...base, backgroundColor: '#ecfdf5', color: '#059669' };
    case 'Medium':
      return { ...base, backgroundColor: '#fefce8', color: '#854d0e' };
    case 'High':
      return { ...base, backgroundColor: '#fef2f2', color: '#b91c1c' };
    case 'Critical':
      return { ...base, backgroundColor: '#7f1d1d', color: '#ffffff' };
    default:
      return { ...base, backgroundColor: '#f3f4f6', color: '#6b7280' };
  }
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
    case 'Open':
      return { ...base, backgroundColor: '#dbeafe', color: '#1d4ed8' };
    case 'In Progress':
      return { ...base, backgroundColor: '#fef3c7', color: '#92400e' };
    case 'Resolved':
      return { ...base, backgroundColor: '#d1fae5', color: '#065f46' };
    case 'Closed':
      return { ...base, backgroundColor: '#e5e7eb', color: '#374151' };
    default:
      return { ...base, backgroundColor: '#f3f4f6', color: '#6b7280' };
  }
};

const formatDateBrazilian = (isoString) => {
  if (!isoString) return '—';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '—';
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  } catch {
    return '—';
  }
};

export const BugTable = ({ bugs, projects, testCases, onEdit, onDelete, deleting }) => {
  if (!bugs || bugs.length === 0) return null;

  const projectMap = new Map();
  (projects || []).forEach((p) => projectMap.set(p.id, p.name));

  const testCaseMap = new Map();
  (testCases || []).forEach((tc) => testCaseMap.set(tc.id, tc.title));

  const sorted = [...bugs].sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
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
        aria-label="Lista de bugs"
        style={{ width: '100%', borderCollapse: 'collapse', minWidth: '640px' }}
      >
        <thead>
          <tr>
            <th scope="col" style={headerStyle}>ID</th>
            <th scope="col" style={headerStyle}>Projeto</th>
            <th scope="col" style={headerStyle}>Caso de Teste</th>
            <th scope="col" style={headerStyle}>Titulo</th>
            <th scope="col" style={headerStyle}>Severidade</th>
            <th scope="col" style={headerStyle}>Status</th>
            <th scope="col" style={headerStyle}>Criado em</th>
            <th scope="col" style={headerStyle}>
              <div style={{ textAlign: 'center' }}>Ações</div>
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((bug) => (
            <tr key={bug.id} style={{ backgroundColor: '#ffffff' }}>
              <td style={cellStyle}>{bug.id}</td>
              <td style={cellStyle}>{projectMap.get(bug.project_id) || `Projeto #${bug.project_id}`}</td>
              <td style={cellStyle}>{bug.test_case_id ? (testCaseMap.get(bug.test_case_id) || `Caso #${bug.test_case_id}`) : '—'}</td>
              <td style={cellStyle}>{bug.title}</td>
              <td style={cellStyle}>
                <span style={SEVERITY_BADGE_STYLE(bug.severity)}>
                  {SEVERITY_LABELS[bug.severity] || bug.severity}
                </span>
              </td>
              <td style={cellStyle}>
                <span style={STATUS_BADGE_STYLE(bug.status)}>
                  {STATUS_LABELS[bug.status] || bug.status}
                </span>
              </td>
              <td style={cellStyle}>{formatDateBrazilian(bug.created_at)}</td>
              <td style={cellStyle}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => onEdit(bug)}
                      className="btn btn-outline"
                      aria-label={`Editar bug #${bug.id}`}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(bug)}
                      disabled={deleting}
                      className="btn btn-outline"
                      aria-label={`Excluir bug #${bug.id}`}
                      style={{
                        borderColor: '#b91c1c',
                        color: '#b91c1c',
                        opacity: deleting ? 0.6 : 1,
                      }}
                    >
                      {deleting ? 'Excluindo...' : 'Excluir'}
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

BugTable.propTypes = {
  bugs: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      project_id: PropTypes.number.isRequired,
      test_case_id: PropTypes.number,
      title: PropTypes.string.isRequired,
      description: PropTypes.string,
      severity: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
      created_at: PropTypes.string,
      resolved_at: PropTypes.string,
    })
  ).isRequired,
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
    })
  ),
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  deleting: PropTypes.bool,
};

BugTable.defaultProps = {
  projects: [],
  testCases: [],
  onEdit: null,
  onDelete: null,
  deleting: false,
};