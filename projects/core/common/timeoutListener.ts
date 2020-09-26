import {Conf} from '../worker/lib/Conf';
import {ReduxOMTEvent} from './ReduxOMTEvent';

interface OkResponse<T> {
  data: T;

  ok: true;
}

interface TimeoutResponse {
  ok: false;
}

/** @internal */
export type TimeoutListenerResponse<T> = OkResponse<T> | TimeoutResponse;

type Listener = (evt: MessageEvent) => void;
type ListenerFn = (type: 'message', listener: Listener) => void;

function resolveListenersFromContext(ctx?: any): [ListenerFn, ListenerFn] {
  return ctx ?
    [ctx.addEventListener.bind(ctx), ctx.removeEventListener.bind(ctx)] :
    [addEventListener, removeEventListener];
}

/** @internal */
export function timeoutListener<T, E>(
  identifier: ReduxOMTEvent,
  predicate: (data: any) => data is E,
  getPayload?: ((data: E) => T) | null,
  ctx?: any
): Promise<T> {
  let listener: Listener = null as any;
  const [addListener, removeListener] = resolveListenersFromContext(ctx);

  const clean = (): void => {
    if (listener) {
      removeListener('message', listener);
      listener = null as any;
    }
  };

  const timeout$ = new Promise<TimeoutResponse>(r => {
    setTimeout(r.bind(null, {ok: false}));
  });
  const listener$ = new Promise<OkResponse<T>>(r => {
    listener = ({data}) => {
      if (predicate(data)) {
        setTimeout(clean, 1);
        r({data: getPayload ? getPayload(data) : undefined as any, ok: true});
      }
    };
    addListener('message', listener);
  });

  return Promise.race<TimeoutListenerResponse<T>>([timeout$, listener$])
    .then((rsp): any => {
      setTimeout(clean, 1);

      if (rsp.ok) {
        return rsp.data;
      }

      throw new Error(`Didn't receive a ${identifier} event in ${Conf.LONG_MESSAGE_LISTENER_TIMEOUT}ms.`);
    });
}
