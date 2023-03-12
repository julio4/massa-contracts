import React, { useState, useEffect } from 'react';
import Head from 'next/head'

import {
  Client,
  ClientFactory,
  DefaultProviderUrls,
  IAccount,
  IContractReadOperationResponse,
  ICallData,
  Args,
  fromMAS,
  IEventFilter,
  EventPoller,
  ON_MASSA_EVENT_DATA,
  ON_MASSA_EVENT_ERROR,
  IEvent,
  EOperationStatus
} from '@massalabs/massa-web3';

const MAX_U32 = 4294967295
const baseContractAddress = 'AS1PeivdWQnLpYUDnwu2quPRPYeVkqoSoaLfoYPeeU7Tbx7KfS2W';
const baseAccount: IAccount = {
  publicKey: "P12SyvyMh5yYrCAzEvmd5rTBwk2YzfAu4oubQWKovpZDAp8rQcT6",
  secretKey: "S12CNv2yYcY698YZpgujhJsKDK4NDQRU2aVRY5mSij3XBnY6nQp5",
  address: "AU1uo8FLtwvP7FkKMB6VqiT4UsVnnxbUrsDPFiJDjCLqw4MvcnUw",
};

const compactStr = (str: string, n?: number) => {
  if (!n) n = 4;
  return str.slice(0, n) + '...' + str.slice(-n);
}

type Status = 'success' | 'error' | 'info';
type Notification = {
  message: string;
  type: Status
}

