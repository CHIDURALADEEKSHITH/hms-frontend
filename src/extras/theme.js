/* Applies the saved colour theme before React renders (no flash). */
const KEY = "thilak-palette";

export const getPalette = () => {
    try { return localStorage.getItem(KEY) || "maroon"; } catch { return "maroon"; }
};

export const applyPalette = (id) => {
    document.documentElement.setAttribute("data-palette", id);
    try { localStorage.setItem(KEY, id); } catch { /* ignore */ }
};

export const initTheme = () => applyPalette(getPalette());
