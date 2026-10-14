import { Route, Routes } from 'react-router-dom';
import { App } from './App';
import { HomePage } from './modules/HomePage';
import { CatalogPage } from './modules/CatalogPage';
import { ProductDetailsPage } from './modules/ProductDetailsPage';
import { CartPage } from './modules/CartPage';
import { FavoritesPage } from './modules/FavoritesPage';
import { LoginPage } from './modules/LoginPage';
import { RegisterPage } from './modules/RegisterPage';
import { OrdersPage } from './modules/OrdersPage';
import { AdminPage } from './modules/AdminPage';
import { AdminProductFormPage } from './modules/AdminPage/AdminProductFormPage';
import { NotFoundPage } from './modules/NotFoundPage';
import { ProtectedRoute } from './modules/shared/components/ProtectedRoute';

const forAdmin = (page: React.ReactElement) => (
  <ProtectedRoute requireAdmin>{page}</ProtectedRoute>
);

export const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<App />}>
      <Route index element={<HomePage />} />
      <Route path=":category" element={<CatalogPage />} />
      <Route path=":category/:productId" element={<ProductDetailsPage />} />
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
      <Route path="admin" element={forAdmin(<AdminPage />)} />
      <Route
        path="admin/products/new"
        element={forAdmin(<AdminProductFormPage />)}
      />
      <Route
        path="admin/products/:id/edit"
        element={forAdmin(<AdminProductFormPage />)}
      />
      <Route path="*" element={<NotFoundPage />} />
    </Route>
  </Routes>
);
