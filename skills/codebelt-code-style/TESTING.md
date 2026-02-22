# Testing Patterns

## Table of Contents

- [Test Structure](#test-structure)
- [test.each with Object Arrays](#testeach-with-object-arrays)
- [Test File Placement](#test-file-placement)

## Test Structure

Use `describe` blocks with `test.each` and arrays of objects for parameterized tests.

## test.each with Object Arrays

```typescript
import {describe, expect, test} from 'bun:test';
import {formatUserName} from './user';

describe('formatUserName', () => {
  test.each([
    {
      description: 'full name with all parts',
      input: 'Smith, John David',
      expected: {lastName: 'Smith', firstName: 'John', middleName: 'David'},
    },
    {
      description: 'name without middle',
      input: 'Smith, John',
      expected: {lastName: 'Smith', firstName: 'John', middleName: undefined},
    },
  ])('should handle $description', ({input, expected}) => {
    expect(formatUserName(input)).toEqual(expected);
  });
});
```

Key rules:
- Use `test.each` with an **array of objects** (not arrays of arrays)
- Each object has a `description` field for the test name
- Reference properties in the test name with `$description` syntax
- Use `bun:test` as the test runner

## Test File Placement

| File | Test File |
|------|-----------|
| `UserCard.tsx` | Not directly tested (test utils instead) |
| `UserCard.utils.ts` | `UserCard.utils.test.ts` |
| `users.schemas.ts` | `users.schemas.test.ts` |
| `hooks/useDebounce/useDebounce.ts` | `hooks/useDebounce/useDebounce.test.ts` |
| `utils/date/date.ts` | `utils/date/date.test.ts` |
