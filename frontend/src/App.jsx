import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout.jsx';
import { Dashboard } from './pages/Dashboard.jsx';
import { Projects } from './pages/Projects.jsx';
import { TestCases } from './pages/TestCases.jsx';
import { TestExecutions } from './pages/TestExecutions.jsx';
import { Bugs } from './pages/Bugs.jsx';
import { NotFound } from './pages/NotFound.jsx';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="projects" element={<Projects />} />
          <Route path="testcases" element={<TestCases />} />
          <Route path="executions" element={<TestExecutions />} />
          <Route path="bugs" element={<Bugs />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;