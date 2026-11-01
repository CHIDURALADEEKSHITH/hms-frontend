import { useState } from "react";
import { Card } from "./ui";

/* One calculator card: inputs are described by `fields`, `compute(values)`
   returns { value, note } or null when inputs are incomplete.               */
export const Calc = ({ title, fields, compute, disclaimer }) => {
    const [vals, setVals] = useState(() => Object.fromEntries(fields.map((f) => [f.name, f.default ?? ""])));
    const num = Object.fromEntries(Object.entries(vals).map(([k, v]) => [k, v === "" ? NaN : Number(v)]));
    const result = compute({ ...num, raw: vals });
    return (
        <Card title={title}>
            <div className="fx-fields">
                {fields.map((f) => (
                    <label key={f.name} className="fx-field">
                        <span>{f.label}</span>
                        {f.options ? (
                            <select value={vals[f.name]} onChange={(e) => setVals({ ...vals, [f.name]: e.target.value })}>
                                {f.options.map((o) => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
                            </select>
                        ) : (
                            <input type="number" step="any" min="0" value={vals[f.name]} placeholder={f.placeholder}
                                onChange={(e) => setVals({ ...vals, [f.name]: e.target.value })} />
                        )}
                    </label>
                ))}
            </div>
            {result ? (
                <div className="fx-result"><strong>{result.value}</strong><span>{result.note}</span></div>
            ) : (
                <div className="fx-result"><span>Enter the values above to see the result.</span></div>
            )}
            {disclaimer && <p className="fx-disclaimer">{disclaimer}</p>}
        </Card>
    );
};

export const ok = (...n) => n.every((x) => Number.isFinite(x) && x > 0);
