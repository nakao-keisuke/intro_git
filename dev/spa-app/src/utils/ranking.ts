const firstRankPic = '/situation.icon/1st.webp';
const secondRankPic = '/situation.icon/2nd.webp';
const thirdRankPic = '/situation.icon/3rd.webp';
const forthRankPic = '/ranking/4.webp';
const fifthRankPic = '/ranking/5.webp';
const sixthRankPic = '/ranking/6.webp';
const sevnethRankPic = '/ranking/7.webp';
const eighthRankPic = '/ranking/8.webp';
const ninthRankPic = '/ranking/9.webp';
const tenthRankPic = '/ranking/10.webp';
const eleventhRankPic = '/ranking/11.webp';
const twelfthRankPic = '/ranking/12.webp';
const thirteenthRankPic = '/ranking/13.webp';
const forteenthRankPic = '/ranking/14.webp';

/**
 * ランキング順位毎の画像を取得する
 * @param rank ランキング順位
 * @returns ランキング順位毎の画像
 */
export const getRankImage = (rank: number | undefined) => {
  switch (rank) {
    case 1:
      return { src: firstRankPic, alt: '1位' };
    case 2:
      return { src: secondRankPic, alt: '2位' };
    case 3:
      return { src: thirdRankPic, alt: '3位' };
    case 4:
      return { src: forthRankPic, alt: '4位' };
    case 5:
      return { src: fifthRankPic, alt: '5位' };
    case 6:
      return { src: sixthRankPic, alt: '6位' };
    case 7:
      return { src: sevnethRankPic, alt: '7位' };
    case 8:
      return { src: eighthRankPic, alt: '8位' };
    case 9:
      return { src: ninthRankPic, alt: '9位' };
    case 10:
      return { src: tenthRankPic, alt: '10位' };
    case 11:
      return { src: eleventhRankPic, alt: '11位' };
    case 12:
      return { src: twelfthRankPic, alt: '12位' };
    case 13:
      return { src: thirteenthRankPic, alt: '13位' };
    case 14:
      return { src: forteenthRankPic, alt: '14位' };
    default:
      return undefined;
  }
};
