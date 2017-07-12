/**
 * This module provides an API for defining redux reducers for actions created via
 * defineAction. For example:
 *
 *    import defineAction, {optional, required} from './utilities/defineAction';
 *    import defineReducer from '../utilities/defineReducer';
 *
 *    const increment = defineAction({
 *      type: 'INCREMENT',
 *      payload: {
 *        delta: required,
 *      }
 *    });
 *
 *    const defaultState = 0;
 *    export default defineReducer(defaultState, {
 *      [increment]: (state, {delta}) => (state + delta),
 *    });
 */

const defineReducer = (defaultState, actionCreatorToPayloadHandlerMap) => {
  const actionTypeToPayloadHandlerMap = {};
  for (const actionCreator in actionCreatorToPayloadHandlerMap) {
    if (actionCreatorToPayloadHandlerMap.hasOwnProperty(actionCreator)) {
      actionTypeToPayloadHandlerMap[actionCreator.toString()] = actionCreatorToPayloadHandlerMap[actionCreator];
    }
  }
  return (state = defaultState, action) => {
    const actionHandler = actionTypeToPayloadHandlerMap[action.type];
    if (actionHandler != null) {
      return actionHandler(state, action.payload);
    }
    return state;
  };
};

export default defineReducer;
