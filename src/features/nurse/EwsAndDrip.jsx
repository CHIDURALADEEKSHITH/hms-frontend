import { useState } from "react";
import FeatureLayout from "../shared/FeatureLayout";
import { Card, Notice } from "../shared/ui";
import { Calc, ok } from "../shared/Calc";

/* NEWS2 (Royal College of Physicians) aggregate score, SpO2 scale 1. */
const band = (v, rules) => rules.find(([test]) => test(v))?.[1] ?? 0;

const RR = [[(v) => v <= 8, 3], [(v) => v <= 11, 1], [(v) => v <= 20, 0], [(v) => v <= 24, 2], [() => true, 3]];
const SPO2 = [[(v) => v <= 91, 3], [(v) => v <= 93, 2], [(v) => v <= 95, 1], [() => true, 0]];
const SBP = [[(v) => v <= 90, 3], [(v) => v <= 100, 2], [(v) => v <= 110, 1], [(v) => v <= 219, 0], [() => true, 3]];
const PULSE = [[(v) => v <= 40, 3], [(v) => v <= 50, 1], [(v) => v <= 90, 0], [(v) => v <= 110, 1], [(v) => v <= 130, 2], [() => true, 3]];
const TEMP = [[(v) => v <= 35.0, 3], [(v) => v <= 36.0, 1], [(v) => v <= 38.0, 0], [(v) => v <= 39.0, 1], [() => true, 2]];

const response = (total, anyThree) => {
    if (total >= 7) return { tone: "bad", text: "HIGH risk — emergency response; continuous monitoring and immediate senior review." };
    if (total >= 5) return { tone: "bad", text: "MEDIUM risk — urgent response; urgent clinician review, increase monitoring." };
    if (anyThree) return { tone: "warn", text: "LOW–MEDIUM — a single parameter scored 3: urgent ward-based review." };
    if (total >= 1) return { tone: "info", text: "LOW risk — ward-based response; assess and repeat observations every 4–6 hours." };
    return { tone: "good", text: "LOW risk — continue routine monitoring (at least every 12 hours)." };
};

const EwsAndDrip = () => {
    const [v, setV] = useState({ rr: "", spo2: "", o2: "no", sbp: "", pulse: "", avpu: "A", temp: "" });
    const set = (k) => (e) => setV({ ...v, [k]: e.target.value });

    const n = (x) => (x === "" ? NaN : Number(x));
    const complete = ok(n(v.rr), n(v.spo2), n(v.sbp), n(v.pulse), n(v.temp));
    let scores = null;
    if (complete) {
        scores = {
            "Respiratory rate": band(n(v.rr), RR),
            "SpO₂ (scale 1)": band(n(v.spo2), SPO2),
            "Supplemental O₂": v.o2 === "yes" ? 2 : 0,
            "Systolic BP": band(n(v.sbp), SBP),
            "Pulse": band(n(v.pulse), PULSE),
            "Consciousness": v.avpu === "A" ? 0 : 3,
            "Temperature": band(n(v.temp), TEMP)
        };
    }
    const total = scores ? Object.values(scores).reduce((a, b) => a + b, 0) : 0;
    const res = scores ? response(total, Object.values(scores).includes(3)) : null;

    return (
        <FeatureLayout title="EWS & Drip Calculator" subtitle="NEWS2 early-warning score and IV infusion rate.">
            <Notice tone="warn">Follow your hospital's escalation policy. This page only does the scoring arithmetic (NEWS2, SpO₂ scale 1).</Notice>

            <div className="fx-grid2">
                <Card title="NEWS2 early-warning score">
                    <div className="fx-fields">
                        <label className="fx-field"><span>Resp. rate (/min)</span><input type="number" value={v.rr} onChange={set("rr")} /></label>
                        <label className="fx-field"><span>SpO₂ (%)</span><input type="number" value={v.spo2} onChange={set("spo2")} /></label>
                        <label className="fx-field"><span>On oxygen?</span>
                            <select value={v.o2} onChange={set("o2")}><option value="no">Room air</option><option value="yes">Supplemental O₂</option></select>
                        </label>
                        <label className="fx-field"><span>Systolic BP (mmHg)</span><input type="number" value={v.sbp} onChange={set("sbp")} /></label>
                        <label className="fx-field"><span>Pulse (/min)</span><input type="number" value={v.pulse} onChange={set("pulse")} /></label>
                        <label className="fx-field"><span>Consciousness</span>
                            <select value={v.avpu} onChange={set("avpu")}>
                                <option value="A">Alert</option>
                                <option value="C">New confusion</option>
                                <option value="V">Responds to voice</option>
                                <option value="P">Responds to pain</option>
                                <option value="U">Unresponsive</option>
                            </select>
                        </label>
                        <label className="fx-field"><span>Temperature (°C)</span><input type="number" step="0.1" value={v.temp} onChange={set("temp")} /></label>
                    </div>

                    {scores ? (
                        <>
                            <div className="fx-result"><strong>NEWS2 = {total}</strong><span>{res.text}</span></div>
                            <div className="fx-table-wrap" style={{ marginTop: 12 }}>
                                <table className="fx-table">
                                    <tbody>
                                        {Object.entries(scores).map(([k, s]) => (
                                            <tr key={k}><td>{k}</td><td className="fx-right"><span className={`fx-badge ${s === 3 ? "bad" : s ? "warn" : "good"}`}>{s}</span></td></tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    ) : <div className="fx-result"><span>Fill in every observation to calculate the score.</span></div>}
                </Card>

                <Calc
                    title="IV drip rate"
                    fields={[
                        { name: "ml", label: "Volume (mL)" },
                        { name: "hr", label: "Over (hours)" },
                        { name: "df", label: "Drop factor (drops/mL)", options: [10, 15, 20, 60], default: 20 }
                    ]}
                    compute={({ ml, hr, df }) => {
                        if (!ok(ml, hr, df)) return null;
                        return { value: `${Math.round((ml * df) / (hr * 60))} drops/min`, note: `${Math.round((ml / hr) * 10) / 10} mL/hour` };
                    }}
                    disclaimer="Check the prescribed rate and use an infusion pump where the order requires one."
                />
            </div>
        </FeatureLayout>
    );
};

export default EwsAndDrip;
