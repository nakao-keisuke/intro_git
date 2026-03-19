import BackButton from '@/app/[locale]/(header-footer-layout)/faq/components/BackButton';
import SearchWordButtonsApp from '@/app/[locale]/(header-footer-layout)/faq/components/SearchWordButtonsApp';
import Header from '@/app/[locale]/column/components/Header';
import Footer from '@/components/Footer';
import { FAQ_SEARCH_WORDS } from '@/constants/faqSearchWords';
import styles from '@/styles/category_faq/FaqCategory.module.css';

type Props = {
  label: string;
  children: React.ReactNode;
  backTo?: string;
};

export default function CategoryPage({
  label,
  children,
  backTo = '/faq',
}: Props) {
  return (
    <>
      <Header />
      <div className={styles.backButton}>
        <BackButton to={backTo} />
      </div>
      <main className={styles.container}>
        <article>
          <h1 className={styles.title}>よくある質問（{label}）</h1>
          <SearchWordButtonsApp searchWords={FAQ_SEARCH_WORDS} />
          {children}
        </article>
      </main>
      <Footer />
    </>
  );
}
