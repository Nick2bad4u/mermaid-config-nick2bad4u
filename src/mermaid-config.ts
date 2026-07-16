import type { MermaidConfig } from "mermaid";
import type { UnknownRecord } from "type-fest";

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { arrayIncludes, objectEntries, safeCastTo } from "ts-extras";

// eslint-disable-next-line import-x/extensions -- ESM JSON imports require the explicit extension
import bundledConfigJson from "../mermaid.config.json" with { type: "json" };

/** Supported visual presets. */
export type MermaidThemeName =
    | "colorblind"
    | "cyberpunk"
    | "forest"
    | "high-contrast"
    | "lavender"
    | "noir"
    | "noir-hand-drawn"
    | "nord"
    | "ocean"
    | "paper"
    | "rose"
    | "solarized-dark"
    | "solarized-light"
    | "sunset"
    | "terminal";

type MermaidLook =
    | "classic"
    | "handDrawn"
    | "neo";

interface ThemeDefinition {
    readonly darkMode: boolean;
    readonly look: MermaidLook;
    readonly themeVariables: Readonly<Record<string, string>>;
}

const palette = (
    background: string,
    foreground: string,
    primary: string,
    primaryText: string,
    secondary: string,
    tertiary: string,
    line: string
): Readonly<Record<string, string>> =>
    Object.freeze({
        actorBkg: primary,
        actorBorder: line,
        actorLineColor: line,
        actorTextColor: primaryText,
        background,
        edgeLabelBackground: background,
        lineColor: line,
        mainBkg: primary,
        primaryBorderColor: line,
        primaryColor: primary,
        primaryTextColor: primaryText,
        secondaryColor: secondary,
        secondaryTextColor: foreground,
        secondBkg: secondary,
        signalColor: line,
        signalTextColor: primaryText,
        tertiaryBkg: tertiary,
        tertiaryColor: tertiary,
        tertiaryTextColor: foreground,
        textColor: foreground,
    });

/** Theme names accepted by {@link createMermaidConfig}. */
export const mermaidThemeNames: readonly MermaidThemeName[] = Object.freeze([
    "noir-hand-drawn",
    "noir",
    "ocean",
    "forest",
    "sunset",
    "rose",
    "lavender",
    "terminal",
    "paper",
    "high-contrast",
    "nord",
    "solarized-dark",
    "solarized-light",
    "cyberpunk",
    "colorblind",
]);

/** Package-owned visual definitions. Mermaid custom themes must use `base`. */
export const mermaidThemes: Readonly<
    Record<MermaidThemeName, ThemeDefinition>
> = Object.freeze({
    colorblind: {
        darkMode: false,
        look: "classic",
        themeVariables: palette(
            "#FFFFFF",
            "#111111",
            "#0072B2",
            "#FFFFFF",
            "#E69F00",
            "#009E73",
            "#111111"
        ),
    },
    cyberpunk: {
        darkMode: true,
        look: "neo",
        themeVariables: palette(
            "#090014",
            "#F8F0FF",
            "#FF2BD6",
            "#090014",
            "#00F0FF",
            "#FFE600",
            "#8C52FF"
        ),
    },
    forest: {
        darkMode: false,
        look: "classic",
        themeVariables: palette(
            "#F4F8F0",
            "#1F2D1F",
            "#CDE8B0",
            "#17320D",
            "#A8D5BA",
            "#F4D35E",
            "#3A6B35"
        ),
    },
    "high-contrast": {
        darkMode: true,
        look: "classic",
        themeVariables: palette(
            "#000000",
            "#FFFFFF",
            "#000000",
            "#FFFFFF",
            "#1A1A1A",
            "#262626",
            "#FFFF00"
        ),
    },
    lavender: {
        darkMode: false,
        look: "handDrawn",
        themeVariables: palette(
            "#FBF8FF",
            "#322A40",
            "#E8DCFF",
            "#322A40",
            "#D8C4F1",
            "#F7D9E3",
            "#76589D"
        ),
    },
    noir: {
        darkMode: true,
        look: "classic",
        themeVariables: palette(
            "#111827",
            "#F9FAFB",
            "#1F2937",
            "#F9FAFB",
            "#374151",
            "#4B5563",
            "#6B7280"
        ),
    },
    "noir-hand-drawn": {
        darkMode: true,
        look: "handDrawn",
        themeVariables: palette(
            "#111827",
            "#F9FAFB",
            "#1F2937",
            "#F9FAFB",
            "#374151",
            "#4B5563",
            "#3B82F6"
        ),
    },
    nord: {
        darkMode: true,
        look: "classic",
        themeVariables: palette(
            "#2E3440",
            "#ECEFF4",
            "#3B4252",
            "#ECEFF4",
            "#434C5E",
            "#4C566A",
            "#88C0D0"
        ),
    },
    ocean: {
        darkMode: true,
        look: "neo",
        themeVariables: palette(
            "#071E2B",
            "#E6F7FF",
            "#0B4F6C",
            "#FFFFFF",
            "#117A8B",
            "#20A4A4",
            "#7FDBFF"
        ),
    },
    paper: {
        darkMode: false,
        look: "handDrawn",
        themeVariables: palette(
            "#FFFEF8",
            "#222222",
            "#FFF8D6",
            "#222222",
            "#E9F2FF",
            "#FBE4E4",
            "#4B4B4B"
        ),
    },
    rose: {
        darkMode: false,
        look: "classic",
        themeVariables: palette(
            "#FFF8FA",
            "#3F202B",
            "#FAD1DC",
            "#3F202B",
            "#F4B8C8",
            "#FFE0E8",
            "#A33F60"
        ),
    },
    "solarized-dark": {
        darkMode: true,
        look: "classic",
        themeVariables: palette(
            "#002B36",
            "#FDF6E3",
            "#073642",
            "#FDF6E3",
            "#0B4A55",
            "#586E75",
            "#2AA198"
        ),
    },
    "solarized-light": {
        darkMode: false,
        look: "classic",
        themeVariables: palette(
            "#FDF6E3",
            "#073642",
            "#EEE8D5",
            "#073642",
            "#E4DEC9",
            "#D7D0BA",
            "#268BD2"
        ),
    },
    sunset: {
        darkMode: true,
        look: "handDrawn",
        themeVariables: palette(
            "#28122B",
            "#FFF4E6",
            "#7B2D4B",
            "#FFFFFF",
            "#C44536",
            "#F6AE2D",
            "#FF8C42"
        ),
    },
    terminal: {
        darkMode: true,
        look: "classic",
        themeVariables: palette(
            "#071A0D",
            "#C7FFD8",
            "#0C2B16",
            "#C7FFD8",
            "#123A20",
            "#194D2B",
            "#39FF88"
        ),
    },
});

