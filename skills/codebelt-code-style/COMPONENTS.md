# Component Patterns

## Table of Contents

- [Directory Structure](#directory-structure)
- [Component File Organization](#component-file-organization)
- [Component File Example](#component-file-example)
- [Supporting Files](#supporting-files)
- [Component Hierarchy](#component-hierarchy)
- [Barrel Files Policy](#barrel-files-policy)

## Directory Structure

```text
src/
├── components/
│   ├── pages/                    # Page-level components
│   │   └── userProfilePage/
│   │       ├── UserProfilePage.tsx
│   │       └── profileView/
│   │           ├── ProfileView.tsx
│   │           └── avatarSection/
│   │               └── AvatarSection.tsx
│   ├── shared/                   # Reusable across pages
│   └── ui/                       # Pure presentation components
├── hooks/
│   └── useDebounce/
│       ├── useDebounce.ts
│       └── useDebounce.test.ts
├── libs/                         # Third-party wrappers
├── services/
│   └── hyperion/
│       └── users/
│           ├── usersService.ts
│           ├── usersService.schemas.ts
│           └── usersService.constants.ts
├── styles/
└── utils/
    └── date/
        ├── date.ts               # All utility functions go here
        ├── date.types.ts         # Types (optional)
        ├── date.constants.ts     # Constants (optional)
        └── date.test.ts          # Tests for date.ts
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
  onSelect: (id: string) => void;
};

export function UserCard({user, onSelect}: Props) {
  return <div onClick={() => onSelect(user.id)}>{formatUserName(user.name)}</div>;
}
```

Key rules:
- `type Props` is **never exported** — it's internal to the component
- Use `type` not `interface` for Props
- **One exported component per `.tsx` file** — each file exports exactly one component
- Named export only

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
