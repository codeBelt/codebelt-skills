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
│           ├── users.ts
│           ├── users.schemas.ts
│           └── users.constants.ts
├── styles/
└── utils/
    └── date/
        ├── date.ts               # No .utils.ts extension in utils/
        └── date.test.ts
```

## Component File Organization

Components contain **only** JSX, Props type, and hooks. Extract everything else:

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
- One component per file
- Named export only

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
