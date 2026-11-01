import FeatureLayout from "../shared/FeatureLayout";
import RecordBoard from "../shared/RecordBoard";
import { Notice } from "../shared/ui";
import { ROLE_TITLE } from "../registry";

const audience = [{ value: "ALL", label: "Everyone" }, ...Object.entries(ROLE_TITLE).map(([value, label]) => ({ value, label }))];

const Announcements = () => (
    <FeatureLayout title="Announcements" subtitle="Notices appear on the Tools & Notices page of the chosen audience.">
        <Notice>Notices are stored in this browser for now. Connect them to a backend endpoint to share them across devices.</Notice>
        <RecordBoard
            storeKey="announcements" shared csvName="announcements"
            formTitle="notice" title="All notices" addLabel="Publish notice"
            fields={[
                { name: "title", label: "Title", required: true, wide: true },
                { name: "message", label: "Message", type: "textarea", rows: 4, wide: true, required: true },
                { name: "audience", label: "Audience", type: "select", options: audience },
                { name: "priority", label: "Priority", type: "select", options: [{ value: "NORMAL", label: "Normal" }, { value: "HIGH", label: "High" }], default: "NORMAL" },
                { name: "expires", label: "Show until", type: "date", default: "" }
            ]}
            columns={[
                { key: "title", label: "Notice", render: (r) => <><b>{r.title}</b><br /><span className="fx-muted">{r.message}</span></> , csv: (r) => r.title },
                { key: "audience", label: "For", render: (r) => (r.audience === "ALL" ? "Everyone" : ROLE_TITLE[r.audience]) },
                { key: "priority", label: "Priority" },
                { key: "expires", label: "Until" }
            ]}
            statusKey="status"
            statuses={[{ value: "ACTIVE", label: "Active", tone: "good" }, { value: "ARCHIVED", label: "Archived", tone: "" }]}
            searchKeys={["title", "message"]}
            rowBadge={(r) => (r.priority === "HIGH" ? { tone: "bad", text: "HIGH" } : null)}
            emptyText="No notices published."
        />
    </FeatureLayout>
);

export default Announcements;
