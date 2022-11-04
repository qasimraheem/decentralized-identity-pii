import * as jose from 'jose'
// import crypto from "crypto";

const algorithm = 'EdDSA';
let EdDSAkey = await jose.generateKeyPair(algorithm, {crv: "Ed25519"})
let EdDSAkey2 = await jose.generateKeyPair(algorithm, {crv: "Ed25519"})
console.log("publicKey => ", EdDSAkey.publicKey)
console.log("privateKey => ", EdDSAkey.privateKey)


// Stringify keys
const pkJwk = await jose.exportJWK(EdDSAkey.publicKey);
console.log("publicKey == pkJwk:", pkJwk)
const pkJwkStr = JSON.stringify(pkJwk);
const skJwkStr = JSON.stringify(await jose.exportJWK(EdDSAkey.privateKey));


// Calculate kid
const kid = await jose.calculateJwkThumbprint(pkJwk);


console.log("kid:", kid);
console.log("publicKeyString == pkJwkStr:", pkJwkStr);
console.log("privateKey == skJwkStr:", skJwkStr);

/// encrypt
const text = '{"name": "qasim","email":"qasimmehmood13936@gmail.com"}'
// Import keys
const iPk = await jose.importJWK(JSON.parse(pkJwkStr), algorithm);
const iSk = await jose.importJWK(JSON.parse(skJwkStr), algorithm);
console.log("iSk:", iSk)

async function generateJWS(payload, key){
    const jws = await new jose.CompactSign(new TextEncoder().encode(payload),).setProtectedHeader({alg: algorithm}).sign(key.privateKey);
    console.log("jws:", jws)
    return jws
}
async function verifyJWS(jws,key){
    const {payload} = await jose.compactVerify(jws, key.publicKey);
    console.log("payload:", payload)

    let decode = new TextDecoder().decode(payload)
    console.log("decode Text:", decode)

    return decode
}


// JWE
let ECDHkey = await jose.generateKeyPair('ECDH-ES+A256KW', {crv: "X25519"})
let ECDHkey2 = await jose.generateKeyPair('ECDH-ES+A256KW', {crv: "X25519"})

async function generateJWE(payload,key){
    const jwe = await new jose.CompactEncrypt(
        new TextEncoder().encode(payload),
    ).setProtectedHeader({alg: 'ECDH-ES+A256KW', enc: 'A256CBC-HS512'}).encrypt(key.publicKey)
    console.log(jwe)
    return jwe
}
async function decryptJWE(jwe, key){
    const { plaintext, protectedHeader } = await jose.compactDecrypt(jwe, key.privateKey)
    console.log(protectedHeader)
    let text = new TextDecoder().decode(plaintext)
    console.log(text)
    return {protectedHeader, text}
}


async function sample(){
    const jws = await generateJWS(text,EdDSAkey);
    const response = await verifyJWS(jws, EdDSAkey)
    console.log("response ==> ", response)
    const jwe = await generateJWE(text,ECDHkey);
    const res = await decryptJWE(jwe, ECDHkey);
}

await sample()
// async function sample2(){
//     const jwe = await generateJWE(text,ECDHkey2);
//     const jws = await generateJWS(jwe,EdDSAkey);
//     const response = await verifyJWS(jws, EdDSAkey)
//     const res = await decryptJWE(response, ECDHkey2);
//     console.log("response ==> ", res)
// }
// await sample2()













// https://github.com/panva/jose/issues/210


// console.log(privateKey)
// const seed = crypto.randomBytes(32)
// let ecPrivateKey = '0x889ecf489eb13e48edf299b80f32af1adbc1014503bfe700e2a3535bf2e4439e'
// let publicKey = '0x047ab6d4442b664397446a1b4dd9ddba84c704116ae413f087c8762aece9eb1e17704d59c1e8a2c71e399a63bcc8999f43e0f753522b238dee0064d9eb15d24734'
// const jws = await new jose.GeneralSign(
//     new TextEncoder().encode('It’s a dangerous business, Frodo, going out your door.'),
// )
//     .addSignature(seed)
//
//     .setProtectedHeader({ alg: 'ES256' })
//     .sign()
//
// console.log("jws:",jws)
// // const jws = {
// //     payload: 'eyJoZWxsbyI6IndvcmxkIn0',
// //     signatures: [
// //         {
// //             signature:
// //                 'sh7bQbq3PiSwaaKeiplzDu2THDinVTckiwYlUmjsCmPW_8gxSa09GcNGbvxXJVeVWzJBaB7I6jEKTrpnD8s3BQ',
// //             protected: 'eyJhbGciOiJFZERTQSIsImtpZCI6ImRpZDprZXk6ejZNa2ZIQ3V6Z2E1RThrS1VTRzJYWnJKVzlITE03akxHYkc3bmtwamV5QVVpWVM3I3o2TWtmSEN1emdhNUU4a0tVU0cyWFpySlc5SExNN2pMR2JHN25rcGpleUFVaVlTNyJ9',
// //         },
// //     ],
// // }
// // publicKey = new Buffer.from(publicKey,'hex')
// console.log("publicKey:", publicKey)
// const {payload, protectedHeader} = await jose.generalVerify(jws, publicKey)
//
// console.log(protectedHeader)
// console.log(new TextDecoder().decode(payload))