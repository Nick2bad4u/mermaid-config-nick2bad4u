import { readFile, readdir, unlink, writeFile } from "node:fs/promises";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

import {
    createMermaidConfig,
    getMermaidPresetPath,
    mermaidThemeNames,
} from "../dist/mermaid-config.js";

const checkOnly = process.argv.includes("--check");
const presetDirectory = fileURLToPath(new URL("../presets", import.meta.url));
const expectedPresetFiles = new Set(
    mermaidThemeNames.map((themeName) => `${themeName}.json`)
);

for (const entry of await readdir(presetDirectory, { withFileTypes: true })) {
    if (
        !entry.isFile() ||
        !entry.name.endsWith(".json") ||
        expectedPresetFiles.has(entry.name)
    ) {
        continue;
    }

    if (checkOnly) {
        throw new Error(`Unexpected generated preset: ${entry.name}.`);
    }

    // eslint-disable-next-line security/detect-non-literal-fs-filename -- entry comes from the package-owned preset directory
    await unlink(path.join(presetDirectory, entry.name));
}

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
