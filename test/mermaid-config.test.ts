import mermaid from "mermaid";
import { readFile } from "node:fs/promises";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

import defaultConfig, {
    createMermaidConfig,
    getMermaidPresetPath,
    loadMermaidPreset,
    mermaidConfigPath,
    type MermaidThemeName,
    mermaidThemeNames,
    mermaidThemes,
    parseMermaidConfig,
} from "../src/mermaid-config.js";

describe("mermaid shared themes", () => {
    it.each(mermaidThemeNames)("creates the %s theme", (themeName) => {
        expect.assertions(7);

        const config = createMermaidConfig(themeName);
        const definition = mermaidThemes[themeName];

        expect(config.theme).toBe("base");
        expect(config.securityLevel).toBe("strict");
        expect(config.darkMode).toBe(definition.darkMode);
        expect(config.look).toBe(definition.look);
        expect(config.themeVariables).toMatchObject(definition.themeVariables);
        expect(config.deterministicIds).toBe(true);
        expect(config.deterministicIDSeed).toBe("nick2bad4u-mermaid-config");
    });

    it("loads the raw default and keeps returned objects independent", async () => {
        expect.assertions(5);

        const raw: unknown = JSON.parse(
            await readFile(mermaidConfigPath, "utf8")
        );
        const first = createMermaidConfig("ocean");
        const second = createMermaidConfig("ocean");

        expect(path.isAbsolute(mermaidConfigPath)).toBe(true);
        expect(parseMermaidConfig(raw)).toMatchObject({
            securityLevel: "strict",
            theme: "base",
        });
        expect(defaultConfig).toStrictEqual(createMermaidConfig());
        expect(first).not.toBe(second);
        expect(first.themeVariables).not.toBe(second.themeVariables);
    });

    it.each(mermaidThemeNames)(
        "loads the generated %s preset",
        async (themeName) => {
            expect.assertions(2);

            expect(path.isAbsolute(getMermaidPresetPath(themeName))).toBe(true);
            await expect(loadMermaidPreset(themeName)).resolves.toStrictEqual(
                createMermaidConfig(themeName)
            );
        }
    );

    it("deep-merges overrides and replaces arrays", () => {
        expect.assertions(3);

        const config = createMermaidConfig("paper", {
            flowchart: { nodeSpacing: 80 },
            secure: ["securityLevel"],
            themeVariables: { primaryColor: "#ABCDEF" },
        });

        expect(config.flowchart?.nodeSpacing).toBe(80);
        expect(config.secure).toStrictEqual(["securityLevel"]);
        expect(config.themeVariables).toMatchObject({
            primaryColor: "#ABCDEF",
        });
    });

    it("rejects unknown themes, unsafe merge keys, and insecure configs", () => {
        expect.assertions(3);

        expect(() =>
            createMermaidConfig("unknown" as MermaidThemeName)
        ).toThrow(RangeError);
        expect(() =>
            createMermaidConfig(
                "noir",
                JSON.parse('{"__proto__":{"polluted":true}}') as never
            )
        ).toThrow(TypeError);
        expect(() =>
            parseMermaidConfig({ securityLevel: "loose", theme: "base" })
        ).toThrow(TypeError);
    });

    it.each(mermaidThemeNames)(
        "parses a flowchart with %s",
        async (themeName) => {
            expect.assertions(1);

            mermaid.initialize(createMermaidConfig(themeName));

            await expect(
                mermaid.parse("flowchart LR\n  Source --> Config --> Consumer")
            ).resolves.toBeDefined();
        }
    );
});
