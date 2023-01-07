class CategorizeSelector {

    // List of special characters and their corresponding names
    _TOKENS = {
        'elements': '',
        'classes': '.',
        'ids': '#',
        'COLON': ':',
        'ATTRIBUTE_START': '[',
        'ATTRIBUTE_SEPERATOR': '=',
        'ATTRIBUTE_END': ']',
        'SPACE': ' ',
        'EOF': ';' // so we can determine when the selector ends
    }

    _currentTokenName = 'elements';
    _currentString = '';
    _currentPseudoClass = '';
    _currentAttributePair = [];
    _properties = {};

    _propertyExists(tokenName) {
        return Object.keys(this._properties).includes(tokenName);
    }

    /**
     * 
     * - Sets `_currentTokenName` to `tokenName`.
     * - Ignores the 'SPACE' token.
     * - Sets a new key in `_properties` called `tokenName` if
     * `tokenName` does not exist as a key.
     * 
     * @param {string} tokenName 
     * @returns 
     */
    _setCurrentToken(tokenName) {
        this._currentTokenName = tokenName;

        if (tokenName == 'SPACE') return; // Ignore spaces.

        // Making sure if `_properties` has the `tokenName` as a key.
        //
        // 'ATTRIBUTE_START', 'ATTRIBUTE_SEPERATOR' and 'ATTRIBUTE_END' tokens
        // aren't supposed to be keys, so they are ignored.
        if (!this._propertyExists(tokenName) && !(tokenName == 'ATTRIBUTE_START' || tokenName == 'ATTRIBUTE_SEPERATOR' || tokenName == 'ATTRIBUTE_END' || tokenName == 'COLON')) {
            this._properties[tokenName] = [];
        }

        // If `tokenName` is 'ATTRIBUTE_START', we make sure if 'attributes' key
        // exists in `_properties`, and add it if it does not exist.
        if (tokenName == 'ATTRIBUTE_START') {
            if (!this._propertyExists('attributes')) {
                this._properties.attributes = [];
            }
        }

        // If `tokenName` is 'COLON', we make sure if 'pseudoClasses' key
        // exists in `_properties`, and add it if it does not exist.
        if (tokenName == 'COLON') {
            if (!this._propertyExists('pseudoClasses')) {
                this._properties.pseudoClasses = [];
            }
        }
    }

    /**
     * - This method adds the previous token when a new token is processed
     * - Ignores 'ATTRIBUTE_START', 'ATTRIBUTE_SEPERATOR', 'SPACE' tokens.
     * - When it meets 'ATTRIBUTE_END', it adds `_currentAttributePair`
     * to `_properties.attributes`
     */
    _addPreviousToken() {

        // The `_currentTokenName refers to the previous (before the upcoming) token`

        // Ignoring 'ATTRIBUTE_START', 'ATTRIBUTE_SEPERATOR', 'SPACE' tokens
        // If no string is read (_currentString === ''), it returns null.
        if (this._currentTokenName == 'ATTRIBUTE_START' || this._currentTokenName == 'ATTRIBUTE_SEPERATOR' || this._currentString === '' || this._currentTokenName == 'SPACE') return;

        if (this._currentTokenName == 'ATTRIBUTE_END') {
            this._properties.attributes.push(this._currentAttributePair);
        } else if (this._currentTokenName == 'DOUBLE_COLON') { // for `::something-else`
            if (!this._propertyExists('pseudoElements')) {
                this._properties.pseudoElements = [];
            }

            this._properties.pseudoElements.push(this._currentString);
        } else {
            if (this._currentTokenName == 'COLON') {
                this._currentPseudoClass = this._currentString;
                this._properties.pseudoClasses.push(this._currentString);
            } else {
                this._currentPseudoClass = '';
                this._properties[this._currentTokenName].push(this._currentString);
            }
        }

        this._currentString = '';
        this._currentAttributePair = [];
    }

    _analyzeSelector(selector) {
        for (let i = 0; i < selector.length; i++) {
            let char = selector.charAt(i);

            switch (char) {
                case this._TOKENS.classes:
                    this._addPreviousToken();
                    this._setCurrentToken('classes');
                    break;

                case this._TOKENS.ids:
                    this._addPreviousToken();
                    this._setCurrentToken('ids');
                    break;

                case this._TOKENS.COLON:
                    if (this._currentTokenName == 'COLON' && this._currentString == '') {
                                                             // If the `_currentTokenName` is already set to
                                                             // 'COLON' (for when `::selector` is used)
                        this._currentTokenName = 'DOUBLE_COLON';
                    } else {
                        this._addPreviousToken();
                        this._setCurrentToken('COLON');
                        this._currentPseudoClass = '';
                    }
                    break;

                case this._TOKENS.ATTRIBUTE_START:
                    this._addPreviousToken();
                    this._setCurrentToken('ATTRIBUTE_START');
                    break;

                case this._TOKENS.ATTRIBUTE_SEPERATOR:
                    this._setCurrentToken('ATTRIBUTE_SEPERATOR');
                    this._currentAttributePair.push(this._currentString);
                    this._currentString = '';
                    break;

                case this._TOKENS.ATTRIBUTE_END:
                    this._setCurrentToken('ATTRIBUTE_END');
                    this._currentAttributePair.push(this._currentString);
                    break;

                // Here, we do not add arguments of pseudo-class functions that start with
                // 'nth' For example, in `:nth-child(7n+5)` we do not add '7n+5' to `_properties`
                case '(':
                case ')':
                case '+':
                    if (this._currentPseudoClass.startsWith('nth')) {
                        this._currentString = '';
                    } else {
                        this._addPreviousToken();
                    }

                    this._setCurrentToken('SPACE');
                    break;

                case ',':
                case '>':
                case '~':
                case this._TOKENS.SPACE:
                    this._addPreviousToken();
                    this._setCurrentToken('SPACE');
                    break;

                case this._TOKENS.EOF:
                    this._addPreviousToken();
                    break;

                default:
                    this._currentString = this._currentString.concat(char);

                    if (this._currentTokenName == 'elements' || this._currentTokenName == 'SPACE') {
                        this._setCurrentToken('elements');
                    }
            }
        }

        let properties2 = {};

        // Removing duplicates from the values (arrays) of `_properties`
        for (let key in this._properties) {
            if (this._properties[key].length == 0) continue;

            if (!Object.keys(properties2).includes(key)) {
                properties2[key] = [];
            }

            for (let i = 0; i < this._properties[key].length; i++) {
                if (!properties2[key].includes(this._properties[key][i])) {
                    properties2[key].push(this._properties[key][i]);
                }
            }
        }

        return properties2;
    }

    getProperties(selector) {
        if (selector.trim() === '') return {};
        return this._analyzeSelector(selector.trim() + ';');
    }
}

function categorizeSelector(selector) {
    return new CategorizeSelector().getProperties(selector);
}
