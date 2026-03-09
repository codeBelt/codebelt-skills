# Testing Patterns

## Table of Contents

- [Test Structure](#test-structure)
- [test.each with Object Arrays](#testeach-with-object-arrays)
- [Test File Placement](#test-file-placement)

## Test Structure

Use `describe` blocks with `test.each` and arrays of objects for parameterized tests. One `describe` block per function being tested. Shared mock data lives outside `describe` blocks at the top of the file.

```typescript
import {describe, expect, test} from 'bun:test';
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
- Use `bun:test` as the test runner
- One `describe` block per exported function
- Shared mock data at the top of the file, outside `describe` blocks
- Type mock data using `import type` from the source types

## Test File Placement

| File | Test File |
|------|-----------|
| `UserCard.tsx` | Not directly tested (test utils instead) |
| `UserCard.utils.ts` | `UserCard.utils.test.ts` |
| `usersService.schemas.ts` | `usersService.schemas.test.ts` |
| `hooks/useDebounce/useDebounce.ts` | `hooks/useDebounce/useDebounce.test.ts` |
| `utils/date/date.ts` | `utils/date/date.test.ts` |
