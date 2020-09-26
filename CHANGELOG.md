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
