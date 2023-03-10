import { Address, call, callerHasWriteAccess } from '@massalabs/massa-as-sdk';
import { Args } from '@massalabs/as-types';


/**
 * This function is meant to be called only one time: when the contract is deployed.
 */

export function constructor(binaryArgs: StaticArray<u8>): StaticArray<u8> {
  // This line is important. It ensure that this function can't be called in the future.
  // If you remove this check someone could call your constructor function and reset your SC.
  if (!callerHasWriteAccess()) {
    return [];
  }
  callCounterContract(binaryArgs);
  return [];
}


/**
 * Call the increment function of counter contract
 *
 * @param binaryArgs - The address of the counter contract encoded with `Args` and the increment arg
 * @returns empty array
 */
function callCounterContract(binaryArgs: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(binaryArgs);
  const address = new Address(
    args.nextString().expect('Address argument is missing or invalid'),
  );

  call(
    address,
    'increment',
    new Args().add(args.nextU32().expect('increment argument is missing')),
    0,
  );
  return [];
}
