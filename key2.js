import crypto from 'crypto';
import {Ed25519Provider} from 'key-did-provider-ed25519'
import * as jose from 'jose'
import {generateKeyPairFromSeed, convertPublicKeyToX25519} from '@stablelib/ed25519'
import ethers from "ethers";



// let seed = crypto.randomBytes(32);
// console.log(seed.toString('hex'))
let privateKey = 'ef9d03e6a2c295f8ec0cb6fac6e0cc4abad764c273823effa90015c6bc16ad3d'
let seed = new Buffer.from(privateKey, 'hex')

console.log(seed)
let kp = generateKeyPairFromSeed(seed)
console.log("kp", kp)
console.log("kp", new Buffer.from(kp.publicKey.buffer).toString('hex'))
console.log("kp", new Buffer.from(kp.secretKey.buffer).toString('hex'))

const wallet = new ethers.Wallet(privateKey);
console.log('Wallet: ', wallet._signingKey())
console.log("Address: " + wallet.address)


console.log("crypto.webcrypto:", crypto.KeyObject)
async function generateEd25519Key() {
    return crypto.webcrypto.subtle.generateKey({
        name: 'Ed25519',
    }, true, ['sign', 'verify']);
}
let importedKey =  await generateEd25519Key()
console.log('Node generated keys:', importedKey)

async function generateX25519Key() {
    return crypto.webcrypto.subtle.generateKey({
        name: 'X25519',
    }, true, ['deriveKey']);
}

//private: ef9d03e6a2c295f8ec0cb6fac6e0cc4abad764c273823effa90015c6bc16ad3d
//public: 3f33B7637703c452069459241F3E679f51170786
const provider = new Ed25519Provider(seed)
console.log("provider", provider)
const algorithm = 'EdDSA';

const key = await crypto.generateKeyPairSync('ed25519', {
    privateKeyEncoding:{
        format: 'jwk',
    },
    publicKeyEncoding:{
        format: 'jwk',
    }
});

console.log('Node Private : ', key.privateKey);
console.log('Node public : ', key.publicKey);


const ecPublicKey = await jose.importJWK(key.publicKey, 'ed25519')
const ecPrivateKey = await jose.importJWK(key.privateKey, 'ed25519')
const EdDSAkey = {
    privateKey: ecPrivateKey,
    publicKey: ecPublicKey
}
console.log("ecPublicKey:", ecPublicKey)
const pkJwk = await jose.exportJWK(ecPublicKey);
const pkJwkStr = JSON.stringify(pkJwk);
console.log("pkJwk", pkJwk)
console.log("pkJwkStr", pkJwkStr)
console.log("privateKey", JSON.stringify(await jose.exportJWK(ecPrivateKey)))


async function generateJWS(payload, key) {
    const jws = await new jose.CompactSign(new TextEncoder().encode(payload),).setProtectedHeader({alg: algorithm}).sign(key.privateKey);
    console.log("jws:", jws)
    return jws
}

async function verifyJWS(jws, key) {
    const {payload} = await jose.compactVerify(jws, key.publicKey);
    console.log("payload:", payload)

    let decode = new TextDecoder().decode(payload)
    console.log("decode Text:", decode)

    return decode
}

const jws = await generateJWS("text", EdDSAkey);
const response = await verifyJWS(jws, EdDSAkey)