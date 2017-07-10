import {takeEvery} from 'redux-saga';
import {put, call} from 'redux-saga/effects';

function* handleRequestAction(responseActionCreator, handler, action) {
  const response = yield call(handler, action);
  yield put(responseActionCreator(response));
}

export function* handleRequest(requestActionType, responseActionCreator, handler) {
  yield* takeEvery(requestActionType, handleRequestAction, responseActionCreator, handler);
}

// Takes in a request action, runs a request handler, then generates a response action from the return value of that
// request handler. Note: relies on request type being accessible as request.type, and relies on response being an
// action creator.
export default function* requestHandlerSaga({request, response}, handler) {
  yield* handleRequest(request.type, response, handler);
}
