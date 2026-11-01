import FeatureLayout from "../shared/FeatureLayout";
import RecordBoard from "../shared/RecordBoard";

const late = (r) => {
    if (r.status !== "PENDING") return false;
    const due = new Date(`${r.date}T${r.time || "00:00"}`);
    return due.getTime() < Date.now();
};

const NurseTasks = () => (
    <FeatureLayout title="Task & Medication Rounds" subtitle="A due-time checklist for the shift. Late tasks are flagged automatically.">
        <RecordBoard
            storeKey="nurse-tasks" csvName="nurse-tasks"
            formTitle="task" title="Today's work" addLabel="Add task"
            fields={[
                { name: "task", label: "Task", required: true, placeholder: "Inj. Ceftriaxone 1 g IV" },
                { name: "patient", label: "Patient / Bed" },
                { name: "type", label: "Type", type: "select", options: ["Medication", "Vitals", "Dressing", "Investigation", "Other"] },
                { name: "date", label: "Date", type: "date" },
                { name: "time", label: "Due time", type: "time" },
                { name: "notes", label: "Notes", wide: true }
            ]}
            columns={[
                { key: "time", label: "Due", render: (r) => <span className="fx-mono"><b>{r.time}</b><br /><span className="fx-muted">{r.date}</span></span>, csv: (r) => `${r.date} ${r.time}` },
                { key: "task", label: "Task", render: (r) => <><b>{r.task}</b><br /><span className="fx-muted">{r.notes}</span></>, csv: (r) => r.task },
                { key: "patient", label: "Patient / Bed" },
                { key: "type", label: "Type" }
            ]}
            statusKey="status"
            statuses={[{ value: "PENDING", label: "Pending", tone: "warn" }, { value: "DONE", label: "Done", tone: "good" }, { value: "SKIPPED", label: "Skipped", tone: "" }]}
            sort={(a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)}
            rowBadge={(r) => (late(r) ? { tone: "bad", text: "LATE" } : null)}
            rowActions={(r, { update }) => r.status === "PENDING" && <button className="fx-link" onClick={() => update({ status: "DONE" })}>✓ Done</button>}
            searchKeys={["task", "patient", "type"]}
            stats={(rows) => [
                { label: "Pending", value: rows.filter((r) => r.status === "PENDING").length, tone: "warn" },
                { label: "Late", value: rows.filter(late).length, tone: "bad" },
                { label: "Done", value: rows.filter((r) => r.status === "DONE").length, tone: "good" }
            ]}
            emptyText="No tasks scheduled."
        />
    </FeatureLayout>
);

export default NurseTasks;
