import {eventChannel} from 'redux-saga';
import {put, take, cancelled} from 'redux-saga/effects';
import type {EventEmitter} from 'events';

const createEventChannel = (eventEmitter: EventEmitter, eventName: string) => {
  let channelEmitter;
  const eventListener = (event) => {
    if (channelEmitter != null) {
      channelEmitter(event);
    }
  };
  eventEmitter.on(eventName, eventListener);
  return eventChannel((emitter) => {
    channelEmitter = emitter;
    return () => {
      eventEmitter.removeListener(eventName, eventListener);
    };
  });
};

export default function *takeFromEventEmitter(eventEmitter: EventEmitter, eventName: string, actionCreator) {
  const channel = createEventChannel(eventEmitter, eventName);
  try {
    while (true) {
      const event = yield take(channel);
      let action;
      if (actionCreator == null) {
        action = {type: eventName, payload: event};
      } else {
        action = actionCreator(event);
      }
      yield put(action);
    }
  } finally {
    if (yield cancelled()) {
      channel.close();
    }
  }
}
