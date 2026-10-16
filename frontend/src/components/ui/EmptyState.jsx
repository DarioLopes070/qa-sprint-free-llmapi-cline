import React from 'react';
import PropTypes from 'prop-types';

export const EmptyState = ({
  title = 'Nenhum registro encontrado',
  description,
  action,
  icon = '📭',
}) => (
  <div
    role="status"
    aria-label={title}
    className="empty-state"
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem 1rem',
      textAlign: 'center',
      color: '#6b7280',
    }}
  >
    <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>{icon}</div>
    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1f2937', marginBottom: '0.5rem' }}>
      {title}
    </h3>
    {description && (
      <p style={{ fontSize: '0.875rem', marginBottom: '1.5rem', maxWidth: '32rem', lineHeight: 1.5 }}>
        {description}
      </p>
    )}
    {action && (
      <button
        type="button"
        onClick={action.onClick}
        style={{
          padding: '0.5rem 1rem',
          fontSize: '0.875rem',
          fontWeight: 500,
          color: '#2563eb',
          background: 'transparent',
          border: '1px solid #2563eb',
          borderRadius: '0.375rem',
          cursor: 'pointer',
        }}
      >
        {action.label}
      </button>
    )}
  </div>
);
EmptyState.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  action: PropTypes.shape({
    label: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
  }),
  icon: PropTypes.string,
};

