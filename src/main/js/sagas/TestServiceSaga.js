import takeFromEventEmitter from '../utilities/takeFromEventEmitter'
import {takeEvery} from 'redux-saga';
import actions from '../actions';

export default class TestServiceSaga {
  constructor(client) {
    this._client = client;
  }

  *_handleTestEvent(action) {
    console.log('Test event action: ' + JSON.stringify(action));
  }

  *rootSaga() {
    yield [
      takeFromEventEmitter(this._client, 'testEvent', actions.testEvent),
      takeEvery(actions.testEvent.type, this._handleTestEvent.bind(this)),
    ]
  }
}
