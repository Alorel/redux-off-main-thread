import {Action, AnyAction, Store} from 'redux';

/** A Redux store wrapped to run off the main thread */
export type WrappedStore<S, A extends Action = AnyAction> = Store<S, A> & {

  /**
   * Actions no longer mutate the state synchronously, therefore the store no longer behaves exactly as a regular
   * Redux store:
   * <code>
   *   const oldState = store.getState();
   *   store.dispatch({type: 'some-valid-action-that-should-mutate-the-state''});
   *   // True on an off-main-thread store, false on a regular store
   *   console.log(oldState === store.getState());
   * </code>
   * This method can be used to react to when the store off the main thread
   */
  onChange(listener: (action: A, newState: S, oldState: S) => void): () => void;
}
