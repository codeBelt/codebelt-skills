# Service and Schema Patterns

This file covers the shape of API code: where it lives, how files are named, how fetch functions look and, when the project has a validator, how schemas are written. It doesn't choose a fetching library; use the one the project has. It doesn't cover SolidStart server functions (`"use server"`, `query`, `action`); in a SolidStart project, follow the structure the project already has for those.

## Table of Contents

- [Service Folder Layouts](#service-folder-layouts)
- [Fetch Functions](#fetch-functions)
- [Schema File](#schema-file)
- [Schema Naming Pattern](#schema-naming-pattern)
- [Query Wrappers](#query-wrappers)
- [Constants File](#constants-file)

## Service Folder Layouts

Use the flat layout when the app talks to one backend:

```text
services/
└── guests/
    ├── guestsService.ts
    ├── guestsService.schemas.ts   # Or guestsService.types.ts when the project has no validator
    └── guestsService.constants.ts
```

Add a provider folder as soon as a second backend appears. Each provider groups services that share a base URL, auth scheme or HTTP client:

```text
services/
├── bookingApi/
│   └── guests/
│       └── guestsService.ts
└── stripe/
    └── charges/
        └── chargesService.ts
```

Files always have the `Service` suffix, whichever layout the project uses.

## Fetch Functions

```ts
// services/guests/guestsService.ts (in a project that uses Zod)
import {httpClient} from '../../utils/httpClient/httpClient';
import {GetGuestsResponseSchema} from './guestsService.schemas';

/* GET /api/v1/guests */
export async function getGuests(page: number): Promise<GetGuestsResponseSchema> {
  const response = await httpClient.get('/api/v1/guests', {params: {page}});

  return GetGuestsResponseSchema.parse(response.data);
}
```

- Write fetch functions the way the project's existing services do: function declarations or arrow functions, return types, and comments such as `/* GET /api/v1/guests */`. In a project with no services yet, the example above is the default.
- Validation is optional. When the project uses Zod or Valibot (or similar), validate responses the way its existing services do, with the library's parse call (`Schema.parse(data)` in Zod, `v.parse(Schema, data)` in Valibot). Where they don't validate, suggest it in your reply: a schema catches API changes at the boundary, where a plain type only promises a shape.
- Fetch functions are plain TypeScript: no signals, no JSX, no Solid imports. They can then be called from anywhere and tested without a reactive owner.
- Read the body the way the project's client does: `response.data` for axios-style wrappers, `.json()` for ky, `await response.json()` for `fetch`. Don't repeat a base URL the client already has.
- Call the HTTP client the same way in every service: through the project's shared wrapper (in `utils/httpClient/`) if it has one, or the library directly if it doesn't.

## Schema File

When the project uses a validation library (Zod, Valibot, ArkType or similar), schemas follow these file and naming rules. They're the same for every library; only the calls differ.

If the project has no validator, there is no schema file. Put the response types in `{name}Service.types.ts` and return the response typed with them. Leave validation out entirely: don't add a library, and don't suggest one.

The same file in Zod, then in Valibot:

```ts
// services/guests/guestsService.schemas.ts (Zod)
import {z} from 'zod';

export const GuestSchema = z.object({
  id: z.string(),
  name: z.string(),
  isVip: z.boolean(),
});
export type GuestSchema = z.infer<typeof GuestSchema>;

export const GetGuestsResponseSchema = z.object({
  guests: z.array(GuestSchema),
  totalCount: z.number(),
});
export type GetGuestsResponseSchema = z.infer<typeof GetGuestsResponseSchema>;
```

```ts
// services/guests/guestsService.schemas.ts (Valibot)
import * as v from 'valibot';

export const GuestSchema = v.object({
  id: v.string(),
  name: v.string(),
  isVip: v.boolean(),
});
export type GuestSchema = v.InferOutput<typeof GuestSchema>;
```

The schema must mirror what the API actually returns. If the endpoint returns a bare array, the schema is an array of `GuestSchema`. Don't wrap it in an object to match another endpoint.

## Schema Naming Pattern

**A schema and its type have the same name.** TypeScript allows this because values and types live in separate namespaces. Import one name and use it both ways:

```ts
import {GuestSchema} from './guestsService.schemas';

const guest = GuestSchema.parse(data); // the schema (Valibot: v.parse(GuestSchema, data))
function renderGuest(guest: GuestSchema) {} // the type
```

Don't rename the type (`type Guest = z.infer<typeof GuestSchema>`) or alias it on import. Derive every type from its schema with the library's inference helper (`z.infer`, `v.InferOutput`, ArkType's `typeof Schema.infer`) rather than writing the shape twice.

## Query Wrappers

Components call fetch functions through whatever fetching tool the project uses. If it uses a query library such as `@tanstack/solid-query`, the wrapper for each query goes in the service file, next to its fetch function. Wrappers create reactive state, so they take the `create` prefix: `createGuestsQuery`.

## Constants File

Query keys and other static values for a service go in `{name}Service.constants.ts`:

```ts
// services/guests/guestsService.constants.ts
export const getGuestsKey = 'getGuests';
```
