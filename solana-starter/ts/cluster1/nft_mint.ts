import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import { createSignerFromKeypair, signerIdentity, generateSigner, percentAmount } from "@metaplex-foundation/umi"
import { createNft, mplTokenMetadata, CreateV1InstructionDataArgs } from "@metaplex-foundation/mpl-token-metadata";

import wallet from "../wba-wallet.json"
import base58 from "bs58";

const RPC_ENDPOINT = "https://api.devnet.solana.com";
const umi = createUmi(RPC_ENDPOINT);

let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const myKeypairSigner = createSignerFromKeypair(umi, keypair);
umi.use(signerIdentity(myKeypairSigner));
umi.use(mplTokenMetadata())

const mint = generateSigner(umi);

(async () => {
    // const myNft : CreateV1InstructionDataArgs = {
    //     name: "Konstantina's Rug", // it may or may not be the same as the one in the metadata but
    //     // we probably want it to be the same as it's an on-chain representation of the same stuff
    //     symbol: "RUG",
    //     uri: "https://arweave.net/6cTow07jzRzGZg-evOdFvR9Gdmoyw9pL7wOU9fEEXTg",
    //     sellerFeeBasisPoints: percentAmount(1,2),
    //     creators: null, // will be completed with my wallet?
    //     tokenStandard: 0, // it's an enum and NonFungible is 0
    // };

    // let tx = await createNft(umi, myNft);
    // this didn't work

    let tx = await createNft(umi, {
        mint,
        name: "Konstantina's Rug",
        symbol: "RUG",
        uri: "https://arweave.net/6cTow07jzRzGZg-evOdFvR9Gdmoyw9pL7wOU9fEEXTg", // the metadata uri ofc
        sellerFeeBasisPoints: percentAmount(1,2)
    })
    let result = await tx.sendAndConfirm(umi);
    const signature = base58.encode(result.signature);

    console.log(`Succesfully Minted! Check out your TX here:\nhttps://explorer.solana.com/tx/${signature}?cluster=devnet`)
    // https://explorer.solana.com/tx/ZSNw5kjev6d1ZM6bLLN6LWdamkRe4wwE9cCesdyT56P4qGFoKQud3F4j5znhdEdePFMitVfCBxyNSFiKvGinHsy?cluster=devnet

    console.log("Mint Address: ", mint.publicKey); // 5jJnRhKAMBmMjoBUx1vfzG3FzNyZqsLc3nSMTqJZeJNG
})();