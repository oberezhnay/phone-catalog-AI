import React from 'react';
import styles from './ShopByCategory.module.scss';
import { NavLink } from 'react-router-dom';

type Props = {
  phonesQnt: number;
  tabletsQnt: number;
  accessoriesQnt: number;
};
export const ShopByCategory: React.FC<Props> = ({
  phonesQnt,
  tabletsQnt,
  accessoriesQnt,
}) => {
  const categories = [
    {
      path: '/phones',
      src: 'img/phones-category.png',
      title: 'Mobile Phones',
      qnt: phonesQnt,
    },
    {
      path: '/tablets',
      src: 'img/tablets-category.png',
      title: 'Tablets',
      qnt: tabletsQnt,
    },
    {
      path: '/accessories',
      src: 'img/accessories-category.png',
      title: 'Accessories',
      qnt: accessoriesQnt,
    },
  ];

  return (
    <section className={styles['categories-block']}>
      <p className={styles.title}>Shop by category</p>

      <div className={styles.categories}>
        {categories.map(category => (
          <NavLink to={category.path} key={category.path}>
            <div className={styles.category}>
              <img src={category.src} alt={category.title} />
              <p className={styles['category-title']}>{category.title}</p>
              <p className={styles['category-qnt']}>
                {category.qnt} {category.qnt > 1 ? 'models' : 'model'}
              </p>
            </div>
          </NavLink>
        ))}
      </div>
    </section>
  );
};
