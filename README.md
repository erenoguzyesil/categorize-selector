# categorize-selector

Break down a CSS selector into categories including elements, classes, IDs, pseudo-elements, pseudo-classes, and attributes!

## Installing

Install using NPM:
```
npm install categorize-selector
```

Or insert the CDN into your HTML document:
```html
<script src="https://cdn.jsdelivr.net/gh/erenoguzyesil/categorize-selector@master/index-cdn.min.js"></script>
```

## Usage

If you installed using NPM, require the package in your code and call it:

```js
const categorizeSelector = require('categorize-selector');
categorizeSelector('...your selector goes here...');
```

Example:

```js
const cs = require('categorize-selector');

let selector = 'body section#second button.rounded-blue[disabled]:hover';
let categories = cs(selector);

categories;
/* ^ returns:
{
  "elements": ["body", "section", "button"],
  "classes": ["rounded-blue"],
  "ids": ["second"],
  "pseudoElements": [],
  "pseudoClasses": ["hover"],
  "attributes": [ {key: "disabled", value: "disabled"} ]
}
*/

categories.elements; //=> ["body", "section", "blue"]
categories.classes; //=> ["rounded-blue"]
categories.ids; //=> ["#second"]
categories.attributes; //=> [ {key: "disabled", value: "disabled"} ]
```

If you installed using the CDN, just call the `categorizeSelector(...)` function in a script connected to your HTML document.

```js
categorizeSelector('...your selector goes here...');
```

Example:

```js
const cs = categorizeSelector;

cs('.blue.rounded');
/* ^ returns:
{
  ...,
  "classes": ["blue", "rounded"],
  ...
}
*/
```

## Notes

- `categorizeSelector(selector)` function expects a `String` argument and returns `Object`.
- If a pseudo-class has a name that starts with *`nth`*, then the argument of the pseudo-class inside parentheses will be ignored.
  Example:
  ```js
  categorizeSelector('h1:nth-child(2n + 10)');
  /* ^ returns:
  {
    "elements": [ "h1" ],
    "classes": [],
    "ids": [],
    "pseudoElements": [],
    "pseudoClasses": [
      "nth-child"
    ],
    "attributes": []
  }
  */
  ```
- The `index.min.js` file is the minified version of `index.js` with a few more differences: the classes in `index.min.js` are prefixed with *`cs_`*.
  This way, the class names in `index.min.js` do not overlap with those of another script when `index.min.js` is imported through a CDN, and there are
  possibly more scripts.
- All non-alphanumerical characters except for a hyphen and an underscore that are not inside an attribute selector are ignored as of v1.1.0.
- Attribute selectors produce an `Object` in the form of `{ key: "...", value: "..." }` as of v1.1.0.
- If an attribute selector only has one *value* inside square brackets, then both `key` and `value` fields for that selector will be that *value*.
  Example:
  ```js
  categorizeSelector('button[disabled][something-else]');
  /* ^ returns
  {
    ...,
    "attributes": [
      { key: "disabled", value: "disabled" },
      { key: "something-else", value: "something-else" }
    ]
  }
  */
  ```
  
