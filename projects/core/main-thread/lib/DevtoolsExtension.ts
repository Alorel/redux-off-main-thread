import {Action, AnyAction} from 'redux';
import {EnhancerOptions} from 'redux-devtools-extension';

/** @internal */
export interface DevtoolsExtension<S = any, A extends Action = AnyAction> {
  init(state: S): void;

  send(action: A, state: S): void;
}

/** @internal */
export interface DevtoolsExtensionFactory {
  connect<S = any, A extends Action = AnyAction>(cfg: EnhancerOptions): DevtoolsExtension<S, A>;
}
