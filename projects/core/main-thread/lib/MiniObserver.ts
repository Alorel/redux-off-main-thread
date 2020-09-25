/** @internal */
export interface Observer<T> {
  complete(): void;
  error(e: Error): void;
  next(value: T): void;
}

/** @internal */
export interface Subscription {
  unsubscribe(): void;
}

/** @internal */
export interface Observable<T> {
  subscribe(observer: Observer<T>): Subscription;
}
