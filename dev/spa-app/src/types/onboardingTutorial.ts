export type TutorialSlide = {
  title: string;
  description: string;
  illustration: 'chat' | 'message' | 'gallery' | 'live' | 'video';
};

export type TutorialProps = {
  onClose: () => void;
};

export type UseTutorialReturn = {
  showTutorial: boolean;
  completeTutorial: () => void;
  closeTutorial: () => void;
};
