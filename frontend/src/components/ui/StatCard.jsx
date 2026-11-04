import React from 'react';
import PropTypes from 'prop-types';

export const StatCard = ({ label, value, status }) => (
  <div
    role="region"
    aria-label={label}
    className="stat-card"
    style={{
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: '0.5rem',
      padding: '1.25rem',
      boxShadow: 'var(--shadow)',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
    }}
  >
    <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', margin: 0 }}>{label}</p>
    <div style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>
      {value}
    </div>
    {status && (
      <span
        style={{
          fontSize: '0.75rem',
          fontWeight: 600,
          padding: '0.125rem 0.5rem',
          borderRadius: '9999px',
          alignSelf: 'flex-start',
          backgroundColor:
            status === 'ok'
              ? 'var(--color-success-bg)'
              : status === 'warning'
                ? 'var(--color-warning-bg)'
                : status === 'error'
                  ? 'var(--color-danger-bg)'
                  : 'var(--color-surface-hover)',
          color:
            status === 'ok'
              ? 'var(--color-success-text)'
              : status === 'warning'
                ? 'var(--color-warning-text)'
                : status === 'error'
                  ? 'var(--color-danger-text)'
                  : 'var(--color-text-secondary)',
        }}
      >
        {status === 'ok' ? 'Operacional' : status === 'warning' ? 'Atenção' : status === 'error' ? 'Indisponível' : 'Carregando'}
      </span>
    )}
  </div>
);
StatCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  status: PropTypes.oneOf(['ok', 'warning', 'error', 'pending']),
};

