const {
  Connection,
  LAMPORTS_PER_SOL,
  clusterApiUrl,
  Keypair,
  PublicKey,
} = require("@solana/web3.js");
const { Contract, Program } = require("@solana/solidity");
const { readFileSync } = require("fs");

const ABI = JSON.parse(
  readFileSync("./contracts/Contract.abi", "utf8")
);
const PROGRAM_SO = readFileSync("./contracts/bundle.so");
const bs58 = require("bs58");

async function sleep(time) {
  return new Promise((res) => setTimeout(res, time));
}

function random(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

require("dotenv").config();

(async function () {
  console.log("Connecting to Solana node ...");
  const connection = new Connection(
    clusterApiUrl(process.env.REACT_SOLANA_NETWORK),
    "confirmed"
  );

  const payer = Keypair.generate();
  // const payer = Keypair.fromSecretKey(
  //   bs58.decode(process.env.REACT_PAYER_SECRET)
  // );

  console.log("Airdropping 10 SOL to payer's wallet ...");
  for (let i = 0; i < 10; i++) {
    try {
      let signature = await connection.requestAirdrop(
        payer.publicKey,
        LAMPORTS_PER_SOL
      );
      await connection.confirmTransaction(signature, "confirmed");
    } catch (e) {
      //
    }
    await sleep(30000);
  }
  try {
    let signature = await connection.requestAirdrop(
      payer.publicKey,
      LAMPORTS_PER_SOL * 10
    );
    await connection.confirmTransaction(signature, "confirmed");
  } catch (e) {
    //
  }
  await sleep(5000);

  try {
    let payerBalance = await connection.getBalance(payer.publicKey);
    console.log(
      "Payer SOL Balance:",
      (payerBalance / LAMPORTS_PER_SOL).toFixed(2)
    );

    const program = Keypair.generate();
    const storage = Keypair.generate();

    let contract = new Contract(
      connection,
      program.publicKey,
      storage.publicKey,
      ABI,
      payer
    );
    await contract.load(program, PROGRAM_SO);

    console.log("Contract loaded. Deploying the Contract...");
    let contractLength = PROGRAM_SO.byteLength;
    let deploy_result = await contract.deploy(
      "Contract",
      [],
      program,
      storage,
      contractLength * 2,
      { maxRetries: 20 }
    );

    console.log("Finished!");
    console.log("");
    console.log("Deploy Results");
    console.log("-----------------------");
    console.log(deploy_result);
    console.log("Addresses");
    console.log("-----------------------");
    console.log("Contract:", program.publicKey.toString());
    console.log("private:", bs58.encode(program.secretKey));
    console.log("Storage:", storage.publicKey.toString());
    console.log("private:", bs58.encode(storage.secretKey));
    console.log("Payer", payer.publicKey.toString());
    console.log("private:", bs58.encode(payer.secretKey));
    console.log("");
    console.log("Tests");
    console.log("-----------------------");
    const balance = await contract.functions.getBalance();
    console.log("Contract.getBalance():", balance);
    let finalBalance = await connection.getBalance(payer.publicKey);
    let cost = (payerBalance - finalBalance) / LAMPORTS_PER_SOL;
    if (cost > 0) {
      console.log("Deploy Cost:", cost);
    }
  } catch (e) {
    console.log(e);
  }
})();
