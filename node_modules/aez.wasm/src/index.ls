/**
 * @package aez.wasm
 * @author  Nazar Mokrynskyi <nazar@mokrynskyi.com>
 * @license 0BSD
 */
#TODO: allow empty nonce and ad

function Wrapper (lib)
	lib			= lib()
	allocate	= lib['allocateBytes']
	free		= lib['freeBytes']
	/**
	 * @param {Uint8Array} data
	 *
	 * @return {!Array}
	 */
	function allocate_if_not_empty (data)
		if data && data.length
			[data.length, allocate(0, data)]
		else
			[0, null]

	/**
	 * @param {Uint8Array}	plaintext				Arbitrary size plaintext
	 * @param {Uint8Array}	ad						Arbitrary size associated data
	 * @param {Uint8Array}	nonce					Arbitrary size nonce
	 * @param {!Uint8Array}	key						Arbitrary size key
	 * @param {number}		ciphertext_expansion	How much longer ciphertext must be comparing to plaintext (read AEZ paper for details)
	 *
	 * @return {!Uint8Array} Ciphertext
	 *
	 * @throws {Error}
	 */
	function encrypt (plaintext, ad, nonce, key, ciphertext_expansion)
		[plaintext_length, plaintext]	= allocate_if_not_empty(plaintext)
		[ad_length, ad]					= allocate_if_not_empty(ad)
		[nonce_length, nonce]			= allocate_if_not_empty(nonce)
		key								= allocate(0, key)
		if (plaintext_length + ciphertext_expansion) == 0
			throw new Error("Can't encrypt empty plaintext without ciphertext expansion")
		ciphertext						= allocate(plaintext_length + ciphertext_expansion)
		lib._aez_encrypt(
			ciphertext,
			plaintext, plaintext_length,
			ad, ad_length,
			nonce, nonce_length,
			key, key['length'],
			ciphertext_expansion
		)
		ciphertext	= ciphertext['get']()
		free()
		ciphertext

	/**
	 * @param {!Uint8Array}	ciphertext				Ciphertext
	 * @param {Uint8Array}	ad						Arbitrary size associated data
	 * @param {Uint8Array}	nonce					Arbitrary size nonce
	 * @param {!Uint8Array}	key						Arbitrary size key
	 * @param {number}		ciphertext_expansion	How much shorter plaintext must be comparing to ciphertext (read AEZ paper for details)
	 *
	 * @return {!Uint8Array} Plaintext
	 *
	 * @throws {Error}
	 */
	function decrypt (ciphertext, ad, nonce, key, ciphertext_expansion)
		[ciphertext_length, ciphertext]	= allocate_if_not_empty(ciphertext)
		[ad_length, ad]					= allocate_if_not_empty(ad)
		[nonce_length, nonce]			= allocate_if_not_empty(nonce)
		key								= allocate(0, key)
		if (ciphertext_length - ciphertext_expansion) > 0
			plaintext	= allocate(ciphertext_length - ciphertext_expansion)
		else
			plaintext	= null
		result							= lib._aez_decrypt(
			plaintext,
			ciphertext, ciphertext_length,
			ad, ad_length,
			nonce, nonce_length,
			key, key['length'],
			ciphertext_expansion
		)
		if result != 0
			free()
			throw new Error('Decryption failed')
		if plaintext
			plaintext	= plaintext['get']()
			free()
			plaintext
		else
			free()
			new Uint8Array(0)

	{
		'ready'		: lib.then
		'encrypt'	: encrypt
		'decrypt'	: decrypt
	}

if typeof define == 'function' && define['amd']
	# AMD
	define(['./aez'], Wrapper)
else if typeof exports == 'object'
	# CommonJS
	module.exports = Wrapper(require('./aez'))
else
	# Browser globals
	@'aez_wasm' = Wrapper(@'__aez_wasm')
