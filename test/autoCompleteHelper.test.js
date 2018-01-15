const Rx = require('rxjs');
const _ = require('lodash');
const autoCompleteHelper = require('../src/autoCompleteHelper.js');

let testScheduler;

const keyupObserver = autoCompleteHelper.keyupObserver;

const timeout = 5000;

describe('autoCompleteHelper', () => {
  let page;

  beforeAll(async () => {
    page = await global.__BROWSER__.newPage();
  }, timeout);

  afterAll(async () => {
    await page.close();
  });

  beforeEach(() => {
    // console.log('page', page);
    testScheduler = new Rx.TestScheduler((a, b) => expect(a).toEqual(b));
  });

  afterEach(() => {
    testScheduler.flush();
  });

  it('transform input events into autocomplete results', function() {
    const inputPattern = 'a--b--c';
    const expectedPattern = `--a--b--c`;
    const expectedMap = {
      a: 'tes',
      b: 'testing',
      c: 'testing with RX',
    };

    const keyUp$ = testScheduler.createHotObservable(inputPattern, {
      a: { target: { value: 'tes' } },
      b: { target: { value: 'testing' } },
      c: { target: { value: 'testing with RX' } },
    });

    const debounceTime = 20;
    const actual$ = keyupObserver(keyUp$, debounceTime, testScheduler);

    testScheduler.expectObservable(actual$).toBe(expectedPattern, expectedMap);
  });

  it('does not retrieve autocomplete results if the input value length is less than 3', () => {
    const inputPattern = 'a--b--c';
    const expectedPattern = `--------c`;
    const expectedMap = {
      c: 'tes',
    };

    const keyUp$ = testScheduler.createHotObservable(inputPattern, {
      a: { target: { value: 't' } }, // will be ignored
      b: { target: { value: 'te' } }, // will be ignored
      c: { target: { value: 'tes' } },
    });

    const debounceTime = 20;
    const actual$ = keyupObserver(keyUp$, debounceTime, testScheduler);

    testScheduler.expectObservable(actual$).toBe(expectedPattern, expectedMap);
  });

  it('debounces the input events', () => {
    const inputPattern = `a--(bcd)--e`;
    const expectedPattern = `--a--d------e`;
    const expectedMap = {
      a: 'tes',
      d: 'testing deb',
      e: 'testing debounced',
    };

    const keyUp$ = testScheduler.createHotObservable(inputPattern, {
      a: { target: { value: 'tes' } },
      b: { target: { value: 'test' } }, // will be ignored
      c: { target: { value: 'testing' } }, // will be ignored
      d: { target: { value: 'testing deb' } },
      e: { target: { value: 'testing debounced' } },
    });

    const debounceTime = 20;
    const actual$ = keyupObserver(keyUp$, debounceTime, testScheduler);

    testScheduler.expectObservable(actual$).toBe(expectedPattern, expectedMap);
  });

  it("does not retrieve autocomplete results if the input value hasn\\'t changed", () => {
    const inputPattern = 'a--b--c';
    const expectedPattern = `--a`;
    const expectedMap = {
      a: 'tes',
    };

    const keyUp$ = testScheduler.createHotObservable(inputPattern, {
      a: { target: { value: 'tes' } },
      b: { target: { value: 'tes' } }, // will be ignored
      c: { target: { value: 'tes' } }, // will be ignored
    });

    const debounceTime = 20;
    const actual$ = keyupObserver(keyUp$, debounceTime, testScheduler);

    testScheduler.expectObservable(actual$).toBe(expectedPattern, expectedMap);
  });
});
