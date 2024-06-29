const TokenType = Object.freeze({
  ELEMENT: 0,
  CLASS: 1,
  ID: 2,
  PSEUDO_ELEMENT: 3, // e.g. ::before
  PSEUDO_CLASS: 4, // e.g. :hover
  ATTRIBUTE: 5,
});

class Token {
  constructor(type, lexeme) {
    this.type = type;

    // 'lexeme' normally refers to a string of characters inside a token,
    // but in this code, it can also refer to a key-value Object for attribute pairs.
    this.lexeme = lexeme;
  }
}

class Scanner {
  #input;
  #lexemeStartIndex = -1;
  #lexemeCurrentIndex = -1;
  #tokens = [];

  constructor(input) {
    this.#input = input;
  }

  #characterToTokenType = {
    '.': TokenType.CLASS,
    '#': TokenType.ID,
  };

  scan() {
    while (!this.#isAtEnd()) {
      this.#startNewLexeme();
      let character = this.#input.charAt(this.#lexemeCurrentIndex);

      switch (character) {
        case '.':
        case '#': {
          let tokenType = this.#characterToTokenType[character];

          while (this.#isNextCharacterAlphaNumeric()) {
            this.#lexemeCurrentIndex += 1;
          }

          this.#addToken(
            tokenType,
            this.#input.substring(this.#lexemeStartIndex + 1, this.#lexemeCurrentIndex + 1)
          );
          break;
        }

        case ':': {
          let tokenType = TokenType.PSEUDO_CLASS;
          let indexIncrement = 1; // to remove the prefix (: or ::) from the pseudo-element/pseudo-class

          do {
            if (this.#checkNextCharacter(':')) {
              tokenType = TokenType.PSEUDO_ELEMENT;
              indexIncrement = 2;
            }

            this.#lexemeCurrentIndex += 1;
          } while (this.#isNextCharacterAlphaNumeric());

          let lexeme = this.#input.substring(
            this.#lexemeStartIndex + indexIncrement,
            this.#lexemeCurrentIndex + 1
          );

          if (
            tokenType === TokenType.PSEUDO_CLASS &&
            lexeme.toLowerCase().startsWith('nth') &&
            this.#checkNextCharacter('(')
          ) {
            this.#lexemeCurrentIndex += 1;

            while (!this.#checkNextCharacter(')') && !this.#isAtEnd()) {
              this.#lexemeCurrentIndex += 1;
            }
          }

          this.#addToken(tokenType, lexeme);

          break;
        }

        case '[': {
          let attributePair = { key: '', value: '' };

          while (!this.#checkNextCharacter(']') && !this.#isAtEnd()) {
            this.#lexemeCurrentIndex += 1;

            if (this.#input.charAt(this.#lexemeCurrentIndex) === '=') {
              attributePair.key = this.#input
                .substring(this.#lexemeStartIndex + 1, this.#lexemeCurrentIndex)
                .trim();

              // To start scanning the part after the '=' sign in an attribute pair, ([key=value])
              // we set `#lexemeStartIndex` to the index of the '=' sign (#lexemeCurrentIndex)
              // and continue scanning until the next character is '['.
              this.#lexemeStartIndex = this.#lexemeCurrentIndex;
            }
          }

          attributePair.value = this.#input
            .substring(this.#lexemeStartIndex + 1, this.#lexemeCurrentIndex + 1)
            .trim();

          // When there is no = sign in the attribute selector, `attributePair.key` is empty. (e.g. [disabled])
          // So, we set `key` to `value` (e.g. [disabled] becomes [disabled=disabled]).
          if (attributePair.key === '') {
            attributePair.key = attributePair.value;
          }

          this.#addToken(TokenType.ATTRIBUTE, Object.freeze(attributePair));
          break;
        }

        default: {
          let characterCode = this.#input.charCodeAt(this.#lexemeCurrentIndex);

          if (this.#isAlphaNumeric(characterCode)) {
            while (this.#isNextCharacterAlphaNumeric()) {
              this.#lexemeCurrentIndex += 1;
            }

            this.#addToken(
              TokenType.ELEMENT,
              this.#input.substring(this.#lexemeStartIndex, this.#lexemeCurrentIndex + 1)
            );
          }
        }
      }
    }
  }

  #isAtEnd() {
    return this.#lexemeCurrentIndex + 1 >= this.#input.length;
  }

  #startNewLexeme() {
    this.#lexemeCurrentIndex += 1;
    this.#lexemeStartIndex = this.#lexemeCurrentIndex;
  }

  #addToken(tokenType, lexeme) {
    if (tokenType !== TokenType.ATTRIBUTE && lexeme.trim() === '') return false;

    if (tokenType === TokenType.ATTRIBUTE && (lexeme.key === '' || lexeme.value === '')) {
      return false;
    }

    this.#tokens.push(new Token(tokenType, lexeme));
  }

  #checkNextCharacter(expectedCharacter) {
    if (this.#isAtEnd()) return false;

    return this.#input.charAt(this.#lexemeCurrentIndex + 1) === expectedCharacter;
  }

  // also returns true if the character is a hyphen or an underscore
  #isAlphaNumeric(characterCode) {
    return (
      (characterCode > 47 && characterCode < 58) || // [0-9]
      (characterCode > 64 && characterCode < 91) || // [A-Z]
      (characterCode > 96 && characterCode < 123) || // [a-z]
      characterCode === 45 || // - (hyphen)
      characterCode === 95 // _ (underscore)
    );
  }

  #isNextCharacterAlphaNumeric() {
    if (this.#isAtEnd()) return false;

    let nextCharacterCode = this.#input.charCodeAt(this.#lexemeCurrentIndex + 1);

    return this.#isAlphaNumeric(nextCharacterCode);
  }

  #prettifyTokenType(tokenTypeName) {
    let name = tokenTypeName.toString().toLowerCase();

    if (tokenTypeName.startsWith('PSEUDO')) {
      name = name.replace('_', '');
      name = name.substring(0, 6) + name[6].toUpperCase() + name.substring(7);
    }

    // Making it plural
    if (tokenTypeName.endsWith('CLASS')) {
      name += 'es';
    } else {
      name += 's';
    }

    return name;
  }

  categorize() {
    this.scan();

    let selectors = {};

    for (let tokenTypeName of Object.keys(TokenType)) {
      selectors[this.#prettifyTokenType(tokenTypeName)] = [];
    }

    for (let token of this.#tokens) {
      // `token.type` returns an integer as defined in `cs_TokenType` Object,
      // and the keys of `selectors` Object are ordered in the same way as `cs_TokenType`,
      // so `Object.keys(selectors)[token.type]` returns the suitable key of `selectors`
      // based on `token.type`.
      selectors[Object.keys(selectors)[token.type]].push(token.lexeme);
    }

    return selectors;
  }
}

function categorizeSelector(selector) {
  let scanner = new Scanner(selector);
  return scanner.categorize();
}

module.exports = categorizeSelector;
