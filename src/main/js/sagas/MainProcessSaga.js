import {put} from 'redux-saga/effects';
import actions from '../actions';
import {takeEvery} from 'redux-saga';
import type MainProcess from '../utilities/MainProcess';

export default class MainProcessSaga {
  constructor(mainProcess: MainProcess) {
    this._mainProcess = mainProcess;
  }

  *rootSaga() {
    yield put(actions.backendPortUpdated({port: this._mainProcess.getBackendPort()}));
    yield [
      // Translate actions to IPC calls
      takeEvery(actions.resize.type, action => this._mainProcess.send('resize', action)),
      takeEvery(actions.toggleDevTools.type, () => this._mainProcess.send('toggle-dev-tools')),
    ];
  }
}
