import {Action} from 'redux';
import {BaseActionProcessedEvent, isActionProcessedEvent} from '../../../common/ActionProcessedEvent';

/** @internal */
import '../../../common/declarations';
import {CreateWrappedStoreInit} from '../createWrappedStore';

/** @internal */
export function resolveEventListener<S, A extends Action>(
  devtoolsInit: CreateWrappedStoreInit<S>['devtoolsInit'],
  initialState: S,
  getState: () => S,
  processor: (data: BaseActionProcessedEvent<A>) => void
): (evt: MessageEvent) => void {
  if (devtoolsInit && typeof __REDUX_DEVTOOLS_EXTENSION__ !== 'undefined') {
    const devtools = __REDUX_DEVTOOLS_EXTENSION__.connect<S, A>(devtoolsInit === true ? {} : devtoolsInit);
    devtools.init(initialState);

    return ({data}) => {
      if (isActionProcessedEvent<A>(data)) {
        processor(data);
        devtools.send(data.action, getState());
      }
    };
  }

  return ({data}) => {
    isActionProcessedEvent<A>(data) && processor(data);
  };
}
