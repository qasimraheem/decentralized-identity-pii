"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ECPointDecompress = void 0;
const u8a = __importStar(require("uint8arrays"));
const bigintModArith = __importStar(require("bigint-mod-arith"));
const nist_weierstrauss_common = __importStar(require("./nist-weierstrauss-common.js"));
function ECPointDecompress(comp) {
    if (!nist_weierstrauss_common.testUint8Array(comp)) {
        throw new TypeError("input must be a Uint8Array");
    }
    const two = BigInt(2);
    const prime = two ** 256n - two ** 224n + two ** 192n + two ** 96n - 1n;
    const b = 41058363725152142129326129780047268409114441015993725554835256314039467401291n;
    const pIdent = (prime + 1n) / 4n;
    const signY = BigInt(comp[0] - 2);
    const x = comp.subarray(1);
    const xBig = BigInt(u8a.toString(x, "base10"));
    const a = xBig ** 3n - xBig * 3n + b;
    let yBig = bigintModArith.modPow(a, pIdent, prime);
    if (yBig % 2n !== signY) {
        yBig = prime - yBig;
    }
    return {
        x: xBig,
        y: yBig,
    };
}
exports.ECPointDecompress = ECPointDecompress;
//# sourceMappingURL=secp256r1.js.map