import FeatureLayout from "../shared/FeatureLayout";
import RecordBoard from "../shared/RecordBoard";
import { todayISO } from "../shared/storage";

const t = (iso) => (iso ? new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—");

const VisitorLog = () => (
    <FeatureLayout title="Visitor Log" subtitle="Know who is inside the wards at any moment. Check visitors out when they leave.">
        <RecordBoard
            storeKey="visitor-log" shared csvName="visitor-log"
            formTitle="visitor" title="Visitors" addLabel="Check in"
            fields={[
                { name: "visitor", label: "Visitor name", required: true },
                { name: "phone", label: "Phone" },
                { name: "patient", label: "Visiting patient", required: true },
                { name: "ward", label: "Ward / Room" },
                { name: "relation", label: "Relation", type: "select", options: ["Family", "Friend", "Attender", "Official", "Other"] },
                { name: "pass", label: "Pass no.", placeholder: "V-014" }
            ]}
            columns={[
                { key: "visitor", label: "Visitor", render: (r) => <><b>{r.visitor}</b><br /><span className="fx-muted">{r.phone}</span></>, csv: (r) => r.visitor },
                { key: "patient", label: "Visiting", render: (r) => <>{r.patient}<br /><span className="fx-muted">{r.ward}</span></>, csv: (r) => r.patient },
                { key: "relation", label: "Relation" },
                { key: "pass", label: "Pass" },
                { key: "in", label: "In", render: (r) => t(r.createdAt), csv: (r) => r.createdAt },
                { key: "out", label: "Out", render: (r) => t(r.outAt), csv: (r) => r.outAt || "" }
            ]}
            statusKey="status"
            statuses={[{ value: "IN", label: "Inside", tone: "warn" }, { value: "OUT", label: "Left", tone: "good" }]}
            rowActions={(r, { update }) => r.status === "IN" && <button className="fx-link" onClick={() => update({ status: "OUT", outAt: new Date().toISOString() })}>Check out</button>}
            searchKeys={["visitor", "patient", "phone", "pass", "ward"]}
            stats={(rows) => {
                const today = rows.filter((r) => r.createdAt.startsWith(todayISO()));
                return [
                    { label: "Inside now", value: rows.filter((r) => r.status === "IN").length, tone: "warn" },
                    { label: "Visitors today", value: today.length },
                    { label: "Checked out today", value: today.filter((r) => r.status === "OUT").length, tone: "good" }
                ];
            }}
            emptyText="No visitors logged."
        />
    </FeatureLayout>
);

export default VisitorLog;
