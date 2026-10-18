import React from 'react';
import PropTypes from 'prop-types';

/**
 * Tabela de listagem de Projetos.
 *
 * Apresenta os projetos recebidos por meio da prop `projects` e dispara
 * callbacks de edição e exclusão. Não realiza chamadas HTTP nem modifica
 * os dados recebidos.
 *
 * Se `projects` estiver vazio, retorna `null` (o componente pai é
 * responsável por exibir o EmptyState).
 *
 * @param {Array}   projects  - Lista de projetos (id, name, description, created_at).
 * @param {Function} onEdit   - Callback chamado ao clicar em Editar.
 * @param {Function} onDelete - Callback chamado ao clicar em Excluir.
 */
export const ProjectTable = ({ projects, onEdit, onDelete }) => {
  if (!projects || projects.length === 0) {
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

  const actionsStyle = {
    ...cellStyle,
    display: 'flex',
    gap: '0.5rem',
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
        aria-label="Lista de projetos"
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
              Nome
            </th>
            <th scope="col" style={headerStyle}>
              Descrição
            </th>
            <th scope="col" style={headerStyle}>
              Data de criação
            </th>
            <th scope="col" style={{ ...headerStyle, textAlign: 'right' }}>
              Ações
            </th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <tr key={project.id} style={{ backgroundColor: '#ffffff' }}>
              <td style={cellStyle}>{project.id}</td>
              <td style={cellStyle}>{project.name}</td>
              <td style={cellStyle}>
                {project.description ? project.description : '—'}
              </td>
              <td style={cellStyle}>
                {formatDateBrazilian(project.created_at)}
              </td>
              <td style={actionsStyle}>
                <button
                  type="button"
                  onClick={() => onEdit(project)}
                  aria-label={`Editar projeto ${project.name}`}
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
                  onClick={() => onDelete(project)}
                  aria-label={`Excluir projeto ${project.name}`}
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

ProjectTable.propTypes = {
  projects: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string,
      created_at: PropTypes.string,
    })
  ).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};