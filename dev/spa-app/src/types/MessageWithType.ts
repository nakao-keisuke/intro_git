export type MessageWithType = {
  text: string;
  type: 'normal' | 'secret' | 'divider';
  sender_id?: string;
  sender_name?: string;
};
