import {expect} from 'chai';
import {fake, SinonSpy} from 'sinon';
import {createSubscribers} from './createSubscribers';

describe('createSubscribers', () => {
  let subscribe: ReturnType<typeof createSubscribers>[0];
  let notify: ReturnType<typeof createSubscribers>[1];
  let fn: SinonSpy;

  function notifyFake() {
    notify({type: ''}, {}, {});
  }

  beforeEach(() => {
    const pair = createSubscribers<any, any>();
    subscribe = pair[0];
    notify = pair[1];
    fn = fake();
  });

  it('Should not allow multiple identical subscribers', () => {
    subscribe(fn);
    subscribe(fn);
    notifyFake();
    expect(fn.callCount).to.eq(1);
  });

  it('Should unsubscribe', () => {
    const unsub = subscribe(fn);
    notifyFake();
    notifyFake();
    unsub();
    notifyFake();
    expect(fn.callCount).to.eq(2);
  });

  it('Should pass on notify args', () => {
    const action = {type: 'foo'};
    const newState = {foo: 'bar'};
    const oldState = {qux: 'baz'};
    subscribe(fn);
    notify(action, newState, oldState);

    const [a, nu, old] = fn.lastCall.args;
    expect(a).to.eq(action, 'action');
    expect(nu).to.eq(newState, 'new state');
    expect(old).to.eq(oldState, 'old state');
  });
});
