# Agent Skills Research & Best Practices

> Comprehensive research conducted on 2026-02-22 to inform the creation of the `codebelt-code-style` skill.

---

## Table of Contents

1. [Sources Consulted](#sources-consulted)
2. [What Are Agent Skills](#what-are-agent-skills)
3. [Skill Architecture: Progressive Disclosure](#skill-architecture-progressive-disclosure)
4. [Skill Structure Requirements](#skill-structure-requirements)
5. [Best Practices from Official Docs](#best-practices-from-official-docs)
6. [Top 10 Skills Analysis](#top-10-skills-analysis)
7. [Patterns Identified Across Top Skills](#patterns-identified-across-top-skills)
8. [Design Decisions for codebelt-code-style](#design-decisions-for-codebelt-code-style)
9. [Skill Authoring Checklist](#skill-authoring-checklist)
10. [References](#references)

---

## Sources Consulted

| Source | Type | URL |
|--------|------|-----|
| Anthropic Official Docs | Authoritative | [Agent Skills Overview](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview) |
| Anthropic Best Practices | Authoritative | [Skill Authoring Best Practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices) |
| Anthropic Engineering Blog | Authoritative | [Equipping Agents for the Real World](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills) |
| Anthropic Skills Repo | Official Examples | [github.com/anthropics/skills](https://github.com/anthropics/skills) |
| skills.sh Leaderboard | Community Rankings | [skills.sh](https://skills.sh/) |
| Vercel Agent Skills Repo | Top Community Repo | [github.com/vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) |
| Anthropic Skill Creator | Meta-Skill | [skills/skill-creator/SKILL.md](https://github.com/anthropics/skills/blob/main/skills/skill-creator/SKILL.md) |

---

## What Are Agent Skills

Skills are **filesystem-based, modular capabilities** that extend Claude's functionality. They are:

- **Reusable**: Created once, used automatically across conversations
- **On-demand**: Loaded progressively to minimize context window usage
- **Composable**: Multiple skills can work together
- **Self-contained**: Each skill is a directory with a `SKILL.md` and optional resources

Skills run in environments where Claude has filesystem access (Claude Code, Claude.ai, Claude API, Claude Agent SDK). Claude discovers installed skills via their metadata and triggers them when relevant.

> "Skills teach Claude how to complete specific tasks in a repeatable way." — [anthropics/skills README](https://github.com/anthropics/skills)

---

## Skill Architecture: Progressive Disclosure

The core design principle. Skills load information in three stages:

### Level 1: Metadata (Always Loaded)
- The `name` and `description` from YAML frontmatter
- Injected into system prompt at startup (~100 words)
- Zero context cost for unused skills

### Level 2: Instructions (Loaded When Triggered)
- The markdown body of `SKILL.md`
- Read via bash when Claude determines the skill is relevant
- Should be **under 500 lines** for optimal performance

### Level 3: Resources (Loaded As Needed)
- Additional markdown files, scripts, templates, assets
- Referenced from `SKILL.md` with clear descriptions of when to read them
- Scripts are **executed without reading into context** — only output enters context

> "Progressive disclosure is the core design principle that makes Agent Skills flexible and scalable." — [Anthropic Engineering Blog](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)

---

## Skill Structure Requirements

### Required

```
skill-name/
└── SKILL.md            # Required: YAML frontmatter + markdown instructions
```

### YAML Frontmatter

```yaml
---
name: skill-name         # Required. Max 64 chars. Lowercase, numbers, hyphens only.
description: ...         # Required. Max 1024 chars. What it does AND when to use it.
---
```

**Name constraints:**
- Lowercase letters, numbers, hyphens only
- No XML tags
- No reserved words ("anthropic", "claude")

**Description must include:**
1. What the skill does
2. When Claude should use it (trigger conditions)
3. Written in third person
4. Specific key terms for discoverability

### Optional Directory Structure

```
skill-name/
├── SKILL.md                # Main instructions
├── REFERENCE.md            # Detailed reference (loaded as needed)
├── EXAMPLES.md             # Usage examples (loaded as needed)
├── references/             # Domain-specific docs
│   ├── topic-a.md
│   └── topic-b.md
├── scripts/                # Executable code (run, not read)
│   └── helper.py
└── assets/                 # Templates, images, fonts
    └── template.html
```

---

## Best Practices from Official Docs

### 1. Conciseness is Key

> "The context window is a public good."

- Claude is already very smart — only add context it doesn't have
- Challenge each paragraph: "Does this justify its token cost?"
- Prefer concise code examples over verbose explanations
- Keep SKILL.md body under 500 lines

### 2. Set Appropriate Degrees of Freedom

| Freedom Level | When to Use | Example |
|---------------|------------|---------|
| **High** (text instructions) | Multiple valid approaches, context-dependent | Code review criteria |
| **Medium** (pseudocode/templates) | Preferred pattern exists, some variation ok | Report generation template |
| **Low** (exact scripts) | Fragile operations, consistency critical | Database migrations |

### 3. Write Effective Descriptions

- Third person: "Processes files" not "I can process files"
- Include both capabilities AND trigger conditions
- Be specific: include file types, key terms, use cases
- The description is what Claude uses to select from 100+ skills

### 4. Progressive Disclosure Patterns

- **Pattern 1**: High-level guide with references to separate files
- **Pattern 2**: Domain-specific organization (by variant/category)
- **Pattern 3**: Conditional details (basic inline, advanced in files)

### 5. Avoid Anti-Patterns

- ❌ Barrel files of options ("use A, or B, or C, or D...")
- ❌ Windows-style paths (`\` instead of `/`)
- ❌ Vague names: `helper`, `utils`, `tools`
- ❌ Time-sensitive information without marking it
- ❌ Deeply nested references (keep one level deep from SKILL.md)
- ❌ README.md, CHANGELOG.md, INSTALLATION_GUIDE.md (extraneous files)

### 6. Use Workflows for Complex Tasks

- Break complex operations into clear sequential steps
- Provide checklists Claude can track progress against
- Include feedback loops for quality-critical tasks

### 7. Common Patterns

- **Template pattern**: Provide output format templates (strict or flexible)
- **Examples pattern**: Input/output pairs for style demonstration
- **Conditional workflow pattern**: Decision trees for choosing approaches

---

## Top 10 Skills Analysis

Analyzed from [skills.sh leaderboard](https://skills.sh/) (all-time rankings as of 2026-02-22):

### 1. find-skills (vercel-labs/skills) — 92.1K installs
- **Type**: Meta/discovery tool
- **Takeaway**: Simple, focused utility

### 2. vercel-react-best-practices (vercel-labs/agent-skills) — 56.9K installs
- **Type**: Code style/best practices
- **Structure**: SKILL.md + `rules/` directory with 57 individual rule files
- **Takeaways**:
  - Uses **priority-based categorization** (CRITICAL → LOW)
  - Each rule is a separate `.md` file with wrong/right code examples
  - SKILL.md serves as a table of contents with a priority matrix
  - Compiled full document available as `AGENTS.md`
  - Progressive disclosure: Claude reads individual rules as needed
  - **Pattern**: Category prefix naming (`async-`, `bundle-`, `server-`, etc.)

### 3. web-design-guidelines (vercel-labs/agent-skills) — 19.2K installs
- **Type**: Code review/audit tool
- **Structure**: Single SKILL.md that fetches external guidelines
- **Takeaways**:
  - Decision tree: when to apply the skill
  - Minimal footprint — delegates to external source
  - Clear output format specification

### 4. remotion-best-practices (remotion-dev/skills) — 5.2K installs
- **Type**: Framework-specific best practices

### 5. frontend-design (anthropics/skills) — 89.9K installs
- **Type**: Creative design guidance
- **Structure**: Single SKILL.md
- **Takeaways**:
  - **Bold aesthetic philosophy** — strong opinionated stance
  - Clear "NEVER do this" anti-patterns list
  - Categories of focus: Typography, Color, Motion, Composition, Backgrounds
  - High freedom approach: gives creative direction, not rigid templates
  - Entirely instruction-based, no scripts or references needed
  - Key phrase: "Apply these rules when..." (clear trigger)

### 6. vercel-composition-patterns (vercel-labs/agent-skills) — 52.2K installs
- **Type**: React composition patterns

### 7. agent-browser (vercel-labs/agent-browser) — 51.7K installs
- **Type**: Browser automation toolkit

### 8. skill-creator (anthropics/skills) — 43.5K installs
- **Type**: Meta-skill for creating other skills
- **Structure**: SKILL.md + `scripts/` for init and packaging
- **Takeaways**:
  - Documents the **canonical skill anatomy** (SKILL.md + scripts/ + references/ + assets/)
  - Explains three-level loading with token counts
  - Defines what NOT to include (README, CHANGELOG, etc.)
  - Step-by-step creation process
  - **Key rule**: "Information should live in either SKILL.md or references files, not both"
  - References files for >10k words should include grep patterns in SKILL.md

### 9. vercel-react-native-skills (vercel-labs/agent-skills) — 36.9K installs
- **Type**: React Native best practices

### 10. browser-use (browser-use/browser-use) — 36.5K installs
- **Type**: Browser automation (Python)

### Bonus: webapp-testing (anthropics/skills)
- **Structure**: SKILL.md + `scripts/` + `examples/`
- **Takeaways**:
  - Uses a **decision tree** for choosing approach
  - Helper scripts treated as black boxes (`--help` first, don't read source)
  - Clear "Common Pitfall" section with ❌/✅ pattern
  - Concise code examples with inline comments for critical steps

---

## Patterns Identified Across Top Skills

### Structural Patterns

1. **Quick Reference / Priority Table at Top**: The most successful skills (#2 Vercel React) use a categorized table at the top of SKILL.md for fast scanning
2. **Wrong/Right Examples**: Nearly every top skill uses paired examples showing incorrect vs correct code
3. **Decision Trees**: Skills that handle multiple scenarios (#3 web-design, webapp-testing) use flowchart-style decision trees
4. **Progressive Disclosure via Separate Files**: Top skills split detailed content into referenced files, keeping SKILL.md as an index/overview
5. **Clear Trigger Conditions**: Every successful skill explicitly states when to activate

### Content Patterns

1. **Concise > Verbose**: Top skills assume Claude already knows fundamentals and only add domain-specific rules
2. **Opinionated Stances**: The most popular skills (#5 frontend-design) take strong positions rather than offering multiple options
3. **Tables for Quick Reference**: Quick-scan tables are used extensively (naming conventions, file extensions, priorities)
4. **Anti-pattern Lists**: "Common Mistakes" / "Never do this" sections are universal
5. **Workflow Steps**: Multi-step processes are laid out as numbered checklists

### Technical Patterns

1. **Category Prefixes**: Rule files named with category prefix (e.g., `async-parallel.md`, `bundle-barrel-imports.md`)
2. **Table of Contents**: Reference files >100 lines include a TOC at top
3. **Scripts as Black Boxes**: Scripts are meant to be run, not read into context
4. **One Level of Reference Depth**: All references link directly from SKILL.md, no nesting

---

## Design Decisions for codebelt-code-style

Based on the research, here's how each best practice informed our skill design:

### Decision 1: Progressive Disclosure Structure

```
codebelt-code-style/
├── SKILL.md          # Quick reference + workflows (overview/index)
├── COMPONENTS.md     # Component patterns, hierarchy, barrel file policy
├── SERVICES.md       # Service patterns, Zod schemas, TypeScript rules
├── TESTING.md        # Testing patterns, test.each conventions
└── MISTAKES.md       # Common mistakes quick-reference
```

**Rationale**: Follows Pattern 1 (high-level guide with references) from the best practices. SKILL.md stays under 100 lines as a lean index. Detailed patterns split by domain (components, services, testing, mistakes) so Claude only loads what's relevant.

### Decision 2: Description Design

```yaml
description: Enforces the CodeBelt TypeScript and React code style guide for project
structure, naming conventions, component patterns, service patterns, testing, and
TypeScript rules. Use when writing, reviewing, or refactoring TypeScript or React
code, creating new files or components, organizing project directories, writing
tests, defining Zod schemas, or when the user mentions code style, conventions,
linting, file organization, or naming patterns.
```

**Rationale**: Follows the "what it does + when to use it" pattern. Third person. Includes key terms (TypeScript, React, Zod, code style, naming conventions, etc.) for accurate skill selection. Modeled after Vercel's descriptions.

### Decision 3: Quick Reference Tables in SKILL.md

**Rationale**: Inspired by Vercel React Best Practices (#2) which uses a priority table at the top. Our tables cover file placement, extensions, and naming — the most frequently needed rules. These are in SKILL.md because they're universally applicable (not domain-specific).

### Decision 4: Workflow Sections

**Rationale**: Best practices recommend workflows for complex tasks. Creating a new component, service, or hook follows a specific sequence — low-freedom rules that must be consistent. Modeled after skill-creator's step-by-step process.

### Decision 5: Wrong/Right Examples in Reference Files

**Rationale**: Universal pattern across top skills. Every reference file includes clear wrong/right paired examples, following the frontend-design and webapp-testing patterns.

### Decision 6: No Scripts or Assets

**Rationale**: This is a style guide skill — it provides instructions and rules, not executable workflows. High freedom approach matches the task: "multiple approaches are valid, decisions depend on context."

### Decision 7: Tables of Contents in Reference Files

**Rationale**: Best practices say files >100 lines should have a TOC. COMPONENTS.md and SERVICES.md both include TOCs for quick scanning, following skill-creator's guidance.

---

## Skill Authoring Checklist

Applied to `codebelt-code-style`:

### Core Quality
- [x] Description is specific and includes key terms
- [x] Description includes both what the skill does and when to use it
- [x] SKILL.md body is under 500 lines (under 100 lines)
- [x] Additional details are in separate files
- [x] No time-sensitive information
- [x] Consistent terminology throughout
- [x] Examples are concrete, not abstract
- [x] File references are one level deep
- [x] Progressive disclosure used appropriately
- [x] Workflows have clear steps

### Structure
- [x] YAML frontmatter has `name` and `description`
- [x] Name uses lowercase letters, numbers, hyphens only
- [x] Name is under 64 characters
- [x] Description is under 1024 characters
- [x] No extraneous files (README, CHANGELOG, etc.)
- [x] Reference files have tables of contents
- [x] Forward slashes in all file paths

---

## References

1. **Anthropic Agent Skills Overview**: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview
2. **Anthropic Skill Authoring Best Practices**: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices
3. **Anthropic Engineering Blog — Equipping Agents**: https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills
4. **Anthropic Skills Repository**: https://github.com/anthropics/skills
5. **Anthropic Skill Creator Skill**: https://github.com/anthropics/skills/blob/main/skills/skill-creator/SKILL.md
6. **Anthropic Frontend Design Skill**: https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md
7. **Anthropic Webapp Testing Skill**: https://github.com/anthropics/skills/blob/main/skills/webapp-testing/SKILL.md
8. **Anthropic Skill Template**: https://github.com/anthropics/skills/blob/main/template/SKILL.md
9. **Vercel React Best Practices Skill**: https://github.com/vercel-labs/agent-skills/tree/main/skills/react-best-practices
10. **Vercel Web Design Guidelines Skill**: https://github.com/vercel-labs/agent-skills/tree/main/skills/web-design-guidelines
11. **Skills.sh Leaderboard**: https://skills.sh/
12. **TkDodo — Please Stop Using Barrel Files**: https://tkdodo.eu/blog/please-stop-using-barrel-files
