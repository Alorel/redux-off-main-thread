import {Action, AnyAction, Store} from 'redux';

export type WrappedStore<S, A extends Action = AnyAction> = Store<S, A> & {
  onChange(listener: (action: A, newState: S, oldState: S) => void): () => void;
}
