import React from 'react';
import PropTypes from 'prop-types';

export const LoadingState = ({ message = 'Carregando...' }) => (
  <div
    role="status"
    aria-label={message}
    className="loading-state"
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem 1rem',
      color: 'var(--color-text-secondary)',
      gap: '0.75rem',
    }}
  >
    <div
      role="progressbar"
      aria-busy="true"
      style={{
        width: '32px',
        height: '32px',
        border: '3px solid var(--color-border)',
        borderTopColor: 'var(--color-primary)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }}
    ></div>
    <span style={{ fontSize: '0.875rem' }}>{message}</span>
  </div>
);

LoadingState.propTypes = {
  message: PropTypes.string,
};