# Testing Patterns

How test files are structured, named and placed.

## Table of Contents

- [Test Runner](#test-runner)
- [Test Structure](#test-structure)
- [Reactive Code](#reactive-code)
- [Components](#components)
- [Test File Placement](#test-file-placement)

## Test Runner

Use the runner the project already has: typically `bun:test` or Vitest (with `vite-plugin-solid`), sometimes Jest. They share `describe`, `test`, `expect`, `test.each` and lifecycle hooks, so only the imports change. JSX in tests needs the project's Solid transform (the Vite plugin, or a Bun preload); if component tests can't run in the current setup, say so and leave the tooling to the user.

## Test Structure

One `describe` per function under test. Use `test` (not `it`), and `test.each` with an **array of objects** for tables of cases. Shared fixtures live at the top of the file, outside `describe` blocks.

```ts
import {describe, expect, test} from 'bun:test'; // or 'vitest': match the project
import {filterGuests} from './GuestsPage.utils';
import type {GuestRow} from './GuestsPage.types';

const guests = [
  {id: '1', name: 'Ada Lovelace', status: 'checkedIn'},
  {id: '2', name: 'Alan Turing', status: 'expected'},
] satisfies GuestRow[];

describe('filterGuests', () => {
  test.each([
    {description: 'an empty query returns every guest', query: '', expectedIds: ['1', '2']},
    {description: 'matching ignores case', query: 'ada', expectedIds: ['1']},
    {description: 'a query with no match returns nothing', query: 'grace', expectedIds: []},
  ])('$description', ({query, expectedIds}) => {
    expect(filterGuests(guests, query).map((guest) => guest.id)).toEqual(expectedIds);
  });
});
```

- Each row has a `description`, used in the title with `$description`. Object rows keep cases readable; arrays of arrays make you count positions.
- Type fixtures with the real domain types and `satisfies`, so literal types survive and a type change breaks the fixture loudly.

## Reactive Code

- Run stores and other reactive code inside `createRoot` and dispose of the root at the end of each test.
- In a 2.x package, writes are batched: call `flush()` after an action before asserting on state. In 1.x, reads update immediately (see [the version table](SKILL.md#solid-versions)).
- Module stores (`.store.ts`) are singletons. Reset them between tests through an exported action, or test the logic in `.utils.ts` instead.

## Components

Keep logic in `.utils.ts` so most behavior can be tested as plain functions. When the project has a component testing library (usually `@solidjs/testing-library`), add `{Component}.test.tsx` for interaction:

```tsx
import {fireEvent, render, screen} from '@solidjs/testing-library';
import {describe, expect, mock, test} from 'bun:test';
import {GuestCard} from './GuestCard';

describe('GuestCard', () => {
  test('reports the selected guest id', () => {
    const onSelectGuest = mock();
    render(() => <GuestCard guest={{id: '7', name: 'Ada', isVip: false}} onSelectGuest={onSelectGuest} />);

    fireEvent.click(screen.getByRole('button', {name: /ada/i}));

    expect(onSelectGuest).toHaveBeenCalledWith('7');
  });
});
```

If the project has no component testing library, test the extracted helpers and say in your reply that component tests need one. Add it only if the user agrees.

## Test File Placement

| File | Test File |
|------|-----------|
| `GuestCard.utils.ts` | `GuestCard.utils.test.ts` |
| `GuestCard.tsx` | `GuestCard.test.tsx` (interaction only, when the testing library is available) |
| `stores/toastStore/toastStore.store.ts` | `stores/toastStore/toastStore.test.ts` |
| `utils/date/date.ts` | `utils/date/date.test.ts` |
