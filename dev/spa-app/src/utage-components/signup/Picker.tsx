import type React from 'react';
import { useState } from 'react';
import styles from '@/styles/signup/Picker.module.css';

interface PickerProps {
  options: readonly string[];
  onSelect: (option: string) => void;
  onCancel: () => void;
}

const Picker: React.FC<PickerProps> = ({ options, onSelect, onCancel }) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleSelect = (option: string) => {
    setSelectedOption(option);
  };

  const handleOK = () => {
    if (selectedOption) {
      onSelect(selectedOption);
    }
    onCancel();
  };

  return (
    <div className={styles.picker}>
      <div className={styles.optionList}>
        {options.map((option) => (
          <button
            type="button"
            key={option}
            onClick={() => handleSelect(option)}
            className={`${styles.option} ${
              selectedOption === option ? styles.selected : ''
            }`}
          >
            {option}
          </button>
        ))}
      </div>
      <center>
        <div className={styles.buttonContainer}>
          <button type="button" onClick={handleOK} className={styles.okButton}>
            OK
          </button>
        </div>
      </center>
    </div>
  );
};

export default Picker;
