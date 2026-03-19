import { useState } from 'react';

export const useEditProfileModal = () => {
  const [isRegionModalOpen, setRegionModalOpen] = useState(false);
  const [isAgeModalOpen, setAgeModalOpen] = useState(false);
  const [isUserNameModalOpen, setUserNameModalOpen] = useState(false);
  const [isPicModalOpen, setIsPicModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isTalkThemeModalOpen, setIsTalkThemeModalOpen] = useState(false);
  const [isIntersModalOpen, setIsIntersModalOpen] = useState(false);
  const [isPersonalityModalOpen, setIsPersonalityModalOpen] = useState(false);
  const [isBodytypeModalOpen, setIsBodytypeModalOpen] = useState(false);
  // 新規追加フィールド用モーダル
  const [isActiveTimeModalOpen, setIsActiveTimeModalOpen] = useState(false);
  const [isOccupationModalOpen, setIsOccupationModalOpen] = useState(false);
  const [isPreferredLooksModalOpen, setIsPreferredLooksModalOpen] =
    useState(false);
  const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false);
  const [isHousemateModalOpen, setIsHousemateModalOpen] = useState(false);
  const [isBloodTypeModalOpen, setIsBloodTypeModalOpen] = useState(false);
  const [isAlcoholModalOpen, setIsAlcoholModalOpen] = useState(false);
  const [isSmokingModalOpen, setIsSmokingModalOpen] = useState(false);

  return {
    isRegionModalOpen,
    setRegionModalOpen,
    isAgeModalOpen,
    setAgeModalOpen,
    isUserNameModalOpen,
    setUserNameModalOpen,
    isPicModalOpen,
    setIsPicModalOpen,
    isAboutModalOpen,
    setIsAboutModalOpen,
    isTalkThemeModalOpen,
    setIsTalkThemeModalOpen,
    isIntersModalOpen,
    setIsIntersModalOpen,
    isPersonalityModalOpen,
    setIsPersonalityModalOpen,
    isBodytypeModalOpen,
    setIsBodytypeModalOpen,
    // 新規追加フィールド用モーダル
    isActiveTimeModalOpen,
    setIsActiveTimeModalOpen,
    isOccupationModalOpen,
    setIsOccupationModalOpen,
    isPreferredLooksModalOpen,
    setIsPreferredLooksModalOpen,
    isHolidayModalOpen,
    setIsHolidayModalOpen,
    isHousemateModalOpen,
    setIsHousemateModalOpen,
    isBloodTypeModalOpen,
    setIsBloodTypeModalOpen,
    isAlcoholModalOpen,
    setIsAlcoholModalOpen,
    isSmokingModalOpen,
    setIsSmokingModalOpen,
  };
};
