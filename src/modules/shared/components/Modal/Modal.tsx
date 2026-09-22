import styles from './Modal.module.scss';

type Props = {
  onClose: () => void;
  onConfirm: () => void;
  isConfirmDisabled?: boolean;
  error?: string;
};

export const Modal: React.FC<Props> = ({
  onClose,
  onConfirm,
  isConfirmDisabled,
  error,
}) => {
  const handleOutClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.backdrop} onClick={handleOutClick}>
      <div className={styles.modal}>
        <h3 className={styles.title}>Place order?</h3>
        <p className={styles.text}>
          This will create your order and clear the cart.
        </p>
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.buttons}>
          <button className={styles.cancel} onClick={onClose}>
            Cancel
          </button>
          <button
            className={styles.confirm}
            onClick={onConfirm}
            disabled={isConfirmDisabled}
          >
            {isConfirmDisabled ? 'Placing...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
};
