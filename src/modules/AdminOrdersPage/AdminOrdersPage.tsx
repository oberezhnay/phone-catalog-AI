import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Loader } from '@/components/Loader';
import { useAuth } from '@/contexts/AuthContext';
import {
  useAdminOrdersQuery,
  useUpdateOrderStatusMutation,
} from '@/hooks/queries';
import { ORDER_STATUSES, OrderStatus } from '@/api/orders';
import { AdminOrder } from '@/api/admin';
import { OrderStatusSelect } from './components/OrderStatusSelect';
import styles from './AdminOrdersPage.module.scss';

const formatItems = (order: AdminOrder) =>
  order.items.map(item => `${item.product.name} ×${item.quantity}`).join(', ');

export const AdminOrdersPage = () => {
  const { token } = useAuth();
  const [filter, setFilter] = useState<OrderStatus | ''>('');
  const {
    data: orders = [],
    isLoading,
    error,
  } = useAdminOrdersQuery(token, filter || undefined);
  const updateStatus = useUpdateOrderStatusMutation(token);

  const handleStatusChange = (id: number, status: OrderStatus) => {
    updateStatus.mutate({ id, status });
  };

  const isUpdating = (id: number) =>
    updateStatus.isPending && updateStatus.variables?.id === id;

  const renderSelect = (order: AdminOrder) => (
    <OrderStatusSelect
      orderId={order.id}
      value={order.status}
      disabled={isUpdating(order.id)}
      onChange={handleStatusChange}
    />
  );

  return (
    <div className="container">
      <div className={styles.header}>
        <h1 className={styles.title}>Admin · Orders</h1>
        <div className={styles.controls}>
          <NavLink to="/admin" className={styles.link}>
            Products
          </NavLink>
          <select
            className={styles.filter}
            aria-label="Filter by status"
            value={filter}
            onChange={e => setFilter(e.target.value as OrderStatus | '')}
          >
            <option value="">All statuses</option>
            {ORDER_STATUSES.map(status => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {updateStatus.isError && (
        <p className={styles.error} role="alert">
          Failed to update the order status. Please try again.
        </p>
      )}

      {isLoading && <Loader />}
      {error && <p>Failed to load orders.</p>}
      {!isLoading && !error && orders.length === 0 && (
        <p className={styles.empty}>No orders found.</p>
      )}

      {/* Mobile: card list (below tablet breakpoint) */}
      <ul className={styles['card-list']}>
        {orders.map(order => (
          <li key={order.id} className={styles.card}>
            <div className={styles['card-top']}>
              <p className={styles['card-id']}>Order #{order.id}</p>
              <p className={styles['card-date']}>
                {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
            <p className={styles['card-customer']}>
              {order.user.name} · {order.user.email}
            </p>
            <p className={styles['card-items']}>{formatItems(order)}</p>
            <div className={styles['card-bottom']}>
              <p className={styles.total}>${order.total}</p>
              {renderSelect(order)}
            </div>
          </li>
        ))}
      </ul>

      {/* Tablet and up: full table */}
      <div className={styles['table-wrapper']}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Order</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td>#{order.id}</td>
                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                <td>
                  {order.user.name}
                  <br />
                  <span className={styles.email}>{order.user.email}</span>
                </td>
                <td>{formatItems(order)}</td>
                <td>${order.total}</td>
                <td>{renderSelect(order)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
