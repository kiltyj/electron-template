import defineAction, {required} from './defineAction';

// Defines request, response, and error redux actions that can be triggered via requestHandlerSaga
const defineRequestActions = ({typePrefix, requestPayload, responsePayload, noErrorAction}) => {
  const actions = {
    request: defineAction({
      type: typePrefix + '.request',
      payload: requestPayload,
    }),
    response: defineAction({
      type: typePrefix + '.response',
      payload: responsePayload,
    }),
  };
  if (!noErrorAction) {
    actions.error = defineAction({
      type: typePrefix + '.error',
      payload: {
        message: required,
      }
    });
  }
  return actions;
};

export default defineRequestActions;
