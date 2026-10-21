import { ORDER_STATUSES, OrderStatus } from '@/api/orders';
import styles from './OrderStatusSelect.module.scss';

type Props = {
  orderId: number;
  value: OrderStatus;
  disabled?: boolean;
  onChange: (id: number, status: OrderStatus) => void;
};

export const OrderStatusSelect: React.FC<Props> = ({
  orderId,
  value,
  disabled,
  onChange,
}) => (
  <select
    className={styles.select}
    aria-label={`Status of order #${orderId}`}
    value={value}
    disabled={disabled}
    onChange={e => onChange(orderId, e.target.value as OrderStatus)}
  >
    {ORDER_STATUSES.map(status => (
      <option key={status} value={status}>
        {status}
      </option>
    ))}
  </select>
);