export default function Home() {
  const [web3Client, setWeb3Client] = useState<Client>();

  const [counter, setCounter] = useState<number>();
  const [incrementInput, setIncrementInput] = useState<number>(1);

  const [events, setEvents] = useState<Array<IEvent>>([]);
  const [notifications, setNotifications] = useState<Array<Notification>>([]);
  const [transactions, setTransactions] = useState<Array<string>>([]);

  const sendNotification = (message: string, type: Status) => {
    setNotifications((prevNotifications) => [
      ...prevNotifications,
      {
        message,
        type
      }
    ]);
  }

  const increment = async (increment: number) => {
    // assert increment is unsigned32
    if (increment < 0 || increment > MAX_U32) {
      throw new Error('increment must be unsigned32');
    }

    const data = await web3Client?.smartContracts()
      .callSmartContract({
        fee: 0n,
        maxGas: 200000n,
        coins: fromMAS("0"),
        targetAddress: baseContractAddress,
        functionName: "increment",
        parameter: new Args().addU32(increment).serialize(),
      } as ICallData,
        baseAccount
      );

    if (!data) throw new Error('No transaction data returned');
    sendNotification(`Increment transaction sent: ${data}`, 'success');

    await web3Client?.smartContracts()
      .awaitRequiredOperationStatus(
        data,
        EOperationStatus.FINAL
      )
    sendNotification(`Transaction confirmed!`, 'success');
    setTransactions((prevTransactions) => [...prevTransactions, data]);
    getCounter().then((counter) => setCounter(counter));
  }

  const getCounter = async (): Promise<number> => {
    const data: IContractReadOperationResponse | undefined =
      await web3Client?.smartContracts()
        .readSmartContract({
          fee: 0n,
          maxGas: 20000000n,
          targetAddress: baseContractAddress,
          targetFunction: "counter",
          parameter: new Args().serialize(),
        });

    return new Args(data?.returnValue).nextU32()
  }

  const triggerValue = async () => {
    const data = await web3Client?.smartContracts()
      .callSmartContract({
        fee: 0n,
        maxGas: 20000000n,
        coins: fromMAS("0"),
        targetAddress: baseContractAddress,
        functionName: "triggerValue",
        parameter: new Args().serialize(),
      } as ICallData,
        baseAccount
      );

    if (!data) throw new Error('No transaction data returned');
    sendNotification(`Trigger value transaction sent: ${data}`, 'success');

    await web3Client?.smartContracts()
      .awaitRequiredOperationStatus(
        data,
        EOperationStatus.FINAL
      )
    sendNotification(`Transaction confirmed!`, 'success');
    setTransactions((prevTransactions) => [...prevTransactions, data]);
    getCounter().then((counter) => setCounter(counter));
  }

  const onEvent = (events: Array<IEvent>) => {
    setEvents((prevEvents) => [...prevEvents, ...events]);
    getCounter().then((counter) => setCounter(counter));

    events.forEach((event) => {
      sendNotification(`Event received: "${event.data}"`, 'info');
    });
  };

  const onEventError = (error: Error) => {
    console.log("Event Data Error:", error);
    sendNotification(`Error while recieving event: ${error}`, 'error');
  };

  const init = async () => {
    const web3Client = await ClientFactory.createDefaultClient(
      DefaultProviderUrls.TESTNET,
      false,
      baseAccount,
    );
    setWeb3Client(web3Client);
  };

  // init on load
  useEffect(() => {
    init().catch((error) => {
      console.error("Init error", error)
      sendNotification(`Error on page initialization: ${error}`, 'error');
    });
  }, []);

  // get counter value on load
  // subscribe to events
  useEffect(() => {
    if (!web3Client) return;

    getCounter()
      .then((counter) => setCounter(counter))
      .catch((error) => {
        console.error("Contract read error", error)
        sendNotification(`Error on contract read: ${error}`, 'error');
      });

    // poll smart contract events
    const eventsFilter = {
      start: null,
      end: null,
      original_caller_address: baseContractAddress,
      original_operation_id: null,
      emitter_address: null,
      is_final: true,
    } as IEventFilter;

    const eventPoller = EventPoller.startEventsPolling(
      eventsFilter,
      1000,
      web3Client
    );

    eventPoller.on(ON_MASSA_EVENT_DATA, onEvent);
    eventPoller.on(ON_MASSA_EVENT_ERROR, onEventError);
  }, [web3Client]);

  return (
    <>
      <Head>
        <title>Massa Counter Dapp</title>
        <meta name="description" content="Massa Counter Dapp" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen flex">

        <div className="flex-1">
          <div className='flex flex-col gap-10 items-center justify-center min-h-screen'>
            <h1 className="text-5xl font-bold">Massa Counter Dapp</h1>

            <div className="stats bg-primary text-primary-content">

              <div className="stat">
                <div className="stat-title">Counter</div>
                <div className="stat-value countdown">
                  <span style={{ "--value": counter }}></span>
                </div>
                <div className="stat-actions">
                  <button
                    className="btn btn-sm btn-success hover:scale-[1.01]"
                    onClick={() => triggerValue()}
                  >Trigger Value</button>
                </div>
              </div>

              <div className="stat">
                <div className="stat-title">Increment by</div>
                <div className="stat-value countdown">
                  <span style={{ "--value": incrementInput }}></span>
                </div>
                <div className="stat-actions">
                  <button
                    className="btn btn-sm hover:scale-[1.01]"
                    onClick={() => increment(incrementInput)}
                  >
                    Confirm
                  </button>
                </div>
              </div>

            </div>

            <div className="flex flex-row gap-4 items-center justify-center">
              <button
                onClick={() => {
                  if (incrementInput > 1)
                    setIncrementInput(incrementInput - 1)
                }}
                className={`btn btn-square text-3xl ${incrementInput == 1 ? 'btn-disabled' : ''}`}
              >
                -
              </button>
              <button
                onClick={() => setIncrementInput((incrementInput + 1) % MAX_U32)}
                className="btn btn-square text-3xl"
              >
                +
              </button>
            </div>

          </div>
        </div>

        <div className="flex-1">
          <div className='flex flex-col gap-4 items-center justify-center min-h-screen p-4'>

            {events.length > 0 && (
              <div className="overflow-x-auto w-full">
                <h1 className="text-xl font-bold">Events</h1>
                <table className="table w-full">
                  <thead>
                    <tr>
                      <th>Operation ID</th>
                      <th>Block</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events
                      .filter((event) => event.context.is_final)
                      .map((event, index) => (
                        <tr key={index}>
                          <th className="z-0 !static">
                            <span
                              className="cursor-pointer"
                              onClick={
                                () => navigator.clipboard.writeText(event.context.origin_operation_id ?? '')
                              }
                            >
                              {compactStr(event.context.origin_operation_id ?? '')}
                            </span>
                          </th>
                          <td>
                            <span
                              className="cursor-pointer"
                              onClick={
                                () => navigator.clipboard.writeText(event.context.block ?? '')
                              }
                            >
                              {compactStr(event.context.block ?? '')}
                            </span>
                          </td>
                          <td>{event.data}</td>
                        </tr>
                      )
                      )}
                  </tbody>
                </table>
              </div>
            )}

            {transactions.length > 0 && (
              <div className="overflow-x-auto w-full">
                <h1 className="text-xl font-bold">Transactions</h1>
                <table className="table w-full">
                  <thead>
                    <tr>
                      <th></th>
                      <td>Operation ID</td>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions
                      .map((tx, index) => (
                        <tr key={index}>
                          <th className="z-0 !static"></th>
                          <td>
                            <span
                              className="cursor-pointer"
                              onClick={() => navigator.clipboard.writeText(tx)}
                            >
                              {tx}
                            </span>
                          </td>
                        </tr>
                      )
                      )}
                  </tbody>
                </table>
              </div>
            )}

          </div>
        </div>
      </div>

      <div className="toast">
        {notifications.map((notification, index) => (
          <div
            onClick={() => setNotifications(
              (prevNotifications) => prevNotifications.filter((_, i) => i !== index)
            )}
            key={index}
            className={`z-40 transition-all cursor-pointer hover:scale-[1.01] alert alert-${notification.type}`}
          >
            <div>
              <span>{notification.message}</span>
            </div>
          </div>
        )
        )}
      </div>
    </>
  )
}
