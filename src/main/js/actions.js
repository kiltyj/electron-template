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
  backend: {
    testEvent: defineAction({
      type: 'testEvent',
      params: testPayloadParams,
    }),
    testCommand: {
      request: defineAction({
        type: 'backend.testCommand.request',
        params: testPayloadParams,
      }),
      response: defineAction({
        type: 'backend.testCommand.response',
        params: testPayloadParams,
      })
    }
  }
};
