# CodeRabbit Performance Optimization Suggestions

## Dock.jsx Performance Enhancement

### Issue: getBoundingClientRect Performance
The current implementation calls `getBoundingClientRect()` on every mousemove event—once for the dock container and once per icon. For a smooth experience with many icons, this can cause performance issues.

### Suggested Optimization
Caching the dock's bounding rect and only recalculating on resize, plus using requestAnimationFrame to throttle animation updates.

```jsx
// CURRENT IMPLEMENTATION (lines 34-56)
const animateIcons = (mouseX) => {
    const { left } = dock.getBoundingClientRect(); // Called on every mousemove

    icons.forEach((icon) => {
        const { left: iconLeft, width } = icon.getBoundingClientRect();
        const center = iconLeft - left + width / 2;
        const distance = Math.abs(mouseX - center);

        const intensity = Math.exp(-(distance ** 2) / MAGNIFICATION_SPREAD);

        icon._quickScale(1 + 0.20 * intensity);
        icon._quickY(-15 * intensity);
    })
};

const handleMouseMove = (e) => {
    const { left } = dock.getBoundingClientRect(); // Called again here
    animateIcons(e.clientX - left);
};
```

```jsx
// PROPOSED OPTIMIZATION
useGSAP(() => {
    const dock = dockRef.current;
    if (!dock) return;

    const icons = dock.querySelectorAll(".dock-icon");
+   let dockRect = dock.getBoundingClientRect(); // Cache dock rect
+   let rafId = null; // RequestAnimationFrame ID

    // Pre-compile GSAP animations for better performance
    icons.forEach((icon) => {
      icon._quickScale = gsap.quickTo(icon, "scale", {duration: 0.2, ease: "power1.out"});
      icon._quickY = gsap.quickTo(icon, "y", {duration: 0.2, ease: "power1.out"});
      icon._quickScaleReset = gsap.quickTo(icon, "scale", {duration: 0.3, ease: "power1.out"});
      icon._quickYReset = gsap.quickTo(icon, "y", {duration: 0.3, ease: "power1.out"});
    });

    const animateIcons = (mouseX) => {
-       const { left } = dock.getBoundingClientRect();

        icons.forEach((icon) => {
            const { left: iconLeft, width } = icon.getBoundingClientRect();
-           const center = iconLeft - left + width / 2;
+           const center = iconLeft - dockRect.left + width / 2; // Use cached rect
            const distance = Math.abs(mouseX - center);

            const intensity = Math.exp(-(distance ** 2) / MAGNIFICATION_SPREAD);

            icon._quickScale(1 + 0.20 * intensity);
            icon._quickY(-15 * intensity);
        })
    };

    const handleMouseMove = (e) => {
-       const { left } = dock.getBoundingClientRect();
-       animateIcons(e.clientX - left);
+       if (rafId) return; // Throttle with RAF
+       rafId = requestAnimationFrame(() => {
+         animateIcons(e.clientX - dockRect.left);
+         rafId = null;
+       });
    };

+   const handleResize = () => {
+     dockRect = dock.getBoundingClientRect(); // Update cache on resize
+   };

    const resetIcons = () => 
        icons.forEach((icon) => {
            icon._quickScaleReset(1);
            icon._quickYReset(0);
        });
    
    dock.addEventListener('mousemove', handleMouseMove);
    dock.addEventListener('mouseleave', resetIcons);
+   window.addEventListener('resize', handleResize);

    return () => {
        dock.removeEventListener("mousemove", handleMouseMove);
        dock.removeEventListener("mouseleave", resetIcons);
+       window.removeEventListener('resize', handleResize);
+       if (rafId) cancelAnimationFrame(rafId);
    };
}, []);
```

### Benefits of This Optimization:
1. **Reduced DOM queries** - Cache dock rect instead of calling getBoundingClientRect() repeatedly
2. **Throttled animations** - Use requestAnimationFrame to limit animation frequency to 60fps max
3. **Responsive to layout changes** - Update cached rect on window resize
4. **Better performance** - Fewer expensive DOM operations per mousemove event
5. **Proper cleanup** - Cancel pending animation frames on unmount

### Performance Impact:
- **Before**: 2+ getBoundingClientRect() calls per mousemove (potentially 100+ times per second)
- **After**: 1 cached rect + RAF throttling = maximum 60 fps with reduced DOM queries

---

## Implementation Prompt for Later

**TASK**: Apply CodeRabbit's getBoundingClientRect optimization to `src/components/Dock.jsx`

**WHAT TO CHANGE**:
1. Cache `dock.getBoundingClientRect()` result in a variable `dockRect`
2. Add `requestAnimationFrame` throttling to `handleMouseMove`
3. Create `handleResize` function to update cached rect on window resize
4. Update cleanup function to include resize listener and RAF cancellation
5. Replace inline `getBoundingClientRect()` calls with cached `dockRect.left`

**WHY**: Improves performance by reducing expensive DOM queries and throttling animation updates to 60fps max, while maintaining smooth dock magnification effects.

**PRIORITY**: Medium - Performance optimization that will be more noticeable with many dock icons or on lower-end devices.