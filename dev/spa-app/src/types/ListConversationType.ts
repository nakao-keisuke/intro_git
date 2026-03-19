export const ConversationPageType = {
  all: 'all',
  conversation: 'conversation',
  bookmark: 'bookmark',
} as const;

export type ListConversationType =
  (typeof ConversationPageType)[keyof typeof ConversationPageType];
