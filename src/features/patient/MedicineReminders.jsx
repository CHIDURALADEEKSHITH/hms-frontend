import { useEffect, useRef, useState } from "react";
import FeatureLayout from "../shared/FeatureLayout";
import RecordBoard from "../shared/RecordBoard";
import { Notice } from "../shared/ui";
import { useStore, todayISO } from "../shared/storage";

const MedicineReminders = () => {
    const [rows] = useStore("med-reminders", []);
    const [due, setDue] = useState([]);
    const [perm, setPerm] = useState(typeof Notification === "undefined" ? "unsupported" : Notification.permission);
    const fired = useRef(new Set());

    /* check once a minute while this page is open */
    useEffect(() => {
        const check = () => {
            const now = new Date();
            const hhmm = now.toTimeString().slice(0, 5);
            const day = now.getDay();
            rows.forEach((r) => {
                if (r.status !== "ACTIVE" || r.time !== hhmm) return;
                if (r.days === "WEEKDAYS" && (day === 0 || day === 6)) return;
                const key = `${r.id}-${todayISO()}-${hhmm}`;
                if (fired.current.has(key)) return;
                fired.current.add(key);
                setDue((d) => [{ ...r, key }, ...d]);
                if (perm === "granted") new Notification("Time for your medicine", { body: `${r.medicine}${r.dose ? ` — ${r.dose}` : ""}` });
            });
        };
        check();
        const t = setInterval(check, 15000);
        return () => clearInterval(t);
    }, [rows, perm]);

    const ask = async () => { if (perm !== "unsupported") setPerm(await Notification.requestPermission()); };

    return (
        <FeatureLayout title="Medicine Reminders" subtitle="Set the times you take each medicine. Keep this page open to get a reminder when it is due.">
            {due.map((d) => (
                <Notice key={d.key} tone="good">
                    ⏰ <b>{d.medicine}</b>{d.dose && ` — ${d.dose}`} is due now.{" "}
                    <button className="fx-link" onClick={() => setDue((x) => x.filter((y) => y.key !== d.key))}>Dismiss</button>
                </Notice>
            ))}

            {perm === "default" && <Notice>Allow notifications to be alerted even when this tab is in the background. <button className="fx-link" onClick={ask}>Enable notifications</button></Notice>}
            {perm === "denied" && <Notice tone="warn">Notifications are blocked in your browser. Reminders will only appear on this page.</Notice>}
            <Notice>Reminders work only while the page is open in your browser. Always follow the doctor's prescription.</Notice>

            <RecordBoard
                storeKey="med-reminders" csvName="medicine-reminders"
                formTitle="reminder" title="My reminders" addLabel="Add reminder"
                fields={[
                    { name: "medicine", label: "Medicine", required: true },
                    { name: "dose", label: "Dose", placeholder: "1 tablet after food" },
                    { name: "time", label: "Time", type: "time", required: true },
                    { name: "days", label: "Repeat", type: "select", options: [{ value: "DAILY", label: "Every day" }, { value: "WEEKDAYS", label: "Weekdays only" }] },
                    { name: "notes", label: "Notes", wide: true }
                ]}
                columns={[
                    { key: "time", label: "Time", render: (r) => <b className="fx-mono">{r.time}</b> },
                    { key: "medicine", label: "Medicine", render: (r) => <><b>{r.medicine}</b><br /><span className="fx-muted">{r.dose}</span></>, csv: (r) => r.medicine },
                    { key: "days", label: "Repeat", render: (r) => (r.days === "WEEKDAYS" ? "Weekdays" : "Daily") },
                    { key: "notes", label: "Notes" }
                ]}
                statusKey="status"
                statuses={[{ value: "ACTIVE", label: "Active", tone: "good" }, { value: "PAUSED", label: "Paused", tone: "warn" }, { value: "FINISHED", label: "Course finished", tone: "" }]}
                sort={(a, b) => a.time.localeCompare(b.time)}
                searchKeys={["medicine", "dose", "notes"]}
                emptyText="No reminders yet."
            />
        </FeatureLayout>
    );
};

export default MedicineReminders;
