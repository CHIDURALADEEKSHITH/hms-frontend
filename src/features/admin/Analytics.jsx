import { useMemo, useState } from "react";
import FeatureLayout from "../shared/FeatureLayout";
import { Bars, Card, Columns, Donut, Notice, StatStrip } from "../shared/ui";
import { useApiList } from "../shared/useApi";
import { countBy, dayKey, monthKey, monthLabel, money, pick, rowDate, sumBy, titleCase, toItems } from "../shared/data";

const RANGES = [["ALL", "All time"], ["30", "Last 30 days"], ["90", "Last 90 days"], ["365", "Last 12 months"]];

const Analytics = () => {
    const { data, loading, error, reload } = useApiList(["/admin/billing", "/admin/appointments", "/admin/patients", "/admin/staff"]);
    const [bills, appts, patients, staff] = data;
    const [range, setRange] = useState("ALL");

    const since = useMemo(() => {
        if (range === "ALL") return "";
        const d = new Date();
        d.setDate(d.getDate() - Number(range));
        return d.toISOString().slice(0, 10);
    }, [range]);

    const within = (rows) => rows.filter((r) => !since || !dayKey(rowDate(r)) || dayKey(rowDate(r)) >= since);

    const b = useMemo(() => within(bills), [bills, since]);   // eslint-disable-line react-hooks/exhaustive-deps
    const a = useMemo(() => within(appts), [appts, since]);   // eslint-disable-line react-hooks/exhaustive-deps

    const paid = b.filter((x) => x.paymentStatus === "PAID");
    const pending = b.filter((x) => x.paymentStatus !== "PAID");
    const sum = (rows) => rows.reduce((s, x) => s + Number(x.totalAmount || 0), 0);

    const revenueByMonth = useMemo(() => {
        const m = sumBy(paid, (x) => monthKey(rowDate(x)), (x) => x.totalAmount);
        return Object.keys(m).sort().slice(-8).map((k) => ({ label: monthLabel(k), value: Math.round(m[k]) }));
    }, [paid]);

    const apptStatus = toItems(countBy(a, (x) => titleCase(x.status)));
    const byDept = toItems(countBy(a, (x) => x.department || pick(x, ["doctor.specialization"])), 7);
    const byDoctor = toItems(countBy(a, (x) => pick(x, ["doctor.fullName", "doctor.name"])), 6);
    const staffRole = toItems(countBy(staff, (x) => titleCase(x.role)));
    const completed = a.filter((x) => x.status === "COMPLETED").length;
    const cancelled = a.filter((x) => ["CANCELLED", "NO_SHOW"].includes(x.status)).length;

    return (
        <FeatureLayout
            title="Hospital Analytics"
            subtitle="Calculated in your browser from the live billing, appointment, patient and staff lists."
            actions={
                <>
                    <select className="fx-input" value={range} onChange={(e) => setRange(e.target.value)}>
                        {RANGES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                    <button className="fx-btn" onClick={reload}>↻ Refresh</button>
                </>
            }
        >
            {error && <Notice tone="warn">{error}</Notice>}
            {loading ? <Notice>Loading data…</Notice> : (
                <>
                    <StatStrip items={[
                        { label: "Collected", value: money(sum(paid)), tone: "good" },
                        { label: "Outstanding", value: money(sum(pending)), tone: pending.length ? "warn" : "" },
                        { label: "Appointments", value: a.length },
                        { label: "Completion rate", value: a.length ? `${Math.round((completed / a.length) * 100)}%` : "—", hint: `${cancelled} cancelled / no-show` },
                        { label: "Patients", value: patients.length },
                        { label: "Staff", value: staff.length }
                    ]} />

                    <div className="fx-grid2">
                        <Card title="Collected revenue by month">
                            <Columns items={revenueByMonth} format={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : v)} />
                            {revenueByMonth.length === 0 && <p className="fx-disclaimer">Bills carry no date field, so a monthly split is not possible.</p>}
                        </Card>
                        <Card title="Appointments by status"><Donut items={apptStatus} centre={a.length} /></Card>
                        <Card title="Busiest departments"><Bars items={byDept} /></Card>
                        <Card title="Appointments per doctor"><Bars items={byDoctor} /></Card>
                        <Card title="Staff by role"><Bars items={staffRole} /></Card>
                        <Card title="Payment mix">
                            <Donut items={[{ label: "Paid", value: paid.length }, { label: "Not paid", value: pending.length }]} centre={b.length} />
                        </Card>
                    </div>
                </>
            )}
        </FeatureLayout>
    );
};

export default Analytics;
