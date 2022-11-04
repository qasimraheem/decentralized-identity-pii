import {generateKeyPairFromSeed, convertSecretKeyToX25519} from "@stablelib/ed25519";
import * as jose from 'jose'


let privateKey = '4bd22700ec3450b5f27e47ba70c233a680c981ab02c1432a859ae23111bef377'
let seed = new Buffer.from(privateKey, 'hex')
let kp = generateKeyPairFromSeed(seed)
console.log("kp", kp)
console.log("kp public hex", new Buffer.from(kp.publicKey.buffer).toString('hex'))
console.log("kp secret hex", new Buffer.from(kp.secretKey.buffer).toString('hex'))
console.log("kp private hex", new Buffer.from(kp.secretKey.buffer.slice(0, 32)).toString('hex'))
let kp_public_base64url = new Buffer.from(kp.publicKey.buffer).toString('base64url')
console.log("kp public base64url", kp_public_base64url)
console.log("kp secret base64url", new Buffer.from(kp.secretKey.buffer).toString('base64url'))
let kp_private_base64url = new Buffer.from(kp.secretKey.buffer.slice(0, 32)).toString('base64url')
console.log("kp private base64url", kp_private_base64url)

const PrivateKey = await jose.importJWK(
    {
        crv: 'Ed25519',
        kty: 'OKP',
        x: kp_public_base64url,
        d: kp_private_base64url
    },
    'EdDSA'
)
const PublicKey = await jose.importJWK(
    {
        crv: 'Ed25519',
        kty: 'OKP',
        x: kp_public_base64url
    },
    'EdDSA'
)
let EdDSAkey = {
    publicKey: PublicKey,
    privateKey: PrivateKey
}
console.log('secret key:', kp.secretKey)
let x25519 = await convertSecretKeyToX25519(kp.secretKey);
let x25519_base64url = new Buffer.from(x25519).toString('base64url')
console.log("x25519:", x25519, x25519_base64url)

let x25519alg = 'ECDH-ES+A256KW'
const XPrivateKey = await jose.importJWK(
    {
        crv: 'X25519',
        kty: 'OKP',
        x: x25519_base64url,
        d: kp_private_base64url

    },
    x25519alg
)
const XPublicKey = await jose.importJWK(
    {
        crv: 'X25519',
        kty: 'OKP',
        x: x25519_base64url,
    },
    x25519alg
)
let ECDHkey = {
    privateKey:XPrivateKey,
    publicKey:XPublicKey
};




const text = '{"name": "qasim","email":"qasimmehmood13936@gmail.com"}'

const algorithm = 'EdDSA';

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

async function generateJWE(payload, key) {
    const jwe = await new jose.CompactEncrypt(
        new TextEncoder().encode(payload),
    ).setProtectedHeader({alg: x25519alg, enc: 'A256CBC-HS512'}).encrypt(key.publicKey)
    console.log(jwe)
    return jwe
}

async function decryptJWE(jwe, key) {
    const {plaintext, protectedHeader} = await jose.compactDecrypt(jwe, key.privateKey)
    console.log(protectedHeader)
    let text = new TextDecoder().decode(plaintext)
    console.log(text)
    return {protectedHeader, text}
}


const jws = await generateJWS(text, EdDSAkey);
const response = await verifyJWS(jws, EdDSAkey)
console.log("response ==> ", response)
const jwe = await generateJWE(text, ECDHkey);
const res = await decryptJWE(jwe, ECDHkey);
console.log("res", res)

// let importedKey = await importSecretKey(kp.publicKey.buffer)
// let str = "tFYAkdP6Ea0Y1mWw3RyTm6o3FHAgkY4jgXES_fwGWZM"
// let buff = new Buffer(str, "base64url");
// console.log("buff", buff)
// let base64ToStringNew = buff.toString('utf8');
// console.log('importedKey:', base64ToStringNew)

// console.log(base64url('sacjsncj'))