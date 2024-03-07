import { Keypair, PublicKey, Connection, Commitment } from "@solana/web3.js";
import { getOrCreateAssociatedTokenAccount, mintTo } from '@solana/spl-token';
import wallet from "../wba-wallet.json"

// Import our keypair from the wallet file
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

//Create a Solana devnet connection
const commitment: Commitment = "confirmed";
const connection = new Connection("https://api.devnet.solana.com", commitment);

const token_decimals = 1_000_000n;

// Mint address
const mint = new PublicKey("59gym4SfnYb4GiwxNN87vStHL1PrcCXgH4edFxPTeNGk");

(async () => {
    try {
        // Create an ATA
        const ata = await getOrCreateAssociatedTokenAccount(
            connection,
            keypair, // so I pay less if I send an amount of a token to someone who already has an ATA for it?
            mint,
            keypair.publicKey,
        )
        console.log(`Your ata is: ${ata.address.toBase58()}`);
        // GdkQu9QxqFNXSd7ZaHxwhSqjEjy6A9C9sZFG1phcnykY

        // Mint to ATA
        const mintTx = await mintTo(
            connection,
            keypair,
            mint,
            ata.address,
            keypair,
            token_decimals * 10n // mint 10 tokens to my ATA
        )
        console.log(`Your mint txid: ${mintTx}`);
        // 3YEhA37wC2ajDMRceqGfaPCXrsUJRR4HxKfyP4XuYGQ14zJwMuMYUEyq6ek7RZTmpsnqBpbmBbmxiu2N9ztqVArm
        // https://solscan.io/tx/3YEhA37wC2ajDMRceqGfaPCXrsUJRR4HxKfyP4XuYGQ14zJwMuMYUEyq6ek7RZTmpsnqBpbmBbmxiu2N9ztqVArm?cluster=devnet
    } catch(error) {
        console.log(`Oops, something went wrong: ${error}`)
    }
})()
