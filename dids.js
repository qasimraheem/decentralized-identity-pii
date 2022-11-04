import { DID } from 'dids'
import { Ed25519Provider } from 'key-did-provider-ed25519'
import KeyResolver from 'key-did-resolver'
import crypto from 'crypto';
import ethers from 'ethers';

//0xC21a4AD429e4E2E194816d989d9bBd255c67Fd6C
const seed = crypto.randomBytes(32) // 32 bytes of entropy, Uint8Array
const privateKey = seed.toString('hex')
console.log('privateKey: ', privateKey)
const wallet = new ethers.Wallet(privateKey);
console.log('Wallet: ', wallet._signingKey())
console.log("Address: " + wallet.address)
console.log("seed buffer:", new Buffer.from(seed.toString('hex'),'hex'))

const provider = new Ed25519Provider(seed)
console.log('provider:', provider)
const did1 = new DID({ provider, resolver: KeyResolver.getResolver() })
console.log('did1:', did1)
const did2 = new DID()
console.log('did2:', did2)
did2.setProvider(provider)
did2.setResolver(KeyResolver.getResolver())


// Authenticate with the provider
await did1.authenticate()
console.log('auth did1:', did1)

await did2.authenticate()
console.log('auth did2:', did2)

// Read the DID string - this will throw an error if the DID instance is not authenticated
const aliceDID1 = did1.id
console.log('aliceDID1:', aliceDID1)
const aliceDID2 = did2.id
console.log('aliceDID2:', aliceDID2)

// Create a JWS - this will throw an error if the DID instance is not authenticated
const jws = await did1.createJWS({ hello: 'world' })
console.log("jws:", jws)
const jws2 = await did2.createDagJWS({ hello: 'hello' })
console.log("jws:", JSON.stringify(jws2))
console.log('JWS DID1:', did1)
