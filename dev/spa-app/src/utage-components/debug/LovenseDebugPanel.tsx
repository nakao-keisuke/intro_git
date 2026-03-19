// Lovenseルーレットのデバッグパネル（開発環境のみ）
// NOTE: この機能は現在無効化されています。Recoil依存を削除し、スタブ実装としています。

import type React from 'react';
import { useState } from 'react';
import styles from '@/styles/debug/LovenseDebugPanel.module.css';

// スタブ型定義（機能無効化のため）
type LovenseState = {
  ticketCount: number;
  isPlayedToday: boolean;
  isCampaignActive: boolean;
  lastPlayedDate: string | null;
  menuItems: { type: string; duration: number; ticket_count?: number }[];
};

const LovenseDebugPanel: React.FC = () => {
  // NOTE: 機能無効化のためローカルstateを使用
  const [lovenseState, setLovenseState] = useState<LovenseState>({
    ticketCount: 0,
    isPlayedToday: false,
    isCampaignActive: false,
    lastPlayedDate: null,
    menuItems: [],
  });
  const [isOpen, setIsOpen] = useState(false);

  // 本番環境では表示しない
  if (import.meta.env.NODE_ENV === 'production') {
    return null;
  }

  const handleTogglePlayedToday = () => {
    const today = new Date().toISOString().split('T')[0] ?? '';
    setLovenseState((prev) => ({
      ...prev,
      isPlayedToday: !prev.isPlayedToday,
      lastPlayedDate: !prev.isPlayedToday ? today : null,
    }));
  };

  const handleResetTickets = () => {
    setLovenseState((prev) => ({
      ...prev,
      ticketCount: 0,
      menuItems: prev.menuItems.map((item) => ({
        ...item,
        ticket_count: 0,
      })),
    }));
  };

  const handleAddTicket = () => {
    setLovenseState((prev) => ({
      ...prev,
      ticketCount: prev.ticketCount + 1,
    }));
  };

  const handleClearLocalStorage = () => {
    localStorage.removeItem('lovenseState');
    window.location.reload();
  };

  return (
    <>
      {/* デバッグパネルトグルボタン */}
      <button
        className={styles.toggleButton}
        onClick={() => setIsOpen(!isOpen)}
        title="Lovenseデバッグパネル"
      >
        🎰
      </button>

      {/* デバッグパネル本体 */}
      {isOpen && (
        <div className={styles.debugPanel}>
          <div className={styles.header}>
            <h3>Lovenseデバッグパネル</h3>
            <button
              className={styles.closeButton}
              onClick={() => setIsOpen(false)}
            >
              ×
            </button>
          </div>

          <div className={styles.content}>
            <div className={styles.section}>
              <h4>⚠️ 機能無効化中</h4>
              <p style={{ color: '#ff6b6b', fontSize: '12px' }}>
                Lovenseルーレット機能は現在無効化されています。
                このパネルはローカルstateのみを操作します。
              </p>
            </div>

            <div className={styles.section}>
              <h4>現在の状態（ローカル）</h4>
              <div className={styles.status}>
                <div>
                  isPlayedToday:
                  <strong>
                    {lovenseState.isPlayedToday ? 'true' : 'false'}
                  </strong>
                </div>
                <div>
                  ticketCount: <strong>{lovenseState.ticketCount}</strong>
                </div>
                <div>
                  isCampaignActive:
                  <strong>
                    {lovenseState.isCampaignActive ? 'true' : 'false'}
                  </strong>
                </div>
                <div>
                  lastPlayedDate:
                  <strong>{lovenseState.lastPlayedDate ?? 'null'}</strong>
                </div>
                <div>
                  menuItems: <strong>{lovenseState.menuItems.length}個</strong>
                </div>
              </div>
            </div>

            <div className={styles.section}>
              <h4>操作</h4>
              <div className={styles.actions}>
                <button
                  onClick={handleTogglePlayedToday}
                  className={styles.actionButton}
                >
                  isPlayedTodayを切り替え
                </button>
                <button
                  onClick={handleResetTickets}
                  className={styles.actionButton}
                >
                  チケットをリセット
                </button>
                <button
                  onClick={handleAddTicket}
                  className={styles.actionButton}
                >
                  チケットを追加
                </button>
                <button
                  onClick={handleClearLocalStorage}
                  className={styles.actionButton}
                  style={{ backgroundColor: '#ff4444' }}
                >
                  LocalStorageをクリア
                </button>
              </div>
            </div>

            <div className={styles.section}>
              <h4>メニューアイテム（チケット保有）</h4>
              <div className={styles.menuItems}>
                {lovenseState.menuItems
                  .filter((item) => item.ticket_count && item.ticket_count > 0)
                  .map((item, index) => (
                    <div key={index} className={styles.menuItem}>
                      {item.type} - {item.duration}秒 (チケット:
                      {item.ticket_count})
                    </div>
                  ))}
                {lovenseState.menuItems.filter(
                  (item) => item.ticket_count && item.ticket_count > 0,
                ).length === 0 && (
                  <div className={styles.noItems}>チケット保有メニューなし</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LovenseDebugPanel;
