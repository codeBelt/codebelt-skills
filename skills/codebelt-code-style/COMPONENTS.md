# Component Patterns

## Table of Contents

- [Directory Structure](#directory-structure)
- [Component Tiers](#component-tiers)
- [Component File Organization](#component-file-organization)
- [Component File Example](#component-file-example)
- [Event Handlers](#event-handlers)
- [Computed Values](#computed-values)
- [Dynamic Imports](#dynamic-imports)
- [One Component Per File](#one-component-per-file)
- [Supporting Files](#supporting-files)
- [Page-Level Supporting Files](#page-level-supporting-files)
- [Polymorphic UI Components](#polymorphic-ui-components)
- [Generic Components](#generic-components)
- [Component Hierarchy](#component-hierarchy)
- [Barrel Files Policy](#barrel-files-policy)

## Directory Structure

```text
src/
├── app/                           # Next.js app router (route files only)
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/                        # Pure presentational primitives (Button, Heading)
│   │   └── heading/
│   │       └── Heading.tsx
│   ├── shared/                    # Domain-aware components used by multiple pages
│   │   └── userCard/
│   │       └── UserCard.tsx
│   └── pages/                     # Page components and their nested children
│       └── usersPage/
│           ├── UsersPage.tsx
│           ├── UsersPage.types.ts     # Shared by nested children
│           ├── UsersPage.utils.ts     # Mappers / helpers for the page
│           └── userList/
│               └── UserList.tsx
├── hooks/
│   └── useDebounce/
│       ├── useDebounce.ts
│       └── useDebounce.test.ts
├── libs/                          # Third-party wrappers
├── services/
│   └── users/
│       ├── usersService.ts
│       ├── usersService.schemas.ts
│       └── usersService.constants.ts
├── stores/
│   └── themeStore/
│       └── themeStore.store.ts
├── styles/
│   └── global.css                 # Tailwind import + project-wide rules
└── utils/
    └── date/
        ├── date.ts               # All utility functions go here
        ├── date.types.ts         # Types (optional)
        ├── date.constants.ts     # Constants (optional)
        └── date.test.ts          # Tests for date.ts
```

## Component Tiers

There are three tiers, distinguished by what the component knows about and how widely it is reused. Picking the right tier up front prevents shared/ from becoming a graveyard of half-generic widgets.

| Tier | Knows about your domain? | Reused across pages? | Examples |
|------|--------------------------|----------------------|----------|
| `components/ui/` | No — takes only primitives + style props | Yes, anywhere | `Button`, `Heading`, `Input`, `Modal` |
| `components/shared/` | Yes — imports domain types | Yes, by 2+ pages | `UserCard`, `OrderSummary` |
| `components/pages/{page}/` | Yes | No — only this page | `UsersPage`, `UserList`, page-local children |

### Decision tree

1. **Could this component be lifted into any TypeScript/React project unchanged?** → `ui/`. UI primitives must not import from `services/`, `stores/`, or domain types.
2. **Does it carry domain meaning AND is it already imported by two or more pages?** → `shared/`.
3. **Otherwise** → nest under the page that uses it: `components/pages/{pageName}/{childName}/`.

### Page-local first; promote on second use

New components start page-local. Only when a *second* page needs the same component do you move it into `shared/`. This is deliberate — a component built for one caller is concrete and easy to change; a component built for hypothetical reuse drifts toward configurability and lock-in.

```text
// Day 1: only UsersPage needs UserCard — nest it.
components/pages/usersPage/userCard/UserCard.tsx

// Day 30: TeamPage also imports UserCard. Move it now.
components/shared/userCard/UserCard.tsx
```

## Component File Organization

A `.tsx` file contains **only** the component function, its `Props` type, and hook calls. Extract everything else — this includes all constants (arrays, objects, primitive values), all types beyond Props, and all helper functions:

```text
userCard/
├── UserCard.tsx           # Component + Props type only
├── UserCard.types.ts      # All other types
├── UserCard.constants.ts  # All constants
└── UserCard.utils.ts      # All helper functions
```

## Component File Example

```typescript
// UserCard.tsx
import {formatUserName} from './UserCard.utils';
import type {User} from './UserCard.types';

type Props = {  // Never export Props
  user: User;
  onSelect: (userId: string) => void;
};

export function UserCard({user, onSelect}: Props) {
  return <div onClick={() => onSelect(user.id)}>{formatUserName(user.name)}</div>;
}
```

Key rules:
- `type Props` is **never exported** — it's internal to the component
- Always named `Props` (never `UserCardProps`, `IProps`, etc.)
- Use `type` not `interface` for Props
- Always destructure props in the function signature (never in the body)
- Use `function` keyword for components (not arrow functions)
- **One component per `.tsx` file** — each file has exactly one component
- Named export only (see [SKILL.md](SKILL.md#exports) for the Next.js exception)
- Callback props use `on` prefix (`onSelectUser`, `onSubmit`), internal handlers use `handle` prefix (`handleSubmit`, `handleClick`). Prefer descriptive names (`onSelectUser`) over generic ones (`onSelect`) when the surrounding component name doesn't already make the intent obvious.

## Event Handlers

**Inline** event handlers when they simply forward to a prop or call a function with straightforward arguments. **Extract** to a named function only when there is real logic (state updates, conditionals, transformations, multiple steps).

```typescript
// ✅ Inline — just forwarding a call, no logic
<Button label="Delete" onClick={() => onDelete(userId)} />
<input onChange={(event) => onSearchChange(event.target.value)} />
<li onClick={() => onSelect(item.id)} />

// ✅ Extracted — has actual logic
const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  const errors = validate(formData);
  if (Object.keys(errors).length === 0) {
    onSubmit(formData);
  }
};

const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
  const updatedCategories = selectedCategories.includes(event.target.value)
    ? selectedCategories.filter((category) => category !== event.target.value)
    : [...selectedCategories, event.target.value];

  onFilterChange(updatedCategories);
};
```

```typescript
// ❌ Wrong — unnecessary wrapper around a simple call
const handleDeleteClick = (event: React.MouseEvent<HTMLButtonElement>) => {
  onDelete(userId);
};
<Button onClick={handleDeleteClick} />

// ✅ Right — inline it
<Button onClick={() => onDelete(userId)} />
```

## Computed Values

Wrap derived values in `useMemo` when the computation returns a **new reference** (array, object) or is expensive. Without `useMemo`, a new reference is created every render, causing unnecessary re-renders of child components that receive it as a prop.

```typescript
// ❌ Wrong — creates a new array every render, children always re-render
const sortedItems = sortItems(items, sortState);
const filteredUsers = users.filter((user) => user.isActive);
const chartData = buildChartData(rawData);

// ✅ Right — stable reference, children only re-render when inputs change
const sortedItems = useMemo(() => sortItems(items, sortState), [items, sortState]);
const filteredUsers = useMemo(() => users.filter((user) => user.isActive), [users]);
const chartData = useMemo(() => buildChartData(rawData), [rawData]);
```

Primitive values (strings, numbers, booleans) do not need `useMemo` — they are compared by value, not reference.

```typescript
// No useMemo needed — primitives
const totalCount = items.length;
const isDisabled = items.length === 0;
const label = `${firstName} ${lastName}`;
```

## Dynamic Imports

Use a `.dynamic.tsx` file to lazy-load client-only components with Next.js `dynamic()` and `ssr: false`. This is for components that use browser-only APIs (window, localStorage, etc.) or should be excluded from server-side rendering.

```text
devToolbar/
├── DevToolbar.tsx              # The actual component
├── DevToolbar.dynamic.tsx      # Dynamic wrapper — consumers import this
├── DevToolbar.types.ts
└── DevToolbar.constants.ts
```

### Dynamic File Pattern

```typescript
// DevToolbar.dynamic.tsx
'use client';
import dynamic from 'next/dynamic';
import type {DevToolbar} from './DevToolbar';

export const DevToolbarDynamic = dynamic(() => import('./DevToolbar').then((mod) => mod.DevToolbar), {
  ssr: false,
}) as typeof DevToolbar;
```

Key rules:
- File uses the **`.dynamic.tsx`** extension
- Always has the **`'use client'`** directive
- Exports a **`{ComponentName}Dynamic`** named export (not default)
- Uses `import('./ComponentName').then((mod) => mod.ComponentName)` because we use **named exports** (no default exports)
- Casts the result as **`typeof ComponentName`** for type safety
- Consumers import the `Dynamic` variant instead of the original component

### When to Use

- Components that access `window`, `document`, `localStorage`, or other browser-only APIs
- Heavy client-side libraries (charts, editors, maps) that should be code-split
- Dev-only tools that should not bloat the server bundle

### Consuming Dynamic Components

```typescript
// Import the dynamic version, not the original
import {DevToolbarDynamic} from '@/components/ui/devToolbar/DevToolbar.dynamic';

export function AppLayout({children}: Props) {
  return (
    <div>
      {children}
      <DevToolbarDynamic />
    </div>
  );
}
```

## One Component Per File

Each `.tsx` file contains **exactly one React component** — no exceptions. Every component, no matter how small, gets its own subfolder and file.

```typescript
// ❌ Wrong — two components in one file (even if the helper is not exported)
// UserCard.tsx
function CardBadge({status}: {status: string}) {
  return <span className={status}>{status}</span>;
}

export function UserCard({user}: Props) {
  return (
    <div>
      <CardBadge status={user.status} />
      {user.name}
    </div>
  );
}

// ✅ Right — every component in its own subfolder
// UserCard.tsx
import {CardBadge} from './cardBadge/CardBadge';

export function UserCard({user}: Props) {
  return (
    <div>
      <CardBadge status={user.status} />
      {user.name}
    </div>
  );
}

// cardBadge/CardBadge.tsx
export function CardBadge({status}: Props) {
  return <span className={status}>{status}</span>;
}
```

```text
userCard/
├── UserCard.tsx
├── cardBadge/
│   └── CardBadge.tsx
└── cardActions/
    └── CardActions.tsx
```

## Supporting Files

```typescript
// UserCard.types.ts
export type User = {
  id: string;
  name: string;
  status: 'active' | 'inactive';
};

// UserCard.constants.ts
export const maxNameLength = 30;

// UserCard.utils.ts
import {maxNameLength} from './UserCard.constants';

export function formatUserName(name: string): string {
  return name.length > maxNameLength ? `${name.slice(0, maxNameLength)}...` : name;
}
```

## Page-Level Supporting Files

Page components follow the same supporting-file rules as any other component, with one addition: `{PageName}.types.ts` and `{PageName}.utils.ts` are the canonical home for **types and helpers that multiple nested children need**.

```text
usersPage/
├── UsersPage.tsx
├── UsersPage.types.ts       # UserDisplay, UserStatus — used by UserList and UserCard
├── UsersPage.utils.ts       # mapUserToDisplay() — called by UsersPage, reused by tests
├── userList/
│   └── UserList.tsx         # imports UserDisplay from '../UsersPage.types'
└── userCard/
    └── UserCard.tsx         # imports UserDisplay from '../../UsersPage.types'
```

```typescript
// usersPage/UsersPage.types.ts
export type UserStatus = 'active' | 'inactive';

export type UserDisplay = {
  id: string;
  name: string;
  status: UserStatus;
};

// usersPage/userCard/UserCard.tsx
import type {UserDisplay} from '../UsersPage.types';

type Props = {user: UserDisplay};

export function UserCard({user}: Props) { /* ... */ }
```

Key rules:
- Children **import directly** from `{PageName}.types.ts` — never create a `UserCard.types.ts` that re-exports the parent's types. Re-exports create two import paths for one type and the codebase drifts.
- If a type is used by only one child, keep it in that child's `.types.ts`. Promote it to `{PageName}.types.ts` only when a second child needs it (same rule as page-local → shared).
- `{PageName}.utils.ts` holds page-scoped mappers, formatters, and pure helpers. Anything reused outside the page belongs in `utils/`.

## Polymorphic UI Components

UI primitives often need to render different underlying elements while keeping one API — a `Heading` that can be `h1` through `h6`, a `Button` that can be `button` or `a`. Encode the variation as a typed prop, not as multiple components.

```typescript
// ui/heading/Heading.tsx
type Props = {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: React.ReactNode;
  className?: string;
};

export function Heading({level, children, className}: Props) {
  const Tag = `h${level}` as const;
  return <Tag className={className}>{children}</Tag>;
}
```

Key rules:
- Constrain the polymorphic axis with a literal union (`1 | 2 | 3 | 4 | 5 | 6`), not `number` or `string`.
- UI primitives expose `className` so callers can layer Tailwind classes — they don't bake in domain-specific styling.
- Do not import domain types or services from `ui/` components. If you need to, the component belongs in `shared/`.

## Generic Components

Any component that operates on a value whose shape isn't known until the call site should be **generic over that value's type**, not typed with `any`, `unknown`, or a hand-rolled union. This applies to lists, tables, selects, comboboxes, autocompletes, dialogs that return a result — anything where the caller picks the data shape and the component just renders or forwards it.

The payoff: the callback the consumer passes is type-checked end-to-end. No casts, no `as`, no "I know this is a User" comments.

```typescript
// ui/list/List.tsx
type Props<TItem> = {
  items: TItem[];
  getKey: (item: TItem) => string;
  renderItem: (item: TItem) => React.ReactNode;
  onSelect?: (item: TItem) => void;
};

export function List<TItem>({items, getKey, renderItem, onSelect}: Props<TItem>) {
  return (
    <ul>
      {items.map((item) => (
        <li key={getKey(item)} onClick={() => onSelect?.(item)}>
          {renderItem(item)}
        </li>
      ))}
    </ul>
  );
}
```

```typescript
// Consumer — TItem is inferred as User; onSelect is typed as (item: User) => void.
<List
  items={users}
  getKey={(user) => user.id}
  renderItem={(user) => <UserCard user={user} />}
  onSelect={(user) => console.log(user.email)}
/>
```

### Generic Polymorphic Components

Generics and polymorphism compose. A `Select` that accepts any value type:

```typescript
type Props<TValue extends string | number> = {
  options: ReadonlyArray<{value: TValue; label: string}>;
  value: TValue;
  onChange: (value: TValue) => void;
};

export function Select<TValue extends string | number>({options, value, onChange}: Props<TValue>) {
  return (
    <select value={value} onChange={(event) => onChange(event.target.value as TValue)}>
      {options.map((option) => (
        <option key={String(option.value)} value={option.value}>{option.label}</option>
      ))}
    </select>
  );
}
```

Key rules:
- Name type parameters with a **`T` prefix** (`TItem`, `TValue`, `TRow`). A single-letter `T` is fine for one parameter, but multiple parameters become unreadable without descriptive names.
- **Constrain the parameter** when the component relies on shape (`TItem extends {id: string}`) or kind (`TValue extends string | number`). Unconstrained generics accept `void` and `never`, which is rarely what you want.
- Put the generic on the **function signature**, not the `Props` type alone — the function is what infers the type at the call site.
- Prefer generics over `any` or `unknown` for callbacks the consumer provides. `any` defeats inference; `unknown` forces the consumer to narrow.
- Don't reach for generics if a literal union does the job. `level: 1 | 2 | 3 | 4 | 5 | 6` is clearer than `<TLevel extends number>`. Generics earn their cost when the *consumer's* type is what varies.

## Component Hierarchy

Subcomponents belong to the component that imports them. Siblings and children are nested accordingly:

```text
announcementsPage/
├── AnnouncementsPage.tsx           # List page
└── announcementPage/               # Detail page (sibling)
    ├── AnnouncementPage.tsx
    └── announcementForm/           # Child of AnnouncementPage
        └── AnnouncementForm.tsx
```

## Barrel Files Policy

**Do not use barrel files (`index.ts`/`index.js`) in application code.**

Barrel files cause:
- **Circular imports**: Easy to accidentally create import cycles
- **Slow development**: Loading a barrel loads all modules it exports
- **Hard to optimize**: Bundlers struggle to tree-shake barrel imports

### Wrong

```typescript
// components/ui/index.ts — DO NOT DO THIS
export {Button} from './button/Button';
export {Input} from './input/Input';

// Usage creates circular import risk
import {Button} from '@/components/ui';
```

### Right

```typescript
// Import directly from the module
import {Button} from '@/components/ui/button/Button';
import {Input} from '@/components/ui/input/Input';
```

### Exception: NPM Libraries

Barrel files are **only** acceptable as the single entry point for npm packages:

```typescript
// packages/my-library/index.ts (package.json "main" field)
export {Button} from './components/Button';
export {useTheme} from './hooks/useTheme';
```
