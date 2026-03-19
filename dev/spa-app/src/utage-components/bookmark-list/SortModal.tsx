import type React from 'react';
import { useEffect, useRef } from 'react';
import styles from '@/styles/SortModal.module.css';

type SortOption = 'loginTime' | 'newUser';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSort: (option: SortOption) => void;
  currentSort: SortOption;
};

export const SortModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSort,
  currentSort,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // モーダルの外側クリックで閉じる
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Escapeキーでモーダルを閉じる & フォーカストラップ
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
        return;
      }

      // Tabキーでのフォーカストラップ
      if (e.key === 'Tab' && isOpen && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[
          focusableElements.length - 1
        ] as HTMLElement;

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // モーダルが開いたときに最初のボタンにフォーカス
      setTimeout(() => {
        const firstButton = modalRef.current?.querySelector('button');
        firstButton?.focus();
      }, 0);
    }

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSort = (option: SortOption) => {
    onSort(option);
    onClose();
  };

  const sortOptions = [
    {
      value: 'loginTime',
      label: 'ログイン順',
      description: '最近ログインした順',
    },
    { value: 'newUser', label: '登録順', description: '最近登録した順' },
  ] as const;

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div
        ref={modalRef}
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="sort-modal-title"
        aria-modal="true"
      >
        <div className={styles.header}>
          <h3 id="sort-modal-title" className={styles.title}>
            並び替え
          </h3>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="閉じる"
          >
            ✕
          </button>
        </div>
        <div className={styles.content}>
          {sortOptions.map((option) => (
            <button
              key={option.value}
              className={`${styles.sortOption} ${
                currentSort === option.value ? styles.active : ''
              }`}
              onClick={() => handleSort(option.value)}
              aria-pressed={currentSort === option.value}
            >
              <div className={styles.optionInfo}>
                <span className={styles.optionLabel}>{option.label}</span>
                <span className={styles.optionDescription}>
                  {option.description}
                </span>
              </div>
              {currentSort === option.value && (
                <span className={styles.checkmark} aria-hidden="true">
                  ✓
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
