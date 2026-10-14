import { AdminProduct, AdminProductInput } from '@/types/AdminProduct';
import { ProductCategory } from '@/types/ProductCategory';

export type DescriptionBlockForm = {
  title: string;
  text: string;
};

// Everything is a string while the user types; toPayload converts it back.
export type FormState = {
  name: string;
  itemId: string;
  namespaceId: string;
  category: ProductCategory;
  capacity: string;
  capacityAvailable: string;
  color: string;
  colorsAvailable: string;
  priceRegular: string;
  priceDiscount: string;
  screen: string;
  resolution: string;
  processor: string;
  ram: string;
  camera: string;
  zoom: string;
  cell: string;
  year: string;
  image: string;
  images: string;
  stock: string;
  description: DescriptionBlockForm[];
};

export type TextFieldKey = Exclude<keyof FormState, 'category' | 'description'>;

export const emptyDescriptionBlock = (): DescriptionBlockForm => ({
  title: '',
  text: '',
});

export const createEmptyForm = (): FormState => ({
  name: '',
  itemId: '',
  namespaceId: '',
  category: 'phones',
  capacity: '',
  capacityAvailable: '',
  color: '',
  colorsAvailable: '',
  priceRegular: '',
  priceDiscount: '',
  screen: '',
  resolution: '',
  processor: '',
  ram: '',
  camera: '',
  zoom: '',
  cell: '',
  year: new Date().getFullYear().toString(),
  image: '',
  images: '',
  stock: '20',
  description: [emptyDescriptionBlock()],
});

export const splitList = (value: string) =>
  value
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);

const toDescriptionFormBlocks = (
  description: AdminProduct['description'],
): DescriptionBlockForm[] => {
  if (description.length === 0) {
    return [emptyDescriptionBlock()];
  }

  return description.map(block => ({
    title: block.title,
    text: block.text.join('\n'),
  }));
};

export const toFormState = (product: AdminProduct): FormState => ({
  name: product.name,
  itemId: product.itemId,
  namespaceId: product.namespaceId,
  category: product.category,
  capacity: product.capacity,
  capacityAvailable: product.capacityAvailable.join(', '),
  color: product.color,
  colorsAvailable: product.colorsAvailable.join(', '),
  priceRegular: product.priceRegular.toString(),
  priceDiscount: product.priceDiscount.toString(),
  screen: product.screen,
  resolution: product.resolution || '',
  processor: product.processor || '',
  ram: product.ram,
  camera: product.camera || '',
  zoom: product.zoom || '',
  cell: product.cell.join(', '),
  year: product.year.toString(),
  image: product.image,
  images: product.images.join(', '),
  stock: product.stock.toString(),
  description: toDescriptionFormBlocks(product.description),
});

export const toPayload = (form: FormState): AdminProductInput => ({
  name: form.name.trim(),
  itemId: form.itemId.trim(),
  namespaceId: form.namespaceId.trim(),
  category: form.category,
  capacity: form.capacity.trim(),
  capacityAvailable: splitList(form.capacityAvailable),
  color: form.color.trim(),
  colorsAvailable: splitList(form.colorsAvailable),
  priceRegular: Number(form.priceRegular),
  priceDiscount: Number(form.priceDiscount),
  screen: form.screen.trim(),
  resolution: form.resolution.trim() || undefined,
  processor: form.processor.trim() || undefined,
  ram: form.ram.trim(),
  camera: form.camera.trim() || undefined,
  zoom: form.zoom.trim() || undefined,
  cell: splitList(form.cell),
  year: Number(form.year),
  image: form.image.trim(),
  images: splitList(form.images),
  stock: Number(form.stock),
  description: form.description
    .filter(block => block.title.trim() || block.text.trim())
    .map(block => ({
      title: block.title.trim(),
      text: block.text
        .split('\n')
        .map(line => line.trim())
        .filter(Boolean),
    })),
});
