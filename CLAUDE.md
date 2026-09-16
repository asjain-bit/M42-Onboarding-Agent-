# Project AI Agent Guide (CLAUDE.md)

This project is a Next.js 15 exact architecture scaffolding matching enterprise atomic design and design token standards.

## Package Manager Scripts

Always use `pnpm` as the package manager:

- `pnpm dev` — Launches Next.js dev server on port 3000
- `pnpm build` — Builds production bundle with Next.js App Router
- `pnpm start` — Runs production server
- `pnpm lint` — Executes ESLint across `src/`
- `pnpm typecheck` — Runs TypeScript compiler in `noEmit` mode
- `pnpm test` — Runs Vitest test suite once
- `pnpm test:watch` — Runs Vitest in interactive watch mode
- `pnpm test:coverage` — Runs Vitest coverage suite (enforces 90% threshold)
- `pnpm test:e2e` — Runs Playwright end-to-end tests
- `pnpm storybook` — Launches Storybook dev server on port 6006
- `pnpm build-storybook` — Builds static Storybook site
- `pnpm prepare` — Initializes Husky Git hooks

## Non-Negotiable Architecture Rules

1. **Design Tokens Only**:
   - Never use raw hex (`#ffffff`), `rgb()`, or `hsl()` in components or TSX files.
   - All color, border, and background styles must reference CSS token custom properties (`var(--token-name)`) or Tailwind utility classes defined in `globals.css`.
   - Modifying tokens: `primitives.css`, `light.css`, and `dark.css` are marked DO NOT EDIT. White-label or feature branch changes belong in `src/styles/tokens/brand.css`.

2. **Atomic Design Rules**:
   - Atoms MUST render single DOM elements with NO atomic component children.
   - Component imports MUST use the `@/` path alias: `import { Button } from '@/components/atoms/Button'`. Relative `../../` imports across atomic layers are strictly forbidden.
   - Every component folder MUST follow the exact 5-file layout:
     ```
     ComponentName/
       ComponentName.tsx          (Implementation)
       ComponentName.types.ts     (Props interface)
       ComponentName.test.tsx     (Vitest + RTL test)
       ComponentName.stories.tsx  (Storybook stories)
       index.ts                   (Export barrel)
     ```
   - Top of every component implementation file MUST include JSDoc:
     ```tsx
     /**
      * ComponentName — Atom | Molecule | Organism | Template
      * One-line description.
      * Used in: ParentA, ParentB
      */
     ```

3. **Git & Commit Rules**:
   - **DO NOT push code to GitHub (`git push`) unless the user explicitly requests or instructs you to push code.**
   - Pre-commit hook runs `lint-staged` (ESLint fix + Prettier write).
   - Commit-msg hook runs `commitlint` enforcing Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`).
   - Pre-push hook executes `pnpm typecheck` and `pnpm test`.

4. **Documentation**:
   - Update `DESIGN.md` whenever a new component or token is created or updated.
