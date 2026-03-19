import Image, { type ImageProps } from 'next/image';
import type React from 'react';
import { useEffect, useState } from 'react';
import { DEFAULT_AVATAR_PATH } from '../../constants/image';

type FallbackImageProps = Omit<ImageProps, 'onError'> & {
  fallbackSrc?: string;
};

const FallbackImage: React.FC<FallbackImageProps> = ({
  fallbackSrc = DEFAULT_AVATAR_PATH,
  src,
  alt,
  ...props
}) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [error, setError] = useState(false);

  useEffect(() => {
    setImgSrc(src);
    setError(false);
  }, [src]);

  const handleError = () => {
    if (!error) {
      setImgSrc(fallbackSrc);
      setError(true);
    }
  };

  return (
    <Image
      {...props}
      src={imgSrc || fallbackSrc}
      alt={alt || 'Image'}
      onError={handleError}
      priority={props.priority || false}
    />
  );
};

export default FallbackImage;
