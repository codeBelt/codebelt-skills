---
name: codebelt-solidjs
description: CodeBelt's conventions for how files in a SolidJS and TypeScript project are organized and written. Covers where files go and how they're named (ui/shared/pages tiers, stores, services, utils); what each file may contain (one component per .tsx file, a local Props as its only type, other types in .types.ts, constants in .constants.ts, helpers in .utils.ts); component file shape; .store.ts, .context.ts, .lazy.ts and service schema files; naming; styling; and test structure. Use it whenever you write, refactor or review code in a SolidJS project that follows the CodeBelt style, or when the user asks for that style, including creating components, pages, services, stores or tests, organizing folders, bringing React code into a Solid app, and reviewing code or a PR for style, even if the user never says "code style". Not for React projects, and not a Solid API guide. In a codebase with different established conventions, it tells you to match those instead.
---

# CodeBelt SolidJS Code Style

These conventions make every file predictable: you can guess a file's path, name and contents before you open it, and the same kind of code looks the same everywhere in the app.

The guide covers **structure and code shape**: where code goes, how files are named, what each file holds and how it's laid out. It doesn't teach the Solid API; for that, use the Solid documentation and the patterns already in the package.

## First: does this project use CodeBelt style?

These conventions are one team's choices, not universal rules. Look at the code around you before applying them:

- **New project, or the existing code already follows this guide** (named exports, `type Props`, camelCase component folders, `.store.ts` files): apply the guide fully.
- **The user asks for CodeBelt style or a migration to it:** apply it.
- **The existing code follows different conventions** (for example `index.tsx` with default exports, `interface` props, barrel files): match the surrounding code, so the codebase stays consistent. In your reply, briefly say where that differs from CodeBelt style and offer to switch or migrate. A half-migrated codebase is harder to work in than either style, so leave the switch to the user.
- **Reviewing code:** if the project uses this guide, review against it. If it doesn't, review for consistency with the project's own conventions and list any CodeBelt differences as optional suggestions. Judge this from the rest of the codebase or from what the user says, never from the file under review: that file breaking the guide is the reason for the review, not evidence of other conventions. With nothing else to go on, review against the guide without hedging.

## Stack and Tools

The guide assumes:

- SolidJS with TypeScript in strict mode
- Any Solid setup (Vite, SolidStart) and any router (Solid Router, TanStack Router)
- Optionally, a schema validation library for API responses (Zod, Valibot, ArkType or similar)
- Bun, Vitest or Jest for tests

Use the router, UI library, icon set, styling approach, HTTP client, fetching library, validator and test runner the project already has, and only those. When the project uses ESLint, it should include `eslint-plugin-solid` with its recommended rules, which catch destructured props and similar mistakes automatically. Suggest it when it's missing, and add it only if the user agrees.

## Solid Versions

A repository can hold packages on different Solid versions, for example a monorepo with one app on 1.x and another on 2.x. Settle the version before writing or reviewing any Solid code:

1. **Read the version for the package you're working in**, from the `package.json` nearest to the file, not the repository root. If it says `catalog:`, `workspace:` or a range you can't resolve, read the installed version from that package's `node_modules/solid-js/package.json` or from the lockfile.
2. **Apply the structure rules in every version.** File placement, naming, file contents and component file shape are the same in 1.x and 2.x. The code examples in this guide use 1.x syntax; the syntax in them is incidental.
3. **In a 2.x package, use the 2.x forms in the table below, and look up any other Solid API you aren't sure is unchanged**, in the Solid 2 migration guide and the package's existing code. Most Solid code you have seen is 1.x, so when in doubt, check rather than write from memory.
4. **Write Solid code for one version per package.** Never copy Solid code between packages on different versions, and never mix 1.x and 2.x APIs in one package. Types, schemas, utils and fetch functions contain no Solid code, so they look the same in both.

Where this guide's own rules use an API that differs between versions:

