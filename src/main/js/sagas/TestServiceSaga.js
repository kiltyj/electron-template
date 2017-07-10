import {put} from 'redux-saga/effects';
import actions from '../actions';
import {takeEvery} from 'redux-saga';

export default class TestServiceSaga {
  constructor(client) {
    this._client = client;
  }

  *rootSaga() {

  }
}
