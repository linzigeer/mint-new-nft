import { createNft, fetchDigitalAsset, mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { getExplorerLink, getKeypairFromFile, airdropIfRequired } from "@solana-developers/helpers";

import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { Connection, LAMPORTS_PER_SOL, clusterApiUrl } from "@solana/web3.js";
import { keypairIdentity, generateSigner, percentAmount } from "@metaplex-foundation/umi";

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

const collectionMint = generateSigner(umi);
const transaction = await createNft(umi, {
    name: "My Collection",
    uri: "https://...",
    sellerFeeBasisPoints: percentAmount(0),
    mint: collectionMint,
})

await transaction.sendAndConfirm(umi);
const createdCollectionNft = await fetchDigitalAsset(umi, collectionMint.publicKey);

console.log(`Created Collection! Address is ${getExplorerLink("address", createdCollectionNft.mint.publicKey, "devnet")}`);