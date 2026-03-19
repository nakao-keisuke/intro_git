import type { Session } from 'next-auth';
import { useRef, useState } from 'react';
import { postToStfServer } from '@/libs/axios';
import type { FileInfo } from '@/types/upload';
import { uploadImage as uploadImageUtil } from '@/utils/image';
import { uploadVideo as uploadVideoUtil } from '@/utils/video';

interface UseUploadFileOptions {
  session?: Session | null;
  setIsPicModalOpen?: (isPicModalOpen: boolean) => void;
  setIsUpdating?: (isUpdating: boolean) => void;
}

export const useUploadFile = (options: UseUploadFileOptions = {}) => {
  const { session, setIsPicModalOpen, setIsUpdating } = options;
  const [_upImg, setUpImg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [_isUploadSuccess, setIsUploadSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const uploadImage = async () => {
    setIsPicModalOpen?.(false);
    setIsUpdating?.(true);
    const file = fileInputRef.current?.files?.[0];
    if (!file || !session) {
      onCancel();
      setIsUpdating?.(false);
      return;
    }

    const response = await postToStfServer(
      `/api=upl_img_for_utage_web&img_cat=0&user_id=${session.user.id}`,
      file,
    );

    setIsUpdating?.(false);
    onCancel();
    setIsUploadSuccess(true);

    if (
      response &&
      response.code === 0 &&
      response.data &&
      response.data.image_id
    ) {
      return response.data.image_id;
    } else {
      return null; // アップロードに失敗した場合はnullを返す
    }
  };

  const onCancel = () => {
    setUpImg(null);
    setIsPicModalOpen?.(false);
    setIsUploadSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.type = '';
      fileInputRef.current.type = 'file';
    }
  };
  const _onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsPicModalOpen?.(true);
      const reader = new FileReader();
      reader.addEventListener('load', () => setUpImg(reader.result as string));
      reader.readAsDataURL(e.target.files[0]!);
    }
  };

  const onFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const uploadVideo = async (file: File): Promise<FileInfo | null> => {
    // 拡張子チェック
    const allowedExtensions = ['mp4', 'mov'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      setError(
        `サポートされていない拡張子です: .${fileExtension} (対応形式: mp4, mov)`,
      );
      return null;
    }

    // ファイルサイズチェック（50MB）
    if (file.size > 50 * 1024 * 1024) {
      setError('50MB以上のファイルはアップロードできません');
      return null;
    }

    setIsUploading(true);
    setError(null);

    try {
      const result = await uploadVideoUtil(file);
      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'ファイルのアップロードに失敗しました';
      setError(errorMessage);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const uploadImageFile = async (
    file: File,
    imageCategory: number = 0,
  ): Promise<FileInfo | null> => {
    // 拡張子チェック
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      setError(
        `サポートされていない拡張子です: .${fileExtension} (対応形式: jpg, jpeg, png, gif, webp)`,
      );
      return null;
    }

    // ファイルサイズチェック（15MB）
    if (file.size > 15 * 1024 * 1024) {
      setError('15MB以上のファイルはアップロードできません');
      return null;
    }

    setIsUploading(true);
    setError(null);

    try {
      const result = await uploadImageUtil(file, imageCategory);
      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'ファイルのアップロードに失敗しました';
      setError(errorMessage);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    fileInputRef,
    uploadImage,
    uploadVideo,
    uploadImageFile,
    onFileButtonClick,
    error,
    isUploading,
  };
};
