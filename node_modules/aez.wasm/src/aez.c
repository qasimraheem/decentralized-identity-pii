#include "../vendor/aezv5/ref/blake2b.c"
#include "../vendor/aezv5/ref/encrypt.c"
#include "../vendor/aezv5/ref/rijndael-alg-fst.c"


int aez_encrypt(
	byte *ciphertext,
	byte *plaintext, unsigned plaintext_length,
	byte *ad, unsigned ad_length,
	byte *nonce, unsigned nonce_length,
	byte *key, unsigned key_length,
	unsigned ciphertext_expansion
) {
	byte *AD[] = {ad};
	unsigned adbytes[] = {ad_length};
	Encrypt(
		key, key_length,
		nonce, nonce_length,
		AD, adbytes, 1,
		ciphertext_expansion,
		plaintext, plaintext_length,
		ciphertext
	);
	return 0;
}

int aez_decrypt(
	byte *plaintext,
	byte *ciphertext, unsigned ciphertext_length,
	byte *ad, unsigned ad_length,
	byte *nonce, unsigned nonce_length,
	byte *key, unsigned key_length,
	unsigned ciphertext_expansion
) {
	byte *AD[] = {ad};
	unsigned adbytes[] = {ad_length};
	return Decrypt(
		key, key_length,
		nonce, nonce_length,
		AD, adbytes, 1,
		ciphertext_expansion,
		ciphertext, ciphertext_length,
		plaintext
	);
}

