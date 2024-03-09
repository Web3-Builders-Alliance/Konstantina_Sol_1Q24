import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { VaultA } from "../target/types/vault_a";
import { Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram } from "@solana/web3.js"; // this is already included in anchor: anchor.web3

describe("vault-a", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.VaultA as Program<VaultA>;

  const connection = anchor.getProvider(). connection;

  const maker = Keypair.generate(); // we could just use the wallet on our anchor provider too
  const taker = Keypair.generate();

  const vault = PublicKey.findProgramAddressSync(
    [
      Buffer.from("vault"),
      maker.publicKey.toBuffer(),
    ],
    program.programId
  )[0]; // findProgramAddressSync returns the address and the bump, we don't need the bump now

  const vaultState = PublicKey.findProgramAddressSync(
    [
      Buffer.from("VaultState"),
      maker.publicKey.toBuffer(),
    ],
    program.programId
  );

  const confirm = async (signature: string): Promise<string> => {
    const block = await connection.getLatestBlockhash();
    await connection.confirmTransaction({
      signature,
      ...block,
    });
    return signature;
  };

  const log = async (signature: string): Promise<string> => {
    console.log(
      `Your transaction signature: https://explorer.solana.com/transaction/${signature}?cluster=custom&customUrl=${connection.rpcEndpoint}`
    );
    return signature;
  };

  it("Airdrop", async () => {
    await connection
      .requestAirdrop(maker.publicKey, LAMPORTS_PER_SOL * 10)
      .then(confirm)
      .then(log);
    await connection
      .requestAirdrop(taker.publicKey, LAMPORTS_PER_SOL * 10)
      .then(confirm)
      .then(log);
  });

  it("Is initialized!", async () => {
    // Add your test here.
    // console.log(vaultState[1]) // 254, 253, ...
    const tx = await program.methods.initialize().accounts({
      maker: maker.publicKey,
      vaultState: vaultState[0],
      vault,
      taker: taker.publicKey,
      systemProgram: SystemProgram.programId
    })
    .signers([maker])
    .rpc()
    .then(confirm)
    .then(log);
  });

  it("Can deposit!", async () => {
    const tx = await program.methods
    .deposit(new anchor.BN(LAMPORTS_PER_SOL)) // deposit 1 sol
    .accounts({
      vault,
      maker: maker.publicKey,
      vaultState: vaultState[0],
      systemProgram: SystemProgram.programId
    })
    .signers([maker])
    .rpc()
    .then(confirm)
    .then(log);
  });

  it("Can withdraw!", async () => {
    const tx = await program.methods
    .withdraw()
    .accounts({
      vault,
      taker: taker.publicKey,
      maker: maker.publicKey,
      vaultState: vaultState[0],
      systemProgram: SystemProgram.programId
    })
    .signers([taker])
    .rpc()
    .then(confirm)
    .then(log);
  });

  it("Can cancel!", async () => {
    const tx = await program.methods.cancel().accounts({
      vault,
      maker: maker.publicKey,
      vaultState: vaultState[0],
      systemProgram: SystemProgram.programId
    })
    .signers([maker])
    .rpc()
    .then(confirm)
    .then(log);
  });
});
