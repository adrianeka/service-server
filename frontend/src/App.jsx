import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import TestPage from './testpage/page';
import { TooltipProvider } from './components/ui/tooltip';
import './App.css';

const queryClient = new QueryClient();

function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'theme-midnight', 'theme-forest', 'theme-cosmic', 'theme-claude');
    
    if (theme !== 'light') {
      root.classList.add('dark');
      if (theme !== 'dark') {
        root.classList.add(theme);
      }
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background text-foreground">
          <Router>
            <Routes>
              <Route path="/" element={<TestPage />} />
              <Route path="/Login" element={<TestPage />} />
              <Route path="/dashboard" element={<Dashboard theme={theme} setTheme={setTheme} />} />
            </Routes>
          </Router>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
