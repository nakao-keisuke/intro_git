import type { Session } from 'next-auth';
import { useRef, useState } from 'react';
import type { Crop } from 'react-image-crop';
import { IMAGE_CATEGORIES } from '@/constants/image';

/** 画像アップロードAPIのレスポンス型 */
type UploadImageResponse = {
  error?: string;
  details?: string;
  img_id?: string;
};

export const useEditProfileImageUpload = (
  session: Session | null,
  setIsPicModalOpen: (isPicModalOpen: boolean) => void,
  setIsUpdating: (isUpdating: boolean) => void,
) => {
  const [upImg, setUpImg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [isUploadSuccess, setIsUploadSuccess] = useState(false);
  const [crop, setCrop] = useState<Crop>({
    x: 0,
    y: 0,
    width: 200,
    height: 200,
    unit: 'px',
  });

  const uploadImage = async () => {
    setIsPicModalOpen(false);
    setIsUpdating(true);
    if (!crop || !imgRef.current || !session) {
      onCancel();
      setIsUpdating(false);
      return;
    }
    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width || 0;
    canvas.height = crop.height || 0;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(
        image,
        crop.x! * scaleX,
        crop.y! * scaleY,
        crop.width! * scaleX,
        crop.height! * scaleY,
        0,
        0,
        crop.width || 0,
        crop.height || 0,
      );
    }

    const blob = await new Promise<Blob | null>((resolve, reject) =>
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Canvas is empty'));
          return;
        }
        resolve(blob);
      }, 'image/jpeg'),
    );
    if (!blob) {
      onCancel();
      setIsUpdating(false);
      return;
    }

    try {
      // FormDataを作成してBlobを送信
      const formData = new FormData();
      formData.append('data', blob, 'profile.jpg');
      formData.append('imgCat', IMAGE_CATEGORIES.PROFILE);

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      const result: UploadImageResponse = await response.json();

      if (!response.ok || result.error) {
        const errorDetail = result.error || '不明なエラー';
        throw new Error(`画像のアップロードに失敗しました: ${errorDetail}`);
      }

      setIsUpdating(false);
      onCancel();
      setIsUploadSuccess(true);
    } catch (error) {
      console.error('Upload error:', error);
      setIsUpdating(false);
      onCancel();
      alert(
        '画像のアップロードに失敗しました。\n画像のサイズが大きすぎるか、不正なファイル形式です。',
      );
    }
  };

  const onCancel = () => {
    setCrop({
      x: 0,
      y: 0,
      width: 200,
      height: 200,
      unit: 'px',
    });
    imgRef.current = null;
    setUpImg(null);
    setIsPicModalOpen(false);
    setIsUploadSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.type = '';
      fileInputRef.current.type = 'file';
    }
  };
  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsPicModalOpen(true);
      const reader = new FileReader();
      reader.addEventListener('load', () => setUpImg(reader.result as string));
      reader.readAsDataURL(e.target.files[0]!);
    }
  };

  const onCropChange = (crop: Crop) => {
    setCrop(crop);
  };

  const onFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  return {
    upImg,
    fileInputRef,
    imgRef,
    crop,
    uploadImage,
    onCancel,
    onSelectFile,
    onCropChange,
    onFileButtonClick,
    isUploadSuccess,
  };
};
