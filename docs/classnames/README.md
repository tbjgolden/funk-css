# How class names are generated

There are a few major factors that greatly impact how convenient and powerful
class names are for functional CSS libraries.

1. **Length** - shorter names are more convenient
2. **Predictable (or memorable)** - impractical to learn thousands of seemingly
   random class names
3. **Unambiguous** - New properties added in the future shouldn't result in
   clashes

Finding the intersection of all three of these objectives is not a simple task.

## Why this is hard

To illustrate the problem, consider different ways of generating class names.

### Idea 1: unambigious and predictable, but too long

For example, `width: 100%` becomes `.width:100%`

This solution is predictable and unambigious, but produces long class names when
concatenated with others.

### Idea 2: short and predictable, but ambiguous

For example, `width: 100%` becomes `.w100%`, and `border-width: 2px` becomes
`.bw2`

This solution is short, predictable, but causes ambiguities (i.e. not resilient)

There aren't enough letters of the alphabet to go around:

```none
a -> align,animation,appearance,attachment,action,after,adjust
b -> background,bottom,border,box,basis,break,backface
c -> color,cursor,content,collapse,clear,count,clip,change,column,counter
...
```

This means that full properties clash frequently:

```none
c  -> color,cursor,content,clear,clip
bs -> box-sizing,border-style,box-shadow,background-size,border-spacing
bc -> background-color,border-color,border-collapse,background-clip
```

And even some common full class names (after including the value):

```none
.bcWhite
 ??? border-color: white;
 ??? background-color: white;
```

## Solution

Class names are in the form `{property abbreviation}:{value abbreviation}` -
i.e. the property and value abbreviations are joined with a colon, like a CSS
declaration.

### Property Abbreviations

For property abbreviations, these are made by splitting the property on its
hyphens, abbreviating each part, and joining them back together (without the
hyphens).

For example:

```none
+--------------------+
| border-right-color |
+------|-----|-----|-+
       |     |     |
 .-----------------'
 |     |     |
 |  .--------'             "|>C"
 |  |  |                    ^^^
 |  |  `- border -> "|" ----'||
 |  `---- right  -> ">" -----'|
 `--------color  -> "C" ------'
```

> **Note:**  
> These special characters are valid CSS class names! The CSS rule needs
> escaping, but from within the HTML you'll only need to put
> `class="... |>C:{value abbreviation} ..."`

But wait a second - there can't be an 1 character abbreviation for every
property! ASCII only has 128 characters (and less practically usable), but CSS
has well over 300 different class names!

For this reason only a small number of _property fragments_ (the parts separated
by hyphens) are given 1 character abbreviations, and they have been chosen to be
especially memorable and intuitive.

Every other fragment uses a three letter abbreviation in the form
`<uppercase><lowercase><lowercase>`

```none

+-------------+
| text-indent |
+---|--|------+
    |  |
 .-----'                "TInd"
 |  |                    ^^
 |  `- text -> "T" ------'|
 `---- indent  -> "Ind" --'
```

> **Note:**  
> These class names seem arbitrary and perhaps seem intimidating - but they
> shouldn't!
>
> Some key notes:
>
> - Just as you can generate the abbreviation from the property, you can also do
>   it in reverse: `TInd` -> `T` `Ind` -> text-ind... -> text-indent
> - Usefully no CSS property has the same abbreviation as any other CSS
>   property.
> - With time you will be able to read the class names like the words you're
>   reading now!

The full list of 1 character abbreviations is:

```js
{ align: 'A',
  background: 'B',
  color: 'C',
  display: 'D',
  font: 'F',
  height: 'H',
  margin: 'M',
  padding: 'P',
  overflow: 'O',
  style: 'S',
  text: 'T',
  width: 'W',
  x: 'X',
  y: 'Y',
  z: 'Z',

  border: '|',
  flex: '*',
  grid: '#',
  position: '+',
  transform: '!',
  transition: '~',

  top: '^',
  right: '>',
  left: '<',
  bottom: 'V' }
```

### Value Abbreviations

...tbc...

Currently reading the CSS syntax spec for values 📚
