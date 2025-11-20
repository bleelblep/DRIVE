# Page Transitions Demo - Quick Start

## Files Created

1. **page-transitions.js** - Main JavaScript that handles smooth page transitions
2. **page-transitions.css** - CSS animations and View Transitions API styling
3. **transitions-demo.html** - Interactive demo page

## How to Test Locally

### Option 1: Simple HTTP Server (Recommended)

```bash
# If you have Python 3 installed:
python3 -m http.server 8000

# If you have Node.js installed:
npx serve

# If you have PHP installed:
php -S localhost:8000
```

Then open: http://localhost:8000/transitions-demo.html

### Option 2: Direct File Access

You can also open `transitions-demo.html` directly in your browser, but some features may be limited due to CORS restrictions.

## What to Try

1. **Open the demo page** - `transitions-demo.html`

2. **Click navigation links** - Notice how:
   - The logo smoothly morphs between pages
   - The dark mode toggle stays in place
   - Page content elegantly fades and slides
   - Cards scale and transition smoothly

3. **Test browser back/forward** - Transitions work with browser navigation too!

4. **Try dark mode** - Toggle dark mode and navigate to see transitions work in both themes

5. **Check different browsers**:
   - **Chrome/Edge 111+**: Full View Transitions API with smooth morphing
   - **Firefox/Safari**: Graceful fallback with simple fade transitions

## Enable on Your Existing Pages

To add smooth transitions to any of your existing pages, add these lines before `</body>`:

```html
<link rel="stylesheet" href="page-transitions.css">
<script src="page-transitions.js"></script>
```

That's it! The script will automatically:
- Intercept all internal link clicks
- Fetch new pages asynchronously
- Apply smooth transitions
- Handle browser history

## Customization

### Change Animation Duration

Edit `page-transitions.css`:

```css
::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 600ms; /* Change from 400ms */
}
```

### Add Custom Transition Names

In your HTML, add inline styles:

```html
<div style="view-transition-name: my-element;">
  Content
</div>
```

Then define animations in CSS:

```css
::view-transition-old(my-element),
::view-transition-new(my-element) {
  animation-duration: 500ms;
}
```

### Disable Transitions for Specific Links

Add a class or attribute to skip transitions:

```javascript
// In page-transitions.js, modify the click handler:
if (link.classList.contains('no-transition')) {
  return; // Don't intercept
}
```

## Browser DevTools

To inspect transitions in Chrome DevTools:

1. Open DevTools (F12)
2. Go to **Animations** tab (Ctrl+Shift+P → "Show Animations")
3. Click a link to see the transition timeline
4. Slow down animations to see them in detail

## Troubleshooting

### Transitions not working?

1. **Check browser support**: View Transitions API requires Chrome/Edge 111+
   - Other browsers will use simple fade fallback

2. **Open browser console**: Look for JavaScript errors

3. **Verify files are loaded**: Check Network tab in DevTools

4. **Test with HTTP server**: Some features require proper HTTP context

### Transitions too fast/slow?

Adjust animation durations in `page-transitions.css`:

```css
::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 400ms; /* Adjust this value */
}
```

### Elements not morphing?

Make sure both pages have elements with the same `view-transition-name`:

```html
<!-- Page 1 -->
<img style="view-transition-name: logo;" src="logo.png">

<!-- Page 2 -->
<img style="view-transition-name: logo;" src="logo.png">
```

## Performance Tips

1. **Use transform and opacity** - These are GPU-accelerated
2. **Avoid animating layout properties** - width, height, margin, padding
3. **Limit the number of shared elements** - Too many can slow down transitions
4. **Test on slower devices** - Ensure smooth performance across devices

## Next Steps

- Read the full guide: `SMOOTH_PAGE_TRANSITIONS_GUIDE.md`
- Experiment with different easing functions
- Try custom animations for specific pages
- Add loading states for slow connections

## Resources

- [View Transitions API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API)
- [View Transitions Examples](https://glitch.com/@chrome/view-transitions)
- [Can I Use - View Transitions](https://caniuse.com/view-transitions)

---

Enjoy your smooth page transitions! 🎉
