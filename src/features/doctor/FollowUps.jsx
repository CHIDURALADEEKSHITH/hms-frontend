import FeatureLayout from "../shared/FeatureLayout";
import RecordBoard from "../shared/RecordBoard";
import { daysFromToday } from "../shared/storage";

const FollowUps = () => (
    <FeatureLayout title="Follow-up Reminders" subtitle="Patients you asked to come back — never lose track of a review date.">
        <RecordBoard
            storeKey="doctor-followups" csvName="follow-ups"
            formTitle="follow-up" title="Follow-ups" addLabel="Add follow-up"
            fields={[
                { name: "patient", label: "Patient name", required: true },
                { name: "patientId", label: "Patient ID / UHID" },
                { name: "phone", label: "Phone" },
                { name: "dueDate", label: "Review on", type: "date", required: true, default: () => { const d = new Date(); d.setDate(d.getDate() + 7); return d.toISOString().slice(0, 10); } },
                { name: "reason", label: "Reason / what to check", type: "textarea", wide: true }
            ]}
            columns={[
                { key: "patient", label: "Patient", render: (r) => <><b>{r.patient}</b><br /><span className="fx-muted">{[r.patientId, r.phone].filter(Boolean).join(" · ")}</span></>, csv: (r) => r.patient },
                { key: "dueDate", label: "Review on" },
                { key: "reason", label: "Reason" }
            ]}
            statusKey="status"
            statuses={[
                { value: "PENDING", label: "Pending", tone: "warn" },
                { value: "CONTACTED", label: "Contacted", tone: "info" },
                { value: "VISITED", label: "Visited", tone: "good" },
                { value: "MISSED", label: "Missed", tone: "bad" }
            ]}
            sort={(a, b) => a.dueDate.localeCompare(b.dueDate)}
            searchKeys={["patient", "patientId", "reason", "phone"]}
            rowBadge={(r) => {
                if (r.status !== "PENDING" && r.status !== "CONTACTED") return null;
                const d = daysFromToday(r.dueDate);
                if (d < 0) return { tone: "bad", text: `${-d}d overdue` };
                if (d === 0) return { tone: "warn", text: "Today" };
                if (d <= 2) return { tone: "info", text: `In ${d}d` };
                return null;
            }}
            stats={(rows) => {
                const open = rows.filter((r) => ["PENDING", "CONTACTED"].includes(r.status));
                return [
                    { label: "Open follow-ups", value: open.length },
                    { label: "Due today", value: open.filter((r) => daysFromToday(r.dueDate) === 0).length, tone: "warn" },
                    { label: "Overdue", value: open.filter((r) => daysFromToday(r.dueDate) < 0).length, tone: "bad" },
                    { label: "Completed", value: rows.filter((r) => r.status === "VISITED").length, tone: "good" }
                ];
            }}
            emptyText="No follow-ups recorded."
        />
    </FeatureLayout>
);

export default FollowUps;
