import styles from './Modal.module.scss';

type Props = {
  onClose: () => void;
  onConfirm: () => void;
  isConfirmDisabled?: boolean;
  error?: string;
  title?: string;
  text?: string;
  confirmLabel?: string;
  pendingLabel?: string;
};

export const Modal: React.FC<Props> = ({
  onClose,
  onConfirm,
  isConfirmDisabled,
  error,
  title = 'Place order?',
  text = 'This will create your order and clear the cart.',
  confirmLabel = 'Confirm',
  pendingLabel = 'Placing...',
}) => {
  const handleOutClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.backdrop} onClick={handleOutClick}>
      <div className={styles.modal}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.text}>{text}</p>
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
            {isConfirmDisabled ? pendingLabel : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
