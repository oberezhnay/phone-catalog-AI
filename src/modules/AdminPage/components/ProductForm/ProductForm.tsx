import { FormEvent, useState } from 'react';
import {
  AdminProduct,
  AdminProductInput,
} from '../../../../types/AdminProduct';
import {
  isProductCategory,
  PRODUCT_CATEGORIES,
} from '../../../../types/ProductCategory';
import styles from './ProductForm.module.scss';
import {
  createEmptyForm,
  DescriptionBlockForm,
  emptyDescriptionBlock,
  FormState,
  TextFieldKey,
  toFormState,
  toPayload,
} from './productForm.mappers';

type FieldConfig = {
  key: TextFieldKey;
  label: string;
  type?: 'number';
  required?: boolean;
  placeholder?: string;
};

// The category select sits between these two groups, as in the page layout.
const FIELDS_BEFORE_CATEGORY: FieldConfig[] = [
  { key: 'name', label: 'Name', required: true },
];

const FIELDS_AFTER_CATEGORY: FieldConfig[] = [
  { key: 'itemId', label: 'Item ID (slug)', required: true },
  { key: 'namespaceId', label: 'Namespace ID', required: true },
  { key: 'capacity', label: 'Capacity', required: true },
  {
    key: 'capacityAvailable',
    label: 'Capacity available (comma-separated)',
    placeholder: '32GB, 64GB, 128GB',
  },
  { key: 'color', label: 'Color', required: true },
  {
    key: 'colorsAvailable',
    label: 'Colors available (comma-separated)',
    placeholder: 'black, gold, silver',
  },
  {
    key: 'priceRegular',
    label: 'Regular price',
    type: 'number',
    required: true,
  },
  {
    key: 'priceDiscount',
    label: 'Discount price',
    type: 'number',
    required: true,
  },
  { key: 'screen', label: 'Screen', required: true },
  { key: 'resolution', label: 'Resolution' },
  { key: 'processor', label: 'Processor' },
  { key: 'ram', label: 'RAM', required: true },
  { key: 'camera', label: 'Camera' },
  { key: 'zoom', label: 'Zoom' },
  {
    key: 'cell',
    label: 'Cell (comma-separated)',
    placeholder: 'GPRS, EDGE, LTE',
  },
  { key: 'year', label: 'Year', type: 'number', required: true },
  { key: 'stock', label: 'Stock', type: 'number', required: true },
  {
    key: 'image',
    label: 'Main image URL',
    placeholder: '/img/phones/.../00.webp',
    required: true,
  },
  { key: 'images', label: 'Gallery images (comma-separated URLs)' },
];

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
    initialProduct ? toFormState(initialProduct) : createEmptyForm(),
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
      description: [...prev.description, emptyDescriptionBlock()],
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

  const renderField = (field: FieldConfig) => (
    <label key={field.key} className={styles.field}>
      {field.label}
      <input
        type={field.type}
        value={form[field.key]}
        onChange={e => updateField(field.key, e.target.value)}
        placeholder={field.placeholder}
        required={field.required}
      />
    </label>
  );

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.grid}>
        {FIELDS_BEFORE_CATEGORY.map(renderField)}

        <label className={styles.field}>
          Category
          <select
            value={form.category}
            onChange={e => {
              const { value } = e.target;

              if (isProductCategory(value)) {
                updateField('category', value);
              }
            }}
          >
            {PRODUCT_CATEGORIES.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        {FIELDS_AFTER_CATEGORY.map(renderField)}
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
