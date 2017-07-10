import takeFromEventEmitter from '../utilities/takeFromEventEmitter'
import {takeEvery} from 'redux-saga';
import requestHandlerSaga from '../utilities/requestHandlerSaga';
import actions from '../actions';

export default class TestServiceSaga {
  constructor(client) {
    this._client = client;
  }

  *_handleTestEvent(action) {
    console.log('Test event action: ' + JSON.stringify(action));
  }

  *_handleTestCommandResponse(action) {
    console.log('Test command response action: ' + JSON.stringify(action));
  }

  *_handleTestCommandRequest(action) {
    console.log('Test command request action: ' + JSON.stringify(action));
  }

  *_handleTestCommandError(action) {
    console.log('Test command error: ' + action.message);
  }

  *rootSaga() {
    yield [
      takeFromEventEmitter(this._client, 'testEvent', actions.testService.testEvent),
      takeEvery(actions.testService.testEvent.type, this._handleTestEvent.bind(this)),
      requestHandlerSaga(actions.testService.testCommand, [this._client, this._client.testCommand]),
      takeEvery(actions.testService.testCommand.request.type, this._handleTestCommandRequest.bind(this)),
      takeEvery(actions.testService.testCommand.response.type, this._handleTestCommandResponse.bind(this)),
      takeEvery(actions.testService.testCommand.error.type, this._handleTestCommandError.bind(this)),
    ]
  }
}
