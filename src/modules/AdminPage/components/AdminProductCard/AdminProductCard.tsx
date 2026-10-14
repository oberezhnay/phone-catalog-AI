import { AdminProduct } from '../../../../types/AdminProduct';
import { ProductActions } from '../ProductActions';
import styles from './AdminProductCard.module.scss';

type Props = {
  product: AdminProduct;
  onDelete: (product: AdminProduct) => void;
};

// Mobile layout of one product; the table row is used from the tablet up.
export const AdminProductCard: React.FC<Props> = ({ product, onDelete }) => (
  <li className={styles.card}>
    <div className={styles['card-top']}>
      <img src={product.image} alt={product.name} className={styles.thumb} />
      <div>
        <p className={styles['card-name']}>{product.name}</p>
        <p className={styles['card-category']}>{product.category}</p>
      </div>
    </div>

    <div className={styles['card-row']}>
      <span>Price</span>
      <span>${product.priceDiscount}</span>
    </div>
    <div className={styles['card-row']}>
      <span>Stock</span>
      <span>{product.stock}</span>
    </div>

    <ProductActions product={product} onDelete={onDelete} inCard />
  </li>
);
