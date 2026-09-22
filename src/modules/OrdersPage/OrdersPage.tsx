import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Loader } from '../../components/Loader';
import { BackBtn } from '../shared/components/BackBtn';
import { useAuth } from '../../contexts/AuthContext';
import * as ordersApi from '../../api/orders';
import { Order } from '../../api/orders';
import styles from './OrdersPage.module.scss';

export const OrdersPage = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      return;
    }

    ordersApi
      .getOrders(token)
      .then(setOrders)
      .finally(() => setIsLoading(false));
  }, [token]);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="container">
      <BackBtn />
      <h1 className={styles.title}>My Orders</h1>

      {orders.length === 0 ? (
        <h1>{`You have no orders yet`}</h1>
      ) : (
        <ul className={styles['order-list']}>
          {orders.map(order => (
            <li key={order.id} className={styles['order-item']}>
              <div className={styles.header}>
                <p className={styles.id}>Order #{order.id}</p>
                <p className={styles.date}>
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
                <p className={styles.status}>{order.status}</p>
              </div>

              <ul className={styles.products}>
                {order.items.map(item => (
                  <li key={item.id} className={styles.product}>
                    <NavLink
                      to={`/${item.product.category}/${item.product.itemId}`}
                    >
                      <img src={item.product.image} alt={item.product.name} />
                    </NavLink>
                    <p className={styles.name}>{item.product.name}</p>
                    <p className={styles.qty}>x{item.quantity}</p>
                    <p className={styles.price}>${item.priceAtPurchase}</p>
                  </li>
                ))}
              </ul>

              <p className={styles.total}>Total: ${order.total}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
