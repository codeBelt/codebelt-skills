# Store Patterns

## Table of Contents

- [Store Structure](#store-structure)
- [Universal Rules](#universal-rules)
- [Consuming Stores in Components](#consuming-stores-in-components)
- [Library Examples](#library-examples)
  - [Classy Store](#classy-store)
  - [Zustand](#zustand)
  - [MobX](#mobx)
- [Persistence](#persistence)

## Store Structure

Stores live in `stores/{storeName}/` and follow the same supporting-file conventions as components. The main file uses the `.store.ts` extension regardless of which library powers it:

```text
stores/
└── modelStore/
    ├── modelStore.store.ts       # Store definition + selector hook
    ├── modelStore.constants.ts   # Default values and static data
    ├── modelStore.types.ts       # TypeScript types
    └── modelStore.utils.ts       # Helper functions
```

## Universal Rules

These apply regardless of state library:

- Store files use the **`.store.ts`** extension.
- Store files have **`'use client'`** at the top — stores hold mutable state, run in the browser, and are consumed by client components.
- Each store exports **two things**: the store instance and a typed **selector hook** (`useModelStore`) that lets components subscribe to a slice of state. MobX is the exception: it tracks reads automatically, so components are wrapped in `observer` instead (see [MobX](#mobx)).
- Use **derived/computed values** instead of duplicating state. Most libraries support this via getters, computed selectors, or memoized selectors.
- Supporting files (`.types.ts`, `.constants.ts`, `.utils.ts`) follow the same conventions as components (see [COMPONENTS.md](COMPONENTS.md#supporting-files)).
- Only persist properties that need to survive a page refresh — not the entire store.

## Consuming Stores in Components

Always go through the selector hook so the component re-renders only when the selected slice changes:

```typescript
import {useModelStore, modelStore} from '@/stores/modelStore/modelStore.store';

export function ModelSelector() {
  const activeModel = useModelStore((store) => store.activeModel);
  const models = useModelStore((store) => store.models);

  return (
    <select value={activeModel?.id} onChange={(event) => modelStore.setActiveModel(event.target.value)}>
      {models.map((model) => (
        <option key={model.id} value={model.id}>{model.name}</option>
      ))}
    </select>
  );
}
```

The component imports the selector hook for reads and the store instance for writes. Both come from the same `.store.ts` file.

With Zustand, derived values like `activeModel` are selector functions rather than getters, so the read becomes `useModelStore(selectActiveModel)` (see [Zustand](#zustand)).

## Library Examples

The same `modelStore` (a list of models, an active model id, and a setter) implemented three ways. Each example assumes the file lives at `stores/modelStore/modelStore.store.ts`.

### Classy Store

```typescript
'use client';

import {createClassyStore} from '@codebelt/classy-store';
import {createStoreHook} from '@codebelt/classy-store/react';
import {defaultModelId} from './modelStore.constants';
import type {Model} from './modelStore.types';

class ModelStore {
  models: Model[] = [];
  activeModelId: string = defaultModelId;

  get activeModel(): Model | undefined {
    return this.models.find((model) => model.id === this.activeModelId);
  }

  setActiveModel(modelId: string): void {
    this.activeModelId = modelId;
  }

  setModels(models: Model[]): void {
    this.models = models;
  }
}

export const modelStore = createClassyStore(new ModelStore());
export const useModelStore = createStoreHook(modelStore);
```

State updates happen through **direct property mutation** inside methods — Classy Store tracks changes automatically. Computed values use `get` accessors. `createStoreHook` returns the typed selector hook — no manual wrapper needed.

### Zustand

```typescript
// modelStore.types.ts
export type Model = {
  id: string;
  name: string;
};

export type ModelStoreState = {
  models: Model[];
  activeModelId: string;
  setActiveModel: (modelId: string) => void;
  setModels: (models: Model[]) => void;
};
```

```typescript
// modelStore.utils.ts
import type {Model, ModelStoreState} from './modelStore.types';

export function selectActiveModel(state: ModelStoreState): Model | undefined {
  return state.models.find((model) => model.id === state.activeModelId);
}
```

```typescript
// modelStore.store.ts
'use client';

import {create} from 'zustand';
import {defaultModelId} from './modelStore.constants';
import type {Model, ModelStoreState} from './modelStore.types';

export const useModelStore = create<ModelStoreState>()((set) => ({
  models: [],
  activeModelId: defaultModelId,
  setActiveModel: (modelId) => set({activeModelId: modelId}),
  setModels: (models) => set({models}),
}));

export const modelStore = {
  setActiveModel: (modelId: string) => useModelStore.getState().setActiveModel(modelId),
  setModels: (models: Model[]) => useModelStore.getState().setModels(models),
};
```

```typescript
// Consuming
const activeModel = useModelStore(selectActiveModel);
const models = useModelStore((store) => store.models);
```

The `useModelStore` hook accepts a selector function, which satisfies the selector-hook rule. Derived values are selector functions in `modelStore.utils.ts`, not functions stored in state, so they recompute from the current state on every read. The `modelStore` object exposes writes for callers outside React. The store-shape type lives in `modelStore.types.ts`; keep shape definitions out of the `.store.ts` file. The curried `create<State>()(...)` form is what lets TypeScript infer the types when you add middleware such as `persist`.

### MobX

```typescript
'use client';

import {makeAutoObservable} from 'mobx';
import {defaultModelId} from './modelStore.constants';
import type {Model} from './modelStore.types';

class ModelStore {
  models: Model[] = [];
  activeModelId: string = defaultModelId;

  constructor() {
    makeAutoObservable(this);
  }

  get activeModel(): Model | undefined {
    return this.models.find((model) => model.id === this.activeModelId);
  }

  setActiveModel(modelId: string): void {
    this.activeModelId = modelId;
  }

  setModels(models: Model[]): void {
    this.models = models;
  }
}

export const modelStore = new ModelStore();
```

```typescript
// ModelSelector.tsx
'use client';

import {observer} from 'mobx-react-lite';
import {modelStore} from '@/stores/modelStore/modelStore.store';

export const ModelSelector = observer(function ModelSelector() {
  return (
    <select value={modelStore.activeModel?.id} onChange={(event) => modelStore.setActiveModel(event.target.value)}>
      {modelStore.models.map((model) => (
        <option key={model.id} value={model.id}>{model.name}</option>
      ))}
    </select>
  );
});
```

Direct property mutation works because `makeAutoObservable` wires up reactivity in the constructor. Computed values use `get` accessors, as in Classy Store. MobX re-renders a component only when it is wrapped in `observer`, which tracks the observables it reads during render. So instead of a selector hook, wrap each consuming component in `observer` and read the store directly. Without `observer` the component renders once and never updates. Keep the named `function` inside `observer(...)` so the component still shows its name in React DevTools.

## Persistence

For state that must survive page reloads, persist only the fields that need it — not the whole store.

```typescript
// Classy Store — call persist once after creating the store
import {persist} from '@codebelt/classy-store/utils';

persist(themeStore, {name: 'theme-storage', properties: ['theme']});

// Zustand
import {persist} from 'zustand/middleware';

export const useThemeStore = create<ThemeStoreState>()(
  persist(
    (set) => ({theme: 'system', setTheme: (theme) => set({theme})}),
    {name: 'theme-storage', partialize: (state) => ({theme: state.theme})},
  ),
);
```

Use the curried `create<State>()(persist(...))` form. With `partialize`, the non-curried form can't infer the persisted type and fails to type-check.

Persisting derived data, transient UI state, or full server caches is an anti-pattern — keep the persisted surface small.
