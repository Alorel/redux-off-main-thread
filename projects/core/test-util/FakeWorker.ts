import {fake, SinonSpy} from 'sinon';
import '../common/index';
import '../main-thread/index';
import {WorkerPartial} from '../main-thread/lib/wrapped-store/WorkerPartial';
import '../worker/index';

/** @internal */
export class FakeWorker implements WorkerPartial {
  public readonly _listeners = new Set<(...args: any[]) => void>();

  public readonly _postMessage: SinonSpy = fake();

  public get postMessage(): Worker['postMessage'] {
    return this._postMessage as any;
  }

  public addEventListener(_evt: 'message', listener: (...args: any[]) => void): void {
    this._listeners.add(listener);
  }

  public receiveEvent(data?: any): void {
    for (const l of this._listeners) {
      l({data});
    }
  }

  removeEventListener(_evt: 'message', listener: (...args: any[]) => void): void {
    this._listeners.delete(listener);
  }
}
