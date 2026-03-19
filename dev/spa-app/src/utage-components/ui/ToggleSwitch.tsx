type ToggleSwitchProps = {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  ariaLabel?: string;
};

/**
 * 共通トグルスイッチコンポーネント
 * 設定画面で使用するON/OFFスイッチ
 */
export default function ToggleSwitch({
  checked,
  onChange,
  disabled = false,
  ariaLabel,
}: ToggleSwitchProps) {
  return (
    <label className="relative inline-flex h-6 w-[50px] items-center">
      <input
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        aria-label={ariaLabel}
      />
      <span className="absolute inset-0 cursor-pointer rounded-full bg-gray-300 transition peer-checked:bg-[rgba(77,175,80,1)] peer-disabled:cursor-not-allowed peer-disabled:opacity-50" />
      <span className="absolute top-[2px] left-[2px] h-5 w-5 rounded-full bg-white transition peer-checked:translate-x-[26px]" />
    </label>
  );
}
