import { Connection, Keypair } from "@solana/web3.js";
import { createMint } from "@solana/spl-token"

import wallet from "./wallet/wba-wallet.json"

//Connect our WBA Wallet
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

//Create a Solana devnet connection to devnet SOL tokens
const connection = new Connection("https://api.devnet.solana.com", {commitment: "confirmed"});

(async () => {

  // AaPVSNu9qRC8BG2SzUr1JS9ZZJS35NHNMSArhV3JVDsz created a token
  // with 6 decimals, minted 250 tokens and sent 0.000255 tokens
  // to complete the challenge

  // I guess I can create a token with 6 decimals and send 255 amount
  // but could also say create one with 7 decimals and send 2550 amount?
  // No - challenge wants to receive 255 amount (lamports)
  // however many decimals the token has
  // I'll do 8

  // Create new token mint
  const mint = await createMint(
    connection,
    keypair,
    keypair.publicKey,
    null,
    8
  );

  console.log(`The unique identifier of the token is: ${mint.toBase58()}`);
  // 7Ar8XdwcrWh6JKGNFxpvwbmDc8Jx7YnHWUeQPJRpBzvn
})();