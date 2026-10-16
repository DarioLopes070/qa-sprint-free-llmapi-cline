import React from 'react';
import { useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/projects': 'Projetos',
  '/testcases': 'Casos de Teste',
  '/executions': 'Execuções',
  '/bugs': 'Bugs',
};

export const Header = ({ onMenuToggle, isSidebarOpen, isMobile }) => {
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] || 'QA Sprint';

  const descriptions = {
    '/': 'Visão geral das atividades de qualidade e métricas do sistema.',
    '/projects': 'Gerencie os projetos de qualidade da sua organização.',
    '/testcases': 'Cadastre e organize os casos de teste por projeto.',
    '/executions': 'Acompanhe o histórico de execuções de testes.',
    '/bugs': 'Registre e monitore bugs encontrados nos testes.',
  };

  return (
    <header
      className="app-header"
      style={{
        position: 'fixed',
        top: 0,
        left: isSidebarOpen && !isMobile ? '260px' : '0',
        right: 0,
        height: '64px',
        background: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        padding: '0 1.5rem',
        zIndex: 50,
      }}
    >
      <button
        type="button"
        onClick={onMenuToggle}
        aria-label="Abrir menu de navegação"
        style={{
          marginRight: '1rem',
          padding: '0.5rem',
          color: '#374151',
          border: '1px solid #e5e7eb',
          borderRadius: '0.375rem',
          background: '#ffffff',
        }}
      >
        ☰
      </button>

      <div style={{ flex: 1, minWidth: 0 }}>
        <h2
          style={{
            fontSize: '1.125rem',
            fontWeight: 600,
            color: '#111827',
            marginBottom: '0.125rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {title}
        </h2>
        <p
          style={{
            fontSize: '0.75rem',
            color: '#6b7280',
            margin: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {descriptions[location.pathname] || ''}
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 500,
            padding: '0.2rem 0.6rem',
            background: '#eff6ff',
            color: '#2563eb',
            borderRadius: '9999px',
          }}
        >
          Modo Desenvolvimento
        </span>
      </div>
    </header>
  );
};

Header.propTypes = {
  onMenuToggle: PropTypes.func.isRequired,
  isSidebarOpen: PropTypes.bool.isRequired,
  isMobile: PropTypes.bool,
};