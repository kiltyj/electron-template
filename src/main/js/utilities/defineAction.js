/**
 * This module provides an API for defining redux actions per the following:
 *
 *    import defineAction, {optional, required} from './utilities/defineAction';
 *
 *    const formSubmitted = defineAction({
 *      type: 'FORM_SUBMITTED',
 *      params: {
 *        someParam: required,
 *        otherParam: optional,
 *      }
 *    });
 *
 * This allows actions to be created via formSubmitted({someParam: 'a', otherParam: 123})
 * and referenced (e.g. in reducers switch statements) via formSubmitted.type.
 */

export const optional = true;
export const required = false;

const createAction = (type, args, params) => {
  const action = {type};
  for (const param of params) {
    if (!param.optional && args[param.name] === undefined) {
      throw new Error('Action ' + type + ' created without arg: ' + param.name);
    }
    if (action.payload == null) {
      action.payload = {};
    }
    action.payload[param.name] = args[param.name];
  }
  return action
};

const createActionFromParamsMap = (type, args, paramsOptional) => {
  const params = [];
  for (const name in paramsOptional) {
    if (paramsOptional.hasOwnProperty(name)) {
      params.push({name, optional: paramsOptional[name]});
    }
  }
  return createAction(type, args, params);
};

const defineAction = ({type, payload}) => {
  payload = payload || [];
  const actionCreator = function (args) {
    if (payload.constructor === Array) {
      return createAction(type, args, payload);
    }
    return createActionFromParamsMap(type, args, payload);
  };
  actionCreator.type = type;
  return actionCreator;
};

export default defineAction;
