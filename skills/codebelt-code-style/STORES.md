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
- Each store exports **two things**: the store instance (or hook factory) and a typed **selector hook** (`useModelStore`) that lets components subscribe to a slice of state.
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
  activeModel: () => Model | undefined;
  setActiveModel: (modelId: string) => void;
  setModels: (models: Model[]) => void;
};
```

```typescript
// modelStore.store.ts
'use client';

import {create} from 'zustand';
import {defaultModelId} from './modelStore.constants';
import type {ModelStoreState} from './modelStore.types';

export const useModelStore = create<ModelStoreState>((set, get) => ({
  models: [],
  activeModelId: defaultModelId,
  activeModel: () => get().models.find((model) => model.id === get().activeModelId),
  setActiveModel: (modelId) => set({activeModelId: modelId}),
  setModels: (models) => set({models}),
}));

export const modelStore = {
  setActiveModel: (modelId: string) => useModelStore.getState().setActiveModel(modelId),
  setModels: (models) => useModelStore.getState().setModels(models),
};
```

The `useModelStore` hook itself accepts a selector function, matching the universal selector-hook rule. The `modelStore` object exposes writes for non-React callers. The store-shape type lives in `modelStore.types.ts` — keep shape definitions out of the `.store.ts` file.

### MobX

```typescript
'use client';

import {makeAutoObservable} from 'mobx';
import {useLocalObservable} from 'mobx-react-lite';
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

export function useModelStore<TSelected>(selector: (store: ModelStore) => TSelected): TSelected {
  return useLocalObservable(() => ({get value() { return selector(modelStore); }})).value;
}
```

Direct property mutation works because `makeAutoObservable` wires up reactivity in the constructor. Computed values use `get` accessors, same as Classy Store.

## Persistence

For state that must survive page reloads, persist only the fields that need it — not the whole store.

```typescript
// Classy Store — call persist once after creating the store
import {persist} from '@codebelt/classy-store/utils';

persist(themeStore, {name: 'theme-storage', properties: ['theme']});

// Zustand
import {persist} from 'zustand/middleware';

export const useThemeStore = create(
  persist<ThemeStoreState>(
    (set) => ({theme: 'system', setTheme: (theme) => set({theme})}),
    {name: 'theme-storage', partialize: (state) => ({theme: state.theme})},
  ),
);
```

Persisting derived data, transient UI state, or full server caches is an anti-pattern — keep the persisted surface small.
