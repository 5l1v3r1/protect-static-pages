# protect-static-pages

**`protect-static-pages`** password protects static pages. It uses AES-256 from [crypto-js](https://github.com/brix/crypto-js) library to encrypt static pages and produce a HTML file with a password prompt to decrypted in-browser (client side).

## Installation

## Usage

```text
Usage: protect-static-pages [options] <file>

Options:
  --help            Show help                                          [boolean]
  --version         Show version number                                [boolean]
  -p, --passphrase  Passphrase to encrypt with          [string] [default: null]
  -t, --template    Decryption prompt page template
  [string] [default: "/home/signed/Documents/source-code/development/protect-sta
                                                 tic-pages/build/template.html"]
  -o, --output      Encrypted file name                 [string] [default: null]
```