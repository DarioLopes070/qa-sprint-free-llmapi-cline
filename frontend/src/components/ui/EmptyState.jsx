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
      color: 'var(--color-text-secondary)',
    }}
  >
    <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>{icon}</div>
    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.5rem' }}>
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
          color: 'var(--color-primary)',
          background: 'transparent',
          border: '1px solid var(--color-primary)',
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

