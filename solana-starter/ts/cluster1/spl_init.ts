import { Keypair, Connection, Commitment } from "@solana/web3.js";
import { createMint } from '@solana/spl-token';
import wallet from "../wba-wallet.json"

// Import our keypair from the wallet file
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

// Create a Solana devnet connection
const commitment: Commitment = "confirmed";
const connection = new Connection("https://api.devnet.solana.com", commitment);

(async () => {
    try {
        // Start here
        const mint = await createMint(connection, keypair, keypair.publicKey, null, 6);
        console.log(mint.toBase58());
        // 59gym4SfnYb4GiwxNN87vStHL1PrcCXgH4edFxPTeNGk
    } catch(error) {
        console.log(`Oops, something went wrong: ${error}`)
    }
})()

// createMint keypair parameter
// There's an optional keypair parameter in createMint in case you want to supply your own keypair
// for example: if you've created a vanity keypair via solana-keygen grind you'd like to use

// createMint decimals parameter
// 6 decimals -> 6 digits to the right of the decimal place -> smallest amount 0.000001 -> 1 token = 1000000 lamports (the amount in mint, transfer, etc is in lamports)