import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Pagination } from './Pagination';

describe('Pagination', () => {
  it('disables the previous button on the first page', () => {
    render(
      <Pagination
        total={40}
        perPage="8"
        currentPage={1}
        onPageChange={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: '<' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '>' })).toBeEnabled();
  });

  it('disables the next button on the last page', () => {
    render(
      <Pagination
        total={40}
        perPage="8"
        currentPage={5}
        onPageChange={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: '>' })).toBeDisabled();
  });

  it('reports the clicked page but not the current one', async () => {
    const onPageChange = vi.fn();

    render(
      <Pagination
        total={40}
        perPage="8"
        currentPage={2}
        onPageChange={onPageChange}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: '2' }));
    expect(onPageChange).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole('button', { name: '3' }));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });
});
