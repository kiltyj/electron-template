import {fork} from 'redux-saga/effects';

export default function composeSagaProviders(sagaProviders) {
  return function*() {
    yield sagaProviders.map((sagaProvider) => {
      return fork([sagaProvider, sagaProvider.rootSaga]);
    });
  }
}
