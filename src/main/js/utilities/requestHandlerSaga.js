import {takeEvery} from 'redux-saga';
import {put, call} from 'redux-saga/effects';

function* handleRequestAction(responseActionCreator, errorActionCreator, handler, action) {
  try {
    const response = yield call(handler, action.payload);
    yield put(responseActionCreator(response));
  } catch (error) {
    yield put(errorActionCreator({message: error.message}));
  }
}

function* handleRequest(requestActionType, responseActionCreator, errorActionCreator, handler) {
  yield* takeEvery(requestActionType, handleRequestAction, responseActionCreator, errorActionCreator, handler);
}

// Takes in a request action, runs a request handler, then generates a response action from the return value of that
// request handler. Note: relies on request type being accessible as request.type, and relies on response being an
// action creator.
export default function* requestHandlerSaga({request, response, error}, handler) {
  yield* handleRequest(request.type, response, error, handler);
}
