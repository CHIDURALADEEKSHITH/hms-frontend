import FeatureLayout from "../shared/FeatureLayout";
import RecordBoard from "../shared/RecordBoard";
import { Notice } from "../shared/ui";
import { daysFromToday } from "../shared/storage";
import { useApiList } from "../shared/useApi";
import { pick } from "../shared/data";

const YN = [{ value: "NO", label: "Not yet" }, { value: "YES", label: "Cleared" }];
const blocked = (r) => r.doctor !== "YES" || r.billing !== "YES" || r.pharmacy !== "YES";

const DischargePlanner = () => {
    const { data } = useApiList("/bed/admissions");
    const names = [...new Set(data[0].map((a) => pick(a, ["patient.fullName", "patientName"])).filter(Boolean))];

    return (
        <FeatureLayout title="Discharge Planner" subtitle="Plan tomorrow's discharges today so the bed is free when the next admission arrives.">
            <Notice>Tick off the three clearances. A discharge with a clearance outstanding is marked “Blocked”.</Notice>
            <RecordBoard
                storeKey="discharge-plan" shared csvName="discharge-plan"
                formTitle="discharge plan" title="Planned discharges" addLabel="Add to plan"
                fields={[
                    { name: "patient", label: "Patient", required: true, datalist: names },
                    { name: "bed", label: "Ward / Bed" },
                    { name: "expectedDate", label: "Expected date", type: "date", required: true },
                    { name: "transport", label: "Transport", type: "select", options: ["Own vehicle", "Hospital ambulance", "Private ambulance", "Not needed"] },
                    { name: "doctor", label: "Doctor's approval", type: "select", options: YN },
                    { name: "billing", label: "Billing", type: "select", options: YN },
                    { name: "pharmacy", label: "Pharmacy / meds", type: "select", options: YN },
                    { name: "notes", label: "Notes", wide: true }
                ]}
                columns={[
                    { key: "patient", label: "Patient", render: (r) => <><b>{r.patient}</b><br /><span className="fx-muted">{r.bed}</span></>, csv: (r) => r.patient },
                    { key: "expectedDate", label: "Expected" },
                    { key: "clear", label: "Clearances", render: (r) => (
                        <span>
                            <span className={`fx-badge ${r.doctor === "YES" ? "good" : "muted"}`}>Doctor</span>{" "}
                            <span className={`fx-badge ${r.billing === "YES" ? "good" : "muted"}`}>Billing</span>{" "}
                            <span className={`fx-badge ${r.pharmacy === "YES" ? "good" : "muted"}`}>Pharmacy</span>
                        </span>
                    ), csv: (r) => `doctor:${r.doctor} billing:${r.billing} pharmacy:${r.pharmacy}` },
                    { key: "transport", label: "Transport" },
                    { key: "notes", label: "Notes" }
                ]}
                statusKey="status"
                statuses={[
                    { value: "PLANNED", label: "Planned", tone: "info" },
                    { value: "READY", label: "Ready to leave", tone: "good" },
                    { value: "DISCHARGED", label: "Discharged", tone: "" },
                    { value: "POSTPONED", label: "Postponed", tone: "warn" }
                ]}
                rowBadge={(r) => {
                    if (["DISCHARGED", "POSTPONED"].includes(r.status)) return null;
                    const d = daysFromToday(r.expectedDate);
                    if (d < 0) return { tone: "bad", text: "Overdue" };
                    if (blocked(r)) return { tone: "warn", text: "Blocked" };
                    return d === 0 ? { tone: "good", text: "Today" } : null;
                }}
                sort={(a, b) => a.expectedDate.localeCompare(b.expectedDate)}
                searchKeys={["patient", "bed", "notes"]}
                stats={(rows) => {
                    const open = rows.filter((r) => ["PLANNED", "READY"].includes(r.status));
                    return [
                        { label: "Due today", value: open.filter((r) => daysFromToday(r.expectedDate) === 0).length, tone: "warn" },
                        { label: "Due tomorrow", value: open.filter((r) => daysFromToday(r.expectedDate) === 1).length },
                        { label: "Blocked", value: open.filter(blocked).length, tone: "bad" },
                        { label: "Discharged", value: rows.filter((r) => r.status === "DISCHARGED").length, tone: "good" }
                    ];
                }}
                emptyText="No discharges planned."
            />
        </FeatureLayout>
    );
};

export default DischargePlanner;