/** Absolute path to the bundled JSON default. */
export const mermaidConfigPath: string = fileURLToPath(
    new URL("../mermaid.config.json", import.meta.url)
);

const isRecord = (value: unknown): value is UnknownRecord =>
    typeof value === "object" && value !== null && !Array.isArray(value);

const isMermaidThemeName = (value: unknown): value is MermaidThemeName =>
    typeof value === "string" && arrayIncludes(mermaidThemeNames, value);

const assertMermaidThemeName: (
    value: unknown
) => asserts value is MermaidThemeName = (value) => {
    if (!isMermaidThemeName(value)) {
        throw new RangeError("Unknown Mermaid theme.");
    }
};

const cloneRecord = (value: Readonly<UnknownRecord>): UnknownRecord =>
    structuredClone(value);

const unsafeMergeKeys: readonly string[] = Object.freeze([
    "__proto__",
    "constructor",
    "prototype",
]);

const mergeRecords = (
    base: Readonly<UnknownRecord>,
    overrides: Readonly<UnknownRecord>
): UnknownRecord => {
    const merged = cloneRecord(base);

    for (const [key, value] of objectEntries(overrides)) {
        if (arrayIncludes(unsafeMergeKeys, key)) {
            throw new TypeError(`Unsafe Mermaid override key: ${key}.`);
        }

        const existing = merged[key];
        merged[key] =
            isRecord(existing) && isRecord(value)
                ? mergeRecords(existing, value)
                : value;
    }

    return merged;
};

/**
 * Validate unknown input as a Mermaid configuration object.
 *
 * @throws When the value is not an object or weakens required theme/security
 *   policy.
 */
export function parseMermaidConfig(value: unknown): MermaidConfig {
    if (!isRecord(value)) {
        throw new TypeError(
            "Expected the Mermaid configuration to be an object."
        );
    }

    if (value["securityLevel"] !== "strict") {
        throw new TypeError(
            "Shared Mermaid configs must keep securityLevel=strict."
        );
    }

    if (value["theme"] !== "base") {
        throw new TypeError("Custom Mermaid themes must use the base theme.");
    }

    return safeCastTo<MermaidConfig>(cloneRecord(value));
}

const bundledConfigRecord: UnknownRecord = cloneRecord(bundledConfigJson);

/**
 * Create a fresh Mermaid configuration for one bundled theme.
 *
 * @throws When the theme is unknown or an override contains a
 *   prototype-pollution key.
 */
export function createMermaidConfig(
    themeName: MermaidThemeName = "noir-hand-drawn",
    overrides: Readonly<Partial<MermaidConfig>> = {}
): MermaidConfig {
    const candidate: unknown = themeName;
    assertMermaidThemeName(candidate);

    const definition = mermaidThemes[candidate];
    const themeOverrides = mergeRecords(
        {
            darkMode: definition.darkMode,
            look: definition.look,
            theme: "base",
            themeVariables: definition.themeVariables,
        },
        safeCastTo<Readonly<UnknownRecord>>(overrides)
    );
    const merged = mergeRecords(bundledConfigRecord, themeOverrides);

    return parseMermaidConfig(merged);
}

/**
 * Return the absolute path to a fully materialized preset JSON file.
 *
 * @throws When the theme name is unknown.
 */
export function getMermaidPresetPath(themeName: MermaidThemeName): string {
    const candidate: unknown = themeName;
    assertMermaidThemeName(candidate);

    return fileURLToPath(
        new URL(`../presets/${candidate}.json`, import.meta.url)
    );
}

/**
 * Load a fully materialized preset JSON file.
 *
 * @throws When the theme name is unknown or its package asset is invalid.
 */
export async function loadMermaidPreset(
    themeName: MermaidThemeName = "noir-hand-drawn"
): Promise<MermaidConfig> {
    const presetPath = getMermaidPresetPath(themeName);
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- path comes from the closed, package-owned theme registry
    const contents = await readFile(presetPath, "utf8");

    return parseMermaidConfig(JSON.parse(contents) as unknown);
}

/** Source-derived, secure, hand-drawn default configuration. */
const defaultMermaidConfig: MermaidConfig = createMermaidConfig();

export default defaultMermaidConfig;
