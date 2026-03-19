import {
  APPLICATION_ID,
  type ApplicationIdType,
  getApplicationId,
} from '@/constants/applicationId';

export type NativeBrand = {
  readonly logoPath: string;
  readonly logoAlt: string;
  readonly logoClass: string;
  readonly primaryButtonClass: string;
  readonly videoMaskStyle: string;
};

const BRAND_BY_APPLICATION_ID: Record<ApplicationIdType, NativeBrand> = {
  [APPLICATION_ID.WEB]: {
    logoPath: '/header/utage_logo.webp',
    logoAlt: 'Utage',
    logoClass: 'w-[90px] h-auto',
    primaryButtonClass:
      'bg-gradient-to-l from-red-300 to-blue-400 shadow-[0_4px_15px_rgba(64,160,255,0.35)]',
    videoMaskStyle:
      'radial-gradient(circle at 26% 18%, rgba(120,190,255,0.26) 0%, transparent 42%), radial-gradient(circle at 72% 58%, rgba(255,120,170,0.20) 0%, transparent 42%), radial-gradient(circle at 18% 82%, rgba(80,130,255,0.20) 0%, transparent 34%)',
  },
  [APPLICATION_ID.NATIVE]: {
    logoPath: '/header/renka_logo.webp',
    logoAlt: 'Renka',
    logoClass: 'w-[90px] h-auto',
    primaryButtonClass:
      'bg-gradient-to-br from-violet-600 via-fuchsia-500 to-violet-400 shadow-[0_4px_15px_rgba(139,92,246,0.4)]',
    videoMaskStyle:
      'radial-gradient(circle at 30% 20%, rgba(255,200,150,0.3) 0%, transparent 40%), radial-gradient(circle at 70% 60%, rgba(200,150,255,0.2) 0%, transparent 40%), radial-gradient(circle at 20% 80%, rgba(100,150,255,0.2) 0%, transparent 30%)',
  },
  [APPLICATION_ID.NATIVE_ANDROID]: {
    logoPath: '/header/renka_logo.webp',
    logoAlt: 'Renka',
    logoClass: 'w-[90px] h-auto',
    primaryButtonClass:
      'bg-gradient-to-br from-violet-600 via-fuchsia-500 to-violet-400 shadow-[0_4px_15px_rgba(139,92,246,0.4)]',
    videoMaskStyle:
      'radial-gradient(circle at 30% 20%, rgba(255,200,150,0.3) 0%, transparent 40%), radial-gradient(circle at 70% 60%, rgba(200,150,255,0.2) 0%, transparent 40%), radial-gradient(circle at 20% 80%, rgba(100,150,255,0.2) 0%, transparent 30%)',
  },
  [APPLICATION_ID.HIKARI_IOS]: {
    logoPath: '/header/hikari_logo.webp',
    logoAlt: 'Hikari',
    logoClass: 'w-[90px] h-auto',
    primaryButtonClass:
      'bg-gradient-to-br from-yellow-400 via-amber-400 to-yellow-300 shadow-[0_4px_15px_rgba(254,200,0,0.4)]',
    videoMaskStyle:
      'radial-gradient(circle at 28% 18%, rgba(255,240,80,0.28) 0%, transparent 42%), radial-gradient(circle at 72% 60%, rgba(255,210,50,0.22) 0%, transparent 44%), radial-gradient(circle at 18% 82%, rgba(255,230,100,0.2) 0%, transparent 34%)',
  },
  [APPLICATION_ID.SAKURA_IOS]: {
    logoPath: '/header/sakura_logo.webp',
    logoAlt: 'Sakura',
    logoClass: 'w-[90px] h-auto',
    primaryButtonClass:
      'bg-gradient-to-br from-rose-500 via-pink-500 to-fuchsia-500 shadow-[0_4px_15px_rgba(244,114,182,0.42)]',
    videoMaskStyle:
      'radial-gradient(circle at 30% 20%, rgba(255,100,160,0.35) 0%, transparent 40%), radial-gradient(circle at 74% 58%, rgba(255,60,120,0.28) 0%, transparent 42%), radial-gradient(circle at 20% 82%, rgba(255,140,180,0.25) 0%, transparent 34%)',
  },
  [APPLICATION_ID.SUMIRE_IOS]: {
    logoPath: '/header/sumire_logo.webp',
    logoAlt: 'Sumire',
    logoClass: 'w-[90px] h-auto',
    primaryButtonClass:
      'bg-gradient-to-br from-blue-500 via-sky-500 to-cyan-400 shadow-[0_4px_15px_rgba(56,189,248,0.42)]',
    videoMaskStyle:
      'radial-gradient(circle at 28% 18%, rgba(56,189,248,0.28) 0%, transparent 42%), radial-gradient(circle at 72% 60%, rgba(14,165,233,0.22) 0%, transparent 44%), radial-gradient(circle at 20% 82%, rgba(103,213,255,0.2) 0%, transparent 34%)',
  },
};

export const getNativeBrandByApplicationId = (
  applicationId: ApplicationIdType,
): NativeBrand => {
  return BRAND_BY_APPLICATION_ID[applicationId];
};

export const getCurrentNativeBrand = (): NativeBrand => {
  return getNativeBrandByApplicationId(getApplicationId());
};
