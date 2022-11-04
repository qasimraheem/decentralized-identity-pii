import  crypto from 'crypto';

/*
?For asymmetric keys, this property represents the type of the key. Supported key types are:
'rsa'
 'rsa-pss'
 'dsa'
 'ec'
 'x25519'
 'x448'
 'ed25519'
 'ed448'
 'dh'
*/
/*
?For symmetric keys, the following encoding options can be used:
format: <string> Must be 'buffer' (default) or 'jwk'.

?For public keys, the following encoding options can be used:
type: <string> Must be one of 'pkcs1' (RSA only) or 'spki'.
format: <string> Must be 'pem', 'der', or 'jwk'.

?For private keys, the following encoding options can be used:
type: <string> Must be one of 'pkcs1' (RSA only), 'pkcs8' or 'sec1' (EC only).
format: <string> Must be 'pem', 'der', or 'jwk'.
cipher: <string> If specified, the private key will be encrypted with the given cipher and passphrase using PKCS#5 v2.0 password based encryption.
passphrase: <string> | <Buffer> The passphrase to use for encryption, see cipher.
*/
const key = await crypto.generateKeyPairSync('ed25519',{
    privateKeyEncoding:{
        format: 'jwk',
    },
    publicKeyEncoding:{
        format: 'jwk',
    }
});
const key2 = await crypto.generateKeyPairSync('x25519',{
    privateKeyEncoding:{
        format: 'jwk',
    },
    publicKeyEncoding:{
        format: 'jwk',
    }
});
console.log(key);
console.log(key.privateKey);
console.log(key.publicKey);

console.log(key2);
console.log(key2.privateKey);
console.log(key2.publicKey);

// const alice = crypto.createECDH('secp256k1', {
//     publicKeyEncoding: {
//         type: 'pkcs8',
//         format: 'pem'
//     },
//     privateKeyEncoding: {
//         type: 'pkcs8',
//         format: 'pem',
//         // cipher: "aes-256-cbc",
//         // passphrase: 'top secret'
//     }
// });
// alice.setPrivateKey(
//     crypto.createHash('sha256').update('alice', 'utf8').digest(),
// );
// console.log(alice.getPublicKey())
// console.log(alice.getPublicKey())

// const {
//     publicKey,
//     privateKey,
// } = generateKeyPairSync('rsa', {
//     modulusLength: 4096,
//     publicKeyEncoding: {
//         type: 'pkcs1',
//         format: 'pem'
//     },
//     privateKeyEncoding: {
//         type: 'pkcs1',
//         format: 'pem',
//         cipher: "aes-256-cbc",
//         passphrase: 'top secret'
//     }
// });
// console.log('publicKey:', publicKey)
// console.log('privateKey:', privateKey)

// const {
//     createECDH,
//     ECDH
// } = await import('node:crypto');
//
// const ecdh = createECDH('secp256k1');
// ecdh.generateKeys(
//     'base64',
//     'compressed'
// );
// console.log(ecdh.getPublicKey('hex'));
//
// const compressedKey = ecdh.getPublicKey('hex', 'uncompressed');
//
// const uncompressedKey = ECDH.convertKey(compressedKey,
//     'EdDSA',
//     'hex',
//     'hex',
//     'uncompressed');
//
// // The converted key and the uncompressed public key should be the same
// console.log(uncompressedKey === ecdh.getPublicKey('hex'));