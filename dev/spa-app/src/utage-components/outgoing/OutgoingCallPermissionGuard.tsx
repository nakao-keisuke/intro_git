import { useNavigate } from '@tanstack/react-router';
import { type ReactNode, useEffect, useState } from 'react';
import { useNativeMediaPermission } from '@/hooks/useNativeMediaPermission';

type Props = {
  callType: 'video' | 'voice';
  children: ReactNode;
};

/**
 * 発信通話ページの権限ガードコンポーネント
 * マウント時にカメラ/マイク権限をチェックし、権限がない場合は通話UIをレンダリングせず前画面に戻す
 * 権限拒否時は NativePermissionModal が自動表示される（checkAndRequestPermission 内部で処理）
 */
const OutgoingCallPermissionGuard = ({ callType, children }: Props) => {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const { checkAndRequestPermission } = useNativeMediaPermission();
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const checkPermission = async () => {
      const granted = await checkAndRequestPermission(callType);

      if (!isMounted) return;

      if (granted) {
        setPermissionGranted(true);
      } else {
        // 権限モーダルは checkAndRequestPermission 内で表示済み
        // 前画面に戻す（モーダルはグローバルなので遷移後も表示され続ける）
        const searchParams = new URLSearchParams(window.location.search);
        const fromPath = searchParams.get('from') || '/girls/all';
        router.replace(fromPath);
      }
    };

    checkPermission();

    return () => {
      isMounted = false;
    };
  }, [callType, checkAndRequestPermission, router]);

  if (!permissionGranted) {
    // 権限チェック中は黒画面（通話UIと同じ背景で自然な見た目）
    return <div className="fixed inset-0 bg-black" />;
  }

  return <>{children}</>;
};

export default OutgoingCallPermissionGuard;
