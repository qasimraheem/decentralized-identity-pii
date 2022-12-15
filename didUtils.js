import * as IPFS from 'ipfs-core'
import * as dagJose from 'dag-jose'
import {DID} from 'dids'
import {Ed25519Provider} from 'key-did-provider-ed25519'
import KeyResolver from 'key-did-resolver'
import {randomBytes} from '@stablelib/random'


export const getProvider = async (seed = null) => {
    if (seed == null) {
        seed = randomBytes(32)
    }
    return new Ed25519Provider(seed)
}
export const createDID = async (provider = null) => {
    if (provider == null) {
        provider = getProvider();
    }
    return new DID({provider, resolver: KeyResolver.getResolver()})
}

export const followSecretPath = async (cid, did) => {
    try {
        const jwe = (await ipfs.dag.get(cid)).value
        const cleartext = await did.decryptDagJWE(jwe)
        console.log(cleartext)
        if (cleartext.prev) {
            try {
                await followSecretPath(cleartext.prev, did)
            } catch (e) {
                console.log("Error Message in prev", e)
            }
        }
    } catch (e) {
        console.log("Error Message", e)
    }
}

//? Encrypt IPLD data
export const addEncryptedObject = async (cleartext, receiversDid, did) => {
    const jwe = await did.createDagJWE(cleartext, receiversDid)
    return ipfs.dag.put(jwe, {storeCodec: 'dag-jose', hashAlg: 'sha2-256'})
}

//? Create a signed data structure
export const addSignedObject = async (payload, did) => {
    // sign the payload as dag-jose
    const {jws, linkedBlock} = await did.createDagJWS(payload)
    console.log("jws:", jws)
    console.log("linkedBlock:", linkedBlock)

    // put the JWS into the ipfs dag
    const jwsCid = await ipfs.dag.put(jws, {storeCodec: dagJose.name, hashAlg: 'sha2-256'})

    // put the payload into the ipfs dag
    await ipfs.block.put(linkedBlock, jws.link)

    return jwsCid
}