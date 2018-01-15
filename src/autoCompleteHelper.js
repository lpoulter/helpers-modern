const Rx = require('rxjs');

const DEFAULT_DEBOUNCE_TIME = 300;

function keyupObserver(
  keyUp$,
  debounceTime = DEFAULT_DEBOUNCE_TIME,
  scheduler
) {
  scheduler = scheduler || Rx.Scheduler.asap;

  return keyUp$
    .map(function(e) {
      return e.target.value;
    })
    .filter(function(text) {
      return text.length > 2;
    })
    .debounceTime(debounceTime, scheduler)
    .distinctUntilChanged();
}

function keyupObserverWithFetch(keyUp$, fetchFn, scheduler) {
  scheduler = scheduler || Rx.Scheduler.asap;

  return keyupObserver(keyUp$, scheduler).switchMap(function(text) {
    return Rx.Observable.fromPromise(fetchFn(text), scheduler);
  });
}

module.exports = {
  keyupObserver,
  keyupObserverWithFetch,
};
