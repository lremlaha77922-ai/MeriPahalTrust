import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { Toaster } from 'sonner';
import { LanguageProvider } from './contexts/LanguageContext';
import { AdminProvider } from './contexts/AdminContext';
import { registerServiceWorker, syncOfflineData } from './lib/pwa';

// Register PWA service worker
registerServiceWorker();

// Sync offline data when online
window.addEventListener('online', () => {
  console.log('Back online - syncing data...');
  syncOfflineData();
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AdminProvider>
      <LanguageProvider>
        <App />
        <Toaster position="top-right" richColors />
      </LanguageProvider>
    </AdminProvider>
  </StrictMode>,
);
