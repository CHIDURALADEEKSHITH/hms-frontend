import { useState } from "react";
import FeatureLayout from "../shared/FeatureLayout";
import { Card, Empty, StatStrip } from "../shared/ui";
import { uid, useStore, todayISO } from "../shared/storage";

const DEPTS = [
    { code: "OPD", label: "General OPD" },
    { code: "LAB", label: "Laboratory" },
    { code: "PHR", label: "Pharmacy" },
    { code: "BIL", label: "Billing" },
    { code: "EMR", label: "Emergency" }
];

const fresh = () => ({ date: todayISO(), counters: {}, tokens: [] });

const TokenQueue = () => {
    const [raw, setState] = useStore("queue", fresh(), true);
    const state = raw.date === todayISO() ? raw : fresh();           // new day → empty board
    const [name, setName] = useState("");
    const [dept, setDept] = useState("OPD");
    const [urgent, setUrgent] = useState(false);
    const [view, setView] = useState("ALL");

    const issue = (e) => {
        e.preventDefault();
        const n = (state.counters[dept] || 0) + 1;
        const token = { id: uid(), code: `${dept}-${String(n).padStart(3, "0")}`, dept, name: name.trim() || "Walk-in", urgent, status: "WAITING", at: new Date().toISOString() };
        setState({ ...state, counters: { ...state.counters, [dept]: n }, tokens: [...state.tokens, token] });
        setName(""); setUrgent(false);
    };

    const patch = (id, p) => setState({ ...state, tokens: state.tokens.map((t) => (t.id === id ? { ...t, ...p } : t)) });

    const callNext = (d) => {
        const waiting = state.tokens.filter((t) => t.dept === d && t.status === "WAITING")
            .sort((a, b) => Number(b.urgent) - Number(a.urgent) || a.at.localeCompare(b.at));
        if (!waiting.length) return;
        setState({
            ...state,
            tokens: state.tokens.map((t) => {
                if (t.dept === d && t.status === "SERVING") return { ...t, status: "DONE" };
                if (t.id === waiting[0].id) return { ...t, status: "SERVING", calledAt: new Date().toISOString() };
                return t;
            })
        });
    };

    const list = state.tokens.filter((t) => view === "ALL" || t.dept === view);
    const serving = state.tokens.filter((t) => t.status === "SERVING");
    const waiting = list.filter((t) => t.status === "WAITING").sort((a, b) => Number(b.urgent) - Number(a.urgent) || a.at.localeCompare(b.at));
    const finished = list.filter((t) => ["DONE", "SKIPPED"].includes(t.status)).slice(-6).reverse();
    const mins = (t) => Math.max(0, Math.round((Date.now() - new Date(t.at)) / 60000));

    return (
        <FeatureLayout
            title="Token Queue"
            subtitle="Issue tokens at the desk, call the next patient and keep a live board. Resets every day."
            actions={<button className="fx-btn" onClick={() => { if (window.confirm("Clear all of today's tokens?")) setState(fresh()); }}>Reset today</button>}
        >
            <StatStrip items={[
                { label: "Issued today", value: state.tokens.length },
                { label: "Waiting", value: state.tokens.filter((t) => t.status === "WAITING").length, tone: "warn" },
                { label: "Being served", value: serving.length, tone: "good" },
                { label: "Completed", value: state.tokens.filter((t) => t.status === "DONE").length }
            ]} />

            <div className="fx-board">
                <div>
                    <Card title="Issue a token">
                        <form className="fx-form" onSubmit={issue}>
                            <label className="wide"><span>Patient name (optional)</span><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Walk-in" /></label>
                            <label><span>Counter</span>
                                <select value={dept} onChange={(e) => setDept(e.target.value)}>{DEPTS.map((d) => <option key={d.code} value={d.code}>{d.label}</option>)}</select>
                            </label>
                            <label><span>Priority</span>
                                <select value={urgent ? "1" : "0"} onChange={(e) => setUrgent(e.target.value === "1")}>
                                    <option value="0">Normal</option><option value="1">Urgent / senior citizen</option>
                                </select>
                            </label>
                            <div className="fx-form-actions"><button className="fx-btn primary big" type="submit">🎫 Issue token</button></div>
                        </form>
                    </Card>

                    <Card title="Now serving">
                        {DEPTS.map((d) => {
                            const cur = serving.find((t) => t.dept === d.code);
                            const w = state.tokens.filter((t) => t.dept === d.code && t.status === "WAITING").length;
                            return (
                                <div key={d.code} className="fx-notice-item" style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                    <div style={{ flex: 1 }}>
                                        <h4>{d.label}</h4>
                                        <small>{cur ? <>Serving <b>{cur.code}</b> — {cur.name}</> : "No one being served"} · {w} waiting</small>
                                    </div>
                                    <button className="fx-btn primary" disabled={!w} onClick={() => callNext(d.code)}>Call next ▶</button>
                                </div>
                            );
                        })}
                    </Card>
                </div>

                <div>
                    <div className="fx-now">
                        <small>{serving.length > 1 ? "Now serving" : "Now serving"}</small>
                        {serving.length ? (
                            <>
                                <strong>{serving[serving.length - 1].code}</strong>
                                <span>{serving[serving.length - 1].name}</span>
                            </>
                        ) : <strong>—</strong>}
                    </div>

                    <Card title="Waiting list" action={
                        <select className="fx-input" style={{ width: "auto" }} value={view} onChange={(e) => setView(e.target.value)}>
                            <option value="ALL">All counters</option>
                            {DEPTS.map((d) => <option key={d.code} value={d.code}>{d.label}</option>)}
                        </select>
                    }>
                        {waiting.length === 0 ? <Empty>No one is waiting.</Empty> : (
                            <ul className="fx-token-list">
                                {waiting.map((t) => (
                                    <li key={t.id} style={t.urgent ? { borderLeftColor: "#b3261e" } : null}>
                                        <b>{t.code}</b>
                                        <div>{t.name}{t.urgent && <> <span className="fx-badge bad">URGENT</span></>}<small>Waiting {mins(t)} min</small></div>
                                        <button className="fx-link" onClick={() => patch(t.id, { status: "SKIPPED" })}>Skip</button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Card>

                    {finished.length > 0 && (
                        <Card title="Recently finished">
                            <ul className="fx-token-list">
                                {finished.map((t) => (
                                    <li key={t.id} style={{ borderLeftColor: "var(--t-line-strong)", opacity: .75 }}>
                                        <b>{t.code}</b><div>{t.name}<small>{t.status === "SKIPPED" ? "Skipped" : "Done"}</small></div>
                                        <button className="fx-link" onClick={() => patch(t.id, { status: "WAITING" })}>Re-queue</button>
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    )}
                </div>
            </div>
        </FeatureLayout>
    );
};

export default TokenQueue;
