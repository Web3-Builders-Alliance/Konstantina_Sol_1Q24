import { Commitment, Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js"
import wallet from "../wba-wallet.json"
import { getOrCreateAssociatedTokenAccount, transfer } from "@solana/spl-token";

// We're going to import our keypair from the wallet file
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

//Create a Solana devnet connection
const commitment: Commitment = "confirmed";
const connection = new Connection("https://api.devnet.solana.com", commitment);

// Mint address
const mint = new PublicKey("59gym4SfnYb4GiwxNN87vStHL1PrcCXgH4edFxPTeNGk");

// Recipient address
const to = new PublicKey("86xCnPeV69n6t3DnyGvkKobf9FdN2H9oiVDdaMpo2MMY");

(async () => {
    try {
        // Get the token account of the fromWallet address, and if it does not exist, create it
        // aren't we sure it exists or how would be sending a token from it?
        const fromAta = await getOrCreateAssociatedTokenAccount(
            connection,
            keypair,
            mint,
            keypair.publicKey,
        );
        // Get the token account of the toWallet address, and if it does not exist, create it
        const toAta = await getOrCreateAssociatedTokenAccount(
            connection,
            keypair,
            mint,
            to,
        );
        // Transfer the new token to the "toTokenAccount" we just created
        const tx = await transfer(
            connection,
            keypair,
            fromAta.address,
            toAta.address,
            keypair,
            1000000 // 1 token (it has 6 decimals)
            // or 1_000_000 or 1e6
        );
        console.log(tx);
    } catch(e) {
        console.error(`Oops, something went wrong: ${e}`)
    }
})();