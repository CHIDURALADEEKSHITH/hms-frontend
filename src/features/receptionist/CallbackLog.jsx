import FeatureLayout from "../shared/FeatureLayout";
import RecordBoard from "../shared/RecordBoard";

const CallbackLog = () => (
    <FeatureLayout title="Enquiry & Callbacks" subtitle="Log every call and enquiry so a callback is never forgotten.">
        <RecordBoard
            storeKey="callback-log" shared csvName="enquiries"
            formTitle="enquiry" title="Enquiries" addLabel="Log enquiry"
            fields={[
                { name: "caller", label: "Caller name", required: true },
                { name: "phone", label: "Phone", required: true },
                { name: "kind", label: "Type", type: "select", options: ["Enquiry", "Callback request", "Appointment request", "Report enquiry", "Complaint"] },
                { name: "callbackOn", label: "Call back on", type: "date" },
                { name: "details", label: "Details", type: "textarea", wide: true }
            ]}
            columns={[
                { key: "caller", label: "Caller", render: (r) => <><b>{r.caller}</b><br /><a href={`tel:${r.phone}`}>{r.phone}</a></>, csv: (r) => r.caller },
                { key: "kind", label: "Type" },
                { key: "details", label: "Details" },
                { key: "callbackOn", label: "Call back" }
            ]}
            statusKey="status"
            statuses={[{ value: "OPEN", label: "Open", tone: "warn" }, { value: "CALLED", label: "Called back", tone: "info" }, { value: "CLOSED", label: "Closed", tone: "good" }]}
            rowBadge={(r) => (r.kind === "Complaint" && r.status !== "CLOSED" ? { tone: "bad", text: "COMPLAINT" } : null)}
            searchKeys={["caller", "phone", "details", "kind"]}
            stats={(rows) => [
                { label: "Open", value: rows.filter((r) => r.status === "OPEN").length, tone: "warn" },
                { label: "Callbacks due", value: rows.filter((r) => r.status === "OPEN" && r.callbackOn && r.callbackOn <= new Date().toISOString().slice(0, 10)).length, tone: "bad" },
                { label: "Closed", value: rows.filter((r) => r.status === "CLOSED").length, tone: "good" }
            ]}
            emptyText="No enquiries logged."
        />
    </FeatureLayout>
);

export default CallbackLog;
