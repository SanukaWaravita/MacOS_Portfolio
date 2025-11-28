# GSAP QuickTo Performance Optimization

## Before: Traditional gsap.to() Approach

```jsx
const animateIcons = (mouseX) => {
    const { left } = dock.getBoundingClientRect();

    icons.forEach((icon) => {
        const { left: iconLeft, width } = icon.getBoundingClientRect();
        const center = iconLeft - left + width / 2;
        const distance = Math.abs(mouseX - center);

        const intensity = Math.exp(-(distance ** 2) / 500);

        gsap.to(icon, {
            scale: 1 + 0.20 * intensity,
            y: -15 * intensity, 
            duration: 0.2,
            ease: "power1.out",
        })
    })
};

const resetIcons = () => 
    icons.forEach((icon) => 
        gsap.to(icon, {
            scale: 1, 
            y: 0, 
            duration: 0.3, 
            ease: "power1.out",
    }),
);
```

## After: QuickTo Optimization

```jsx
// Setup QuickTo setters for better performance
icons.forEach((icon) => {
  icon._quickScale = gsap.quickTo(icon, "scale", {duration: 0.2, ease: "power1.out"});
  icon._quickY = gsap.quickTo(icon, "y", {duration: 0.2, ease: "power1.out"});
  icon._quickScaleReset = gsap.quickTo(icon, "scale", {duration: 0.3, ease: "power1.out"});
  icon._quickYReset = gsap.quickTo(icon, "y", {duration: 0.3, ease: "power1.out"});
});

const animateIcons = (mouseX) => {
    const { left } = dock.getBoundingClientRect();

    icons.forEach((icon) => {
        const { left: iconLeft, width } = icon.getBoundingClientRect();
        const center = iconLeft - left + width / 2;
        const distance = Math.abs(mouseX - center);

        const intensity = Math.exp(-(distance ** 2) / MAGNIFICATION_SPREAD);

        // Use pre-compiled quickTo setters for better performance
        icon._quickScale(1 + 0.20 * intensity);
        icon._quickY(-15 * intensity);
    })
};

const resetIcons = () => 
    icons.forEach((icon) => {
        icon._quickScaleReset(1);
        icon._quickYReset(0);
    });
```

```jsx
icon._quickScale = gsap.quickTo(icon, "scale", {duration: 0.2, ease: "power1.out"});
```
- **gsap.quickTo()** -> pre-compiles a GSAP animation function for a specific element and property
- **Stored as property** -> `icon._quickScale` attaches the pre-compiled function directly to the DOM element
- **Performance benefit** -> eliminates the overhead of creating new tween objects on every animation call

## Visual Flow

```
Traditional gsap.to() approach:
mousemove event → create new tween object → animate → destroy object → repeat
                     ↓ (expensive operation repeated 60+ times per second)
                  Memory allocation + garbage collection overhead

QuickTo approach:
Setup phase: create pre-compiled tween functions once
             ↓
mousemove event → call pre-compiled function → animate (no object creation)
                     ↓ (lightweight operation)
                  Direct property updates
```

### Step-by-Step Breakdown:
1. **Setup Phase** → Create quickTo functions once during component mount
2. **Storage** → Attach functions to DOM elements as custom properties (`_quickScale`, `_quickY`)
3. **Animation** → Call pre-compiled functions directly instead of creating new tweens
4. **Result** → Same visual effect with significantly better performance

### Why use QuickTo?
- **Eliminates object creation overhead** → No new tween objects created on each animation frame
- **Reduces garbage collection** → Fewer temporary objects to clean up
- **Faster execution** → Pre-compiled tweens execute immediately
- **Memory efficient** → Functions are reused rather than recreated

_________________________________________________________________________________________________________________________________________________________________________
_________________________________________________________________________________________________________________________________________________________________________

# Gaussian Distribution for Magnification Effect

```jsx
const animateIcons = (mouseX) => {
    const { left } = dock.getBoundingClientRect();

    icons.forEach((icon) => {
        const { left: iconLeft, width } = icon.getBoundingClientRect();
        const center = iconLeft - left + width / 2;
        const distance = Math.abs(mouseX - center);

        const intensity = Math.exp(-(distance ** 2) / MAGNIFICATION_SPREAD);

        icon._quickScale(1 + 0.20 * intensity);
        icon._quickY(-15 * intensity);
    })
};
```

