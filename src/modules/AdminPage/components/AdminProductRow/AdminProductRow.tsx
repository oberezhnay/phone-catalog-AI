import { AdminProduct } from '@/types/AdminProduct';
import { ProductActions } from '@/modules/AdminPage/components/ProductActions';
import styles from './AdminProductRow.module.scss';

type Props = {
  product: AdminProduct;
  onDelete: (product: AdminProduct) => void;
};

// Table row for tablet and up. Cell styles come from the table in AdminPage.
export const AdminProductRow: React.FC<Props> = ({ product, onDelete }) => (
  <tr>
    <td>
      <img src={product.image} alt={product.name} className={styles.thumb} />
    </td>
    <td>{product.name}</td>
    <td>{product.category}</td>
    <td>${product.priceDiscount}</td>
    <td>{product.stock}</td>
    <td>
      <ProductActions product={product} onDelete={onDelete} />
    </td>
  </tr>
);
