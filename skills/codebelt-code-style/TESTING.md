# Testing Patterns

## Table of Contents

- [Test Runner](#test-runner)
- [Test Structure](#test-structure)
- [Components and Hooks](#components-and-hooks)
- [Test File Placement](#test-file-placement)

## Test Runner

The patterns below are **runner-agnostic**. Use whichever runner the project has already configured — typically `bun:test`, `vitest`, or `jest`. All three expose the same surface (`describe`, `test`, `expect`, `test.each`, lifecycle hooks), so only the import source changes:

```typescript
import {describe, expect, test} from 'bun:test';  // Bun
import {describe, expect, test} from 'vitest';    // Vitest
// Jest exposes describe/expect/test as globals — no import needed
```

Do not introduce a second runner into a project that already has one. Match the existing setup.

## Test Structure

Use `describe` blocks with `test.each` and arrays of objects for parameterized tests. One `describe` block per function being tested. Shared mock data lives outside `describe` blocks at the top of the file.

```typescript
import {describe, expect, test} from 'bun:test'; // or 'vitest' — match the project
import {filterUsers, formatUserStatus} from './UsersList.utils';
import type {UserRow} from './UsersList.types';

const mockUsers: UserRow[] = [
  {userId: '1', fullName: 'John Smith', email: 'john@example.com', role: 'admin', status: 'active'},
  {userId: '2', fullName: 'Jane Doe', email: 'jane@example.com', role: 'viewer', status: 'inactive'},
];

describe('filterUsers', () => {
  test.each([
    {
      description: 'no filters returns all users',
      criteria: {searchQuery: '', roleFilter: '', statusFilter: ''},
      expectedCount: 2,
    },
    {
      description: 'search by name filters correctly',
      criteria: {searchQuery: 'John', roleFilter: '', statusFilter: ''},
      expectedCount: 1,
    },
  ])('should handle $description', ({criteria, expectedCount}) => {
    expect(filterUsers(mockUsers, criteria)).toHaveLength(expectedCount);
  });
});

describe('formatUserStatus', () => {
  test.each([
    {
      description: 'active status',
      input: 'active' as const,
      expected: 'Active',
    },
  ])('should handle $description', ({input, expected}) => {
    expect(formatUserStatus(input)).toBe(expected);
  });
});
```

Key rules:
- Use `test.each` with an **array of objects** (not arrays of arrays)
- Each object has a `description` field for the test name
- Reference properties in the test name with `$description` syntax
- Match the project's existing test runner — do not mix `bun:test`, `vitest`, and `jest`
- One `describe` block per exported function
- Shared mock data at the top of the file, outside `describe` blocks
- Type mock data using `import type` from the source types

## Components and Hooks

Keep logic out of components (in `.utils.ts`) so most behavior can be tested as plain functions, which is quicker and less brittle than rendering. When the project has React Testing Library:

- Add `{Component}.test.tsx` for interaction: clicks, form submission, conditional rendering. Query by role or visible text, not by class names.
- Test hooks with `renderHook` in `use{HookName}.test.ts`.
- Use `test.each` with object arrays whenever cases differ only in their data.

If React Testing Library isn't installed, test the extracted helpers and say in your reply that component tests need it. Don't add it without asking.

## Test File Placement

| File | Test File |
|------|-----------|
| `UserCard.tsx` | `UserCard.test.tsx` (interaction only, when Testing Library is available) |
| `UserCard.utils.ts` | `UserCard.utils.test.ts` |
| `usersService.schemas.ts` | `usersService.schemas.test.ts` |
| `hooks/useDebounce/useDebounce.ts` | `hooks/useDebounce/useDebounce.test.ts` |
| `utils/date/date.ts` | `utils/date/date.test.ts` |
| `utils/formatName/formatName.ts` | `utils/formatName/formatName.test.ts` |