```jsx
const intensity = Math.exp(-(distance ** 2) / MAGNIFICATION_SPREAD);
```
- **Gaussian curve formula** -> `Math.exp(-(distance²) / spread)` creates a bell curve falloff
- **distance** -> how far the mouse is from the center of each icon
- **MAGNIFICATION_SPREAD** -> controls how wide the effect spreads (500 = focused on single icon)

## Visual Flow

```
Mouse position relative to dock:
    Icon1   Icon2   Icon3   Icon4   Icon5
      |       |       |       |       |
      50     100     150     200     250
                        ↑
                   Mouse at 150px

Distance calculation for each icon:
Icon1: |150 - 50| = 100px   → intensity = exp(-(100²)/500) = 0.018
Icon2: |150 - 100| = 50px   → intensity = exp(-(50²)/500) = 0.368  
Icon3: |150 - 150| = 0px    → intensity = exp(-(0²)/500) = 1.000   ← Maximum
Icon4: |150 - 200| = 50px   → intensity = exp(-(50²)/500) = 0.368
Icon5: |150 - 250| = 100px  → intensity = exp(-(100²)/500) = 0.018

Animation values applied:
Icon1: scale=1.004, y=-0.27px  (barely visible)
Icon2: scale=1.074, y=-5.52px  (slight effect)
Icon3: scale=1.200, y=-15px    (full magnification)
Icon4: scale=1.074, y=-5.52px  (slight effect)
Icon5: scale=1.004, y=-0.27px  (barely visible)
```

### Step-by-Step Breakdown:
1. **Mouse position** → Get mouse X coordinate relative to dock container
2. **Icon centers** → Calculate center point of each icon
3. **Distance calculation** → Find absolute distance from mouse to each icon center
4. **Gaussian intensity** → Apply exponential falloff formula to create smooth curve
5. **Animation scaling** → Use intensity to scale the magnification effect (0-100%)

### Why use Gaussian distribution?
- **Natural falloff** → Creates smooth, organic-feeling animation curve
- **Focused effect** → Primary animation on target icon, subtle effect on neighbors
- **Adjustable spread** → MAGNIFICATION_SPREAD constant allows easy tuning of effect width
- **Performance** → Simple mathematical formula, very fast to calculate

_________________________________________________________________________________________________________________________________________________________________________
_________________________________________________________________________________________________________________________________________________________________________

# Event Listeners with Cleanup Pattern

```jsx
useGSAP(() => {
    const dock = dockRef.current;
    if (!dock) return;

    // ... setup code ...

    dock.addEventListener('mousemove', handleMouseMove);
    dock.addEventListener('mouseleave', resetIcons);

    return () => {
        dock.removeEventListener("mousemove", handleMouseMove);
        dock.removeEventListener("mouseleave", resetIcons);
    };
}, []);
```

```jsx
return () => {
    dock.removeEventListener("mousemove", handleMouseMove);
    dock.removeEventListener("mouseleave", resetIcons);
};
```
- **Cleanup function** -> returned from useGSAP hook, automatically called on component unmount
- **Memory leak prevention** -> removes event listeners to prevent memory leaks
- **React best practice** -> essential for proper component lifecycle management

## Visual Flow

```
Component Mount:
    ↓
useGSAP hook executes:
    ↓
Setup animations & event listeners:
    dock.addEventListener('mousemove', handleMouseMove)
    dock.addEventListener('mouseleave', resetIcons)
    ↓
Component renders and animations work
    ↓
Component Unmount (user navigates away):
    ↓
Cleanup function executes:
    dock.removeEventListener("mousemove", handleMouseMove)
    dock.removeEventListener("mouseleave", resetIcons)
    ↓
Memory freed, no leaks
```

### Step-by-Step Breakdown:
1. **Component mounts** → useGSAP hook runs setup code
2. **Event listeners added** → dock element starts listening for mouse events
3. **Cleanup function returned** → React stores the cleanup function for later
4. **Component unmounts** → React automatically calls the cleanup function
5. **Event listeners removed** → prevents memory leaks and ghost event handlers

### Why cleanup is crucial?
- **Memory leak prevention** → Without cleanup, event listeners persist after component unmounts
- **Performance** → Prevents accumulation of dead event handlers
- **React requirement** → Following React's effect cleanup pattern
- **GSAP best practice** → Proper animation library integration