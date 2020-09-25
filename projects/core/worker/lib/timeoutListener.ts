import {ReduxOMTEvent} from '../../common/ReduxOMTEvent';

interface OkResponse<T> {
  data: T;

  ok: true;
}

interface TimeoutResponse {
  ok: false;
}

/** @internal */
export type TimeoutListenerResponse<T> = OkResponse<T> | TimeoutResponse;

/** @internal */
export function timeoutListener<T, E>(
  identifier: ReduxOMTEvent,
  predicate: (data: any) => data is E,
  getPayload?: (data: E) => T
): Promise<T> {
  let listener: (evt: MessageEvent) => void = null as any;

  const clean = (): void => {
    if (listener) {
      removeEventListener('message', listener);
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
    addEventListener('message', listener);
  });

  return Promise.race<TimeoutListenerResponse<T>>([timeout$, listener$])
    .then((rsp): any => {
      setTimeout(clean, 1);

      if (rsp.ok) {
        return rsp.data;
      }

      throw new Error(`Main thread did not send ${identifier} in 60 seconds`);
    });
}
