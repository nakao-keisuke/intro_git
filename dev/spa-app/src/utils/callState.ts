export const beforeCall = 'beforeCall';
export type BeforeCall = typeof beforeCall;
export const inCall = 'inCall';
export type InCall = typeof inCall;
export const afterCall = 'afterCall';
export type AfterCall = typeof afterCall;
export type CallState = BeforeCall | InCall | AfterCall;
