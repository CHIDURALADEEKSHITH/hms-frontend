/* Download an array of objects as a CSV file.
   columns: [{ key, label, get?(row) }]                                          */
export const downloadCSV = (filename, rows, columns) => {
    const esc = (v) => {
        const s = v === null || v === undefined ? "" : String(v);
        return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const head = columns.map((c) => esc(c.label)).join(",");
    const body = rows.map((r) => columns.map((c) => esc(c.get ? c.get(r) : r[c.key])).join(","));
    const blob = new Blob(["\ufeff" + [head, ...body].join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
};
