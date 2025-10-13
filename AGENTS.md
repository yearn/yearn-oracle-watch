# Repository Guidelines

## Project Structure & Module Organization

- Root `package.json` manages Bun workspaces; shared configs live in `tsconfig.json` and `biome.json`.
- Application code sits in `packages/app/src`, grouped by feature folders (`components`, `context`, `hooks`, `utils`) with public assets in `packages/app/public`.
- Smart-contract integration and generated Wagmi clients reside in `packages/contracts`; run codegen before consuming `src/wagmi.ts`.
- Reusable business logic is shipped from `packages/sdk/src`, which is imported by the app and external consumers.

## Build, Test, and Development Commands

- Install once with `bun install`.
- Start the UI locally via `bun run --filter ./packages/app start` or whole-workspace dev mode using `bun run dev:watch`.
- Generate contract and GraphQL clients with `bun run build:gen`; rebuild shared packages through `bun run build:deps`.
- Produce a production bundle with `bun run build`; serve the compiled app using `bun run --filter ./packages/app serve`.

## Coding Style & Naming Conventions

- TypeScript and React throughout; prefer functional components and hooks.
- Follow Biome formatting (2-space indentation, single quotes, trailing commas); run `bun run format-and-lint` before pushing.
- Name files and exports in `camelCase`, React components in `PascalCase`, and test files as `<subject>.test.ts[x]`.
- Co-locate styles in `style.css` or component-level modules; keep contract artifacts out of `src`.

## Testing Guidelines

- Vitest powers unit and integration tests; target parity with new features and regression fixes.
- Place app tests under `packages/app/src/tests`; mirror SDK specs alongside source files when practical.
- Run the full suite with `bun run test` or scope runs, e.g. `bun run --filter ./packages/sdk test`.
- When adding data-fetching logic, stub external calls via Tanstack Query mocks to keep tests deterministic.

## Commit & Pull Request Guidelines

- Use Conventional Commit prefixes (`feat:`, `fix:`, `chore:`) as seen in history; scope optional but encouraged (`feat(app): ...`).
- Keep commits focused and runnable; include generated code only when necessary for review.
- Pull requests need a clear summary, linked GitHub issues, and UI screenshots or recordings when changing visuals.
- Mention any env variable changes and include reproduction steps so reviewers can verify quickly.
