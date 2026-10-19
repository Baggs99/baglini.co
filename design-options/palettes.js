// Shared palette set for the design options. Each palette maps to the same CSS variables.
const PALETTES = {
  sky: { name: "Sky Violet (current)", bg: "#d5e2ea", paper: "#f7fbff", ink: "#142028", muted: "#4f5f6b", accent: "#7a3cf0", accentHover: "#6a3ad6", onAccent: "#ffffff" },
  night: { name: "Night Signal", bg: "#0c0c12", paper: "#1a1a24", ink: "#f2f0fa", muted: "#aaa7c0", accent: "#8f5cff", accentHover: "#a47bff", onAccent: "#0c0c12" },
  ember: { name: "Ember Terracotta", bg: "#f0d9c8", paper: "#fff6f0", ink: "#2a1410", muted: "#6b4a3d", accent: "#c2410c", accentHover: "#9a330a", onAccent: "#ffffff" },
  lime: { name: "Acid Lime", bg: "#0f1f14", paper: "#15301e", ink: "#e9ffe0", muted: "#9fbf9a", accent: "#b6ff3b", accentHover: "#d2ff7a", onAccent: "#0f1f14" },
  teal: { name: "Harbor Teal", bg: "#cfe6e3", paper: "#f2fbfa", ink: "#0b2e33", muted: "#3d6266", accent: "#0f766e", accentHover: "#0b5d57", onAccent: "#ffffff" },
  riso: { name: "Riso Pink", bg: "#ffd6e0", paper: "#fff4f7", ink: "#1d1b2e", muted: "#5b4b63", accent: "#ff3d7f", accentHover: "#e0246a", onAccent: "#1d1b2e" },
  ultra: { name: "Ultramarine", bg: "#0f1b4d", paper: "#1f2f7a", ink: "#f4f1e8", muted: "#b9c3ea", accent: "#ffb020", accentHover: "#ffc454", onAccent: "#0f1b4d" }
};
// Contrast ratio between two hex colors (WCAG)
function contrast(a, b) {
  const lum = (hex) => {
    const n = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
    return 0.2126 * n[0] + 0.7152 * n[1] + 0.0722 * n[2];
  };
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}
function applyPalette(key) {
  const p = PALETTES[key];
  const r = document.documentElement.style;
  r.setProperty("--bg", p.bg); r.setProperty("--paper", p.paper); r.setProperty("--ink", p.ink);
  r.setProperty("--muted", p.muted); r.setProperty("--accent", p.accent); r.setProperty("--accent-hover", p.accentHover); r.setProperty("--on-accent", p.onAccent);
}
