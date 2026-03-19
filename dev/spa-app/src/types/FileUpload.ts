export interface FileUploadResponse {
  imageId?: string;
  fileId?: string;
  duration?: string;
  type?: 'success' | 'error';
  message?: string;
}

export interface FileUploadRequest {
  file: File;
  partnerId: string;
}

// For message file upload flow (used by useMessageFileUpload)
export enum FileType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
}

export interface FileInfo {
  fileId: string;
  fileType: FileType;
  duration?: number;
}
