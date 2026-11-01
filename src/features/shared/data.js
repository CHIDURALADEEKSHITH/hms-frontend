/* Tiny helpers for working with backend rows whose exact field names vary. */

export const pick = (obj, keys) => {
    for (const k of keys) {
        const v = k.split(".").reduce((o, p) => (o == null ? o : o[p]), obj);
        if (v !== undefined && v !== null && v !== "") return v;
    }
    return undefined;
};

export const rowDate = (row) =>
    pick(row, ["createdAt", "billDate", "billedAt", "generatedAt", "date", "appointmentDate", "registeredAt", "testDate", "orderDate", "admissionDate"]);

export const dayKey = (d) => {
    if (!d) return "";
    const t = new Date(d);
    return Number.isNaN(t.getTime()) ? "" : t.toISOString().slice(0, 10);
};

export const monthKey = (d) => dayKey(d).slice(0, 7);

export const monthLabel = (key) => {
    if (!key) return "";
    const [y, m] = key.split("-");
    return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
};

export const countBy = (rows, fn) => {
    const out = {};
    rows.forEach((r) => {
        const k = fn(r);
        if (k === undefined || k === null || k === "") return;
        out[k] = (out[k] || 0) + 1;
    });
    return out;
};

export const sumBy = (rows, keyFn, valFn) => {
    const out = {};
    rows.forEach((r) => {
        const k = keyFn(r);
        if (!k) return;
        out[k] = (out[k] || 0) + Number(valFn(r) || 0);
    });
    return out;
};

export const toItems = (obj, limit) => {
    const items = Object.entries(obj).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
    return limit ? items.slice(0, limit) : items;
};

export const inRange = (row, from, to) => {
    if (!from && !to) return true;
    const k = dayKey(rowDate(row));
    if (!k) return true;
    if (from && k < from) return false;
    if (to && k > to) return false;
    return true;
};

export const money = (n) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(n) || 0);

export const titleCase = (s) =>
    String(s || "").replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
