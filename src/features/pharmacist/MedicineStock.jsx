import FeatureLayout from "../shared/FeatureLayout";
import RecordBoard from "../shared/RecordBoard";
import { Notice } from "../shared/ui";
import { daysFromToday } from "../shared/storage";
import { money } from "../shared/data";

export const stockFlags = (r) => {
    const qty = Number(r.qty || 0), level = Number(r.reorderLevel || 0);
    const d = daysFromToday(r.expiry);
    return {
        expired: d !== null && d < 0,
        expiring: d !== null && d >= 0 && d <= 60,
        out: qty <= 0,
        low: qty > 0 && qty <= level
    };
};

const adjust = (r, update, sign) => {
    const input = window.prompt(sign > 0 ? `Add stock for ${r.medicine} — quantity received:` : `Remove stock for ${r.medicine} — quantity to remove:`);
    const n = Number(input);
    if (!input || !Number.isFinite(n) || n <= 0) return;
    update({ qty: Math.max(0, Number(r.qty || 0) + sign * n) });
};

const MedicineStock = () => (
    <FeatureLayout title="Medicine Stock" subtitle="Inventory with batch and expiry tracking. Low, out-of-stock and expiring items are flagged.">
        <Notice>Stock is kept in this browser for now (shared by everyone using this computer). Dispensing from a bill does not reduce it automatically yet.</Notice>
        <RecordBoard
            storeKey="pharmacy-stock" shared csvName="medicine-stock"
            formTitle="medicine" title="Inventory" addLabel="Add medicine"
            fields={[
                { name: "medicine", label: "Medicine", required: true, wide: true },
                { name: "batch", label: "Batch no." },
                { name: "expiry", label: "Expiry date", type: "date", default: "", required: true },
                { name: "qty", label: "Quantity", type: "number", min: 0, default: 0 },
                { name: "reorderLevel", label: "Reorder at", type: "number", min: 0, default: 20 },
                { name: "price", label: "Price / unit (₹)", type: "number", min: 0, step: "0.01", default: 0 },
                { name: "supplier", label: "Supplier" }
            ]}
            columns={[
                { key: "medicine", label: "Medicine", render: (r) => <><b>{r.medicine}</b><br /><span className="fx-muted">Batch {r.batch || "—"}</span></>, csv: (r) => r.medicine },
                { key: "qty", label: "Qty", render: (r) => <b className="fx-mono">{r.qty}</b> },
                { key: "reorderLevel", label: "Reorder at" },
                { key: "expiry", label: "Expiry" },
                { key: "price", label: "Price", render: (r) => money(r.price) },
                { key: "supplier", label: "Supplier" }
            ]}
            rowBadge={(r) => {
                const f = stockFlags(r);
                return f.expired ? { tone: "bad", text: "EXPIRED" } : f.out ? { tone: "bad", text: "OUT" } : f.expiring ? { tone: "warn", text: "EXPIRES SOON" } : f.low ? { tone: "warn", text: "LOW" } : null;
            }}
            rowActions={(r, { update }) => (
                <>
                    <button className="fx-link" onClick={() => adjust(r, update, +1)}>+ Stock</button>
                    <button className="fx-link" onClick={() => adjust(r, update, -1)}>− Use</button>
                </>
            )}
            sort={(a, b) => a.medicine.localeCompare(b.medicine)}
            searchKeys={["medicine", "batch", "supplier"]}
            stats={(rows) => {
                const f = rows.map(stockFlags);
                return [
                    { label: "Items", value: rows.length },
                    { label: "Low / out", value: f.filter((x) => x.low || x.out).length, tone: "warn" },
                    { label: "Expiring ≤ 60 days", value: f.filter((x) => x.expiring).length, tone: "warn" },
                    { label: "Expired", value: f.filter((x) => x.expired).length, tone: "bad" },
                    { label: "Stock value", value: money(rows.reduce((s, r) => s + Number(r.qty || 0) * Number(r.price || 0), 0)) }
                ];
            }}
            emptyText="No medicines in stock list yet."
        />
    </FeatureLayout>
);

export default MedicineStock;
