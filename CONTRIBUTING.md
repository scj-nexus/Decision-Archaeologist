# Contributing

## Development flow

1. Use the local npm cache override for every npm command on this machine.
2. Run `npm run demo:seed` if you want to regenerate the fixture repo from scratch.
3. Keep the analyzer read-only for target repositories. Only the bundled demo fixture is generated locally.
4. Run `npm run lint`, `npm run typecheck`, and `npm run test` before committing.

## Fixture rules

- Keep the demo history deterministic.
- Prefer explicit commit messages that help the analyzer infer architectural intent.
- Preserve the four core events: migration, restructure, toolchain swap, and configuration hardening.

## Testing

- Unit and integration tests live under `tests/` and run with Vitest.
- End-to-end coverage lives under `tests/e2e` and uses Playwright against the local dev server.
- If you update the main workflow, refresh the screenshot in `docs/` via `npm run test:e2e`.
