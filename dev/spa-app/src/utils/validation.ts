// Email and phone validation utilities

export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const isEmail = (value: string): boolean => {
  return EMAIL_REGEX.test(value);
};
export const PHONE_REGEX = /^[0-9]{11}$/;
