#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const yargs = require('yargs');
const CryptoJS = require('crypto-js');

const parseArgs = () => {
	const args = yargs
		.usage('Usage: protect-static-pages [options] <file>')
		.option('p', {
			alias: 'passphrase',
			type: 'string',
			describe: 'Passphrase to encrypt with',
			default: null,
		})
		.option('t', {
			alias: 'template',
			type: 'string',
			describe: 'Decryption prompt page template',
			default: path.resolve(__dirname, '..', 'public', 'template.html'),
		})
		.option('o', {
			alias: 'output',
			type: 'string',
			describe: 'Encrypted file name',
			default: null,
		}).argv;

	if (args._.length !== 1) {
		yargs.showHelp();
		process.exit(1);
	}

	return args;
};

const getCryptoJSFileContent = () => {
	let cryptoJSFileContent;

	try {
		cryptoJSFileContent = fs.readFileSync(
			path.join(__dirname, 'lib/crypto-js.min.js'),
			'utf8'
		);
	} catch (e) {
		console.log('Failure: embed file does not exist!');
		process.exit(1);
	}

	return `<script> ${cryptoJSFileContent} </script>`;
};

const encrypt = (inputFileContent, passphrase) => {
	const keySize = 256;
	const iterations = 1000;

	// password-based key derivation
	const salt = CryptoJS.lib.WordArray.random(128 / 8);

	const key = CryptoJS.PBKDF2(passphrase, salt, {
		keySize: keySize / 32,
		iterations,
	});

	// cipher
	const iv = CryptoJS.lib.WordArray.random(128 / 8);

	const encrypted = CryptoJS.AES.encrypt(inputFileContent, key, {
		iv,
		padding: CryptoJS.pad.Pkcs7,
		mode: CryptoJS.mode.CBC,
	});

	// salt, iv will be hex 32 in length
	// append them to the ciphertext for use  in decryption
	const encryptedMsg = salt.toString() + iv.toString() + encrypted.toString();
	// return encryptedMsg;

	// var encrypted = encrypt(contents, password);
	const hmac = CryptoJS.HmacSHA256(
		encryptedMsg,
		CryptoJS.SHA256(passphrase).toString()
	).toString();
	const encryptedMessage = hmac + encryptedMsg;

	return encryptedMessage;
};

const render = (template, data) =>
	template.replace(/{(.*?)}/g, (_, key) => (data && data[key]) || '');

const main = () => {
	const args = parseArgs();

	let inputFileContent;
	let templateFileContent;

	try {
		inputFileContent = fs.readFileSync(args._[0].toString(), 'utf8');
	} catch (e) {
		console.log('Failure: input file does not exist!');
		process.exit(1);
	}

	try {
		templateFileContent = fs.readFileSync(args.template, 'utf8');
	} catch (e) {
		console.log('Failure: could not read template!');
		process.exit(1);
	}

	const cryptoJsContent = getCryptoJSFileContent();
	const encryptedContent = encrypt(inputFileContent, args.passphrase);
	const outputFileContent = render(templateFileContent, {
		title: 'Tabby Writeup',
		passphrasePlaceholder: 'hash',
		instructions:
			'This write-up is protected with root / administrator hash.',
		encryptedContent,
		cryptoJsContent,
		embed: 'embed',
	});

	try {
		fs.writeFileSync(
			args.output || args._[0].toString(),
			outputFileContent
		);
	} catch (e) {
		console.log('Failure: could not generate output file!');
		process.exit(1);
	}
};

main();
