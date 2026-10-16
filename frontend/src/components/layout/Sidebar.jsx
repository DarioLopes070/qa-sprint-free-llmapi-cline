import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';

const MENU_ITEMS = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/projects', label: 'Projetos', icon: '📁' },
  { to: '/testcases', label: 'Casos de Teste', icon: '🧪' },
  { to: '/executions', label: 'Execuções', icon: '▶️' },
  { to: '/bugs', label: 'Bugs', icon: '🐛' },
];

export const Sidebar = ({ isOpen, onToggle }) => {
  const location = useLocation();

  return (
    <aside
      className="sidebar"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        width: 'min(260px, 80vw)',
        background: '#ffffff',
        borderRight: '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column',
        transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.2s ease',
        zIndex: 100,
        boxShadow: '2px 0 4px -1px rgb(0 0 0 / 0.1)',
      }}
    >
      <div
        style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid #e5e7eb',
        }}
      >
        <span
          style={{
            fontSize: '1.25rem',
            fontWeight: 800,
            color: '#111827',
            letterSpacing: '-0.025em',
          }}
        >
          QA Sprint
        </span>
      </div>

      <nav
        aria-label="Navegação principal"
        style={{ padding: '0.75rem 0', flex: 1, overflowY: 'auto' }}
      >
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {MENU_ITEMS.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <li key={item.to} style={{ margin: 0 }}>
                <Link
                  to={item.to}
                  onClick={onToggle}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1.5rem',
                    color: isActive ? '#2563eb' : '#374151',
                    fontWeight: 500,
                    fontSize: '0.875rem',
                    background: isActive ? '#eff6ff' : 'transparent',
                    borderRight: isActive ? '3px solid #2563eb' : 'none',
                    transition: 'all 0.2s ease',
                    textDecoration: 'none',
                    width: '100',
                    boxSizing: 'border-box',
                  }}
                >
                  <span style={{ fontSize: '1.25rem' }}>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #e5e7eb' }}>
        <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: 0 }}>
          Versão 1.0.0
        </p>
      </div>
    </aside>
  );
};

Sidebar.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
};

export const SidebarMobile = ({ isOpen, onToggle }) => {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: isOpen ? 'block' : 'none',
        zIndex: 50,
      }}
      onClick={onToggle}
    />
  );
};

SidebarMobile.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
};