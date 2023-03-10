import { Args, bytesToU32, stringToBytes } from '@massalabs/as-types';
import { Storage } from '@massalabs/massa-as-sdk';

import {
  constructor,
  counter,
  increment,
  COUNTER_KEY,
  DEFAULT_COUNTER_VALUE,
} from '../contracts/counter';

describe('Counter contract', () => {
  test('constructor', () => {
    constructor();
    expect(bytesToU32(Storage.get(stringToBytes(COUNTER_KEY)))).toBe(
      DEFAULT_COUNTER_VALUE,
    );
  });

  test('get counter value', () => {
    expect(bytesToU32(counter())).toBe(DEFAULT_COUNTER_VALUE);
  });

  test('increment counter', () => {
    const incr = 10;

    increment(new Args().add(incr).serialize());

    expect(bytesToU32(counter())).toBe(DEFAULT_COUNTER_VALUE + incr);
  });

  test('unsigned integer overflow', () => {
    increment(new Args().add(u32.MAX_VALUE + 1).serialize());
    

    const result = bytesToU32(counter())

    log(result.toString())

    expect(result).toBe(u32.MAX_VALUE);
  })
});
