import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Loader } from '@/components/Loader';
import { BackBtn } from '@/modules/shared/components/BackBtn';
import { useAdminProductsQuery } from '@/hooks/queries';
import { useAuth } from '@/contexts/AuthContext';
import { createAdminProduct, updateAdminProduct } from '@/api/admin';
import { ApiError } from '@/api/http';
import { AdminProductInput } from '@/types/AdminProduct';
import { ProductForm } from '@/modules/AdminPage/components/ProductForm';
import styles from './AdminProductFormPage.module.scss';

export const AdminProductFormPage = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { token } = useAuth();
  const queryClient = useQueryClient();

  const { data: products, isLoading } = useAdminProductsQuery();
  const product = products?.find(p => p.id === Number(id));

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (isEditMode && isLoading) {
    return <Loader />;
  }

  if (isEditMode && !isLoading && !product) {
    return <h2>Product was not found</h2>;
  }

  const handleSubmit = async (payload: AdminProductInput) => {
    if (!token) {
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      if (isEditMode && product) {
        await updateAdminProduct(token, product.id, payload);
      } else {
        await createAdminProduct(token, payload);
      }

      await queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      navigate('/admin');
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Failed to save product';

      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container">
      <BackBtn />
      <h1 className={styles.title}>
        {isEditMode ? `Edit "${product?.name}"` : 'Add product'}
      </h1>

      <ProductForm
        initialProduct={product}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        error={error}
        submitLabel={isEditMode ? 'Save changes' : 'Create product'}
      />
    </div>
  );
};
