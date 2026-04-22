/**
 * @fileoverview Punto de entrada de la aplicacion React.
 * Carga fuentes globales, crea la raiz de React y monta el componente principal.
 */
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';

// StrictMode ayuda a detectar efectos secundarios durante el desarrollo.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
