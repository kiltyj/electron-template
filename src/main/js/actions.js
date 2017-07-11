import defineAction, {required, optional} from './utilities/defineAction';

const testPayload = {
  integer: required,
  array: optional,
  string: optional,
  map: optional,
};

export default {
  backendPortUpdated: defineAction({
    type: 'backendPortUpdated',
    payload: {
      port: required,
    }
  }),
  resize: defineAction({
    type: 'resize',
    payload: {
      w: required,
      h: required,
      animate: optional,
      lock: optional,
    }
  }),
  toggleDevTools: defineAction({
    type: 'toggleDevTools',
  }),
  testService: {
    testEvent: defineAction({
      type: 'testService.testEvent',
      payload: testPayload,
    }),
    testCommand: {
      request: defineAction({
        type: 'testService.testCommand.request',
        payload: testPayload,
      }),
      response: defineAction({
        type: 'testService.testCommand.response',
        payload: testPayload,
      }),
      error: defineAction({
        type: 'testService.testCommand.error',
        payload: {
          message: required,
        }
      })
    }
  }
};
