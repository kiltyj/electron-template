import {takeEvery} from 'redux-saga';
import {put, call} from 'redux-saga/effects';

function* handleRequestAction(responseActionCreator, errorActionCreator, handler, transformPayload, action) {
  try {
    transformPayload = transformPayload || (payload => payload);
    const payload = transformPayload(action.payload);
    const response = yield call(handler, payload);
    yield put(responseActionCreator(response));
  } catch (error) {
    if (errorActionCreator) {
      yield put(errorActionCreator({message: error.message}));
    } else {
      throw error;
    }
  }
}

function* handleRequest(requestActionType, responseActionCreator, errorActionCreator, handler, transformPayload) {
  yield* takeEvery(requestActionType, handleRequestAction, responseActionCreator, errorActionCreator, handler, transformPayload);
}

// Takes in a request action, runs a request handler, then generates a response action from the return value of that
// request handler. Note: relies on request type being accessible as request.type, and relies on response being an
// action creator.
export default function* requestHandlerSaga({request, response, error}, handler, transformPayload) {
  yield* handleRequest(request.type, response, error, handler, transformPayload);
}
