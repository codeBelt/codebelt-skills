---
name: codebelt-code-style
description: Enforces the CodeBelt TypeScript and React code style guide for project structure, naming conventions, component patterns, service patterns, testing, and TypeScript rules. Use when writing, reviewing, or refactoring TypeScript or React code, creating new files or components, organizing project directories, writing tests, defining Zod schemas, or when the user mentions code style, conventions, linting, file organization, or naming patterns.
---

# CodeBelt Code Style Guide

Opinionated TypeScript and React code style for consistency, maintainability, and scalability. Apply these rules when writing new code, reviewing existing code, or refactoring.

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
| Third-party config | `libs/{libraryName}/` |

See [COMPONENTS.md](COMPONENTS.md#component-tiers) for the decision tree between `ui/`, `shared/`, and `pages/`.

### File Extensions

| Extension | Purpose |
|-----------|---------|
| `.ts{x}` | Main code (`.tsx` only when file contains JSX) |
| `.test.ts` | Tests (placed next to the file being tested) |
| `.types.ts` | TypeScript types |
| `.utils.ts{x}` | Helper functions (components only — not in `utils/` folders) |
| `.utils.test.ts` | Tests for component helper functions |
| `.schemas.ts` | Zod validation schemas |
| `.schemas.test.ts` | Tests for schemas |
| `.dynamic.tsx` | Next.js dynamic import wrapper (`ssr: false`) |
| `.constants.ts{x}` | Static objects and constants |
| `.store.ts` | State store (see [STORES.md](STORES.md)) |
| `.module.css` | Co-located CSS Module (see [STYLING.md](STYLING.md)) |

### Naming Conventions

| Context | Convention | Example |
|---------|------------|---------|
| Component folders | camelCase | `userCard/` |
| Component files | PascalCase | `UserCard.tsx` |
| Everything else | camelCase | `httpClient.ts` |
| Variables/params | Descriptive (no single chars) | `event` not `e` |
| Constants | camelCase | `maxRetries` not `MAX_RETRIES` |
| State updater args | `previous` prefix | `previousData`, `previousState` |
| Internal handlers | `handle` prefix | `handleSubmit`, `handleFilterChange` |
| Callback props | `on` prefix | `onSubmit`, `onFilterChange` |

### Exports

All files use **named exports** only:

```typescript
export function Component() {}
```

No default exports. No barrel files in application code.

**Exception — Next.js special files:** the Next.js app router requires `export default` for these route-segment files, and only these:

- `app/**/layout.tsx`
- `app/**/page.tsx`
- `app/**/loading.tsx`
- `app/**/error.tsx`
- `app/**/not-found.tsx`
- `app/**/template.tsx`
- `app/**/default.tsx`
- `app/**/route.ts`

Everywhere else (components, services, hooks, utils, stores), named exports only.

### Component Files

**One component per `.tsx` file — no exceptions.** Every component, no matter how small, gets its own subfolder and file.

---

## Workflows

### Choosing a Component Tier

Before creating a component, decide where it lives:

1. **Is it domain-agnostic** (Button, Heading, Input, Modal)? → `components/ui/{componentName}/`
2. **Is it route-specific** (only used by one page)? → nest it inside the page folder: `components/pages/{pageName}/{componentName}/`
3. **Was a page-local component just imported by a second page?** → promote it to `components/shared/{componentName}/`

Default is **page-local first**. Promote to `shared/` only when a second consumer appears — premature promotion creates components that try to serve everyone and fit no one.

See [COMPONENTS.md](COMPONENTS.md#component-tiers) for the full hierarchy.

### Creating a New Component

1. Pick the tier (see above) and create folder: `components/{ui|shared|pages/{pageName}}/{componentName}/`
2. Create component file: `{ComponentName}.tsx` with Props type and JSX only
3. Extract types to `{ComponentName}.types.ts` (if needed beyond Props)
4. Extract constants to `{ComponentName}.constants.ts` (if any)
5. Extract helpers to `{ComponentName}.utils.ts` (if any)
6. Create `{ComponentName}.dynamic.tsx` if the component is client-only and needs lazy loading (see [COMPONENTS.md](COMPONENTS.md#dynamic-imports))
7. Verify: one component per file, Props not exported, named export

### Creating a New Page

1. Create folder: `components/pages/{pageName}/`
2. Create `{PageName}.tsx` (the page component itself)
3. If multiple nested children share types, create `{PageName}.types.ts` and import down — never re-export types from a child `.types.ts`
4. If the page needs mappers or helpers shared across children, create `{PageName}.utils.ts`
5. Nest child components in subfolders: `components/pages/{pageName}/{childName}/{Child}.tsx`
6. If using Next.js app router, the route file in `app/` imports and renders the page component (see [Exports](#exports) exception above)

### Creating a New Service

1. Create folder. Use `services/{provider}/{serviceName}/` when the app talks to multiple backends; use `services/{serviceName}/` when there is only one. See [SERVICES.md](SERVICES.md#service-folder-layouts).
2. Create main file: `{serviceName}Service.ts` with fetch functions and query hooks. Add `'use client'` at the top when the file exports React Query hooks (see [SERVICES.md](SERVICES.md#use-client-on-services)).
3. Create schema file: `{serviceName}Service.schemas.ts` with Zod schemas
4. Create constants file: `{serviceName}Service.constants.ts` with query keys
5. Verify: schema and type share same name, comment with HTTP method and path

### Creating a New Hook

1. Create folder: `hooks/use{HookName}/`
2. Create hook file: `use{HookName}.ts`
3. Create test file: `use{HookName}.test.ts`

### Creating a New Utility

1. Create folder: `utils/{utilName}/`
2. Create main utility file: `{utilName}.ts` — all helper functions go here (no `.utils.ts` file)
3. Create constants file: `{utilName}.constants.ts` (if any)
4. Create test file: `{utilName}.test.ts`

> **Note:** Unlike components, utility folders do **not** use `.utils.ts` files. The main `{utilName}.ts` file itself is the utility — adding a `.utils.ts` beside it would be redundant.

---

## Detailed References

- **Component patterns, tiers, and hierarchy**: See [COMPONENTS.md](COMPONENTS.md)
- **Service and schema patterns**: See [SERVICES.md](SERVICES.md)
- **State stores**: See [STORES.md](STORES.md)
- **Styling (Tailwind + CSS Modules)**: See [STYLING.md](STYLING.md)
- **Testing patterns**: See [TESTING.md](TESTING.md)
- **Common mistakes to avoid**: See [MISTAKES.md](MISTAKES.md)
