
import { createRoot } from 'react-dom/client';
import { Analytics } from '@vercel/analytics/react';
import App from './App.tsx';
import './index.css';
import { StrictMode } from 'react';
import { Toaster } from 'sonner';

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
    <Toaster position="top-right" richColors />
    <Analytics />
  </StrictMode>
);
