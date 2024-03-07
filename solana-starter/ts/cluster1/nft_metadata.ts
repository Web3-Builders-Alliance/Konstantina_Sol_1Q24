import wallet from "../wba-wallet.json"
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import { createGenericFile, createSignerFromKeypair, signerIdentity } from "@metaplex-foundation/umi"
import { createBundlrUploader } from "@metaplex-foundation/umi-uploader-bundlr"

// Create a devnet connection
const umi = createUmi('https://api.devnet.solana.com');
const bundlrUploader = createBundlrUploader(umi);

let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);

umi.use(signerIdentity(signer));

// did this part with bundlr but could/should have done this too with irys

(async () => {
    try {
        // Follow this JSON structure
        // https://docs.metaplex.com/programs/token-metadata/changelog/v1.0#json-structure

        const image = "https://arweave.net/xrTp549fGbJInzFldDbYMCJW6Mc3PXXOd7_vAxgU8jU";``
        const metadata = {
            name: "Konstantina's Fine Rug",
            symbol: "RUG",
            description: "Good Rug™️",
            image: image,
            attributes: [
                {trait_type: 'Main Color', value: 'Green'},
                {trait_type: 'Secondary Color', value: 'Red'},
                {trait_type: 'Pattern', value: 'Ruggy'},
                {trait_type: 'Rarity', value: 'All Rugs Are Rare'}
            ],
            properties: { // there can be more files associated with one nft
                files: [
                    {
                        type: "image/png",
                        uri: image
                    },
                ]
            },
            creators: [] // depreciated?
        };

        const myUri = await bundlrUploader.uploadJson(metadata);
        // with irys it would be: (like in nft_image)
        // const myUri = await umi.uploader.uploadJson([metadata]);
        console.log("Your metadata URI: ", myUri);
        // https://5hcorq2o4pgrzrtgb6plzz2fxupum5tkglb5us7paokpl4ielu4a.arweave.net/6cTow07jzRzGZg-evOdFvR9Gdmoyw9pL7wOU9fEEXTg
        // https://arweave.net/6cTow07jzRzGZg-evOdFvR9Gdmoyw9pL7wOU9fEEXTg

        // so far there's not something on-chain
    }
    catch(error) {
        console.log("Oops.. Something went wrong", error);
    }
})();