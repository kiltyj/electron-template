import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {AppContainer} from 'react-hot-loader';
import composeSagaProviders from './utilities/composeSagaProviders';
import composeApp from './composeApp';
import {Provider} from 'react-redux';
import {createStore, applyMiddleware, compose} from 'redux';
import createSagaMiddleware from 'redux-saga';
import rootReducer from './reducers';
import isDev from 'electron-is-dev';

const render = (store) => {
  const App = require('./containers/App').default;
  ReactDOM.render(
    <AppContainer style={{flex: 1}}>
      <Provider store={store}>
        <App/>
      </Provider>
    </AppContainer>,
    document.getElementById('root'));
};

const configureStore = async () => {
  const sagaMiddleware = createSagaMiddleware();
  const rootSaga = composeSagaProviders(await composeApp());

  let enhancer;
  if (process.env.DEV || isDev) {
    // For available options, see https://github.com/zalmoxisus/redux-devtools-extension#usage
    const reduxDevToolsOptions = {};
    const composeEnhancers =
      typeof window === 'object' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?
        window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__(reduxDevToolsOptions) :
        compose;
    enhancer = composeEnhancers(applyMiddleware(sagaMiddleware));
  } else {
    enhancer = applyMiddleware(sagaMiddleware);
  }

  const store = createStore(rootReducer, enhancer);

  if (isDev) {
    if (module.hot) {
      module.hot.accept(() => {
        store.replaceReducer(require('./reducers').default);
      });
    }
  }

  sagaMiddleware.run(rootSaga);
  return store;
};

configureStore()
  .then((store) => {
    render(store);
    if (module.hot) {
      module.hot.accept(() => {
        render(store);
      });
    }
  })
  .catch((err) => {
    console.error(err.message);
  });
