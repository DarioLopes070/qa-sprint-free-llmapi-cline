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
      color: '#6b7280',
      gap: '0.75rem',
    }}
  >
    <div
      role="progressbar"
      aria-busy="true"
      style={{
        width: '32px',
        height: '32px',
        border: '3px solid #e5e7eb',
        borderTopColor: '#2563eb',
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