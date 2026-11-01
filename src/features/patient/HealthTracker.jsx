import { useMemo, useState } from "react";
import FeatureLayout from "../shared/FeatureLayout";
import { Badge, Card, Empty, LineChart, Notice, StatStrip } from "../shared/ui";
import { uid, todayISO, useStore } from "../shared/storage";
import { downloadCSV } from "../shared/csv";

const METRICS = {
    weight: { label: "Weight", unit: " kg" },
    bp: { label: "Blood pressure", unit: " mmHg", two: true },
    sugarF: { label: "Sugar — fasting", unit: " mg/dL" },
    sugarP: { label: "Sugar — after meal", unit: " mg/dL" },
    pulse: { label: "Pulse", unit: " /min" },
    spo2: { label: "SpO₂", unit: " %" }
};

/* simple reference bands (AHA blood pressure, ADA fasting glucose) — information only */
const bpBand = (s, d) =>
    s >= 140 || d >= 90 ? { tone: "bad", text: "High (stage 2 range)" }
        : s >= 130 || d >= 80 ? { tone: "warn", text: "Raised (stage 1 range)" }
            : s >= 120 ? { tone: "info", text: "Slightly elevated" }
                : s < 90 || d < 60 ? { tone: "warn", text: "Low" }
                    : { tone: "good", text: "Normal range" };
const sugarFBand = (v) => (v >= 126 ? { tone: "bad", text: "High" } : v >= 100 ? { tone: "warn", text: "Above normal" } : v < 70 ? { tone: "warn", text: "Low" } : { tone: "good", text: "Normal range" });

const bandFor = (type, r) => {
    if (type === "bp") return bpBand(r.value, r.value2);
    if (type === "sugarF") return sugarFBand(r.value);
    if (type === "sugarP") return r.value >= 200 ? { tone: "bad", text: "High" } : r.value >= 140 ? { tone: "warn", text: "Above normal" } : { tone: "good", text: "Normal range" };
    if (type === "spo2") return r.value < 94 ? { tone: "bad", text: "Low" } : { tone: "good", text: "Normal range" };
    if (type === "pulse") return r.value < 60 || r.value > 100 ? { tone: "warn", text: "Outside 60–100" } : { tone: "good", text: "Normal range" };
    return null;
};

const HealthTracker = () => {
    const [log, setLog] = useStore("health-log", []);
    const [type, setType] = useState("weight");
    const [form, setForm] = useState({ date: todayISO(), value: "", value2: "", note: "" });
    const m = METRICS[type];

    const rows = useMemo(() => log.filter((r) => r.type === type).sort((a, b) => a.date.localeCompare(b.date)), [log, type]);
    const latest = rows[rows.length - 1];
    const avg = rows.length ? rows.reduce((s, r) => s + r.value, 0) / rows.length : null;

    const add = (e) => {
        e.preventDefault();
        const v = Number(form.value), v2 = Number(form.value2);
        if (!v || (m.two && !v2)) return;
        setLog((l) => [...l, { id: uid(), type, date: form.date, value: v, value2: m.two ? v2 : undefined, note: form.note }]);
        setForm({ ...form, value: "", value2: "", note: "" });
    };

    return (
        <FeatureLayout title="Health Tracker" subtitle="Keep your own readings in one place and watch the trend between visits."
            actions={<button className="fx-btn" disabled={!log.length} onClick={() => downloadCSV("my-health-log", log, [
                { key: "date", label: "Date" }, { key: "type", label: "Measure", get: (r) => METRICS[r.type].label },
                { key: "value", label: "Value" }, { key: "value2", label: "Diastolic" }, { key: "note", label: "Note" }])}>⬇ Export CSV</button>}>

            <Notice>Reference bands are general guidance, not a diagnosis. Share unusual readings with your doctor.</Notice>

            <div className="fx-chips">
                {Object.entries(METRICS).map(([k, v]) => (
                    <button key={k} className={type === k ? "on" : ""} onClick={() => setType(k)}>{v.label}<b>{log.filter((r) => r.type === k).length}</b></button>
                ))}
            </div>

            <StatStrip items={[
                { label: "Latest", value: latest ? (m.two ? `${latest.value}/${latest.value2}` : latest.value) : "—", hint: latest?.date },
                { label: "Average", value: avg !== null ? (Math.round(avg * 10) / 10) : "—" },
                { label: "Readings", value: rows.length }
            ]} />

            <div className="fx-split">
                <Card title={`Add ${m.label.toLowerCase()} reading`}>
                    <form className="fx-form" onSubmit={add}>
                        <label className="wide"><span>Date</span><input type="date" value={form.date} max={todayISO()} onChange={(e) => setForm({ ...form, date: e.target.value })} /></label>
                        <label><span>{m.two ? "Systolic" : `Value (${m.unit.trim()})`}</span><input type="number" step="any" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} required /></label>
                        {m.two && <label><span>Diastolic</span><input type="number" value={form.value2} onChange={(e) => setForm({ ...form, value2: e.target.value })} required /></label>}
                        <label className="wide"><span>Note</span><input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="after walk, before breakfast…" /></label>
                        <div className="fx-form-actions"><button className="fx-btn primary" type="submit">Save reading</button></div>
                    </form>
                </Card>

                <div>
                    <Card title={`${m.label} trend`}>
                        <LineChart points={rows.slice(-20).map((r) => ({ label: r.date, value: r.value }))} unit={m.two ? "" : m.unit.trim() === "kg" ? "kg" : ""} />
                        {m.two && rows.length > 1 && <p className="fx-disclaimer">Chart shows the systolic (upper) value.</p>}
                    </Card>

                    <Card title="History">
                        {rows.length === 0 ? <Empty>No readings yet.</Empty> : (
                            <div className="fx-table-wrap">
                                <table className="fx-table">
                                    <thead><tr><th>Date</th><th>Reading</th><th>Range</th><th>Note</th><th /></tr></thead>
                                    <tbody>
                                        {[...rows].reverse().map((r) => {
                                            const b = bandFor(type, r);
                                            return (
                                                <tr key={r.id}>
                                                    <td>{r.date}</td>
                                                    <td className="fx-mono"><b>{m.two ? `${r.value}/${r.value2}` : r.value}</b>{m.unit}</td>
                                                    <td>{b ? <Badge tone={b.tone}>{b.text}</Badge> : "—"}</td>
                                                    <td>{r.note}</td>
                                                    <td className="fx-right"><button className="fx-link danger" onClick={() => setLog((l) => l.filter((x) => x.id !== r.id))}>Delete</button></td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </FeatureLayout>
    );
};

export default HealthTracker;
