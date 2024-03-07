import wallet from "../wba-wallet.json"
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import {
    createMetadataAccountV3,
    CreateMetadataAccountV3InstructionAccounts,
    CreateMetadataAccountV3InstructionArgs,
    DataV2Args,
} from "@metaplex-foundation/mpl-token-metadata";
import { createSignerFromKeypair, signerIdentity, publicKey } from "@metaplex-foundation/umi";
import base58 from "bs58";

// Define our Mint address
const mint = publicKey("59gym4SfnYb4GiwxNN87vStHL1PrcCXgH4edFxPTeNGk") // umi publicKey

// Create a UMI connection
const umi = createUmi('https://api.devnet.solana.com');
const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair); // we need umi compatible types, the usual signer wouldn't work
umi.use(signerIdentity(createSignerFromKeypair(umi, keypair)));

(async () => {
    try {
        // Start here
        let accounts: CreateMetadataAccountV3InstructionAccounts = { // we don't need the metadata field
            mint: mint,
            mintAuthority: signer,
        }

        let data: DataV2Args = {
            name: "Konstantina's WBA token",
            symbol: "KWBA", // 5 letter cap?
            uri: "",
            sellerFeeBasisPoints: 500, // 0.5%
            creators: null,
            collection: null,
            uses: null
        }

        let args: CreateMetadataAccountV3InstructionArgs = {
            data,
            isMutable: true,
            collectionDetails: null
        }

        let tx = createMetadataAccountV3(
            umi,
            {
                ...accounts,
                ...args
            }
        )

        let result = await tx.sendAndConfirm(umi).then(r => base58.encode(r.signature));
        console.log(result);
        // 3Avn3QDPqTnx5FHMFz5LcvT4r3TQCQbg8bLswtjBWpeDebYKyhKUa7AbgVgnZxTzCsUqcqUtnXJGvEdKUTt4jJgk
    } catch(e) {
        console.error(`Oops, something went wrong: ${e}`)
    }
})();
