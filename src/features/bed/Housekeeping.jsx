import FeatureLayout from "../shared/FeatureLayout";
import RecordBoard from "../shared/RecordBoard";
import { useApiList } from "../shared/useApi";

const Housekeeping = () => {
    const { data } = useApiList("/bed/beds");
    const labels = [...new Set(data[0].map((b) => [b.wardName, b.bedNumber].filter(Boolean).join(" · ")).filter(Boolean))];
    const wards = [...new Set(data[0].map((b) => b.wardName).filter(Boolean))];

    return (
        <FeatureLayout title="Housekeeping" subtitle="Cleaning requests per bed. A discharged bed is not ready until it is marked Inspected.">
            <RecordBoard
                storeKey="housekeeping" shared csvName="housekeeping"
                formTitle="cleaning request" title="Cleaning board" addLabel="Add request"
                fields={[
                    { name: "bed", label: "Bed / Room", required: true, datalist: labels, placeholder: "Ward · Bed" },
                    { name: "ward", label: "Ward", datalist: wards },
                    { name: "job", label: "Job", type: "select", options: ["Discharge clean", "Routine clean", "Terminal / deep clean", "Linen change", "Spill / biohazard"] },
                    { name: "priority", label: "Priority", type: "select", options: [{ value: "NORMAL", label: "Normal" }, { value: "URGENT", label: "Urgent (admission waiting)" }] },
                    { name: "assignedTo", label: "Assigned to" },
                    { name: "notes", label: "Notes", wide: true }
                ]}
                columns={[
                    { key: "bed", label: "Bed", render: (r) => <><b>{r.bed}</b><br /><span className="fx-muted">{r.ward}</span></>, csv: (r) => r.bed },
                    { key: "job", label: "Job" },
                    { key: "assignedTo", label: "Assigned to" },
                    { key: "at", label: "Requested", render: (r) => new Date(r.createdAt).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }), csv: (r) => r.createdAt },
                    { key: "notes", label: "Notes" }
                ]}
                statusKey="status"
                statuses={[
                    { value: "PENDING", label: "Waiting", tone: "warn" },
                    { value: "CLEANING", label: "Cleaning", tone: "info" },
                    { value: "CLEANED", label: "Cleaned", tone: "info" },
                    { value: "INSPECTED", label: "Inspected — ready", tone: "good" }
                ]}
                rowBadge={(r) => (r.priority === "URGENT" && r.status !== "INSPECTED" ? { tone: "bad", text: "URGENT" } : null)}
                sort={(a, b) => (b.priority === "URGENT") - (a.priority === "URGENT") || b.createdAt.localeCompare(a.createdAt)}
                searchKeys={["bed", "ward", "job", "assignedTo"]}
                stats={(rows) => [
                    { label: "Waiting", value: rows.filter((r) => r.status === "PENDING").length, tone: "warn" },
                    { label: "In progress", value: rows.filter((r) => r.status === "CLEANING").length },
                    { label: "Ready beds", value: rows.filter((r) => r.status === "INSPECTED").length, tone: "good" },
                    { label: "Urgent open", value: rows.filter((r) => r.priority === "URGENT" && r.status !== "INSPECTED").length, tone: "bad" }
                ]}
                emptyText="No cleaning requests."
            />
        </FeatureLayout>
    );
};

export default Housekeeping;
