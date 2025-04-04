import React, { useState } from 'react';
import AppRouter from './AppRouter';
import { ThemeProvider } from './context/ThemeContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css';

function App() {
  const [theme, setTheme] = useState('dark');
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={{ theme, setTheme }}>
        <div className={`App ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'} min-h-screen transition-colors duration-300`}>
          <AppRouter />
        </div>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;