export const isValid = (userId: string) => {
  return /^[0-9a-fA-F]{24}$/.test(userId);
};
