// This file bootstraps the React application by rendering the root component into the DOM.

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx'
import { CssBaseline } from '@mui/material'
import { ThemeProvider } from '@mui/material/styles';
import { theme } from './theme.js';

// Mount the React application to the DOM element with id 'root'
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      {/* CssBaseline provides a consistent baseline style and ThemeProvider applies the custom theme */}
      <CssBaseline/>
      <App />
    </ThemeProvider>
  </StrictMode>,
)
