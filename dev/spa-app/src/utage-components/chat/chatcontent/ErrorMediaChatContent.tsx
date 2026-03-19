import type { ErrorMediaChatInfo } from '@/types/ChatInfo';

type Props = {
  errorMediaChatInfo: ErrorMediaChatInfo;
};

const ErrorMediaChatContent = ({ errorMediaChatInfo }: Props) => {
  return (
    <div className="text-[gainsboro]">
      <span>⚠メディアの送信に失敗しています⚠</span>
    </div>
  );
};
export default ErrorMediaChatContent;
