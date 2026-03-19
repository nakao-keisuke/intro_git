import { useState } from 'react';
import type { ResponseData } from '@/types/NextApi';
import type { UpdateUserInfo } from '@/types/UpdateUserInfo';
import type { ActiveTime } from '@/utils/activeTime';
import type { Alcohol } from '@/utils/alcohol';
import type { BloodType } from '@/utils/bloodType';
import type { BodyType } from '@/utils/bodyType';
import type { Holiday } from '@/utils/holiday';
import type { Housemate } from '@/utils/housemate';
import type { Occupation } from '@/utils/occupation';
import type { PreferredLooks } from '@/utils/preferredLooks';
import type { Region } from '@/utils/region';
import type { Smoking } from '@/utils/smoking';
import type { TalkTheme } from '@/utils/talkTheme';

export const useEditProfileInfo = (
  initialData: ResponseData<{ updateUserInfo: UpdateUserInfo }>,
) => {
  const [age, setAge] = useState<number | undefined>(
    initialData.type === 'error' ? undefined : initialData.updateUserInfo.age,
  );
  const [region, setRegion] = useState<Region | undefined>(
    initialData.type === 'error'
      ? undefined
      : initialData.updateUserInfo.region,
  );
  const [userName, setUserName] = useState<string | undefined>(
    initialData.type === 'error'
      ? undefined
      : initialData.updateUserInfo.userName,
  );
  const [about, setAbout] = useState<string | undefined>(
    initialData.type === 'error' ? undefined : initialData.updateUserInfo.about,
  );
  const [isAboutBonusAvailable, setIsAboutBonusAvailable] = useState(
    initialData.type === 'error'
      ? false
      : initialData.updateUserInfo.isAboutBonusAvailable,
  );
  const [isAgeBonusAvailable, setIsAgeBonusAvailable] = useState(
    initialData.type === 'error'
      ? false
      : initialData.updateUserInfo.isAgeBonusAvailable,
  );
  const [isAvatarBonusAvailable, _setIsAvatarBonusAvailable] = useState(
    initialData.type === 'error'
      ? false
      : initialData.updateUserInfo.isAvatarBonusAvailable,
  );
  const [isHobbyBonusAvailable, setIsHobbyBonusAvailable] = useState(
    initialData.type === 'error'
      ? false
      : initialData.updateUserInfo.isAgeBonusAvailable,
  );
  const [isBodytypeBonusAvailable, setIsBodytypeBonusAvailable] = useState(
    initialData.type === 'error'
      ? false
      : initialData.updateUserInfo.isBodytypeBonusAvailable,
  );

  const [talktheme, setTalktheme] = useState<TalkTheme | undefined>(
    initialData.type === 'error'
      ? undefined
      : initialData.updateUserInfo.talktheme,
  );
  const [inters, setInters] = useState<string | undefined>(
    initialData.type === 'error'
      ? undefined
      : initialData.updateUserInfo.inters[0],
  );

  const [personality, setPersonality] = useState<string | undefined>(
    initialData.type === 'error'
      ? undefined
      : initialData.updateUserInfo.personality[0],
  );

  const [bodytype, setBodytype] = useState<BodyType | undefined>(
    initialData.type === 'error'
      ? undefined
      : initialData.updateUserInfo.bodyType,
  );

  const [activeTime, setActiveTime] = useState<ActiveTime | undefined>(
    initialData.type === 'error'
      ? undefined
      : initialData.updateUserInfo.activeTime,
  );
  const [occupation, setOccupation] = useState<Occupation | undefined>(
    initialData.type === 'error'
      ? undefined
      : initialData.updateUserInfo.occupation,
  );
  const [preferredLooks, setPreferredLooks] = useState<
    PreferredLooks | undefined
  >(
    initialData.type === 'error'
      ? undefined
      : initialData.updateUserInfo.preferredLooks,
  );
  const [holiday, setHoliday] = useState<Holiday | undefined>(
    initialData.type === 'error'
      ? undefined
      : initialData.updateUserInfo.holiday,
  );
  const [housemate, setHousemate] = useState<Housemate | undefined>(
    initialData.type === 'error'
      ? undefined
      : initialData.updateUserInfo.housemate,
  );
  const [bloodType, setBloodType] = useState<BloodType | undefined>(
    initialData.type === 'error'
      ? undefined
      : initialData.updateUserInfo.bloodType,
  );
  const [alcohol, setAlcohol] = useState<Alcohol | undefined>(
    initialData.type === 'error'
      ? undefined
      : initialData.updateUserInfo.alcohol,
  );
  const [smoking, setSmoking] = useState<Smoking | undefined>(
    initialData.type === 'error'
      ? undefined
      : initialData.updateUserInfo.smoking,
  );
  const updateAge = (age: number) => {
    setAge(age);
    setIsAgeBonusAvailable(false);
  };
  const updateRegion = (region: Region) => {
    setRegion(region);
  };
  const updateUserName = (userName: string) => {
    setUserName(userName);
  };
  const updateAbout = (about: string) => {
    setAbout(about);
    setIsAboutBonusAvailable(false);
  };
  const updateTalktheme = (talktheme: TalkTheme) => {
    setTalktheme(talktheme);
  };
  const updateInters = (inters: string) => {
    setInters(inters);
    setIsHobbyBonusAvailable(false);
  };
  const updatePersonality = (personality: string) => {
    setPersonality(personality);
  };
  const updateBodytype = (bodyType: BodyType) => {
    setBodytype(bodyType);
    setIsBodytypeBonusAvailable(false);
  };

  // 新規追加フィールドのupdate関数
  const updateActiveTime = (value: ActiveTime) => {
    setActiveTime(value);
  };
  const updateOccupation = (value: Occupation) => {
    setOccupation(value);
  };
  const updatePreferredLooks = (value: PreferredLooks) => {
    setPreferredLooks(value);
  };
  const updateHoliday = (value: Holiday) => {
    setHoliday(value);
  };
  const updateHousemate = (value: Housemate) => {
    setHousemate(value);
  };
  const updateBloodType = (value: BloodType) => {
    setBloodType(value);
  };
  const updateAlcohol = (value: Alcohol) => {
    setAlcohol(value);
  };
  const updateSmoking = (value: Smoking) => {
    setSmoking(value);
  };

  return {
    age,
    updateAge,
    region,
    updateRegion,
    userName,
    updateUserName,
    about,
    updateAbout,
    talktheme,
    updateTalktheme,
    inters,
    updateInters,
    personality,
    updatePersonality,
    bodytype,
    updateBodytype,
    isAboutBonusAvailable,
    isAgeBonusAvailable,
    isAvatarBonusAvailable,
    isHobbyBonusAvailable,
    isBodytypeBonusAvailable,
    // 新規追加フィールド
    activeTime,
    updateActiveTime,
    occupation,
    updateOccupation,
    preferredLooks,
    updatePreferredLooks,
    holiday,
    updateHoliday,
    housemate,
    updateHousemate,
    bloodType,
    updateBloodType,
    alcohol,
    updateAlcohol,
    smoking,
    updateSmoking,
  };
};
