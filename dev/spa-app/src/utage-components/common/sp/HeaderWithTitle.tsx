// Image component removed (use <img> directly);
import { useRouter } from 'next/router';
import { useGetMyInfo } from '@/hooks/useGetMyInfo.hook';

const HeaderWithTitle = ({ title }: { title: string }) => {
  const router = useRouter();
  const { isLoginUser } = useGetMyInfo();

  const handleGoBack = () => {
    if (!isLoginUser) {
      router.push('/signup');
      return;
    }
    router.back();
  };

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          height: '48px',
          fontWeight: 'bold',
          background: 'rgb(143, 141, 141)',
          color: '#fff',
        }}
      >
        <Image
          src={'/header/goback.webp'}
          alt="goBack"
          onClick={handleGoBack}
          width={30}
          height={30}
          className="cursor-pointer"
          style={{ padding: '8px', position: 'absolute', left: '0' }}
        />
        <div>{title}</div>
      </div>
    </div>
  );
};

export default HeaderWithTitle;
