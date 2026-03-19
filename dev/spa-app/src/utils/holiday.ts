export const holidayList = ['未設定', '土日祝', '平日', '不定期'] as const;

export type Holiday = (typeof holidayList)[number];
