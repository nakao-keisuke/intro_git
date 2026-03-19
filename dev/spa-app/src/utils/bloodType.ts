export const bloodTypeList = ['未設定', 'A型', 'B型', 'O型', 'AB型'] as const;

export type BloodType = (typeof bloodTypeList)[number];
