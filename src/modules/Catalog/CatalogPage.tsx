import { useCallback, useEffect, useRef } from 'react';
import {
  CatalogCategory,
  useCatalogCategory,
} from '../../hooks/useCatalogCategory';
import { Loader } from '../../components/Loader';
import { ProductsList } from './components/ProductsList';
import { useProductsQuery } from '../../hooks/queries/useProductsQuery';
import styles from './CatalogPage.module.scss';
import { ProductCategory } from '../../types/ProductCategory';
import { Pagination } from '../shared/components/Pagination';
import { BreadCrumbs } from '../shared/components/BreadCrumbs';
import { useSearchParams } from 'react-router-dom';
import { CustomSelect } from './components/Select';

export type PerPageType = '4' | '8' | '16' | 'all';

export const CatalogPage = () => {
  const category: CatalogCategory | null = useCatalogCategory();

  const [searchParams, setSearchParams] = useSearchParams();

  const sort = searchParams.get('sort') || undefined;
  const perPage = (searchParams.get('perPage') || 'all') as PerPageType;
  const activePage = Number(searchParams.get('page') || 1);

  const prevSort = useRef(sort);
  const prevPerPage = useRef(perPage);

  const titles: Record<ProductCategory, string> = {
    phones: 'Mobile phones',
    tablets: 'Tablets',
    accessories: 'Accessories',
  };

  const updateParam = useCallback(
    (param: string, value: string | number | null) => {
      const newParams = new URLSearchParams(searchParams);

      const stringValue = value?.toString() ?? '';

      const isDefault =
        (param === 'page' && stringValue === '1') ||
        (param === 'perPage' && stringValue === 'all') ||
        (param === 'sort' && !stringValue);

      if (!stringValue || isDefault) {
        newParams.delete(param);
      } else {
        newParams.set(param, stringValue);
      }

      setSearchParams(newParams);
    },
    [searchParams, setSearchParams],
  );

  // Fetch products from server
  const { data, isLoading, error } = useProductsQuery({
    category: category || undefined,
    sort: sort as 'title' | 'price' | 'age' | undefined,
    page: activePage,
    perPage,
  });

  const products = data?.items || [];
  const total = data?.total || 0;
  const loadingError = !!error;

  useEffect(() => {
    const sortChanged = prevSort.current !== sort;
    const perPageChanged = prevPerPage.current !== perPage;

    if (sortChanged || perPageChanged) {
      updateParam('page', '1');
    }

    prevSort.current = sort;
    prevPerPage.current = perPage;
  }, [sort, perPage, updateParam]);

  return (
    <div className="container">
      {loadingError && !isLoading && <h1>Something went wrong</h1>}

      {!isLoading && products.length === 0 && (
        <h1>{`There no ${category} yet`}</h1>
      )}

      {isLoading && <Loader />}

      {!isLoading && !loadingError && (
        <div className={styles.catalog}>
          <BreadCrumbs category={category as ProductCategory} />
          <h1 className={styles.title}>
            {titles[category as ProductCategory]}
          </h1>
          <p className={styles['category-qnt']}>{total} models</p>

          <div className={styles.filters}>
            <div className={styles['filter-sort']}>
              <p className={styles.label}>Sort by</p>
              <CustomSelect
                value={sort || ''}
                onChange={v => updateParam('sort', v)}
                options={[
                  { value: 'age', label: 'Newest' },
                  { value: 'title', label: 'Alphabetically' },
                  { value: 'price', label: 'Cheapest' },
                ]}
              />
            </div>

            <div className={styles['filter-perPage']}>
              <p className={styles.label}>Items on page</p>
              <CustomSelect
                value={perPage}
                onChange={v => updateParam('perPage', v)}
                options={[
                  { value: '4', label: '4' },
                  { value: '8', label: '8' },
                  { value: '16', label: '16' },
                  { value: 'all', label: 'all' },
                ]}
              />
            </div>
          </div>

          {products.length > 0 && <ProductsList products={products} />}

          {perPage !== 'all' && (
            <Pagination
              total={total}
              perPage={perPage}
              currentPage={activePage}
              onPageChange={page => updateParam('page', page)}
            />
          )}
        </div>
      )}
    </div>
  );
};
