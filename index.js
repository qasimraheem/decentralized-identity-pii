//? Setup IPFS with dag-jose support
// import {create as createIPFS} from 'ipfs-core'
import * as IPFS from 'ipfs-core'
import * as dagJose from 'dag-jose'
import {getProvider, createDID} from './didUtils.js'

const ipfs = await IPFS.create()

//? Setup a DID instance
import { DID } from 'dids'
import { Ed25519Provider } from 'key-did-provider-ed25519'
import KeyResolver from 'key-did-resolver'
import { randomBytes } from '@stablelib/random'

// generate a seed, used as a secret for the DID
let privateKey = '4bd22700ec3450b5f27e47ba70c233a680c981ab02c1432a859ae23111bef377'
let seed = new Buffer.from(privateKey, 'hex')
let privateKey2 = '4bd22700ec3450b5f27e47ba70c233a680c981ab02c1432a859ae23111bef378'
let seed2 = new Buffer.from(privateKey2, 'hex')
let privateKey3 = '4bd22700ec3450b5f27e47ba70c233a680c981ab02c1432a859ae23111bef379'
let seed3 = new Buffer.from(privateKey3, 'hex')

// create did instance


let provider = await  getProvider(seed)
let did = await createDID(provider)
let auth = await did.authenticate()

let provider2 = await  getProvider(seed2)
let did2 = await createDID(provider2)
let auth2 = await did2.authenticate()

let provider3 = await  getProvider(seed3)
let did3 = await createDID(provider3)
// let auth3 = await did3.authenticate()



console.log("Auth:", auth);
// window.did = did
console.log('Connected with DID:', did.id)
//? Create a signed data structure
async function addSignedObject(payload) {
    // sign the payload as dag-jose
    const { jws, linkedBlock } = await did.createDagJWS(payload)
    console.log("jws:", jws)
    console.log("linkedBlock:", linkedBlock)

    // put the JWS into the ipfs dag
    const jwsCid = await ipfs.dag.put(jws, { storeCodec: dagJose.name, hashAlg: 'sha2-256' })

    // put the payload into the ipfs dag
    await ipfs.block.put(linkedBlock, jws.link)

    return jwsCid
}

// Create our first signed object
const cid1 = await addSignedObject({ hello: 'world' })

console.log("cid1:=>>", cid1.toString())
// Log the DagJWS:
console.log((await ipfs.dag.get(cid1)).value)
console.log("IPFS Dag Value:", (await ipfs.dag.get(cid1)).value)

// > {
// >   payload: "AXESIHhRlyKdyLsRUpRdpY4jSPfiee7e0GzCynNtDoeYWLUB",
// >   signatures: [{
// >     signature: "h7bHmTaBGza_QlFRI9LBfgB3Nw0m7hLzwMm4nLvcR3n9sHKRoCrY0soWnDbmuG7jfVgx4rYkjJohDuMNgbTpEQ",
// >     protected: "eyJraWQiOiJkaWQ6MzpiYWdjcWNlcmFza3hxeng0N2l2b2tqcW9md295dXliMjN0aWFlcGRyYXpxNXJsem4yaHg3a215YWN6d29hP3ZlcnNpb24taWQ9MCNrV01YTU1xazVXc290UW0iLCJhbGciOiJFUzI1NksifQ"
// >   }],
// >   link: CID(bafyreidykglsfhoixmivffc5uwhcgshx4j465xwqntbmu43nb2dzqwfvae)
// > }

// Log the payload:
await ipfs.dag.get(cid1, { path: '/link' }).then(b => console.log(b.value))
// > { hello: 'world' }

// Create another signed object that links to the previous one
const cid2 = await addSignedObject({ hello: 'getting the hang of this', prev: cid1 })

// Log the new payload:
await ipfs.dag.get(cid2, { path: '/link' }).then(b => console.log(b.value))
// > {
// >   hello: 'getting the hang of this'
// >   prev: CID(bagcqcerappi42sb4uyrjkhhakqvkiaibkl4pfnwpyt53xkmsbkns4y33ljzq)
// > }

// Log the old payload:
await ipfs.dag.get(cid2, { path: '/link/prev/link' }).then(b => console.log(b.value))
// > { hello: 'world' }

//? Verify a signed data structure
const jws1 = await ipfs.dag.get(cid1)
const jws2 = await ipfs.dag.get(cid2)
console.log("jws1.value:", jws1.value)
const signingDID1 = await did.verifyJWS(jws1.value)
console.log("verifying jws2 by did")
await did3.verifyJWS(jws2.value)
console.log("verifying jws2 by did completed")


//? Encrypt IPLD data
async function addEncryptedObject(cleartext, dids) {
    const jwe = await did.createDagJWE(cleartext, dids)
    console.log("creating JWE", jwe)
    return ipfs.dag.put(jwe, { storeCodec: 'dag-jose', hashAlg: 'sha2-256' })
}
console.log("DID ID:", did.id)
const cid3 = await addEncryptedObject({ hello: 'secret' }, [did.id,did2.id])
console.log("cid3:", cid3)

const cid4 = await addEncryptedObject({ hello: 'cool!', prev: cid3 }, [did2.id])
console.log("cid4:", cid4)

//? Decrypt IPLD data
async function followSecretPath(cid, didUser) {
    const jwe = (await ipfs.dag.get(cid)).value
    const cleartext = await didUser.decryptDagJWE(jwe)
    console.log(cleartext)
    if (cleartext.prev) {
        await followSecretPath(cleartext.prev, didUser)
    }
}

// Retrieve a single object
await followSecretPath(cid3,did)
// > { hello: 'secret' }

// Retrive multiple linked objects
await followSecretPath(cid4,did)

// > { hello: 'cool!', prev: CID(bagcqceraqittnizulygv6qldqgezp3siy2o5vpg66n7wms3vhffvyc7pu7ba) }
// > { hello: 'secret' }
console.log("did:", did._id)
console.log("DID resolver:", await did.resolve(did._id))
