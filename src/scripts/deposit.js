const {
  Connection,
  clusterApiUrl,
  Keypair,
  PublicKey,
} = require("@solana/web3.js");
const {
  Contract,
} = require("@solana/solidity");
const { readFileSync } = require("fs");

const ABI = JSON.parse(
  readFileSync("./contracts/Contract.abi", "utf8")
);
const PROGRAM_SO = readFileSync("./contracts/bundle.so");
const bs58 = require("bs58");
const web3 = require("web3");
const utils = require("web3-utils");
const bytes32 = require("bytes32");

require("dotenv").config();

(async function () {
  // connect to solana node
  const connection = new Connection(
    clusterApiUrl(process.env.REACT_SOLANA_NETWORK),
    "confirmed"
  );

  // Get payer secret key from our .env
  const payer = Keypair.fromSecretKey(
    bs58.decode(process.env.REACT_PAYER_SECRET)
  );

  // use contract addresses that were deployed already (.env)
  const contract = new Contract(
    connection,
    new PublicKey(process.env.REACT_CONTRACT_ADDRESS),
    new PublicKey(process.env.REACT_STORAGE_ADDRESS),
    ABI,
    payer
  );

  console.log("getting Total...");

  try {
    let total_resp = await contract.functions.getMyTotal();
    const total = utils.fromWei(total_resp.result.toString(), "ether");
    console.log(total);
  } catch (e) {
    console.log(e);
  }

  console.log("buying...");

  let transaction;
  try {
    // remove {value: 100} and this will work.
    transaction = await contract.transactions.buy({value: 100});
    // console.log(transaction);
  } catch (e) {
    console.log(e);
  }

  // Add recent blockhash and fee payer
  const recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
  transaction.recentBlockhash = recentBlockhash;
  transaction.feePayer = payer.publicKey;

  console.log("sending transaction...")
  // Sign and send the transaction (throws an error). but works if you remove {value: 100} above.
  const res = await connection.sendTransaction(transaction, [payer])
  console.log("res: " + res);

})();
