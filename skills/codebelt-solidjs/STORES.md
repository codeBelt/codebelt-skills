# Store Patterns

Where state lives, and how store and context files are laid out. The examples use 2.x syntax; for the 1.x store setter, import and provider, see [Solid Versions](SKILL.md#solid-versions).

## Table of Contents

- [Choosing Where State Lives](#choosing-where-state-lives)
- [Store Folder](#store-folder)
- [Store File Shape](#store-file-shape)
- [Context Files](#context-files)

## Choosing Where State Lives

| State | Where |
|-------|-------|
| Used by one component | Inside that component |
| Shared by a page and its children | Created in the page and passed as props, or a context provided by the page |
| One instance per subtree, or must be per-request on the server | Context (see [Context Files](#context-files)) |
| App-wide, client-only (theme, signed-in user, toasts) | A module store in `stores/{storeName}/` |

Start with the narrowest option. Module stores are singletons shared by everything that imports them; with server rendering, that means shared across **all requests**, so per-user state goes in context instead.

## Store Folder

```text
stores/
└── toastStore/
    ├── toastStore.store.ts       # State and actions
    ├── toastStore.types.ts       # Types
    ├── toastStore.constants.ts   # Defaults, storage keys and static data
    ├── toastStore.utils.ts       # Pure helpers, such as parsing a stored value (optional)
    └── toastStore.test.ts
```

## Store File Shape

```ts
// toastStore.store.ts
import {createRoot, createStore} from 'solid-js';
import type {Toast, ToastState} from './toastStore.types';

const store = createRoot(() => {
  const [state, setState] = createStore<ToastState>({toasts: []});

  return {state, setState};
});

export const toastState = store.state;

export function showToast(toast: Toast): void {
  store.setState((draft) => {
    draft.toasts.push(toast);
  });
}

export function dismissToast(toastId: string): void {
  store.setState((draft) => {
    draft.toasts = draft.toasts.filter((toast) => toast.id !== toastId);
  });
}
```

- **Export read-only state and named action functions; never export the setter.** Every write then goes through a named action, so one search finds every change to the state.
- Module-level reactive code sits inside `createRoot`, as above. That marks it as intentional client-only state, and it's what `eslint-plugin-solid`'s `v2-strict` config expects.
- Types go in `.types.ts`, defaults and storage keys in `.constants.ts`, and pure helpers (such as parsing a value read back from storage) in `.utils.ts`.
- Components import state and actions straight from the `.store.ts` file and read the store directly, so it stays the single source of truth.

## Context Files

Use context when state belongs to one subtree, when you need several independent instances, or when it must be per-request on the server. The provider is a component, so it gets its own folder like any other, in the tier of the subtree it serves (usually the page). The context object and its `use{Name}` function sit beside it in `{ProviderName}.context.ts`.

```ts
// bookingWizardProvider/BookingWizardProvider.context.ts
import {createContext, useContext} from 'solid-js';
import type {BookingWizardContextValue} from './BookingWizardProvider.types';

export const BookingWizardContext = createContext<BookingWizardContextValue>();

// useContext throws when no provider is mounted (in 1.x, check for undefined and throw yourself)
export function useBookingWizard(): BookingWizardContextValue {
  return useContext(BookingWizardContext);
}
```

```text
bookingWizardProvider/
├── BookingWizardProvider.tsx
├── BookingWizardProvider.context.ts
├── BookingWizardProvider.types.ts
└── BookingWizardProvider.constants.ts
```

- Consumers call `use{Name}()`, never `useContext` directly, so every consumer imports the same name and nobody writes `useContext(...)!`.
- The context value exposes state and named actions, not the raw setter, as with module stores.
