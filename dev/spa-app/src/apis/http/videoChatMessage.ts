// Request型（snake_case）
export type GetVideoChatMessagesRequest = {
  female_id: string; // 配信者のユーザーID
};

// Jambo APIのレスポンス型（serverHttpClientによりcamelCaseに変換済み）
export type JamboVideoChatMessagesResponse = {
  code: number;
  data?: {
    roomId: string;
    femaleId: string;
    messages: {
      message: string;
      userName: string;
      timeStamp: string; // ISO 8601形式
    }[];
  };
};

// Response型（CamelCase）
export type VideoChatMessage = {
  userName: string;
  message: string;
  timestamp: number; // Unix timestamp (ms)
};

export type GetVideoChatMessagesResponse = VideoChatMessage[];

// Route Handlerのレスポンス型
export type GetVideoChatMessagesApiResponse = {
  data: VideoChatMessage[];
};
