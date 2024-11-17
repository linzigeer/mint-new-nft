import { createNft, fetchDigitalAsset, mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { getExplorerLink, getKeypairFromFile, airdropIfRequired } from "@solana-developers/helpers";

import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { Connection, LAMPORTS_PER_SOL, clusterApiUrl } from "@solana/web3.js";
import { keypairIdentity, generateSigner, percentAmount, publicKey } from "@metaplex-foundation/umi";

const connection = new Connection(clusterApiUrl("devnet"));
const user = await getKeypairFromFile();
await airdropIfRequired(
    connection,
    user.publicKey,
    1 * LAMPORTS_PER_SOL,
    0.5 * LAMPORTS_PER_SOL,
)
console.log("loaded user:", user.publicKey.toBase58());

const umi = createUmi(connection.rpcEndpoint);
umi.use(mplTokenMetadata());
const umiUser = umi.eddsa.createKeypairFromSecretKey(user.secretKey);
umi.use(keypairIdentity(umiUser));
console.log("set up umi instance for user");

const collectionAddress = publicKey("6DpWZ8eknB5Y17ciLGFsfBmdzmhGv4Hu2yEV7L5WrsrN");

console.log("Creating NFT...");

const mint = generateSigner(umi);
const transaction = await createNft(
    umi,
    {
        name: "My NFT",
        uri: "https://...",
        sellerFeeBasisPoints: percentAmount(0),
        mint,
        collection:
        {
            key: collectionAddress,
            verified: false,
        }
    }
)

await transaction.sendAndConfirm(umi);
const createdNFT = await fetchDigitalAsset(umi, mint.publicKey);

console.log(`Created NFT! Address is ${getExplorerLink("address", createdNFT.mint.publicKey, "devnet")}`);
