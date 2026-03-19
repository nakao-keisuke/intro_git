// Image component removed (use <img> directly);
import { useState } from 'react';
import styles from '@/styles/purchase/PurchasePage.module.css';

const cardPic = '/point_howto/card.webp';
const paidyPic = '/purchase/paidy_logo_color.webp';
const bankPic = '/purchase/bank.webp';
const amazonPic = '/purchase/amazonpay.webp';

const PaymentTabs = ({
  selectedTab,
  handleTabChange,
  isPaidyAccount,
  lastPurchasePaymentMethod,
}: {
  selectedTab: 'credit' | 'paidy' | 'bank' | 'amazon';
  handleTabChange: (tab: 'credit' | 'paidy' | 'bank' | 'amazon') => void;
  isPaidyAccount: boolean;
  lastPurchasePaymentMethod?: string | undefined;
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // タブIDとlastPurchasePointTypeのマッピング
  const tabMapping = {
    credit: 'credit',
    amazon_pay: 'amazon',
    paidy: 'paidy',
  };

  // 前回決済のタブIDを取得
  const lastPurchaseTabId =
    lastPurchasePaymentMethod && lastPurchasePaymentMethod !== null
      ? tabMapping[lastPurchasePaymentMethod as keyof typeof tabMapping]
      : null;

  // すべての決済方法を定義
  const basePaymentMethods = [
    {
      id: 'credit',
      label: 'クレジット',
      icon: cardPic,
      width: 60,
      height: 40,
    },
  ];

  // Paidy審査員の場合は、Paidyを表示しないようにする
  const allPaymentMethods = isPaidyAccount
    ? [
        ...basePaymentMethods,
        {
          id: 'amazon',
          label: 'AmazonPay',
          icon: amazonPic,
          width: 50,
          height: 40,
        },
        {
          id: 'bank',
          label: 'コンビニ支払い',
          icon: bankPic,
          width: 50,
          height: 40,
        },
      ]
    : [
        ...basePaymentMethods,
        {
          id: 'paidy',
          label: 'Paidy',
          icon: paidyPic,
          width: 60,
          height: 40,
        },
        {
          id: 'amazon',
          label: 'AmazonPay',
          icon: amazonPic,
          width: 50,
          height: 40,
        },
        {
          id: 'bank',
          label: 'コンビニ支払い',
          icon: bankPic,
          width: 50,
          height: 40,
        },
      ];

  // 2つ目のタブは、クレジットが選択されていないときは「クレジット」、選択されているときはそれ以外の決済方法にする
  const secondTabMethod =
    selectedTab === 'credit'
      ? allPaymentMethods.find((method) => method.id !== 'credit')
      : allPaymentMethods[0];

  // ドロップダウンメニューの表示/非表示を切り替え
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // 決済方法タブがクリックされたときの処理
  const onTabClick = (tabId: string) => {
    handleTabChange(tabId as 'credit' | 'paidy' | 'bank' | 'amazon');
    setIsDropdownOpen(false); // 選択後はドロップダウンを閉じる
  };

  //「詳しく見る」タブに表示するあるアイコン(選択されていないタブのアイコン)
  const availableForDropdown = allPaymentMethods.filter(
    (method) => method.id !== selectedTab && method.id !== secondTabMethod?.id,
  );

  return (
    <div className={styles.tabBack}>
      <div className={styles.tabTitle}>お支払い方法</div>
      <div className={styles.tabContainer}>
        {/* 現在選択されているタブ */}
        <div
          key={selectedTab}
          className={`${styles.tab} ${styles.activeTab}`}
          onClick={() => onTabClick(selectedTab)}
          style={{ position: 'relative' }}
        >
          {lastPurchaseTabId === selectedTab &&
            lastPurchasePaymentMethod !== null && (
              <div className={styles.lastPurchaseLabel}>前回の購入</div>
            )}
          {allPaymentMethods.find((method) => method.id === selectedTab)?.label}
          <Image
            src={
              allPaymentMethods.find((method) => method.id === selectedTab)
                ?.icon || cardPic
            }
            alt={selectedTab}
            width={60}
            height={40}
            className={styles.tabIcon}
          />
        </div>

        {/* 2つ目のタブ */}
        <div
          key={secondTabMethod?.id}
          className={`${styles.tab} ${
            selectedTab === secondTabMethod?.id ? styles.activeTab : ''
          }`}
          onClick={() => onTabClick(secondTabMethod?.id || '')}
          style={{ position: 'relative' }}
        >
          {secondTabMethod?.label}
          <Image
            src={secondTabMethod?.icon || cardPic}
            alt={secondTabMethod?.label || 'クレジット'}
            width={secondTabMethod?.width || 60}
            height={secondTabMethod?.height || 40}
            className={styles.tabIcon}
          />
        </div>

        {/* 3つ目のタブ「詳しく見る」 */}
        <div
          className={`${styles.tab} ${styles.moreOptionsTab}`}
          onClick={toggleDropdown}
        >
          <span
            style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}
          >
            {/* 「詳しく見る」タブに表示されるアイコンを動的に変更 */}
            {availableForDropdown.map((method) => (
              <Image
                key={method.id}
                src={method.icon}
                alt={method.label}
                width={method.width || 40}
                height={method.height || 20}
                className={styles.tabIcon2}
              />
            ))}
          </span>
          <span>詳しく見る</span>
          <span className={styles.moreOptionsIcon}>
            {isDropdownOpen ? '▲' : '▼'}
          </span>
        </div>
      </div>

      {/* ドロップダウンメニュー - すべての決済方法を表示 */}
      {isDropdownOpen && (
        <div className={styles.dropdownMenu}>
          {allPaymentMethods.map((method) => (
            <div
              key={method.id}
              className={`${styles.dropdownItem} ${
                selectedTab === method.id ? styles.activeDropdownItem : ''
              }`}
              onClick={() => onTabClick(method.id)}
              style={{ position: 'relative' }}
            >
              <Image
                src={method.icon}
                alt={method.label}
                width={method.width ?? 24}
                height={method.height ?? 24}
                className={styles.dropdownIcon}
              />
              <span>{method.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PaymentTabs;
