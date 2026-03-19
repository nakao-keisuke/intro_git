export function isBonusAvailable(
  number: number,
  profileIndex: ProfileIndex,
): boolean {
  return (number & (1 << profileIndex)) === 0;
}

export const profileIndexOfAbout = 1;
export type ProfileIndexOfAbout = typeof profileIndexOfAbout;
export const profileIndexOfAvatar = 7;
export type ProfileIndexOfAvatar = typeof profileIndexOfAvatar;
export const profileIndexOfAge = 8;
export type ProfileIndexOfAge = typeof profileIndexOfAge;
export const profileIndexOfHobby = 6;
export type ProfileIndexOfHobby = typeof profileIndexOfHobby;
export const profileIndexOfBodytype = 3;
export type ProfileIndexOfBodytype = typeof profileIndexOfBodytype;
export type ProfileIndex =
  | ProfileIndexOfAbout
  | ProfileIndexOfAvatar
  | ProfileIndexOfAge
  | ProfileIndexOfHobby
  | ProfileIndexOfBodytype;
