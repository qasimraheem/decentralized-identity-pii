import * as ed25519 from "@stablelib/ed25519";
import * as x25519 from "@stablelib/x25519"
import * as jose from "jose";

const ALGORITHM = {
    EdDSA: "EdDSA",
    ECDH_ES: "ECDH-ES"
}
const CURVE = {
    EdDSA: "Ed25519",
    ECDH_ES: "X25519"
}
export const keyPairToJWK = async (keyPair, algorithm = 'EdDSA') => {
    if(!(algorithm === 'EdDSA' || algorithm === 'ECDH_ES')){
        return Error("Invalid algorithm " + algorithm + ". Use only edDSA(ed25519) or ECDH_ES(x25519)")
    }
    const kp_public_base64url = new Buffer.from(keyPair.publicKey.buffer).toString('base64url')
    const kp_private_base64url = new Buffer.from(keyPair.secretKey.buffer.slice(0, 32)).toString('base64url')

    const PrivateKey = await jose.importJWK(
        {
            crv: CURVE[algorithm],
            kty: 'OKP',
            x: kp_public_base64url,
            d: kp_private_base64url
        },
        ALGORITHM[algorithm]
    )
    const PublicKey = await jose.importJWK(
        {
            crv: CURVE[algorithm],
            kty: 'OKP',
            x: kp_public_base64url
        },
        ALGORITHM[algorithm]
    )
    return {
        publicKey: PublicKey,
        privateKey: PrivateKey,
        algorithm:ALGORITHM[algorithm],
        curve:CURVE[algorithm]
    };
}

export async function generateJWS(payload, key) {
    const jws = await new jose.CompactSign(new TextEncoder().encode(payload),).setProtectedHeader({alg: key.algorithm}).sign(key.privateKey);
    console.log("jws:", jws)
    return jws
}

export async function verifyJWS(jws, key) {
    const {payload} = await jose.compactVerify(jws, key.publicKey);
    console.log("payload:", payload)

    let decode = new TextDecoder().decode(payload)
    console.log("decode Text:", decode)

    return decode
}

export async function generateJWE(payload, key) {
    const jwe = await new jose.CompactEncrypt(
        new TextEncoder().encode(payload),
    ).setProtectedHeader({alg: 'ECDH-ES', enc: 'A256CBC-HS512'}).encrypt(key.publicKey)
    console.log(jwe)
    return jwe
}

export async function decryptJWE(jwe, key) {
    const {plaintext, protectedHeader} = await jose.compactDecrypt(jwe, key.privateKey)
    console.log(protectedHeader)
    let text = new TextDecoder().decode(plaintext)
    console.log(text)
    return {protectedHeader, text}
}
export const generateKeyPairFromSeed  = async (seed, algorithm) => {
    let keyPair = null;
    if(ALGORITHM[algorithm]==='EdDSA'){
        console.log('generating EdDSA kp')
        keyPair = ed25519.generateKeyPairFromSeed(seed)
    }else if(ALGORITHM[algorithm]==='ECDH-ES'){
        console.log('generating ECDH-ES kp')
        keyPair = await x25519.generateKeyPairFromSeed(seed)
    }else{
        return Error("Invalid algorithm " + algorithm + ". Use only edDSA(ed25519) or ECDH_ES(x25519)")
    }
    return keyPair
}
