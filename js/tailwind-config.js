/* ============================================================
   Portfolio — Tailwind Configuration
   (Extracted from index.html inline <script id="tailwind-config">)
   NOTE: Must load AFTER the Tailwind CDN script.
   ============================================================ */

/* Accent + theme tokens come from the :root block in index.html
   (single source of truth). */
const themeVar = (name, fallback) =>
  (getComputedStyle(document.documentElement).getPropertyValue(name) || "").trim() || fallback;

tailwind.config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        accent: themeVar("--accent", "#d9704f"),
        "accent-deep": themeVar("--accent-deep", "#9c4730"),
        page: themeVar("--bg", "#0e0e10"),
        card: themeVar("--surface", "#131315"),
        inset: themeVar("--surface-inset", "#0b0c10"),
        tint: themeVar("--surface-tint", "#13141a"),
        raised: themeVar("--surface-raised", "#15161c"),
        subtle: themeVar("--surface-subtle", "#1c1e26"),
        ink: themeVar("--text", "#e5e1e4"),
        bright: themeVar("--text-bright", "#ffffff"),
        soft: themeVar("--text-soft", "#e5e5e5"),
        "ink-2": themeVar("--text-2", "#cbc3d7"),
        mid: themeVar("--text-mid", "#d4d4d4"),
        "ink-3": themeVar("--text-3", "#a3a3a3"),
        faint: themeVar("--text-faint", "#737373"),
        line: themeVar("--line-color", "#ffffff"),
        background: themeVar("--bg", "#0e0e10"),
        "on-surface": themeVar("--text", "#e5e1e4"),
        "secondary-fixed-dim": "#4cd7f6",
        "on-tertiary-fixed": "#001a42",
        "on-secondary-container": "#00424e",
        "surface": "#131315",
        /* legacy M3 palette below (unused tokens kept for reference) */
        "primary-fixed": "#e9ddff",
        "on-tertiary-fixed-variant": "#004395",
        "tertiary-fixed": "#d8e2ff",
        "surface-container-highest": "#353437",
        "on-background": "#e5e1e4",
        "surface-container-low": "#1c1b1d",
        "error": "#ffb4ab",
        "inverse-surface": "#e5e1e4",
        "on-surface-variant": "#cbc3d7",
        "on-primary-fixed-variant": "#5516be",
        "surface-variant": "#353437",
        "surface-dim": "#131315",
        "on-primary": "#3c0091",
        "primary-fixed-dim": "#d0bcff",
        "inverse-on-surface": "#313032",
        "on-error": "#690005",
        "on-secondary": "#003640",
        "error-container": "#93000a",
        "surface-bright": "#39393b",
        "surface-container-lowest": "#0e0e10",
        "outline-variant": "#494454",
        "inverse-primary": "#6d3bd7",
        "on-tertiary": "#002e6a",
        "surface-container": "#201f22",
        "tertiary": "#adc6ff",
        "on-tertiary-container": "#00285d",
        "outline": "#958ea0",
        "secondary": "#4cd7f6",
        "on-primary-container": "#340080",
        "on-error-container": "#ffdad6",
        "surface-container-high": "#2a2a2c",
        "surface-tint": "#d0bcff",
        "primary": "#d0bcff",
        "on-primary-fixed": "#23005c",
        "tertiary-container": "#4d8eff",
        "on-secondary-fixed-variant": "#004e5c",
        "tertiary-fixed-dim": "#adc6ff",
        "primary-container": "#8b5cf6",
        "secondary-container": "#03b5d3",
        "on-secondary-fixed": "#001f26",
        "secondary-fixed": "#acedff"
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        sm: "0.375rem",
        md: "0.5rem",
        lg: "0.75rem",
        xl: "1rem",
        "2xl": "1.25rem",
        full: "9999px"
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "sans-serif"],
        headline: ["Plus Jakarta Sans", "sans-serif"],
        display: ["Plus Jakarta Sans", "sans-serif"],
        body: ["Plus Jakarta Sans", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
        hand: ["Caveat", "cursive"]
      },
      boxShadow: {
        'glow-violet': '0 0 25px -5px rgba(139, 92, 246, 0.25)',
        'glow-violet-lg': '0 0 35px -5px rgba(168, 85, 247, 0.35)',
        'card-dark': '0 4px 20px -2px rgba(0, 0, 0, 0.5)'
      }
    }
  }
};
