# Common Mistakes

Quick-reference table for code review and self-checks.

| Wrong | Right |
|-------|-------|
| `interface Props {...}` | `type Props = {...}` |
| `export type Props` | `type Props` (no export) |
| `type ButtonProps` | `type Props` — always named `Props` |
| `function Button(props: Props)` | `function Button({label, onClick}: Props)` — destructure in signature |
| Types in component file | Move to `.types.ts` (except Props) |
| `services/hyperion/users/users.ts` | `services/hyperion/users/usersService.ts` |
| `utils/date/date.utils.ts` | `utils/date/date.ts` — the main file *is* the utility, no `.utils.ts` needed |
| `const MAX_RETRIES = 3` | `const maxRetries = 3` |
| `(e) => handleClick(e)` | `(event) => handleClick(event)` |
| `setPrev`, `setOld` in state updaters | `(previousData) => ...` — always `previous` prefix |
| Wrapping a simple call in a named handler | Inline it: `onClick={() => onDelete(userId)}` |
| Derived array/object without `useMemo` | `useMemo(() => sort(items), [items])` — new references cause child re-renders |
| Constants in component (arrays, objects, primitives) | Extract to `.constants.ts` |
| Helpers in component | Extract to `.utils.ts` |
| Multiple components in one `.tsx` file | One component per `.tsx` file — extract all helpers to subfolders |
| Barrel files (`index.ts`) | Direct imports from modules |
| `export default function` (outside `app/` special files) | `export function` — named exports only. Next.js `layout.tsx`, `page.tsx`, `route.ts`, etc. are the only exceptions (see [SKILL.md](SKILL.md#exports)) |
| `dynamic(() => import('./Foo'))` | `dynamic(() => import('./Foo').then((mod) => mod.Foo))` — named exports need `.then()` |
| Importing original component when `.dynamic.tsx` exists | Import `FooDynamic` from `.dynamic.tsx` for client-only components |
| Re-exporting types/values | Import directly from source file |
| `export type {UserDisplay} from '../UsersPage.types'` in a child `.types.ts` | Import `UserDisplay` directly from `../UsersPage.types`. Sibling `.types.ts` files must never re-export each other's types — it creates two import paths for one type |
| Page-shared type defined inside `{NestedChild}.types.ts` | Put it in `{Page}.types.ts` and import down (see [COMPONENTS.md](COMPONENTS.md#page-level-supporting-files)) |
| Domain-agnostic primitive (Button, Heading) under `components/shared/` | Move it to `components/ui/` — `shared/` is for domain-aware reusable components only (see [COMPONENTS.md](COMPONENTS.md#component-tiers)) |
| `interface User {...}` | `type User = {...}` |
| Different schema/type names | Same name for both (dual namespaces) |
| Handler prop named `handleClick` | Props use `on` prefix: `onClick`; internals use `handle`: `handleClick` |
| `items: any[]` / `onSelect: (item: unknown) => void` on a reusable component | Make the component generic: `function List<TItem>(...)` so the callback is typed end-to-end (see [COMPONENTS.md](COMPONENTS.md#generic-components)) |

## Why camelCase for constants

`const maxRetries = 3` — not `MAX_RETRIES`. SCREAMING_CASE in JavaScript carries an implicit promise of "compile-time enumeration / never changes" that the language doesn't actually enforce. Using camelCase for module constants keeps visual parity with the rest of the codebase and stops the false signal. The rule applies equally to query keys (`getUsersKey`), API paths (`apiBasePath`), and feature flags.
