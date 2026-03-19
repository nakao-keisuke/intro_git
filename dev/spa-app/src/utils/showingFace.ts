const showingFaceList = ['未設定', '顔出ししない', '顔出しOK'] as const;

export type ShowingFace = (typeof showingFaceList)[number];

export const showingFace = (value: number): ShowingFace => {
  return showingFaceList[value + 1] ?? '未設定';
};

export const showingFaceNumber = (face: ShowingFace): number => {
  const index = showingFaceList.indexOf(face);
  return index > 0 ? index - 1 : 0;
};
