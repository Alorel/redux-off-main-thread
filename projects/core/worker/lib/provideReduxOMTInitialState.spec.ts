import * as chai from 'chai';
import * as promiseChai from 'chai-as-promised';
import {provideReduxOMTInitialState} from './provideReduxOMTInitialState';

describe('provideReduxOMTInitialState', function () {
  const expect = chai.use(promiseChai).expect;

  it('Should throw on Node-env tests', () => {
    expect(provideReduxOMTInitialState({})).to.eventually
      .be.rejectedWith('provideReduxOMTInitialState can only be run on the worker thread');
  });
});
