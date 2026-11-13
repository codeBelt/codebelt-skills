---
name: codebelt-code-style
description: CodeBelt's conventions for TypeScript, React and Next.js projects. Covers where files go and how they're named; component structure (ui/shared/pages tiers, one component per file, Props); services with React Query and Zod schemas; state stores (Zustand, MobX, Classy Store); Tailwind and CSS Modules styling; and test.each tests. Use it whenever you write, refactor or review TypeScript or React code in a project that follows the CodeBelt style, or when the user asks for that style. That includes creating components, pages, hooks, services, stores or tests, organizing folders, and reviewing code or a PR for style, even if the user never says "code style". In a codebase with different established conventions, it tells you to match those instead.
---

# CodeBelt Code Style Guide

These are opinionated conventions for TypeScript and React projects. The goal is that every file is predictable: you can guess a file's path, name and shape before you open it. Apply them when writing, reviewing or refactoring code.

## First: does this project use CodeBelt style?

These conventions are one team's choices, not universal rules. Look at the code around you before applying them:

- **New project, or the existing code already follows this guide** (named exports, `type Props`, camelCase component folders, `.schemas.ts` and `.store.ts` files): apply the guide fully.
- **The user asks for CodeBelt style or a migration to it:** apply it.
- **The existing code follows different conventions** (for example `index.tsx` with default exports, `interface` props, barrel files): match the surrounding code, so the codebase stays consistent. In your reply, briefly say where that differs from CodeBelt style and offer to switch or migrate. Don't impose CodeBelt style on your own, because a half-migrated codebase is harder to work in than either style.
- **Reviewing code:** if the project uses this guide, review against it. If it doesn't, review for consistency with the project's own conventions and list any CodeBelt differences as optional suggestions.

## Assumed Stack

The guide assumes:

- Next.js with the App Router
- React and TypeScript in strict mode
- TanStack React Query
- Zod 4
- Tailwind CSS 4, with CSS Modules as the fallback
- Bun, Vitest or Jest for tests

When part of the stack is missing, keep the conventions that still apply and drop the ones tied to the missing piece:

- Without Next.js, there's no `app/` folder, no `.dynamic.tsx` files and no `'use client'`.
- Without React Query, services export only fetch functions.

Always use the HTTP client, state library and test runner the project already has. Don't add a second one.

## Quick Reference

### File Placement

| Code Type | Location |
|-----------|----------|
| Page component | `components/pages/{pageName}/` |
| Reusable domain component | `components/shared/{componentName}/` |
| Pure presentational primitive | `components/ui/{componentName}/` |
| API logic | `services/{provider}/{service}/` or `services/{service}/` |
| Reusable function | `utils/{utilName}/` |
| React hook | `hooks/use{HookName}/` |
| Global state store | `stores/{storeName}/` |
| Global stylesheet | `styles/` |
| Next.js route files | `app/` |
| Third-party wrappers and config | `libs/{libraryName}/` |

