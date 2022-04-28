const {
  Connection,
  LAMPORTS_PER_SOL,
  clusterApiUrl,
  Keypair,
  PublicKey,
} = require("@solana/web3.js");
const { Contract, Program, publicKeyToHex } = require("@solana/solidity");
const { readFileSync } = require("fs");

const BEANS_ABI = JSON.parse(
  readFileSync("./contracts/BakedBeans.abi", "utf8")
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
    clusterApiUrl(process.env.SOLANA_NETWORK),
    "confirmed"
  );

  // Get dev wallet/payer from our .env
  const payer = Keypair.fromSecretKey(
    bs58.decode(process.env.DEV_WALLET_SECRET)
  );

  // use contract addresses that were deployed already (.env)
  const contract = new Contract(
    connection,
    new PublicKey(process.env.BAKED_BEANS_ADDRESS),
    new PublicKey(process.env.STORAGE_ADDRESS),
    BEANS_ABI,
    payer
  );

  response = await contract.functions.getBalance();
  const contractBalance = utils.fromWei(response.result.toString(), "ether");

  let payerBalance = await connection.getBalance(payer.publicKey);

  response = await contract.functions.getMyMiners(payer.publicKey.toBytes());
  let totalBeans = utils.fromWei(response.result.toString(), "ether");

  response = await contract.functions.getMyEggs(payer.publicKey.toBytes());
  let claimable = utils.fromWei(response.result.toString(), "ether");

  console.log("Baked Beans (uint256) v2.0");
  console.log("---------------------");
  console.log("Contract balance:", parseFloat(contractBalance));
  console.log("My balance:", payerBalance / LAMPORTS_PER_SOL);
  console.log("Beans:", totalBeans);
  console.log("Claimable:", claimable);
})();
