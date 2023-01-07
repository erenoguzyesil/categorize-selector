# categorize-selector

You can use this tool to get the categories of a CSS selector in a single `Object`

## Table of Contents

* [Installing](#installing)
* [An Example](#example)
* [Usage](#usage)
  * [categorizeSelector(selector) function](#categorizeselectorselector-function)

## Installing

You can install this into your computer using `curl` in the command line:
```
curl -LJO https://cdn.jsdelivr.net/gh/erenoguzyesil/categorize-selector@master/categorize-selector.min.js
```

You can insert this to your HTML code using CDN:
```
<script src="https://cdn.jsdelivr.net/gh/erenoguzyesil/categorize-selector@master/categorize-selector.min.js"></script>
```

## Example

The code below
```js
let mySelector = 'main.container ul li#first input#number.large[type=number]';
categorizeSelector(mySelector);
```
would return
```js
{
  attributes: [
    ['type', 'number']
  ],
  classes: ['container', 'large'],
  elements: ['main', 'ul', 'li', 'input'],
  ids: ['first', 'number']
}
```

## Usage

### `categorizeSelector(selector)` function

This function takes one `string` argument and returns an `Object`

* The possible keys of the `Object` this function returns are
  - `attributes` — e.g. `[type=input]`
  - `classes` — e.g. `.blue-large-btn`
  - `elements` — e.g. `html`
  - `ids` — e.g. `#first-item`
  - `pseudoClasses` — e.g. `:hover`
  - `pseudoElements` — e.g. `::after`
  
  The values of each key are `Array`s

* The expressions in parentheses of pseudo-class functions, only whose names start with `nth`, are ignored.

```js
categorizeSelector('input:nth-child(odd)');

/*
Returns:

{
  elements: 'input',
  pseudoClasses: 'nth-child'
}

The word 'odd' is ignored.
*/
```

* The operators including `+~,()> ` are ignored.
* Attribute pairs are put in arrays.
