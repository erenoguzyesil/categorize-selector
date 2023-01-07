class CategorizeSelector {

    // List of special characters and their corresponding names
    #TOKENS = {
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

    #currentTokenName = 'elements';
    #currentString = '';
    #currentPseudoClass = '';
    #currentAttributePair = [];
    #properties = {};

    #propertyExists(tokenName) {
        return Object.keys(this.#properties).includes(tokenName);
    }

    /**
     * 
     * - Changes `#currentTokenName` to `tokenName`.
     * - Ignores spaces.
     * - Creates a new key in `#properties` if it's the first time `tokenName` is met.
     * 
     * @param {string} tokenName 
     * @returns 
     */
    #setCurrentToken(tokenName) {
        this.#currentTokenName = tokenName;

        if (tokenName == 'SPACE') return; // Ignore spaces.

        // Making sure if `#properties` has this tokenName as a key.
        //
        // 'ATTRIBUTE_START', 'ATTRIBUTE_SEPERATOR' and 'ATTRIBUTE_END'
        // tokens aren't supposed to be keys, so they are ignored.
        if (!this.#propertyExists(tokenName) && !(tokenName == 'ATTRIBUTE_START' || tokenName == 'ATTRIBUTE_SEPERATOR' || tokenName == 'ATTRIBUTE_END' || tokenName == 'COLON')) {
            this.#properties[tokenName] = [];
        }

        // If the token is 'ATTRIBUTE_START', we make sure if 'attributes' key
        // exists in `#properties`, and add it if it doesn't exist.
        if (tokenName == 'ATTRIBUTE_START') {
            if (!this.#propertyExists('attributes')) {
                this.#properties.attributes = [];
            }
        }

        if (tokenName == 'COLON') {
            if (!this.#propertyExists('pseudoClasses')) {
                this.#properties.pseudoClasses = [];
            }
        }
    }

    /**
     * - This method adds the previous token when a new token is processed
     * - Ignores 'ATTRIBUTE_START', 'ATTRIBUTE_SEPERATOR', 'SPACE' token names.
     * - When it meets 'ATTRIBUTE_END', it adds `#properties.attributes`
     * the `#currentAttributePair`
     * - Therefore, every `#currentAttributePair` consists of two elements
     */
    #addPreviousToken() {

        // Ignoring 'ATTRIBUTE_START', 'ATTRIBUTE_SEPERATOR', 'SPACE' tokens
        // If no string is read (#currentString === ''), it doesn't run.
        if (this.#currentTokenName == 'ATTRIBUTE_START' || this.#currentTokenName == 'ATTRIBUTE_SEPERATOR' || this.#currentString === '' || this.#currentTokenName == 'SPACE') return;

        if (this.#currentTokenName == 'ATTRIBUTE_END') {
            this.#properties.attributes.push(this.#currentAttributePair);
        } else if (this.#currentTokenName == 'DOUBLE_COLON') { // for `::selector`
            if (!this.#propertyExists('pseudoElements')) {
                this.#properties.pseudoElements = [];
            }

            this.#properties.pseudoElements.push(this.#currentString);
        } else {
            let string = this.#currentString;

            if (this.#currentTokenName == 'COLON') {
                this.#currentPseudoClass = this.#currentString;
                this.#properties.pseudoClasses.push(string);
            } else { 
                this.#currentPseudoClass = '';
                this.#properties[this.#currentTokenName].push(string);
            }
        }

        this.#currentString = '';
        this.#currentAttributePair = [];
    }

    #analyzeSelector(selector) {
        for (let i = 0; i < selector.length; i++) {
            let char = selector.charAt(i);

            switch (char) {
                case this.#TOKENS.classes:
                    this.#addPreviousToken();
                    this.#setCurrentToken('classes');
                    break;
                
                case this.#TOKENS.ids:
                    this.#addPreviousToken();
                    this.#setCurrentToken('ids');
                    break;
                
                case this.#TOKENS.COLON:
                    if (this.#currentTokenName == 'COLON') { // If the `#currentTokenName` is already set to
                                                              // 'colons' (for when `::selector` is used)
                        this.#currentTokenName = 'DOUBLE_COLON';
                    } else {
                        this.#addPreviousToken();
                        this.#setCurrentToken('COLON');
                    }
                    break;                
                
                case this.#TOKENS.ATTRIBUTE_START:
                    this.#addPreviousToken();
                    this.#setCurrentToken('ATTRIBUTE_START');
                    break;
                
                case this.#TOKENS.ATTRIBUTE_SEPERATOR:
                    this.#setCurrentToken('ATTRIBUTE_SEPERATOR');
                    this.#currentAttributePair.push(this.#currentString);
                    this.#currentString = '';
                    break;
                
                case this.#TOKENS.ATTRIBUTE_END:
                    this.#setCurrentToken('ATTRIBUTE_END');
                    this.#currentAttributePair.push(this.#currentString);
                    break;
                
                // Here, we do not add specific numbers in selectors that start with
                // 'nth' For example, `:nth-child(7n+5)` we do not add '7n+5' to `#properties`
                case '(':
                case ')':
                case '+':
                    if (this.#currentPseudoClass.startsWith('nth')) {
                        this.#currentString = '';
                    } else {
                        this.#addPreviousToken();
                    }

                    this.#setCurrentToken('SPACE');
                    break;
                
                case ',':
                case '>':
                case '~': 
                case this.#TOKENS.SPACE:
                    this.#addPreviousToken();
                    this.#setCurrentToken('SPACE');
                    break;
                
                case this.#TOKENS.EOF:
                    this.#addPreviousToken();
                    break;
                
                default:
                    this.#currentString = this.#currentString.concat(char);

                    if (this.#currentTokenName == 'elements' || this.#currentTokenName == 'SPACE') {
                        this.#setCurrentToken('elements');
                    }
            }
        }

        let properties2 = {};

        // Removing duplicates from the values of `#properties`
        for (let key in this.#properties) {
            if (this.#properties[key].length == 0) continue;
            
            if (!Object.keys(properties2).includes(key)) {
                properties2[key] = [];
            }
                
            for (let i = 0; i < this.#properties[key].length; i++) {
                if (!properties2[key].includes(this.#properties[key][i])) {
                    properties2[key].push(this.#properties[key][i]);
                }
            }
        }

        return properties2;
    }

    getProperties(selector) {
        if (selector.trim() === '') return {};
        return this.#analyzeSelector(selector.trim() + ';');
    }
}

function categorizeSelector(selector) {
    return new CategorizeSelector().getProperties(selector);
}
