import { NFTStorage, File } from 'nft.storage'
const NFT_STORAGE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweENkMzMwOTNDZGQ0ODVCMmViODY1RjMyNTYwMDhDODUwMTc2NEM2MWEiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY4Mzc5OTY3MTQyMywibmFtZSI6Im1ldGFzcXVhcmUifQ.0pcthdkmqba_nZZrpFHQ3y6bsJqTWA6sg-jHCDaYalU'
async function storeNFT( image, name, description) {
    const nftstorage = new NFTStorage({ token: NFT_STORAGE_KEY })

    return nftstorage.store({
        image,
        name,
        description,
    });
}
async function main(image, description) {
    const result = await storeNFT(image, name, description)
    return(result)
}

export default main;