import React from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/ui/PageHeader.jsx';

export const NotFound = () => {
  return (
    <div className="not-found-page" style={{ padding: '3rem 1rem', textAlign: 'center' }}>
      <PageHeader title="Página não encontrada" description="O endereço acessado não existe no sistema." />

      <div
        style={{
          maxWidth: '400px',
          margin: '0 auto',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: '0.5rem',
          padding: '2rem',
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
        }}
      >
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.5rem' }}>
          Página não encontrada
        </h2>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
          O endereço acessado não existe. Verifique a URL ou retorne ao Dashboard.
        </p>
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            background: 'var(--color-primary)',
            color: '#ffffff',
            borderRadius: '0.375rem',
            fontWeight: 500,
            fontSize: '0.875rem',
            textDecoration: 'none',
          }}
        >
          <span>←</span> Retornar ao Dashboard
        </Link>
      </div>
    </div>
  );
};