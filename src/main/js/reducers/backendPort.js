import actions from '../actions';

export default (state = null, action) => {
  switch (action.type) {
    case actions.backendPortUpdated.type:
      return action.port;
    default:
      return state;
  }
};
