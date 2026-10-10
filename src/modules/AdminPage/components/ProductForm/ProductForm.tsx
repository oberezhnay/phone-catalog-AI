import { FormEvent, useState } from 'react';
import {
  AdminProduct,
  AdminProductInput,
} from '../../../../types/AdminProduct';
import { ProductCategory } from '../../../../types/ProductCategory';
import styles from './ProductForm.module.scss';

type DescriptionBlockForm = {
  title: string;
  text: string;
};

type FormState = {
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

const emptyForm: FormState = {
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
  description: [{ title: '', text: '' }],
};

function toDescriptionFormBlocks(
  description: AdminProduct['description'],
): DescriptionBlockForm[] {
  if (description.length === 0) {
    return [{ title: '', text: '' }];
  }

  return description.map(block => ({
    title: block.title,
    text: block.text.join('\n'),
  }));
}

const toFormState = (product: AdminProduct): FormState => ({
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

const splitList = (value: string) =>
  value
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);

const toPayload = (form: FormState): AdminProductInput => ({
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

type Props = {
  initialProduct?: AdminProduct;
  onSubmit: (payload: AdminProductInput) => Promise<void>;
  isSubmitting: boolean;
  error: string;
  submitLabel: string;
};

export const ProductForm: React.FC<Props> = ({
  initialProduct,
  onSubmit,
  isSubmitting,
  error,
  submitLabel,
}) => {
  const [form, setForm] = useState<FormState>(
    initialProduct ? toFormState(initialProduct) : emptyForm,
  );

  const updateField = <K extends keyof FormState>(
    field: K,
    value: FormState[K],
  ) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const updateDescriptionBlock = (
    index: number,
    field: keyof DescriptionBlockForm,
    value: string,
  ) => {
    setForm(prev => ({
      ...prev,
      description: prev.description.map((block, i) =>
        i === index ? { ...block, [field]: value } : block,
      ),
    }));
  };

  const addDescriptionBlock = () => {
    setForm(prev => ({
      ...prev,
      description: [...prev.description, { title: '', text: '' }],
    }));
  };

  const removeDescriptionBlock = (index: number) => {
    setForm(prev => ({
      ...prev,
      description: prev.description.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit(toPayload(form));
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.grid}>
        <label className={styles.field}>
          Name
          <input
            value={form.name}
            onChange={e => updateField('name', e.target.value)}
            required
          />
        </label>

        <label className={styles.field}>
          Category
          <select
            value={form.category}
            onChange={e =>
              updateField('category', e.target.value as ProductCategory)
            }
          >
            <option value="phones">phones</option>
            <option value="tablets">tablets</option>
            <option value="accessories">accessories</option>
          </select>
        </label>

        <label className={styles.field}>
          Item ID (slug)
          <input
            value={form.itemId}
            onChange={e => updateField('itemId', e.target.value)}
            required
          />
        </label>

        <label className={styles.field}>
          Namespace ID
          <input
            value={form.namespaceId}
            onChange={e => updateField('namespaceId', e.target.value)}
            required
          />
        </label>

        <label className={styles.field}>
          Capacity
          <input
            value={form.capacity}
            onChange={e => updateField('capacity', e.target.value)}
            required
          />
        </label>

        <label className={styles.field}>
          Capacity available (comma-separated)
          <input
            value={form.capacityAvailable}
            onChange={e => updateField('capacityAvailable', e.target.value)}
            placeholder="32GB, 64GB, 128GB"
          />
        </label>

        <label className={styles.field}>
          Color
          <input
            value={form.color}
            onChange={e => updateField('color', e.target.value)}
            required
          />
        </label>

        <label className={styles.field}>
          Colors available (comma-separated)
          <input
            value={form.colorsAvailable}
            onChange={e => updateField('colorsAvailable', e.target.value)}
            placeholder="black, gold, silver"
          />
        </label>

        <label className={styles.field}>
          Regular price
          <input
            type="number"
            value={form.priceRegular}
            onChange={e => updateField('priceRegular', e.target.value)}
            required
          />
        </label>

        <label className={styles.field}>
          Discount price
          <input
            type="number"
            value={form.priceDiscount}
            onChange={e => updateField('priceDiscount', e.target.value)}
            required
          />
        </label>

        <label className={styles.field}>
          Screen
          <input
            value={form.screen}
            onChange={e => updateField('screen', e.target.value)}
            required
          />
        </label>

        <label className={styles.field}>
          Resolution
          <input
            value={form.resolution}
            onChange={e => updateField('resolution', e.target.value)}
          />
        </label>

        <label className={styles.field}>
          Processor
          <input
            value={form.processor}
            onChange={e => updateField('processor', e.target.value)}
          />
        </label>

        <label className={styles.field}>
          RAM
          <input
            value={form.ram}
            onChange={e => updateField('ram', e.target.value)}
            required
          />
        </label>

        <label className={styles.field}>
          Camera
          <input
            value={form.camera}
            onChange={e => updateField('camera', e.target.value)}
          />
        </label>

        <label className={styles.field}>
          Zoom
          <input
            value={form.zoom}
            onChange={e => updateField('zoom', e.target.value)}
          />
        </label>

        <label className={styles.field}>
          Cell (comma-separated)
          <input
            value={form.cell}
            onChange={e => updateField('cell', e.target.value)}
            placeholder="GPRS, EDGE, LTE"
          />
        </label>

        <label className={styles.field}>
          Year
          <input
            type="number"
            value={form.year}
            onChange={e => updateField('year', e.target.value)}
            required
          />
        </label>

        <label className={styles.field}>
          Stock
          <input
            type="number"
            value={form.stock}
            onChange={e => updateField('stock', e.target.value)}
            required
          />
        </label>

        <label className={styles.field}>
          Main image URL
          <input
            value={form.image}
            onChange={e => updateField('image', e.target.value)}
            placeholder="/img/phones/.../00.webp"
            required
          />
        </label>

        <label className={styles.field}>
          Gallery images (comma-separated URLs)
          <input
            value={form.images}
            onChange={e => updateField('images', e.target.value)}
          />
        </label>
      </div>

      <div className={styles.descriptions}>
        <p className={styles['section-title']}>Description blocks</p>

        {form.description.map((block, index) => (
          <div key={index} className={styles['description-block']}>
            <label className={styles.field}>
              Block title
              <input
                value={block.title}
                onChange={e =>
                  updateDescriptionBlock(index, 'title', e.target.value)
                }
              />
            </label>

            <label className={styles.field}>
              Block text (one paragraph per line)
              <textarea
                value={block.text}
                onChange={e =>
                  updateDescriptionBlock(index, 'text', e.target.value)
                }
              />
            </label>

            {form.description.length > 1 && (
              <button
                type="button"
                className={styles['remove-block']}
                onClick={() => removeDescriptionBlock(index)}
              >
                Remove block
              </button>
            )}
          </div>
        ))}

        <button
          type="button"
          className={styles['add-block']}
          onClick={addDescriptionBlock}
        >
          + Add description block
        </button>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <button type="submit" className={styles.submit} disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : submitLabel}
      </button>
    </form>
  );
};
