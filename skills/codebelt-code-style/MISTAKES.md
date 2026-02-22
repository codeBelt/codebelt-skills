# Common Mistakes

Quick-reference table for code review and self-checks.

| Wrong | Right |
|-------|-------|
| `interface Props {...}` | `type Props = {...}` |
| `export type Props` | `type Props` (no export) |
| Types in component file | Move to `.types.ts` (except Props) |
| `utils/dateUtils/dateUtils.ts` | `utils/date/date.ts` |
| `const MAX_RETRIES = 3` | `const maxRetries = 3` |
| `(e) => handleClick(e)` | `(event) => handleClick(event)` |
| Constants in component | Extract to `.constants.ts` |
| Helpers in component | Extract to `.utils.ts` |
| Multiple components per file | One component per file |
| Barrel files (`index.ts`) | Direct imports from modules |
| Default exports | Named exports |
| Re-exporting types/values | Import directly from source file |
| `export default function` | `export function` |
| `interface User {...}` | `type User = {...}` |
| Different schema/type names | Same name for both (dual namespaces) |
