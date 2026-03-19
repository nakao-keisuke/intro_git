import { useState } from 'react';

type Props = {
  userName: string;
  onSelect: (userName: string) => void;
};

const EditUserName = ({ userName, onSelect }: Props) => {
  const [inputValue, setInputValue] = useState(userName);

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.value.length <= 38) {
      setInputValue(event.target.value);
    }
  };

  const onClick = () => {
    onSelect(inputValue);
  };

  return (
    <div className="w-full flex flex-col items-center justify-center gap-4">
      <input
        value={inputValue}
        onChange={onChange}
        className="w-full px-4 py-3 rounded-lg border border-[#d0d0d0] text-[15px] outline-[#44c2eb]"
        maxLength={38}
        placeholder="ユーザー名を入力してください"
      />
      <button
        onClick={onClick}
        className="bg-[#44c2eb] text-white py-2.5 px-8 rounded-3xl cursor-pointer text-[15px] font-semibold transition-opacity duration-200 hover:opacity-80"
      >
        OK
      </button>
    </div>
  );
};

export default EditUserName;
