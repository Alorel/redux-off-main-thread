## [2.0.3](https://github.com/Alorel/redux-off-main-thread/compare/2.0.2...2.0.3) (2020-09-28)


### Bug Fixes

* **common:** Fixed timeout errors on worker load ([a98e1f6](https://github.com/Alorel/redux-off-main-thread/commit/a98e1f6144ae17ffacb2b8ca54c5f785c2c60d7c))

## [2.0.2](https://github.com/Alorel/redux-off-main-thread/compare/2.0.1...2.0.2) (2020-09-27)


### Performance Improvements

* **main-thread:** Optimise subscribers for notification speed ([a2d39c1](https://github.com/Alorel/redux-off-main-thread/commit/a2d39c1931e1eb9ffa129ee3408981f0367f8e5d))

## [2.0.1](https://github.com/Alorel/redux-off-main-thread/compare/2.0.0...2.0.1) (2020-09-27)


### Bug Fixes

* **main-thread:** A change event should now be emitted even if it doesn't mutate the state ([c8ca019](https://github.com/Alorel/redux-off-main-thread/commit/c8ca019c85f284da6ec21aaa3a876ef2938e1cc0))

# [2.0.0](https://github.com/Alorel/redux-off-main-thread/compare/1.0.0...2.0.0) (2020-09-26)


### Features

* **core:** add provideReduxOMTInitialState & resolveWrappedStore functions ([2b05a04](https://github.com/Alorel/redux-off-main-thread/commit/2b05a04ab70a336979f40d97f1b06f8af3ffc93f))


### Refactoring

* Use numeric internal event names ([18df0c6](https://github.com/Alorel/redux-off-main-thread/commit/18df0c63cf50cbc666b36cc0cb9eaf6f86605fd3))


### BREAKING CHANGES

* **core:** The WorkerPartial type now requires a `removeEventListener` property. This is a non-breaking change if full `Worker` instances were used.

# 1.0.0 (2020-09-25)


### Features

* Initial release ([#1](https://github.com/Alorel/redux-off-main-thread/issues/1)) ([d4b259c](https://github.com/Alorel/redux-off-main-thread/commit/d4b259c10ebad6a9915246319fc7f6bba5ef407a))
