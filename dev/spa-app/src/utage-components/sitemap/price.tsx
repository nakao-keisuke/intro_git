// Image component removed (use <img> directly);
import styles from '@/styles/sitemap/price.module.css';

const _safePic = '/tuto/29.webp';
const _dayPic = '/tuto/30.webp';
const _checkPic = '/tuto/31.webp';
const cardPic = '/payment.webp';

import {
  isStreamingPricingInfo,
  PRICING_DISPLAY_NAMES,
  PRICING_INFO,
  STREAMING_PRICING_SORT_ORDER,
} from '@/constants/pricing';
import Footer from '../Footer';

const Price = () => {
  // 通常コンテンツの料金情報をフィルタリング
  const regularContent = PRICING_INFO.filter(
    (item) => !isStreamingPricingInfo(item),
  );

  // 配信コンテンツの料金情報をフィルタリング
  const streamingContent = PRICING_INFO.filter(isStreamingPricingInfo).sort(
    (a, b) =>
      STREAMING_PRICING_SORT_ORDER.indexOf(a.label) -
      STREAMING_PRICING_SORT_ORDER.indexOf(b.label),
  );

  return (
    <div className={styles.container}>
      <div className={styles.title_container}>
        <div className={styles.title}>料金案内</div>
        <div className={styles.subtitle}>Price</div>
        <div className={styles.text}>
          Utageは先払いポイント購入制です。データ通信料金はお客様のご負担となります。
        </div>

        <div className={styles.tables_container}>
          {/* 通常コンテンツテーブル */}
          <div className={styles.table_container}>
            <table className={styles.price_table}>
              <thead>
                <tr>
                  <th className={styles.price_table_title}>通常コンテンツ</th>
                  <th className={styles.price_table_title}>ポイント</th>
                </tr>
              </thead>
              <tbody>
                {regularContent.map((item, index) => (
                  <tr key={index}>
                    <td className={styles.table_title}>
                      {PRICING_DISPLAY_NAMES[item.label] || item.label}
                    </td>
                    <td>
                      {item.price}
                      {item.unit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ビデオチャットコンテンツテーブル */}
          <div className={styles.table_container}>
            <table className={styles.price_table}>
              <thead>
                <tr>
                  <th className={styles.price_table_title}>配信コンテンツ</th>
                  <th className={styles.price_table_title}>ポイント</th>
                </tr>
              </thead>
              <tbody>
                {streamingContent.map((item, index) => (
                  <tr key={index}>
                    <td className={styles.table_title}>
                      {PRICING_DISPLAY_NAMES[item.label] || item.label}
                    </td>
                    <td>
                      {item.price}
                      {item.unit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className={styles.nopayy}>
            <div className={styles.nopay}>豊富な無料機能</div>
            <span className={styles.supportp}>
              見せあい掲示板、通話リクエスト、いいね...
            </span>
            <p>
              ポイント消費ナシで相手へアピールできる機能を多数ご用意しております！
            </p>
          </div>
        </div>
      </div>
      <div className={styles.payment}>
        <div className={styles.title}>豊富な決済方法</div>
        <div className={styles.subtitle}>Payment</div>
        <div className={styles.paymentText}>
          各種決済方法を取り揃えております。
          利用明細はサイト名が記載されず安心です。
        </div>
        <Image
          src={cardPic}
          alt="payment"
          width={1000}
          height={402}
          className={styles.paymentImage}
          loading="lazy"
        />
      </div>
      <Footer />
    </div>
  );
};

export default Price;
