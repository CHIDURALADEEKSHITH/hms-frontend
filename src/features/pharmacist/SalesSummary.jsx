import { useMemo, useState } from "react";
import FeatureLayout from "../shared/FeatureLayout";
import { Bars, Card, Columns, Donut, Notice, StatStrip } from "../shared/ui";
import { useApiList } from "../shared/useApi";
import { dayKey, money, rowDate, sumBy, titleCase, toItems, countBy } from "../shared/data";
import { downloadCSV } from "../shared/csv";

const SalesSummary = () => {
    const { data, loading, error, reload } = useApiList("/pharmacist/bills");
    const [days, setDays] = useState("14");
    const bills = data[0];

    const since = useMemo(() => {
        const d = new Date();
        d.setDate(d.getDate() - Number(days));
        return d.toISOString().slice(0, 10);
    }, [days]);

    const list = bills.filter((b) => !dayKey(rowDate(b)) || dayKey(rowDate(b)) >= since);
    const paid = list.filter((b) => b.paymentStatus === "PAID");
    const sum = (rows) => rows.reduce((s, b) => s + Number(b.totalAmount || 0), 0);

    const daily = useMemo(() => {
        const m = sumBy(paid, (b) => dayKey(rowDate(b)), (b) => b.totalAmount);
        return Object.keys(m).sort().slice(-14).map((k) => ({ label: k.slice(5), value: Math.round(m[k]) }));
    }, [paid]);

    const topMeds = toItems(sumBy(paid, (b) => b.medicineName, (b) => b.totalAmount)).slice(0, 7).map((i) => ({ ...i, value: Math.round(i.value) }));
    const dispatch = toItems(countBy(list, (b) => titleCase(b.dispensingStatus)));

    return (
        <FeatureLayout
            title="Sales Summary"
            subtitle="Pharmacy bills grouped by day, payment and medicine."
            actions={
                <>
                    <select className="fx-input" value={days} onChange={(e) => setDays(e.target.value)}>
                        <option value="1">Today</option><option value="7">Last 7 days</option><option value="14">Last 14 days</option><option value="30">Last 30 days</option><option value="365">Last year</option>
                    </select>
                    <button className="fx-btn" onClick={reload}>↻ Refresh</button>
                    <button className="fx-btn" disabled={!list.length} onClick={() => downloadCSV("pharmacy-sales", list, [
                        { key: "billNumber", label: "Bill", get: (b) => b.billNumber || b.id }, { key: "medicineName", label: "Medicine" },
                        { key: "quantity", label: "Qty" }, { key: "totalAmount", label: "Amount" }, { key: "paymentStatus", label: "Payment" }, { key: "dispensingStatus", label: "Dispensing" }])}>⬇ CSV</button>
                </>
            }
        >
            {error && <Notice tone="warn">{error}</Notice>}
            {loading ? <Notice>Loading bills…</Notice> : (
                <>
                    <StatStrip items={[
                        { label: "Bills", value: list.length },
                        { label: "Collected", value: money(sum(paid)), tone: "good" },
                        { label: "Unpaid", value: money(sum(list.filter((b) => b.paymentStatus !== "PAID"))), tone: "warn" },
                        { label: "Average bill", value: paid.length ? money(sum(paid) / paid.length) : "—" }
                    ]} />
                    <div className="fx-grid2">
                        <Card title="Daily collection (₹)">
                            <Columns items={daily} format={(v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v)} />
                            {!daily.length && <p className="fx-disclaimer">Bills carry no date, so a daily split is not possible.</p>}
                        </Card>
                        <Card title="Payment status">
                            <Donut items={[{ label: "Paid", value: paid.length }, { label: "Unpaid", value: list.length - paid.length }]} centre={list.length} />
                        </Card>
                        <Card title="Top medicines by revenue (₹)"><Bars items={topMeds} format={(v) => money(v)} /></Card>
                        <Card title="Dispensing status"><Bars items={dispatch} /></Card>
                    </div>
                </>
            )}
        </FeatureLayout>
    );
};

export default SalesSummary;
