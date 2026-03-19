/**
 * Repro Web SDK の型定義
 * window.reproio() を使用する際のTypeScriptエラーを回避するため
 */
declare global {
  interface Window {
    reproio: (command: string, ...args: any[]) => void;
  }
}

export {};
