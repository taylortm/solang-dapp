import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import React from "react";
import { useEffect } from "react";

declare var window: any

const {
    PublicKey,
  } = require("@solana/web3.js");
  const {
    Contract,
  } = require("@solana/solidity");

  const ABI = require("../../contracts/Contract.json");  
  const bs58 = require("bs58");
  const utils = require("web3-utils");
  const bytes32 = require("bytes32");

export default function Transfer() {
    const wallet = useWallet();
    const { connection } = useConnection();
    // const provider = new Connection('https://api.devnet.solana.com');

    useEffect(()=> {
        (async () => {
            if(wallet.publicKey != null) {
                const provider = window.solana;
                // console.log(wallet.publicKey);
                // console.log(provider.publicKey);
                const payer = { publicKey: provider.publicKey, secretKey: null }
                const contract = new Contract(
                    provider,
                    new PublicKey(process.env.REACT_CONTRACT_ADDRESS),
                    new PublicKey(process.env.REACT_STORAGE_ADDRESS),
                    ABI,
                    payer                    
                );
                console.log(contract);
                try {
                    // let response = await contract.functions.getBalance();
                    // console.log(response);
                    console.log("creating transaction....");
                    //remove {value: 100} and the transaction will succeed.
                    const transaction = await contract.transactions.buy({value: 100});
                    console.log(transaction);

                    console.log("getting recent blockhash...");
                    // Add recent blockhash and fee payer
                    const recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
                    transaction.recentBlockhash = recentBlockhash;
                    transaction.feePayer = provider.publicKey;

                    console.log(transaction);
                    console.log("signing transaction...");
                    // const resp = await provider.signAndSendTransaction(transaction.serialize());
                    // console.log(resp);

                    const signed = await provider.request({
                        method: 'signTransaction',
                        params: {
                        message: bs58.encode(transaction.serializeMessage()),
                        },
                    });
                    console.log(signed);
                    
                    const signature = bs58.decode(signed.signature);
                    transaction.addSignature(provider.publicKey, signature);
                    console.log("signed transaction:");
                    console.log(transaction);

                    // see: https://stackoverflow.com/questions/71721805/debugging-transaction-simulation-failed-when-sending-program-instruction-sola
                    console.log("sending transaction...");
                    const transaction_resp = await connection.sendRawTransaction(transaction.serialize())
                    console.log(transaction_resp);
                } catch (e) {
                console.log(e);
                }
            }

        })();      
    }, [wallet?.publicKey]);

    return(<div>Hello</div>);
}