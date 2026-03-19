import { useRequest } from '@/hooks/useRequest';
import styles from '@/styles/profile/MovieImageRequestModal.module.css';
import { trackEvent } from '@/utils/eventTracker';

type Props = {
  onClose: () => void;
  partnerId: string;
  userName: string;
};

const MovieImageRequestModal = ({ userName, partnerId, onClose }: Props) => {
  const { requestVideo, requestImage } = useRequest();

  const showModalClose = (
    e:
      | React.MouseEvent<HTMLDivElement, MouseEvent>
      | React.MouseEvent<HTMLAnchorElement, MouseEvent>,
  ) => {
    e.stopPropagation();
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const canSendRequest = () => {
    const lastRequestTime = localStorage.getItem('lastRequestTime');
    const lastRequestUserId = localStorage.getItem('lastRequestUserId');
    if (lastRequestTime && lastRequestUserId === partnerId) {
      const now = Date.now();
      const diff = now - parseInt(lastRequestTime, 10);
      if (diff < 5 * 60 * 1000) {
        // 5分以内
        alert('同じ人に連続で動画・画像リクエストはできません。');
        return false;
      }
    }
    return true;
  };

  const sendMovieRequest = async () => {
    if (!canSendRequest()) return;
    const result = await requestVideo(partnerId);
    if (result.success) {
      alert('動画リクエストを送信しました');
      trackEvent('COMPLETE_SEND_VIDEO_FILE_REQUEST');
      localStorage.setItem('lastRequestTime', Date.now().toString());
      localStorage.setItem('lastRequestUserId', partnerId);
      onClose();
    } else {
      console.error('video request:', result.error);
    }
  };

  const sendImageRequest = async () => {
    if (!canSendRequest()) return;
    const result = await requestImage(partnerId);
    if (result.success) {
      alert('画像リクエストを送信しました');
      trackEvent('COMPLETE_SEND_IMAGE_FILE_REQUEST');
      localStorage.setItem('lastRequestTime', Date.now().toString());
      localStorage.setItem('lastRequestUserId', partnerId);
      onClose();
    } else {
      console.error('image request:', result.error);
    }
  };

  return (
    <div>
      <div
        className={styles.overlay}
        onClick={(e: React.MouseEvent<HTMLDivElement>) => showModalClose(e)}
      >
        <div className={styles.modal}>
          <div className={styles.container}>
            <div className={styles.label}>動画・画像リクエストを送信します</div>
            <div>
              <div className={styles.request} onClick={sendMovieRequest}>
                <div>
                  <div className={styles.mo}>
                    動画リクエスト(無料)
                    <br />
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className={styles.request} onClick={sendImageRequest}>
                <div>
                  <div className={styles.momo}>画像リクエスト(無料)</div>
                </div>
              </div>
            </div>
          </div>
          <a onClick={showModalClose} className={styles.close}>
            キャンセル
          </a>
        </div>
      </div>
    </div>
  );
};
export default MovieImageRequestModal;
