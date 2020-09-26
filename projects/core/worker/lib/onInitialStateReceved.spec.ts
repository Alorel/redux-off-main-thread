import * as chai from 'chai';
import * as promiseChai from 'chai-as-promised';
import {onReduxWorkerThreadInitialStateReceived} from './onInitialStateReceved';

describe('onReduxWorkerThreadInitialStateReceived', function () {
  const expect = chai.use(promiseChai).expect;

  it('Should throw on Node-env tests', () => {
    expect(onReduxWorkerThreadInitialStateReceived()).to.eventually
      .be.rejectedWith('Not on worker thread');
  });
});
