import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router } from 'react-router-dom';
import { queryClient } from './lib/queryClient';
import { AppRoutes } from './AppRoutes';
import './styles/global.scss';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { FavoritesProvider } from './contexts/FavoritesContext';

createRoot(document.getElementById('root') as HTMLElement).render(
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <FavoritesProvider>
          <Router>
            <AppRoutes />
          </Router>
        </FavoritesProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>,
);
