import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader } from '../../components/Loader';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useProducts } from '../../hooks/useProducts';
import { BackBtn } from '../shared/components/BackBtn';
import styles from './CartPage.module.scss';
import { CartItem } from './components/CartItem';
import { Modal } from '../shared/components/Modal';
import { getTotalCartItems } from '../../utils/cart';
import { createOrder } from '../../api/orders';

export const CartPage = () => {
  const { cart, clearCart } = useCart();
  const { token } = useAuth();
  const { products, isLoading, error } = useProducts();
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState('');
  const navigate = useNavigate();

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return <p>{error}</p>;
  }

  const cartProducts = products.filter(product =>
    cart.some(item => item.id === product.id),
  );

  const getItemQty = (itemId: number) => {
    const cartItem = cart.find(p => p.id === itemId);

    return cartItem?.qty;
  };

  const getTotalPrice = () => {
    return cartProducts.reduce(
      (sum, product) =>
        sum +
        product.price * (cart.find(item => item.id === product.id)?.qty ?? 0),
      0,
    );
  };

  const totalItems = getTotalCartItems(cart);

  const confirmHandler = async () => {
    if (!token) {
      return;
    }

    setIsPlacingOrder(true);
    setOrderError('');

    try {
      const order = await createOrder(token);

      clearCart();
      setIsOpenModal(false);
      navigate('/orders', { state: { placedOrderId: order.id } });
    } catch {
      setOrderError('Failed to place order. Please try again.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const total = getTotalPrice();

  return (
    <div className="container">
      <BackBtn />
      <h1 className={styles.title}>Cart</h1>

      {cart.length === 0 ? (
        <h1>{`Your Cart is empty`}</h1>
      ) : (
        <div className={styles['cart-wrapper']}>
          <ul className={styles['product-list']}>
            {cartProducts.map(cartProduct => (
              <li key={cartProduct.id} className={styles['product-item']}>
                <CartItem
                  product={cartProduct}
                  qty={getItemQty(cartProduct.id)}
                />
              </li>
            ))}
          </ul>

          <div className={styles['total-block']}>
            <p className={styles.total}>${total}</p>
            <p className={styles['total-count']}>
              Total for {totalItems} {totalItems > 1 ? 'elements' : 'element'}
            </p>
            <button
              className={styles.checkout}
              onClick={() => setIsOpenModal(true)}
            >
              Checkout
            </button>
          </div>

          {isOpenModal && (
            <Modal
              onClose={() => setIsOpenModal(false)}
              onConfirm={() => confirmHandler()}
              isConfirmDisabled={isPlacingOrder}
              error={orderError}
            />
          )}
        </div>
      )}
    </div>
  );
};
