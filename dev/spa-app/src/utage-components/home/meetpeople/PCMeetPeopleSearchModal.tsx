import router from 'next/router';
import { memo, type ReactNode, useEffect, useState } from 'react';
import Picker from '@/components/signup/Picker';
import styles from '@/styles/home/meetpeople/PCMeetPeopleSearchModal.module.css';
import { trackEvent } from '@/utils/eventTracker';
import { displayRegionArray } from '@/utils/region';

const _LovensePic = '/lovense_pink.webp';
const _NewUserPic = '/beginner.icon.webp';

import { bodyTypeList } from '@/utils/bodyType';
import { marriageStatusList } from '@/utils/marriageHistory';

type Props = {
  onClose: () => void;
  children?: ReactNode;
};

const PCMeetPeopleSearchModal: React.FC<Props> = memo(({ onClose }) => {
  const handleClickOutside = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const [isNewUser, setIsNewUser] = useState(() => {
    const saved = localStorage.getItem('searchConditions');
    if (saved) {
      const conditions = JSON.parse(saved);
      return conditions.isNewUser || '0';
    }
  });
  const [hasLovense, setHasLovense] = useState(() => {
    const saved = localStorage.getItem('searchConditions');
    if (saved) {
      const conditions = JSON.parse(saved);
      return conditions.hasLovense || '0';
    }
    return '0';
  });

  const [age, setAge] = useState(() => {
    const saved = localStorage.getItem('searchConditions');
    if (saved) {
      const conditions = JSON.parse(saved);
      return conditions.age || '';
    }
    return '';
  });
  const [region, setRegion] = useState(() => {
    const saved = localStorage.getItem('searchConditions');
    if (saved) {
      const conditions = JSON.parse(saved);
      return conditions.region || '';
    }
    return '';
  });

  const [isRegionModalOpen, setRegionModalOpen] = useState(false);
  const [voice, setVoice] = useState(() => {
    const saved = localStorage.getItem('searchConditions');
    if (saved) {
      const conditions = JSON.parse(saved);
      return conditions.voice || '';
    }
    return '';
  });
  const [video, setVideo] = useState(() => {
    const saved = localStorage.getItem('searchConditions');
    if (saved) {
      const conditions = JSON.parse(saved);
      return conditions.video || '';
    }
    return '';
  });
  const [face, setFace] = useState(() => {
    const saved = localStorage.getItem('searchConditions');
    if (saved) {
      const conditions = JSON.parse(saved);
      return conditions.face || '';
    }
    return '';
  });
  const [bodytype, setBodytype] = useState(() => {
    const saved = localStorage.getItem('searchConditions');
    if (saved) {
      const conditions = JSON.parse(saved);
      return conditions.bodytype || '';
    }
    return '';
  });
  const [isBodytypeModalOpen, setBodytypeModalOpen] = useState(false);
  const [marriageHistory, setMarriageHistory] = useState(() => {
    const saved = localStorage.getItem('searchConditions');
    if (saved) {
      const conditions = JSON.parse(saved);
      return conditions.marriageHistory || '';
    }
    return '';
  });
  const [name, setName] = useState('');
  const [isMarriageHistoryModalOpen, setMarriageHistoryModalOpen] =
    useState(false);

  useEffect(() => {
    const searchConditions = {
      hasLovense,
      age,
      region,
      voice,
      video,
      face,
      bodytype,
      marriageHistory,
      isNewUser,
    };
    localStorage.setItem('searchConditions', JSON.stringify(searchConditions));
  }, [
    hasLovense,
    age,
    region,
    voice,
    video,
    face,
    bodytype,
    marriageHistory,
    isNewUser,
  ]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (age) params.append('age', age);
    if (region) params.append('region', region);
    if (isNewUser === '1') {
      params.append('newUser', 'true');
    }
    if (hasLovense === '1') {
      params.append('has_lovense', 'true');
    }
    if (voice) {
      params.append('voice', voice === '1' ? 'true' : 'false');
    }
    if (video) {
      params.append('video', video === '1' ? 'true' : 'false');
    }
    if (face) {
      params.append('face', face);
    }
    if (bodytype) params.append('bodyType', bodytype);
    if (marriageHistory) params.append('marriageHistory', marriageHistory);
    if (name) params.append('name', name);
    trackEvent('COMPLETE_SEARCH_USER');
    router.push(`/search/pc/?${params.toString()}`);
    onClose();
  };

  const handleAgeSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setAge(event.target.value);
  };
  const handleRegionSelect = (selectedRegion: string) => {
    setRegion(selectedRegion);
    setRegionModalOpen(false);
  };
  const handleVoiceSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setVoice(event.target.value);
  };
  const handleVideoSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setVideo(event.target.value);
  };
  const handleFaceSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setFace(event.target.value);
  };
  const handleBodytypeSelect = (selectedBodytype: string) => {
    setBodytype(selectedBodytype);
    setBodytypeModalOpen(false);
  };
  const handleMarriageHistorySelect = (selectedMarriageHistory: string) => {
    setMarriageHistory(selectedMarriageHistory);
    setMarriageHistoryModalOpen(false);
  };
  const _handleNewUserChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsNewUser(event.target.checked ? '1' : '0');
  };

  const _handleLovenseChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setHasLovense(event.target.checked ? '1' : '0');
  };

  const handleReset = () => {
    setIsNewUser('0');
    setHasLovense('0');
    setAge('');
    setRegion('');
    setVoice('');
    setVideo('');
    setFace('');
    setBodytype('');
    setMarriageHistory('');
    setName('');
  };

  return (
    <div>
      <div className={styles.modalBackdrop} onClick={handleClickOutside}>
        <div
          className={styles.modalContent}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.close} onClick={onClose}>
            ×
          </div>
          <center>
            <p className={styles.title}>絞り込み検索</p>
          </center>

          <center>
            <ul className={styles.ul}>
              {/* <li className={styles.list}>
                <div className={styles.checkbox}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    Lovenseユーザーで絞り込み
                    <Image
                      src={LovensePic}
                      alt="Lovense"
                      placeholder="empty"
                      width={20}
                      height={20}
                    />
                  </div>
                  <input
                    type="checkbox"
                    checked={hasLovense === '1'}
                    onChange={handleLovenseChange}
                    className={styles.toggleSwitch}
                  ></input>
                </div>
              </li> */}
              <li className={styles.list}>
                年齢
                <select
                  name="age"
                  id="age-select"
                  value={age}
                  className={styles.input}
                  onChange={handleAgeSelect}
                >
                  <option value="0">未設定</option>
                  <option value="1">20歳以下</option>
                  <option value="2">21歳~25歳</option>
                  <option value="3">26歳~30歳</option>
                  <option value="4">31歳~35歳</option>
                  <option value="5">36歳~40歳</option>
                  <option value="6">41歳~45歳</option>
                  <option value="7">46歳以上</option>
                </select>
              </li>
              <li className={styles.list}>
                地域
                <input
                  readOnly
                  className={styles.input}
                  onClick={() => setRegionModalOpen(true)}
                  value={region === '' ? 'すべて' : region}
                />
              </li>

              <li className={styles.list}>
                音声通話許可
                <select
                  name="voice"
                  id="voice-select"
                  value={voice}
                  className={styles.input}
                  onChange={handleVoiceSelect}
                >
                  <option value="0">未設定</option>
                  <option value="1">音声通話許可ON</option>
                </select>
              </li>

              <li className={styles.list}>
                ビデオ通話許可
                <select
                  name="video"
                  id="video-select"
                  value={video}
                  className={styles.input}
                  onChange={handleVideoSelect}
                >
                  <option value="0">未設定</option>
                  <option value="1">ビデオ通話許可ON</option>
                </select>
              </li>
              <li className={styles.list}>
                顔出し
                <select
                  name="face"
                  id="face-select"
                  value={face}
                  className={styles.input}
                  onChange={handleFaceSelect}
                >
                  <option value="0">未設定</option>
                  <option value="1">顔出ししない</option>
                  <option value="2">顔出しOK</option>
                </select>
              </li>
              <li className={styles.list}>
                スタイル
                <input
                  readOnly
                  className={styles.input}
                  onClick={() => setBodytypeModalOpen(true)}
                  value={bodytype === '' ? 'すべて' : bodytype}
                />
              </li>

              <li className={styles.list}>
                人妻
                <input
                  readOnly
                  className={styles.input}
                  onClick={() => setMarriageHistoryModalOpen(true)}
                  value={marriageHistory === '' ? 'すべて' : marriageHistory}
                />
              </li>

              <li className={styles.list}>
                ニックネーム検索
                <input
                  className={styles.input}
                  type="text"
                  placeholder="ニックネームを入力"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </li>
            </ul>
            <button className={styles.reset} onClick={handleReset}>
              クリア
            </button>
            <button className={styles.ok} onClick={handleSearch}>
              検索
            </button>
          </center>
        </div>
      </div>
      {isRegionModalOpen && (
        <>
          <div
            className={styles.modalOverlay}
            onClick={() => setRegionModalOpen(false)}
          />
          <div
            className={styles.regionmodal}
            onClick={(e) => e.stopPropagation()} // Stop propagation here
          >
            <Picker
              options={['すべて', ...displayRegionArray]}
              onSelect={(selected) => {
                if (selected === 'すべて') {
                  setRegion('');
                } else {
                  handleRegionSelect(selected);
                }
              }}
              onCancel={() => setRegionModalOpen(false)}
            />
          </div>
        </>
      )}
      {isBodytypeModalOpen && (
        <>
          <div
            className={styles.modalOverlay}
            onClick={() => setBodytypeModalOpen(false)}
          />
          <div
            className={styles.regionmodal}
            onClick={(e) => e.stopPropagation()}
          >
            <Picker
              options={['すべて', ...bodyTypeList]}
              onSelect={(selected) => {
                if (selected === 'すべて') {
                  setBodytype('');
                } else {
                  handleBodytypeSelect(selected);
                }
              }}
              onCancel={() => setBodytypeModalOpen(false)}
            />
          </div>
        </>
      )}
      {isMarriageHistoryModalOpen && (
        <>
          <div
            className={styles.modalOverlay}
            onClick={() => setMarriageHistoryModalOpen(false)}
          />
          <div
            className={styles.regionmodal}
            onClick={(e) => e.stopPropagation()}
          >
            <Picker
              options={['すべて', ...marriageStatusList]}
              onSelect={(selected) => {
                if (selected === 'すべて') {
                  setMarriageHistory('');
                } else {
                  handleMarriageHistorySelect(selected);
                }
              }}
              onCancel={() => setMarriageHistoryModalOpen(false)}
            />
          </div>
        </>
      )}
    </div>
  );
});

PCMeetPeopleSearchModal.displayName = 'ExplainModal';

export default PCMeetPeopleSearchModal;
