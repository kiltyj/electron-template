import {EventEmitter} from 'events';

export default class BackendClient extends EventEmitter {
  constructor(port: number, service: ?string) {
    super();
    const servicePath = (service ? '/' + service : '');
    this._commandBaseURL = 'http://localhost:' + port + '/commands' + servicePath + '/';
    const eventSocket = new WebSocket('ws://localhost:' + port + '/events' + servicePath);
    eventSocket.onmessage = (data) => {
      this._eventReceived(JSON.parse(data.data));
    };

    return new Proxy(this, {
      get(target, name) {
        // If method/property is explicitly defined, use it
        if (target[name] !== undefined) {
          return target[name]
        }
        // Otherwise return an async method which forwards to backend API
        return async (argsObject) => {
          return await target.call(name, argsObject);
        };
      }
    });
  }

  _eventReceived(event) {
    this.emit(event.type, event.payload);
  }

  async call(method, argsObject) {
    const url = this._commandBaseURL + method;
    const request = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    };
    if (argsObject != null) {
      request.body = JSON.stringify(argsObject);
    }
    const res = await fetch(url, request);
    if (res && res.status) {
      let responseObject;
      let errorParsingResponse;
      try {
        responseObject = await res.json();
        errorParsingResponse = false;
      } catch (err) {
        responseObject = err.message;
        errorParsingResponse = true;
      }
      if (!errorParsingResponse && res.status >= 200 && res.status <= 299) {
        return responseObject.response;
      } else {
        const argsString = argsObject === undefined ? '' : JSON.stringify(argsObject);
        throw new Error('error calling ' + method + '(' + argsString + '): ' + res.status + ': ' + responseObject.error);
      }
    } else {
      const argsString = argsObject === undefined ? '' : JSON.stringify(argsObject);
      throw new Error('error calling ' + method + '(' + argsString + '): invalid return from fetch API');
    }
  }
}
