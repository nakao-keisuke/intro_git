// Image component removed (use <img> directly);
import type React from 'react';
import { useEffect, useState } from 'react';
import styles from '@/styles/purchase/PurchasePage.module.css';

const badge800Pic = '/800.webp';
const badge480Pic = '/480.webp';
const PaidyBannerPic = '/banner/paidy_header.webp';

import { useRouter } from 'next/router';
import QuickChargeSuccessModal from '@/components/purchase/QuickChargeSuccessModal';
import { PAIDY_CAPTURE } from '@/constants/endpoints';
import { initializePaidy } from '@/libs/paidy';
import { usePointStore } from '@/stores/pointStore';
import { postToNext } from '@/utils/next';
import { PaidyScriptLoader } from '../PaidyScriptLoader';

interface PaidyPaymentContentProps {
  email?: string;
  userName: string;
  userId: string;
  point: number;
  isFirstBonusCourseExist?: boolean;
  isSecondBonusCourseExist?: boolean;
  isThirdBonusCourseExist?: boolean;
  isFourthBonusCourseExist?: boolean;
  isFifthBonusCourseExist?: boolean;
  onPaidySuccess?: () => void;
}

const PaidyPaymentContent: React.FC<PaidyPaymentContentProps> = (props) => {
  const router = useRouter();

  // State for selected course
  const [selectedCourse, setSelectedCourse] = useState<{
    point: number;
    money: number;
    isBonusExist: boolean;
  } | null>(null);

  // Current point state (UI表示用)
  const [currentPointValue, setCurrentPointValue] = useState<number>(
    props.point,
  );
  const updatePointOptimistic = usePointStore((s) => s.updatePointOptimistic);

  // State for Paidy payment loading
  const [isPaidyPaymentLoading, setIsPaidyPaymentLoading] =
    useState<boolean>(false);

  // State for success modal
  const [isDisplaySuccessModal, setIsDisplaySuccessModal] =
    useState<boolean>(false);

  // Flag to control whether to proceed to payment
  const [proceedToPayment, setProceedToPayment] = useState(false);

  // Navigate to Paidy introduction page
  const goToPaidyInfo = () => {
    router.push('/paidy-introduction');
  };

  // Pre-select the middle course (2,000pt option)
  useEffect(() => {
    // デフォルトで2900コースを選択
    setSelectedCourse({
      point: props.isThirdBonusCourseExist ? 2500 : 2000,
      money: 2900,
      isBonusExist: !!props.isThirdBonusCourseExist,
    });
  }, [props.isThirdBonusCourseExist]);

  // Process payment when proceedToPayment is true
  useEffect(() => {
    if (proceedToPayment && selectedCourse) {
      processPaidyPayment(
        selectedCourse.point,
        selectedCourse.money,
        selectedCourse.isBonusExist,
      );
      // Reset the flag
      setProceedToPayment(false);
    }
  }, [proceedToPayment]);

  const onClickCourse = (
    point: number,
    money: number,
    isBonusExist: boolean,
  ) => {
    setSelectedCourse({ point, money, isBonusExist });
    // Don't proceed to payment on course selection
    setProceedToPayment(false);
  };

  const handleNextClick = () => {
    if (selectedCourse) {
      setProceedToPayment(true);
    }
  };

  const processPaidyPayment = async (
    point: number,
    money: number,
    _isBonusExist: boolean,
  ) => {
    try {
      const paidyHandler = initializePaidy((callbackData) => {
        (async () => {
          try {
            if (callbackData.status === 'closed') {
              alert('決済がキャンセルされました');
              return;
            }

            if (callbackData.status === 'rejected') {
              alert('決済が拒否されました');
              return;
            }

            const result = await postToNext<{
              type: 'success' | 'error';
            }>(PAIDY_CAPTURE, {
              callbackData,
              add_points: point,
            });

            if (result.type === 'error') {
              alert('決済に失敗しました');
              return;
            }

            localStorage.setItem(
              'paidyPurchaseSuccess',
              JSON.stringify({
                userId: props.userId,
                userName: props.userName,
                pointsAdded: point,
                moneyPaid: money,
                date: new Date().toISOString(),
              }),
            );

            // 楽観的にポイントを加算し、モーダル表示
            updatePointOptimistic(point);
            setCurrentPointValue((prev) => prev + point);
            setIsPaidyPaymentLoading(false);
            setIsDisplaySuccessModal(true);

            // Notify parent if callback provided
            if (props.onPaidySuccess) {
              props.onPaidySuccess();
            }
          } catch (error) {
            console.error('Failed to capture payment', error);
          }
        })();
      });

      paidyHandler.launch({
        amount: money,
        currency: 'JPY',
        buyer: {
          name1: props.userName,
        },
        buyer_data: {
          user_id: props.userId,
        },
        order: {
          items: [
            {
              title: `${money}円(${point}ptコース)`,
              quantity: 1,
              unit_price: money,
            },
          ],
        },
      });
    } catch (error) {
      console.error('Failed to initialize Paidy', error);
    }
  };

  // Helper function to determine if a course is selected
  const isCourseSelected = (point: number, money: number) => {
    return selectedCourse?.point === point && selectedCourse?.money === money;
  };

  if (isPaidyPaymentLoading) {
    return (
      <div className={styles.containerFixedHeight}>
        <div className={styles.loader}></div>
      </div>
    );
  }

  return (
    <>
      <PaidyScriptLoader />
      {isDisplaySuccessModal && (
        <QuickChargeSuccessModal
          isRegisteredEmail={!!props.email && props.email.includes('@')}
          userName={props.userName}
          point={currentPointValue}
          onClose={() => {
            setIsDisplaySuccessModal(false);
          }}
        />
      )}
      <center>
        <div className={styles.topbanner} onClick={goToPaidyInfo}>
          <Image src={PaidyBannerPic} alt="Paidy Banner" />
        </div>
      </center>
      {props.isFirstBonusCourseExist && (
        <>
          <br />
          <div className={styles.red}>
            <div className={styles.firstrabel}>
              <span className={styles.marker}>
                ＼初回購入限定 　今だけポイント2倍！／
              </span>
            </div>
            <div
              className={`${styles.e} ${styles.animateContainer} ${
                isCourseSelected(650, 480) ? styles.selectedCourse : ''
              }`}
              onClick={() => onClickCourse(650, 480, true)}
            >
              <div className={styles.priceContainer}>
                <div className={styles.banner}>
                  <Image
                    src={badge480Pic}
                    alt="アイコン"
                    width="68"
                    height="68"
                  />
                </div>
                <div className={styles.priceRow0}>
                  <p className={styles.yen0}>￥</p>
                  <p className={styles.number0}>480</p>
                </div>
              </div>
              <div className={styles.textBox}>
                <div className={styles.special}>
                  <p className={styles.specialPrice}>
                    650
                    <span className={styles.pt}>pt</span>
                  </p>
                  <p className={styles.specialnumber}>
                    320<span className={styles.specialnumberPt}>pt</span>
                  </p>
                </div>
              </div>
            </div>
            <div className={styles.hr}></div>
          </div>
        </>
      )}
      {props.isSecondBonusCourseExist && (
        <>
          <br />
          <div className={styles.red}>
            <div className={styles.firstrabel}>
              <span className={styles.marker}>
                ＼2回目購入限定 　今だけ1000pt！／
              </span>
            </div>
            <div
              className={`${styles.e} ${styles.animateContainer} ${
                isCourseSelected(1000, 800) ? styles.selectedCourse : ''
              }`}
              onClick={() => onClickCourse(1000, 800, true)}
            >
              <div className={styles.priceContainer}>
                <div className={styles.banner}>
                  <Image
                    src={badge800Pic}
                    alt="アイコン"
                    width="68"
                    height="68"
                  />
                </div>
                <div className={styles.priceRow0}>
                  <p className={styles.yen0}>￥</p>
                  <p className={styles.number0}>800</p>
                </div>
              </div>
              <div className={styles.textBox}>
                <div className={styles.special}>
                  <p className={styles.specialPrice}>
                    1000
                    <span className={styles.pt}>pt</span>
                  </p>
                  <p className={styles.specialnumber}>
                    550<span className={styles.specialnumberPt}>pt</span>
                  </p>
                </div>
              </div>
            </div>
            <div className={styles.hr}></div>
          </div>
        </>
      )}
      {props.isThirdBonusCourseExist && (
        <>
          <br />
          <div className={styles.red}>
            <div className={styles.firstrabel}>
              <span className={styles.marker}>
                ＼3回目購入限定 　今だけ2500pt！／
              </span>
            </div>
            <div
              className={`${styles.e} ${styles.animateContainer} ${
                isCourseSelected(2500, 2900) ? styles.selectedCourse : ''
              }`}
              onClick={() => onClickCourse(2500, 2900, true)}
            >
              <div className={styles.priceContainer}>
                <div className={styles.priceRow0}>
                  <p className={styles.yen0}>￥</p>
                  <p className={styles.number0}>2,900</p>
                </div>
              </div>
              <div className={styles.textBox}>
                <div className={styles.special}>
                  <p className={styles.specialPrice}>
                    2,500
                    <span className={styles.pt}>pt</span>
                  </p>
                  <p className={styles.specialnumber}>
                    2,000<span className={styles.specialnumberPt}>pt</span>
                  </p>
                </div>
              </div>
            </div>
            <div className={styles.hr}></div>
          </div>
        </>
      )}
      {props.isFourthBonusCourseExist && (
        <>
          <br />
          <div className={styles.red}>
            <div className={styles.firstrabel}>
              <span className={styles.marker}>
                ＼4回目購入限定 　800pt増量！／
              </span>
            </div>
            <div
              className={`${styles.e} ${styles.animateContainer} ${
                isCourseSelected(4400, 4900) ? styles.selectedCourse : ''
              }`}
              onClick={() => onClickCourse(4400, 4900, true)}
            >
              <div className={styles.priceContainer}>
                <div className={styles.priceRow0}>
                  <p className={styles.yen0}>￥</p>
                  <p className={styles.number0}>4,900</p>
                </div>
              </div>
              <div className={styles.textBox}>
                <div className={styles.special}>
                  <p className={styles.specialPrice}>
                    4,400
                    <span className={styles.pt}>pt</span>
                  </p>
                  <p className={styles.specialnumber}>
                    3,600<span className={styles.specialnumberPt}>pt</span>
                  </p>
                </div>
              </div>
            </div>
            <div className={styles.hr}></div>
          </div>
        </>
      )}
      {props.isFifthBonusCourseExist && (
        <>
          <br />
          <div className={styles.red}>
            <div className={styles.firstrabel}>
              <span className={styles.marker}>
                ＼5回目購入限定 　今だけ1000pt！／
              </span>
            </div>
            <div
              className={`${styles.e} ${styles.animateContainer} ${
                isCourseSelected(9000, 10000) ? styles.selectedCourse : ''
              }`}
              onClick={() => onClickCourse(9000, 10000, true)}
            >
              <div className={styles.priceContainer}>
                <div className={styles.priceRow0}>
                  <p className={styles.yen0}>￥</p>
                  <p className={styles.number0}>10,000</p>
                </div>
              </div>
              <div className={styles.textBox}>
                <div className={styles.special}>
                  <p className={styles.specialPrice}>
                    10,000
                    <span className={styles.pt}>pt</span>
                  </p>
                  <p className={styles.specialnumber}>
                    8,000<span className={styles.specialnumberPt}>pt</span>
                  </p>
                </div>
              </div>
            </div>
            <div className={styles.hr}></div>
          </div>
        </>
      )}
      {!(
        props.isSecondBonusCourseExist ||
        props.isThirdBonusCourseExist ||
        props.isFourthBonusCourseExist ||
        props.isFifthBonusCourseExist
      ) && <br />}
      {/* 通常コース */}
      <div
        className={`${styles.a} ${styles.animateContainer} ${
          isCourseSelected(props.isFifthBonusCourseExist ? 9000 : 8000, 10000)
            ? styles.selectedCourse
            : ''
        }`}
        onClick={() =>
          onClickCourse(
            props.isFifthBonusCourseExist ? 9000 : 8000,
            10000,
            false,
          )
        }
      >
        {!props.isSecondBonusCourseExist && (
          <p className={`${styles.ninki} ${styles.animateText}`}>
            一番おトク！
          </p>
        )}

        <div className={styles.priceContainer}>
          <span className={styles.throughLine}>
            <p className={styles.yen00}> ￥</p>
            <p className={styles.through}>12,000</p>
          </span>
          &nbsp;
          <div className={styles.priceRow}>
            <p className={styles.yen}> ￥</p>
            <p className={styles.number}>10,000</p>
          </div>
        </div>
        <div className={styles.textBox}>
          <p className={styles.text}>
            8,000<span className={styles.pt}>pt</span>
          </p>
          <p className={styles.deal}>2,000円おトク！</p>
        </div>
      </div>
      <div
        className={`${styles.b} ${
          isCourseSelected(props.isFourthBonusCourseExist ? 4400 : 3600, 4900)
            ? styles.selectedCourse
            : ''
        }`}
        onClick={() =>
          onClickCourse(
            props.isFourthBonusCourseExist ? 4400 : 3600,
            4900,
            false,
          )
        }
      >
        <div className={styles.priceContainer}>
          <span className={styles.throughLine}>
            <p className={styles.yen00}>￥</p>
            <p className={styles.through}>5,400</p>
          </span>
          &nbsp;
          <div className={styles.priceRow}>
            <p className={styles.yen}>￥</p>
            <p className={styles.number}>4,900</p>
          </div>
        </div>
        <div className={styles.textBox}>
          <p className={styles.text}>
            3,600<span className={styles.pt}>pt</span>
          </p>
          <p className={styles.deal}>500円おトク！</p>
        </div>
      </div>
      <div
        className={`${styles.c} ${styles.animateContainer} ${
          isCourseSelected(props.isThirdBonusCourseExist ? 2500 : 2000, 2900)
            ? styles.selectedCourse
            : ''
        }`}
        onClick={() =>
          onClickCourse(
            props.isThirdBonusCourseExist ? 2500 : 2000,
            2900,
            false,
          )
        }
      >
        {!props.isSecondBonusCourseExist && (
          <p className={`${styles.ninki} ${styles.animateText}`}>人気No.1</p>
        )}

        <div className={styles.priceContainer}>
          <div className={styles.priceRow}>
            <p className={styles.yen0}>￥</p>
            <p className={styles.number0}>2,900</p>
          </div>
        </div>
        <div className={styles.textBox}>
          <p className={styles.text}>
            2,000<span className={styles.pt}>pt</span>
          </p>
        </div>
      </div>
      <div
        className={`${props.isSecondBonusCourseExist ? styles.e : styles.d} ${
          styles.animateContainer
        } ${
          isCourseSelected(props.isSecondBonusCourseExist ? 1000 : 550, 800)
            ? styles.selectedCourse
            : ''
        }`}
        onClick={() =>
          onClickCourse(props.isSecondBonusCourseExist ? 1000 : 550, 800, false)
        }
      >
        <div className={styles.priceRow0}>
          <p className={styles.yen0}>￥</p>
          <p className={styles.number0}>800</p>
        </div>
        <div className={styles.textBox0}>
          550<span className={styles.pt}>pt</span>
        </div>
      </div>
      <div
        className={`${styles.d} ${
          isCourseSelected(320, 480) ? styles.selectedCourse : ''
        }`}
        onClick={() => onClickCourse(320, 480, false)}
      >
        <div className={styles.priceRow0}>
          <p className={styles.yen0}>￥</p>
          <p className={styles.number0}>480</p>
        </div>
        <div className={styles.textBox0}>
          320<span className={styles.pt}>pt</span>
        </div>
      </div>
      <div className={styles.nextButtonContainer}>
        <button
          className={styles.nextButton}
          onClick={handleNextClick}
          disabled={!selectedCourse}
        >
          次へ
        </button>
      </div>
    </>
  );
};

export default PaidyPaymentContent;
