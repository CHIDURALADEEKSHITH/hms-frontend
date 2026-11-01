import FeatureLayout from "../shared/FeatureLayout";
import RecordBoard from "../shared/RecordBoard";
import { Notice } from "../shared/ui";

const ShiftHandover = () => (
    <FeatureLayout
        title="Shift Handover"
        subtitle="SBAR notes for every patient you hand over. Print the list at the end of the shift."
        actions={<button className="fx-btn primary" onClick={() => window.print()}>🖨 Print handover sheet</button>}
    >
        <Notice>S = Situation · B = Background · A = Assessment · R = Recommendation</Notice>
        <RecordBoard
            storeKey="nurse-handover" shared csvName="shift-handover"
            formTitle="handover note" title="Handover notes" addLabel="Add note"
            fields={[
                { name: "patient", label: "Patient", required: true },
                { name: "bed", label: "Ward / Bed" },
                { name: "shift", label: "Handing over to", type: "select", options: ["Morning", "Evening", "Night"] },
                { name: "priority", label: "Priority", type: "select", options: [{ value: "ROUTINE", label: "Routine" }, { value: "WATCH", label: "Watch closely" }, { value: "CRITICAL", label: "Critical" }] },
                { name: "s", label: "S — Situation", type: "textarea", wide: true, required: true },
                { name: "b", label: "B — Background", type: "textarea", wide: true },
                { name: "a", label: "A — Assessment", type: "textarea", wide: true },
                { name: "r", label: "R — Recommendation", type: "textarea", wide: true }
            ]}
            columns={[
                { key: "patient", label: "Patient", render: (r) => <><b>{r.patient}</b><br /><span className="fx-muted">{r.bed} → {r.shift}</span></>, csv: (r) => r.patient },
                { key: "s", label: "Situation" },
                { key: "b", label: "Background" },
                { key: "a", label: "Assessment" },
                { key: "r", label: "Recommendation" }
            ]}
            statusKey="status"
            statuses={[{ value: "PENDING", label: "To hand over", tone: "warn" }, { value: "ACK", label: "Acknowledged", tone: "good" }]}
            rowBadge={(r) => (r.priority === "CRITICAL" ? { tone: "bad", text: "CRITICAL" } : r.priority === "WATCH" ? { tone: "warn", text: "WATCH" } : null)}
            sort={(a, b) => ["CRITICAL", "WATCH", "ROUTINE"].indexOf(a.priority) - ["CRITICAL", "WATCH", "ROUTINE"].indexOf(b.priority)}
            searchKeys={["patient", "bed", "s", "a"]}
            stats={(rows) => [
                { label: "Notes", value: rows.length },
                { label: "Still to hand over", value: rows.filter((r) => r.status === "PENDING").length, tone: "warn" },
                { label: "Critical", value: rows.filter((r) => r.priority === "CRITICAL").length, tone: "bad" }
            ]}
            emptyText="No handover notes yet."
        />
    </FeatureLayout>
);

export default ShiftHandover;