| Guide rule | 1.x | 2.x |
|------------|-----|-----|
| Conditional classes, never string building | `class="btn" classList={{active: isActive()}}` | `class={['btn', {active: isActive()}]}` (`classList` is removed) |
| Lists of strings or numbers, or keyed by position | `<Index each={...}>` | `<For each={...} keyed={false}>` (`<Index>` is removed) |
| Store actions write through the setter | Path setter: `setState('toasts', (previousToasts) => [...previousToasts, toast])` | Draft setter: `setState((state) => { state.toasts.push(toast); })` |
| Store imports | `createStore` from `solid-js/store` | `createStore` from `solid-js` |
| Providers in their own `.tsx` file | `<BookingWizardContext.Provider value={value}>` | `<BookingWizardContext value={value}>` (`.Provider` is removed) |
| `use{Name}` function that throws when the provider is missing | Check for `undefined` and throw | Keep the function, so every consumer imports the same name; `useContext` on a context without a default already throws, so the explicit check can go |
| Tests read state right after an action | Reads update immediately | Writes are batched: call `flush()` before asserting |

This table is checked against the Solid 2.0 release-candidate migration guide (`solid-js@2.0.0-rc.21`). Until 2.0 is stable, the docs and the package's own code win over the table.

## Quick Reference

### File Placement

| Code Type | Location |
|-----------|----------|
| Page component | `components/pages/{pageName}/` |
| Reusable domain component | `components/shared/{componentName}/` |
| Pure presentational component | `components/ui/{componentName}/` |
| API logic | `services/{provider}/{service}/` or `services/{service}/` |
| Reusable function | `utils/{utilName}/` |
| Global state store | `stores/{storeName}/` |
| Global stylesheet and design tokens | `styles/` |
| Route files | The router's folder (`routes/`), using the router's required file names and exports |
| Third-party wrappers and config | `libs/{libraryName}/` |

