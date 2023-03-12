import { Args, bytesToU32 } from '@massalabs/as-types';
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
    constructor(new Args().serialize());
    expect(bytesToU32(Storage.get(COUNTER_KEY))).toBe(DEFAULT_COUNTER_VALUE);
  });

  test('get counter value', () => {
    expect(bytesToU32(counter(new Args().serialize()))).toBe(
      DEFAULT_COUNTER_VALUE,
    );
  });

  test('increment counter', () => {
    const initialValue = bytesToU32(counter(new Args().serialize()));
    const incr: u32 = 10;

    increment(new Args().add(incr as u32).serialize());

    expect(bytesToU32(counter(new Args().serialize()))).toBe(
      initialValue + incr,
    );
  });

  test('multiple increment counter', () => {
    const initialValue = bytesToU32(counter(new Args().serialize()));
    const incr: u32 = 10;

    for (let i = 1; i < 5; i++) {
      increment(new Args().add(incr as u32).serialize());
      expect(bytesToU32(counter(new Args().serialize()))).toBe(
        initialValue + i * incr,
      );
    }
  });

  test('unsigned integer overflow', () => {
    const initialValue = bytesToU32(counter(new Args().serialize()));

    increment(new Args().add(u32.MAX_VALUE + 1).serialize());

    const result = bytesToU32(counter(new Args().serialize()));

    expect(result).toBe(initialValue);
  });
});
