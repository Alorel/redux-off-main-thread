import {Action} from 'redux';

type SubscribersFn<S, A> = (action: A, newState: S, oldState: S) => void;
type Subscribers<S, A extends Action> = [
  (listener: SubscribersFn<S, A>) => () => void,
  SubscribersFn<S, A>
]

/** @internal */
export function createSubscribers<S, A extends Action>(): Subscribers<S, A> {
  const subscribers = new Set<SubscribersFn<S, A>>();

  return [

    // subscribe
    listener => {
      subscribers.add(listener);

      return () => {
        subscribers.delete(listener);
      };
    },

    // Notify
    (action, newState, oldState) => {
      if (subscribers.size) {
        for (const s of subscribers) {
          s(action, newState, oldState);
        }
      }
    }
  ];
}
