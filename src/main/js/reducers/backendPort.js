import actions from '../actions';
import defineReducer from '../utilities/defineReducer';

const defaultState = null;
export default defineReducer(defaultState, {
  [actions.backendPortUpdated]: (state, {port}) => port,
});
