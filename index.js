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
  constructor(input) {
    this._input = input;
    this._lexemeStartIndex = -1;
    this._lexemeCurrentIndex = -1;
    this._tokens = [];
    
    this._characterToTokenType = {
      '.': TokenType.CLASS,
      '#': TokenType.ID,
    };  
  }

  scan() {
    while (!this._isAtEnd()) {
      this._startNewLexeme();
      let character = this._input.charAt(this._lexemeCurrentIndex);

      switch (character) {
        case '.':
        case '#': {
          let tokenType = this._characterToTokenType[character];

          while (this._isNextCharacterAlphaNumeric()) {
            this._lexemeCurrentIndex += 1;
          }

          this._addToken(
            tokenType,
            this._input.substring(this._lexemeStartIndex + 1, this._lexemeCurrentIndex + 1)
          );
          break;
        }

        case ':': {
          let tokenType = TokenType.PSEUDO_CLASS;
          let indexIncrement = 1; // to remove the prefix (: or ::) from the pseudo-element/pseudo-class

          do {
            if (this._checkNextCharacter(':')) {
              tokenType = TokenType.PSEUDO_ELEMENT;
              indexIncrement = 2;
            }

            this._lexemeCurrentIndex += 1;
          } while (this._isNextCharacterAlphaNumeric());

          let lexeme = this._input.substring(
            this._lexemeStartIndex + indexIncrement,
            this._lexemeCurrentIndex + 1
          );

          if (
            tokenType === TokenType.PSEUDO_CLASS &&
            lexeme.toLowerCase().startsWith('nth') &&
            this._checkNextCharacter('(')
          ) {
            this._lexemeCurrentIndex += 1;

            while (!this._checkNextCharacter(')') && !this._isAtEnd()) {
              this._lexemeCurrentIndex += 1;
            }
          }

          this._addToken(tokenType, lexeme);

          break;
        }

        case '[': {
          let attributePair = { key: '', value: '' };

          while (!this._checkNextCharacter(']') && !this._isAtEnd()) {
            this._lexemeCurrentIndex += 1;

            if (this._input.charAt(this._lexemeCurrentIndex) === '=') {
              attributePair.key = this._input
                .substring(this._lexemeStartIndex + 1, this._lexemeCurrentIndex)
                .trim();

              // To start scanning the part after the '=' sign in an attribute pair, ([key=value])
              // we set `_lexemeStartIndex` to the index of the '=' sign (_lexemeCurrentIndex)
              // and continue scanning until the next character is '['.
              this._lexemeStartIndex = this._lexemeCurrentIndex;
            }
          }

          attributePair.value = this._input
            .substring(this._lexemeStartIndex + 1, this._lexemeCurrentIndex + 1)
            .trim();

          // When there is no = sign in the attribute selector, `attributePair.key` is empty. (e.g. [disabled])
          // So, we set `key` to `value` (e.g. [disabled] becomes [disabled=disabled]).
          if (attributePair.key === '') {
            attributePair.key = attributePair.value;
          }

          this._addToken(TokenType.ATTRIBUTE, Object.freeze(attributePair));
          break;
        }

        default: {
          let characterCode = this._input.charCodeAt(this._lexemeCurrentIndex);

          if (this._isAlphaNumeric(characterCode)) {
            while (this._isNextCharacterAlphaNumeric()) {
              this._lexemeCurrentIndex += 1;
            }

            this._addToken(
              TokenType.ELEMENT,
              this._input.substring(this._lexemeStartIndex, this._lexemeCurrentIndex + 1)
            );
          }
        }
      }
    }
  }

  _isAtEnd() {
    return this._lexemeCurrentIndex + 1 >= this._input.length;
  }

  _startNewLexeme() {
    this._lexemeCurrentIndex += 1;
    this._lexemeStartIndex = this._lexemeCurrentIndex;
  }

  _addToken(tokenType, lexeme) {
    if (tokenType !== TokenType.ATTRIBUTE && lexeme.trim() === '') return false;

    if (tokenType === TokenType.ATTRIBUTE && (lexeme.key === '' || lexeme.value === '')) {
      return false;
    }

    this._tokens.push(new Token(tokenType, lexeme));
  }

  _checkNextCharacter(expectedCharacter) {
    if (this._isAtEnd()) return false;

    return this._input.charAt(this._lexemeCurrentIndex + 1) === expectedCharacter;
  }

  // also returns true if the character is a hyphen or an underscore
  _isAlphaNumeric(characterCode) {
    return (
      (characterCode > 47 && characterCode < 58) || // [0-9]
      (characterCode > 64 && characterCode < 91) || // [A-Z]
      (characterCode > 96 && characterCode < 123) || // [a-z]
      characterCode === 45 || // - (hyphen)
      characterCode === 95 // _ (underscore)
    );
  }

  _isNextCharacterAlphaNumeric() {
    if (this._isAtEnd()) return false;

    let nextCharacterCode = this._input.charCodeAt(this._lexemeCurrentIndex + 1);

    return this._isAlphaNumeric(nextCharacterCode);
  }

  _prettifyTokenType(tokenTypeName) {
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
      selectors[this._prettifyTokenType(tokenTypeName)] = [];
    }

    for (let token of this._tokens) {
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
