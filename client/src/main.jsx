import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { ThemeProvider, useTheme } from './context/ThemeContext.jsx';
import './index.css';

function ThemedToaster() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: isDark ? '#131C31' : '#FFFFFF',
          color: isDark ? '#F1F5F9' : '#0F172A',
          border: `1px solid ${isDark ? '#2A3550' : '#E2E8F0'}`,
        },
      }}
    />
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <CartProvider>
          <App />
          <ThemedToaster />
        </CartProvider>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);
