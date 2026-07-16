# mermaid-config-nick2bad4u

[![Continuous Integration](https://github.com/Nick2bad4u/mermaid-config-nick2bad4u/actions/workflows/ci.yml/badge.svg)](https://github.com/Nick2bad4u/mermaid-config-nick2bad4u/actions/workflows/ci.yml)

A secure, source-derived Mermaid configuration with fifteen distinct visual themes. Every custom palette uses Mermaid's customizable `base` theme and keeps `securityLevel: "strict"`.

## Install

```sh
npm install --save-dev mermaid mermaid-config-nick2bad4u
```

## JavaScript

```js
import mermaid from "mermaid";
import config, { createMermaidConfig } from "mermaid-config-nick2bad4u";

mermaid.initialize(config);

// Or choose a theme and override only project-owned details.
mermaid.initialize(
 createMermaidConfig("ocean", {
  deterministicIDSeed: "my-project",
  startOnLoad: false,
 })
);
```

`createMermaidConfig` recursively merges objects and replaces arrays. It returns a fresh object, so consumers cannot mutate the shared default.

## Themes

| Theme             | Character                                    |
| ----------------- | -------------------------------------------- |
| `noir-hand-drawn` | Default navy/blue sketch style               |
| `noir`            | Crisp dark neutral style                     |
| `ocean`           | Deep teal with aqua edges                    |
| `forest`          | Moss and evergreen on a light canvas         |
| `sunset`          | Warm coral and amber                         |
| `rose`            | Burgundy and soft pink                       |
| `lavender`        | Periwinkle hand-drawn style                  |
| `terminal`        | Phosphor green on near-black                 |
| `paper`           | Warm paper and ink                           |
| `high-contrast`   | Black, white, and yellow                     |
| `nord`            | Nord-inspired cool dark palette              |
| `solarized-dark`  | Solarized-inspired dark palette              |
| `solarized-light` | Solarized-inspired light palette             |
| `cyberpunk`       | Neon magenta, cyan, and violet               |
| `colorblind`      | Colorblind-conscious blue, orange, and green |

The immutable `mermaidThemeNames` and `mermaidThemes` exports are useful for selectors, documentation generators, and validation.

## Mermaid CLI

The bundled raw default and every named preset are exported for tools that require a path:

```sh
mmdc -c node_modules/mermaid-config-nick2bad4u/mermaid.config.json \
  -i diagram.mmd -o diagram.svg

mmdc -c node_modules/mermaid-config-nick2bad4u/presets/cyberpunk.json \
  -i diagram.mmd -o diagram-cyberpunk.svg
```

For package-manager-independent automation, use `getMermaidPresetPath(name)` or `loadMermaidPreset(name)` rather than assuming a physical `node_modules` layout.

## Docusaurus

Docusaurus passes `themeConfig.mermaid.options` directly to `mermaid.initialize`. Import the configuration object; `configFile` is not a Mermaid initialization option.

```ts
import { createMermaidConfig } from "mermaid-config-nick2bad4u";

export default {
 markdown: { mermaid: true },
 themes: ["@docusaurus/theme-mermaid"],
 themeConfig: {
  mermaid: {
   options: createMermaidConfig("noir", { startOnLoad: false }),
  },
 },
};
```

## Policy

The default deliberately keeps deterministic IDs, bounded input/edge limits, strict sanitization, portable system fonts, responsive diagrams, and restrained diagram-specific layout settings. Project identity, output paths, site URLs, and unsafe HTML are consumer-owned.

## Validation

```sh
npm run release:verify
```

The test suite constructs every theme and parses a real Mermaid flowchart with each one. Package checks also verify the packed npm surface.
