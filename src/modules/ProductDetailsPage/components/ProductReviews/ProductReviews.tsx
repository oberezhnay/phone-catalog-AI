import { FormEvent, useEffect, useState } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import { useRequireAuth } from '../../../../hooks/useRequireAuth';
import * as reviewsApi from '../../../../api/reviews';
import { Review } from '../../../../api/reviews';
import styles from './ProductReviews.module.scss';

type Props = {
  productId: number;
};

export const ProductReviews: React.FC<Props> = ({ productId }) => {
  const { user, token } = useAuth();
  const requireAuth = useRequireAuth();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [average, setAverage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const myReview = reviews.find(review => review.user.id === user?.id);

  const loadReviews = () => {
    reviewsApi.getReviews(productId).then(data => {
      setReviews(data.reviews);
      setAverage(data.average);
      setIsLoading(false);
    });
  };

  useEffect(() => {
    loadReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  useEffect(() => {
    if (myReview) {
      setRating(myReview.rating);
      setComment(myReview.comment || '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myReview?.id]);

  const submitReview = async () => {
    if (!token || rating === 0) {
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await reviewsApi.upsertReview(token, productId, rating, comment);
      loadReviews();
    } catch {
      setError('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (rating === 0) {
      return;
    }

    requireAuth(() => submitReview());
  };

  const handleDelete = async () => {
    if (!token || !myReview) {
      return;
    }

    await reviewsApi.deleteReview(token, myReview.id);
    setRating(0);
    setComment('');
    loadReviews();
  };

  if (isLoading) {
    return null;
  }

  return (
    <div className={styles.reviews}>
      <p className={styles['section-title']}>
        Reviews {reviews.length > 0 && `(${reviews.length})`}
      </p>

      {reviews.length > 0 && (
        <p className={styles.average}>
          Average rating: {average.toFixed(1)} / 5
        </p>
      )}

      {reviews.length === 0 ? (
        <p className={styles.empty}>
          No reviews yet. Be the first to review this product!
        </p>
      ) : (
        <ul className={styles.list}>
          {reviews.map(review => (
            <li key={review.id} className={styles.item}>
              <div className={styles['item-header']}>
                <p className={styles.author}>{review.user.name}</p>
                <p className={styles.stars}>
                  {'★'.repeat(review.rating)}
                  {'☆'.repeat(5 - review.rating)}
                </p>
              </div>
              {review.comment && (
                <p className={styles.comment}>{review.comment}</p>
              )}
            </li>
          ))}
        </ul>
      )}

      <form className={styles.form} onSubmit={handleSubmit}>
        <p className={styles['form-title']}>
          {myReview ? 'Edit your review' : 'Leave a review'}
        </p>

        <div className={styles['stars-input']}>
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              type="button"
              className={`${styles.star} ${star <= rating ? styles.filled : ''}`}
              onClick={() => setRating(star)}
            >
              ★
            </button>
          ))}
        </div>

        <textarea
          className={styles.textarea}
          placeholder="Share your thoughts about this product (optional)"
          value={comment}
          onChange={event => setComment(event.target.value)}
        />

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles['form-buttons']}>
          <button
            type="submit"
            className={styles.submit}
            disabled={rating === 0 || isSubmitting}
          >
            {isSubmitting
              ? 'Saving...'
              : myReview
                ? 'Update review'
                : 'Submit review'}
          </button>

          {myReview && (
            <button
              type="button"
              className={styles.delete}
              onClick={handleDelete}
            >
              Delete
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
