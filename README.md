# categorize-selector

`categorize-selector` is a JS tool that includes the functionality that displays the properties of a CSS selector value grouped by its type of selectors as an Object. 

To use this tool, see the [example below](#example) and call the [`categorizeSelector(selector)`](#categorizeselectorselector-function) function where `selector` is the CSS selector value.

## Installing

You can install the main script file (`categorize-selector.min.js`) into your computer using `curl` in the command line (1.0.1 version):
```
curl -LJO https://cdn.jsdelivr.net/gh/erenoguzyesil/categorize-selector@1.0.1/categorize-selector.min.js
```

You can insert it to your HTML code using CDN:
```
<script src="https://cdn.jsdelivr.net/gh/erenoguzyesil/categorize-selector@1.0.1/categorize-selector.min.js"></script>
```

## Example

```js
let mySelector = 'main.container ul li#first input#number.large[type=number]';
categorizeSelector(mySelector);
```

The code above returns:
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

#### Notes
The possible keys of what this function returns include:
  - `attributes` — e.g. `[type=input]`
  - `classes` — e.g. `.blue-large-btn`
  - `elements` — e.g. `html`
  - `ids` — e.g. `#first-item`
  - `pseudoClasses` — e.g. `:hover`
  - `pseudoElements` — e.g. `::after`
  
The value of each key are `Array`s

If the name of a pseudo-class function (e.g. `:has(), :is(), :nth-child()`) starts with `nth` (e.g. `:nth-child(), :nth-type()`), then the arguments of that function (e.g. `:nth-child(2n+1)`) are ignored and not displayed in the result.

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

The `+~,()> ` operators are ignored.

Attribute pairs are displayed in arrays. 
