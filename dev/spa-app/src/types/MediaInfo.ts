export type MediaInfo =
  | { type: 'image'; thumbnailId: string }
  | { type: 'movie'; thumbnailId: string; movieId: string };
