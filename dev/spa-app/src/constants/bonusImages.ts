export const PC_BONUS_IMAGES = [
  '1stbonuscourse_pc.webp',
  '2ndbonuscourse_pc.webp',
  '3rdbonuscourse_pc.webp',
  '4thbonuscourse_pc.webp',
  '5thbonuscourse_pc.webp',
] as const;

export const getPcBonusImageSrc = (index: number): string => {
  const fallback = PC_BONUS_IMAGES[0];
  const filename = PC_BONUS_IMAGES[index] ?? fallback;
  return `/purchase/${filename}`;
};
