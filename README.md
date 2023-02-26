# categorize-selector

`categorize-selector` is a Javascript tool that can break a complex CSS selector into pieces by grouping it in key-value pairs.

Take a look at the [demo](https://erenoguzyesil.github.io/categorize-selector/).

## Installing

Install the script file (`categorize-selector.min.js`) into your computer using `curl` in the command line (1.0.1 version):
```
curl -LJO https://cdn.jsdelivr.net/gh/erenoguzyesil/categorize-selector@1.0.1/categorize-selector.min.js
```

Or insert it to your HTML code using CDN:
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

## Notes

- The `categorizeSelector(selector)` function takes one `string` argument as `selector` and returns an `Object`

- The possible keys of the returned `Object` include
  - `attributes (key=value)`
  - `classes (.class)`
  - `elements (element)`
  - `ids (#id)`
  - `pseudoClasses (:hover)`
  - `pseudoElements (::after)`
  
- The value of each key is an `Array`

- If the name of a pseudo-element function (`:is(...), :has(...), :nth-child(...)`) starts with `nth` (`:nth-child(), :nth-type()`), the argument of that function is not displayed.

**Example:**
```js
let x = categorizeSelector(":nth-child(even)");

// The value of `x` doesn't include the word `even`:

{
  pseudoClasses: ['nth-child']
}

```

- The `+~,()>` characters are not displayed.

- Attribute pairs are put in arrays (e.g. `['type', 'input']`)
