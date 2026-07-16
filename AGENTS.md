# Repository Instructions

This repository publishes `mermaid-config-nick2bad4u`. Treat the raw JSON config, theme names, typed factory, loader path, and package exports as public API.

## Priorities

- Keep every custom palette on Mermaid's `base` theme.
- Preserve `securityLevel: "strict"` and bounded input defaults.
- Keep package defaults free of consumer identity, paths, URLs, and credentials.
- Use portable font stacks and deterministic, valid hexadecimal colors.
- Validate every theme with the current Mermaid parser before release.

## Commands

```sh
npm run build:runtime
npm run typecheck
npm test
npm run release:verify
```
