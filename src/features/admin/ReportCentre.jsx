import { useMemo, useState } from "react";
import FeatureLayout from "../shared/FeatureLayout";
import { Card, Empty, Notice } from "../shared/ui";
import { useApiList } from "../shared/useApi";
import { downloadCSV } from "../shared/csv";
import { inRange, pick, titleCase } from "../shared/data";

const DATASETS = {
    patients: {
        label: "Patients", path: "/admin/patients",
        cols: [
            { key: "id", label: "ID", get: (r) => r.id },
            { key: "uhid", label: "UHID", get: (r) => r.uhid },
            { key: "name", label: "Name", get: (r) => pick(r, ["fullName", "name"]) },
            { key: "gender", label: "Gender", get: (r) => r.gender },
            { key: "mobile", label: "Mobile", get: (r) => pick(r, ["mobile", "phone"]) },
            { key: "email", label: "Email", get: (r) => r.email },
            { key: "blood", label: "Blood group", get: (r) => r.bloodGroup }
        ]
    },
    staff: {
        label: "Staff", path: "/admin/staff",
        cols: [
            { key: "id", label: "ID", get: (r) => r.id },
            { key: "name", label: "Name", get: (r) => pick(r, ["fullName", "name"]) },
            { key: "role", label: "Role", get: (r) => titleCase(r.role) },
            { key: "email", label: "Email", get: (r) => r.email },
            { key: "mobile", label: "Mobile", get: (r) => pick(r, ["mobile", "phone"]) },
            { key: "status", label: "Status", get: (r) => pick(r, ["status", "accountStatus"]) }
        ]
    },
    appointments: {
        label: "Appointments", path: "/admin/appointments",
        cols: [
            { key: "id", label: "ID", get: (r) => r.id },
            { key: "date", label: "Date", get: (r) => r.appointmentDate },
            { key: "time", label: "Time", get: (r) => r.appointmentTime },
            { key: "patient", label: "Patient", get: (r) => pick(r, ["patient.fullName"]) },
            { key: "doctor", label: "Doctor", get: (r) => pick(r, ["doctor.fullName"]) },
            { key: "dept", label: "Department", get: (r) => r.department },
            { key: "status", label: "Status", get: (r) => titleCase(r.status) }
        ]
    },
    billing: {
        label: "Bills", path: "/admin/billing",
        cols: [
            { key: "no", label: "Bill no.", get: (r) => pick(r, ["billNumber", "id"]) },
            { key: "patient", label: "Patient", get: (r) => pick(r, ["patient.fullName", "patient.uhid"]) },
            { key: "amount", label: "Amount", get: (r) => r.totalAmount },
            { key: "status", label: "Payment", get: (r) => titleCase(r.paymentStatus) }
        ]
    }
};

const ReportCentre = () => {
    const [dataset, setDataset] = useState("patients");
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [needle, setNeedle] = useState("");
    const cfg = DATASETS[dataset];
    const { data, loading, error } = useApiList([cfg.path]);

    const rows = useMemo(() => {
        const q = needle.trim().toLowerCase();
        return data[0].filter((r) => inRange(r, from, to)).filter((r) =>
            !q || cfg.cols.some((c) => String(c.get(r) ?? "").toLowerCase().includes(q)));
    }, [data, from, to, needle, cfg]);

    return (
        <FeatureLayout title="Report Centre" subtitle="Pick a dataset, narrow it down, then download it as a spreadsheet-ready CSV.">
            <Card title="Build a report">
                <div className="fx-fields">
                    <label className="fx-field"><span>Dataset</span>
                        <select value={dataset} onChange={(e) => setDataset(e.target.value)}>
                            {Object.entries(DATASETS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                        </select>
                    </label>
                    <label className="fx-field"><span>From date</span><input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></label>
                    <label className="fx-field"><span>To date</span><input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></label>
                    <label className="fx-field"><span>Contains text</span><input value={needle} onChange={(e) => setNeedle(e.target.value)} placeholder="name, status…" /></label>
                </div>
                <div className="fx-actions">
                    <button className="fx-btn primary" disabled={!rows.length}
                        onClick={() => downloadCSV(`thilak-${dataset}-${new Date().toISOString().slice(0, 10)}`, rows, cfg.cols)}>
                        ⬇ Download {rows.length} row{rows.length === 1 ? "" : "s"} as CSV
                    </button>
                    <button className="fx-btn" onClick={() => window.print()}>🖨 Print preview</button>
                </div>
                <p className="fx-disclaimer">Date filters only apply to rows that carry a date; rows without one are always included.</p>
            </Card>

            {error && <Notice tone="warn">{error}</Notice>}

            <Card title={`Preview — ${cfg.label}`}>
                {loading ? <Empty>Loading…</Empty> : rows.length === 0 ? <Empty>No rows match.</Empty> : (
                    <div className="fx-table-wrap">
                        <table className="fx-table">
                            <thead><tr>{cfg.cols.map((c) => <th key={c.key}>{c.label}</th>)}</tr></thead>
                            <tbody>
                                {rows.slice(0, 25).map((r, i) => (
                                    <tr key={i}>{cfg.cols.map((c) => <td key={c.key}>{c.get(r) ?? "—"}</td>)}</tr>
                                ))}
                            </tbody>
                        </table>
                        {rows.length > 25 && <p className="fx-disclaimer">Showing the first 25 of {rows.length}. The download contains everything.</p>}
                    </div>
                )}
            </Card>
        </FeatureLayout>
    );
};

export default ReportCentre;
