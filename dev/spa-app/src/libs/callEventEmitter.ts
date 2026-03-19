import { EventEmitter } from 'node:events';

/**
 * 通話に関するイベント通知を管理する
 */
class CallEventEmitter extends EventEmitter {}

const callEventEmitter = new CallEventEmitter();

export default callEventEmitter;
