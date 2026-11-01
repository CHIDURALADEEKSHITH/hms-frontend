import { useCallback, useEffect, useRef, useState } from "react";

/* Small localStorage-backed state.
   shared=true  -> one copy for this browser (e.g. stock, queue)
   shared=false -> one copy per logged-in user (e.g. reminders)
   Every component using the same key stays in sync (same tab and other tabs). */

const EVENT = "thilak-store";

const read = (k, initial) => {
    try {
        const raw = localStorage.getItem(k);
        return raw ? JSON.parse(raw) : initial;
    } catch {
        return initial;
    }
};

export const storageKey = (key, shared) => {
    let id = "anon";
    if (!shared) {
        try { id = JSON.parse(localStorage.getItem("user") || "{}").userId || "anon"; } catch { /* ignore */ }
    }
    return `thilak:${shared ? "shared" : id}:${key}`;
};

export function useStore(key, initial, shared = false) {
    const full = storageKey(key, shared);
    const [value, setValue] = useState(() => read(full, initial));
    const ref = useRef(value);
    ref.current = value;

    const set = useCallback((next) => {
        const v = typeof next === "function" ? next(ref.current) : next;
        ref.current = v;
        try { localStorage.setItem(full, JSON.stringify(v)); } catch { /* quota */ }
        setValue(v);
        window.dispatchEvent(new CustomEvent(EVENT, { detail: full }));
    }, [full]);

    useEffect(() => {
        const sync = (e) => {
            const changed = e.type === "storage" ? e.key : e.detail;
            if (changed === full) {
                const v = read(full, initial);
                if (JSON.stringify(v) !== JSON.stringify(ref.current)) setValue(v);
            }
        };
        window.addEventListener("storage", sync);
        window.addEventListener(EVENT, sync);
        return () => {
            window.removeEventListener("storage", sync);
            window.removeEventListener(EVENT, sync);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [full]);

    return [value, set];
}

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
export const todayISO = () => new Date().toISOString().slice(0, 10);
export const nowTime = () => new Date().toTimeString().slice(0, 5);
export const daysFromToday = (iso) => {
    if (!iso) return null;
    const a = new Date(todayISO()), b = new Date(iso);
    return Math.round((b - a) / 86400000);
};
