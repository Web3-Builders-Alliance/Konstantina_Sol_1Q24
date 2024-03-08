import { Connection, Keypair, SystemProgram, PublicKey } from "@solana/web3.js"
import { Program, Wallet, AnchorProvider, Address, BN } from "@project-serum/anchor"
import { Week1, IDL } from "./programs/week1";
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";

import wallet from "./wallet/wba-wallet.json"

// We're going to import our keypair from the wallet file
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

// Create a devnet connection
const connection = new Connection("https://api.devnet.solana.com");

// Create our anchor provider
const provider = new AnchorProvider(connection, new Wallet(keypair), { commitment: "confirmed"});

// Create our program
const program = new Program<Week1>(IDL, "ctf1VWeMtgxa24zZevsXqDg6xvcMVy4FbP3cxLCpGha" as Address, provider);

// Use the PDA for our CTF-Week1 profile
const profilePda = PublicKey.findProgramAddressSync([Buffer.from("profile"), keypair.publicKey.toBuffer()], program.programId)[0];

// Paste here the mint address for challenge2 token
const mint = new PublicKey("7Ar8XdwcrWh6JKGNFxpvwbmDc8Jx7YnHWUeQPJRpBzvn");

// Create the PDA for the Challenge2 Vault
const vault = PublicKey.findProgramAddressSync([Buffer.from("vault2"), keypair.publicKey.toBuffer(), mint.toBuffer()], program.programId)[0];

(async () => {
    try {

        // NB if you get TokenAccountNotFoundError, wait a few seconds and try again!

        // Create the ATA for your Wallet
        const ownerAta = getOrCreateAssociatedTokenAccount(
            connection,
            keypair,
            mint,
            keypair.publicKey
        );

        // // Mint some tokens!
        const mintTx = await mintTo(
            connection,
            keypair,
            mint,
            (await ownerAta).address, // I'm minting the tokens to my ATA
            keypair,
            69420 // anything as long as it is > 255 (that's how much we need for the challenge)
        );

        console.log(`Success! Check out your TX here:
        https://explorer.solana.com/tx/${mintTx}?cluster=devnet`);
        // https://explorer.solana.com/tx/3j8mTTP54wbMRKUb5riQhHJE9eHWQWV8zUaRDybb8Axm5Ec2NWX8np37cXd4DvYqjDwZq12H2XtYg1byzUndyqSw?cluster=devnet

        // Complete the Challenge!
        const completeTx = await program.methods.completeChallenge2(new BN(255))
        .accounts({
            owner: keypair.publicKey,
            ata: (await ownerAta).address,
            profile: profilePda,
            vault: vault,
            mint,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId
        })
        .signers([
            keypair
        ]).rpc();

        console.log(`Success! Check out your TX here:
        https://explorer.solana.com/tx/${completeTx}?cluster=devnet`);
        // https://explorer.solana.com/tx/2VcqCGmCHEaWJe46aB95AsJYEnPwR6mckXFCHZeR4Gp3XxTjdFRybL1jNANmuiUp1mHbmNySXtojriA7BKjfQmTu?cluster=devnet
    } catch(e) {
        console.error(`Oops, something went wrong: ${e}`)
    }
})();