// Image component removed (use <img> directly);
import Modal from 'react-modal';
import { useUIStore } from '@/stores/uiStore';

const AppPic = '/pwa.webp';
const iOSHomeButtonPic = '/home_app/home_app_i.0.webp';
const androidPic = '/home_app/home_app_a.0.webp';
const mailPic = '/mailnotification.webp';
const smarthonePic = '/smarthone.webp';

export const PWAModal = () => {
  const isInstallModalOpen = useUIStore((s) => s.isInstallModalShown);
  const setIsInstallModalOpen = useUIStore((s) => s.setIsInstallModalShown);

  if (typeof window === 'undefined') return null;

  const userAgent = window.navigator.userAgent;
  const isiOS = /iPhone|iPad|iPod/i.test(userAgent);
  const _isSafari = /safari/i.test(userAgent) && !/crios/i.test(userAgent);

  return (
    <Modal
      isOpen={isInstallModalOpen}
      onRequestClose={() => {
        setIsInstallModalOpen(false);
      }}
      ariaHideApp={false}
      style={{
        overlay: {
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(83, 83, 83, 0.583)',
          zIndex: 100000,
        },
        content: {
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '350px',
          height: '520px',
          padding: '0',
        },
      }}
    >
      <div onClick={() => setIsInstallModalOpen(false)}>
        <Image
          src={AppPic}
          width={300}
          height={230}
          style={{
            width: '100%',
          }}
          alt="アプリアイコン"
        />

        <div
          style={{
            padding: '10px',
          }}
        >
          <div>Utageをインストールして、 ポイントをゲットしよう！</div>
          <ul
            style={{
              color: '#0bade3',
              background:
                'linear-gradient(to left, #fc99a042 0%, #44c1eb41 100%)',
              borderRadius: '10px',
              margin: '10px 15px 0 15px',
              padding: '10px 20px',
              textAlign: 'left',
              lineHeight: '2',
              listStyle: 'none',
            }}
          >
            <li
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'left',
                gap: '10px',
              }}
            >
              <Image
                src={mailPic}
                alt="メッセージ送信"
                priority={true}
                width="23"
                height="23"
              />
              新しいメッセージ
            </li>
            <li
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'left',
                gap: '10px',
              }}
            >
              <Image
                src={smarthonePic}
                alt="メッセージ送信"
                priority={true}
                width="23"
                height="23"
              />
              快適な操作性
            </li>
          </ul>
          {isiOS && (
            <ul
              style={{
                padding: '10px',
              }}
            >
              <li>
                <span>
                  <b>1.</b>
                  <Image
                    src={iOSHomeButtonPic}
                    alt="メッセージ送信"
                    priority={true}
                    width="30"
                    height="30"
                    style={{
                      marginRight: '5px',
                      marginLeft: '5px',
                      verticalAlign: 'middle',
                    }}
                  />
                </span>
                をタップしてください
              </li>
              <li
                style={{
                  marginTop: '10px',
                }}
              >
                <b>2.「ホーム画面に追加」</b>をタップしてください
              </li>
            </ul>
          )}
          {!isiOS && (
            <ul
              style={{
                padding: '10px',
              }}
            >
              <li>
                <span>
                  <b>1.</b>画面右上
                  <Image
                    src={androidPic}
                    alt="メッセージ送信"
                    priority={true}
                    width="30"
                    height="30"
                    style={{
                      marginRight: '5px',
                      marginLeft: '5px',
                      verticalAlign: 'middle',
                    }}
                  />
                </span>
                をタップしてください
              </li>
              <br />
              <li>
                <b>2.</b>「アプリをインストール」をタップしてください
              </li>
            </ul>
          )}
        </div>
      </div>
    </Modal>
  );
};
