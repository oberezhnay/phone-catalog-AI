import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Loader } from '@/components/Loader';
import { useAdminProductsQuery } from '@/hooks/queries';
import { useAuth } from '@/contexts/AuthContext';
import { deleteAdminProduct } from '@/api/admin';
import { Modal } from '@/modules/shared/components/Modal';
import { AdminProduct } from '@/types/AdminProduct';
import { AdminProductCard } from './components/AdminProductCard';
import { AdminProductRow } from './components/AdminProductRow';
import styles from './AdminPage.module.scss';

export const AdminPage = () => {
  const { data: products = [], isLoading, error } = useAdminProductsQuery();
  const { token } = useAuth();
  const queryClient = useQueryClient();

  const [productToDelete, setProductToDelete] = useState<AdminProduct | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const handleDelete = async () => {
    if (!token || !productToDelete) {
      return;
    }

    setIsDeleting(true);
    setDeleteError('');

    try {
      await deleteAdminProduct(token, productToDelete.id);
      await queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      setProductToDelete(null);
    } catch {
      setDeleteError('Failed to delete product. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return <p>Failed to load products.</p>;
  }

  return (
    <div className="container">
      <div className={styles.header}>
        <h1 className={styles.title}>Admin · Products</h1>
        <NavLink to="/admin/products/new" className={styles['add-button']}>
          + Add product
        </NavLink>
      </div>

      {/* Mobile: card list (below tablet breakpoint) */}
      <ul className={styles['card-list']}>
        {products.map(product => (
          <AdminProductCard
            key={product.id}
            product={product}
            onDelete={setProductToDelete}
          />
        ))}
      </ul>

      {/* Tablet and up: full table */}
      <div className={styles['table-wrapper']}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <AdminProductRow
                key={product.id}
                product={product}
                onDelete={setProductToDelete}
              />
            ))}
          </tbody>
        </table>
      </div>

      {productToDelete && (
        <Modal
          title="Delete product?"
          text={`This will permanently delete "${productToDelete.name}".`}
          confirmLabel="Delete"
          pendingLabel="Deleting..."
          isConfirmDisabled={isDeleting}
          error={deleteError}
          onClose={() => setProductToDelete(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
};
