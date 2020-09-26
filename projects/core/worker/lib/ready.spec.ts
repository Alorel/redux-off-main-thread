import * as chai from 'chai';
import * as promiseChai from 'chai-as-promised';
import {onReduxWorkerThreadReady} from './ready';

describe('onReduxWorkerThreadReady', function () {
  const expect = chai.use(promiseChai).expect;

  it('Should throw on Node-env tests', () => {
    expect(onReduxWorkerThreadReady()).to.eventually
      .be.rejectedWith('Not on worker thread');
  });
});
