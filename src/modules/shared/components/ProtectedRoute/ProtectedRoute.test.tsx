import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';

const auth = vi.hoisted(() => ({
  isAuthenticated: false,
  isAdmin: false,
  isLoading: false,
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => auth,
}));

const renderAt = (requireAdmin?: boolean) =>
  render(
    <MemoryRouter initialEntries={['/secret']}>
      <Routes>
        <Route path="/" element={<p>home</p>} />
        <Route path="/login" element={<p>login</p>} />
        <Route
          path="/secret"
          element={
            <ProtectedRoute requireAdmin={requireAdmin}>
              <p>secret</p>
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>,
  );

describe('ProtectedRoute', () => {
  beforeEach(() => {
    auth.isAuthenticated = false;
    auth.isAdmin = false;
    auth.isLoading = false;
  });

  it('redirects guests to /login', () => {
    renderAt();

    expect(screen.getByText('login')).toBeInTheDocument();
  });

  it('renders nothing while the session is loading', () => {
    auth.isLoading = true;
    const { container } = renderAt();

    expect(container).toBeEmptyDOMElement();
  });

  it('renders children for an authenticated user', () => {
    auth.isAuthenticated = true;
    renderAt();

    expect(screen.getByText('secret')).toBeInTheDocument();
  });

  it('sends a non-admin away from admin-only routes', () => {
    auth.isAuthenticated = true;
    renderAt(true);

    expect(screen.getByText('home')).toBeInTheDocument();
  });

  it('lets an admin through', () => {
    auth.isAuthenticated = true;
    auth.isAdmin = true;
    renderAt(true);

    expect(screen.getByText('secret')).toBeInTheDocument();
  });
});
