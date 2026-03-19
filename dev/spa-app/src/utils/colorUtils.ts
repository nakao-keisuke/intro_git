export const getTopColorClass = (color?: string): string => {
  switch (color) {
    case '#e9bf2a':
      // しっかりした黄色
      return 'bg-[#fbbf24]';
    case '#f54646':
      // しっかりした赤系ピンク
      return 'bg-[#fb7185]';
    case '#808080':
      // 濃いめのグレー
      return 'bg-[#808080]';
    default:
      // 少し濃いめのグレー
      return 'bg-[#e5e7eb]';
  }
};
