import defineAction, {required, optional} from './utilities/defineAction';
import defineRequestActions from './utilities/defineRequestActions';

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
    testCommand: defineRequestActions({
      typePrefix: 'testService.testCommand',
      requestPayload: testPayload,
      responsePayload: testPayload,
    }),
  }
};
