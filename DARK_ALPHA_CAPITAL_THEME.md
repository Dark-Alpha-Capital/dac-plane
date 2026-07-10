# Dark Alpha Capital Theme

This project has been transformed into a premium dark-themed tool with Dark Alpha Capital branding.

## What's Changed

### 1. Color Scheme
- **Primary Brand Color**: Gold (#DAA520 equivalent in OKLCH)
- **Background**: Deep charcoal blacks
- **Accents**: Gold gradients with subtle shimmer effects
- **Default Theme**: Dark mode (always enabled)

### 2. Logo & Branding
- Dark Alpha Capital lion logo has been added to all public directories:
  - `/apps/web/public/dac-logo.svg`
  - `/apps/admin/public/dac-logo.svg`
  - `/apps/space/public/dac-logo.svg`
  - `/packages/propel/public/dac-logo.svg`

### 3. Custom Styling Classes

#### Premium Components
```tsx
// Premium card with elevation
<div className="dac-card">
  <h3 className="dac-heading">Title</h3>
  <p>Content</p>
</div>

// Gold accent button
<button className="dac-button-primary">
  Action
</button>

// Glass morphism modal
<div className="dac-glass p-6 rounded-xl">
  Modal content
</div>

// Elevated surface
<div className="dac-elevated p-4">
  Content with subtle elevation
</div>
```

#### Text & Colors
```tsx
// Gold gradient text
<h1 className="dac-text-gold">Dark Alpha Capital</h1>

// Premium heading with gradient
<h2 className="dac-heading">Section Title</h2>

// Gold border
<div className="border-2 dac-border-gold">
  Content
</div>
```

#### Effects
```tsx
// Gold glow effect
<div className="dac-glow-gold">
  Glowing element
</div>

// Gold shadow
<div className="dac-shadow-gold">
  Element with gold shadow
</div>

// Shimmer animation
<div className="dac-shimmer">
  Loading state
</div>
```

#### Inputs & Forms
```tsx
// Premium input field
<input className="dac-input" type="text" placeholder="Enter value" />

// With label
<label>
  <span className="text-secondary mb-2 block">Label</span>
  <input className="dac-input w-full" />
</label>
```

### 4. Logo Usage
```tsx
// In components, use the DAC logo:
<img src="/dac-logo.svg" alt="Dark Alpha Capital" className="h-8 w-auto" />

// With text branding
<div className="dac-logo-container">
  <img src="/dac-logo.svg" alt="DAC" className="h-10 w-auto" />
  <span className="dac-logo-text">Dark Alpha Capital</span>
</div>
```

### 5. Color Variables
Use these CSS variables for custom styling:

```css
--dac-gold: oklch(0.72 0.18 68)
--dac-gold-light: oklch(0.82 0.16 70)
--dac-gold-dark: oklch(0.62 0.20 65)
--dac-black: oklch(0.12 0 0)
--dac-charcoal: oklch(0.18 0 0)
--dac-slate: oklch(0.25 0 0)
```

### 6. Theme Configuration
The app now defaults to dark mode with these changes:
- HTML element has `data-theme="dark"` and `className="dark"`
- Meta theme color is set to dark (`#0a0a0a`)
- All neutral colors adjusted for premium dark aesthetic

## Design Philosophy

The Dark Alpha Capital theme emphasizes:
- **Elegance**: Subtle gold accents on deep blacks
- **Professionalism**: Clean, modern interfaces
- **Hierarchy**: Clear visual separation with elevation and shadows
- **Performance**: Smooth animations and transitions
- **Exclusivity**: Premium feel with gold gradients and glows

## Color Palette

| Color | Value | Usage |
|-------|-------|-------|
| Gold Primary | `oklch(0.72 0.18 68)` | Primary actions, accents |
| Gold Light | `oklch(0.82 0.16 70)` | Highlights, hover states |
| Gold Dark | `oklch(0.62 0.20 65)` | Pressed states, shadows |
| Charcoal | `oklch(0.18 0 0)` | Main background |
| Slate | `oklch(0.25 0 0)` | Elevated surfaces |

## Integration Steps

1. Replace existing logo references with `/dac-logo.svg`
2. Update button styles to use `dac-button-primary`
3. Apply `dac-card` class to card components
4. Use `dac-heading` for important headings
5. Add `dac-input` class to input fields
6. Apply `dac-glow-gold` to featured elements

## Technical Details

- Theme files: `/packages/tailwind-config/dark-alpha-capital.css`
- Color variables: `/packages/tailwind-config/variables.css`
- Logo location: All `/public` folders
- Default theme: Dark (set in layout.tsx files)

---

**Dark Alpha Capital** - Where Excellence Meets Innovation
