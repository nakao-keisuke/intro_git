// Image component removed (use <img> directly);
import styles from '@/styles/tuto/Search.module.css';

const searchPic = '/tuto/OnlineUser.webp';

const Search: React.FC = () => {
  // const router = useRouter();
  // const [isRegistered, setIsRegistered] = useState(false);

  // useEffect(() => {
  //   // クライアントサイドでのみ実行
  //   if (typeof window !== 'undefined') {
  //     const registeredStatus = localStorage.getItem('isRegistered') === 'true';
  //     setIsRegistered(registeredStatus);
  //   }
  // }, []);

  // const handleClick = () => {
  //   if (isRegistered) {
  //     router.push('/login');
  //   } else {
  //     router.push('/signup');
  //   }
  // };

  // const markerRef = useRef(null);
  // const [showButton, setShowButton] = useState(false);

  // useEffect(() => {
  //   const marker = markerRef.current;
  //   if (!marker) return;

  //   const observer = new IntersectionObserver(
  //     (entries) => {
  //       entries.forEach((entry) => {
  //         if (!entry.isIntersecting && entry.boundingClientRect.top < 0) {
  //           setShowButton(true);
  //         } else {
  //           setShowButton(false);
  //         }
  //       });
  //     },
  //     {
  //       root: null,
  //       rootMargin: '0px',
  //       threshold: 0.1,
  //     }
  //   );

  //   observer.observe(marker);

  //   return () => {
  //     if (marker) observer.unobserve(marker);
  //   };
  // }, []);

  // const [showBubbles, setShowBubbles] = useState({
  //   B: false,
  //   C: false,
  //   D: false,
  // });

  // const bubbleARef = useRef(null);

  // // useEffect(() => {
  // //   const bubbleA = bubbleARef.current;
  // //   if (!bubbleA) return;

  // //   const observer = new IntersectionObserver(
  // //     (entries) => {
  // //       entries.forEach((entry) => {
  // //         if (entry.isIntersecting) {
  // //           // バブルAが表示されたら、順番にバブルBからDを表示
  // //           setShowBubbles({
  // //             B: true,
  // //             C: true,
  // //             D: true,
  // //           });
  // //           observer.unobserve(bubbleA); // 一度表示したら監視を解除
  // //         }
  // //       });
  // //     },
  // //     {
  // //       root: null,
  // //       rootMargin: '0px',
  // //       threshold: 0.1,
  // //     }
  // //   );

  // //   observer.observe(bubbleA);

  // //   return () => {
  // //     if (bubbleA) observer.unobserve(bubbleA);
  // //   };
  // // }, []);

  // useEffect(() => {
  //   if (showBubbles.B) {
  //     const timerC = setTimeout(() => {
  //       setShowBubbles((prev) => ({ ...prev, C: true }));
  //     }, 500); // 0.5秒後にバブルCを表示

  //     const timerD = setTimeout(() => {
  //       setShowBubbles((prev) => ({ ...prev, D: true }));
  //     }, 1000); // 1秒後にバブルDを表示

  //     return () => {
  //       clearTimeout(timerC);
  //       clearTimeout(timerD);
  //     };
  //   }
  //   return () => { }; // 空の関数を返す
  // }, [showBubbles.B]);

  // ページ表示時にイベントを送信
  // useEffect(() => {
  //   trackEvent('OPEN_HOME_PAGE');
  // }, []);

  return (
    <div className={styles.container}>
      <div className={styles.title_container}>
        <div className={styles.title}>オンライン中の女の子一覧</div>
        <div className={styles.subtitle}>Online Girls</div>
      </div>
      <div className={styles.search_container}>
        <div className={styles.search_text}>
          <span className={styles.search_text_number}>
            女性登録者数23万人以上！
          </span>
          ビデオ通話やチャットで好みの女性とやり取りしよう！
        </div>
        <Image
          src={searchPic}
          alt="OnlineUser"
          className={styles.OnlineUser_image}
        />
        <div className={styles.search_button}>
          {/* <div className={styles.search_button_text} onClick={handleClick}> */}
          {/* {isRegistered */}
          'ログインして女の子を見る♡'
          {/* : '登録して女の子を見る♡'} */}
          {/* </div> */}
        </div>
      </div>
    </div>
  );
};

export default Search;
