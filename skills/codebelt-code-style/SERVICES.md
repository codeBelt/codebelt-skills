# Service and Schema Patterns

## Table of Contents

- [Service Folder Layouts](#service-folder-layouts)
- [Main Service File](#main-service-file)
- [`'use client'` on Services](#use-client-on-services)
- [HTTP Client Choice](#http-client-choice)
- [Response Shape Variations](#response-shape-variations)
- [Schema File](#schema-file)
- [Constants File](#constants-file)
- [TypeScript Rules](#typescript-rules)
- [Schema Naming Pattern](#schema-naming-pattern)

## Service Folder Layouts

Two layouts are both valid; pick based on how many backends the app talks to.

### Flat (single backend)

```text
services/
└── users/
    ├── usersService.ts
    ├── usersService.schemas.ts
    └── usersService.constants.ts
```

Use this when every service in the app hits the same API. No need for a grouping folder — it just adds depth.

### Provider-based (multiple backends)

```text
services/
├── hyperion/                # First backend
│   └── users/
│       ├── usersService.ts
│       ├── usersService.schemas.ts
│       └── usersService.constants.ts
└── stripe/                  # Second backend
    └── charges/
        └── chargesService.ts
```

Introduce the provider folder the moment a second backend appears. Each provider folder groups services that share a base URL, auth scheme, or HTTP client.

Files always use a `Service` suffix regardless of layout.

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

## `'use client'` on Services

A service file that exports React Query hooks (`useGetUsers`, `useCreateOrder`, etc.) is a Client Component module — the hooks can only be called from client trees. In a Next.js app router project, put `'use client'` at the top so the bundler treats the whole module as client-side and the hooks behave correctly when consumed.

```typescript
'use client';

import {useQuery} from '@tanstack/react-query';
import ky from 'ky';

export async function getUsers(): Promise<GetUsersResponseSchema> {
  return ky.get('/api/v1/users').json();
}

export function useGetUsers() {
  return useQuery({queryKey: [getUsersKey], queryFn: getUsers});
}
```

The trade-off: a service marked `'use client'` cannot be called from server components, route handlers, or server actions. If you need the raw fetch function on both sides of the RSC boundary, split the file:

```text
services/users/
├── usersService.ts        # No 'use client'. Pure async functions — callable from anywhere.
├── usersService.hooks.ts  # 'use client'. Re-imports the fetch fns and wraps them in React Query hooks.
├── usersService.schemas.ts
└── usersService.constants.ts
```

Pick one pattern per project and stick with it. **Co-located fetch + hooks with `'use client'`** is the default — use the split pattern only when a service genuinely needs server-side callers.

If a service exports only fetch functions (no React hooks), omit the directive — there's nothing client-only to mark.

## HTTP Client Choice

Two patterns are both fine — pick one per project and stick with it.

### Custom wrapper

```typescript
import {httpClient} from '@/utils/httpClient/httpClient';
import {apiBasePath} from '@/utils/httpClient/httpClient.constants';

export async function getUsers(): Promise<GetUsersResponseSchema> {
  const response = await httpClient.get(`${apiBasePath}/users`);
  return response.data;
}
```

Use a wrapper when the project needs centralized auth headers, retry policy, error mapping, or telemetry across every service.

### Direct library (ky, fetch, axios)

```typescript
import ky from 'ky';

export async function getUsers(): Promise<GetUsersResponseSchema> {
  return ky.get('/api/v1/users').json();
}
```

Use a direct library when requests are simple and a wrapper would be ceremony for its own sake.

Consistency within a project matters more than which option you pick. Don't mix both.

## Response Shape Variations

Both paginated and flat-array responses are valid; the Zod schema must mirror what the API actually returns.

```typescript
// Paginated
export const GetUsersResponseSchema = z.object({
  users: z.array(UserSchema),
  totalCount: z.number(),
  page: z.number(),
  pageSize: z.number(),
});

export async function getUsers(page: number, pageSize: number): Promise<GetUsersResponseSchema> {
  /* ... */
}

// Flat array
export const GetUsersResponseSchema = z.array(UserSchema);

export async function getUsers(): Promise<GetUsersResponseSchema> {
  /* ... */
}
```

Do not wrap an array response in an object just to match a paginated shape — the schema lies and consumers pay the cost.

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
