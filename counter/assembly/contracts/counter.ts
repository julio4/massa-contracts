// The entry file of your WebAssembly module.
import {
  callerHasWriteAccess,
  generateEvent,
  Storage,
} from '@massalabs/massa-as-sdk';
import {
  Args,
  bytesToU32,
  stringToBytes,
  u32ToBytes,
} from '@massalabs/as-types';

export const COUNTER_KEY = 'counter';
export const DEFAULT_COUNTER_VALUE = 0;

/**
 * Initialize the counter smart contract
 * This function is meant to be called only one time: when the contract is deployed.
 */
export function constructor(): void {
  assert(callerHasWriteAccess());
  Storage.set(stringToBytes(COUNTER_KEY), u32ToBytes(DEFAULT_COUNTER_VALUE));
}

/**
 * Get the current value
 */
export function counter(): StaticArray<u8> {
  return Storage.get(stringToBytes(COUNTER_KEY));
}

/**
 * Increment the counter by the given number
 *
 * @param binaryArgs - serialized args with following argument:
 *  - u32 increment: the number to increment
 */
export function increment(binaryArgs: StaticArray<u8>): void {
  const increment = new Args(binaryArgs)
    .nextU32()
    .expect('Increment argument is invalid');

  const currentValue = bytesToU32(Storage.get(stringToBytes(COUNTER_KEY)));

  Storage.set(stringToBytes(COUNTER_KEY), u32ToBytes(currentValue + increment));
}

/**
 * Trigger the current value of the counter in an event
 */
export function triggerValue(): void {
  const currentValue = bytesToU32(Storage.get(stringToBytes(COUNTER_KEY)));

  generateEvent('Current counter value: ' + currentValue.toString());
}