See [COMPONENTS.md](COMPONENTS.md#component-tiers) for how to choose between `ui/`, `shared/` and `pages/`.

### File Extensions

| Extension | Purpose |
|-----------|---------|
| `.ts{x}` | Main code (`.tsx` only when the file contains JSX) |
| `.test.ts{x}` | Tests (placed next to the file being tested) |
| `.types.ts` | TypeScript types |
| `.utils.ts{x}` | Helper functions (components and stores only, not in `utils/` folders) |
| `.schemas.ts` | Zod validation schemas |
| `.constants.ts{x}` | Static objects and constants |
| `.dynamic.tsx` | Next.js dynamic import wrapper (`ssr: false`) |
| `.hooks.ts` | React Query hooks split out of a service (see [SERVICES.md](SERVICES.md#use-client-on-services)) |
| `.store.ts` | State store (see [STORES.md](STORES.md)) |
| `.module.css` | CSS Module placed next to its component (see [STYLING.md](STYLING.md)) |

### Naming Conventions

| Context | Convention | Example |
|---------|------------|---------|
| Component folders | camelCase | `userCard/` |
| Component files | PascalCase | `UserCard.tsx` |
| Everything else | camelCase | `httpClient.ts` |
| Variables/params | Descriptive, never single letters | `event` not `e` |
| Constants | camelCase | `maxRetries` not `MAX_RETRIES` |
| State updater args | `previous` prefix | `previousData`, `previousState` |
| Internal handlers | `handle` prefix | `handleSubmit`, `handleFilterChange` |
| Callback props | `on` prefix | `onSubmit`, `onFilterChange` |
| Generic type parameters | `T` prefix | `TItem`, `TValue` |

Descriptive names cost a few keystrokes and save every later reader from having to work out what `e`, `r` or `x` meant.

### TypeScript

- Use `type` for every type definition, never `interface`. With a single way to declare shapes, nobody has to decide between them, and there's no accidental declaration merging. `type` also covers unions and mapped types, which `interface` can't express.
- Derive types from Zod schemas with `z.infer`, and give the schema and its type the same name (see [SERVICES.md](SERVICES.md#schema-naming-pattern)).
- Avoid `any`. When the caller decides the shape, make the code generic; otherwise use `unknown` and narrow it.

### Exports

Use **named exports** only:

```typescript
export function Component() {}
```

A named export is imported under the same name everywhere, so grep, renames and auto-imports stay reliable. A default export can be renamed by every file that imports it.

Don't use barrel files in application code. They cause import cycles and slow down builds and tests (see [COMPONENTS.md](COMPONENTS.md#barrel-files-policy)).

**Exception for Next.js special files:** the App Router requires `export default` in these route-segment files, and only in these:

- `app/**/layout.tsx`
- `app/**/page.tsx`
- `app/**/loading.tsx`
- `app/**/error.tsx`
- `app/**/not-found.tsx`
- `app/**/template.tsx`
- `app/**/default.tsx`
- `app/**/route.ts`

### Component Files

**Put one component in each `.tsx` file**, and give every component its own subfolder, however small it is. Then a file called `UserCard.tsx` holds only `UserCard`. Nobody has to scan files for hidden helper components, and a small piece can be moved, reused or tested without untangling it from its parent. If a function returns JSX and has a capitalized name, it gets its own folder.

---

## Workflows

### Choosing a Component Tier

Before creating a component, decide where it lives:

1. **Is it domain-agnostic** (Button, Heading, Input, Modal)? Put it in `components/ui/{componentName}/`.
2. **Is it route-specific** (used by only one page)? Nest it inside the page folder: `components/pages/{pageName}/{componentName}/`.
3. **Has a second page just started importing a page-local component?** Promote it to `components/shared/{componentName}/`.

The default is **page-local first**. Promote a component to `shared/` only when a second consumer appears. A component built for hypothetical reuse tends to pile up options and end up fitting no caller well.

### Creating a New Component

1. Pick the tier (see above) and create the folder: `components/{ui|shared|pages/{pageName}}/{componentName}/`.
2. Create `{ComponentName}.tsx`, containing only the component, its `Props` type and its hook calls.
3. Move other types to `{ComponentName}.types.ts`, constants to `{ComponentName}.constants.ts` and helpers to `{ComponentName}.utils.ts`, creating only the files you need.
4. Create `{ComponentName}.dynamic.tsx` if the component is client-only and should be lazy-loaded (see [COMPONENTS.md](COMPONENTS.md#dynamic-imports)).
5. Check: one component per file, `Props` not exported, named export.

### Creating a New Page

1. Create the folder: `components/pages/{pageName}/`.
2. Create `{PageName}.tsx`, the page component itself.
3. If several nested children share types, put them in `{PageName}.types.ts` and import them from there. Never re-export types from a child's `.types.ts`.
4. If the page needs mappers or helpers shared across its children, create `{PageName}.utils.ts`.
5. Nest child components in subfolders: `components/pages/{pageName}/{childName}/{Child}.tsx`.
6. With the Next.js App Router, the route file in `app/` imports and renders the page component (see the [Exports](#exports) exception above).

### Creating a New Service

1. Create the folder. Use `services/{provider}/{serviceName}/` when the app talks to several backends, and `services/{serviceName}/` when there is only one. See [SERVICES.md](SERVICES.md#service-folder-layouts).
2. Create `{serviceName}Service.ts` with the fetch functions and query hooks. Each fetch function checks the response with `Schema.parse()` before returning it. Add `'use client'` at the top when the file exports React Query hooks (see [SERVICES.md](SERVICES.md#use-client-on-services)).
3. Create `{serviceName}Service.schemas.ts` with the Zod schemas.
4. Create `{serviceName}Service.constants.ts` with the query keys.
5. Check: each schema and its type share a name, and each fetch function has a comment with its HTTP method and path.

### Creating a New Hook

1. Create the folder: `hooks/use{HookName}/`.
2. Create the hook file: `use{HookName}.ts`.
3. Create the test file: `use{HookName}.test.ts` (see [TESTING.md](TESTING.md#components-and-hooks)).

### Creating a New Utility

1. Create the folder: `utils/{utilName}/`.
2. Create `{utilName}.ts`. All the helper functions go in this file, with no separate `.utils.ts`.
3. Create `{utilName}.constants.ts` if there are constants.
4. Create the test file: `{utilName}.test.ts`.

Utility folders don't use `.utils.ts` files the way components do. `{utilName}.ts` already is the utility, so a `.utils.ts` beside it would add nothing.

### Reviewing Code

1. Check that the project uses this style (see [the first section](#first-does-this-project-use-codebelt-style)).
2. Go through [MISTAKES.md](MISTAKES.md) for each file. Open the detailed reference file for any area the code touches.
3. Report real bugs, accessibility problems and other correctness issues too, and label them as being outside the style guide. Style is not the only thing that matters.
4. For each problem, give what's wrong, what it should be, and a short reason. Group related problems: structure and exports, props, constants and helpers, handlers, and everything else.
5. Don't rewrite the code unless the user asks.

---

## Reference Files

Read the file that matches what you're working on:

- [COMPONENTS.md](COMPONENTS.md): before creating or editing any `.tsx` file. Covers tiers, file layout, event handlers, `useMemo`, dynamic imports, polymorphic and generic components, and barrel files.
- [SERVICES.md](SERVICES.md): before writing a fetch call, a React Query hook or a Zod schema.
- [STORES.md](STORES.md): before creating or changing global state.
- [STYLING.md](STYLING.md): before adding styles or a stylesheet.
- [TESTING.md](TESTING.md): before writing any test.
- [MISTAKES.md](MISTAKES.md): when reviewing code, and as a final self-check before you finish.
