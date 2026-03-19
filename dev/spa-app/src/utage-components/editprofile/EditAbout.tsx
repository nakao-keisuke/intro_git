import { useState } from 'react';
import styles from '@/styles/editprofile/EditAbout.module.css';

type Props = {
  about: string;
  onSelect: (about: string) => void;
  onClose: () => void;
};

const EditAbout = ({ about, onSelect, onClose }: Props) => {
  const [inputValue, setInputValue] = useState(about);

  const onChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (event.target.value.length <= 300) {
      setInputValue(event.target.value);
    }
  };

  const onClick = () => {
    onSelect(inputValue);
  };

  return (
    <div className={styles.modal}>
      <textarea
        value={inputValue}
        onChange={onChange}
        className={styles.inputField}
        maxLength={300}
        placeholder="自己紹介を入力してください"
      />
      <div style={{ display: 'flex' }}>
        <button onClick={onClose} className={styles.cancelButton}>
          キャンセル
        </button>
        <button onClick={onClick} className={styles.submitButton}>
          OK
        </button>
        <div>
          <p className={styles.textLength}>{inputValue.length}/300</p>
        </div>
      </div>
    </div>
  );
};

export default EditAbout;
