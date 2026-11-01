import FeatureLayout from "../shared/FeatureLayout";
import { Notice } from "../shared/ui";
import { Calc, ok } from "../shared/Calc";

const r1 = (n) => Math.round(n * 10) / 10;
const r2 = (n) => Math.round(n * 100) / 100;

const bmiBand = (b) => (b < 18.5 ? "Underweight" : b < 25 ? "Normal range" : b < 30 ? "Overweight" : "Obese range");

const ClinicalCalculators = () => (
    <FeatureLayout title="Clinical Calculators" subtitle="Quick bedside arithmetic. Always confirm against your own judgement and hospital protocol.">
        <Notice tone="warn">Decision-support only. These tools do the arithmetic; they do not replace clinical assessment or the drug formulary.</Notice>

        <div className="fx-grid2">
            <Calc
                title="Body Mass Index"
                fields={[{ name: "kg", label: "Weight (kg)" }, { name: "cm", label: "Height (cm)" }]}
                compute={({ kg, cm }) => {
                    if (!ok(kg, cm)) return null;
                    const b = kg / ((cm / 100) ** 2);
                    return { value: `${r1(b)} kg/m²`, note: `${bmiBand(b)} (general adult bands; Asian cut-offs are lower)` };
                }}
            />

            <Calc
                title="Body Surface Area (Mosteller)"
                fields={[{ name: "kg", label: "Weight (kg)" }, { name: "cm", label: "Height (cm)" }]}
                compute={({ kg, cm }) => (ok(kg, cm) ? { value: `${r2(Math.sqrt((kg * cm) / 3600))} m²`, note: "√(height × weight ÷ 3600)" } : null)}
            />

            <Calc
                title="Mean Arterial Pressure"
                fields={[{ name: "sys", label: "Systolic (mmHg)" }, { name: "dia", label: "Diastolic (mmHg)" }]}
                compute={({ sys, dia }) => {
                    if (!ok(sys, dia)) return null;
                    const map = (sys + 2 * dia) / 3;
                    return { value: `${Math.round(map)} mmHg`, note: map < 65 ? "Below 65 — check perfusion" : "Diastolic × 2 + systolic, ÷ 3" };
                }}
            />

            <Calc
                title="Creatinine Clearance (Cockcroft-Gault)"
                fields={[
                    { name: "age", label: "Age (years)" },
                    { name: "kg", label: "Weight (kg)" },
                    { name: "scr", label: "Serum creatinine (mg/dL)" },
                    { name: "sex", label: "Sex", options: [{ value: "M", label: "Male" }, { value: "F", label: "Female" }], default: "M" }
                ]}
                compute={({ age, kg, scr, raw }) => {
                    if (!ok(age, kg, scr)) return null;
                    const v = ((140 - age) * kg) / (72 * scr) * (raw.sex === "F" ? 0.85 : 1);
                    return { value: `${Math.max(0, Math.round(v))} mL/min`, note: "Estimate for dose adjustment; uses actual body weight as entered." };
                }}
            />

            <Calc
                title="Weight-based dose"
                fields={[
                    { name: "kg", label: "Weight (kg)" },
                    { name: "mgkg", label: "Dose (mg/kg/day)" },
                    { name: "div", label: "Divided into (doses/day)", default: 3 },
                    { name: "max", label: "Max single dose (mg, optional)" }
                ]}
                compute={({ kg, mgkg, div, max }) => {
                    if (!ok(kg, mgkg, div)) return null;
                    const day = kg * mgkg;
                    let single = day / div;
                    let note = `${r1(day)} mg/day in total`;
                    if (ok(max) && single > max) { single = max; note += ` — single dose capped at ${max} mg`; }
                    return { value: `${r1(single)} mg per dose`, note };
                }}
                disclaimer="Check the dose against the drug reference, the patient's age and organ function before prescribing."
            />

            <Calc
                title="Ideal Body Weight (Devine)"
                fields={[
                    { name: "cm", label: "Height (cm)" },
                    { name: "sex", label: "Sex", options: [{ value: "M", label: "Male" }, { value: "F", label: "Female" }], default: "M" }
                ]}
                compute={({ cm, raw }) => {
                    if (!ok(cm)) return null;
                    const inches = cm / 2.54;
                    if (inches < 60) return { value: "—", note: "Formula is defined for heights of 152 cm (5 ft) and above." };
                    const ibw = (raw.sex === "F" ? 45.5 : 50) + 2.3 * (inches - 60);
                    return { value: `${r1(ibw)} kg`, note: "Devine formula" };
                }}
            />
        </div>
    </FeatureLayout>
);

export default ClinicalCalculators;
