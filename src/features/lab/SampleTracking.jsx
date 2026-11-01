import FeatureLayout from "../shared/FeatureLayout";
import RecordBoard from "../shared/RecordBoard";

const sid = () => `S-${new Date().toISOString().slice(2, 10).replaceAll("-", "")}-${Math.floor(1000 + Math.random() * 9000)}`;
const OPEN = ["COLLECTED", "RECEIVED", "PROCESSING"];
const hoursOld = (r) => (Date.now() - new Date(r.createdAt)) / 3600000;

const SampleTracking = () => (
    <FeatureLayout
        title="Sample Tracking"
        subtitle="Follow every sample from collection to report. Anything open for more than 6 hours is flagged."
        actions={<button className="fx-btn" onClick={() => window.print()}>🖨 Print list</button>}
    >
        <RecordBoard
            storeKey="lab-samples" shared csvName="lab-samples"
            formTitle="sample" title="Samples" addLabel="Register sample"
            fields={[
                { name: "sampleId", label: "Sample ID", default: sid, required: true },
                { name: "patient", label: "Patient", required: true },
                { name: "test", label: "Test(s)", required: true, wide: true },
                { name: "type", label: "Sample type", type: "select", options: ["Blood", "Urine", "Stool", "Swab", "Sputum", "Other"] },
                { name: "collector", label: "Collected by" },
                { name: "notes", label: "Remarks", wide: true }
            ]}
            columns={[
                { key: "sampleId", label: "Sample", render: (r) => <><b className="fx-mono">{r.sampleId}</b><br /><span className="fx-muted">{r.type}</span></>, csv: (r) => r.sampleId },
                { key: "patient", label: "Patient" },
                { key: "test", label: "Test(s)" },
                { key: "collector", label: "Collected by" },
                { key: "at", label: "Collected", render: (r) => new Date(r.createdAt).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }), csv: (r) => r.createdAt },
                { key: "notes", label: "Remarks" }
            ]}
            statusKey="status"
            statuses={[
                { value: "COLLECTED", label: "Collected", tone: "warn" },
                { value: "RECEIVED", label: "Received in lab", tone: "info" },
                { value: "PROCESSING", label: "Processing", tone: "info" },
                { value: "REPORTED", label: "Reported", tone: "good" },
                { value: "REJECTED", label: "Rejected / recollect", tone: "bad" }
            ]}
            rowBadge={(r) => (OPEN.includes(r.status) && hoursOld(r) > 6 ? { tone: "bad", text: "DELAYED" } : null)}
            searchKeys={["sampleId", "patient", "test"]}
            stats={(rows) => [
                { label: "Open samples", value: rows.filter((r) => OPEN.includes(r.status)).length, tone: "warn" },
                { label: "Delayed (>6 h)", value: rows.filter((r) => OPEN.includes(r.status) && hoursOld(r) > 6).length, tone: "bad" },
                { label: "Reported", value: rows.filter((r) => r.status === "REPORTED").length, tone: "good" },
                { label: "Rejected", value: rows.filter((r) => r.status === "REJECTED").length, tone: "bad" }
            ]}
            emptyText="No samples registered."
        />
    </FeatureLayout>
);

export default SampleTracking;
