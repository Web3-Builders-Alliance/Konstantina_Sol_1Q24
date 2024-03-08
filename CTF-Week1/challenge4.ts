import { Connection, Keypair, SystemProgram, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js"
import { Program, Wallet, AnchorProvider, Address, BN } from "@project-serum/anchor"
import { Week1, IDL } from "./programs/week1";
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";
import {
    MPL_TOKEN_METADATA_PROGRAM_ID as TOKEN_METADATA_PROGRAM_ID
  } from '@metaplex-foundation/mpl-token-metadata';

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

// Paste here the mint address for challenge1 token
const mint = new PublicKey("5sGR3dAi53LRtLoVr6wLRDA4eePQGUANzy8wqu6Fip93");

// Create the PDA for the Challenge1 Vault
const vault = PublicKey.findProgramAddressSync([Buffer.from("vault4"), keypair.publicKey.toBuffer(), mint.toBuffer()], program.programId)[0];

const metadata_program = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

// Create PDA for token metadata
const metadata_seeds = [
    Buffer.from('metadata'),
    metadata_program.toBuffer(),
    mint.toBuffer(),
];
const metadata = PublicKey.findProgramAddressSync(metadata_seeds, metadata_program)[0];

(async () => {

        // NB if you get TokenAccountNotFoundError, wait a few seconds and try again!

        // Create the ATA for your Wallet
        const ownerAta = getOrCreateAssociatedTokenAccount(
          connection,
          keypair,
          mint,
          keypair.publicKey
      );

        // Mint some tokens!
        const mintTx = await mintTo(
          connection,
          keypair,
          mint,
          (await ownerAta).address,
          keypair,
          100000000
        );

        // Complete the Challenge!
        const completeTx = await program.methods.completeChallenge4()
        .accounts({
            owner: keypair.publicKey,
            ata: (await ownerAta).address,
            profile: profilePda,
            vault: vault,
            metadata: metadata,
            mint: mint,
            tokenProgram: TOKEN_PROGRAM_ID,
            metadataProgram: metadata_program,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
        })
        .signers([
            keypair
        ]).rpc();

        console.log(`Success! Check out your TX here: https://explorer.solana.com/tx/${completeTx}?cluster=devnet`);
        // https://explorer.solana.com/tx/F6Bkicn2q2DCaS7GJCGL8ZitJEJsromSnR9vjyHmsFUT43TFd7dwU4KkhVpzznf3raw5Ge7VVCmPzkLt3pSQabi?cluster=devnet

})();