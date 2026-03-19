import useEmblaCarousel from 'embla-carousel-react';
// Image component removed (use <img> directly);
import { useCallback, useEffect, useState } from 'react';
import { getPcBonusImageSrc } from '@/constants/bonusImages';
import styles from '@/styles/purchase/InCallQuickChargeModal.module.css';
import { InCallSquarePaymentContent } from './inCallSquarePaymentContent';

type PointCourse = {
  point: number;
  money: number;
  beforeMoney?: number;
  color: string;
  plus?: number;
  text: string;
  isBonusExist: boolean;
};

type Props = {
  onClose: () => void;
  onClick: (point: number, money: number) => void;
  addedMessage?: string;
  onAnotherCardClick?: () => void;
  pointCourses: PointCourse[];
  userName: string;
};

const InCallQuickChargeModal = ({
  pointCourses,
  onClose,
  addedMessage,
  userName,
}: Props) => {
  const defaultCourse = pointCourses[2] ?? null;

  const [selectedCourse, setSelectedCourse] = useState<PointCourse | null>(
    defaultCourse,
  );

  const onClickOutside = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: 'center',
    startIndex: 2,
  });

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    const index = emblaApi.selectedScrollSnap();
    const selected = pointCourses[index] ?? null;
    setSelectedCourse(selected);
    emblaApi.slideNodes().forEach((slide, i) => {
      slide.classList.toggle(styles.isActive ?? '', i === index);
    });
  }, [emblaApi, pointCourses]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', onSelect);
    onSelect();
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  // ★ ボーナスコースだけ抽出
  const bonusCourses = pointCourses.filter((course) => course.isBonusExist);

  return (
    <div className={styles.modalBackdrop} onClick={onClickOutside}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.shadow}>
          <div className={styles.title}>
            {addedMessage && (
              <div className={styles.addedMessage}>{addedMessage}</div>
            )}
            ポイント追加
          </div>

          {/* ★ ボーナスコース用バナー*/}
          {bonusCourses.length > 0 && (
            <div className={styles.bonusContainer}>
              {bonusCourses.map((course, index) => {
                const imageSrc = getPcBonusImageSrc(index);

                return (
                  <div
                    key={`bonus-${index}`}
                    className={styles.bonusItem}
                    onClick={() => {
                      setSelectedCourse(course);

                      // 対応するスライド位置にスクロール（存在すれば）
                      const targetIndex = pointCourses.findIndex(
                        (c) =>
                          c.point === course.point && c.money === course.money,
                      );
                      if (targetIndex >= 0) {
                        emblaApi?.scrollTo(targetIndex);
                      }
                    }}
                  >
                    <Image
                      src={imageSrc}
                      alt={course.text ?? 'ボーナスコース'}
                      width={800}
                      height={200}
                      className={styles.bonusImage}
                    />
                  </div>
                );
              })}
            </div>
          )}

          <div className={styles.embla} ref={emblaRef}>
            <div className={styles.embla__container}>
              {pointCourses.map((course, index) => (
                <div
                  key={index}
                  className={`${styles.embla__slide} ${index === 2 ? styles.isActive : ''}`}
                >
                  <div
                    className={styles.purchase}
                    style={
                      {
                        border: `2px solid ${course.color}`,
                        '--before-bg-color': course.color,
                        '--before-content': `"${course.text ?? ''}"`,
                      } as React.CSSProperties
                    }
                    onClick={() => setSelectedCourse(course)}
                  >
                    <div className={styles.totalpoint}>
                      {course.point}
                      <span className={styles.pt}>pt</span>
                    </div>
                    {course.isBonusExist && (
                      <div className={styles.point}>
                        <s>{course.point}</s>
                        <span className={styles.spt}>pt</span>
                      </div>
                    )}
                    {course.plus && (
                      <div className={styles.bonus}>
                        <span className={styles.plus}>{course.plus}</span>
                        円
                        <br />
                        お得！
                      </div>
                    )}
                    <div className={styles.price}>
                      <span className={styles.yen}>￥</span>
                      {course.money}
                    </div>
                    {course.beforeMoney && (
                      <div className={styles.beforePrice}>
                        <s>
                          <span className={styles.beforeYen}>￥</span>
                          {course.beforeMoney}
                        </s>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ zIndex: '1000000000000' }}>
            <InCallSquarePaymentContent
              amount={selectedCourse?.money ?? 0}
              point={selectedCourse?.point ?? 0}
              email={''}
              userName={userName}
              isCall={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InCallQuickChargeModal;
