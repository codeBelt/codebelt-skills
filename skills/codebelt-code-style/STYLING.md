# Styling Patterns

## Table of Contents

- [Tailwind First](#tailwind-first)
- [Global Stylesheet](#global-stylesheet)
- [CSS Modules Fallback](#css-modules-fallback)
- [What Does Not Belong](#what-does-not-belong)
- [Combined Example](#combined-example)

## Tailwind First

Style components with Tailwind utility classes directly in JSX. Tailwind keeps styles co-located with markup, eliminates the need for separate stylesheets per component, and tree-shakes unused classes at build time.

```typescript
// UserCard.tsx
export function UserCard({user}: Props) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 hover:bg-gray-50">
      <img className="h-10 w-10 rounded-full" src={user.avatarUrl} alt="" />
      <span className="font-medium text-gray-900">{user.name}</span>
    </div>
  );
}
```

Compose long class lists with `clsx` (or any equivalent) when classes are conditional. Avoid building className strings with template literals.

## Global Stylesheet

`src/styles/global.css` holds the Tailwind import and any project-wide rules (resets, CSS custom properties, font-face declarations).

```css
/* src/styles/global.css */
@import "tailwindcss";

:root {
  --color-brand: #5b21b6;
}
```

Import it once from the app root (`app/layout.tsx` in Next.js).

## CSS Modules Fallback

When a component needs complex selectors, pseudo-elements, keyframes, or vendor-prefix-heavy CSS that is awkward in Tailwind, fall back to CSS Modules. Co-locate `{Component}.module.css` next to `{Component}.tsx`:

```text
heading/
├── Heading.tsx
└── Heading.module.css
```

```typescript
// Heading.tsx
import styles from './Heading.module.css';

export function Heading({children}: Props) {
  return <h1 className={styles.gradient}>{children}</h1>;
}
```

```css
/* Heading.module.css */
.gradient {
  background: linear-gradient(90deg, #5b21b6, #ec4899);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

The file extension `.module.css` is what scopes the styles — see [SKILL.md](SKILL.md#file-extensions).

## What Does Not Belong

- **Per-component global stylesheets** (`UserCard.css`, `button.css`) — they leak styles across the app. Use Tailwind or `.module.css`.
- **CSS-in-JS runtime libraries** (styled-components, Emotion) — they add runtime cost and fight Tailwind's class-based model.
- **Inline `<style>` tags** inside components — use Tailwind classes or CSS Modules.
- **Sass / Less preprocessors** — Tailwind covers nesting and variables natively.

## Combined Example

A typical component uses Tailwind for layout and spacing, and reaches for CSS Modules only when needed:

```typescript
// FeatureCard.tsx
import styles from './FeatureCard.module.css';

export function FeatureCard({title, body}: Props) {
  return (
    <article className="rounded-xl border border-gray-200 p-6 shadow-sm">
      <h2 className={`text-xl font-semibold ${styles.gradient}`}>{title}</h2>
      <p className="mt-2 text-gray-600">{body}</p>
    </article>
  );
}
```
