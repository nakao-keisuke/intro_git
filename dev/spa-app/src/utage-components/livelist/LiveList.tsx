import { useState } from 'react';
import styles from '@/styles/livelist/LiveList.module.css';
import type { ChannelInfo } from '@/types/ChannelInfo';
import type { LiveChannel } from '@/types/LiveChannel';
import type { LiveCallType, LiveCallView } from '@/utils/callView';
import { LiveListItem } from './LiveListItem';

type Props = {
  list: (LiveChannel & {
    liveCallView: LiveCallView;
    channelInfo: ChannelInfo;
  })[];
};
const _defaultLabel = (type: LiveCallType) => {
  switch (type) {
    case 'live':
      return styles.live_label;
    case 'videoCallFromStandby':
      return styles.video_call_label;
    case 'sideWatch':
      return styles.live_label;
    default:
      return styles.live_label;
  }
};

export const LiveList = ({ list }: Props) => {
  const [displayTexts] = useState<string[]>(() => {
    if (list) {
      return list.map(({ liveCallView }) => liveCallView.statusText || '');
    }
    return [];
  });

  if (!list.length) {
    return (
      <ul className={styles.container}>
        <li className={styles.none}>現在配信中のユーザーはいません。</li>
      </ul>
    );
  }

  const items = list.map(
    ({ broadcaster, liveCallView, channelInfo }, index) => (
      <LiveListItem
        key={broadcaster.userId}
        broadcaster={broadcaster}
        liveCallView={liveCallView}
        channelInfo={channelInfo}
        displayText={displayTexts[index] || ''}
        index={index}
      />
    ),
  );

  return <ul className={styles.container}>{items}</ul>;
};
