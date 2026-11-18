# Component Patterns

The component file rules and an example are in [SKILL.md](SKILL.md#component-files). This file adds the directory layout and the patterns around them.

## Table of Contents

- [Directory Structure](#directory-structure)
- [Component Tiers](#component-tiers)
- [Handlers](#handlers)
- [One Component Per File](#one-component-per-file)
- [Composition Over Flags](#composition-over-flags)
- [Supporting Files](#supporting-files)
- [Page-Level Supporting Files](#page-level-supporting-files)
- [Lazy Loading](#lazy-loading)
- [UI Components](#ui-components)
- [Generic Components](#generic-components)
- [Accessibility](#accessibility)
- [Barrel Files](#barrel-files)

## Directory Structure

```text
src/
├── routes/                        # Router files only (names and exports set by the router)
├── components/
│   ├── ui/                        # Pure presentational components (Button, Heading)
│   │   └── heading/
│   │       └── Heading.tsx
│   ├── shared/                    # Domain-aware components used by multiple pages
│   │   └── guestCard/
│   │       └── GuestCard.tsx
│   └── pages/                     # Page components and their nested children
│       └── guestsPage/
│           ├── GuestsPage.tsx
│           ├── GuestsPage.types.ts     # Shared by nested children
│           ├── GuestsPage.utils.ts     # Mappers / helpers for the page
│           └── guestList/
│               └── GuestList.tsx
├── services/
│   └── guests/
│       ├── guestsService.ts
│       └── guestsService.schemas.ts
├── stores/
│   └── themeStore/
│       └── themeStore.store.ts
├── libs/                          # Third-party wrappers
├── styles/
│   └── global.css                 # Project-wide rules and design tokens
└── utils/
    └── date/
        ├── date.ts                # All utility functions go here
        └── date.test.ts
```

## Component Tiers

Three tiers, distinguished by what the component knows about and how widely it is reused. Choose with [the tier workflow in SKILL.md](SKILL.md#choosing-a-component-tier).

| Tier | Knows about your domain? | Reused across pages? | Examples |
|------|--------------------------|----------------------|----------|
| `components/ui/` | No: takes only plain values and style props | Yes, anywhere | `Button`, `Heading`, `Input`, `Dialog` |
| `components/shared/` | Yes: imports domain types | Yes, by 2+ pages | `GuestCard`, `BookingSummary` |
| `components/pages/{page}/` | Yes | No, only this page | `GuestsPage`, `GuestList`, page-local children |

## Handlers

**Inline** a handler when it only forwards to a prop or calls a function with straightforward arguments. **Extract** it to a named `handle*` function when it has real logic: several steps, conditionals or transformations.

```tsx
// ✅ Inline: just forwarding a call
<Button onClick={() => props.onDeleteBooking(props.bookingId)}>Delete</Button>

// ✅ Extracted: has real logic
const handleSubmit = (event: SubmitEvent) => {
  event.preventDefault();
  const errors = validateBooking(formValues);

  if (errors.length === 0) {
    props.onSubmit(formValues);
  }
};
```

## One Component Per File

Each `.tsx` file contains **exactly one component**, and every component gets its own subfolder and file, however small. A helper component that isn't exported still counts.

```tsx
// ❌ Wrong: two components in GuestCard.tsx
function VipBadge() {
  return <span>VIP</span>;
}

export function GuestCard(props: Props) {
  return <p>{props.guest.name}<Show when={props.guest.isVip}><VipBadge /></Show></p>;
}
```

```tsx
// ✅ Right: guestCard/GuestCard.tsx imports the badge from its own folder
import {VipBadge} from './vipBadge/VipBadge';

// guestCard/vipBadge/VipBadge.tsx
export function VipBadge() {
  return <span>VIP</span>;
}
```

```text
guestCard/
├── GuestCard.tsx
├── GuestCard.utils.ts
└── vipBadge/
    └── VipBadge.tsx
```

## Composition Over Flags

When a component starts collecting a boolean or config prop for every caller (`showFooter`, `footerButtonLabel`, `isCompact`), let callers pass the content in instead. The component keeps the layout; callers decide what goes in it.

```tsx
// ❌ Wrong: every variation is another prop
type Props = {
  title: string;
  showFooter?: boolean;
  footerButtonLabel?: string;
  onFooterButtonClick?: () => void;
  body: string;
};

// ✅ Right: callers fill in the pieces
// ui/panel/Panel.tsx
type Props = {
  header?: JSX.Element;
  footer?: JSX.Element;
  children: JSX.Element;
};

export function Panel(props: Props) {
  return (
    <section class="rounded border">
      <Show when={props.header}>
        <div class="p-4 font-semibold">{props.header}</div>
      </Show>
      <div class="p-4">{props.children}</div>
      <Show when={props.footer}>
        <footer class="border-t p-4">{props.footer}</footer>
      </Show>
    </section>
  );
}

// A caller
<Panel header="Arrivals" footer={<Button onClick={handleCheckInAll}>Check in all</Button>}>
  <ArrivalsList arrivals={arrivals()} />
</Panel>
```

The panel no longer grows a prop for each screen. Keep plain props for real variations of the component itself, such as a `level` or a `variant` union.

## Supporting Files

- **`.types.ts`** holds every type except `Props`: domain shapes, unions, and types shared by the component and its supporting files.
- **`.constants.ts`** holds static configuration and fixed data only: no signals, browser reads, callbacks or derived values. Anything reactive belongs in the component or a store. Class strings are the exception: they stay in the component, including a variant map (see [Styling](SKILL.md#styling)).
- **`.utils.ts`** holds pure helpers used only by that component or page, and is where most testable logic lives. Inside a `utils/` folder, the main `{utilName}.ts` file is the utility, so there's no `.utils.ts` there.

```ts
// GuestCard.types.ts
export type Guest = {
  id: string;
  name: string;
  isVip: boolean;
};

// GuestCard.constants.ts
export const maxNameLength = 30;

// GuestCard.utils.ts
import {maxNameLength} from './GuestCard.constants';

export function formatGuestName(name: string): string {
  return name.length > maxNameLength ? `${name.slice(0, maxNameLength)}…` : name;
}
```

## Page-Level Supporting Files

`{PageName}.types.ts` and `{PageName}.utils.ts` hold the **types and helpers that several nested children need**.

```text
guestsPage/
├── GuestsPage.tsx
├── GuestsPage.types.ts       # GuestRow, GuestStatus: used by GuestList and GuestCard
├── GuestsPage.utils.ts       # filterGuests(), toGuestRow()
├── guestList/
│   └── GuestList.tsx         # imports GuestRow from '../GuestsPage.types'
└── guestCard/
    └── GuestCard.tsx         # imports GuestRow from '../GuestsPage.types'
```

- Children **import directly** from `{PageName}.types.ts`. A child's `.types.ts` never re-exports the parent's types, because that creates two import paths for one type.
- A type used by only one child stays in that child's `.types.ts`. Promote it to the page's file when a second child needs it.
- `{PageName}.utils.ts` holds page-scoped mappers and pure helpers. Anything reused outside the page belongs in `utils/`.

## Lazy Loading

`lazy()` expects a module with a default export. Because components use named exports, map the export in a `.lazy.ts` file next to the component:

```ts
// reportChart/ReportChart.lazy.ts
import {lazy} from 'solid-js';

export const ReportChartLazy = lazy(() =>
  import('./ReportChart').then((module) => ({default: module.ReportChart})),
);
```

- The wrapper is exported as `{Component}Lazy`, and consumers import the lazy version.
- Use it for heavy, rarely shown pieces: charts, editors, maps, admin-only screens. Routers usually code-split routes themselves.

## UI Components

- Encode a variation as a typed prop rather than several components (`<Heading level={2}>`, not `Heading2`), and constrain it with a literal union (`1 | 2 | 3 | 4 | 5 | 6`), not `number` or `string`.
- Accept a `class` prop so callers can add spacing or layout, and keep domain styling out.
- Keep domain code out: no domain types, stores or services. Utilities, icons and other libraries are fine. A component that needs domain code belongs in `shared/`.

## Generic Components

A component that renders or forwards a value whose shape the caller decides is **generic over that value's type**, so the callbacks the consumer passes are type-checked end to end.

```tsx
// ui/list/List.tsx
type Props<TItem> = {
  items: TItem[];
  renderItem: (item: TItem) => JSX.Element;
  onSelectItem?: (item: TItem) => void;
};

export function List<TItem>(props: Props<TItem>) {
  // ...
}
```

- **Constrain the parameter** when the component relies on a shape (`TItem extends {id: string}`).
- Put the generic on the function, so TypeScript infers it at the call site.
- Prefer a literal union when the set of values is known; generics are for shapes the caller decides.

## Accessibility

- Actions are `<button>` elements, navigation is links. Put a `<button>` inside a clickable row or card rather than `onClick` on a `<div>` or `<li>`.
- Every `<button>` has an explicit `type`: `type="button"` for actions, `type="submit"` only for real submits, because a button inside a form submits it by default.
- Every form control has a label (`<label for=...>` or `aria-label`).
- When the project has an accessible component library (such as Kobalte), use it for dialogs, menus, tabs and similar widgets.

## Barrel Files

Application code has no barrel files (`index.ts`). They make import cycles easy to create, load every module they export, and get in the way of tree-shaking. Import directly from the module:

```ts
// ❌ Wrong
import {Button} from '@/components/ui';

// ✅ Right (with the project's path alias or relative paths)
import {Button} from '@/components/ui/button/Button';
```

The only exception is the single entry point of a published npm package.
