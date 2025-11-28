# renderText Function

```jsx
const renderText = (text, className, baseWeight = 400) => {
    return [... text].map((char, i) => (
        <span
            key={i}
            className={className}
            style={{ fontVariationSettings: `'whgt' ${baseWeight}`}}
        >
            {char === " " ? '\u00A0' : char}
        </span>
    ))
};
```

```jsx
const renderText = (text, className, baseWeight = 400) => {}
```
- We are accepting 3 parameters; with one parameter (baseWeight) being assigned a default value (400).


```jsx
return [... text].map((char, i) => (
        <span
            key={i}
            className={className}
            style={{ fontVariationSettings: `'whgt' ${baseWeight}`}}
        >
            {char === " " ? '\u00A0' : char}
        </span>
    ))
```
- `[... text]` -> uses spread operator to convert string into array of individual characters.

- `.map((char, i) => ...)` -> loops through each character and transforms it into a JSX <span> element, creating a new array of <span> elements (char = character, i = index position).

## Visual Flow

```
Input: "Hello"
       ↓
[...text]: ['H', 'e', 'l', 'l', 'o']
       ↓
.map() transforms each character:
       ↓
[
  <span key={0}>H</span>,
  <span key={1}>e</span>, 
  <span key={2}>l</span>,
  <span key={3}>l</span>,
  <span key={4}>o</span>
]
       ↓
Output: Array of JSX elements ready for rendering
```

### Step-by-Step Breakdown:
1. **"Hello"** → Spread operator converts to → **['H', 'e', 'l', 'l', 'o']**
2. **map()** processes each:
   - char='H', i=0 → `<span key={0}>H</span>`
   - char='e', i=1 → `<span key={1}>e</span>`
   - char='l', i=2 → `<span key={2}>l</span>`
   - char='l', i=3 → `<span key={3}>l</span>`
   - char='o', i=4 → `<span key={4}>o</span>`
3. **Result:** Array of 5 span elements that React can render

_________________________________________________________________________________________________________________________________________________________________________
_________________________________________________________________________________________________________________________________________________________________________

# Object Destructuring with Renaming

```jsx
const setupTextHover = (container, type) => {
    if(!container) return;
    
    const letters = container.querySelectorAll("span");

    const { min, max, default: base } = FONT_WEIGHTS[type];
};
```

```jsx
const { min, max, default: base } = FONT_WEIGHTS[type];
```
- **Object destructuring** -> extracts `min`, `max`, and `default` properties from the `FONT_WEIGHTS[type]` object
- **Property renaming** -> `default: base` renames the `default` property to `base` (since `default` is a reserved keyword in JavaScript)

## Visual Flow

```
FONT_WEIGHTS = {
    subtitle: { min: 100, max: 400, default: 100 },
    title: { min: 400, max: 900, default: 400}
}

If type = "subtitle":
FONT_WEIGHTS["subtitle"] = { min: 100, max: 400, default: 100 }
                                ↓
                        Destructuring extracts:
                                ↓
const min = 100;     // from min property
const max = 400;     // from max property  
const base = 100;    // from default property (renamed to base)
```

### Step-by-Step Breakdown:
1. **`FONT_WEIGHTS[type]`** → Gets the object for the specified type
2. **Destructuring** → Extracts the three properties from that object
3. **Renaming** → `default: base` creates a variable named `base` with the value from `default`
4. **Result:** Three separate variables (`min`, `max`, `base`) ready to use

### Why rename `default` to `base`?
- `default` is a reserved keyword in JavaScript (used for exports/imports)
- Can't use reserved words as variable names
- Renaming allows us to use a descriptive variable name instead

