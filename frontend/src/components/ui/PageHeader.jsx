import React from 'react';
import PropTypes from 'prop-types';

export const PageHeader = ({ title, description }) => (
  <header className="page-header" style={{ marginBottom: '1.5rem' }}>
    <h1
      style={{
        fontSize: '1.5rem',
        fontWeight: 700,
        color: '#111827',
        marginBottom: description ? '0.25rem' : 0,
      }}
    >
      {title}
    </h1>
    {description && (
      <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>{description}</p>
    )}
  </header>
);
PageHeader.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
};

