import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { App } from './App';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { HomePage } from './modules/HomePage';
import { CatalogPage } from './modules/Catalog';
import { ProductDetails } from './modules/ProductDetailsPage';
import { CartPage } from './modules/CartPage';
import { FavoritesPage } from './modules/FavoritesPage';
import { LoginPage } from './modules/LoginPage';
import { RegisterPage } from './modules/RegisterPage';
import { OrdersPage } from './modules/OrdersPage';
import { AdminPage } from './modules/AdminPage';
import { AdminProductFormPage } from './modules/AdminPage/AdminProductFormPage';
import { NotFoundPage } from './modules/NotFoundPage';
import './styles/global.scss';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { ProtectedRoute } from './modules/shared/components/ProtectedRoute';

createRoot(document.getElementById('root') as HTMLElement).render(
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <FavoritesProvider>
          <Router>
            <Routes>
              <Route path="/" element={<App />}>
                <Route index element={<HomePage />} />
                <Route path=":category" element={<CatalogPage />} />
                <Route
                  path=":category/:productId"
                  element={<ProductDetails />}
                />
                <Route path="cart" element={<CartPage />} />
                <Route path="favorites" element={<FavoritesPage />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />
                <Route
                  path="orders"
                  element={
                    <ProtectedRoute>
                      <OrdersPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="admin"
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="admin/products/new"
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminProductFormPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="admin/products/:id/edit"
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminProductFormPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<NotFoundPage />} />
              </Route>

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Router>
        </FavoritesProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>,
);
