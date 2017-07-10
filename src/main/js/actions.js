import defineAction, {required, optional} from './utilities/defineAction';

const testPayloadParams = {
  integer: required,
  array: optional,
  string: optional,
  map: optional,
};

export default {
  backendPortUpdated: defineAction({
    type: 'backendPortUpdated',
    params: {
      port: required,
    }
  }),
  resize: defineAction({
    type: 'resize',
    params: {
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
      params: testPayloadParams,
    }),
    testCommand: {
      request: defineAction({
        type: 'testService.testCommand.request',
        params: testPayloadParams,
      }),
      response: defineAction({
        type: 'testService.testCommand.response',
        params: testPayloadParams,
      }),
      error: defineAction({
        type: 'testService.testCommand.error',
        params: {
          message: required,
        }
      })
    }
  }
};
