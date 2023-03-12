// The entry file of your WebAssembly module.
import {
  callerHasWriteAccess,
  generateEvent,
  Storage,
} from '@massalabs/massa-as-sdk';
import {
  Args,
  u32ToBytes,
  bytesToU32,
  stringToBytes,
} from '@massalabs/as-types';

export const COUNTER_KEY = stringToBytes('counter');
export const DEFAULT_COUNTER_VALUE: u32 = 0;

function getCounterValue(): u32 {
  assert(Storage.has(COUNTER_KEY), 'Contract is not initialized');

  return bytesToU32(Storage.get(COUNTER_KEY));
}

/**
 * Initialize the counter smart contract
 * This function is meant to be called only one time: when the contract is deployed.
 */
export function constructor(_: StaticArray<u8>): StaticArray<u8> {
  assert(callerHasWriteAccess(), 'Not allowed');

  // initialization
  Storage.set(COUNTER_KEY, u32ToBytes(DEFAULT_COUNTER_VALUE));

  return [];
}

/**
 * Get the current counter value (u32)
 */
export function counter(_binaryArgs: StaticArray<u8>): StaticArray<u8> {
  return Storage.get(COUNTER_KEY);
}

/**
 * Increment the counter by the given number
 *
 * @param binaryArgs - serialized args with following argument:
 *  - u32 increment: the number to increment
 */
export function increment(binaryArgs: StaticArray<u8>): StaticArray<u8> {
  const increment: u32 = new Args(binaryArgs)
    .nextU32()
    .expect('Increment argument is invalid');

  const currentValue: u32 = getCounterValue();
  const newValue: u32 = currentValue + increment;
  Storage.set(COUNTER_KEY, u32ToBytes(newValue));

  generateEvent('New counter value: ' + newValue.toString());

  return [];
}

/**
 * Trigger the current value of the counter in an event
 */
export function triggerValue(_: StaticArray<u8>): StaticArray<u8> {
  const currentValue: u32 = getCounterValue();

  generateEvent('Current counter value: ' + currentValue.toString());

  return [];
}
