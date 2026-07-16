import { readFile, writeFile } from "node:fs/promises";

import {
    createMermaidConfig,
    getMermaidPresetPath,
    mermaidThemeNames,
} from "../dist/mermaid-config.js";

const checkOnly = process.argv.includes("--check");

for (const themeName of mermaidThemeNames) {
    const presetPath = getMermaidPresetPath(themeName);
    const expected = `${JSON.stringify(createMermaidConfig(themeName), null, 4)}\n`;

    if (checkOnly) {
        // eslint-disable-next-line security/detect-non-literal-fs-filename -- path comes from the package-owned theme registry
        const actual = await readFile(presetPath, "utf8");
        if (actual !== expected) {
            throw new Error(
                `Generated preset is stale: ${themeName}. Run npm run generate:presets.`
            );
        }
    } else {
        // eslint-disable-next-line security/detect-non-literal-fs-filename -- path comes from the package-owned theme registry
        await writeFile(presetPath, expected, "utf8");
    }
}

console.log(
    checkOnly
        ? `Verified ${mermaidThemeNames.length} Mermaid presets.`
        : `Generated ${mermaidThemeNames.length} Mermaid presets.`
);
