import React from 'react';
import PropTypes from 'prop-types';

export const StatCard = ({ label, value, status }) => (
  <div
    role="region"
    aria-label={label}
    className="stat-card"
    style={{
      background: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: '0.5rem',
      padding: '1.25rem',
      boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
    }}
  >
    <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>{label}</p>
    <div style={{ fontSize: '1.875rem', fontWeight: 700, color: '#111827', margin: 0 }}>
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
              ? '#ecfdf5'
              : status === 'warning'
                ? '#fefce8'
                : status === 'error'
                  ? '#fef2f2'
                  : '#f3f4f6',
          color:
            status === 'ok'
              ? '#059669'
              : status === 'warning'
                ? '#854d0e'
                : status === 'error'
                  ? '#b91c1c'
                  : '#6b7280',
        }}
      >
        {status === 'ok' ? 'Operacional' : status === 'warning' ? 'Atenção' : status === 'error' ? 'Erro' : 'Pendente'}
      </span>
    )}
  </div>
);
StatCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  status: PropTypes.oneOf(['ok', 'warning', 'error', 'pending']),
};

