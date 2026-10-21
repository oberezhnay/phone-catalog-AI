import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { AdminOrdersPage } from './AdminOrdersPage';

const api = vi.hoisted(() => ({
  getAdminOrders: vi.fn(),
  updateAdminOrderStatus: vi.fn(),
}));

vi.mock('@/api/admin', () => api);
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ token: 'admin-token' }),
}));

const order = {
  id: 7,
  status: 'pending',
  total: 800,
  createdAt: '2026-01-01T00:00:00.000Z',
  items: [
    {
      id: 1,
      productId: 5,
      quantity: 2,
      priceAtPurchase: 400,
      product: {
        id: 5,
        itemId: 'phone-1',
        category: 'phones',
        name: 'Phone 1',
        image: '/img.webp',
      },
    },
  ],
  user: { id: 3, email: 'u@test.com', name: 'Ulla' },
};

const renderPage = () =>
  render(
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      <MemoryRouter>
        <AdminOrdersPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );

describe('AdminOrdersPage', () => {
  beforeEach(() => {
    api.getAdminOrders.mockReset().mockResolvedValue([order]);
    api.updateAdminOrderStatus.mockReset().mockResolvedValue(order);
  });

  it('shows the buyer, the items and the total', async () => {
    renderPage();

    expect((await screen.findAllByText(/Phone 1 ×2/)).length).toBeGreaterThan(
      0,
    );
    expect(screen.getAllByText(/u@test.com/).length).toBeGreaterThan(0);
    expect(screen.getAllByText('$800').length).toBeGreaterThan(0);
  });

  it('shows an empty state', async () => {
    api.getAdminOrders.mockResolvedValue([]);
    renderPage();

    expect(await screen.findByText('No orders found.')).toBeInTheDocument();
  });

  it('sends the new status when it is changed', async () => {
    renderPage();

    const [select] = await screen.findAllByLabelText('Status of order #7');

    await userEvent.selectOptions(select, 'shipped');

    await waitFor(() =>
      expect(api.updateAdminOrderStatus).toHaveBeenCalledWith(
        'admin-token',
        7,
        'shipped',
      ),
    );
  });

  it('reloads with the chosen status filter', async () => {
    renderPage();
    await screen.findAllByText(/Phone 1/);

    await userEvent.selectOptions(
      screen.getByLabelText('Filter by status'),
      'paid',
    );

    await waitFor(() =>
      expect(api.getAdminOrders).toHaveBeenLastCalledWith(
        'admin-token',
        'paid',
      ),
    );
  });

  it('shows an error when the status update fails', async () => {
    api.updateAdminOrderStatus.mockRejectedValue(new Error('boom'));
    renderPage();

    const [select] = await screen.findAllByLabelText('Status of order #7');

    await userEvent.selectOptions(select, 'paid');

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Failed to update the order status',
    );
  });
});
