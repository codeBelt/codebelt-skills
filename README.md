# CodeBelt Skills

A collection of [Agent Skills](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview) for AI-assisted development with the CodeBelt code style.

## Available Skills

| Skill | Description |
|-------|-------------|
| `codebelt-code-style` | TypeScript & React code style guide — project structure, naming conventions, component patterns, service patterns, state stores, styling (Tailwind + CSS Modules), testing, and Zod schema rules |
| `codebelt-solidjs` | TypeScript & SolidJS code style guide — project structure, file naming, what each file contains (one component per file, `Props` as the only type, `.types`/`.constants`/`.utils` files), component file shape, services and validation schemas, stores and context, `class`/`classList` styling, and testing. Structure only, not a Solid API guide |

## Installation

```bash
npx skills add https://github.com/codeBelt/codebelt-skills --skill codebelt-code-style
```

```bash
npx skills add https://github.com/codeBelt/codebelt-skills --skill codebelt-solidjs
```

## Usage

Once installed, the skill activates automatically when writing, reviewing, or refactoring TypeScript code in React or SolidJS projects — no manual invocation needed.
