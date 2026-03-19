import type { JamboRequest, JamboResponseData } from '@/types/JamboApi';

type AddLovenseTicketRequest = JamboRequest & {
  api: 'add_lovense_ticket';
  token: string;
  lovense_menu_type: string;
  lovense_duration: number;
};

export type AddLovenseResponseData = JamboResponseData & {};

export const addLovenseTicketRequest = (
  token: string,
  menuType: string,
  duration: number,
): AddLovenseTicketRequest => ({
  api: 'add_lovense_ticket',
  token,
  lovense_menu_type: menuType,
  lovense_duration: duration,
});