To choose between `ui/`, `shared/` and `pages/`, follow [Choosing a Component Tier](#choosing-a-component-tier).

### File Extensions

| Extension | Purpose |
|-----------|---------|
| `.ts{x}` | Main code (`.tsx` only when the file contains JSX) |
| `.test.ts{x}` | Tests, placed next to the file being tested |
| `.types.ts` | TypeScript types |
| `.utils.ts` | Pure helpers (components and stores only, not in `utils/` folders) |
| `.constants.ts` | Static arrays, objects and values |
| `.schemas.ts` | Validation schemas for a service, when the project has a validator (see [SERVICES.md](SERVICES.md)) |
| `.context.ts` | A provider's context object and its `use{Name}` function, next to the provider (see [STORES.md](STORES.md#context-files)) |
| `.lazy.ts` | A `lazy()` wrapper for code-splitting (see [COMPONENTS.md](COMPONENTS.md#lazy-loading)) |
| `.store.ts` | Global state store (see [STORES.md](STORES.md)) |
| `.module.css` | A component's own CSS Module, next to it (see [Styling](#styling)) |

### Naming Conventions

| Context | Convention | Example |
|---------|------------|---------|
| Component folders | camelCase | `guestCard/` |
| Component files | PascalCase | `GuestCard.tsx` |
| Everything else | camelCase | `rateResolver.ts` |
| Variables/params | Descriptive, never single letters | `event` not `e` |
| Constants | camelCase | `maxRetries` not `MAX_RETRIES` |
| Signals | Noun for the getter, `set` + noun for the setter | `const [count, setCount] = createSignal(0)` |
| Memos and derived values | Noun, no `get` prefix | `const visibleGuests = createMemo(...)` |
| Updater function args | `previous` prefix | `setCount((previousCount) => previousCount + 1)` |
| Functions that create reactive state | `create` prefix | `createGuestsQuery` |
| Functions that read a context | `use` prefix | `useTheme()` |
| Internal handlers | `handle` prefix | `handleSubmit`, `handleFilterChange` |
| Callback props | `on` prefix, specific to the action | `onSelectGuest` rather than `onSelect` |
| Generic type parameters | `T` prefix | `TItem`, `TValue` |

Descriptive names cost a few keystrokes and save every later reader from having to work out what `e`, `r` or `x` meant. Constants are camelCase because SCREAMING_CASE implies a compile-time constant that JavaScript doesn't enforce. The `create`/`use` split follows Solid's own naming: `create*` makes something new, `use*` reads something that already exists from context.

### TypeScript

- Use `type` for every type definition, never `interface`. With a single way to declare shapes, nobody has to decide between them, and there's no accidental declaration merging.
- When the caller decides the shape, make the code generic; otherwise use `unknown` and narrow it. Never `any`.
- Narrow optional values with a guard or a `<Show>` callback, or throw a clear error for a true invariant. Never use non-null assertions (`value!`), and never hide a missing required value behind `?.` or an invented fallback.
- Type static data with `satisfies`, so literal types survive: `export const statusLabels = {...} satisfies Record<Status, string>`.
- Use `import type` for type-only imports.

### Imports and Exports

Use **named exports** only. A named export is imported under the same name everywhere, so grep, renames and auto-imports stay reliable. Use `export default` only where a framework requires it (for example some route files).

- Import directly from the module that owns the code. No barrel `index.ts` files in application code (they cause import cycles and slow down builds and tests), and no re-exports from other files.
- Relative import paths follow the project. If it writes extensions (`'./GuestCard.tsx'`, `'./guestCard.utils.ts'`), always write them; that is CodeBelt's preference when the tsconfig allows it (`allowImportingTsExtensions`). If it doesn't, leave them off. Use one style everywhere.

### Component Files

**Put one component in each `.tsx` file**, and give every component its own subfolder, however small it is. Then a file called `GuestCard.tsx` holds only `GuestCard`, and a small piece can be moved, reused or tested without untangling it from its parent. Keep components under about 200 lines; past that, split out children.

A component file holds only three things: its imports, its local `type Props` and the component itself. `Props` is the **only** type in the file: always named `Props`, never exported. Every other type goes in `{ComponentName}.types.ts`, constants in `{ComponentName}.constants.ts` and helpers in `{ComponentName}.utils.ts`.

```tsx
// guestCard/GuestCard.tsx
import {Show} from 'solid-js';
import {formatGuestName} from './GuestCard.utils';
import type {Guest} from './GuestCard.types';

type Props = {
  guest: Guest;
  onSelectGuest: (guestId: string) => void;
};

export function GuestCard(props: Props) {
  return (
    <button type="button" onClick={() => props.onSelectGuest(props.guest.id)}>
      {formatGuestName(props.guest.name)}
      <Show when={props.guest.isVip}>
        <span class="text-xs font-semibold">VIP</span>
      </Show>
    </button>
  );
}
```

- Declare the component as `export function Name(props: Props)`: a named function and a named export, not an arrow function.
- Read props as `props.x` wherever they're used, in the signature and the body alike; never destructure them. This is the main visible difference from CodeBelt's React guide, which destructures in the signature.
- Put conditional markup in `<Show>` or `<Switch>` and lists in Solid's list components (`<For>`, plus `<Index>` in 1.x or `<For keyed={false}>` in 2.x). No early returns and no `.map()` in JSX. Ternaries are fine for small inline values.
- Signals, memos and handlers live inside the component. Inline a handler that only forwards a call; extract a `handle*` function when it has real logic.

### Styling

Style with whatever the project uses (Tailwind, CSS Modules or plain CSS). Whatever the tool, the code looks like this:

- Use `class` and `for`, not `className` and `htmlFor`.
- Write conditional classes with Solid's conditional-class syntax: `classList` in 1.x, an object or array in `class` in 2.x. Never build them with template literals, ternaries or concatenation.
- Write class strings in the JSX, and keep a variant map in the component file, not in `.constants.ts`.
- Give a component its own stylesheet as a CSS Module next to it, `{ComponentName}.module.css`. Global rules live in `styles/`; components never import plain `.css` files of their own.

### Route Files and Params

Route files only connect a route to its page component: they import the page and render it, using the router's required file names and exports. All the page's code lives in `components/pages/{pageName}/`. The page component reads route params itself, through the router's API (for example `const params = useParams()` in Solid Router), and reads them like props: `params.guestId` where it's used, never copied into a constant at the top.

---

## Workflows

### Choosing a Component Tier

Before creating a component, decide where it lives:

1. **Could it be lifted into any Solid project unchanged** (Button, Heading, Input, Dialog)? Put it in `components/ui/{componentName}/`.
2. **Is it used by only one page?** Nest it inside the page folder: `components/pages/{pageName}/{componentName}/`.
3. **Has a second page just started importing a page-local component?** Promote it to `components/shared/{componentName}/`.

The default is **page-local first**. Promote a component to `shared/` only when a second consumer appears. A component built for hypothetical reuse tends to pile up options and end up fitting no caller well.

### Creating a New Component

1. Pick the tier (see above) and create the folder: `components/{ui|shared|pages/{pageName}}/{componentName}/`.
2. Create `{ComponentName}.tsx`, plus only the supporting files it needs (`.types.ts`, `.constants.ts`, `.utils.ts`).
3. Check before you finish: one component per file, `Props` the only type and not exported, named export, props read as `props.x`, no early returns, lists in Solid's list components, conditions in `<Show>`, and API calls that match the package's Solid version.

### Creating a New Page

1. Create the folder: `components/pages/{pageName}/`.
2. Create `{PageName}.tsx`, the page component itself.
3. If several nested children share types, put them in `{PageName}.types.ts` and import them from there (see [COMPONENTS.md](COMPONENTS.md#page-level-supporting-files)).
4. If the page needs mappers or helpers shared across its children, create `{PageName}.utils.ts`.
5. Nest child components in subfolders: `components/pages/{pageName}/{childName}/{Child}.tsx`.
6. Make the route file import and render the page component (see [Route Files and Params](#route-files-and-params)). Never hand-edit a generated route tree.

### Creating a New Service

1. Create the folder. Use `services/{provider}/{serviceName}/` when the app talks to several backends, and `services/{serviceName}/` when there is only one.
2. Create `{serviceName}Service.ts` with plain async fetch functions, written the way the project's existing services are (see [SERVICES.md](SERVICES.md#fetch-functions)).
3. If the project uses a validation library such as Zod or Valibot, put the schemas in `{serviceName}Service.schemas.ts`, give each schema and its inferred type the same name, and validate responses the way the project's existing services do; where they don't, suggest it in your reply. If the project has no validator, put the response types in `{serviceName}Service.types.ts` and leave validation out.
4. Put query keys and other static values in `{serviceName}Service.constants.ts`.

### Creating a New Utility

1. Create the folder: `utils/{utilName}/`.
2. Create `{utilName}.ts`. All the helper functions go in this file, with no separate `.utils.ts`.
3. Create `{utilName}.constants.ts` if there are constants.
4. Create the test file: `{utilName}.test.ts`.

Utilities are plain TypeScript: no signals, no JSX. Reactive code belongs in a component, a store or a context.

### Reviewing Code

1. Check that the project uses this style (see [the first section](#first-does-this-project-use-codebelt-style)) and which Solid version each file's package uses.
2. Check every file against every table in [MISTAKES.md](MISTAKES.md), and open the detailed reference file for any area the code touches.
3. Report only what this guide covers. Leave general bugs and code quality outside the guide to other reviews.
4. For each problem, give what's wrong, what it should be, and a short reason. Group the problems under the MISTAKES.md section headings.
5. List the problems without rewriting the code, unless the user asks for a rewrite.

---

## Reference Files

Read the file that matches what you're working on:

- [COMPONENTS.md](COMPONENTS.md): before creating or editing any `.tsx` file. Covers the directory layout, tiers, handlers, supporting files, page-level files, lazy loading, UI and generic components, accessibility and barrel files.
- [SERVICES.md](SERVICES.md): before writing a fetch function, a query wrapper or a validation schema.
- [STORES.md](STORES.md): before creating or changing global or shared state, or a context.
- [TESTING.md](TESTING.md): before writing any test.
- [MISTAKES.md](MISTAKES.md): when reviewing code, and as a final self-check before you finish.
