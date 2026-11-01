import { useMemo, useState } from "react";
import { Badge, Card, Empty, StatStrip } from "./ui";
import { useStore, uid, todayISO, nowTime } from "./storage";
import { downloadCSV } from "./csv";

/* Config-driven "add / list / filter / update status / export" board.
   Used by most of the new pages so behaviour and look stay consistent.

   Props
     storeKey, shared     where the rows are kept (localStorage)
     fields               [{ name, label, type, options, required, placeholder, default, wide }]
     columns              [{ key, label, render?(row) }]
     statusKey, statuses  optional status workflow  [{ value, label, tone }]
     stats(rows)          optional [{ label, value, tone }] strip
     rowBadge(row)        optional { tone, text } shown next to the first column
     rowActions(row, api) optional extra buttons  api = { update, remove }
     searchKeys           field names searched by the search box
     sort(a, b)           optional ordering
     seed                 optional initial rows
     csvName              export file name                                          */

const defaultFor = (f) => {
    if (f.default !== undefined) return typeof f.default === "function" ? f.default() : f.default;
    if (f.type === "date") return todayISO();
    if (f.type === "time") return nowTime();
    if (f.type === "select") return f.options?.[0]?.value ?? f.options?.[0] ?? "";
    return "";
};

const optValue = (o) => (typeof o === "object" ? o.value : o);
const optLabel = (o) => (typeof o === "object" ? o.label : o);

