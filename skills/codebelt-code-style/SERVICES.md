# Service and Schema Patterns

## Table of Contents

- [Service Structure](#service-structure)
- [Main Service File](#main-service-file)
- [Schema File](#schema-file)
- [Constants File](#constants-file)
- [TypeScript Rules](#typescript-rules)
- [Schema Naming Pattern](#schema-naming-pattern)

## Service Structure

Services have three files organized by provider and resource. Files use a `Service` suffix:

```text
services/
└── hyperion/           # Provider/API name
    └── users/          # Resource name
        ├── usersService.ts              # Main functions + query hooks
        ├── usersService.schemas.ts      # Zod validation schemas
        └── usersService.constants.ts    # Query keys and static values
```

## Main Service File

```typescript
// services/hyperion/users/usersService.ts
import {useQuery} from '@tanstack/react-query';
import {httpClient} from '@/utils/httpClient/httpClient';
import {apiBasePath} from '@/utils/httpClient/httpClient.constants';
import {getUsersKey} from './usersService.constants';
import type {GetUsersResponseSchema} from './usersService.schemas';

/* GET /api/v1/users */
export async function getUsers(page: number, pageSize: number): Promise<GetUsersResponseSchema> {
  const response = await httpClient.get(`${apiBasePath}/users`, {
    params: {page, pageSize},
  });

  return response.data;
}

export function useGetUsers(page: number, pageSize: number) {
  return useQuery({
    queryKey: [getUsersKey, page, pageSize],
    queryFn: () => getUsers(page, pageSize),
  });
}
```

Key rules:
- Comment with HTTP method and path: `/* GET /api/v1/users */`
- Explicit return type on fetch functions: `Promise<GetUsersResponseSchema>`
- Query hooks live alongside their fetch functions
- Fetch functions are `async function`, not arrow functions

## Schema File

```typescript
// services/hyperion/users/usersService.schemas.ts
import {z} from 'zod';

export const GetUsersResponseSchema = z.object({
  users: z.array(
    z.object({
      id: z.uuid(),
      email: z.email(),
      name: z.string(),
    }),
  ),
});
export type GetUsersResponseSchema = z.infer<typeof GetUsersResponseSchema>;
```

## Constants File

```typescript
// services/hyperion/users/usersService.constants.ts
export const getUsersKey = 'getUsers';
```

## TypeScript Rules

- Use `type` for **all** type definitions (object shapes, unions, advanced type operations)
- Never use `interface` — always `type`
- Schema types derive from Zod: `z.infer<typeof Schema>`

## Schema Naming Pattern

**Schema and type names must be identical.** TypeScript allows a const and a type to share the same name because they exist in different namespaces.

### Correct

```typescript
export const UserInfoSchema = z.object({
  name: z.string().default(''),
  email: z.string().default(''),
});
export type UserInfoSchema = z.infer<typeof UserInfoSchema>;

// Usage — import the const, TypeScript uses the type when needed:
import {UserInfoSchema} from './schemas';

// As a value (schema):
const result = UserInfoSchema.parse(data);
// As a type:
function getUser(): UserInfoSchema { ... }
```

### Wrong

```typescript
// Don't use different names for schema and type
export const UserInfoSchema = z.object({...});
export type UserInfo = z.infer<typeof UserInfoSchema>; // Wrong: renamed

// Don't alias types when importing
import {UserInfoSchema} from './schemas';
import type {UserInfoSchema as UserInfoSchemaType} from './schemas'; // Wrong: aliased
```
