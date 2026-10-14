import { NavLink } from 'react-router-dom';
import { AdminProduct } from '../../../../types/AdminProduct';
import styles from './ProductActions.module.scss';

type Props = {
  product: AdminProduct;
  onDelete: (product: AdminProduct) => void;
  // The card layout separates the actions from the rows above them.
  inCard?: boolean;
};

export const ProductActions: React.FC<Props> = ({
  product,
  onDelete,
  inCard = false,
}) => (
  <div className={`${styles.actions} ${inCard ? styles.inCard : ''}`}>
    <NavLink to={`/admin/products/${product.id}/edit`}>Edit</NavLink>
    <button
      type="button"
      className={styles.delete}
      onClick={() => onDelete(product)}
    >
      Delete
    </button>
  </div>
);
