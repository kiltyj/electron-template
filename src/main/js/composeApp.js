import MainProcessSaga from './sagas/MainProcessSaga';
import MainProcess from './utilities/MainProcess';
import TestServiceSaga from './sagas/TestServiceSaga';
import BackendClient from './utilities/BackendClient';

// Performs dependency injection and returns all saga provider objects for the app
// Note: when running in development mode, this will be called on every refresh
export default async () => {
  const mainProcess = new MainProcess();
  const mainProcessSaga = new MainProcessSaga(mainProcess);

  const backendPort = mainProcess.getBackendPort();
  const testClient = new BackendClient(backendPort, 'test');
  const testServiceSaga = new TestServiceSaga(testClient);

  setTimeout(async () => {
    testClient.on('testEvent', (payload) => {
      console.log('Received test event: ' + JSON.stringify(payload));
    });
    testClient.on('wildcardEvent', (payload) => {
      console.log('Received wildcard event: ' + JSON.stringify(payload));
    });

    await testClient.triggerEvent();
    await testClient.triggerWildcardEvent();
    const response = await testClient.testCommand({integer:3,array:[3,6,9],string:"three",map:{c:[3,2,1]}});
    console.log('Test command response: ' + JSON.stringify(response));
  }, 3000);

  return [
    mainProcessSaga,
    testServiceSaga,
  ];
};
