import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { CatalogPage } from './CatalogPage';

const { useProductsQuery } = vi.hoisted(() => ({
  useProductsQuery: vi.fn(),
}));

vi.mock('@/hooks/queries/useProductsQuery', () => ({ useProductsQuery }));
vi.mock('./components/ProductsList', () => ({ ProductsList: () => null }));

const renderPage = (url = '/phones') =>
  render(
    <MemoryRouter initialEntries={[url]}>
      <Routes>
        <Route path="/:category" element={<CatalogPage />} />
      </Routes>
    </MemoryRouter>,
  );

const lastSort = () => useProductsQuery.mock.lastCall?.[0].sort;

describe('CatalogPage sort', () => {
  beforeEach(() => {
    useProductsQuery.mockReset().mockReturnValue({
      data: { items: [], total: 0 },
      isLoading: false,
      error: null,
    });
  });

  it('offers Newest, Name, both price directions and Discount', async () => {
    renderPage();

    await userEvent.click(screen.getByRole('button', { name: 'Choose' }));

    expect(
      screen.getAllByRole('listitem').map(item => item.textContent),
    ).toEqual([
      'Newest',
      'Name',
      'Price, low to high',
      'Price, high to low',
      'Discount',
    ]);
  });

  it.each([
    ['Price, high to low', 'price-desc'],
    ['Discount', 'discount'],
  ])('requests sort=%s as %s', async (label, sort) => {
    renderPage();

    await userEvent.click(screen.getByRole('button', { name: 'Choose' }));
    await userEvent.click(screen.getByText(label));

    expect(lastSort()).toBe(sort);
  });

  // Links saved before the rename keep working
  it.each([
    ['title', 'Name'],
    ['price', 'Price, low to high'],
  ])('shows sort=%s from the URL as %s', (sort, label) => {
    renderPage(`/phones?sort=${sort}`);

    expect(screen.getByRole('button', { name: label })).toBeInTheDocument();
  });
});
