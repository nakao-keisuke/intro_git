// Image component removed (use <img> directly);
// TODO: i18n - import { useTranslations } from '#/i18n';
import { useNativeErrorFallback } from '@/hooks/useNativeErrorFallback.hook';
import type { ErrorData } from '@/types/NextApi';

type Props = {
  errorData: ErrorData;
};

const ErrorCard = ({ errorData }: Props) => {
  const t = useTranslations('errors');
  const { handleBack } = useNativeErrorFallback({
    fallbackPath: '/girls/all',
  });

  return (
    <div className="w-full">
      <h2 className="relative mb-4 pb-4 text-center font-bold text-2xl">
        {t('errorOccurred')}
        <span className="absolute bottom-0 left-[10%] h-1.5 w-[80%] rounded bg-gradient-to-l from-[#37b4ff] to-[#aee0ff]"></span>
      </h2>
      <div className="mb-4 flex justify-center">
        <Image src="/character/s16.webp" width={120} height={100} alt="error" />
      </div>
      <div className="m-4 rounded border border-[#aee0ff] bg-[#ecf8ff] p-4">
        <p className="mb-4 text-center text-[#2b3134] text-base">
          {errorData.message}
        </p>
      </div>
      <button
        onClick={handleBack}
        className="mx-auto mt-4 block rounded-full border-[#0686b2] border-b-2 bg-gradient-to-t from-[#1a9ac4] to-[#27acd9] px-8 py-2.5 font-bold text-white text-xl transition-opacity hover:opacity-90"
      >
        {t('goBack')}
      </button>
    </div>
  );
};

export default ErrorCard;
