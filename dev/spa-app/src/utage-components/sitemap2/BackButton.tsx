// Image component removed (use <img> directly);
import { useNavigate } from '@tanstack/react-router';
import styles from '@/styles/sitemap/freepoints.module.css';

interface Props {
  href: string;
  className: string;
}

export default function BackButton({ href, className }: Props) {
  const router = useRouter();

  const handleClick = () => {
    router.push(href);
  };

  return (
    <div className={styles.backButton} onClick={handleClick}>
      <Image src="/header/goback.bl.webp" alt="戻る" width={30} height={30} />
    </div>
  );
}
