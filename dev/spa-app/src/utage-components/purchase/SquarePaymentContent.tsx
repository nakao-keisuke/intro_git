import Script from 'next/script';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { ClipLoader } from 'react-spinners';
import { isProduction } from '@/app/components/GoogleAnalytics';
import { SQUARE_PAYMENT } from '@/constants/endpoints';
import styles from '@/styles/purchase/SquarePaymentContainer.module.css';
import type { Card } from '@/types/square';
import { postToNext } from '@/utils/next';
import QuickChargeSuccessModal from './QuickChargeSuccessModal';

type SquarePaymentContentProps = {
  amount: number;
  point: number;
  email: string;
  userName: string;
};

/**
 * Squareのカード決済フォーム
 */
export const SquarePaymentContent = ({
  amount,
  point,
  email,
  userName,
}: SquarePaymentContentProps) => {
  const [card, setCard] = useState<Card | undefined>(undefined);
  const [payments, setPayment] = useState<any | undefined>(undefined);
  const appId = import.meta.env.VITE_SQUARE_APP_ID || '';
  const locationId = import.meta.env.VITE_SQUARE_LOCATION_ID || '';
  const cardElement = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDisplaySuccessModal, setIsDisplaySuccessModal] =
    useState<boolean>(false);
  /**
   * Squareの初期化
   */
  const initSquare = async () => {
    if (!window || window.Square === undefined) {
      return;
    }

    // カード決済フォームの破棄
    if (card) {
      await card.destroy();
    }
    // Squareの初期化
    const payments = await window.Square.payments(appId, locationId);

    // カード決済フォームの初期化
    const paymentCard = await payments.card();
    paymentCard.attach(cardElement.current!);

    setCard(paymentCard);
    setPayment(payments);
  };

  // マウント時にSquareの初期化を行う
  useEffect(() => {
    initSquare();
  }, []);

  /**
   * カード決済フォームのトークン化
   */
  const tokenize = async (card: Card): Promise<any> => {
    const tokenResult = await card.tokenize();

    if (tokenResult.status === 'OK') {
      return tokenResult.token;
    } else {
      tokenResult.errors.forEach((value) => console.log(value.message));
      throw new Error(`Tokenization failed ${tokenResult.status}`);
    }
  };

  /**
   * カード決済フォームの送信
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setIsLoading(true);
    e.preventDefault();

    try {
      if (!card) {
        throw new Error('Card is not initialized');
      }

      const token = await tokenize(card);
      const verificationToken = await verifyBuyer({
        token,
        amount,
      });

      const idempotencyKey = window.crypto.randomUUID();

      // カード決済APIの実行
      const response = await postToNext(SQUARE_PAYMENT, {
        idempotencyKey,
        locationId,
        sourceId: token,
        verificationToken,
        amount,
        point,
      });

      if (response.type === 'success') {
        setIsDisplaySuccessModal(true);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * SCA検証を実行する
   */
  const verifyBuyer = async ({
    token,
    amount,
  }: {
    token: string;
    amount: number;
  }): Promise<string> => {
    const verificationDetails = {
      amount: amount.toString(),
      currencyCode: 'JPY',
      intent: 'CHARGE',
      billingContact: {},
    };

    const verificationResults = await payments.verifyBuyer(
      token,
      verificationDetails,
    );
    return verificationResults.token;
  };

  return (
    <>
      {isDisplaySuccessModal && (
        <QuickChargeSuccessModal
          isRegisteredEmail={!!email && email.includes('@')}
          userName={userName}
          point={point}
          onClose={() => {
            setIsDisplaySuccessModal(false);
          }}
        />
      )}
      <Script
        src={
          isProduction
            ? 'https://web.squarecdn.com/v1/square.js'
            : 'https://sandbox.web.squarecdn.com/v1/square.js'
        }
        type="text/javascript"
        strategy="afterInteractive"
        onLoad={() => initSquare()}
      />
      <div className={styles.nextButtonContainer}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div ref={cardElement} />
          <div className={styles.priceRow}>
            <div>ご請求額: ¥{amount.toLocaleString()}</div>
            <div>獲得ポイント: {point.toLocaleString()}pt</div>
          </div>
          <button type="submit" className={styles.nextButton}>
            {isLoading ? <ClipLoader size={12} /> : `ポイントを購入する`}
          </button>
        </form>
      </div>
    </>
  );
};
