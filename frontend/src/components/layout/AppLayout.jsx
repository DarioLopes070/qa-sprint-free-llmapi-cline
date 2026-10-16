import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar.jsx';
import { SidebarMobile } from './Sidebar.jsx';
import { Header } from './Header.jsx';

export const AppLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [isMobile]);

  return (
    <div
      className="app-layout"
      style={{
        display: 'flex',
        position: 'relative',
        minHeight: '100vh',
      }}
    >
      {isMobile && isSidebarOpen && (
        <SidebarMobile isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(false)} />
      )}

      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen((prev) => !prev)}
      />

      <div
        style={{
          width: '100%',
          marginLeft: isSidebarOpen && !isMobile ? '260px' : '0',
          transition: 'margin-left 0.2s ease',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          overflowX: 'hidden',
        }}
      >
        <Header
          onMenuToggle={() => setIsSidebarOpen((prev) => !prev)}
          isSidebarOpen={isSidebarOpen}
          isMobile={isMobile}
        />

        <main
          style={{
            width: '100%',
            flex: 1,
            paddingTop: '64px',
            paddingBottom: '2rem',
            overflowX: 'hidden',
          }}
        >
          <div className="container" style={{ paddingTop: '1.5rem' }}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};