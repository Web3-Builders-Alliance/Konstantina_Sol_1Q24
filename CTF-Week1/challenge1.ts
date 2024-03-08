import { Connection, Keypair, SystemProgram, PublicKey } from "@solana/web3.js"
import { Program, Wallet, AnchorProvider, Address, BN } from "@project-serum/anchor"
import { Week1, IDL } from "./programs/week1";
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, createMint, getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";

import wallet from "./wallet/wba-wallet.json"

// We're going to import our keypair from the wallet file
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

// Create a devnet connection
const connection = new Connection("https://api.devnet.solana.com");

// Create our anchor provider
const provider = new AnchorProvider(connection, new Wallet(keypair), { commitment: "finalized"});

// Create our program
const program = new Program<Week1>(IDL, "ctf1VWeMtgxa24zZevsXqDg6xvcMVy4FbP3cxLCpGha" as Address, provider);

// Use the PDA for our CTF-Week1 profile
const profilePda = PublicKey.findProgramAddressSync([Buffer.from("profile"), keypair.publicKey.toBuffer()], program.programId)[0];

// Paste here the mint address for challenge1 token
const mint = new PublicKey("5UGWvjpcq9R8ghG4BZSGivY8xSZde93CmuduUMEnAuab");

// Create the PDA for the Challenge1 Vault
const vault = PublicKey.findProgramAddressSync([Buffer.from("vault1"), keypair.publicKey.toBuffer(), mint.toBuffer()], program.programId)[0];

(async () => {
    try {

        // NB if you get TokenAccountNotFoundError, wait a few seconds and try again!

        // Create the ATA for mint for your Wallet
        const ownerAta = getOrCreateAssociatedTokenAccount(
            connection,
            keypair,
            mint,
            keypair.publicKey,
        );

        // Mint some tokens!
        const mintTx = await mintTo(
            connection,
            keypair,
            mint,
            (await ownerAta).address,
            keypair,
            1, // 1 of the smallest fraction is 0.00000000000001 tokens bc we have 14 decimals
        );

        console.log(`Success! Check out your TX here: https://explorer.solana.com/tx/${mintTx}?cluster=devnet`);
            // https://explorer.solana.com/tx/3DvUoAtTYUGyQ5pZY3pdn6mPxFTNJsaFUvP3evAvwAsEPF6Z8ouXrMGbWfeZH1y9298m1ths1LLr8Zkvdyhg5DnG?cluster=devnet

        // Complete the Challenge!
        const completeTx = await program.methods
            .completeChallenge1(new BN(1))
            .accounts({
                owner: keypair.publicKey,
                ata: (await ownerAta).address,
                profile: profilePda,
                vault: vault,
                mint: mint,
                tokenProgram: TOKEN_PROGRAM_ID,
                associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                systemProgram: SystemProgram.programId
            })
            .signers([
                keypair
            ]).rpc();

        console.log(`Success! Check out your TX here:
            https://explorer.solana.com/tx/${completeTx}?cluster=devnet`);
            // https://explorer.solana.com/tx/3MD3255L2LQJug21Za2ijKApVmnpP7Jm4cHjZgZpV1KdVKkwnYCL29zkFV9chZg9VWjj32p81e12fAM9QCbZGG1P?cluster=devnet

    } catch(e) {
        console.error(`Oops, something went wrong: ${e}`)
    }
})();