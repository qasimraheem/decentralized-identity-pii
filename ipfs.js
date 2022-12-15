
import * as IPFS from 'ipfs-core'
import * as dagJose from 'dag-jose'
import { CID } from 'multiformats/cid'
import {createDID, getProvider} from "./didUtils.js";

let privateKey2 = '4bd22700ec3450b5f27e47ba70c233a680c981ab02c1432a859ae23111bef378'
let seed2 = new Buffer.from(privateKey2, 'hex')
let provider2 = await  getProvider(seed2)
let did2 = await createDID(provider2)
let auth2 = await did2.authenticate()
async function followSecretPath(cid) {
    const jwe = (await ipfs.dag.get(cid)).value
    const cleartext = await did2.decryptDagJWE(jwe)
    console.log(cleartext)
    if (cleartext.prev) {
        await followSecretPath(cleartext.prev)
    }
}
const ipfs = await IPFS.create()
const obj = {
    a: 1,
    b: [1, 2, 3],
    c: {
        ca: [5, 6, 7],
        cb: 'foo'
    }
}

let cid = await ipfs.dag.put(obj, { storeCodec: 'dag-cbor', hashAlg: 'sha2-256' })
console.log(cid)
console.log(cid.version)
cid =await CID.parse("bagcqcerazqydkk4rqxl7attk26imry3pna4shp7vsejutcb3zfylqpj7zrmq")
console.log(cid)
console.log(cid.version)

// const cid1 = 'bagcqcerapmtbkabahorjc6zbp3xth7ovguecgo5sdnhq2z5yzvufcgp5usqq'
// console.log((await ipfs.dag.get('bagcqcerapmtbkabahorjc6zbp3xth7ovguecgo5sdnhq2z5yzvufcgp5usqq')).value)
// await ipfs.dag.get(cid1, { path: '/link' }).then(b => console.log(b.value))

async function getAndLog(cid, path) {
    const result = await ipfs.dag.get(cid, { path })
    console.log(result.value)
}

await getAndLog(cid, '')
// await getAndLog(cid, 'link')
await followSecretPath(cid)
