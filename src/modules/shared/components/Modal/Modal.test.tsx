import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from './Modal';

describe('Modal', () => {
  it('calls onConfirm and onClose from the buttons', async () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();

    render(<Modal onClose={onClose} onConfirm={onConfirm} />);

    await userEvent.click(screen.getByRole('button', { name: 'Confirm' }));
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('shows the pending label and disables confirm while pending', () => {
    render(<Modal onClose={vi.fn()} onConfirm={vi.fn()} isConfirmDisabled />);

    expect(screen.getByRole('button', { name: 'Placing...' })).toBeDisabled();
  });

  it('renders the error message', () => {
    render(
      <Modal onClose={vi.fn()} onConfirm={vi.fn()} error="Out of stock" />,
    );

    expect(screen.getByText('Out of stock')).toBeInTheDocument();
  });
});
