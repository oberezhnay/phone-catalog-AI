import { describe, expect, it } from 'vitest';
import { AdminProduct } from '@/types/AdminProduct';
import {
  createEmptyForm,
  splitList,
  toFormState,
  toPayload,
} from './productForm.mappers';

const product: AdminProduct = {
  id: 7,
  itemId: 'apple-iphone-7-32gb-black',
  namespaceId: 'apple-iphone-7',
  category: 'phones',
  name: 'Apple iPhone 7 32GB Black',
  capacity: '32GB',
  capacityAvailable: ['32GB', '128GB'],
  color: 'black',
  colorsAvailable: ['black', 'gold'],
  priceRegular: 400,
  priceDiscount: 375,
  screen: '4.7 IPS',
  resolution: null,
  processor: 'Apple A10',
  ram: '2GB',
  camera: null,
  zoom: null,
  cell: ['GPRS', 'LTE'],
  year: 2016,
  image: '/img/phones/00.webp',
  images: ['/img/phones/00.webp', '/img/phones/01.webp'],
  description: [{ title: 'About', text: ['First', 'Second'] }],
  stock: 20,
};

describe('splitList', () => {
  it('splits on commas, trims and drops empty items', () => {
    expect(splitList(' a, b ,, c ,')).toEqual(['a', 'b', 'c']);
  });

  it('returns an empty list for an empty string', () => {
    expect(splitList('')).toEqual([]);
  });
});

describe('toFormState', () => {
  it('turns lists into comma-separated strings and numbers into text', () => {
    const form = toFormState(product);

    expect(form.capacityAvailable).toBe('32GB, 128GB');
    expect(form.priceDiscount).toBe('375');
    expect(form.year).toBe('2016');
  });

  it('turns null optional fields into empty strings', () => {
    const form = toFormState(product);

    expect(form.resolution).toBe('');
    expect(form.camera).toBe('');
    expect(form.processor).toBe('Apple A10');
  });

  it('joins description paragraphs with newlines', () => {
    expect(toFormState(product).description).toEqual([
      { title: 'About', text: 'First\nSecond' },
    ]);
  });

  it('keeps one blank description block when the product has none', () => {
    const form = toFormState({ ...product, description: [] });

    expect(form.description).toEqual([{ title: '', text: '' }]);
  });
});

describe('toPayload', () => {
  it('converts numbers, trims text and splits lists', () => {
    const payload = toPayload({
      ...createEmptyForm(),
      name: '  Phone  ',
      itemId: ' phone-1 ',
      priceRegular: '500',
      priceDiscount: '450',
      capacityAvailable: '64GB, 128GB',
      year: '2024',
      stock: '5',
    });

    expect(payload.name).toBe('Phone');
    expect(payload.itemId).toBe('phone-1');
    expect(payload.priceRegular).toBe(500);
    expect(payload.priceDiscount).toBe(450);
    expect(payload.capacityAvailable).toEqual(['64GB', '128GB']);
    expect(payload.year).toBe(2024);
    expect(payload.stock).toBe(5);
  });

  it('sends empty optional fields as undefined, not empty strings', () => {
    const payload = toPayload({ ...createEmptyForm(), resolution: '  ' });

    expect(payload.resolution).toBeUndefined();
    expect(payload.processor).toBeUndefined();
    expect(payload.camera).toBeUndefined();
    expect(payload.zoom).toBeUndefined();
  });

  it('drops blank description blocks and splits text into paragraphs', () => {
    const payload = toPayload({
      ...createEmptyForm(),
      description: [
        { title: 'About', text: 'First\n\n  Second  ' },
        { title: '  ', text: '' },
      ],
    });

    expect(payload.description).toEqual([
      { title: 'About', text: ['First', 'Second'] },
    ]);
  });

  it('round-trips an existing product', () => {
    const payload = toPayload(toFormState(product));

    expect(payload).toEqual({
      itemId: product.itemId,
      namespaceId: product.namespaceId,
      category: product.category,
      name: product.name,
      capacity: product.capacity,
      capacityAvailable: product.capacityAvailable,
      color: product.color,
      colorsAvailable: product.colorsAvailable,
      priceRegular: product.priceRegular,
      priceDiscount: product.priceDiscount,
      screen: product.screen,
      resolution: undefined,
      processor: product.processor,
      ram: product.ram,
      camera: undefined,
      zoom: undefined,
      cell: product.cell,
      year: product.year,
      image: product.image,
      images: product.images,
      description: product.description,
      stock: product.stock,
    });
  });
});

describe('createEmptyForm', () => {
  it('starts as a phone with the current year and one blank block', () => {
    const form = createEmptyForm();

    expect(form.category).toBe('phones');
    expect(form.year).toBe(new Date().getFullYear().toString());
    expect(form.stock).toBe('20');
    expect(form.description).toHaveLength(1);
  });
});
