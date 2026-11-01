import FeatureLayout from "../shared/FeatureLayout";
import RecordBoard from "../shared/RecordBoard";
import { Notice } from "../shared/ui";

const copy = async (r) => {
    const text = `${r.name}${r.diagnosis ? ` — ${r.diagnosis}` : ""}\n\n${r.medicines}${r.advice ? `\n\nAdvice: ${r.advice}` : ""}`;
    try { await navigator.clipboard.writeText(text); window.alert("Template copied. Paste it into the prescription."); }
    catch { window.prompt("Copy this template:", text); }
};

const PrescriptionTemplates = () => (
    <FeatureLayout title="Prescription Templates" subtitle="Write a common prescription once; copy it into any new prescription.">
        <Notice>Templates are saved on this device under your login. Write one medicine per line, e.g. “Tab Paracetamol 500 mg — 1-0-1 — 3 days”.</Notice>
        <RecordBoard
            storeKey="rx-templates" csvName="prescription-templates"
            formTitle="template" title="My templates" addLabel="Save template"
            fields={[
                { name: "name", label: "Template name", required: true, placeholder: "Viral fever – adult" },
                { name: "diagnosis", label: "Diagnosis" },
                { name: "medicines", label: "Medicines (one per line)", type: "textarea", rows: 6, wide: true, required: true },
                { name: "advice", label: "Advice / instructions", type: "textarea", rows: 3, wide: true }
            ]}
            columns={[
                { key: "name", label: "Template", render: (r) => <><b>{r.name}</b><br /><span className="fx-muted">{r.diagnosis}</span></>, csv: (r) => r.name },
                { key: "medicines", label: "Medicines", render: (r) => <span style={{ whiteSpace: "pre-wrap" }}>{r.medicines}</span> },
                { key: "advice", label: "Advice" }
            ]}
            searchKeys={["name", "diagnosis", "medicines"]}
            rowActions={(r) => <button className="fx-link" onClick={() => copy(r)}>Copy</button>}
            emptyText="No templates yet — save your first one."
        />
    </FeatureLayout>
);

export default PrescriptionTemplates;
