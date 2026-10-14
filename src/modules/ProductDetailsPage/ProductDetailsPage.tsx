import { NavLink, useParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { Loader } from '@/components/Loader';
import { BreadCrumbs } from '@/modules/shared/components/BreadCrumbs';
import { BackBtn } from '@/modules/shared/components/BackBtn';
import styles from './ProductDetailsPage.module.scss';
import { ProductsSlider } from '@/modules/HomePage/components/ProductsSlider';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useCart } from '@/contexts/CartContext';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useProductDetailsQuery, useProductsQuery } from '@/hooks/queries';
import { ProductReviews } from './components/ProductReviews';
import { shuffle } from '@/utils/shuffle';
import { ProductDescription } from '@/types/ProductFull';

const SUGGESTED_COUNT = 8;

// Swatch colors for names that are not valid CSS colors.
const COLOR_MAP: Record<string, string> = {
  gold: '#FCDBC1',
  midnightgreen: '#5F7170',
  spacegray: '#4C4C4C',
  silver: '#C0C0C0',
  rosegold: '#DEA193',
  graphite: '#251607',
  sierrablue: '#BFDAF7',
  starlight: '#F8F9EC',
};

type Spec = {
  label: string;
  value: string | null;
};

const getShortSpecs = (product: ProductDescription): Spec[] => [
  { label: 'Screen', value: product.screen },
  { label: 'Resolution', value: product.resolution },
  { label: 'Capacity', value: product.capacity },
  { label: 'RAM', value: product.ram },
];

const getTechSpecs = (product: ProductDescription): Spec[] => [
  { label: 'Screen', value: product.screen },
  { label: 'Resolution', value: product.resolution },
  { label: 'Processor', value: product.processor },
  { label: 'RAM', value: product.ram },
  { label: 'Built in memory', value: product.capacity },
  { label: 'Camere', value: product.camera },
  { label: 'Zoom', value: product.zoom },
  { label: 'Cell', value: product.cell.join(', ') },
];

const SpecList: React.FC<{ specs: Spec[] }> = ({ specs }) => (
  <ul className={styles['option-list']}>
    {specs.map(spec => (
      <li key={spec.label} className={styles['option-item']}>
        <p className={styles.option}>{spec.label}</p>
        <p className={styles.value}>{spec.value}</p>
      </li>
    ))}
  </ul>
);

export const ProductDetailsPage = () => {
  const { category, productId } = useParams();
  const [activeImg, setActiveImg] = useState<string | undefined>(undefined);

  const { data: product, isLoading } = useProductDetailsQuery(
    category || '',
    productId || '',
  );

  // All products in the category, for "you may also like"
  const { data: categoryData } = useProductsQuery({
    category: category || undefined,
    perPage: 'all',
  });

  const { cart, toggleCart } = useCart();
  const { favorites, toggleFavorite } = useFavorites();
  const requireAuth = useRequireAuth();

  const productNumericId = product?.productId;
  const isFavorite = !!productNumericId && favorites.includes(productNumericId);
  const isProductInCart =
    !!productNumericId && cart.some(item => item.id === productNumericId);

  useEffect(() => {
    if (product?.images?.length) {
      setActiveImg(product.images[0]);
    }
  }, [product?.images]);

  // Shuffled once per product, not on every render.
  const suggestedProducts = useMemo(
    () =>
      shuffle(
        (categoryData?.items ?? []).filter(
          item => item.id !== productNumericId,
        ),
      ).slice(0, SUGGESTED_COUNT),
    [categoryData?.items, productNumericId],
  );

  const shortSpecs = product ? getShortSpecs(product) : [];
  const techSpecs = product ? getTechSpecs(product) : [];

  return (
    <div className="container">
      {!product && !isLoading && <h2>Product was not found</h2>}
      {isLoading && <Loader />}

      {product && (
        <div className={styles['product-details']}>
          <BreadCrumbs category={product.category} itemName={product.name} />
          <BackBtn />

          <h1 className={styles.title}>{product.name}</h1>

          <div className={styles['product-top']}>
            <img src={activeImg} className={styles['product-image']} />

            <div className={styles['images-block']}>
              {product.images.map(image => (
                <img
                  key={image}
                  src={image}
                  alt={product.name}
                  className={`${image === activeImg ? styles.active : ''}`}
                  onClick={() => setActiveImg(image)}
                />
              ))}
            </div>

            <div className={styles['product-characteristics']}>
              <div className={styles.colors}>
                <div className={styles['top-description']}>
                  <p className={styles['option-title']}>Available colors</p>
                  <p className={styles.id}>ID: {productNumericId}</p>
                </div>

                <div className={styles.colorDots}>
                  {product.colorsAvailable.map(color => (
                    <NavLink
                      key={color}
                      to={`/${category}/${product.namespaceId}-${product.capacity.toLowerCase()}-${color.toLowerCase()}`}
                      className={`${styles.colorDot} ${color === product.color ? styles.active : ''}`}
                      style={{
                        background: COLOR_MAP[color] || color,
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className={styles.capacities}>
                <p className={styles['option-title']}>Select capacity</p>

                <div className={styles.capacityDots}>
                  {product.capacityAvailable.map(capacity => (
                    <NavLink
                      key={capacity}
                      to={`/${category}/${product.namespaceId}-${capacity.toLowerCase()}-${product.color}`}
                      className={`${styles.capacity} ${capacity === product.capacity ? styles.active : ''}`}
                    >
                      <p>{capacity}</p>
                    </NavLink>
                  ))}
                </div>
              </div>

              <div className={styles.prices}>
                <p className={styles.price}>${product.priceDiscount}</p>
                {product.priceRegular !== product.priceDiscount && (
                  <p className={styles.fullPrice}>${product.priceRegular}</p>
                )}
              </div>

              <div className={styles['buttons-wrapper']}>
                <button
                  className={`${styles['add-to-cart']} ${isProductInCart ? styles.added : ''}`}
                  onClick={() =>
                    productNumericId &&
                    requireAuth(() => toggleCart(productNumericId))
                  }
                >
                  {isProductInCart ? 'Added' : 'Add to cart'}
                </button>
                <button
                  className={styles['add-to-favorite']}
                  onClick={() =>
                    productNumericId &&
                    requireAuth(() => toggleFavorite(productNumericId))
                  }
                >
                  <img
                    src={
                      isFavorite
                        ? '/img/icons/Favourites Filled (Heart Like).svg'
                        : '/img/icons/Favourites (Heart Like).svg'
                    }
                    alt="Favourites"
                  />
                </button>
              </div>

              <SpecList specs={shortSpecs} />
            </div>
          </div>

          <div className={styles['product-bottom']}>
            <div className={styles.about}>
              <p className={styles['section-title']}>About</p>
              {product.description.map((item, index) => (
                <div key={`${item.title}-${index}`}>
                  <p className={styles.title}>{item.title}</p>
                  <p className={styles.text}>{item.text}</p>
                </div>
              ))}
            </div>

            <div className={styles['tech-speck']}>
              <p className={styles['section-title']}>Tech specs</p>
              <SpecList specs={techSpecs} />
            </div>
          </div>

          {productNumericId && <ProductReviews productId={productNumericId} />}

          <div className={styles['may-like']}>
            <ProductsSlider
              products={suggestedProducts}
              title="You may also like"
            />
          </div>
        </div>
      )}
    </div>
  );
};
