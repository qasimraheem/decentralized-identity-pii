import {keyPairToJWK, decryptJWE, generateJWE, generateJWS, verifyJWS, generateKeyPairFromSeed} from './utils.js'
const ALGORITHM = {
    EdDSA: "EdDSA",
    ECDH_ES: "ECDH_ES"
}

let privateKey = '9d32c4c58bc0fc3fc04f206ac08c478792e51c7f8979d498694500dd49d5c031'
//0xaB4a975909175d3FFB4e3071a4628670ac40A232
let seed = new Buffer.from(privateKey, 'hex')


const kp1 = await generateKeyPairFromSeed(seed, ALGORITHM.EdDSA)
const kp2 = await generateKeyPairFromSeed(seed, ALGORITHM.ECDH_ES)
let EdDSAkey = await keyPairToJWK(kp1, ALGORITHM.EdDSA)
let ECDHkey = await keyPairToJWK(kp2, ALGORITHM.ECDH_ES)


const text = '{"name": "qasim","email":"qasimmehmood13936@gmail.com"}'

const jws = await generateJWS(text, EdDSAkey);
const response = await verifyJWS(jws, EdDSAkey)
console.log("response ==> ", response)
const jwe = await generateJWE(text, ECDHkey);
console.log("jwe:", jwe)
const res = await decryptJWE(jwe, ECDHkey);
console.log("res", res)
