# categorize-selector

Break down a CSS selector into categories including elements, classes, IDs, pseudo-elements, pseudo-classes, and attributes!

## Installing

Install using NPM:
```
npm install categorize-selector
```

Or insert this code into your HTML document using CDN:
```html
<script src="https://cdn.jsdelivr.net/gh/erenoguzyesil/categorize-selector@master/index-cdn.min.js"></script>
```

## Usage

If you installed using NPM, require the package in your code and call it:

```js
const categorizeSelector = require('categorize-selector');
categorizeSelector("...your selector goes here...")
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

If you installed using CDN, just call the `categorizeSelector(...)` function in a script connected to your HTML document.

```js
categorizeSelector("...your selector goes here...");
```

Example:

```js
const cs = categorizeSelector;

cs(".blue.rounded");
/* ^ returns:
{
  ...,
  "classes": ["blue", "rounded"],
  ...
}
*/

```
