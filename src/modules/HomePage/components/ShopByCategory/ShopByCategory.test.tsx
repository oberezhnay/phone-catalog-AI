import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ShopByCategory } from './ShopByCategory';

describe('ShopByCategory', () => {
  it.each([
    ['Mobile Phones', '/phones'],
    ['Tablets', '/tablets'],
    ['Accessories', '/accessories'],
  ])('links the %s tile to %s', (title, path) => {
    render(
      <MemoryRouter>
        <ShopByCategory phonesQnt={3} tabletsQnt={2} accessoriesQnt={1} />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('link', { name: new RegExp(title) }),
    ).toHaveAttribute('href', path);
  });
});
