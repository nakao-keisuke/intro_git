import { useEffect } from 'react';
import { ASP_PARAM_NAMES } from '@/constants/aspConfig';

/**
 * Cookie文字列を解析してオブジェクトに変換する共通関数
 */
const parseCookies = (cookieString: string): Record<string, string> => {
  return cookieString
    .split(';')
    .map((cookie: string) => {
      const parts = cookie.trim().split('=');
      return { key: parts[0]?.trim(), value: parts[1] || '' };
    })
    .filter(({ key }) => key)
    .reduce(
      (acc: Record<string, string>, { key, value }) => {
        if (key) {
          try {
            acc[key] = decodeURIComponent(value);
          } catch (_e) {
            // 無効なエンコーディングの場合は元の値をそのまま使用
            acc[key] = value;
          }
        }
        return acc;
      },
      {} as Record<string, string>,
    );
};

interface CmCodeHandlerProps {
  pageName?: string;
}

/**
 * URLパラメータからUTMパラメータ（utm_source + utm_campaign）を取得してcm_codeを生成し、
 * ASPパラメータとともにCookieに保存するコンポーネント
 *
 * @param pageName - ページ識別子。UTMパラメータがない場合、Organic(${pageName})として保存される
 */
export const CmCodeHandler = ({ pageName }: CmCodeHandlerProps = {}) => {
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);

    // 既にcm_codeがCookieに存在するかチェック
    const cookies = parseCookies(document.cookie);
    if (cookies.cm_code) {
      // 既にcm_codeがある場合は上書きしない（最初の流入元を保持）
      return;
    }

    // UTMパラメータからcm_codeを生成
    const utmSource = urlParams.get('utm_source');
    const utmCampaign = urlParams.get('utm_campaign');
    const utmAdgroup = urlParams.get('utm_content'); // adgroup
    const utmKeyword = urlParams.get('utm_term'); // keyword

    let cmCode: string | null = null;

    if (utmSource && utmCampaign) {
      // UTMパラメータがある場合は優先（campaign は必須、adgroup/keyword は任意）
      const parts: string[] = [`campaign=${utmCampaign}`];
      if (utmAdgroup) parts.push(`adgroup=${utmAdgroup}`);
      if (utmKeyword) parts.push(`keyword=${utmKeyword}`);
      cmCode = `${utmSource}(${parts.join(', ')})`;
    } else if (pageName) {
      // UTMパラメータがなく、pageNameが指定されている場合
      cmCode = `Organic(${pageName})`;
    }

    if (cmCode) {
      // cm_codeをCookieに保存（30日間有効）
      const expires = new Date();
      expires.setDate(expires.getDate() + 30);
      document.cookie = `cm_code=${encodeURIComponent(cmCode)}; expires=${expires.toUTCString()}; path=/; secure; samesite=strict`;
    }

    // ASP成果計上用パラメータを動的に保存
    ASP_PARAM_NAMES.forEach((paramName) => {
      const paramValue = urlParams.get(paramName);
      if (paramValue) {
        const expires = new Date();
        expires.setDate(expires.getDate() + 30);
        document.cookie = `${paramName}=${encodeURIComponent(paramValue)}; expires=${expires.toUTCString()}; path=/; secure; samesite=strict`;
      }
    });

    // utm_campaignをCookieに保存（ASP設定のutmCriteriaマッチングに使用）
    if (utmCampaign) {
      const expires = new Date();
      expires.setDate(expires.getDate() + 30);
      document.cookie = `utm_campaign=${encodeURIComponent(utmCampaign)}; expires=${expires.toUTCString()}; path=/; secure; samesite=strict`;
    }
  }, []); // マウント時のみ実行（pageNameは各ページで固定値として使用されるため依存配列に含めない）

  return null; // 表示要素なし
};
