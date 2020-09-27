import {Action} from 'redux';

type SubscribersFn<S, A> = (action: A, newState: S, oldState: S) => void;
type Subscribers<S, A extends Action> = [
  (listener: SubscribersFn<S, A>) => () => void,
  SubscribersFn<S, A>
]

/** @internal */
export function createSubscribers<S, A extends Action>(): Subscribers<S, A> {
  const subscribers: Array<SubscribersFn<S, A>> = [];

  return [
    function subscribe(listener) {
      !subscribers.includes(listener) && subscribers.push(listener);

      return () => {
        const idx = subscribers.indexOf(listener);
        if (idx !== -1) {
          subscribers.splice(idx, 1);
        }
      };
    },

    function notifySubscribers(action, newState, oldState) {
      for (let i = 0; i < subscribers.length; i++) {
        subscribers[i](action, newState, oldState);
      }
    }
  ];
}
