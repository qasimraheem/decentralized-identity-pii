//? Setup IPFS with dag-jose support
// import {create as createIPFS} from 'ipfs-core'
import * as IPFS from 'ipfs-core'
import * as dagJose from 'dag-jose'

const ipfs = await IPFS.create()

//? Setup a DID instance
import { DID } from 'dids'
import { Ed25519Provider } from 'key-did-provider-ed25519'
import KeyResolver from 'key-did-resolver'
import { randomBytes } from '@stablelib/random'

// generate a seed, used as a secret for the DID
const seed = randomBytes(32)

// create did instance
const provider = new Ed25519Provider(seed)
console.log("KeyResolver:", KeyResolver)
const did = new DID({ provider, resolver: KeyResolver.getResolver() })
let auth = await did.authenticate()
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

// Log the DagJWS:
console.log((await ipfs.dag.get(cid1)).value)
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

const signingDID1 = await did.verifyJWS(jws1.value)
await did.verifyJWS(jws2.value)

//? Encrypt IPLD data
async function addEncryptedObject(cleartext, dids) {
    const jwe = await did.createDagJWE(cleartext, dids)
    return ipfs.dag.put(jwe, { storeCodec: 'dag-jose', hashAlg: 'sha2-256' })
}

const cid3 = await addEncryptedObject({ hello: 'secret' }, [did.id])

const cid4 = await addEncryptedObject({ hello: 'cool!', prev: cid3 }, [did.id])

//? Decrypt IPLD data
async function followSecretPath(cid) {
    const jwe = (await ipfs.dag.get(cid)).value
    const cleartext = await did.decryptDagJWE(jwe)
    console.log(cleartext)
    if (cleartext.prev) {
        await followSecretPath(cleartext.prev)
    }
}

// Retrieve a single object
await followSecretPath(cid3)
// > { hello: 'secret' }

// Retrive multiple linked objects
await followSecretPath(cid4)
// > { hello: 'cool!', prev: CID(bagcqceraqittnizulygv6qldqgezp3siy2o5vpg66n7wms3vhffvyc7pu7ba) }
// > { hello: 'secret' }
