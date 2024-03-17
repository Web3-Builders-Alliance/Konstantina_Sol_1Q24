import * as anchor from "@coral-xyz/anchor";
import { BN, Program } from "@coral-xyz/anchor";
import { Escrow } from "../target/types/escrow";
import { Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram } from "@solana/web3.js";
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, createMint, getAssociatedTokenAddressSync, getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";
import { randomBytes } from "crypto";
import { assert } from "chai";

describe("escrow", () => {
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.Escrow as Program<Escrow>;

  const connection = anchor.getProvider().connection;

  const maker = Keypair.generate();
  const taker = Keypair.generate();

  const seed = new BN(randomBytes(8));

  let mintX; // they need to be initialized in an async function but we declare them
  let mintY; // here so we can access them in all tests
  // should do this with the ATAs too

  const escrow = PublicKey.findProgramAddressSync(
    [
      Buffer.from("escrow"),
      maker.publicKey.toBuffer(),
      seed.toBuffer("le", 8)
    ],
    program.programId
  )[0];

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

  it("airdrop", async () => {
    await connection
      .requestAirdrop(maker.publicKey, LAMPORTS_PER_SOL * 100)
      .then(confirm)
      .then(log);

    await connection
      .requestAirdrop(taker.publicKey, LAMPORTS_PER_SOL * 10)
      .then(confirm)
      .then(log);
  });

  it("maker can create escrow and deposit 1 X token", async () => {
    mintX = await createMint(connection, maker, maker.publicKey, null, 6);
    mintY = await createMint(connection, maker, maker.publicKey, null, 6);

    const makerAtaX = await getOrCreateAssociatedTokenAccount(connection, maker, mintX, maker.publicKey);
    const makerAtaY = await getOrCreateAssociatedTokenAccount(connection, maker, mintY, maker.publicKey);

    await mintTo(connection, maker, mintX, makerAtaX.address, maker, 1000000); // minted exactly as many mintX tokens as I need

    // const vault = await getOrCreateAssociatedTokenAccount(connection, maker, mintX, escrow, true);
    const vault = getAssociatedTokenAddressSync(mintX, escrow, true); // the owner of the vault is a PDA (the escrow)

    // console.log(await connection.getBalance(maker.publicKey));

    const tx = await program.methods
      .make(new BN(1000000), seed)
      .accounts({
        maker: maker.publicKey,
        escrow,
        mintX,
        mintY,
        vault: vault,
        makerAtaX: makerAtaX.address,
        makerAtaY: makerAtaY.address,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId
      })
      .signers([maker])
      .rpc()
      .then(confirm)
      .then(log)
    });

  // if you want not to skip this you need to make again an escrow for the take test
  xit("maker can close the escrow and get refunded", async () => {
    const makerAtaX = await getOrCreateAssociatedTokenAccount(connection, maker, mintX, maker.publicKey);

    // console.log("mintX", mintX, "escrow", escrow)
    const vault = getAssociatedTokenAddressSync(mintX, escrow, true);

    const tx = await program.methods
      .refund()
      .accounts({
        maker: maker.publicKey,
        mintX,
        mintY,
        vault,
        escrow,
        makerAtaX: makerAtaX.address,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId
      })
      .signers([maker])
      .rpc()
      .then(confirm)
      .then(log)

      // Assert that the maker has 1 token X at their wallet (their whole deposit)
      const makerFinalXBalance = await connection.getTokenAccountBalance(makerAtaX.address);
      assert.equal(makerFinalXBalance.value.uiAmount, 1);
      // assert.equal(makerFinalXBalance.value.amount, String(1000000));
    });

  it("taker can take the escrow", async () => {
    const makerAtaX = await getOrCreateAssociatedTokenAccount(connection, maker, mintX, maker.publicKey);
    const makerAtaY = await getOrCreateAssociatedTokenAccount(connection, maker, mintY, maker.publicKey);
    const takerAtaX = await getOrCreateAssociatedTokenAccount(connection, maker, mintX, taker.publicKey);
    const takerAtaY = await getOrCreateAssociatedTokenAccount(connection, maker, mintY, taker.publicKey);

    const vault = getAssociatedTokenAddressSync(mintX, escrow, true);

    // mint Y token to taker's ATA
    await mintTo(connection, taker, mintY, takerAtaY.address, maker, 1000000);

    const tx = await program.methods
      .take()
      .accounts({
        taker: taker.publicKey,
        maker: maker.publicKey,
        escrow,
        mintX,
        mintY,
        vault,
        makerAtaX: makerAtaX.address,
        makerAtaY: makerAtaY.address,
        takerAtaX: takerAtaX.address,
        takerAtaY: takerAtaY.address,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId
      })
      .signers([taker])
      .rpc()
      .then(confirm)
      .then(log)

      // Assert that the taker has 1 token X at their wallet
      const takerFinalXBalance = await connection.getTokenAccountBalance(takerAtaX.address);
      assert.equal(takerFinalXBalance.value.uiAmount, 1);

      // Assert that the maker has 1 token Y at their wallet
      const makerFinalYBalance = await connection.getTokenAccountBalance(makerAtaY.address);
      assert.equal(makerFinalYBalance.value.uiAmount, 1);
    });
});