const RecordBoard = ({
    storeKey, shared = false, title, formTitle, fields, columns,
    statusKey, statuses = [], stats, rowBadge, rowActions, searchKeys = [],
    sort, seed = [], csvName, addLabel = "Add", emptyText, canDelete = true
}) => {
    const [rows, setRows] = useStore(storeKey, seed, shared);
    const blank = () => Object.fromEntries(fields.map((f) => [f.name, defaultFor(f)]));
    const [form, setForm] = useState(blank);
    const [editing, setEditing] = useState(null);
    const [query, setQuery] = useState("");
    const [filter, setFilter] = useState("ALL");
    const [error, setError] = useState("");

    const statusOf = (v) => statuses.find((s) => s.value === v);

    const change = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

    const submit = (e) => {
        e.preventDefault();
        const missing = fields.find((f) => f.required && !String(form[f.name] ?? "").trim());
        if (missing) { setError(`${missing.label} is required.`); return; }
        setError("");
        if (editing) {
            setRows((rs) => rs.map((r) => (r.id === editing ? { ...r, ...form } : r)));
            setEditing(null);
        } else {
            const row = { id: uid(), createdAt: new Date().toISOString(), ...form };
            if (statusKey) row[statusKey] = statuses[0]?.value;
            setRows((rs) => [row, ...rs]);
        }
        setForm(blank());
    };

    const update = (id, patch) => setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    const remove = (id) => setRows((rs) => rs.filter((r) => r.id !== id));

    const startEdit = (row) => {
        setEditing(row.id);
        setForm(Object.fromEntries(fields.map((f) => [f.name, row[f.name] ?? defaultFor(f)])));
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const visible = useMemo(() => {
        const q = query.trim().toLowerCase();
        let list = rows.filter((r) => {
            if (statusKey && filter !== "ALL" && r[statusKey] !== filter) return false;
            if (!q) return true;
            return searchKeys.some((k) => String(r[k] ?? "").toLowerCase().includes(q));
        });
        if (sort) list = [...list].sort(sort);
        return list;
    }, [rows, query, filter, statusKey, searchKeys, sort]);

    const exportCSV = () => downloadCSV(csvName || storeKey, visible, [
        ...columns.map((c) => ({ key: c.key, label: c.label, get: c.csv })),
        ...(statusKey ? [{ key: statusKey, label: "Status" }] : [])
    ]);

    return (
        <>
            {stats && <StatStrip items={stats(rows)} />}

            <div className="fx-split">
                <Card title={editing ? `Edit ${formTitle || "entry"}` : formTitle || "New entry"} className="fx-form-card">
                    <form className="fx-form" onSubmit={submit}>
                        {fields.map((f) => (
                            <label key={f.name} className={f.wide ? "wide" : ""}>
                                <span>{f.label}{f.required && " *"}</span>
                                {f.type === "textarea" ? (
                                    <textarea name={f.name} rows={f.rows || 3} value={form[f.name]} onChange={change} placeholder={f.placeholder} />
                                ) : f.type === "select" ? (
                                    <select name={f.name} value={form[f.name]} onChange={change}>
                                        {f.options.map((o) => <option key={optValue(o)} value={optValue(o)}>{optLabel(o)}</option>)}
                                    </select>
                                ) : (
                                    <>
                                        <input
                                            name={f.name} type={f.type || "text"} value={form[f.name]} onChange={change}
                                            placeholder={f.placeholder} min={f.min} max={f.max} step={f.step}
                                            list={f.datalist ? `dl-${f.name}` : undefined}
                                        />
                                        {f.datalist && (
                                            <datalist id={`dl-${f.name}`}>
                                                {f.datalist.map((o) => <option key={o} value={o} />)}
                                            </datalist>
                                        )}
                                    </>
                                )}
                            </label>
                        ))}
                        {error && <p className="fx-error">{error}</p>}
                        <div className="fx-form-actions">
                            <button className="fx-btn primary" type="submit">{editing ? "Save changes" : addLabel}</button>
                            {editing && <button type="button" className="fx-btn" onClick={() => { setEditing(null); setForm(blank()); }}>Cancel</button>}
                        </div>
                    </form>
                </Card>

                <Card
                    title={title || "Entries"}
                    action={
                        <div className="fx-tools">
                            <input className="fx-search" placeholder="Search…" value={query} onChange={(e) => setQuery(e.target.value)} />
                            <button className="fx-btn" onClick={exportCSV} disabled={!visible.length}>⬇ CSV</button>
                        </div>
                    }
                >
                    {statusKey && (
                        <div className="fx-chips">
                            {["ALL", ...statuses.map((s) => s.value)].map((v) => (
                                <button key={v} className={filter === v ? "on" : ""} onClick={() => setFilter(v)}>
                                    {v === "ALL" ? "All" : statusOf(v)?.label}
                                    <b>{v === "ALL" ? rows.length : rows.filter((r) => r[statusKey] === v).length}</b>
                                </button>
                            ))}
                        </div>
                    )}

                    {visible.length === 0 ? (
                        <Empty>{emptyText || "No entries match."}</Empty>
                    ) : (
                        <div className="fx-table-wrap">
                            <table className="fx-table">
                                <thead>
                                    <tr>
                                        {columns.map((c) => <th key={c.key}>{c.label}</th>)}
                                        {statusKey && <th>Status</th>}
                                        <th className="fx-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {visible.map((r) => {
                                        const badge = rowBadge?.(r);
                                        return (
                                            <tr key={r.id}>
                                                {columns.map((c, i) => (
                                                    <td key={c.key}>
                                                        {c.render ? c.render(r) : r[c.key] || "—"}
                                                        {i === 0 && badge && <> <Badge tone={badge.tone}>{badge.text}</Badge></>}
                                                    </td>
                                                ))}
                                                {statusKey && (
                                                    <td>
                                                        <select
                                                            className={`fx-status ${statusOf(r[statusKey])?.tone || ""}`}
                                                            value={r[statusKey]}
                                                            onChange={(e) => update(r.id, { [statusKey]: e.target.value })}
                                                        >
                                                            {statuses.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                                                        </select>
                                                    </td>
                                                )}
                                                <td className="fx-right fx-row-actions">
                                                    {rowActions?.(r, { update: (p) => update(r.id, p), remove: () => remove(r.id) })}
                                                    <button className="fx-link" onClick={() => startEdit(r)}>Edit</button>
                                                    {canDelete && (
                                                        <button className="fx-link danger" onClick={() => window.confirm("Delete this entry?") && remove(r.id)}>Delete</button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>
            </div>
        </>
    );
};

export default RecordBoard;
