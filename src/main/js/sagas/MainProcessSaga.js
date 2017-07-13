import {put, call} from 'redux-saga/effects';
import actions from '../actions';
import {takeEvery, delay} from 'redux-saga';
import type MainProcess from '../utilities/MainProcess';
import takeFromEventEmitter from '../utilities/takeFromEventEmitter';

const UI_SHOW_DELAY_MS = 1000;

export default class MainProcessSaga {
  constructor(mainProcess: MainProcess) {
    this._mainProcess = mainProcess;
  }

  *_handleCriticalError({payload: {message}}) {
    alert('Closing after critical error: ' + message);
    yield put(actions.close());
  }

  *rootSaga() {
    yield put(actions.backendPortUpdated({port: this._mainProcess.getBackendPort()}));
    yield delay(UI_SHOW_DELAY_MS);
    yield call([this._mainProcess, this._mainProcess.signalReadyToShow]);

    yield [
      // Translate actions to IPC calls
      takeEvery(actions.resize, action => this._mainProcess.send('resize', action.payload)),
      takeEvery(actions.close, action => this._mainProcess.send('close')),
      takeEvery(actions.toggleDevTools, () => this._mainProcess.send('toggle-dev-tools')),
      takeEvery(actions.criticalError, this._handleCriticalError.bind(this)),
    ];
  }
}
