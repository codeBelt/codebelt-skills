# Common Mistakes

The review and self-check list for projects that use this guide. In a codebase with different established conventions, match those instead (see [SKILL.md](SKILL.md#first-does-this-project-use-codebelt-style)). Reviews group their findings under these headings.

## File Structure and Exports

| Wrong | Right |
|-------|-------|
| Multiple components in one `.tsx` file | One component per file, each in its own subfolder |
| A component past about 200 lines | Split out the parts with their own state or logic |
| A component extracted for a few lines of markup used once | Keep it inline in the parent |
| Types other than `Props` in the component file | Move them to `.types.ts` |
| Constants (arrays, objects, strings, numbers) in the component file | Extract them to `.constants.ts`. The one exception is a map of class strings for variants, which stays in the component file (see [SKILL.md](SKILL.md#styling)) |
| Helpers in the component file | Extract them to `.utils.ts` |
| `utils/date/date.utils.ts` | `utils/date/date.ts` |
| A domain-neutral component under `shared/` | Move it to `ui/` |
| A domain-aware component under `ui/` | Move it to `shared/` (or the page, if one page uses it) |
| Promoting to `shared/` before a second page needs it | Keep it page-local until a second consumer appears |
| Page logic in a route file | The route file renders the page component; the code lives in `components/pages/` |
| `export default function` (outside framework-required files) | `export function`: named exports only |
| Barrel `index.ts`, re-exports | Import directly from the owning module |
| Mixing `'./foo'` and `'./foo.ts'` import styles | Follow the project's existing style everywhere |
| `lazy(() => import('./Chart'))` with a named export | `lazy(() => import('./Chart').then((module) => ({default: module.Chart})))` in `Chart.lazy.ts` |

## Component Shape

| Wrong | Right |
|-------|-------|
| `const Card = (props: Props) => ...` | `export function Card(props: Props)` |
| `function Card({guest}: Props)` or `const {guest} = props` | `function Card(props: Props)` and read `props.guest` where it's used |
| `const guestId = params.guestId` at the top of a page | Read `params.guestId` where it's used |
| `if (!props.guest) return null;` at the top of a component | `<Show when={props.guest}>...</Show>`: no early returns |
| `{isOpen() && <Panel />}` or a ternary for a whole branch of markup | `<Show when={isOpen()}><Panel /></Show>` |
| `{items().map((item) => <Row item={item} />)}` in JSX | `<For each={items()}>{(item) => <Row item={item} />}</For>` |
| `showFooter`, `footerButtonLabel`… flags added for each caller | `children` and JSX props (`header`, `footer`) that callers fill in (see [COMPONENTS.md](COMPONENTS.md#composition-over-flags)) |
| A wrapper function around a simple forwarded call | Inline it: `onClick={() => props.onDeleteBooking(bookingId)}` |

## Naming

| Wrong | Right |
|-------|-------|
| `interface Props {...}` | `type Props = {...}` |
| `export type Props` | `type Props` (no export) |
| `type GuestCardProps` | `type Props`: always named `Props` |
| `const MAX_RETRIES = 3` | `const maxRetries = 3` |
| `(e) => ...`, `(r) => ...` | `(event) => ...`, `(role) => ...` |
| `setCount((c) => c + 1)` | `setCount((previousCount) => previousCount + 1)` |
| `getVisibleGuests` as a memo name | `visibleGuests`: derived values are nouns |
| `useGuestsQuery` for a query wrapper | `createGuestsQuery`: `use*` is only for functions that read a context |
| Callback prop named `handleClick` | Props use `on`: `onClick`. Internal handlers use `handle` |

## TypeScript

| Wrong | Right |
|-------|-------|
| `value!`, `let ref!: HTMLDivElement`, `useContext(Ctx)!` | A guard, a `<Show>` callback, `let ref: HTMLDivElement \| undefined`, or a `use{Name}` function that throws |
| `?.` or an invented fallback hiding a required value | Narrow it, or throw a clear error |
| `items: any[]` / `onSelect: (item: unknown) => void` on a reusable component | Make it generic: `function List<TItem>(props: Props<TItem>)` |
| Static config typed as `Record<string, string>` | `satisfies Record<Status, string>` so literal keys survive |

## Styling and Accessibility

| Wrong | Right |
|-------|-------|
| `className`, `htmlFor` | `class`, `for` |
| `` class={`btn ${isActive() ? 'active' : ''}`} `` | 1.x: `class="btn" classList={{active: isActive()}}`. 2.x: `class={['btn', {active: isActive()}]}` |
| Class strings stored in `.constants.ts` | Write them in JSX |
| `GuestCard.css` imported by a component | `GuestCard.module.css` next to it, or the project's utility classes |
| `<div onClick>` / `<li onClick>` for clickable UI | `<button type="button" onClick>` |
| `<button>` without a `type` | `type="button"` for actions, `type="submit"` only for real submits |
| Form control without a label | A `<label for>` or `aria-label` |

## Services

| Wrong | Right |
|-------|-------|
| `fetch` / `httpClient` calls inside a component or store | A fetch function in `services/{name}/{name}Service.ts` |
| A new service that skips validation while the project's other services validate | Validate like the rest of the project (`Schema.parse(...)`, `v.parse(Schema, ...)`) |
| `type Guest = z.infer<typeof GuestSchema>` (or `v.InferOutput`) | `type GuestSchema = ...<typeof GuestSchema>`: same name as the schema |
| Signals or Solid imports in a fetch function | Keep fetch functions plain TypeScript; reactivity lives in the caller or the query wrapper |

## Stores and Context

| Wrong | Right |
|-------|-------|
| Store in `stores/toastStore.ts` | `stores/toastStore/toastStore.store.ts` |
| Exporting a store's setter | Export read-only state and named action functions |
| `useContext(BookingWizardContext)!` in a component | `useBookingWizard()` from `BookingWizardProvider.context.ts`, which throws when the provider is missing |

## Solid Versions

| Wrong | Right |
|-------|-------|
| Reading the `solid-js` version from the monorepo root | Read the `package.json` nearest to the file |
| `classList`, `<Index>`, `Context.Provider` or path setters in a 2.x package | The 2.x forms in [the version table](SKILL.md#solid-versions) |
| Solid code copied from a package on another Solid version | Write it for this package's version |
