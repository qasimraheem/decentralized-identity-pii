# aez.wasm [![Travis CI](https://img.shields.io/travis/nazar-pc/aez.wasm/master.svg?label=Travis%20CI)](https://travis-ci.org/nazar-pc/aez.wasm)
[AEZ cipher](http://web.cs.ucdavis.edu/~rogaway/aez/) compiled to WebAssembly using Emscripten and optimized for small size

NOTE from C implementation:
```
// ** This version is slow and susceptible to side-channel attacks. **
// ** Do not use for any purpose other than to understand AEZ.      **
```

## How to install
```
npm install aez.wasm
```

## How to use
Node.js:
```javascript
var aez = require('aez.wasm')

aez.ready(function () {
    var plaintext            = Buffer.from('37c8f1a1c981c04263769feb059be120', 'hex');
    var ad                   = Buffer.from('38e7de89bfabf8b4064118449633e2adb942c22b63c9c0971d19d6845dedd9a0', 'hex');
    var nonce                = Buffer.from('54d3b0f09e55592d449c5117', 'hex');
    var key                  = Buffer.from('ead50aed64ee3bd8925b7fbbbe619cdf803cbcf386fccce48ea6b921c36efdb821e47fe3fbdf1a0a90e36d29467797ea', 'hex');
    var ciphertext_expansion = 16;
    var ciphertext = aez.encrypt(plaintext, ad, nonce, key, ciphertext_expansion);
    console.log(ciphertext);
    var plaintext_decrypted = aez.decrypt(ciphertext, ad, nonce, key, ciphertext_expansion);
    console.log(plaintext_decrypted);
});
```
Browser:
```javascript
requirejs(['aez.wasm'], function (aez) {
    aez.ready(function () {
        var plaintext            = Buffer.from('37c8f1a1c981c04263769feb059be120', 'hex');
        var ad                   = Buffer.from('38e7de89bfabf8b4064118449633e2adb942c22b63c9c0971d19d6845dedd9a0', 'hex');
        var nonce                = Buffer.from('54d3b0f09e55592d449c5117', 'hex');
        var key                  = Buffer.from('ead50aed64ee3bd8925b7fbbbe619cdf803cbcf386fccce48ea6b921c36efdb821e47fe3fbdf1a0a90e36d29467797ea', 'hex');
        var ciphertext_expansion = 16;
        var ciphertext = aez.encrypt(plaintext, ad, nonce, key, ciphertext_expansion);
        console.log(ciphertext);
        var plaintext_decrypted = aez.decrypt(ciphertext, ad, nonce, key, ciphertext_expansion);
        console.log(plaintext_decrypted);
    });
})
```

# API
### aez.ready(callback)
* `callback` - Callback function that is called when WebAssembly is loaded and library is ready for use

### aez.encrypt(plaintext : Uint8Array, ad : Uint8Array, nonce : Uint8Array, key : Uint8Array, ciphertext_expansion : number) : Uint8Array
Encrypts `plaintext`, returns ciphertext. Will throw `Error` if encryption fails.

* `plaintext` - Arbitrary size plaintext
* `ad` - Arbitrary size associated data
* `nonce` - Arbitrary size nonce
* `key` - Arbitrary size key
* `ciphertext_expansion` - How much longer ciphertext must be comparing to plaintext (read AEZ paper for details)

### aez.encrypt(ciphertext : Uint8Array, ad : Uint8Array, nonce : Uint8Array, key : Uint8Array, ciphertext_expansion : number) : Uint8Array
Decrypts `ciphertext`, returns plaintext. Will throw `Error` if decryption fails.

* `ciphertext` - Ciphertext
* `ad` - Arbitrary size associated data
* `nonce` - Arbitrary size nonce
* `key` - Arbitrary size key
* `ciphertext_expansion` - How much shorter plaintext must be comparing to ciphertext (read AEZ paper for details)

Take a look at `src/index.ls` for JsDoc sections with arguments and return types as well as methods description, look at `tests/index.ls` for usage examples.

## Contribution
Feel free to create issues and send pull requests (for big changes create an issue first and link it from the PR), they are highly appreciated!

When reading LiveScript code make sure to configure 1 tab to be 4 spaces (GitHub uses 8 by default), otherwise code might be hard to read.

## License
Free Public License 1.0.0 / Zero Clause BSD License

https://opensource.org/licenses/FPL-1.0.0

https://tldrlegal.com/license/bsd-0-clause-license
