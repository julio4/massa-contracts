import React, { useState, useRef, useMemo, useEffect } from 'react';
import './App.css';
import { ToastContainer, toast, ToastOptions } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoadingButton from '@mui/lab/LoadingButton';
import type {} from '@mui/lab/themeAugmentation';
import {
    Client,
    ClientFactory,
    DefaultProviderUrls,
    IAccount,
    IContractData,
    INodeStatus,
    WalletClient,
    WebsocketEvent,
} from '@massalabs/massa-web3';
import TextField from '@mui/material/TextField';
import useAsyncEffect from './utils/asyncEffect';
import { WORKER_OPERATION } from './worker/MassaWorker';

export const baseAccountSecretKey = 'S12CNv2yYcY698YZpgujhJsKDK4NDQRU2aVRY5mSij3XBnY6nQp5';
export const baseContractAddress = 'AS1TMvCeKhAD9iDo39Uf1TT2WpqPuM6eVquxwRfkcVWEHuE4J9cm'

export const Dapp: React.FunctionComponent = (): JSX.Element => {
    const [web3Client, setWeb3Client] = useState<Client | null>(null);
    const [nodeStatus, setNodeStatus] = useState<INodeStatus | null>(null);

    const increment = async (increment) => {
        const data: string = await web3Client?.smartContracts().callSmartContract(
            {
                fee: 0n,
                maxGas: 200000n,
                coins: fromMAS("0.1"),
                targetAddress: scAddress,
                functionName: "play",
                parameter: new Args().serialize(), // this is based on input arguments
            } as ICallData,
            baseAccount
        );
    }

    const massaWorker: Worker = useMemo(
        () => new Worker(new URL('./worker/MassaWorker.ts', import.meta.url)),
        [],
    );

    useEffect(() => {
        if (window.Worker) {
            massaWorker.onmessage = (message: MessageEvent<any>) => {
              console.log("onmessage", message)
            };
            massaWorker.onerror = (ev: ErrorEvent) => {
              console.log("onerror", ev)
            };
            setTimeout(() => massaWorker.postMessage(WORKER_OPERATION.RUN), 0);
        }
    }, [massaWorker]);

    useAsyncEffect(async () => {
        try {
            const baseAccount: IAccount = await WalletClient.getAccountFromSecretKey(
                baseAccountSecretKey,
            );
            const web3Client = await ClientFactory.createDefaultClient(
                DefaultProviderUrls.TESTNET,
                true,
                baseAccount,
            );
            const nodeStatus = await web3Client.publicApi().getNodeStatus();
            const wsClient = web3Client.ws();
            if (wsClient) {
                wsClient.on(WebsocketEvent.ON_CLOSED, () => {
                    console.log('ws closed');
                });

                wsClient.on(WebsocketEvent.ON_CLOSING, () => {
                    console.log('ws closing');
                });

                wsClient.on(WebsocketEvent.ON_CONNECTING, () => {
                    console.log('ws connecting');
                });

                wsClient.on(WebsocketEvent.ON_OPEN, () => {
                    console.log('ws open');
                });

                wsClient.on(WebsocketEvent.ON_PING, () => {
                    console.log('ws ping');
                });

                wsClient.on(WebsocketEvent.ON_ERROR, (errorMessage) => {
                    console.error('ws error', errorMessage);
                });
                // connect to ws
                await wsClient.connect();

                // subscribe to new blocks and toast each message
                 //wsClient.subscribeNewBlocks((newBlock) => {
                 //   toast.info(`Block: ${newBlock.header.id.substring(0, 25)}...`, {
                 //       position: 'top-right',
                 //       autoClose: 0,
                 //       hideProgressBar: false,
                 //       closeOnClick: true,
                 //       pauseOnHover: false,
                 //       draggable: true,
                 //       progress: undefined,
                 //       delay: 0,
                 //       bodyStyle: { marginLeft: 0, fontSize: 15, width: 600 },
                 //       theme: 'light',
                 //   } as ToastOptions);
                //});
            }
            setWeb3Client(web3Client);
            setNodeStatus(nodeStatus);
        } catch (error) {
            console.error(error);
        }
    }, []);

    const getNodeOverview = (nodeStatus: INodeStatus | null): JSX.Element => {
        if (!nodeStatus) {
            return <React.Fragment>{"Getting Massa's Node Status..."}</React.Fragment>;
        }
        return (
            <React.Fragment>
                Massa Net Version: {nodeStatus?.version}
                <br />
                Massa Net Node Id: {nodeStatus?.node_id}
                <br />
                Massa Net Node Ip: {nodeStatus?.node_ip}
                <br />
                Massa Net Time: {nodeStatus?.current_time}
                <br />
                Massa Net Cycle: {nodeStatus?.current_cycle}
                <br />
            </React.Fragment>
        );
    };


    return (
        <React.Fragment>
            <ToastContainer />
            {getNodeOverview(nodeStatus)}
            <hr />
            <LoadingButton
                className="massa-button"
                variant="contained"
                color="primary"
            >
                Deploy contract
            </LoadingButton>
            <TextField
                id="op-id"
                type="text"
                label="Operation Id"
                margin="normal"
                fullWidth
                disabled
                className="text-field"
                color="primary"
            />
        </React.Fragment>
    );
};
