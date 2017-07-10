import {ipcRenderer} from 'electron';

export default class MainProcess {
  constructor() {
    this._ipc = ipcRenderer;
  }

  getBackendPort() {
    if (this._backendPort == null) {
      this._backendPort = this._ipc.sendSync('get-backend-port');
    }
    return this._backendPort;
  }

  toggleDevTools() {
    this.send('toggle-dev-tools');
  }

  resize(w, h, animate, lock) {
    this.send('resize', {w, h, animate, lock});
  }

  send(channel, payload) {
    this._ipc.send(channel, payload);
  }
}
